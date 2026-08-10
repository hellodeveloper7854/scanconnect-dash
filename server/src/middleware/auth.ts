import type { NextFunction, Request, Response } from 'express';
import { firebaseAuth } from '../lib/firebase.js';
import { prisma } from '../lib/prisma.js';
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
