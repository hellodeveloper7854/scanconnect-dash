import { Router } from 'express';
import { z } from 'zod';
import { firebaseAuth } from '../lib/firebase.js';
import { registerUser, syncLinkedMobile, findUserByFirebaseUid } from '../services/authService.js';
import { requireAuth } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

export const authRouter = Router();

const registerSchema = z.object({
  idToken: z.string().min(1),
  fullName: z.string().min(1).max(120),
  email: z.string().email(),
  mobileNumber: z.string().min(8).max(20).optional(),
});

/**
 * Client flow: Firebase createUserWithEmailAndPassword -> get idToken -> POST here
 * with fullName/email (and mobileNumber if already linked at signup time).
 * This creates/updates the Postgres record mirroring the Firebase user.
 */
authRouter.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    const decoded = await firebaseAuth.verifyIdToken(parsed.data.idToken);
    const user = await registerUser({
      decoded,
      fullName: parsed.data.fullName,
      email: parsed.data.email,
      mobileNumber: parsed.data.mobileNumber,
    });
    res.status(201).json({ user });
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      return res.status(409).json({ error: 'Email or mobile number already registered' });
    }
    console.error('register failed:', err);
    res.status(401).json({ error: 'Invalid Firebase token' });
  }
});

const linkMobileSchema = z.object({
  idToken: z.string().min(1),
});

/**
 * Client flow: signed-in user runs linkWithCredential(auth.currentUser, phoneCredential)
 * in Firebase, then re-fetches a fresh idToken (now containing phone_number) and
 * POSTs here so the backend record picks up the linked mobile number.
 */
authRouter.post('/link-mobile', async (req, res) => {
  const parsed = linkMobileSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    const decoded = await firebaseAuth.verifyIdToken(parsed.data.idToken);
    const user = await syncLinkedMobile(decoded);
    if (!user) {
      return res.status(400).json({ error: 'Token does not contain a verified phone number' });
    }
    res.json({ user });
  } catch {
    res.status(401).json({ error: 'Invalid Firebase token' });
  }
});

/**
 * Login is entirely client-side via Firebase (email/password or phone OTP).
 * After sign-in, the client calls this with the idToken to fetch/confirm
 * the backend user record and establish who they are for subsequent calls.
 */
authRouter.post('/session', async (req, res) => {
  const parsed = z.object({ idToken: z.string().min(1) }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    const decoded = await firebaseAuth.verifyIdToken(parsed.data.idToken);
    const user = await findUserByFirebaseUid(decoded.uid);
    if (!user) {
      return res.status(404).json({ error: 'No account found. Please register first.' });
    }
    res.json({ user });
  } catch (err) {
    console.error('verifyIdToken failed:', err);
    res.status(401).json({ error: 'Invalid Firebase token' });
  }
});

authRouter.get('/me', requireAuth, async (req, res) => {
  res.json({ user: req.user });
});

const updateMeSchema = z.object({
  fullName: z.string().min(1).max(120),
});

/**
 * Email is intentionally not editable here — it's the account's Firebase
 * identity. Mobile number changes go through the OTP link-mobile flow.
 */
authRouter.patch('/me', requireAuth, async (req, res) => {
  const parsed = updateMeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const user = await prisma.user.update({
    where: { id: req.user!.id },
    data: { fullName: parsed.data.fullName },
  });

  res.json({ user });
});
