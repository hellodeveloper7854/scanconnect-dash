import { Router, type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';

/**
 * Support live chat between a user (website or mobile app) and the admin team.
 *
 * User side  (/api/chat, signed in):
 *   GET  /            current conversation + messages  (?after=<ISO time> returns only newer ones)
 *   POST /messages    { body }  send a message (starts a conversation if none is open)
 *   POST /read        mark the admin's replies as seen
 *   GET  /unread      { count } of unseen admin replies
 *
 * Admin side (/api/admin/chat, admins only):
 *   GET   /threads               list conversations (?status=OPEN|CLOSED|ALL)
 *   GET   /threads/:id           one conversation with all messages (marks it read)
 *   POST  /threads/:id/messages  { body }  reply
 *   PATCH /threads/:id/status    { status: OPEN | CLOSED }
 *   GET   /unread-count          { count } of conversations waiting for a reply
 *
 * There is no push channel: clients poll the GET endpoints every few seconds.
 */
export const chatRouter = Router();
export const adminChatRouter = Router();

/** Express 4 doesn't catch rejected promises; without this a database error kills the process. */
const safe =
  (handler: (req: Request, res: Response) => Promise<unknown>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    handler(req, res).catch(next);
  };

const MAX_BODY = 2000;
const messageSchema = z.object({ body: z.string().trim().min(1).max(MAX_BODY) });

// Light per-user throttle against flooding the admin inbox.
const SEND_WINDOW_MS = 60 * 1000;
const MAX_SENDS_PER_WINDOW = 20;
const sends = new Map<string, number[]>();
function tooManySends(userId: string): boolean {
  const now = Date.now();
  const recent = (sends.get(userId) ?? []).filter((t) => now - t < SEND_WINDOW_MS);
  if (recent.length >= MAX_SENDS_PER_WINDOW) {
    sends.set(userId, recent);
    return true;
  }
  recent.push(now);
  sends.set(userId, recent);
  return false;
}

function publicMessage(m: { id: string; sender: string; body: string; createdAt: Date }) {
  // adminId is deliberately omitted: users only see "Support".
  return { id: m.id, sender: m.sender, body: m.body, createdAt: m.createdAt };
}

// ---------------------------------------------------------------- user side

chatRouter.use(requireAuth);

/** The user's most recent conversation (open one preferred), or null. */
async function currentThread(userId: string) {
  const open = await prisma.chatThread.findFirst({
    where: { userId, status: 'OPEN' },
    orderBy: { createdAt: 'desc' },
  });
  if (open) return open;
  return prisma.chatThread.findFirst({ where: { userId }, orderBy: { createdAt: 'desc' } });
}

chatRouter.get(
  '/',
  safe(async (req, res) => {
    const thread = await currentThread(req.user!.id);
    if (!thread) return res.json({ thread: null, messages: [] });

    const after = typeof req.query.after === 'string' ? new Date(req.query.after) : null;
    const messages = await prisma.chatMessage.findMany({
      where: {
        threadId: thread.id,
        ...(after && !Number.isNaN(after.getTime()) ? { createdAt: { gt: after } } : {}),
      },
      orderBy: { createdAt: 'asc' },
      take: 500,
    });
    res.json({
      thread: { id: thread.id, status: thread.status, unread: thread.userUnread },
      messages: messages.map(publicMessage),
    });
  }),
);

chatRouter.post(
  '/messages',
  safe(async (req, res) => {
    const parsed = messageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: `Message must be 1-${MAX_BODY} characters.` });
    }
    if (tooManySends(req.user!.id)) {
      return res.status(429).json({ error: 'You are sending messages too fast. Please wait a moment.' });
    }

    const userId = req.user!.id;
    let thread = await prisma.chatThread.findFirst({
      where: { userId, status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
    });
    if (!thread) {
      thread = await prisma.chatThread.create({ data: { userId } });
    }

    const [message] = await prisma.$transaction([
      prisma.chatMessage.create({
        data: { threadId: thread.id, sender: 'USER', body: parsed.data.body },
      }),
      prisma.chatThread.update({
        where: { id: thread.id },
        data: { lastMessageAt: new Date(), adminUnread: { increment: 1 } },
      }),
    ]);
    res.status(201).json({
      thread: { id: thread.id, status: 'OPEN' },
      message: publicMessage(message),
    });
  }),
);

