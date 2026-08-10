import { Router } from 'express';
import QRCode from 'qrcode';
import { prisma } from '../lib/prisma.js';
import { env } from '../lib/env.js';

/**
 * Public, unauthenticated by design: the order QR is meant to be scanned by
 * anyone holding the physical package/label (e.g. a courier) to look up who
 * to contact, so no login is required to view this order's contact details.
 */
export const orderContactRouter = Router();

orderContactRouter.get('/:token', async (req, res) => {
  const order = await prisma.order.findUnique({
    where: { qrToken: req.params.token },
    include: { user: { select: { fullName: true, email: true, mobileNumber: true } } },
  });

  if (!order) {
    return res.status(404).json({ error: 'No order found for this QR code' });
  }

  res.json({
    orderId: order.id,
    createdAt: order.createdAt,
    status: order.status,
    customer: {
      fullName: order.user.fullName,
      email: order.user.email,
      mobileNumber: order.user.mobileNumber,
    },
  });
});

orderContactRouter.get('/:token/qr.png', async (req, res) => {
  const order = await prisma.order.findUnique({ where: { qrToken: req.params.token } });
  if (!order) {
    return res.status(404).json({ error: 'No order found for this QR code' });
  }

  const url = `${env.corsOrigin}/order-contact/${req.params.token}`;
  const png = await QRCode.toBuffer(url, { type: 'png', width: 300, margin: 2 });
  res.setHeader('Content-Type', 'image/png');
  res.send(png);
});
