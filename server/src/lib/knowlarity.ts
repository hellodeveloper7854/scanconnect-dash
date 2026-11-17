import { env } from './env.js';
import { toE164India } from './phone.js';
import { prisma } from './prisma.js';

/**
 * Knowlarity "Get the list of bought numbers" client — the source of the
 * masked number shown to scanners, so it always reflects what's actually
 * active on the account instead of a hand-copied env value.
 * GET {baseUrl}/{channel}/v1/account/numbers/
 */

const CACHE_TTL_MS = 10 * 60 * 1000;

export interface AccountNumber {
  /** E.164, e.g. +918037121389 */
  number: string;
  /** Knowlarity's "number_type": "1" = dialable SR (inbound) number, "0" = outbound caller-ID. */
  numberType: string | null;
  cliType: string | null;
  isExpired: boolean;
  /** Whether this number can be handed to scanners. */
  dialable: boolean;
}

let cache: { numbers: AccountNumber[]; fetchedAt: number } | null = null;
let nextIndex = 0;

export class KnowlarityError extends Error {}

export function isKnowlarityConfigured(): boolean {
  return env.knowlarity.maskedNumbers.length > 0 || Boolean(env.knowlarity.apiKey && env.knowlarity.srApiKey);
}

async function fetchAccountNumbers(): Promise<AccountNumber[]> {
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
    .filter((n) => n.phone_number)
    .map((n) => ({
      number: toE164India(n.phone_number!),
      numberType: n.number_type ?? null,
      cliType: n.cli_type ?? null,
      isExpired: Boolean(n.is_expired),
      dialable: !n.is_expired && n.number_type === '1' && (n.cli_type ?? 'NONE') === 'NONE',
    }));
}

/** Every number on the Knowlarity account (cached for 10 minutes; `fresh` forces a refresh). A stale cache is used if a refresh fails. */
export async function listAccountNumbers(fresh = false): Promise<AccountNumber[]> {
  if (fresh || !cache || Date.now() - cache.fetchedAt > CACHE_TTL_MS) {
    try {
      cache = { numbers: await fetchAccountNumbers(), fetchedAt: Date.now() };
    } catch (err) {
      if (!cache) throw err;
      console.error('Knowlarity number refresh failed, using cached list:', err);
    }
  }
  return cache.numbers;
}

/** Numbers an admin switched off in the IVR Numbers page; they are skipped when handing one to a scanner. */
async function disabledNumbers(): Promise<Set<string>> {
  try {
    const rows = await prisma.ivrNumberSetting.findMany({ where: { enabled: false }, select: { phoneNumber: true } });
    return new Set(rows.map((r) => r.phoneNumber));
  } catch {
    return new Set(); // settings table unavailable: never block calling because of it
  }
}

/**
 * Returns one of the account's active Knowlarity numbers (E.164), rotating
 * round-robin when there are several and skipping any an admin disabled.
 */
export async function getMaskedNumber(): Promise<string> {
  const override = env.knowlarity.maskedNumbers;
  const candidates =
    override.length > 0
      ? override.map((n) => toE164India(n))
      : (await listAccountNumbers()).filter((n) => n.dialable).map((n) => n.number);
  if (candidates.length === 0) {
    throw new KnowlarityError('No active Knowlarity numbers on this account');
  }
  const disabled = await disabledNumbers();
  const usable = candidates.filter((n) => !disabled.has(n));
  if (usable.length === 0) {
    throw new KnowlarityError('Every Knowlarity number is switched off in the admin panel');
  }
  return usable[nextIndex++ % usable.length];
}
