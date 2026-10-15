import { Router, type Request } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';

/**
 * Vehicle-number search for the mobile app. The website only reaches a vehicle
 * by scanning its QR sticker; the app also lets a user type a registration
 * number to see whether that vehicle is on Scan Connect and, if so, contact
 * its owner through the same masked-call / message endpoints a scan uses.
 *
 * Public (no sign-in), so it is deliberately minimal: it answers only whether
 * the vehicle has an ACTIVE tag and, if so, that tag's code — never a name,
 * phone number or any vehicle detail. Contacting the owner still goes through
 * /api/qr/:code/masked-call and /message, which never reveal a real number.
 * Lookups are rate limited per client to make bulk enumeration impractical.
 */
export const appVehicleLookupRouter = Router();

const WINDOW_MS = 60 * 60 * 1000;
const MAX_LOOKUPS_PER_WINDOW = 30;
const hits = new Map<string, number[]>();

function clientKey(req: Request): string {
  // Behind nginx, req.ip is the proxy; the real client is the first hop of X-Forwarded-For.
  const forwarded = req.headers['x-forwarded-for'];
  const first = (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(',')[0]?.trim();
  return first || req.ip || 'unknown';
}

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_LOOKUPS_PER_WINDOW) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  return false;
}

// Keep the in-memory map from growing without bound.
setInterval(() => {
  const now = Date.now();
  for (const [key, times] of hits) {
    const recent = times.filter((t) => now - t < WINDOW_MS);
    if (recent.length === 0) hits.delete(key);
    else hits.set(key, recent);
  }
}, WINDOW_MS).unref();

const lookupSchema = z.object({
  registration: z.string().min(4).max(30),
});

appVehicleLookupRouter.post('/', async (req, res) => {
  const parsed = lookupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Enter a valid vehicle number.' });
  }

  if (isRateLimited(clientKey(req))) {
    return res.status(429).json({ error: 'Too many searches. Please try again later.' });
  }

  // Stored registrations are free text ("MH12 AB 1234", "mh-12-ab-1234"), so
  // compare with spaces/punctuation stripped and case ignored on both sides.
  const normalized = parsed.data.registration.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (normalized.length < 4) {
    return res.status(400).json({ error: 'Enter a valid vehicle number.' });
  }

  const rows = await prisma.$queryRaw<{ code: string }[]>`
    SELECT q."code"
    FROM "QrCode" q
    JOIN "Vehicle" v ON v."id" = q."vehicleId"
    WHERE q."status" = 'ACTIVE'
      AND q."deletedAt" IS NULL
      AND upper(regexp_replace(v."registration", '[^A-Za-z0-9]', '', 'g')) = ${normalized}
    LIMIT 1
  `;

  if (rows.length === 0) {
    return res.json({ registered: false });
  }
  res.json({ registered: true, code: rows[0].code });
});
