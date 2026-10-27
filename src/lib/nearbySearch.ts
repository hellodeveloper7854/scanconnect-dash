// Nearby place search backed by OpenStreetMap's public Overpass API.

export interface NearbyCategory {
  /** OSM tag filters, each becomes its own nwr[...] clause. */
  filters: string[];
  /** Fallback label when a place has no name. */
  label: string;
  /** Google Maps search term used by the fallback link. */
  mapsQuery: string;
}

// Only categories we can really search via OSM.
export const NEARBY_CATEGORIES: Record<string, NearbyCategory> = {
  fuel: { filters: ['amenity=fuel'], label: 'Fuel station', mapsQuery: 'fuel+station' },
  police: { filters: ['amenity=police'], label: 'Police station', mapsQuery: 'police+station' },
  hospital: { filters: ['amenity=hospital', 'amenity=clinic'], label: 'Hospital / clinic', mapsQuery: 'hospital' },
  puncture: { filters: ['shop=tyres', 'shop=car_repair'], label: 'Tyre / repair shop', mapsQuery: 'tyre+puncture+repair' },
};

export interface NearbyPlace {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distanceKm: number;
  open24x7: boolean;
}

export interface NearbyResult {
  places: NearbyPlace[];
  radiusM: number;
  fetchedAt: number;
}

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];
const OVERALL_DEADLINE_MS = 25000;
const CACHE_TTL_MS = 5 * 60 * 1000;
const RADII = [2000, 5000];

const cache = new Map<string, NearbyResult>();

export const cacheKey = (cat: string, lat: number, lon: number) =>
  `${cat}:${lat.toFixed(2)},${lon.toFixed(2)}`;

export const getCached = (cat: string, lat: number, lon: number): NearbyResult | null => {
  const hit = cache.get(cacheKey(cat, lat, lon));
  return hit && Date.now() - hit.fetchedAt <= CACHE_TTL_MS ? hit : null;
};

export const mapsSearchUrl = (cat: string) =>
  `https://www.google.com/maps/search/${NEARBY_CATEGORIES[cat]?.mapsQuery ?? 'places'}+near+me`;

export const mapsPlaceUrl = (lat: number, lon: number) =>
  `https://www.google.com/maps/search/?api=1&query=${lat},${lon}`;

const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
};

const buildQuery = (cat: NearbyCategory, lat: number, lon: number, radius: number) => {
  const clauses = cat.filters.map((f) => {
    const [k, v] = f.split('=');
    return `nwr[${k}=${v}](around:${radius},${lat},${lon});`;
  });
  return `[out:json][timeout:12];(${clauses.join('')});out center 20;`;
};

/** Try each endpoint in turn, bounded by a single shared deadline. */
const runQuery = async (query: string, deadline: number, outer?: AbortSignal): Promise<any[]> => {
  let lastErr: unknown = new Error('Search failed');
  for (const url of ENDPOINTS) {
    const remaining = deadline - Date.now();
    if (remaining < 1500) break;
    if (outer?.aborted) throw new DOMException('Aborted', 'AbortError');
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), Math.min(remaining, 13000));
    const onOuter = () => ctrl.abort();
    outer?.addEventListener('abort', onOuter);
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'data=' + encodeURIComponent(query),
        signal: ctrl.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      return Array.isArray(json?.elements) ? json.elements : [];
    } catch (err) {
      if (outer?.aborted) throw err;
      lastErr = err;
    } finally {
      clearTimeout(timer);
      outer?.removeEventListener('abort', onOuter);
    }
  }
  throw lastErr;
};

export async function searchNearby(
  catId: string,
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<NearbyResult> {
  const cat = NEARBY_CATEGORIES[catId];
  if (!cat) throw new Error('This category cannot be searched.');
  const deadline = Date.now() + OVERALL_DEADLINE_MS;
  let radiusUsed = RADII[0];
  let places: NearbyPlace[] = [];

  for (const radius of RADII) {
    radiusUsed = radius;
    const elements = await runQuery(buildQuery(cat, lat, lon, radius), deadline, signal);
    places = elements
      .map((el): NearbyPlace | null => {
        const pLat = el.lat ?? el.center?.lat;
        const pLon = el.lon ?? el.center?.lon;
        if (typeof pLat !== 'number' || typeof pLon !== 'number') return null;
        const tags = el.tags || {};
        return {
          id: `${el.type}/${el.id}`,
          name: tags.name || tags['name:en'] || tags.brand || tags.operator || cat.label,
          lat: pLat,
          lon: pLon,
          distanceKm: haversineKm(lat, lon, pLat, pLon),
          open24x7: tags.opening_hours === '24/7',
        };
      })
      .filter((p): p is NearbyPlace => p !== null)
      .sort((a, b) => a.distanceKm - b.distanceKm);
    if (places.length > 0) break;
  }

  const result: NearbyResult = { places, radiusM: radiusUsed, fetchedAt: Date.now() };
  cache.set(cacheKey(catId, lat, lon), result);
  return result;
}

/** Last cached result regardless of age (used as "earlier results" after a failed refresh). */
export const getStale = (cat: string, lat: number, lon: number): NearbyResult | null =>
  cache.get(cacheKey(cat, lat, lon)) ?? null;

export const getBrowserLocation = (): Promise<{ lat: number; lon: number }> =>
  new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Location is not available in this browser.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      (e) =>
        reject(
          new Error(
            e.code === e.PERMISSION_DENIED
              ? 'Location permission was denied. Allow location access in your browser settings and try again.'
              : e.code === e.TIMEOUT
                ? 'Getting your location timed out. Please try again.'
                : 'Your location could not be determined. Please try again.',
          ),
        ),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  });
