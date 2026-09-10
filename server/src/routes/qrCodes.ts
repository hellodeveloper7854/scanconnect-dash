import { Router } from 'express';
import { randomBytes, randomUUID } from 'node:crypto';
import QRCode from 'qrcode';
import { ZipArchive } from 'archiver';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { env } from '../lib/env.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { toCsv } from '../lib/csv.js';
import type { Prisma } from '@prisma/client';

// Crockford-ish base32 alphabet, ambiguous characters (0/O, 1/I) removed so
// printed/handwritten codes on physical stickers can't be misread.
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

// Matches the max batch size a single bulk-generate call can create, so an
// admin can always list/zip/print an entire batch in one request regardless
// of size, while still bounding worst-case query/response size.
const MAX_ADMIN_PAGE_SIZE = 5000;

/** Lowercases and strips a batch name down to URL/print-safe [a-z0-9-] characters, for use in a display ID. */
function slugifyBatchName(batchName: string): string {
  return (
    batchName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'batch'
  );
}

/** Formats a QR code's human-readable ID as sc-{batchname}-0001 (batchSeq is 1-indexed within its batch). */
function formatDisplayId(batchName: string, batchSeq: number): string {
  return `sc-${slugifyBatchName(batchName)}-${String(batchSeq).padStart(4, '0')}`.toUpperCase();
}

function generateCode(length = 10): string {
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return out;
}

async function createUniqueCodes(quantity: number): Promise<string[]> {
  const codes = new Set<string>();
  while (codes.size < quantity) {
    codes.add(generateCode());
  }
  return Array.from(codes);
}

/**
 * Admin-only: bulk generation, listing, batch CSV/PNG export for physical
 * sticker production. Mounted at /api/admin/qr-codes.
 */
export const adminQrCodesRouter = Router();
adminQrCodesRouter.use(requireAuth, requireAdmin);

const bulkCreateSchema = z.object({
  quantity: z.number().int().min(1).max(5000),
  name: z.string().min(1).max(120),
});

adminQrCodesRouter.post('/bulk', async (req, res) => {
  const parsed = bulkCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { quantity, name } = parsed.data;
  const batchId = randomUUID();
  const batchCreatedAt = new Date();

  let candidates = await createUniqueCodes(quantity);
  const rows: { id: string; code: string; batchSeq: number }[] = candidates.map((code, i) => ({
    id: randomUUID(),
    code,
    batchSeq: i + 1,
  }));

  // Insert with a retry loop in case of a (statistically negligible) unique
  // collision against codes already present in the database.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await prisma.qrCode.createMany({
        data: rows.map((r) => ({ id: r.id, code: r.code, batchSeq: r.batchSeq, batchId, batchName: name, batchCreatedAt })),
      });
      return res.status(201).json({ batchId, batchName: name, quantity, codes: rows });
    } catch (err) {
      if (err instanceof Error && err.message.includes('Unique constraint') && attempt < 4) {
        const existing = await prisma.qrCode.findMany({
          where: { code: { in: rows.map((r) => r.code) } },
          select: { code: true },
        });
        const existingCodes = new Set(existing.map((e) => e.code));
        for (const row of rows) {
          if (existingCodes.has(row.code)) {
            row.code = generateCode();
          }
        }
        continue;
      }
      throw err;
    }
  }

  res.status(500).json({ error: 'Failed to generate unique codes, please retry' });
});

/**
 * Resolves a free-text search term against the display ID (SC-{batchname}-0001)
 * as-you-type — any partial prefix of the final ID should already match, not
 * just a complete one — by reconstructing every distinct batch's ID prefix
 * (sc-{slug}-) and checking it against the search term in both directions:
 * either the term is a prefix of a real ID (typing "sc-first-lo" mid-word),
 * or a real ID's batch prefix is a prefix of the term (typing "sc-first-lot-"
 * or further into the sequence number). When digits have been typed past the
 * prefix, they further narrow matches to codes whose zero-padded batchSeq
 * starts with those digits (e.g. "...-00" matches batchSeq 1-9, "...-03"
 * matches only batchSeq 3). Case-insensitive throughout. Batch names are few
 * enough (one row per distinct batch, not per QR code) that this is cheap
 * even at scale — no SQL equivalent for slugifyBatchName exists, so this has
 * to run in application code.
 */
