import { env } from './env.js';
import { toE164India } from './phone.js';

/**
 * Knowlarity "Make Outbound Call" (click-to-call) client.
 * https://developer.knowlarity.com/ -> Calls -> Make Outbound Call
 *
 * Knowlarity rings `agent_number` first; only if that leg is answered does it
 * dial `customer_number` and bridge the two. Both parties see `k_number` (our
 * SuperReceptionist number) as the caller ID rather than each other's real
 * number — that's the masking.
 */

export function isKnowlarityConfigured(): boolean {
  const k = env.knowlarity;
  return Boolean(k.apiKey && k.srApiKey && k.kNumber);
}

export class KnowlarityError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
  }
}

/**
 * Places a masked call: rings `callerPhone` (the scanner) first, then bridges
 * to `destinationPhone` (vehicle owner / emergency contact) once answered.
 * Throws KnowlarityError on any non-success response.
 */
export async function placeMaskedCall(callerPhone: string, destinationPhone: string): Promise<void> {
  const { apiKey, srApiKey, kNumber, channel, baseUrl } = env.knowlarity;

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/${channel}/v1/account/call/makecall`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey!,
        Authorization: srApiKey!,
      },
      body: JSON.stringify({
        k_number: toE164India(kNumber!),
        agent_number: toE164India(callerPhone),
        customer_number: toE164India(destinationPhone),
      }),
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err) {
    throw new KnowlarityError(`Could not reach Knowlarity: ${err instanceof Error ? err.message : String(err)}`);
  }

  const body = (await response.json().catch(() => null)) as {
    success?: { status?: string; message?: string };
    error?: { message?: string };
  } | null;

  if (!response.ok || body?.error || !body?.success) {
    throw new KnowlarityError(body?.error?.message ?? `Knowlarity returned HTTP ${response.status}`, response.status);
  }
}
