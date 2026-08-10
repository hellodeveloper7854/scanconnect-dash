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
