import { Router } from 'express';
import QRCode from 'qrcode';
import { prisma } from '../lib/prisma.js';
import { env } from '../lib/env.js';

/**
 * Public, unauthenticated by design: the order QR is meant to be scanned by
 * anyone holding the physical package/label (e.g. a courier) to look up who
 * to contact, so no login is required to view this order's contact details.
 *
 * Resolves by OrderTag.qrToken — every order (including ones placed before
 * the per-tag model existed) has its qrToken(s) there; see the backfill
 * script (server/scripts/backfillOrderTags.ts) and OrderTag's doc comment in
 * schema.prisma for how pre-existing orders were migrated in.
 */
export const orderContactRouter = Router();

orderContactRouter.get('/:token', async (req, res) => {
  const tag = await prisma.orderTag.findUnique({
    where: { qrToken: req.params.token },
    include: {
      order: { include: { user: { select: { fullName: true, email: true, mobileNumber: true } } } },
      vehicle: true,
      emergencyContact: true,
    },
  });

  if (!tag) {
    return res.status(404).json({ error: 'No order found for this QR code' });
  }

  res.json({
    orderId: tag.order.id,
    createdAt: tag.order.createdAt,
    status: tag.order.status,
    customer: {
      fullName: tag.order.user.fullName,
      email: tag.order.user.email,
      mobileNumber: tag.order.user.mobileNumber,
    },
    vehicle: tag.vehicle
      ? {
          registration: tag.vehicle.registration,
          nickname: tag.vehicle.nickname,
          vehicleType: tag.vehicle.vehicleType,
          brand: tag.vehicle.brand,
          model: tag.vehicle.model,
          color: tag.vehicle.color,
        }
      : null,
    emergencyContact: tag.emergencyContact
      ? {
          name: tag.emergencyContact.name,
          role: tag.emergencyContact.role,
          phone: tag.emergencyContact.phone,
        }
      : null,
  });
});

orderContactRouter.get('/:token/qr.png', async (req, res) => {
  const tag = await prisma.orderTag.findUnique({ where: { qrToken: req.params.token } });
  if (!tag) {
    return res.status(404).json({ error: 'No order found for this QR code' });
  }

  const url = `${env.corsOrigin}/order-contact/${req.params.token}`;
  const png = await QRCode.toBuffer(url, { type: 'png', width: 300, margin: 2 });
  res.setHeader('Content-Type', 'image/png');
  res.send(png);
});
