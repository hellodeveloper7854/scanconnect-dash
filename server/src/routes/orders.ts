import { Router, type Request, type Response } from 'express';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { razorpay } from '../lib/razorpay.js';
import { env } from '../lib/env.js';
import { requireAuth } from '../middleware/auth.js';

export const ordersRouter = Router();

const createOrderSchema = z.object({
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1) })).min(1),
});

ordersRouter.post('/', requireAuth, async (req, res) => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const productIds = parsed.data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } });
  if (products.length !== productIds.length) {
    return res.status(400).json({ error: 'One or more products are invalid or unavailable' });
  }

  const productById = new Map(products.map((p) => [p.id, p]));
  const items = parsed.data.items.map((item) => {
    const product = productById.get(item.productId)!;
    return { productId: product.id, quantity: item.quantity, priceInPaise: product.priceInPaise };
  });
  const totalInPaise = items.reduce((sum, i) => sum + i.priceInPaise * i.quantity, 0);

  const order = await prisma.order.create({
    data: {
      userId: req.user!.id,
      totalInPaise,
      items: { create: items },
    },
    include: { items: true },
  });

  const razorpayOrder = await razorpay.orders.create({
    amount: totalInPaise,
    currency: 'INR',
    receipt: order.id,
  });

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { razorpayOrderId: razorpayOrder.id },
  });

  res.status(201).json({
    order: updated,
    razorpayOrderId: razorpayOrder.id,
    razorpayKeyId: env.razorpay.keyId,
    amount: totalInPaise,
    currency: 'INR',
  });
});

const verifySchema = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

ordersRouter.post('/verify', requireAuth, async (req, res) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = parsed.data;

  const expected = createHmac('sha256', env.razorpay.keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');

  const valid =
    expected.length === razorpaySignature.length &&
    timingSafeEqual(Buffer.from(expected), Buffer.from(razorpaySignature));

  if (!valid) {
    return res.status(400).json({ error: 'Payment signature verification failed' });
  }

  const order = await prisma.order.update({
    where: { razorpayOrderId },
    data: { status: 'PAID', razorpayPaymentId, razorpaySignature },
  });

  res.json({ order });
});

ordersRouter.get('/mine', requireAuth, async (req, res) => {
  const orders = await prisma.order.findMany({
    where: { userId: req.user!.id },
    include: { items: { include: { product: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ orders });
});

/**
 * Razorpay server-to-server webhook (independent of the client-side /verify call,
 * so payment status stays correct even if the client never returns after paying).
 * Mounted standalone in index.ts (before express.json()) since it needs the raw
 * request body for HMAC signature verification.
 */
export async function razorpayWebhookHandler(req: Request, res: Response) {
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = req.body as Buffer;
  if (typeof signature !== 'string' || !Buffer.isBuffer(rawBody)) {
    return res.status(400).json({ error: 'Missing signature or body' });
  }

  const expected = createHmac('sha256', env.razorpay.webhookSecret).update(rawBody).digest('hex');
  const valid =
    expected.length === signature.length && timingSafeEqual(Buffer.from(expected), Buffer.from(signature));

  if (!valid) {
    return res.status(400).json({ error: 'Invalid webhook signature' });
  }

  const event = JSON.parse(rawBody.toString('utf8'));

  if (event.event === 'payment.captured') {
    const orderId = event.payload?.payment?.entity?.order_id;
    if (orderId) {
      await prisma.order.updateMany({
        where: { razorpayOrderId: orderId },
        data: { status: 'PAID' },
      });
    }
  } else if (event.event === 'payment.failed') {
    const orderId = event.payload?.payment?.entity?.order_id;
    if (orderId) {
      await prisma.order.updateMany({
        where: { razorpayOrderId: orderId },
        data: { status: 'FAILED' },
      });
    }
  }

  res.json({ received: true });
}
