import Razorpay from 'razorpay';
import { env, type RazorpayCredentials } from './env.js';
import { currentAppEnv, type AppEnv } from './prisma.js';

/** Thrown when a request needs a Razorpay credential set that isn't configured. */
export class PaymentsNotConfiguredError extends Error {}

/** Credentials for `mode` (default: the current request's environment — test requests get test keys, the rest live). */
export function getRazorpayCredentials(mode: AppEnv = currentAppEnv()): RazorpayCredentials {
  const creds = env.razorpay[mode];
  if (!creds) throw new PaymentsNotConfiguredError(`Razorpay ${mode} credentials are not configured`);
  return creds;
}

const clients: Partial<Record<AppEnv, Razorpay>> = {};

/** Razorpay client for the current request's environment. */
export function getRazorpay(): Razorpay {
  const mode = currentAppEnv();
  const { keyId, keySecret } = getRazorpayCredentials(mode);
  return (clients[mode] ??= new Razorpay({ key_id: keyId, key_secret: keySecret }));
}
