import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { toE164India } from '../lib/phone.js';
import type { Prisma } from '@prisma/client';

/**
 * Gupshup WhatsApp webhook receiver — the single callback URL configured in
 * the Gupshup app's settings for both inbound messages (a vehicle owner
 * replying) and message-status/account events (enqueued/sent/delivered/
 * read/failed, template review updates, etc).
 *
 * Per Gupshup's webhook requirements (see docs/ScanConnect_Gupshup_Requirements.pdf):
 *  - Always ack fast: respond 2xx with an empty body, well under the 10s
 *    timeout Gupshup enforces before it considers delivery failed and
 *    retries. We do everything synchronously here (a single insert), which
 *    is fast enough in practice; if that ever changes, the ack must be sent
 *    before any slower processing, not after.
 *  - No signature/auth is required by Gupshup for this endpoint — it must
 *    be publicly reachable. Optionally, Gupshup's own inbound IPs can be
 *    allow-listed at the infra/proxy level for defense in depth (email
 *    devsupport@gupshup.io for the current IP list); that's out of scope
 *    for this route itself.
 *  - The exact payload shape isn't validated against a strict schema, the
 *    same reasoning as the existing Knowlarity /partner/call-logs route:
 *    Gupshup's payload varies by event type ("message" | "message-event" |
 *    "account-event", plus a "sandbox-start" system event with no
 *    meaningful payload), so rejecting anything that doesn't match a fixed
 *    shape would just turn a new/unrecognized event into a dropped
 *    notification. The complete raw body is always stored; a best-effort
 *    set of common fields is lifted into typed columns for querying.
 */
export const whatsappRouter = Router();

function firstString(obj: Record<string, unknown> | undefined, keys: string[]): string | undefined {
  if (!obj) return undefined;
  for (const key of keys) {
    const value = obj[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return undefined;
}

whatsappRouter.post('/webhook', async (req, res) => {
  // Ack immediately — Gupshup requires a fast, empty 2xx response and
  // processes/retries on its own schedule otherwise. Everything below is a
  // single fast insert, but responding first keeps that contract even if
  // this handler grows slower work later.
  res.status(200).end();

  try {
    const body = (req.body && typeof req.body === 'object' ? req.body : {}) as Record<string, unknown>;
    const eventType = firstString(body, ['type']) ?? 'unknown';

    const payload = body.payload && typeof body.payload === 'object' ? (body.payload as Record<string, unknown>) : undefined;
    // For "message" (inbound), payload.id is the WhatsApp message id and
    // payload.source is the sender's number. For "message-event" (delivery
    // status), payload.id/payload.gsId is Gupshup's message id and
    // payload.destination is the recipient. Both are checked since the id
    // field name differs by event type.
    const gupshupMessageId = firstString(payload, ['gsId', 'id']);
    const phoneNumberRaw = firstString(payload, ['source', 'destination']);
    const status = firstString(payload, ['type']); // nested payload.type: message content type, or message-event status

    const data: Prisma.WhatsAppEventUncheckedCreateInput = {
      eventType,
      gupshupMessageId,
      phoneNumber: phoneNumberRaw ? toE164India(phoneNumberRaw) : undefined,
      status: eventType === 'message-event' ? status : undefined,
      rawPayload: body as Prisma.InputJsonValue,
    };

    const existing = gupshupMessageId
      ? await prisma.whatsAppEvent.findFirst({ where: { gupshupMessageId }, orderBy: { createdAt: 'desc' } })
      : null;

    if (existing) {
      await prisma.whatsAppEvent.update({ where: { id: existing.id }, data });
    } else {
      await prisma.whatsAppEvent.create({ data });
    }
  } catch (err) {
    // The response is already sent — log only, never let storage errors
    // surface as a failed delivery to Gupshup (that would trigger retries
    // for an event we already acknowledged).
    console.error('Failed to store Gupshup webhook event:', err);
  }
});
