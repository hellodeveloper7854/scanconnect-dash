import express, { Router, type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAdmin, requireAuth } from '../middleware/auth.js';
import { notify } from '../lib/notify.js';
import { isValidPersonName } from '../lib/validation.js';

/**
 * Support tickets — asynchronous support requests with a subject, category,
 * status lifecycle and optional attachments (shared by website and app).
 *
 * User side (/api/tickets, signed in):
 *   POST   /                                  { subject, category, message } create (returns first message id)
 *   GET    /                                  my tickets (?status=OPEN|IN_PROGRESS|RESOLVED|CLOSED)
 *   GET    /:id                               one ticket with messages + attachment metadata (marks it read)
 *   POST   /:id/messages                      { body } reply (reopens a RESOLVED ticket)
 *   POST   /:id/messages/:messageId/attachments   raw file body, X-File-Name header (image/pdf, <=2 MB, <=3 per message)
 *   PATCH  /:id/status                        { status: 'CLOSED' } close my own ticket
 *   GET    /attachments/:attachmentId         download (owner or admin)
 *   GET    /unread                            { count } of tickets with unseen replies
 *
 * Admin side (/api/admin/tickets, admins only):
 *   GET   /            list (?status=&q=)         GET /unread-count
 *   GET   /:id         details (marks read)
 *   POST  /:id/messages { body }   reply (OPEN -> IN_PROGRESS) + notifies the user
 *   POST  /:id/messages/:messageId/attachments   attach a file to an admin reply
 *   PATCH /:id/status { status }
 */
export const ticketsRouter = Router();
export const adminTicketsRouter = Router();

const safe =
  (handler: (req: Request, res: Response) => Promise<unknown>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    handler(req, res).catch(next);
  };

const CATEGORIES = ['ORDER', 'TAG', 'PAYMENT', 'ACCOUNT', 'OTHER'] as const;
const STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;

const createSchema = z.object({
  subject: z.string().trim().min(5, 'Subject must be at least 5 characters').max(120, 'Subject is too long'),
  category: z.enum(CATEGORIES).default('OTHER'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(4000, 'Message is too long'),
});
const replySchema = z.object({
  body: z.string().trim().min(1, 'Message cannot be empty').max(4000, 'Message is too long'),
});

const MAX_ATTACHMENT_BYTES = 2 * 1024 * 1024;
const MAX_ATTACHMENTS_PER_MESSAGE = 3;
const MAX_NEW_TICKETS_PER_HOUR = 5;

function detectMime(buf: Buffer): 'image/jpeg' | 'image/png' | 'image/webp' | 'application/pdf' | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'image/png';
  }
  if (buf.length > 12 && buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') {
    return 'image/webp';
  }
  if (buf.length > 4 && buf.subarray(0, 5).toString('ascii') === '%PDF-') return 'application/pdf';
  return null;
}

const rawFile = express.raw({
  type: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/octet-stream'],
  limit: MAX_ATTACHMENT_BYTES,
});

function cleanFileName(raw: unknown): string {
  const decoded = typeof raw === 'string' ? decodeURIComponent(raw) : 'attachment';
  return decoded.replace(/[^\w.\- ()]/g, '_').slice(0, 100) || 'attachment';
}

const formatNumber = (n: number) => `SC-${n}`;

type MessageRow = {
  id: string;
  sender: string;
  adminId?: string | null;
  body: string;
  createdAt: Date;
  attachments: { id: string; fileName: string; mimeType: string; sizeBytes: number }[];
};

function toMessage(m: MessageRow, includeAdmin: boolean) {
  return {
    id: m.id,
    sender: m.sender,
    ...(includeAdmin ? { adminId: m.adminId ?? null } : {}),
    body: m.body,
    createdAt: m.createdAt,
    attachments: m.attachments.map((a) => ({
      id: a.id,
      fileName: a.fileName,
      mimeType: a.mimeType,
      sizeBytes: a.sizeBytes,
    })),
  };
}

const ATTACHMENT_META = { select: { id: true, fileName: true, mimeType: true, sizeBytes: true } } as const;

