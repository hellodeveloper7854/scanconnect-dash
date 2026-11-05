import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import {
  cityMatchesPincode,
  lookupPincode,
  pincodeMismatchMessage,
  PINCODE_PATTERN,
  type PincodeInfo,
} from '../lib/pincode.js';

/**
 * Pincode lookup and delivery-time estimate for the product page / checkout,
 * plus the admin-editable rules behind the estimate. Mounted at /api/delivery
 * (public lookups) and /api/admin/delivery (settings).
 *
 * The estimate is a plain rule of thumb the admin controls, not a courier
 * quote: a default range of working days, overridden by the first rule whose
 * `match` (a city, district or state name) fits the pincode.
 */
export const deliveryRouter = Router();
export const adminDeliveryRouter = Router();

export interface DeliveryRule {
  match: string;
  minDays: number;
  maxDays: number;
}

// Used until an admin saves their own settings. Metros are quick, the rest of India slower.
const DEFAULT_SETTINGS = {
  defaultMinDays: 4,
  defaultMaxDays: 7,
  rules: [
    'Delhi', 'Mumbai', 'Bengaluru', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
  ].map((match): DeliveryRule => ({ match, minDays: 2, maxDays: 3 })),
};

const ruleSchema = z
  .object({
    match: z.string().trim().min(2).max(60),
    minDays: z.number().int().min(0).max(60),
    maxDays: z.number().int().min(0).max(60),
  })
  .refine((r) => r.minDays <= r.maxDays, { message: 'Minimum days cannot exceed maximum days' });

const settingsSchema = z
  .object({
    defaultMinDays: z.number().int().min(0).max(60),
    defaultMaxDays: z.number().int().min(0).max(60),
    rules: z.array(ruleSchema).max(100),
  })
  .refine((s) => s.defaultMinDays <= s.defaultMaxDays, { message: 'Minimum days cannot exceed maximum days' });

async function loadSettings() {
  let row;
  try {
    row = await prisma.deliverySetting.findUnique({ where: { id: 'singleton' } });
  } catch (err) {
    // e.g. the migration hasn't been applied yet: serve the defaults instead of failing.
    console.error('Could not read delivery settings, using defaults:', err instanceof Error ? err.message : err);
    return DEFAULT_SETTINGS;
  }
  if (!row) return DEFAULT_SETTINGS;
  const rules = z.array(ruleSchema).safeParse(row.rules);
  return {
    defaultMinDays: row.defaultMinDays,
    defaultMaxDays: row.defaultMaxDays,
    rules: rules.success ? (rules.data as DeliveryRule[]) : [],
  };
}

/** The date `days` working days (Mon-Sat; Sundays skipped) after `from`. */
function addWorkingDays(from: Date, days: number): Date {
  const d = new Date(from);
  let left = days;
  while (left > 0) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0) left--;
  }
  return d;
}

const formatDay = (d: Date) =>
  d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });

function pickRule(info: PincodeInfo, rules: DeliveryRule[]) {
  return rules.find((r) => cityMatchesPincode(r.match, info));
}

// Small per-client limiter: both endpoints call out to India Post.
const hits = new Map<string, { count: number; resetAt: number }>();
function rateLimited(key: string): boolean {
  const now = Date.now();
  const e = hits.get(key);
  if (!e || e.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + 60_000 });
    if (hits.size > 5000) for (const [k, v] of hits) if (v.resetAt < now) hits.delete(k);
    return false;
  }
  e.count += 1;
  return e.count > 60;
}
const clientKey = (req: import('express').Request) => {
  const f = req.headers['x-forwarded-for'];
  return (typeof f === 'string' ? f.split(',')[0].trim() : req.ip) || 'unknown';
};

/** GET /api/delivery/pincode/:pincode -> the place a pincode belongs to (for auto-filling city/state). */
deliveryRouter.get('/pincode/:pincode', async (req, res) => {
  if (rateLimited(clientKey(req))) return res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
  const pincode = req.params.pincode;
  if (!PINCODE_PATTERN.test(pincode)) return res.status(400).json({ error: 'Enter a valid 6-digit pincode' });

  const info = await lookupPincode(pincode);
  if (info === 'invalid') return res.status(404).json({ error: 'This pincode was not found. Please check it.' });
  if (info === null) {
    // India Post couldn't be reached: say so, and let the caller carry on unvalidated.
    return res.json({ pincode, verified: false });
  }
  // Optional ?city= lets the checkout form ask "does this city belong to this pincode?".
  const city = typeof req.query.city === 'string' ? req.query.city.trim() : '';
  const cityMatches = city ? cityMatchesPincode(city, info) : null;
  res.json({
    pincode,
    verified: true,
    city: info.city,
    district: info.district,
    state: info.state,
    cityMatches,
    message: cityMatches === false ? pincodeMismatchMessage(city, info) : null,
  });
});

/** GET /api/delivery/estimate?pincode=... -> estimated delivery window for that pincode. */
deliveryRouter.get('/estimate', async (req, res) => {
  if (rateLimited(clientKey(req))) return res.status(429).json({ error: 'Too many requests. Please try again in a minute.' });
  const parsed = z.object({ pincode: z.string().regex(PINCODE_PATTERN, 'Enter a valid 6-digit pincode') }).safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: 'Enter a valid 6-digit pincode' });
  const { pincode } = parsed.data;

  const info = await lookupPincode(pincode);
  if (info === 'invalid') return res.status(404).json({ error: 'This pincode was not found. Please check it.' });

  const settings = await loadSettings();
  // With no place data (India Post unreachable) the default range is the honest answer.
  const rule = info ? pickRule(info, settings.rules) : undefined;
  const minDays = rule?.minDays ?? settings.defaultMinDays;
  const maxDays = rule?.maxDays ?? settings.defaultMaxDays;

  const today = new Date();
  const earliest = addWorkingDays(today, minDays);
  const latest = addWorkingDays(today, maxDays);
  res.json({
    pincode,
    city: info ? info.city : null,
    state: info ? info.state : null,
    minDays,
    maxDays,
    earliest: earliest.toISOString(),
    latest: latest.toISOString(),
    text:
      minDays === maxDays || formatDay(earliest) === formatDay(latest)
        ? `Delivery by ${formatDay(latest)}`
        : `Delivery between ${formatDay(earliest)} and ${formatDay(latest)}`,
  });
});

// ---------------------------------------------------------------- admin

adminDeliveryRouter.use(requireAuth, requireAdmin);

adminDeliveryRouter.get('/settings', async (_req, res) => {
  res.json(await loadSettings());
});

adminDeliveryRouter.put('/settings', async (req, res) => {
  const parsed = settingsSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { defaultMinDays, defaultMaxDays, rules } = parsed.data;
  await prisma.deliverySetting.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', defaultMinDays, defaultMaxDays, rules },
    update: { defaultMinDays, defaultMaxDays, rules },
  });
  res.json({ defaultMinDays, defaultMaxDays, rules });
});