async function buildDisplayIdSearchWhere(term: string): Promise<Prisma.QrCodeWhereInput | undefined> {
  const normalized = term.trim().toLowerCase();
  if (!normalized) return undefined;

  const batches = await prisma.qrCode.findMany({
    where: { deletedAt: null },
    distinct: ['batchId'],
    select: { batchId: true, batchName: true },
  });

  const clauses: Prisma.QrCodeWhereInput[] = [];
  for (const { batchId, batchName } of batches) {
    const idPrefix = `sc-${slugifyBatchName(batchName)}-`;
    if (idPrefix.startsWith(normalized)) {
      // Not enough typed yet to reach the sequence number — every code in this batch matches so far.
      clauses.push({ batchId });
    } else if (normalized.startsWith(idPrefix)) {
      const digitsTyped = normalized.slice(idPrefix.length);
      if (!digitsTyped) {
        clauses.push({ batchId });
      } else if (/^\d+$/.test(digitsTyped)) {
        // String-prefix match on the zero-padded 4-digit sequence number (e.g. "03"
        // must match only batchSeq 3 → "0003", not the numeric range 300-399).
        const matchingSeqs: number[] = [];
        for (let seq = 1; seq <= 9999; seq++) {
          if (String(seq).padStart(4, '0').startsWith(digitsTyped)) matchingSeqs.push(seq);
        }
        if (matchingSeqs.length) clauses.push({ batchId, batchSeq: { in: matchingSeqs } });
      }
    }
  }
  return clauses.length ? { OR: clauses } : undefined;
}

async function buildQrCodeWhere(query: Record<string, unknown>): Promise<Prisma.QrCodeWhereInput> {
  const status = typeof query.status === 'string' ? query.status : undefined;
  const batchId = typeof query.batchId === 'string' ? query.batchId : undefined;
  const name = typeof query.name === 'string' ? query.name : undefined;
  const dateFrom = typeof query.dateFrom === 'string' ? new Date(query.dateFrom) : undefined;
  const dateTo = typeof query.dateTo === 'string' ? new Date(query.dateTo) : undefined;

  const createdAtFilter =
    dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom && !Number.isNaN(dateFrom.getTime()) ? { gte: dateFrom } : {}),
            ...(dateTo && !Number.isNaN(dateTo.getTime())
              ? { lte: new Date(dateTo.getTime() + 24 * 60 * 60 * 1000 - 1) }
              : {}),
          },
        }
      : {};

  const idSearchWhere = name ? await buildDisplayIdSearchWhere(name) : undefined;

  return {
    deletedAt: null,
    ...(status ? { status: status as never } : {}),
    ...(batchId ? { batchId } : {}),
    ...(name
      ? {
          OR: [
            { batchName: { contains: name, mode: 'insensitive' } },
            { code: { contains: name, mode: 'insensitive' } },
            ...(idSearchWhere ? [idSearchWhere] : []),
          ],
        }
      : {}),
    ...createdAtFilter,
  };
}

