import { randomUUID } from 'node:crypto';
import { env } from './env.js';
import { last10Digits } from './phone.js';

/**
 * Gupshup WhatsApp Enterprise "Send a Template Notification" client
 * (POST /GatewayAPI/rest, simple text template, no header/footer/buttons).
 * Body variables are passed as var1, var2, ... in template order.
 */

export function isGupshupConfigured(): boolean {
  const g = env.gupshup;
  return Boolean(g.userId && g.token && g.templateId);
}

export class GupshupError extends Error {}

/** Sends the configured template to `phone`. Throws GupshupError on any non-success response. */
export async function sendTemplateMessage(phone: string, vars: string[]): Promise<void> {
  const { userId, token, templateId, baseUrl } = env.gupshup;

  const form = new URLSearchParams({
    send_to: `91${last10Digits(phone)}`, // Gupshup wants country code, no "+"
    msg_type: 'text',
    userid: userId!,
    auth_scheme: 'plain',
    v: '1.1',
    format: 'json',
    method: 'SendMessage',
    isHSM: 'true',
    isTemplate: 'true',
    linkTrackingEnabled: 'true',
    msg_id: randomUUID(),
    whatsAppTemplateId: templateId!,
  });
  vars.forEach((value, i) => form.set(`var${i + 1}`, value));

  let response: Response;
  try {
    response = await fetch(`${baseUrl}/GatewayAPI/rest`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form,
      signal: AbortSignal.timeout(15_000),
    });
  } catch (err) {
    throw new GupshupError(`Could not reach Gupshup: ${err instanceof Error ? err.message : String(err)}`);
  }

  const body = (await response.json().catch(() => null)) as { response?: { status?: string; details?: string } } | null;
  if (!response.ok || body?.response?.status !== 'success') {
    throw new GupshupError(body?.response?.details ?? `Gupshup returned HTTP ${response.status}`);
  }
}
