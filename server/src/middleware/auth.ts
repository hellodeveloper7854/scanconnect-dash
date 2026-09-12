import type { NextFunction, Request, Response } from 'express';
import { firebaseAuth } from '../lib/firebase.js';
import { prisma } from '../lib/prisma.js';
import { env } from '../lib/env.js';
import type { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: User;
      firebaseUid?: string;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing bearer token' });
  }

  const idToken = header.slice('Bearer '.length);

  try {
    const decoded = await firebaseAuth.verifyIdToken(idToken);
    req.firebaseUid = decoded.uid;

    const user = await prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });
    if (!user) {
      return res.status(404).json({ error: 'No account found for this token. Complete registration first.' });
    }
    if (user.isSuspended) {
      return res.status(403).json({ error: 'This account has been suspended. Contact support.' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('verifyIdToken failed:', err);
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

/**
 * Authenticates server-to-server partner calls (e.g. Knowlarity) via a
 * shared API key header, instead of a Firebase user token — the caller here
 * is another company's backend, not a signed-in app user.
 */
export function requirePartnerApiKey(req: Request, res: Response, next: NextFunction) {
  if (!env.partnerApiKey) {
    return res.status(503).json({ error: 'Partner API is not configured' });
  }
  const key = req.headers['x-api-key'];
  if (key !== env.partnerApiKey) {
    return res.status(401).json({ error: 'Invalid or missing API key' });
  }
  next();
}
