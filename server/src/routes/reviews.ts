import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

export const reviewsRouter = Router();

const createReviewSchema = z.object({
  orderId: z.string().uuid(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(2000).optional(),
});

reviewsRouter.post('/', requireAuth, async (req, res) => {
  const parsed = createReviewSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const order = await prisma.order.findUnique({ where: { id: parsed.data.orderId } });
  if (!order || order.userId !== req.user!.id) {
    return res.status(404).json({ error: 'Order not found' });
  }
  if (order.status !== 'PAID') {
    return res.status(400).json({ error: 'Only paid orders can be reviewed' });
  }

  try {
    const review = await prisma.review.create({
      data: {
        orderId: parsed.data.orderId,
        userId: req.user!.id,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      },
    });
    res.status(201).json({ review });
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      return res.status(409).json({ error: 'This order has already been reviewed' });
    }
    throw err;
  }
});

/**
 * Public list of real verified-buyer reviews (one per paid order), newest first,
 * with the true count and average. The reviewer is shown as first name + last
 * initial only. Powers "View all reviews" in the app.
 */
reviewsRouter.get('/public', async (req, res) => {
  const limit = Math.min(50, Math.max(1, Number(req.query.limit ?? 10)));
  const offset = Math.max(0, Number(req.query.offset ?? 0));

  const [rows, agg] = await Promise.all([
    prisma.review.findMany({
      where: { order: { status: 'PAID' } },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
      include: {
        user: { select: { fullName: true } },
        order: { select: { items: { select: { product: { select: { name: true } } } } } },
      },
    }),
    prisma.review.aggregate({ where: { order: { status: 'PAID' } }, _count: { _all: true }, _avg: { rating: true } }),
  ]);

  const displayName = (full: string) => {
    const parts = full.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'Customer';
    return parts.length === 1 ? parts[0] : `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
  };

  res.json({
    count: agg._count._all,
    average: agg._avg.rating == null ? null : Math.round(agg._avg.rating * 10) / 10,
    reviews: rows.map((r) => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt,
      reviewer: displayName(r.user.fullName),
      products: [...new Set(r.order.items.map((i) => i.product.name))],
    })),
    hasMore: offset + rows.length < agg._count._all,
  });
});