// ---------------------------------------------------------------- user side

ticketsRouter.use(requireAuth);

ticketsRouter.post(
  '/',
  safe(async (req, res) => {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    if (!isValidPersonName(req.user!.fullName)) {
      return res.status(403).json({
        error: 'Please update your name in Personal Information (letters only) before raising a ticket.',
      });
    }

    const since = new Date(Date.now() - 60 * 60 * 1000);
    const recent = await prisma.supportTicket.count({ where: { userId: req.user!.id, createdAt: { gt: since } } });
    if (recent >= MAX_NEW_TICKETS_PER_HOUR) {
      return res.status(429).json({ error: 'You have created several tickets recently. Please wait a while.' });
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: req.user!.id,
        subject: parsed.data.subject,
        category: parsed.data.category,
        adminUnread: 1,
        messages: { create: { sender: 'USER', body: parsed.data.message } },
      },
      include: { messages: { include: { attachments: ATTACHMENT_META } } },
    });
    res.status(201).json({
      ticket: {
        id: ticket.id,
        number: formatNumber(ticket.ticketNumber),
        subject: ticket.subject,
        category: ticket.category,
        status: ticket.status,
        createdAt: ticket.createdAt,
      },
      firstMessageId: ticket.messages[0].id,
    });
  }),
);

ticketsRouter.get(
  '/unread',
  safe(async (req, res) => {
    const count = await prisma.supportTicket.count({ where: { userId: req.user!.id, userUnread: { gt: 0 } } });
    res.json({ count });
  }),
);

ticketsRouter.get(
  '/attachments/:attachmentId',
  safe(async (req, res) => {
    const att = await prisma.ticketAttachment.findUnique({
      where: { id: req.params.attachmentId },
      include: { message: { include: { ticket: { select: { userId: true } } } } },
    });
    if (!att || (att.message.ticket.userId !== req.user!.id && req.user!.role !== 'ADMIN')) {
      return res.status(404).json({ error: 'Attachment not found' });
    }
    res.setHeader('Content-Type', att.mimeType);
    res.setHeader('Content-Disposition', `inline; filename="${att.fileName}"`);
    res.setHeader('Cache-Control', 'private, max-age=3600');
    res.send(Buffer.from(att.data));
  }),
);

ticketsRouter.get(
  '/',
  safe(async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : undefined;
    const tickets = await prisma.supportTicket.findMany({
      where: {
        userId: req.user!.id,
        ...(status && (STATUSES as readonly string[]).includes(status) ? { status: status as (typeof STATUSES)[number] } : {}),
      },
      orderBy: { lastMessageAt: 'desc' },
      take: 100,
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    res.json({
      tickets: tickets.map((t) => ({
        id: t.id,
        number: formatNumber(t.ticketNumber),
        subject: t.subject,
        category: t.category,
        status: t.status,
        unread: t.userUnread,
        createdAt: t.createdAt,
        lastMessageAt: t.lastMessageAt,
        lastMessage: t.messages[0]
          ? { sender: t.messages[0].sender, body: t.messages[0].body.slice(0, 160), createdAt: t.messages[0].createdAt }
          : null,
      })),
    });
  }),
);

ticketsRouter.get(
  '/:id',
  safe(async (req, res) => {
    const ticket = await prisma.supportTicket.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: { messages: { orderBy: { createdAt: 'asc' }, include: { attachments: ATTACHMENT_META } } },
    });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    if (ticket.userUnread > 0) {
      await prisma.supportTicket.update({ where: { id: ticket.id }, data: { userUnread: 0 } });
    }
    res.json({
      ticket: {
        id: ticket.id,
        number: formatNumber(ticket.ticketNumber),
        subject: ticket.subject,
        category: ticket.category,
        status: ticket.status,
        createdAt: ticket.createdAt,
        lastMessageAt: ticket.lastMessageAt,
      },
      messages: ticket.messages.map((m) => toMessage(m, false)),
    });
  }),
);

