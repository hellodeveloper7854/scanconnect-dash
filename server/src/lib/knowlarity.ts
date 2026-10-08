import { env } from './env.js';
import { toE164India } from './phone.js';

/**
 * Knowlarity "Get the list of bought numbers" client — the source of the
 * masked number shown to scanners, so it always reflects what's actually
 * active on the account instead of a hand-copied env value.
 * GET {baseUrl}/{channel}/v1/account/numbers/
 */

const CACHE_TTL_MS = 10 * 60 * 1000;

let cache: { numbers: string[]; fetchedAt: number } | null = null;
let nextIndex = 0;

export class KnowlarityError extends Error {}

export function isKnowlarityConfigured(): boolean {
  return env.knowlarity.maskedNumbers.length > 0 || Boolean(env.knowlarity.apiKey && env.knowlarity.srApiKey);
}

async function fetchBoughtNumbers(): Promise<string[]> {
  const { apiKey, srApiKey, channel, baseUrl } = env.knowlarity;

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/${channel}/v1/account/numbers/`, {
      headers: { 'content-type': 'application/json', 'x-api-key': apiKey!, Authorization: srApiKey! },
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err) {
    throw new KnowlarityError(`Could not reach Knowlarity: ${err instanceof Error ? err.message : String(err)}`);
  }

  const body = (await response.json().catch(() => null)) as {
    objects?: { phone_number?: string; is_expired?: boolean; number_type?: string; cli_type?: string }[];
    error?: { message?: string };
  } | null;
  if (!response.ok || !body?.objects) {
    throw new KnowlarityError(body?.error?.message ?? `Knowlarity returned HTTP ${response.status}`);
  }

  // number_type "1" is a dialable SR (inbound) number. The account's CLI
  // number (number_type "0", cli_type "OUTGOING") is outbound caller-ID only —
  // dialing it gives "not a correct number", so it must never be handed out.
  return body.objects
    .filter((n) => n.phone_number && !n.is_expired && n.number_type === '1' && (n.cli_type ?? 'NONE') === 'NONE')
    .map((n) => toE164India(n.phone_number!));
}

/**
 * Returns one of the account's active Knowlarity numbers (E.164), rotating
 * round-robin when there are several. The list is cached for 10 minutes; a
 * stale cache is used if a refresh fails.
 */
export async function getMaskedNumber(): Promise<string> {
  const override = env.knowlarity.maskedNumbers;
  if (override.length > 0) {
    return toE164India(override[nextIndex++ % override.length]);
  }
  if (!cache || Date.now() - cache.fetchedAt > CACHE_TTL_MS) {
    try {
      cache = { numbers: await fetchBoughtNumbers(), fetchedAt: Date.now() };
    } catch (err) {
      if (!cache) throw err;
      console.error('Knowlarity number refresh failed, using cached list:', err);
    }
  }
  if (cache.numbers.length === 0) {
    throw new KnowlarityError('No active Knowlarity numbers on this account');
  }
  return cache.numbers[nextIndex++ % cache.numbers.length];
}
