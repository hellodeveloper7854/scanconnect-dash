import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { firebaseAuth } from '../lib/firebase.js';
import { requireAuth } from '../middleware/auth.js';

/**
 * Account endpoints that exist only for the mobile app. The website has no
 * "delete my account" action, but the app stores (Apple/Google) require one,
 * so it lives here as its own router instead of inside routes/auth.ts —
 * nothing the website relies on is changed by it.
 */
export const appAccountRouter = Router();
appAccountRouter.use(requireAuth);

/**
 * Permanently deletes the signed-in user's account.
 *
 * - Vehicles' QR tags are released (back to INACTIVE) exactly like the
 *   existing DELETE /api/profile/vehicles/:id does, so a deleted account
 *   never leaves a live tag that points at nothing.
 * - A user with no orders is hard-deleted (every owned table cascades).
 * - A user who has placed orders can't be hard-deleted (Order.userId has no
 *   cascade, and paid orders must stay for accounting). Their personal data
 *   is stripped instead: name/email/phone are replaced with placeholders,
 *   vehicles/contacts/notifications/etc. are deleted, and the row is marked
 *   suspended so it can never sign in again.
 * - The Firebase identity is removed last so the user can't sign back in
 *   into a half-deleted state if the database step fails.
 */
appAccountRouter.delete('/', async (req, res) => {
  const user = req.user!;

  if (user.role === 'ADMIN') {
    return res.status(403).json({ error: 'Admin accounts can’t be deleted from the app.' });
  }

  const orderCount = await prisma.order.count({ where: { userId: user.id } });

  await prisma.$transaction(async (tx) => {
    await tx.qrCode.updateMany({
      where: { vehicle: { userId: user.id } },
      data: { vehicleId: null, status: 'INACTIVE', activatedAt: null },
    });

    if (orderCount === 0) {
      await tx.user.delete({ where: { id: user.id } });
      return;
    }

    await tx.orderTag.updateMany({
      where: { order: { userId: user.id } },
      data: { vehicleId: null, emergencyContactId: null },
    });
    await tx.order.updateMany({
      where: { userId: user.id },
      data: { vehicleId: null, emergencyContactId: null },
    });
    await tx.review.deleteMany({ where: { userId: user.id } });
    await tx.vehicle.deleteMany({ where: { userId: user.id } });
    await tx.emergencyContact.deleteMany({ where: { userId: user.id } });
    await tx.notification.deleteMany({ where: { userId: user.id } });
    await tx.sosAlert.deleteMany({ where: { userId: user.id } });
    await tx.userPreferences.deleteMany({ where: { userId: user.id } });
    await tx.user.update({
      where: { id: user.id },
      data: {
        fullName: 'Deleted user',
        email: `deleted-${user.id}@deleted.scanconnect.invalid`,
        emailVerified: false,
        mobileNumber: null,
        mobileVerified: false,
        isSuspended: true,
        firebaseUid: `deleted:${user.firebaseUid}`,
      },
    });
  });

  try {
    await firebaseAuth.deleteUser(user.firebaseUid);
  } catch (err) {
    // Already gone from Firebase is fine; anything else is logged but doesn't
    // fail the request — the database record can no longer be reached by
    // this uid either way.
    console.error('Firebase deleteUser failed:', err);
  }

  res.json({ ok: true });
});
