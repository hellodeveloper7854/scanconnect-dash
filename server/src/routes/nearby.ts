import { Router } from 'express';
import { z } from 'zod';
import { env } from '../lib/env.js';

/**
 * Nearby fuel stations / police / hospitals / puncture shops, for the website
 * and the mobile app. Both used to call the free public Overpass servers
 * straight from the device, which are routinely "at capacity" (HTTP 502), so
 * every nearby search timed out. They now call this endpoint instead:
 *
 *   1. Geoapify Places (when GEOAPIFY_API_KEY is set) — reliable and cached here.
 *   2. Overpass mirrors, from this server, as a fallback.
 *   3. The last good result for that area, marked stale, if both fail.
 *
 * Results are cached per ~1 km grid cell, so many users in one area cost one
 * upstream request, and the Geoapify free tier goes a long way.
 */
export const nearbyRouter = Router();

interface CategoryDef {
  label: string;
  geoapify: string[];
  overpass: string[];
}

const CATEGORIES: Record<string, CategoryDef> = {
  fuel: { label: 'Fuel station', geoapify: ['service.vehicle.fuel', 'commercial.gas'], overpass: ['amenity=fuel'] },
  police: { label: 'Police station', geoapify: ['service.police'], overpass: ['amenity=police'] },
  hospital: {
    label: 'Hospital / clinic',
    geoapify: ['healthcare.hospital', 'healthcare.clinic_or_praxis'],
    overpass: ['amenity=hospital', 'amenity=clinic'],
  },
  puncture: {
    label: 'Tyre / repair shop',
    geoapify: ['service.vehicle.repair'],
    overpass: ['shop=tyres', 'shop=car_repair'],
  },
};

interface Place {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distanceM: number;
  open24x7: boolean;
}

interface Result {
  places: Place[];
  radiusM: number;
  source: 'geoapify' | 'overpass';
  stale?: boolean;
}

const RADII = [2000, 5000];
const CACHE_TTL_MS = 15 * 60 * 1000;
const MAX_CACHE_ENTRIES = 2000;
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

const cache = new Map<string, { result: Result; at: number }>();

function remember(key: string, result: Result) {
  if (cache.size >= MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.delete(key);
  cache.set(key, { result, at: Date.now() });
}

function haversineM(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const rad = (d: number) => (d * Math.PI) / 180;
  const a =
    Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

async function fetchGeoapify(def: CategoryDef, lat: number, lon: number, radius: number): Promise<Place[]> {
  const url = new URL('/v2/places', env.geoapify.baseUrl);
  url.searchParams.set('categories', def.geoapify.join(','));
  url.searchParams.set('filter', `circle:${lon},${lat},${radius}`);
  url.searchParams.set('bias', `proximity:${lon},${lat}`);
  url.searchParams.set('limit', '20');
  url.searchParams.set('apiKey', env.geoapify.apiKey!);

  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`Geoapify HTTP ${res.status}`);
  const body = (await res.json()) as {
    features?: { properties?: Record<string, unknown> }[];
  };

  const places: Place[] = [];
  for (const f of body.features ?? []) {
    const p = f.properties ?? {};
    const pLat = Number(p.lat);
    const pLon = Number(p.lon);
    if (!Number.isFinite(pLat) || !Number.isFinite(pLon)) continue;
    const name = typeof p.name === 'string' && p.name.trim() ? p.name.trim() : def.label;
    places.push({
      id: String(p.place_id ?? `${pLat},${pLon}`),
      name,
      lat: pLat,
      lon: pLon,
      distanceM: typeof p.distance === 'number' ? p.distance : haversineM(lat, lon, pLat, pLon),
      open24x7: false,
    });
  }
  return places;
}

async function fetchOverpass(def: CategoryDef, lat: number, lon: number, radius: number): Promise<Place[]> {
  const clauses = def.overpass
    .map((f) => {
      const [k, v] = f.split('=');
      return `nwr[${k}=${v}](around:${radius},${lat},${lon});`;
    })
    .join('');
  const query = `[out:json][timeout:12];(${clauses});out center 20;`;

  let lastError: unknown = new Error('Overpass unavailable');
  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'ScanConnectServer' },
        body: new URLSearchParams({ data: query }),
        signal: AbortSignal.timeout(10000),
      });
      if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);
      const body = (await res.json()) as {
        elements?: { id: number; type: string; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }[];
      };
      const places: Place[] = [];
      for (const e of body.elements ?? []) {
        const pLat = e.lat ?? e.center?.lat;
        const pLon = e.lon ?? e.center?.lon;
        if (pLat == null || pLon == null) continue;
        places.push({
          id: `${e.type}/${e.id}`,
          name: e.tags?.name?.trim() || def.label,
          lat: pLat,
          lon: pLon,
          distanceM: haversineM(lat, lon, pLat, pLon),
          open24x7: e.tags?.opening_hours?.trim() === '24/7',
        });
      }
      return places;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError;
}