ticketsRouter.post(
  '/:id/messages',
  safe(async (req, res) => {
    const parsed = replySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const ticket = await prisma.supportTicket.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    if (ticket.status === 'CLOSED') {
      return res.status(409).json({ error: 'This ticket is closed. Please create a new ticket.' });
    }

    const [message] = await prisma.$transaction([
      prisma.ticketMessage.create({
        data: { ticketId: ticket.id, sender: 'USER', body: parsed.data.body },
        include: { attachments: ATTACHMENT_META },
      }),
      prisma.supportTicket.update({
        where: { id: ticket.id },
        data: {
          // A reply to a resolved ticket reopens it.
          status: ticket.status === 'RESOLVED' ? 'OPEN' : ticket.status,
          lastMessageAt: new Date(),
          adminUnread: { increment: 1 },
        },
      }),
    ]);
    res.status(201).json({ message: toMessage(message, false) });
  }),
);

/** Shared by user and admin: stores one attachment on a message of a ticket the caller may access. */
async function attachFile(req: Request, res: Response, asAdmin: boolean) {
  const body = req.body;
  if (!Buffer.isBuffer(body) || body.length === 0) {
    return res.status(400).json({ error: 'Send the file as the request body.' });
  }
  const mimeType = detectMime(body);
  if (!mimeType) {
    return res.status(400).json({ error: 'Only JPEG, PNG, WebP images or PDF files can be attached.' });
  }

  const message = await prisma.ticketMessage.findFirst({
    where: {
      id: req.params.messageId,
      ticketId: req.params.id,
      sender: asAdmin ? 'ADMIN' : 'USER',
      ...(asAdmin ? {} : { ticket: { userId: req.user!.id } }),
    },
    include: { _count: { select: { attachments: true } } },
  });
  if (!message) return res.status(404).json({ error: 'Message not found' });
  if (message._count.attachments >= MAX_ATTACHMENTS_PER_MESSAGE) {
    return res.status(400).json({ error: `You can attach up to ${MAX_ATTACHMENTS_PER_MESSAGE} files.` });
  }

  const attachment = await prisma.ticketAttachment.create({
    data: {
      messageId: message.id,
      fileName: cleanFileName(req.headers['x-file-name']),
      mimeType,
      sizeBytes: body.length,
      data: body,
    },
    select: { id: true, fileName: true, mimeType: true, sizeBytes: true },
  });
  res.status(201).json({ attachment });
}

ticketsRouter.post(
  '/:id/messages/:messageId/attachments',
  rawFile,
  safe((req, res) => attachFile(req, res, false)),
);

ticketsRouter.patch(
  '/:id/status',
  safe(async (req, res) => {
    const parsed = z.object({ status: z.literal('CLOSED') }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'You can only close your own ticket.' });
    const ticket = await prisma.supportTicket.findFirst({ where: { id: req.params.id, userId: req.user!.id } });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    const updated = await prisma.supportTicket.update({ where: { id: ticket.id }, data: { status: 'CLOSED' } });
    res.json({ ticket: { id: updated.id, status: updated.status } });
  }),
);

// --------------------------------------------------------------- admin side

adminTicketsRouter.use(requireAuth, requireAdmin);

adminTicketsRouter.get(
  '/unread-count',
  safe(async (_req, res) => {
    const count = await prisma.supportTicket.count({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] }, adminUnread: { gt: 0 } },
    });
    res.json({ count });
  }),
);

