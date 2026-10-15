import express, { Router, type NextFunction, type Request, type RequestHandler, type Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth } from '../middleware/auth.js';

/**
 * Profile photo, shared by the website dashboard and the mobile app.
 *
 *   PUT    /api/avatar          (auth)  raw image bytes as the request body
 *   DELETE /api/avatar          (auth)  removes the photo
 *   GET    /api/avatar/:userId  (public) the image, 404 when none
 *
 * GET is public so a plain <img src> / Image.network works without an
 * Authorization header; the user id in the URL is an unguessable UUID and the
 * response carries nothing but the picture. Uploads are validated by their
 * magic bytes (not the client-sent Content-Type) and capped at 2 MB; clients
 * resize to a few hundred pixels before uploading, so real files are far
 * smaller.
 */
export const appAvatarRouter = Router();

/** Express 4 doesn't catch rejected promises: without this, a database error
 *  in an async handler becomes an unhandled rejection that kills the process. */
const safe =
  (handler: (req: Request, res: Response) => Promise<unknown>): RequestHandler =>
  (req: Request, res: Response, next: NextFunction) => {
    handler(req, res).catch(next);
  };

const MAX_BYTES = 2 * 1024 * 1024;

function detectMime(buf: Buffer): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) {
    return 'image/png';
  }
  if (buf.length > 12 && buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WEBP') {
    return 'image/webp';
  }
  return null;
}

appAvatarRouter.put(
  '/',
  requireAuth,
  express.raw({ type: ['image/jpeg', 'image/png', 'image/webp', 'application/octet-stream'], limit: MAX_BYTES }),
  safe(async (req, res) => {
    const body = req.body;
    if (!Buffer.isBuffer(body) || body.length === 0) {
      return res.status(400).json({ error: 'Send the image as the request body (JPEG, PNG or WebP).' });
    }
    const mimeType = detectMime(body);
    if (!mimeType) {
      return res.status(400).json({ error: 'Only JPEG, PNG or WebP images are supported.' });
    }

    await prisma.userAvatar.upsert({
      where: { userId: req.user!.id },
      create: { userId: req.user!.id, mimeType, data: body },
      update: { mimeType, data: body },
    });
    res.json({ ok: true, url: `/api/avatar/${req.user!.id}`, version: Date.now() });
  }),
);

appAvatarRouter.delete('/', requireAuth, safe(async (req, res) => {
  await prisma.userAvatar.deleteMany({ where: { userId: req.user!.id } });
  res.json({ ok: true });
}));

appAvatarRouter.get('/:userId', safe(async (req, res) => {
  const avatar = await prisma.userAvatar.findUnique({ where: { userId: req.params.userId } });
  if (!avatar) {
    return res.status(404).json({ error: 'No profile photo' });
  }
  const etag = `"${avatar.updatedAt.getTime()}"`;
  res.setHeader('ETag', etag);
  // Revalidate every time so a new upload shows up immediately; the 304 keeps it cheap.
  res.setHeader('Cache-Control', 'no-cache');
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }
  res.setHeader('Content-Type', avatar.mimeType);
  res.send(Buffer.from(avatar.data));
}));
