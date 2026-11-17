import { Router, type Request, type RequestHandler, type Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { env } from '../lib/env.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { isKnowlarityConfigured, listAccountNumbers } from '../lib/knowlarity.js';
import { formatDisplayId } from './qrCodes.js';

/**
 * Live admin insight pages, all computed from real data:
 *   /api/admin/analytics/qr   QR Analytics (scans, devices, activations, contact requests)
 *   /api/admin/calls          Call Logs (Knowlarity CDRs + masked-call requests)
 *   /api/admin/ivr            IVR Numbers (Knowlarity account numbers, usage, on/off switch)
 */
const safe =
  (fn: (req: Request, res: Response) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    fn(req, res).catch(next);
  };

export const adminAnalyticsRouter = Router();
export const adminCallsRouter = Router();
export const adminIvrRouter = Router();
for (const r of [adminAnalyticsRouter, adminCallsRouter, adminIvrRouter]) r.use(requireAuth, requireAdmin);

const IST_MS = 5.5 * 60 * 60 * 1000;
const istDay = (d: Date) => new Date(d.getTime() + IST_MS).toISOString().slice(0, 10);

// ======================================================= QR analytics

adminAnalyticsRouter.get('/qr', safe(async (req, res) => {
  const days = [7, 30, 90].includes(Number(req.query.days)) ? Number(req.query.days) : 30;

  // Day buckets are Indian calendar days, oldest first, ending today.
  const keys: string[] = [];
  for (let i = days - 1; i >= 0; i--) keys.push(istDay(new Date(Date.now() - i * 86_400_000)));
  const since = new Date(new Date(`${keys[0]}T00:00:00.000Z`).getTime() - IST_MS);

  type DayRow = { d: string; c: number };
  const perDay = (rows: DayRow[]) => new Map(rows.map((r) => [r.d, r.c]));

  const [
    byStatus, scansTotal, firstScan, scanRows, requestRows, activationRows, uniqueRows, deviceRows, osRows, topRows,
    contactRequests, batchRows, cityRows,
  ] = await Promise.all([
    prisma.qrCode.groupBy({ by: ['status'], where: { deletedAt: null }, _count: { _all: true } }),
    prisma.qrScan.count(),
    prisma.qrScan.findFirst({ orderBy: { createdAt: 'asc' }, select: { createdAt: true } }),
    prisma.$queryRaw<DayRow[]>`SELECT to_char("createdAt" AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD') AS d, count(*)::int AS c FROM "QrScan" WHERE "createdAt" >= ${since} GROUP BY 1`,
    prisma.$queryRaw<DayRow[]>`SELECT to_char("createdAt" AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD') AS d, count(*)::int AS c FROM "MaskedCallRequest" WHERE "createdAt" >= ${since} GROUP BY 1`,
    prisma.$queryRaw<DayRow[]>`SELECT to_char("activatedAt" AT TIME ZONE 'Asia/Kolkata', 'YYYY-MM-DD') AS d, count(*)::int AS c FROM "QrCode" WHERE "activatedAt" >= ${since} AND "deletedAt" IS NULL GROUP BY 1`,
    prisma.$queryRaw<{ c: number }[]>`SELECT count(DISTINCT "qrCodeId")::int AS c FROM "QrScan" WHERE "createdAt" >= ${since}`,
    prisma.qrScan.groupBy({ by: ['device'], where: { createdAt: { gte: since } }, _count: { _all: true } }),
    prisma.qrScan.groupBy({ by: ['os'], where: { createdAt: { gte: since } }, _count: { _all: true } }),
    prisma.qrScan.groupBy({ by: ['qrCodeId'], where: { createdAt: { gte: since } }, _count: { _all: true }, orderBy: { _count: { qrCodeId: 'desc' } }, take: 10 }),
    prisma.maskedCallRequest.count({ where: { createdAt: { gte: since } } }),
    prisma.qrCode.groupBy({ by: ['batchName', 'status'], where: { deletedAt: null }, _count: { _all: true } }),
    prisma.order.groupBy({ by: ['shippingCity'], where: { status: 'PAID', shippingCity: { not: null } }, _count: { _all: true }, orderBy: { _count: { shippingCity: 'desc' } }, take: 8 }),
  ]);

  const scanMap = perDay(scanRows);
  const reqMap = perDay(requestRows);
  const actMap = perDay(activationRows);
  const daily = keys.map((date) => ({ date, scans: scanMap.get(date) ?? 0, requests: reqMap.get(date) ?? 0, activations: actMap.get(date) ?? 0 }));
  const sum = (k: 'scans' | 'requests' | 'activations') => daily.reduce((a, d) => a + d[k], 0);

  const statusCount = (s: string) => byStatus.find((x) => x.status === s)?._count._all ?? 0;
  const codes = byStatus.reduce((a, x) => a + x._count._all, 0);

  const topCodeRows = await prisma.qrCode.findMany({
    where: { id: { in: topRows.map((t) => t.qrCodeId) } },
    select: { id: true, batchName: true, batchSeq: true, status: true, vehicle: { select: { registration: true, nickname: true } } },
  });
  const topCodes = topRows.map((t) => {
    const c = topCodeRows.find((x) => x.id === t.qrCodeId);
    return {
      displayId: c ? formatDisplayId(c.batchName, c.batchSeq) : '—',
      registration: c?.vehicle?.registration ?? null,
      nickname: c?.vehicle?.nickname ?? null,
      status: c?.status ?? null,
      scans: t._count._all,
    };
  });

  const batches = new Map<string, { batchName: string; total: number; active: number }>();
  for (const r of batchRows) {
    const b = batches.get(r.batchName) ?? { batchName: r.batchName, total: 0, active: 0 };
    b.total += r._count._all;
    if (r.status === 'ACTIVE') b.active += r._count._all;
    batches.set(r.batchName, b);
  }

  const scans = sum('scans');
  res.json({
    days,
    trackingSince: firstScan?.createdAt ?? null,
    totals: {
      codes,
      active: statusCount('ACTIVE'),
      inactive: statusCount('INACTIVE'),
      disabled: statusCount('DISABLED'),
      scansAllTime: scansTotal,
      scans,
      uniqueScanned: uniqueRows[0]?.c ?? 0,
      activations: sum('activations'),
      contactRequests,
      contactRate: scans > 0 ? Math.round((contactRequests / scans) * 1000) / 10 : null,
    },
    daily,
    devices: deviceRows.map((d) => ({ label: d.device, count: d._count._all })).sort((a, b) => b.count - a.count),
    os: osRows.map((d) => ({ label: d.os ?? 'Unknown', count: d._count._all })).sort((a, b) => b.count - a.count),
    topCodes,
    topCities: cityRows.map((c) => ({ city: c.shippingCity!, orders: c._count._all })),
    batches: [...batches.values()]
      .map((b) => ({ ...b, activationRate: b.total ? Math.round((b.active / b.total) * 100) : 0 }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10),
  });
}));

// ============================================================ call logs

const callsQuery = z.object({
  q: z.string().trim().max(60).optional(),
  status: z.string().trim().max(40).optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(5).max(100).default(25),
});

adminCallsRouter.get('/', safe(async (req, res) => {
  const parsed = callsQuery.safeParse(req.query);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid filters' });
  const { q, status, from, to, page, pageSize } = parsed.data;

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (from || to) where.createdAt = { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) };
  if (q) {
    const digits = q.replace(/[^\d+]/g, '') || q;
    where.OR = [
      { callerNumber: { contains: digits } },
      { destinationNumber: { contains: digits } },
      { providerCallId: { contains: q, mode: 'insensitive' } },
    ];
  }

  const startOfToday = new Date(new Date(`${istDay(new Date())}T00:00:00.000Z`).getTime() - IST_MS);
  const [rows, total, all, talked, agg, today, week, statuses] = await Promise.all([
    prisma.callLog.findMany({
      where,
      orderBy: [{ startedAt: { sort: 'desc', nulls: 'last' } }, { createdAt: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        maskedCallRequest: {
          select: { targetKind: true, virtualNumber: true, qrCode: { select: { batchName: true, batchSeq: true, vehicle: { select: { registration: true, nickname: true } } } } },
        },
      },
    }),
    prisma.callLog.count({ where }),
    prisma.callLog.count(),
    prisma.callLog.count({ where: { durationSeconds: { gt: 0 } } }),
    prisma.callLog.aggregate({ where: { durationSeconds: { gt: 0 } }, _avg: { durationSeconds: true }, _sum: { durationSeconds: true } }),
    prisma.callLog.count({ where: { createdAt: { gte: startOfToday } } }),
    prisma.callLog.count({ where: { createdAt: { gte: new Date(Date.now() - 7 * 86_400_000) } } }),
    prisma.callLog.groupBy({ by: ['status'], _count: { _all: true }, orderBy: { _count: { status: 'desc' } } }),
  ]);

  res.json({
    calls: rows.map((c) => {
      const qr = c.maskedCallRequest?.qrCode;
      return {
        id: c.id,
        callerNumber: c.callerNumber,
        destinationNumber: c.destinationNumber,
        status: c.status,
        durationSeconds: c.durationSeconds,
        startedAt: c.startedAt,
        createdAt: c.createdAt,
        providerCallId: c.providerCallId,
        targetKind: c.maskedCallRequest?.targetKind ?? null,
        virtualNumber: c.maskedCallRequest?.virtualNumber ?? null,
        qrDisplayId: qr ? formatDisplayId(qr.batchName, qr.batchSeq) : null,
        registration: qr?.vehicle?.registration ?? null,
        rawPayload: c.rawPayload,
      };
    }),
    total,
    page,
    pageSize,
    statuses: statuses.map((s) => ({ status: s.status ?? 'Unknown', count: s._count._all })),
    stats: {
      total: all,
      talked,
      avgSeconds: Math.round(agg._avg.durationSeconds ?? 0),
      totalMinutes: Math.round((agg._sum.durationSeconds ?? 0) / 60),
      today,
      week,
    },
  });
}));

adminCallsRouter.get('/requests', safe(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = 25;
  const [rows, total] = await Promise.all([
    prisma.maskedCallRequest.findMany({
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        _count: { select: { callLogs: true } },
        qrCode: { select: { batchName: true, batchSeq: true, vehicle: { select: { registration: true } } } },
      },
    }),
    prisma.maskedCallRequest.count(),
  ]);
  res.json({
    requests: rows.map((r) => ({
      id: r.id,
      callerPhone: r.callerPhone,
      targetKind: r.targetKind,
      virtualNumber: r.virtualNumber,
      createdAt: r.createdAt,
      qrDisplayId: formatDisplayId(r.qrCode.batchName, r.qrCode.batchSeq),
      registration: r.qrCode.vehicle?.registration ?? null,
      connected: r._count.callLogs > 0,
    })),
    total,
    page,
    pageSize,
  });
}));