adminTicketsRouter.get(
  '/',
  safe(async (req, res) => {
    const status = typeof req.query.status === 'string' ? req.query.status.toUpperCase() : 'ALL';
    const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    const numberQuery = Number(q.replace(/^sc-/i, ''));

    const tickets = await prisma.supportTicket.findMany({
      where: {
        ...((STATUSES as readonly string[]).includes(status) ? { status: status as (typeof STATUSES)[number] } : {}),
        ...(q
          ? {
              OR: [
                { subject: { contains: q, mode: 'insensitive' as const } },
                { user: { fullName: { contains: q, mode: 'insensitive' as const } } },
                { user: { email: { contains: q, mode: 'insensitive' as const } } },
                ...(Number.isInteger(numberQuery) && numberQuery > 0 ? [{ ticketNumber: numberQuery }] : []),
              ],
            }
          : {}),
      },
      orderBy: { lastMessageAt: 'desc' },
      take: 200,
      include: {
        user: { select: { id: true, fullName: true, email: true, mobileNumber: true } },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    });
    res.json({
      tickets: tickets.map((t) => ({
        id: t.id,
        number: formatNumber(t.ticketNumber),
        subject: t.subject,
        category: t.category,
        status: t.status,
        adminUnread: t.adminUnread,
        createdAt: t.createdAt,
        lastMessageAt: t.lastMessageAt,
        user: t.user,
        lastMessage: t.messages[0]
          ? { sender: t.messages[0].sender, body: t.messages[0].body.slice(0, 160), createdAt: t.messages[0].createdAt }
          : null,
      })),
    });
  }),
);

adminTicketsRouter.get(
  '/:id',
  safe(async (req, res) => {
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: req.params.id },
      include: {
        user: { select: { id: true, fullName: true, email: true, mobileNumber: true } },
        messages: { orderBy: { createdAt: 'asc' }, include: { attachments: ATTACHMENT_META } },
      },
    });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    if (ticket.adminUnread > 0) {
      await prisma.supportTicket.update({ where: { id: ticket.id }, data: { adminUnread: 0 } });
    }
    res.json({
      ticket: {
        id: ticket.id,
        number: formatNumber(ticket.ticketNumber),
        subject: ticket.subject,
        category: ticket.category,
        status: ticket.status,
        createdAt: ticket.createdAt,
        lastMessageAt: ticket.lastMessageAt,
        user: ticket.user,
      },
      messages: ticket.messages.map((m) => toMessage(m, true)),
    });
  }),
);

adminTicketsRouter.post(
  '/:id/messages',
  safe(async (req, res) => {
    const parsed = replySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const ticket = await prisma.supportTicket.findUnique({ where: { id: req.params.id } });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });

    const [message] = await prisma.$transaction([
      prisma.ticketMessage.create({
        data: { ticketId: ticket.id, sender: 'ADMIN', adminId: req.user!.id, body: parsed.data.body },
        include: { attachments: ATTACHMENT_META },
      }),
      prisma.supportTicket.update({
        where: { id: ticket.id },
        data: {
          // First staff reply picks the ticket up; replying to a closed/resolved one reopens it.
          status: ticket.status === 'OPEN' || ticket.status === 'CLOSED' || ticket.status === 'RESOLVED' ? 'IN_PROGRESS' : ticket.status,
          lastMessageAt: new Date(),
          userUnread: { increment: 1 },
          adminUnread: 0,
        },
      }),
    ]);

    await notify({
      userId: ticket.userId,
      type: 'TICKET_REPLY',
      title: `Reply on ${formatNumber(ticket.ticketNumber)}`,
      body: 'Our support team replied to your ticket.',
      linkPath: '/support',
    });
    res.status(201).json({ message: toMessage(message, true) });
  }),
);

adminTicketsRouter.post(
  '/:id/messages/:messageId/attachments',
  rawFile,
  safe((req, res) => attachFile(req, res, true)),
);

adminTicketsRouter.patch(
  '/:id/status',
  safe(async (req, res) => {
    const parsed = z.object({ status: z.enum(STATUSES) }).safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid status' });
    const ticket = await prisma.supportTicket.findUnique({ where: { id: req.params.id } });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    const updated = await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: { status: parsed.data.status, ...(parsed.data.status === 'RESOLVED' ? { userUnread: { increment: 1 } } : {}) },
    });
    if (parsed.data.status === 'RESOLVED' && ticket.status !== 'RESOLVED') {
      await notify({
        userId: ticket.userId,
        type: 'TICKET_REPLY',
        title: `${formatNumber(ticket.ticketNumber)} resolved`,
        body: 'Your support ticket was marked as resolved. Reply on it if you still need help.',
        linkPath: '/support',
      });
    }
    res.json({ ticket: { id: updated.id, status: updated.status } });
  }),
);
