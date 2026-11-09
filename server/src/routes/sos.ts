import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { env } from '../lib/env.js';
import { requireAuth } from '../middleware/auth.js';
import { isSosAlertConfigured, sendTemplateMessage } from '../lib/gupshup.js';

export const sosRouter = Router();

const createSosSchema = z.object({
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
});

/** At most this many contacts are alerted per SOS (primary first). */
const MAX_ALERTED_CONTACTS = 5;
/** How long the SOS response waits for WhatsApp results; slower sends carry on in the background. */
const RESPONSE_WAIT_MS = 6000;

export interface SosNotifyResult {
  /** Emergency contacts the owner has saved. */
  total: number;
  /** Of those, how many agreed to WhatsApp alerts (and are within the per-alert cap). */
  eligible: number;
  sent: number;
  failed: number;
  /** Still being delivered when the response was sent. */
  pending: number;
  /** WhatsApp alerts are switched off on the server (credentials / SOS template missing). */
  notConfigured: boolean;
}

/** Google Maps pin for the coordinates, or null when the phone sent no location. */
export function mapsLink(latitude?: number | null, longitude?: number | null): string | null {
  if (latitude == null || longitude == null) return null;
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

/**
 * Sends the approved SOS template to the owner's emergency contacts who agreed to
 * WhatsApp alerts. Template variables: {{1}} owner name, {{2}} Google Maps link to
 * the location (or "not available"), {{3}} the time in IST. Never throws: the SOS
 * alert is already saved, and a WhatsApp problem must not turn it into an error.
 */
async function notifyEmergencyContacts(
  userId: string,
  ownerName: string,
  latitude?: number,
  longitude?: number,
): Promise<SosNotifyResult> {
  const contacts = await prisma.emergencyContact.findMany({
    where: { userId },
    orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
  });
  return sendSosAlerts(contacts, userId, ownerName, latitude, longitude);
}

/** The sending half of the above, on an already-loaded contact list (primary first). */
export async function sendSosAlerts(
  contacts: { phone: string; whatsappOptIn: boolean }[],
  userId: string,
  ownerName: string,
  latitude?: number,
  longitude?: number,
): Promise<SosNotifyResult> {
  const eligible = contacts.filter((c) => c.whatsappOptIn).slice(0, MAX_ALERTED_CONTACTS);
  const result: SosNotifyResult = {
    total: contacts.length,
    eligible: eligible.length,
    sent: 0,
    failed: 0,
    pending: 0,
    notConfigured: !isSosAlertConfigured(),
  };
  if (eligible.length === 0 || result.notConfigured) return result;

  const when = new Date().toLocaleString('en-IN', {
    timeZone: 'Asia/Kolkata',
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
  const location = mapsLink(latitude, longitude) ?? 'not available';
  result.pending = eligible.length;

  const sends = eligible.map((contact) =>
    sendTemplateMessage(contact.phone, [ownerName, location, when], env.gupshup.sosTemplateId)
      .then(() => {
        result.sent += 1;
      })
      .catch((err) => {
        result.failed += 1;
        // No phone numbers in logs: the user id is enough to investigate.
        console.error(`SOS WhatsApp failed for user ${userId}:`, err instanceof Error ? err.message : err);
      })
      .finally(() => {
        result.pending -= 1;
      }),
  );

  await Promise.race([Promise.allSettled(sends), new Promise((resolve) => setTimeout(resolve, RESPONSE_WAIT_MS))]);
  return { ...result };
}

sosRouter.post('/', requireAuth, async (req, res) => {
  const parsed = createSosSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const alert = await prisma.sosAlert.create({
    data: {
      userId: req.user!.id,
      latitude: parsed.data.latitude,
      longitude: parsed.data.longitude,
    },
  });

  const notified = await notifyEmergencyContacts(
    req.user!.id,
    req.user!.fullName,
    parsed.data.latitude,
    parsed.data.longitude,
  );

  res.status(201).json({ alert, notified });
});

sosRouter.get('/mine', requireAuth, async (req, res) => {
  const alerts = await prisma.sosAlert.findMany({
    where: { userId: req.user!.id },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ alerts });
});
