import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);

/**
 * Lists the signed-in user's notifications (most recent first) plus their
 * unread count, powering the header bell. Only ever reads notifications
 * created server-side from a real event — see lib/notify.ts.
 */
notificationsRouter.get('/', async (req, res) => {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
    prisma.notification.count({ where: { userId: req.user!.id, isRead: false } }),
  ]);

  res.json({ notifications, unreadCount });
});

/** Marks a single notification as read. */
notificationsRouter.patch('/:id/read', async (req, res) => {
  const notification = await prisma.notification.findUnique({ where: { id: req.params.id } });
  if (!notification || notification.userId !== req.user!.id) {
    return res.status(404).json({ error: 'Notification not found' });
  }

  const updated = await prisma.notification.update({ where: { id: notification.id }, data: { isRead: true } });
  res.json({ notification: updated });
});

/** Marks every one of the signed-in user's notifications as read (e.g. on opening the bell panel). */
notificationsRouter.patch('/read-all', async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.id, isRead: false },
    data: { isRead: true },
  });
  res.status(204).send();
});
