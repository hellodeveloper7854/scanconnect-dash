import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { toCsv } from '../lib/csv.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

const NON_ADMIN = { role: { not: 'ADMIN' as const } };

adminRouter.get('/stats', async (_req, res) => {
  const [
    totalUsers,
    verifiedEmailUsers,
    linkedMobileUsers,
    totalVehicles,
    totalOrders,
    paidOrders,
    pendingOrders,
    failedOrders,
    revenueAgg,
    usersLast30Days,
    totalReviews,
    avgRatingAgg,
    totalSosAlerts,
    activeSosAlerts,
  ] = await Promise.all([
    prisma.user.count({ where: NON_ADMIN }),
    prisma.user.count({ where: { ...NON_ADMIN, emailVerified: true } }),
    prisma.user.count({ where: { ...NON_ADMIN, mobileVerified: true } }),
    prisma.vehicle.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PAID' } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'FAILED' } }),
    prisma.order.aggregate({ where: { status: 'PAID' }, _sum: { totalInPaise: true } }),
    prisma.user.count({
      where: { ...NON_ADMIN, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    }),
    prisma.review.count(),
    prisma.review.aggregate({ _avg: { rating: true } }),
    prisma.sosAlert.count(),
    prisma.sosAlert.count({ where: { status: 'ACTIVE' } }),
  ]);

  res.json({
    users: {
      total: totalUsers,
      emailVerified: verifiedEmailUsers,
      mobileLinked: linkedMobileUsers,
      newLast30Days: usersLast30Days,
    },
    vehicles: { total: totalVehicles },
    orders: {
      total: totalOrders,
      paid: paidOrders,
      pending: pendingOrders,
      failed: failedOrders,
      revenueInPaise: revenueAgg._sum.totalInPaise ?? 0,
    },
    reviews: {
      total: totalReviews,
      averageRating: avgRatingAgg._avg.rating ?? 0,
    },
    sosAlerts: {
      total: totalSosAlerts,
      active: activeSosAlerts,
    },
  });
});

adminRouter.get('/users', async (req, res) => {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const pageSize = Math.min(100, Number(req.query.pageSize ?? 25));
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;

  const where = {
    ...NON_ADMIN,
    ...(search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { fullName: { contains: search, mode: 'insensitive' as const } },
            { mobileNumber: { contains: search } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.user.count({ where }),
  ]);

  res.json({ users, total, page, pageSize });
});

const orderStatusSchema = z.object({
  status: z.enum(['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED']),
});

adminRouter.get('/orders', async (req, res) => {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const pageSize = Math.min(100, Number(req.query.pageSize ?? 25));
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;

  const where = status ? { status: status as never } : {};

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { fullName: true, email: true, mobileNumber: true } },
        items: { include: { product: true } },
        vehicle: true,
        emergencyContact: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
  ]);

  res.json({ orders, total, page, pageSize });
});

adminRouter.patch('/orders/:id/status', async (req, res) => {
  const parsed = orderStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const order = await prisma.order.update({
    where: { id: req.params.id },
    data: { status: parsed.data.status },
  });

  res.json({ order });
});

const suspendSchema = z.object({ isSuspended: z.boolean() });

adminRouter.patch('/users/:id/suspend', async (req, res) => {
  const parsed = suspendSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const target = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!target || target.role === 'ADMIN') {
    return res.status(404).json({ error: 'User not found' });
  }

  const user = await prisma.user.update({
    where: { id: req.params.id },
    data: { isSuspended: parsed.data.isSuspended },
  });

  res.json({ user });
});

