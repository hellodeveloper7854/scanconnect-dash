import { Router } from 'express';
import { z } from 'zod';
import { firebaseAuth } from '../lib/firebase.js';
import { registerUser, registerPhoneUser, syncLinkedMobile, findUserByFirebaseUid } from '../services/authService.js';
import { requireAuth, SUSPENDED_MESSAGE } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';
import { fullNameSchema } from '../lib/validation.js';

export const authRouter = Router();

const registerSchema = z.object({
  idToken: z.string().min(1),
  fullName: fullNameSchema,
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

const phoneSessionSchema = z.object({
  idToken: z.string().min(1),
});

/**
 * Client flow: Firebase signInWithPhoneNumber + OTP confirm -> get idToken ->
 * POST here, with no prior account required. Creates a minimal placeholder
 * User row (see registerPhoneUser) so phone-first flows like QR activation
 * can proceed before a name/email/password exist — /register later fills
 * those in for real once the flow reaches its "Complete Your Profile" step.
 */
authRouter.post('/phone-session', async (req, res) => {
  const parsed = phoneSessionSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  try {
    const decoded = await firebaseAuth.verifyIdToken(parsed.data.idToken);
    const user = await registerPhoneUser(decoded);
    if (user.isSuspended) {
      return res.status(403).json({ error: SUSPENDED_MESSAGE });
    }
    res.status(201).json({ user });
  } catch (err) {
    if (err instanceof Error && err.message === 'NO_PHONE_NUMBER') {
      return res.status(400).json({ error: 'Token does not contain a verified phone number' });
    }
    console.error('phone-session failed:', err);
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
  } catch (err) {
    if (err instanceof Error && err.message.includes('Unique constraint')) {
      return res.status(409).json({ error: 'This mobile number is already registered to another account.' });
    }
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
    // Say so at sign-in, not only when the customer later tries to do something.
    if (user.isSuspended) {
      return res.status(403).json({ error: SUSPENDED_MESSAGE });
    }
    // Once the customer opens the verification link Firebase holds the new email;
    // bring Postgres in line (unless that address now belongs to someone else).
    const tokenEmail = decoded.email?.trim().toLowerCase();
    if (tokenEmail && decoded.email_verified && tokenEmail !== user.email) {
      const clash = await prisma.user.findUnique({ where: { email: tokenEmail } });
      if (!clash) {
        const synced = await prisma.user.update({
          where: { id: user.id },
          data: { email: tokenEmail, emailVerified: true },
        });
        return res.json({ user: synced });
      }
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
  fullName: fullNameSchema.optional(),
  email: z.string().email().optional(),
});

const PLACEHOLDER_EMAIL_SUFFIX = '@phone.scanconnect.placeholder';

/**
 * Name edits, and a phone-only account adding its FIRST real email.
 *
 * Changing an existing email is deliberately not done here: updating a user's
 * email through the Admin SDK revokes their sessions, which logged people out
 * ("redirected to re-login") right after saving. A real email change goes through
 * Firebase's verify-before-update link instead (sent from the client), which keeps
 * the session and proves the customer owns the new address; /session then syncs
 * the new address to Postgres. Adding the first email (placeholder -> real) has no
 * existing address to protect, so it is applied here, and a fresh custom token is
 * returned so the client can sign straight back in without a visible logout.
 * Mobile number changes go through the OTP link-mobile flow.
 */
authRouter.patch('/me', requireAuth, async (req, res) => {
  const parsed = updateMeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const data: { fullName?: string; email?: string; emailVerified?: boolean } = {};
  if (parsed.data.fullName !== undefined) data.fullName = parsed.data.fullName;

  const newEmail = parsed.data.email?.trim().toLowerCase();
  let customToken: string | undefined;
  if (newEmail && newEmail !== req.user!.email) {
    if (!req.user!.email.endsWith(PLACEHOLDER_EMAIL_SUFFIX)) {
      return res.status(400).json({
        error: 'To change your email, a verification link is sent to the new address. Use the change-email option in your profile.',
      });
    }
    const taken = await prisma.user.findUnique({ where: { email: newEmail } });
    if (taken && taken.id !== req.user!.id) {
      return res.status(409).json({ error: 'This email is already in use by another account' });
    }
    try {
      await firebaseAuth.updateUser(req.user!.firebaseUid, { email: newEmail, emailVerified: false });
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === 'auth/email-already-exists') {
        return res.status(409).json({ error: 'This email is already in use by another account' });
      }
      console.error('update email failed:', err);
      return res.status(500).json({ error: 'Failed to update email' });
    }
    data.email = newEmail;
    data.emailVerified = false;
    customToken = await firebaseAuth.createCustomToken(req.user!.firebaseUid);
  }

  const user = await prisma.user.update({ where: { id: req.user!.id }, data });

  res.json({ user, ...(customToken ? { customToken } : {}) });
});

/** Is this email free to use? Lets the profile form say "already in use" before a link is sent. */
authRouter.post('/me/email-available', requireAuth, async (req, res) => {
  const parsed = z.object({ email: z.string().email() }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Enter a valid email address' });
  }
  const email = parsed.data.email.trim().toLowerCase();
  const taken = await prisma.user.findUnique({ where: { email } });
  res.json({ available: !taken || taken.id === req.user!.id });
});