adminQrCodesRouter.get('/', async (req, res) => {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const pageSize = Math.min(MAX_ADMIN_PAGE_SIZE, Number(req.query.pageSize ?? 25));
  const where = await buildQrCodeWhere(req.query as Record<string, unknown>);

  const [codes, total, batchGroups] = await Promise.all([
    prisma.qrCode.findMany({
      where,
      include: {
        vehicle: { include: { user: { select: { fullName: true, email: true, mobileNumber: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.qrCode.count({ where }),
    prisma.qrCode.groupBy({
      by: ['batchId', 'batchName', 'batchCreatedAt'],
      where: { deletedAt: null },
      _count: { _all: true },
      orderBy: { batchCreatedAt: 'desc' },
    }),
  ]);

  const activatedCounts = await prisma.qrCode.groupBy({
    by: ['batchId'],
    where: { status: 'ACTIVE', deletedAt: null },
    _count: { _all: true },
  });
  const activatedByBatch = new Map(activatedCounts.map((a) => [a.batchId, a._count._all]));

  const batches = batchGroups.map((b) => ({
    batchId: b.batchId,
    batchName: b.batchName,
    batchCreatedAt: b.batchCreatedAt,
    total: b._count._all,
    activated: activatedByBatch.get(b.batchId) ?? 0,
  }));

  res.json({ codes, total, page, pageSize, batches });
});

adminQrCodesRouter.get('/:batchId/download.csv', async (req, res) => {
  const codes = await prisma.qrCode.findMany({
    where: { batchId: req.params.batchId, deletedAt: null },
    orderBy: { createdAt: 'asc' },
  });
  if (codes.length === 0) {
    return res.status(404).json({ error: 'Batch not found' });
  }

  const rows = codes.map((c) => ({
    displayId: formatDisplayId(c.batchName, c.batchSeq),
    code: c.code,
    url: `${env.corsOrigin}/qr/${c.code}`,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
  }));
  const csv = toCsv(rows, ['displayId', 'code', 'url', 'status', 'createdAt']);

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="qr-batch-${req.params.batchId.slice(0, 8)}.csv"`);
  res.send(csv);
});

/**
 * Streams a ZIP of every QR PNG matching the currently applied filters
 * (status, batch, name search, date range) — a plain query-filtered export
 * rather than a single-batch download, so an admin can e.g. export every
 * code named "Mall Parking" regardless of which batch(es) it spans.
 */
adminQrCodesRouter.get('/download.zip', async (req, res) => {
  const where = await buildQrCodeWhere(req.query as Record<string, unknown>);

  const codes = await prisma.qrCode.findMany({
    where,
    orderBy: { createdAt: 'asc' },
    take: MAX_ADMIN_PAGE_SIZE,
  });

  if (codes.length === 0) {
    return res.status(404).json({ error: 'No QR codes match the current filters' });
  }

  res.setHeader('Content-Type', 'application/zip');
  res.setHeader('Content-Disposition', 'attachment; filename="qr-codes.zip"');

  const archive = new ZipArchive({ zlib: { level: 9 } });
  archive.on('error', (err: Error) => {
    console.error('ZIP generation failed:', err);
    res.destroy(err);
  });
  archive.pipe(res);

  for (const code of codes) {
    const url = `${env.corsOrigin}/qr/${code.code}`;
    const png = await QRCode.toBuffer(url, { type: 'png', width: 300, margin: 2 });
    const safeBatchName = code.batchName.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'batch';
    archive.append(png, { name: `${safeBatchName}/${code.code}.png` });
  }

  await archive.finalize();
});

adminQrCodesRouter.get('/:id/qr.png', async (req, res) => {
  const code = await prisma.qrCode.findUnique({ where: { id: req.params.id } });
  if (!code) {
    return res.status(404).json({ error: 'QR code not found' });
  }

  const url = `${env.corsOrigin}/qr/${code.code}`;
  const png = await QRCode.toBuffer(url, { type: 'png', width: 300, margin: 2 });
  res.setHeader('Content-Type', 'image/png');
  res.send(png);
});

/**
 * Soft-deletes a single QR code — marks it deletedAt instead of removing the
 * row, so it moves to the "Recover QR Codes" trash view instead of being
 * gone immediately. Refuses if it's ACTIVE (linked to a live vehicle) — it
 * must be deactivated/unlinked first so a vehicle's safety tag can never be
 * silently removed out from under its owner.
 */
adminQrCodesRouter.delete('/:id', async (req, res) => {
  const code = await prisma.qrCode.findUnique({ where: { id: req.params.id } });
  if (!code || code.deletedAt) {
    return res.status(404).json({ error: 'QR code not found' });
  }
  if (code.status === 'ACTIVE') {
    return res.status(409).json({ error: 'This QR code is active — deactivate it before deleting' });
  }

  await prisma.qrCode.update({ where: { id: code.id }, data: { deletedAt: new Date() } });
  res.status(204).send();
});

/**
 * Trash view: lists soft-deleted QR codes (paginated), most recently deleted
 * first, so an admin can review and either restore or permanently remove
 * them.
 */
adminQrCodesRouter.get('/deleted', async (req, res) => {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const pageSize = Math.min(MAX_ADMIN_PAGE_SIZE, Number(req.query.pageSize ?? 25));

  const [codes, total] = await Promise.all([
    prisma.qrCode.findMany({
      where: { deletedAt: { not: null } },
      include: {
        vehicle: { include: { user: { select: { fullName: true, email: true, mobileNumber: true } } } },
      },
      orderBy: { deletedAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.qrCode.count({ where: { deletedAt: { not: null } } }),
  ]);

  res.json({ codes, total, page, pageSize });
});

/** Restores a soft-deleted QR code back to normal, clearing deletedAt. */
adminQrCodesRouter.post('/:id/restore', async (req, res) => {
  const code = await prisma.qrCode.findUnique({ where: { id: req.params.id } });
  if (!code || !code.deletedAt) {
    return res.status(404).json({ error: 'Deleted QR code not found' });
  }

  const restored = await prisma.qrCode.update({ where: { id: code.id }, data: { deletedAt: null } });
  res.json({ code: restored });
});

/**
 * Permanently deletes a QR code — only reachable from the trash view, and
 * only for codes that are already soft-deleted, so a code can never be
 * permanently removed in one step from QR Code Management.
 */
adminQrCodesRouter.delete('/:id/permanent', async (req, res) => {
  const code = await prisma.qrCode.findUnique({ where: { id: req.params.id } });
  if (!code || !code.deletedAt) {
    return res.status(404).json({ error: 'Deleted QR code not found' });
  }

  await prisma.qrCode.delete({ where: { id: code.id } });
  res.status(204).send();
});

const disableSchema = z.object({
  disabled: z.boolean(),
});

/**
 * Disables (or re-enables) a QR code without deleting it — the record, its
 * linked vehicle, and its emergency contacts are all left intact so it can
 * be re-enabled later. A disabled code stops resolving to its usual
 * active/inactive scan flow: /:code reports DISABLED so the scan-facing UI
 * shows a "contact support" message instead of vehicle/owner details.
 */
adminQrCodesRouter.patch('/:id/status', async (req, res) => {
  const parsed = disableSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const code = await prisma.qrCode.findUnique({ where: { id: req.params.id } });
  if (!code) {
    return res.status(404).json({ error: 'QR code not found' });
  }

  if (parsed.data.disabled) {
    if (code.status === 'DISABLED') {
      return res.status(409).json({ error: 'This QR code is already disabled' });
    }
    const updated = await prisma.qrCode.update({
      where: { id: code.id },
      data: { status: 'DISABLED', previousStatus: code.status },
    });
    return res.json({ code: updated });
  }

  if (code.status !== 'DISABLED') {
    return res.status(409).json({ error: 'This QR code is not disabled' });
  }
  const updated = await prisma.qrCode.update({
    where: { id: code.id },
    data: { status: code.previousStatus ?? 'INACTIVE', previousStatus: null },
  });
  res.json({ code: updated });
});

/**
 * Soft-deletes every QR code in a batch ("lot") — same trash/restore
 * behavior as the single-code delete. Refuses the whole batch if ANY code in
 * it is still ACTIVE, for the same reason as the single-code delete.
 */
adminQrCodesRouter.delete('/batch/:batchId', async (req, res) => {
  const { batchId } = req.params;
  const [total, activeCount] = await Promise.all([
    prisma.qrCode.count({ where: { batchId, deletedAt: null } }),
    prisma.qrCode.count({ where: { batchId, status: 'ACTIVE', deletedAt: null } }),
  ]);

  if (total === 0) {
    return res.status(404).json({ error: 'Batch not found' });
  }
  if (activeCount > 0) {
    return res.status(409).json({
      error: `This batch has ${activeCount} active code${activeCount === 1 ? '' : 's'} — deactivate ${activeCount === 1 ? 'it' : 'them'} before deleting the batch`,
    });
  }

  await prisma.qrCode.updateMany({ where: { batchId, deletedAt: null }, data: { deletedAt: new Date() } });
  res.status(204).send();
});

/**
 * Public + authenticated scan/activation flow. Mounted at /api/qr.
 */
export const qrCodesRouter = Router();

/**
 * Lets the vehicle owner download their own linked QR tag's PNG (e.g. from
 * the Profile page's vehicle card). Scoped to the requesting user so someone
 * can't download another vehicle's sticker just by knowing its code.
 */
qrCodesRouter.get('/:code/qr.png', requireAuth, async (req, res) => {
  const qrCode = await prisma.qrCode.findUnique({
    where: { code: req.params.code },
    include: { vehicle: true },
  });

  if (!qrCode || !qrCode.vehicle || qrCode.vehicle.userId !== req.user!.id) {
    return res.status(404).json({ error: 'QR code not found' });
  }

  const url = `${env.corsOrigin}/qr/${qrCode.code}`;
  const png = await QRCode.toBuffer(url, { type: 'png', width: 300, margin: 2 });
  res.setHeader('Content-Type', 'image/png');
  res.send(png);
});

qrCodesRouter.get('/:code', async (req, res) => {
  const qrCode = await prisma.qrCode.findUnique({ where: { code: req.params.code } });
  if (!qrCode) {
    return res.status(404).json({ error: 'This QR code is not recognized' });
  }

  // Deliberately no vehicle/owner data here — INACTIVE codes have nothing
  // linked yet, and ACTIVE codes should fetch /details separately.
  res.json({ status: qrCode.status });
});

/**
 * Public, no verification required: shows the vehicle/owner/contact names so
 * a finder can see who a scanned vehicle belongs to at a glance. Phone
 * numbers are deliberately omitted here — those are only revealed via
 * /verify, once the last-4-digit registration check passes, so a phone
 * number can't be scraped by scanning without proving vehicle ownership.
 */
qrCodesRouter.get('/:code/details', async (req, res) => {
  const qrCode = await prisma.qrCode.findUnique({
    where: { code: req.params.code },
    include: {
      vehicle: { include: { user: { select: { fullName: true } } } },
      emergencyContacts: true,
    },
  });

  if (!qrCode || qrCode.status !== 'ACTIVE' || !qrCode.vehicle) {
    return res.status(404).json({ error: 'This QR code is not active' });
  }

  res.json({
    owner: { fullName: qrCode.vehicle.user.fullName },
    vehicle: {
      registration: qrCode.vehicle.registration,
      nickname: qrCode.vehicle.nickname,
      vehicleType: qrCode.vehicle.vehicleType,
      brand: qrCode.vehicle.brand,
      model: qrCode.vehicle.model,
      fuelType: qrCode.vehicle.fuelType,
      color: qrCode.vehicle.color,
    },
    emergencyContacts: qrCode.emergencyContacts.map((c) => ({ name: c.name, role: c.role })),
  });
});

const verifySchema = z.object({
  last4: z.string().length(4),
});

qrCodesRouter.post('/:code/verify', async (req, res) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const qrCode = await prisma.qrCode.findUnique({
    where: { code: req.params.code },
    include: {
      vehicle: { include: { user: { select: { fullName: true, mobileNumber: true } } } },
      emergencyContacts: true,
    },
  });

  if (!qrCode || qrCode.status !== 'ACTIVE' || !qrCode.vehicle) {
    return res.status(404).json({ error: 'This QR code is not active' });
  }

  const last4 = qrCode.vehicle.registration.slice(-4).toUpperCase();
  if (last4 !== parsed.data.last4.toUpperCase()) {
    return res.status(400).json({ error: 'Incorrect digits. Please try again.' });
  }

  res.json({
    owner: { fullName: qrCode.vehicle.user.fullName, mobileNumber: qrCode.vehicle.user.mobileNumber },
    vehicle: {
      registration: qrCode.vehicle.registration,
      nickname: qrCode.vehicle.nickname,
      vehicleType: qrCode.vehicle.vehicleType,
      brand: qrCode.vehicle.brand,
      model: qrCode.vehicle.model,
      fuelType: qrCode.vehicle.fuelType,
      color: qrCode.vehicle.color,
    },
    emergencyContacts: qrCode.emergencyContacts.map((c) => ({ name: c.name, role: c.role, phone: c.phone })),
  });
});

const maskedCallSchema = z.object({
  last4: z.string().length(4),
  callerPhone: z.string().min(6).max(20),
  target: z.union([
    z.object({ kind: z.literal('owner') }),
    z.object({ kind: z.literal('contact'), index: z.number().int().min(0) }),
  ]),
});

/**
 * Re-verifies the last-4 digits (never trust a client-held verification
 * result across a second request) and logs a masked-call setup request —
 * this is the same target-number lookup as /verify, but also records the
 * caller's own phone number so a future Knowlarity SR-number / click-to-call
 * integration has a real request to act on. Until that's wired up,
 * `virtualNumber` is null and the frontend falls back to dialing the real
 * destination number directly.
 */
qrCodesRouter.post('/:code/masked-call', async (req, res) => {
  const parsed = maskedCallSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const qrCode = await prisma.qrCode.findUnique({
    where: { code: req.params.code },
    include: {
      vehicle: { include: { user: { select: { fullName: true, mobileNumber: true } } } },
      emergencyContacts: true,
    },
  });

  if (!qrCode || qrCode.status !== 'ACTIVE' || !qrCode.vehicle) {
    return res.status(404).json({ error: 'This QR code is not active' });
  }

  const last4 = qrCode.vehicle.registration.slice(-4).toUpperCase();
  if (last4 !== parsed.data.last4.toUpperCase()) {
    return res.status(400).json({ error: 'Incorrect digits. Please try again.' });
  }

  const { target } = parsed.data;
  const destinationPhone =
    target.kind === 'owner' ? qrCode.vehicle.user.mobileNumber : qrCode.emergencyContacts[target.index]?.phone;

  if (!destinationPhone) {
    return res.status(404).json({ error: 'No phone number available for this contact.' });
  }

  await prisma.maskedCallRequest.create({
    data: {
      qrCodeId: qrCode.id,
      targetKind: target.kind,
      targetIndex: target.kind === 'contact' ? target.index : null,
      callerPhone: parsed.data.callerPhone,
      // virtualNumber intentionally left null until Knowlarity (or another
      // masking provider) is connected — see model doc comment.
    },
  });

  res.json({
    // TODO: replace with the Knowlarity SR/virtual number once that
    // integration is wired up; falls back to the real number for now.
    virtualNumber: destinationPhone,
    isMasked: false,
    // Included explicitly (not just folded into virtualNumber) so whoever
    // wires up Knowlarity has both legs of the bridge — callerPhone (from
    // the request) and destinationPhone — without having to look anything
    // else up to create the actual masked-call/click-to-call request.
    destinationPhone,
    callerPhone: parsed.data.callerPhone,
  });
});

const activateSchema = z.object({
  personal: z.object({
    fullName: z.string().min(1).max(120),
  }),
  emergencyContacts: z
    .array(
      z.discriminatedUnion('kind', [
        z.object({ kind: z.literal('existing'), id: z.string().uuid() }),
        z.object({
          kind: z.literal('new'),
          name: z.string().min(1).max(120),
          phone: z.string().min(6).max(20),
          role: z.string().max(120).optional(),
          email: z.string().email().optional(),
        }),
      ]),
    )
    .min(1),
  vehicleId: z.string().uuid().optional(),
  vehicle: z
    .object({
      registration: z.string().min(1).max(30),
      nickname: z.string().min(1).max(60),
      vehicleType: z.string().min(1).max(40),
      brand: z.string().min(1).max(60),
      model: z.string().min(1).max(60),
      fuelType: z.string().min(1).max(30),
      color: z.string().min(1).max(30),
    })
    .optional(),
});

qrCodesRouter.post('/:code/activate', requireAuth, async (req, res) => {
  const parsed = activateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  if (!parsed.data.vehicleId && !parsed.data.vehicle) {
    return res.status(400).json({ error: 'Select an existing vehicle or provide new vehicle details' });
  }

  const qrCode = await prisma.qrCode.findUnique({ where: { code: req.params.code } });
  if (!qrCode) {
    return res.status(404).json({ error: 'This QR code is not recognized' });
  }
  if (qrCode.status === 'DISABLED') {
    return res.status(409).json({ error: 'This QR code has been disabled. Please contact support.' });
  }
  if (qrCode.status !== 'INACTIVE') {
    return res.status(409).json({ error: 'This QR code has already been activated' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: req.user!.id },
        data: { fullName: parsed.data.personal.fullName },
      });

      let vehicleId: string;
      if (parsed.data.vehicleId) {
        const existing = await tx.vehicle.findUnique({
          where: { id: parsed.data.vehicleId },
          include: { qrCodeRecord: true },
        });
        if (!existing || existing.userId !== req.user!.id) {
          throw new Error('VEHICLE_NOT_FOUND');
        }
        if (existing.qrCodeRecord) {
          throw new Error('VEHICLE_ALREADY_LINKED');
        }
        vehicleId = existing.id;
      } else {
        const v = parsed.data.vehicle!;
        const created = await tx.vehicle.create({
          data: {
            userId: req.user!.id,
            registration: v.registration,
            nickname: v.nickname,
            vehicleType: v.vehicleType,
            brand: v.brand,
            model: v.model,
            fuelType: v.fuelType,
            color: v.color,
          },
        });
        vehicleId = created.id;
      }

      const contactIds: string[] = [];
      for (const entry of parsed.data.emergencyContacts) {
        if (entry.kind === 'new') {
          const created = await tx.emergencyContact.create({
            data: {
              userId: req.user!.id,
              name: entry.name,
              phone: entry.phone,
              role: entry.role,
              email: entry.email,
            },
          });
          contactIds.push(created.id);
        } else {
          const existing = await tx.emergencyContact.findUnique({ where: { id: entry.id } });
          if (!existing || existing.userId !== req.user!.id) {
            throw new Error('CONTACT_NOT_FOUND');
          }
          contactIds.push(existing.id);
        }
      }

      const updated = await tx.qrCode.update({
        where: { id: qrCode.id },
        data: {
          status: 'ACTIVE',
          vehicleId,
          activatedAt: new Date(),
          emergencyContacts: { connect: contactIds.map((id) => ({ id })) },
        },
        include: {
          vehicle: { include: { user: { select: { fullName: true, mobileNumber: true } } } },
          emergencyContacts: true,
        },
      });

      return updated;
    });

    res.json({
      owner: { fullName: result.vehicle!.user.fullName, mobileNumber: result.vehicle!.user.mobileNumber },
      vehicle: {
        registration: result.vehicle!.registration,
        nickname: result.vehicle!.nickname,
        vehicleType: result.vehicle!.vehicleType,
        brand: result.vehicle!.brand,
        model: result.vehicle!.model,
        fuelType: result.vehicle!.fuelType,
        color: result.vehicle!.color,
      },
      emergencyContacts: result.emergencyContacts.map((c) => ({ name: c.name, role: c.role, phone: c.phone })),
    });
  } catch (err) {
    if (err instanceof Error && err.message === 'VEHICLE_NOT_FOUND') {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    if (err instanceof Error && err.message === 'VEHICLE_ALREADY_LINKED') {
      return res.status(409).json({ error: 'This vehicle is already linked to another QR code' });
    }
    if (err instanceof Error && err.message === 'CONTACT_NOT_FOUND') {
      return res.status(404).json({ error: 'Emergency contact not found' });
    }
    throw err;
  }
});
