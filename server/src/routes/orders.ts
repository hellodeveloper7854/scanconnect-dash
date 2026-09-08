import { Router, type Request, type Response } from 'express';
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { razorpay } from '../lib/razorpay.js';
import { env } from '../lib/env.js';
import { requireAuth } from '../middleware/auth.js';

export const ordersRouter = Router();

const NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]{1,79}$/;
const PHONE_PATTERN = /^[6-9]\d{9}$/;
const CITY_PATTERN = /^[A-Za-z][A-Za-z .'-]{1,79}$/;
const PINCODE_PATTERN = /^\d{6}$/;

const shippingSchema = z.object({
  name: z.string().regex(NAME_PATTERN, 'Enter a valid full name (letters only)'),
  phone: z.string().regex(PHONE_PATTERN, 'Enter a valid 10-digit Indian mobile number'),
  city: z.string().regex(CITY_PATTERN, 'Enter a valid city name (letters only)'),
  pincode: z.string().regex(PINCODE_PATTERN, 'Enter a valid 6-digit pincode'),
  address: z.string().trim().min(10, 'Address must be at least 10 characters').max(500),
});

const createOrderSchema = z.object({
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1) })).min(1),
  shipping: shippingSchema,
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

  const { shipping } = parsed.data;
  const order = await prisma.order.create({
    data: {
      userId: req.user!.id,
      totalInPaise,
      items: { create: items },
      shippingName: shipping.name,
      shippingPhone: shipping.phone,
      shippingCity: shipping.city,
      shippingPincode: shipping.pincode,
      shippingAddress: shipping.address,
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
    include: { items: { include: { product: true } }, vehicle: true, emergencyContact: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ orders });
});

const assignSchema = z.object({
  vehicleId: z.string().uuid(),
  emergencyContactId: z.string().uuid(),
});

/**
 * Called on the checkout "Assign" step, once payment has succeeded, to link
 * the paid order to a specific vehicle + emergency contact and generate the
 * QR token that will be printed on the sticker (and shown in My Orders).
 */
ordersRouter.post('/:id/assign', requireAuth, async (req, res) => {
  const parsed = assignSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const order = await prisma.order.findUnique({ where: { id: req.params.id } });
  if (!order || order.userId !== req.user!.id) {
    return res.status(404).json({ error: 'Order not found' });
  }
  if (order.status !== 'PAID') {
    return res.status(400).json({ error: 'Order must be paid before it can be assigned a QR code' });
  }

  const [vehicle, contact] = await Promise.all([
    prisma.vehicle.findUnique({ where: { id: parsed.data.vehicleId } }),
    prisma.emergencyContact.findUnique({ where: { id: parsed.data.emergencyContactId } }),
  ]);
  if (!vehicle || vehicle.userId !== req.user!.id) {
    return res.status(404).json({ error: 'Vehicle not found' });
  }
  if (!contact || contact.userId !== req.user!.id) {
    return res.status(404).json({ error: 'Emergency contact not found' });
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      vehicleId: vehicle.id,
      emergencyContactId: contact.id,
      qrToken: order.qrToken ?? randomBytes(16).toString('hex'),
    },
    include: { items: { include: { product: true } }, vehicle: true, emergencyContact: true },
  });

  res.json({ order: updated });
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