chatRouter.post(
  '/read',
  safe(async (req, res) => {
    await prisma.chatThread.updateMany({
      where: { userId: req.user!.id, userUnread: { gt: 0 } },
      data: { userUnread: 0 },
    });
    res.json({ ok: true });
  }),
);

chatRouter.get(
  '/unread',
  safe(async (req, res) => {
    const agg = await prisma.chatThread.aggregate({
      where: { userId: req.user!.id },
      _sum: { userUnread: true },
    });
    res.json({ count: agg._sum.userUnread ?? 0 });
  }),
);

// --------------------------------------------------------------- admin side

adminChatRouter.use(requireAuth, requireAdmin);

adminChatRouter.get(
  '/unread-count',
  safe(async (_req, res) => {
    const count = await prisma.chatThread.count({ where: { status: 'OPEN', adminUnread: { gt: 0 } } });
    res.json({ count });
  }),
);

adminChatRouter.get(
  '/threads',
  safe(async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : 'OPEN';
    const threads = await prisma.chatThread.findMany({
      where: status === 'ALL' ? {} : { status: status === 'CLOSED' ? 'CLOSED' : 'OPEN' },
      orderBy: { lastMessageAt: 'desc' },
      take: 200,
      include: {
        user: { select: { id: true, fullName: true, email: true, mobileNumber: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    res.json({
      threads: threads.map((t) => ({
        id: t.id,
        status: t.status,
        adminUnread: t.adminUnread,
        lastMessageAt: t.lastMessageAt,
        createdAt: t.createdAt,
        user: t.user,
        lastMessage: t.messages[0]
          ? { sender: t.messages[0].sender, body: t.messages[0].body, createdAt: t.messages[0].createdAt }
          : null,
      })),
    });
  }),
);

adminChatRouter.get(
  '/threads/:id',
  safe(async (req, res) => {
    const thread = await prisma.chatThread.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, fullName: true, email: true, mobileNumber: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
    });
    if (!thread) return res.status(404).json({ error: 'Conversation not found' });

    if (thread.adminUnread > 0) {
      await prisma.chatThread.update({ where: { id: thread.id }, data: { adminUnread: 0 } });
    }
    res.json({
      thread: {
        id: thread.id,
        status: thread.status,
        createdAt: thread.createdAt,
        lastMessageAt: thread.lastMessageAt,
        user: thread.user,
      },
      messages: thread.messages.map((m) => ({
        id: m.id,
        sender: m.sender,
        adminId: m.adminId,
        body: m.body,
        createdAt: m.createdAt,
      })),
    });
  }),
);

adminChatRouter.post(
  '/threads/:id/messages',
  safe(async (req, res) => {
    const parsed = messageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: `Message must be 1-${MAX_BODY} characters.` });
    }
    const thread = await prisma.chatThread.findUnique({ where: { id: req.params.id } });
    if (!thread) return res.status(404).json({ error: 'Conversation not found' });

    // Replying to a closed conversation reopens it, so the user sees the answer.
    const [message] = await prisma.$transaction([
      prisma.chatMessage.create({
        data: { threadId: thread.id, sender: 'ADMIN', adminId: req.user!.id, body: parsed.data.body },
      }),
      prisma.chatThread.update({
        where: { id: thread.id },
        data: { status: 'OPEN', lastMessageAt: new Date(), userUnread: { increment: 1 }, adminUnread: 0 },
      }),
    ]);
    res.status(201).json({
      message: { id: message.id, sender: message.sender, adminId: message.adminId, body: message.body, createdAt: message.createdAt },
    });
  }),
);

adminChatRouter.patch(
  '/threads/:id/status',
  safe(async (req, res) => {
    const parsed = z.object({ status: z.enum(['OPEN', 'CLOSED']) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'status must be OPEN or CLOSED' });
    const thread = await prisma.chatThread.findUnique({ where: { id: req.params.id } });
    if (!thread) return res.status(404).json({ error: 'Conversation not found' });
    const updated = await prisma.chatThread.update({
      where: { id: thread.id },
      data: { status: parsed.data.status },
    });
    res.json({ thread: { id: updated.id, status: updated.status } });
  }),
);
