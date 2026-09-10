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
  couponCode: z.string().trim().min(1).max(40).optional(),
});

/**
 * Looks up a coupon by code and checks it's usable right now (active, not
 * expired, usage limit not reached, subtotal meets its minimum). Returns the
 * coupon row plus the computed discount for `subtotalInPaise`, or an error
 * string describing why it can't be applied — never throws, so both the
 * order-creation path and the checkout preview endpoint can share this
 * without duplicating the rules (and so the server always recomputes the
 * discount itself instead of trusting a client-sent amount).
 */
async function resolveCouponDiscount(
  code: string,
  subtotalInPaise: number,
): Promise<{ coupon: Awaited<ReturnType<typeof prisma.coupon.findUnique>>; discountInPaise: number } | { error: string }> {
  const coupon = await prisma.coupon.findUnique({ where: { code: code.trim().toUpperCase() } });
  if (!coupon) return { error: 'Invalid coupon code' };
  if (!coupon.isActive) return { error: 'This coupon is no longer active' };
  if (coupon.expiresAt && coupon.expiresAt.getTime() < Date.now()) return { error: 'This coupon has expired' };
  if (coupon.usageLimit != null && coupon.usedCount >= coupon.usageLimit) {
    return { error: 'This coupon has reached its usage limit' };
  }
  if (coupon.minOrderInPaise != null && subtotalInPaise < coupon.minOrderInPaise) {
    return {
      error: `This coupon requires a minimum order of ${(coupon.minOrderInPaise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}`,
    };
  }

  const rawDiscount =
    coupon.type === 'PERCENTAGE'
      ? Math.round((subtotalInPaise * (coupon.percentageValue ?? 0)) / 100)
      : (coupon.fixedValueInPaise ?? 0);
  const discountInPaise = Math.max(0, Math.min(rawDiscount, subtotalInPaise));

  return { coupon, discountInPaise };
}

const pricingItemsSchema = z.object({
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1) })).min(1),
});

/**
 * Lists every coupon currently usable against the given subtotal (active,
 * not expired, usage limit not reached, subtotal meets its minimum) — powers
 * the "available coupons" list shown at checkout, sorted by biggest discount
 * first so the best offer is easy to spot.
 */
ordersRouter.post('/available-coupons', requireAuth, async (req, res) => {
  const parsed = pricingItemsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const productIds = parsed.data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } });
  if (products.length !== productIds.length) {
    return res.status(400).json({ error: 'One or more products are invalid or unavailable' });
  }
  const productById = new Map(products.map((p) => [p.id, p]));
  const subtotalInPaise = parsed.data.items.reduce(
    (sum, item) => sum + productById.get(item.productId)!.priceInPaise * item.quantity,
    0,
  );

  const candidates = await prisma.coupon.findMany({
    where: {
      isActive: true,
      OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
    },
    orderBy: { createdAt: 'desc' },
  });

  const available = candidates
    .filter((c) => c.usageLimit == null || c.usedCount < c.usageLimit)
    .filter((c) => c.minOrderInPaise == null || subtotalInPaise >= c.minOrderInPaise)
    .map((c) => {
      const rawDiscount =
        c.type === 'PERCENTAGE'
          ? Math.round((subtotalInPaise * (c.percentageValue ?? 0)) / 100)
          : (c.fixedValueInPaise ?? 0);
      const discountInPaise = Math.max(0, Math.min(rawDiscount, subtotalInPaise));
      return {
        code: c.code,
        type: c.type,
        percentageValue: c.percentageValue,
        fixedValueInPaise: c.fixedValueInPaise,
        minOrderInPaise: c.minOrderInPaise,
        expiresAt: c.expiresAt,
        discountInPaise,
      };
    })
    .sort((a, b) => b.discountInPaise - a.discountInPaise);

  res.json({ coupons: available });
});

/**
 * Returns the live subtotal for a set of items straight from
 * Product.priceInPaise, so checkout can show a real price instead of a
 * hardcoded placeholder — the same server-side computation POST / uses for
 * the real charge, just without creating an order.
 */