adminRouter.get('/vehicles', async (req, res) => {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const pageSize = Math.min(100, Number(req.query.pageSize ?? 25));
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;

  const where = search
    ? {
        OR: [
          { registration: { contains: search, mode: 'insensitive' as const } },
          { qrCode: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {};

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      include: { user: { select: { fullName: true, email: true, mobileNumber: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.vehicle.count({ where }),
  ]);

  res.json({ vehicles, total, page, pageSize });
});

adminRouter.delete('/vehicles/:id', async (req, res) => {
  await prisma.vehicle.delete({ where: { id: req.params.id } });
  res.json({ ok: true });
});

adminRouter.get('/payments', async (req, res) => {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const pageSize = Math.min(100, Number(req.query.pageSize ?? 25));
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;

  const where = status ? { status: status as never } : {};

  const [payments, total, revenueAgg, refundedAgg] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { user: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.order.count({ where }),
    prisma.order.aggregate({ where: { status: 'PAID' }, _sum: { totalInPaise: true } }),
    prisma.order.aggregate({ where: { status: 'REFUNDED' }, _sum: { totalInPaise: true } }),
  ]);

  res.json({
    payments,
    total,
    page,
    pageSize,
    summary: {
      totalRevenueInPaise: revenueAgg._sum.totalInPaise ?? 0,
      totalRefundedInPaise: refundedAgg._sum.totalInPaise ?? 0,
    },
  });
});

adminRouter.get('/emergency-contacts', async (req, res) => {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const pageSize = Math.min(100, Number(req.query.pageSize ?? 25));

  const [contacts, total] = await Promise.all([
    prisma.emergencyContact.findMany({
      include: { user: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.emergencyContact.count(),
  ]);

  res.json({ contacts, total, page, pageSize });
});

adminRouter.get('/reviews', async (req, res) => {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const pageSize = Math.min(100, Number(req.query.pageSize ?? 25));

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      include: {
        user: { select: { fullName: true, email: true } },
        order: { select: { id: true, totalInPaise: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.review.count(),
  ]);

  res.json({ reviews, total, page, pageSize });
});

const sosStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'RESOLVED']),
});

adminRouter.get('/sos-alerts', async (req, res) => {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const pageSize = Math.min(100, Number(req.query.pageSize ?? 25));
  const status = typeof req.query.status === 'string' ? req.query.status : undefined;

  const where = status ? { status: status as never } : {};

  const [alerts, total] = await Promise.all([
    prisma.sosAlert.findMany({
      where,
      include: { user: { select: { fullName: true, email: true, mobileNumber: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.sosAlert.count({ where }),
  ]);

  res.json({ alerts, total, page, pageSize });
});

adminRouter.patch('/sos-alerts/:id/status', async (req, res) => {
  const parsed = sosStatusSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const alert = await prisma.sosAlert.update({
    where: { id: req.params.id },
    data: {
      status: parsed.data.status,
      resolvedAt: parsed.data.status === 'RESOLVED' ? new Date() : null,
    },
  });

  res.json({ alert });
});

function sendCsv(res: import('express').Response, filename: string, csv: string) {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.send(csv);
}

adminRouter.get('/reports/users.csv', async (_req, res) => {
  const users = await prisma.user.findMany({ where: NON_ADMIN, orderBy: { createdAt: 'desc' } });
  const csv = toCsv(users, [
    'id',
    'fullName',
    'email',
    'emailVerified',
    'mobileNumber',
    'mobileVerified',
    'isSuspended',
    'createdAt',
  ]);
  sendCsv(res, 'users.csv', csv);
});

adminRouter.get('/reports/orders.csv', async (_req, res) => {
  const orders = await prisma.order.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  const rows = orders.map((o) => ({
    id: o.id,
    userEmail: o.user.email,
    status: o.status,
    totalInPaise: o.totalInPaise,
    razorpayOrderId: o.razorpayOrderId,
    razorpayPaymentId: o.razorpayPaymentId,
    createdAt: o.createdAt.toISOString(),
  }));
  const csv = toCsv(rows, ['id', 'userEmail', 'status', 'totalInPaise', 'razorpayOrderId', 'razorpayPaymentId', 'createdAt']);
  sendCsv(res, 'orders.csv', csv);
});

adminRouter.get('/reports/reviews.csv', async (_req, res) => {
  const reviews = await prisma.review.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: 'desc' },
  });
  const rows = reviews.map((r) => ({
    id: r.id,
    userEmail: r.user.email,
    orderId: r.orderId,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.createdAt.toISOString(),
  }));
  const csv = toCsv(rows, ['id', 'userEmail', 'orderId', 'rating', 'comment', 'createdAt']);
  sendCsv(res, 'reviews.csv', csv);
});
