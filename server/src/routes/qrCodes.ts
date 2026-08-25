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
  const rows: { id: string; code: string }[] = candidates.map((code) => ({ id: randomUUID(), code }));

  // Insert with a retry loop in case of a (statistically negligible) unique
  // collision against codes already present in the database.
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await prisma.qrCode.createMany({
        data: rows.map((r) => ({ id: r.id, code: r.code, batchId, batchName: name, batchCreatedAt })),
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

function buildQrCodeWhere(query: Record<string, unknown>): Prisma.QrCodeWhereInput {
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

  return {
    ...(status ? { status: status as never } : {}),
    ...(batchId ? { batchId } : {}),
    ...(name ? { batchName: { contains: name, mode: 'insensitive' } } : {}),
    ...createdAtFilter,
  };
}

adminQrCodesRouter.get('/', async (req, res) => {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const pageSize = Math.min(MAX_ADMIN_PAGE_SIZE, Number(req.query.pageSize ?? 25));
  const where = buildQrCodeWhere(req.query as Record<string, unknown>);

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
      _count: { _all: true },
      orderBy: { batchCreatedAt: 'desc' },
    }),
  ]);

  const activatedCounts = await prisma.qrCode.groupBy({
    by: ['batchId'],
    where: { status: 'ACTIVE' },
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
    where: { batchId: req.params.batchId },
    orderBy: { createdAt: 'asc' },
  });
  if (codes.length === 0) {
    return res.status(404).json({ error: 'Batch not found' });
  }

  const rows = codes.map((c) => ({
    code: c.code,
    url: `${env.corsOrigin}/qr/${c.code}`,
    status: c.status,
    createdAt: c.createdAt.toISOString(),
  }));
  const csv = toCsv(rows, ['code', 'url', 'status', 'createdAt']);

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
  const where = buildQrCodeWhere(req.query as Record<string, unknown>);

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
