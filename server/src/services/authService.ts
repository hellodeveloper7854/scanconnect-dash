import { prisma } from '../lib/prisma.js';
import { env } from '../lib/env.js';
import type { DecodedIdToken } from 'firebase-admin/auth';

interface RegisterInput {
  decoded: DecodedIdToken;
  fullName: string;
  email: string;
  mobileNumber?: string;
}

/**
 * Called after the client completes Firebase sign-up (email/password) and,
 * optionally, links a phone credential via linkWithCredential on the same
 * Firebase user. By the time this runs, decoded.uid already represents one
 * Firebase account that may carry both an email and a phone_number claim.
 */
export async function registerUser({ decoded, fullName, email, mobileNumber }: RegisterInput) {
  const normalizedEmail = (decoded.email ?? email).toLowerCase();
  const phone = decoded.phone_number ?? mobileNumber ?? undefined;
  const role = env.adminBootstrapEmails.includes(normalizedEmail) ? 'ADMIN' : 'USER';

  const user = await prisma.user.upsert({
    where: { firebaseUid: decoded.uid },
    create: {
      firebaseUid: decoded.uid,
      fullName,
      email: normalizedEmail,
      emailVerified: decoded.email_verified ?? false,
      mobileNumber: phone,
      mobileVerified: Boolean(decoded.phone_number),
      role,
    },
    update: {
      fullName,
      email: normalizedEmail,
      emailVerified: decoded.email_verified ?? false,
      mobileNumber: phone,
      mobileVerified: Boolean(decoded.phone_number),
    },
  });

  return user;
}

/**
 * Called after a client verifies a phone number via Firebase phone auth with
 * no prior account (e.g. starting the QR activation flow by phone first).
 * Creates a minimal User row keyed off the phone number alone — fullName and
 * email are placeholders until the flow's later "Complete Your Profile" step
 * calls registerUser to fill in the real values and set a password.
 */
export async function registerPhoneUser(decoded: DecodedIdToken) {
  if (!decoded.phone_number) {
    throw new Error('NO_PHONE_NUMBER');
  }

  return prisma.user.upsert({
    where: { firebaseUid: decoded.uid },
    create: {
      firebaseUid: decoded.uid,
      fullName: '',
      email: `${decoded.uid}@phone.scanconnect.placeholder`,
      mobileNumber: decoded.phone_number,
      mobileVerified: true,
    },
    update: {
      mobileNumber: decoded.phone_number,
      mobileVerified: true,
    },
  });
}

/**
 * Called after a client links a phone credential to an already-registered
 * email account (Firebase linkWithCredential keeps the same uid).
 */
export async function syncLinkedMobile(decoded: DecodedIdToken) {
  if (!decoded.phone_number) return null;

  return prisma.user.update({
    where: { firebaseUid: decoded.uid },
    data: {
      mobileNumber: decoded.phone_number,
      mobileVerified: true,
    },
  });
}

export async function findUserByFirebaseUid(uid: string) {
  return prisma.user.findUnique({ where: { firebaseUid: uid } });
}