ordersRouter.post('/pricing', requireAuth, async (req, res) => {
  const parsed = pricingItemsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const productIds = parsed.data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } });
  if (products.length !== productIds.length) {
    return res.status(400).json({ error: 'One or more products are invalid or unavailable' });
  }
  const productById = new Map(products.map((p) => [p.id, p]));
  const subtotalInPaise = parsed.data.items.reduce(
    (sum, item) => sum + productById.get(item.productId)!.priceInPaise * item.quantity,
    0,
  );

  res.json({ subtotalInPaise });
});

/**
 * Preview endpoint the checkout page calls as soon as a coupon code is
 * entered, so it can show the discount and new total before payment — purely
 * a preview, the real discount is recalculated again (independently, from
 * scratch) inside POST / when the order is actually created, so nothing here
 * is trusted for the real charge.
 */
const applyCouponSchema = z.object({
  code: z.string().trim().min(1).max(40),
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1) })).min(1),
});

ordersRouter.post('/apply-coupon', requireAuth, async (req, res) => {
  const parsed = applyCouponSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const productIds = parsed.data.items.map((i) => i.productId);
  const products = await prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } });
  if (products.length !== productIds.length) {
    return res.status(400).json({ error: 'One or more products are invalid or unavailable' });
  }
  const productById = new Map(products.map((p) => [p.id, p]));
  const subtotalInPaise = parsed.data.items.reduce(
    (sum, item) => sum + productById.get(item.productId)!.priceInPaise * item.quantity,
    0,
  );

  const result = await resolveCouponDiscount(parsed.data.code, subtotalInPaise);
  if ('error' in result) {
    return res.status(400).json({ error: result.error });
  }

  res.json({
    code: result.coupon!.code,
    subtotalInPaise,
    discountInPaise: result.discountInPaise,
    totalInPaise: subtotalInPaise - result.discountInPaise,
  });
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
  const subtotalInPaise = items.reduce((sum, i) => sum + i.priceInPaise * i.quantity, 0);

  let discountInPaise = 0;
  let couponId: string | null = null;
  let couponCode: string | null = null;
  if (parsed.data.couponCode) {
    const result = await resolveCouponDiscount(parsed.data.couponCode, subtotalInPaise);
    if ('error' in result) {
      return res.status(400).json({ error: result.error });
    }
    discountInPaise = result.discountInPaise;
    couponId = result.coupon!.id;
    couponCode = result.coupon!.code;
  }
  const totalInPaise = subtotalInPaise - discountInPaise;

  const { shipping } = parsed.data;
  const order = await prisma.order.create({
    data: {
      userId: req.user!.id,
      subtotalInPaise,
      discountInPaise,
      totalInPaise,
      couponId,
      couponCode,
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

/**
 * Marks an order PAID and, if it wasn't already PAID, increments its
 * coupon's usedCount — done together in one transaction so a coupon's usage
 * is only ever counted once payment actually succeeds (not at checkout/order
 * creation, so abandoned or failed carts never consume a limited-use
 * coupon), and is safe to call from both /verify and the webhook handler
 * since either one could fire first (or both, for the same order) without
 * double-incrementing.
 */
async function markOrderPaidAndRedeemCoupon(
  razorpayOrderId: string,
  paymentFields: { razorpayPaymentId?: string; razorpaySignature?: string },
) {
  return prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({ where: { razorpayOrderId } });
    if (!existing) return null;

    const wasAlreadyPaid = existing.status === 'PAID';
    const order = await tx.order.update({
      where: { razorpayOrderId },
      data: { status: 'PAID', ...paymentFields },
    });

    if (!wasAlreadyPaid && order.couponId) {
      await tx.coupon.update({ where: { id: order.couponId }, data: { usedCount: { increment: 1 } } });
    }

    return order;
  });
}

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

  const order = await markOrderPaidAndRedeemCoupon(razorpayOrderId, { razorpayPaymentId, razorpaySignature });
  if (!order) {
    return res.status(404).json({ error: 'Order not found' });
  }

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
      await markOrderPaidAndRedeemCoupon(orderId, {});
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
