import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { demoQrScanAnalytics } from '../lib/demo.js';

/**
 * Sections with no backing app infrastructure yet (real QR generation, an
 * IVR provider, a coupon engine wired into checkout, CMS rendering, etc).
 * Full CRUD is available so admins can manage the records, but nothing here
 * drives live app behavior — every response is tagged isDemo: true so the
 * frontend renders a "Demo Data" banner instead of presenting it as live.
 */
export const adminDemoRouter = Router();
adminDemoRouter.use(requireAuth, requireAdmin);

interface CrudModel {
  findMany: (args: any) => Promise<any[]>;
  create: (args: any) => Promise<any>;
  update: (args: any) => Promise<any>;
  delete: (args: any) => Promise<any>;
}

function crudRouter(
  path: string,
  model: CrudModel,
  createSchema: z.ZodSchema,
  updateSchema: z.ZodSchema,
  listKey: string,
  orderBy: Record<string, 'asc' | 'desc'> = { createdAt: 'desc' },
) {
  adminDemoRouter.get(path, async (_req, res) => {
    const items = await model.findMany({ orderBy });
    res.json({ isDemo: true, [listKey]: items });
  });

  adminDemoRouter.post(path, async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const item = await model.create({ data: parsed.data });
    res.status(201).json({ isDemo: true, item });
  });

  adminDemoRouter.patch(`${path}/:id`, async (req, res) => {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const item = await model.update({ where: { id: req.params.id }, data: parsed.data });
    res.json({ isDemo: true, item });
  });

  adminDemoRouter.delete(`${path}/:id`, async (req, res) => {
    await model.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  });
}

adminDemoRouter.get('/qr-analytics', (_req, res) => res.json({ isDemo: true, analytics: demoQrScanAnalytics }));

// Stickers
crudRouter(
  '/stickers',
  prisma.demoStickerOrder,
  z.object({
    vehicleNickname: z.string().min(1),
    status: z.enum(['ORDERED', 'SHIPPED', 'DELIVERED']).default('ORDERED'),
    trackingId: z.string().optional(),
  }),
  z.object({
    vehicleNickname: z.string().min(1).optional(),
    status: z.enum(['ORDERED', 'SHIPPED', 'DELIVERED']).optional(),
    trackingId: z.string().optional(),
  }),
  'stickers',
);

// IVR numbers
crudRouter(
  '/ivr-numbers',
  prisma.demoIvrNumber,
  z.object({
    virtualNumber: z.string().min(1),
    assignedTo: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  }),
  z.object({
    virtualNumber: z.string().min(1).optional(),
    assignedTo: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  }),
  'numbers',
);

// Call logs — read-only demo data, no create/edit (nothing generates real calls yet)
adminDemoRouter.get('/call-logs', async (_req, res) => {
  const calls = await prisma.demoCallLog.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ isDemo: true, calls });
});

// Subscription plans
crudRouter(
  '/subscription-plans',
  prisma.demoSubscriptionPlan,
  z.object({
    name: z.string().min(1),
    priceInPaise: z.number().int().min(0),
    durationDays: z.number().int().min(1),
    features: z.array(z.string()).default([]),
  }),
  z.object({
    name: z.string().min(1).optional(),
    priceInPaise: z.number().int().min(0).optional(),
    durationDays: z.number().int().min(1).optional(),
    features: z.array(z.string()).optional(),
  }),
  'plans',
);

// Coupons
crudRouter(
  '/coupons',
  prisma.demoCoupon,
  z.object({
    code: z.string().min(1).toUpperCase(),
    type: z.enum(['PERCENTAGE', 'FIXED']),
    value: z.number().int().min(1),
    usageLimit: z.number().int().min(1),
    expiresAt: z.coerce.date().optional(),
  }),
  z.object({
    code: z.string().min(1).toUpperCase().optional(),
    type: z.enum(['PERCENTAGE', 'FIXED']).optional(),
    value: z.number().int().min(1).optional(),
    usageLimit: z.number().int().min(1).optional(),
    usedCount: z.number().int().min(0).optional(),
    expiresAt: z.coerce.date().optional(),
  }),
  'coupons',
);

// Notification campaigns
crudRouter(
  '/notifications',
  prisma.demoNotificationCampaign,
  z.object({
    title: z.string().min(1),
    audience: z.string().min(1),
    status: z.enum(['DRAFT', 'SCHEDULED', 'SENT']).default('DRAFT'),
    sentAt: z.coerce.date().optional(),
  }),
  z.object({
    title: z.string().min(1).optional(),
    audience: z.string().min(1).optional(),
    status: z.enum(['DRAFT', 'SCHEDULED', 'SENT']).optional(),
    sentAt: z.coerce.date().optional(),
  }),
  'campaigns',
);

// CMS pages
crudRouter(
  '/cms-pages',
  prisma.demoCmsPage,
  z.object({ title: z.string().min(1), slug: z.string().min(1), content: z.string().default('') }),
  z.object({ title: z.string().min(1).optional(), slug: z.string().min(1).optional(), content: z.string().optional() }),
  'pages',
);

// Banners
crudRouter(
  '/banners',
  prisma.demoBanner,
  z.object({ title: z.string().min(1), placement: z.string().min(1), active: z.boolean().default(true) }),
  z.object({ title: z.string().min(1).optional(), placement: z.string().min(1).optional(), active: z.boolean().optional() }),
  'banners',
);

// FAQs
crudRouter(
  '/faqs',
  prisma.demoFaq,
  z.object({ category: z.string().min(1), question: z.string().min(1), answer: z.string().min(1) }),
  z.object({ category: z.string().min(1).optional(), question: z.string().min(1).optional(), answer: z.string().min(1).optional() }),
  'faqs',
);

// Audit logs — read-only, generated by admin actions in principle, no manual create yet
adminDemoRouter.get('/audit-logs', async (_req, res) => {
  const logs = await prisma.demoAuditLog.findMany({ orderBy: { createdAt: 'desc' } });
  res.json({ isDemo: true, logs });
});

// System config — singleton, edit-only
adminDemoRouter.get('/system-config', async (_req, res) => {
  const config = await prisma.demoSystemConfig.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton' },
    update: {},
  });
  res.json({ isDemo: true, config });
});

const systemConfigSchema = z.object({
  smtpConfigured: z.boolean().optional(),
  smsGatewayConfigured: z.boolean().optional(),
  pushNotificationsConfigured: z.boolean().optional(),
  paymentGatewayConfigured: z.boolean().optional(),
  cloudIvrConfigured: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
  appVersion: z.string().min(1).optional(),
});

adminDemoRouter.patch('/system-config', async (req, res) => {
  const parsed = systemConfigSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }
  const config = await prisma.demoSystemConfig.upsert({
    where: { id: 'singleton' },
    create: { id: 'singleton', ...parsed.data },
    update: parsed.data,
  });
  res.json({ isDemo: true, config });
});