async function search(def: CategoryDef, lat: number, lon: number): Promise<Result> {
  const providers: { source: Result['source']; run: typeof fetchGeoapify }[] = [];
  if (env.geoapify.apiKey) providers.push({ source: 'geoapify', run: fetchGeoapify });
  providers.push({ source: 'overpass', run: fetchOverpass });

  let lastError: unknown;
  for (const { source, run } of providers) {
    try {
      let radiusM = RADII[0];
      let places: Place[] = [];
      for (const radius of RADII) {
        radiusM = radius;
        places = await run(def, lat, lon, radius);
        if (places.length > 0) break;
      }
      places.sort((a, b) => a.distanceM - b.distanceM);
      return { places, radiusM, source };
    } catch (err) {
      lastError = err;
      console.error(`Nearby (${source}) failed:`, err instanceof Error ? err.message : err);
    }
  }
  throw lastError;
}

// Small per-client limiter so the endpoint can't be used to drain the Geoapify quota.
const hits = new Map<string, { count: number; resetAt: number }>();
const LIMIT_PER_MINUTE = 60;

function rateLimited(clientKey: string): boolean {
  const now = Date.now();
  const entry = hits.get(clientKey);
  if (!entry || entry.resetAt < now) {
    hits.set(clientKey, { count: 1, resetAt: now + 60_000 });
    if (hits.size > 5000) for (const [k, v] of hits) if (v.resetAt < now) hits.delete(k);
    return false;
  }
  entry.count += 1;
  return entry.count > LIMIT_PER_MINUTE;
}

const querySchema = z.object({
  category: z.enum(Object.keys(CATEGORIES) as [string, ...string[]]),
  lat: z.coerce.number().min(-90).max(90),
  lon: z.coerce.number().min(-180).max(180),
});

nearbyRouter.get('/', async (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ error: 'category, lat and lon are required' });
  }
  const { category, lat, lon } = parsed.data;

  const forwarded = req.headers['x-forwarded-for'];
  const clientKey = (typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : req.ip) || 'unknown';
  if (rateLimited(clientKey)) {
    return res.status(429).json({ error: 'Too many searches. Please try again in a minute.' });
  }

  const def = CATEGORIES[category];
  // ~1 km grid cell, matching the apps' own cache granularity.
  const key = `${category}:${lat.toFixed(2)}:${lon.toFixed(2)}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) {
    return res.json(hit.result);
  }

  try {
    const result = await search(def, lat, lon);
    // Empty results are cached briefly by the freshness check above like any other,
    // but never replace a previous non-empty answer for the area.
    if (result.places.length > 0 || !hit) remember(key, result);
    return res.json(result);
  } catch {
    if (hit) return res.json({ ...hit.result, stale: true });
    return res.status(502).json({ error: 'Nearby places are temporarily unavailable. Please try again shortly.' });
  }
});
