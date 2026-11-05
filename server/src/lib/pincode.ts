/**
 * Indian pincode lookup (India Post public API: api.postalpincode.in) and a
 * forgiving city-vs-pincode matcher.
 *
 * Used to (a) auto-fill and sanity-check the delivery address, (b) stop an
 * order whose city and pincode clearly belong to different places (Bengaluru +
 * 110001), and (c) pick the delivery-time rule for a pincode. Lookups are cached
 * for a month (pincodes almost never move), and every function FAILS OPEN: if
 * India Post is slow or down, the address is accepted rather than blocking a
 * customer's order.
 */

export interface PincodeInfo {
  pincode: string;
  /** Best single place name to show/auto-fill (usually the district). */
  city: string;
  district: string;
  state: string;
  /** Every place name India Post lists for this pincode (post offices, blocks, districts). */
  names: string[];
}

const API = 'https://api.postalpincode.in/pincode';
const CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const MISS_TTL_MS = 10 * 60 * 1000;
const MAX_CACHE = 5000;

type CacheEntry = { at: number; value: PincodeInfo | 'invalid' };
const cache = new Map<string, CacheEntry>();

export const PINCODE_PATTERN = /^[1-9]\d{5}$/;

/**
 * Returns the pincode's details, `'invalid'` when India Post says the pincode
 * doesn't exist, or `null` when the lookup couldn't be completed (unknown —
 * callers must treat this as "don't block").
 */
export async function lookupPincode(pincode: string): Promise<PincodeInfo | 'invalid' | null> {
  if (!PINCODE_PATTERN.test(pincode)) return 'invalid';

  const hit = cache.get(pincode);
  if (hit && Date.now() - hit.at < (hit.value === 'invalid' ? MISS_TTL_MS : CACHE_TTL_MS)) return hit.value;

  try {
    const res = await fetch(`${API}/${pincode}`, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const body = (await res.json()) as {
      Status?: string;
      PostOffice?: { Name?: string; District?: string; Block?: string; State?: string }[] | null;
    }[];
    const entry = Array.isArray(body) ? body[0] : undefined;

    let value: PincodeInfo | 'invalid';
    const offices = entry?.PostOffice;
    if (entry?.Status === 'Success' && Array.isArray(offices) && offices.length > 0) {
      const district = offices[0].District?.trim() || '';
      const state = offices[0].State?.trim() || '';
      const names = new Set<string>();
      for (const o of offices) {
        for (const n of [o.Name, o.District, o.Block]) {
          if (n && n.trim() && n.trim().toUpperCase() !== 'NA') names.add(n.trim());
        }
      }
      // Delhi's districts ("Central Delhi", "South West Delhi"...) are not what people write as their city.
      const city = state.toLowerCase() === 'delhi' ? 'New Delhi' : district || offices[0].Name?.trim() || '';
      value = { pincode, city, district, state, names: [...names] };
    } else if (entry?.Status === 'Error' || entry?.Status === '404') {
      value = 'invalid';
    } else {
      return null;
    }

    if (cache.size >= MAX_CACHE) {
      const oldest = cache.keys().next().value;
      if (oldest !== undefined) cache.delete(oldest);
    }
    cache.set(pincode, { at: Date.now(), value });
    return value;
  } catch {
    return null;
  }
}

// Old/new names people use interchangeably for the same city.
const ALIASES: Record<string, string> = {
  bangalore: 'bengaluru',
  bombay: 'mumbai',
  calcutta: 'kolkata',
  madras: 'chennai',
  gurgaon: 'gurugram',
  poona: 'pune',
  cochin: 'kochi',
  trivandrum: 'thiruvananthapuram',
  benares: 'varanasi',
  banaras: 'varanasi',
  baroda: 'vadodara',
  mysore: 'mysuru',
  mangalore: 'mangaluru',
  belgaum: 'belagavi',
  allahabad: 'prayagraj',
  vizag: 'visakhapatnam',
  pondicherry: 'puducherry',
  panjim: 'panaji',
  simla: 'shimla',
  tumkur: 'tumakuru',
  hubli: 'hubballi',
  gauhati: 'guwahati',
  orissa: 'odisha',
};

// Words that appear in many place names and say nothing about WHICH place.
const GENERIC = new Set([
  'new', 'old', 'north', 'south', 'east', 'west', 'central', 'urban', 'rural', 'city', 'town',
  'district', 'dist', 'nagar', 'colony', 'road', 'market', 'bazar', 'bazaar', 'sector', 'phase',
  'extension', 'ext', 'main', 'head', 'post', 'office', 'the', 'and', 'of', 'ho', 'so', 'bo',
]);

function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .map((w) => ALIASES[w] ?? w)
    .filter((w) => w.length >= 3 && !GENERIC.has(w));
}

/**
 * True when the typed `city` plausibly belongs to the pincode: it shares a
 * meaningful word with the pincode's district, state, post-office or block
 * names (after mapping old/new city names). Deliberately lenient — a suburb
 * ("Whitefield") matches through its post office, and a city typed as its
 * state ("Delhi") matches through the state — so only clear mismatches fail.
 */
export function cityMatchesPincode(city: string, info: PincodeInfo): boolean {
  const typed = words(city);
  if (typed.length === 0) return true; // nothing meaningful to compare: don't block
  const known = new Set(words([...info.names, info.state, info.district].join(' ')));
  return typed.some((w) => known.has(w));
}

/** Human-readable mismatch message for the checkout form. */
export function pincodeMismatchMessage(city: string, info: PincodeInfo): string {
  const place = [info.district || info.city, info.state].filter(Boolean).join(', ');
  return `Pincode ${info.pincode} belongs to ${place}, which doesn't match "${city.trim()}". Please check your city and pincode.`;
}