// ========================================================== IVR numbers

adminIvrRouter.get('/', safe(async (req, res) => {
  const configured = isKnowlarityConfigured();
  const override = env.knowlarity.maskedNumbers;
  let account: Awaited<ReturnType<typeof listAccountNumbers>> = [];
  let error: string | null = null;
  if (env.knowlarity.apiKey && env.knowlarity.srApiKey) {
    try {
      account = await listAccountNumbers(req.query.refresh === '1');
    } catch (err) {
      error = err instanceof Error ? err.message : String(err);
    }
  }

  const [settings, usageAll, usage30] = await Promise.all([
    prisma.ivrNumberSetting.findMany(),
    prisma.maskedCallRequest.groupBy({ by: ['virtualNumber'], where: { virtualNumber: { not: null } }, _count: { _all: true }, _max: { createdAt: true } }),
    prisma.maskedCallRequest.groupBy({ by: ['virtualNumber'], where: { virtualNumber: { not: null }, createdAt: { gte: new Date(Date.now() - 30 * 86_400_000) } }, _count: { _all: true } }),
  ]);

  type Row = { number: string; source: 'account' | 'env' | 'history'; dialable: boolean; expired: boolean; type: string };
  const rows = new Map<string, Row>();
  for (const n of account) {
    rows.set(n.number, {
      number: n.number, source: 'account', dialable: n.dialable, expired: n.isExpired,
      type: n.numberType === '1' ? 'Inbound (SR) number' : n.cliType === 'OUTGOING' ? 'Outbound caller ID' : 'Other',
    });
  }
  const envE164 = override.map((n) => (n.startsWith('+') ? n : `+91${n.replace(/\D/g, '').slice(-10)}`));
  for (const e164 of envE164) {
    if (!rows.has(e164)) rows.set(e164, { number: e164, source: 'env', dialable: true, expired: false, type: 'Allow-listed in server settings' });
  }
  for (const u of usageAll) {
    if (u.virtualNumber && !rows.has(u.virtualNumber)) {
      rows.set(u.virtualNumber, { number: u.virtualNumber, source: 'history', dialable: false, expired: false, type: 'Used before, no longer on the account' });
    }
  }

  const numbers = [...rows.values()]
    .map((r) => {
      const s = settings.find((x) => x.phoneNumber === r.number);
      const all = usageAll.find((x) => x.virtualNumber === r.number);
      const recent = usage30.find((x) => x.virtualNumber === r.number);
      const enabled = s?.enabled ?? true;
      return {
        ...r,
        label: s?.label ?? null,
        enabled,
        // With a server allow-list set, only those numbers are handed out.
        inRotation: r.dialable && enabled && (envE164.length === 0 || envE164.includes(r.number)),
        requestsTotal: all?._count._all ?? 0,
        requests30d: recent?._count._all ?? 0,
        lastUsedAt: all?._max.createdAt ?? null,
      };
    })
    .sort((a, b) => Number(b.inRotation) - Number(a.inRotation) || b.requests30d - a.requests30d);

  res.json({
    provider: {
      name: 'Knowlarity',
      configured,
      channel: env.knowlarity.channel,
      usingAllowList: override.length > 0,
      reachable: error === null,
      error,
    },
    numbers,
    inRotation: numbers.filter((n) => n.inRotation).length,
  });
}));

const settingSchema = z.object({
  phoneNumber: z.string().regex(/^\+\d{8,15}$/, 'Use the full number with country code, e.g. +918037121389'),
  label: z.string().trim().max(80).nullable().optional(),
  enabled: z.boolean().optional(),
});

adminIvrRouter.patch('/numbers', safe(async (req, res) => {
  const parsed = settingSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid request' });
  const { phoneNumber, label, enabled } = parsed.data;
  const setting = await prisma.ivrNumberSetting.upsert({
    where: { phoneNumber },
    create: { phoneNumber, label: label || null, enabled: enabled ?? true },
    update: { ...(label !== undefined ? { label: label || null } : {}), ...(enabled !== undefined ? { enabled } : {}) },
  });
  res.json({ setting });
}));
