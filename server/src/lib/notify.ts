import { prisma } from './prisma.js';
import type { NotificationType } from '@prisma/client';

/** Creates a real per-user notification — the single place every trigger point should call. */
export async function notify(params: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  linkPath?: string;
}) {
  await prisma.notification.create({
    data: {
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      linkPath: params.linkPath,
    },
  });
}
