import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

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
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { emailVerified: true } }),
    prisma.user.count({ where: { mobileVerified: true } }),
    prisma.vehicle.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: 'PAID' } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.order.count({ where: { status: 'FAILED' } }),
    prisma.order.aggregate({ where: { status: 'PAID' }, _sum: { totalInPaise: true } }),
    prisma.user.count({ where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } }),
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
  });
});

adminRouter.get('/users', async (req, res) => {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const pageSize = Math.min(100, Number(req.query.pageSize ?? 25));
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;

  const where = search
    ? {
        OR: [
          { email: { contains: search, mode: 'insensitive' as const } },
          { fullName: { contains: search, mode: 'insensitive' as const } },
          { mobileNumber: { contains: search } },
        ],
      }
    : {};

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
      include: { user: { select: { fullName: true, email: true, mobileNumber: true } }, items: { include: { product: true } } },
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
