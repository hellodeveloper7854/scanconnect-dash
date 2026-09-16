import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// PAYMENT_MODE picks which Razorpay credential set to load — 'live' reads
// RAZORPAY_LIVE_*, anything else (including unset, so local dev is safe by
// default) reads RAZORPAY_TEST_*. The key id's rzp_test_/rzp_live_ prefix is
// checked against the declared mode so a mismatched pair (e.g. a live secret
// pasted next to a test key id) fails fast at boot instead of at checkout.
const paymentMode = process.env.PAYMENT_MODE === 'live' ? 'live' : 'test';
const razorpayKeyId = required(paymentMode === 'live' ? 'RAZORPAY_LIVE_KEY_ID' : 'RAZORPAY_TEST_KEY_ID');
const expectedPrefix = paymentMode === 'live' ? 'rzp_live_' : 'rzp_test_';
if (!razorpayKeyId.startsWith(expectedPrefix)) {
  throw new Error(
    `PAYMENT_MODE=${paymentMode} but the configured Razorpay key id does not start with "${expectedPrefix}". Check your .env.`,
  );
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  databaseUrl: required('DATABASE_URL'),
  firebase: {
    projectId: required('FIREBASE_PROJECT_ID'),
    clientEmail: required('FIREBASE_CLIENT_EMAIL'),
    privateKey: required('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
  },
  razorpay: {
    mode: paymentMode,
    keyId: razorpayKeyId,
    keySecret: required(paymentMode === 'live' ? 'RAZORPAY_LIVE_KEY_SECRET' : 'RAZORPAY_TEST_KEY_SECRET'),
    webhookSecret: required(paymentMode === 'live' ? 'RAZORPAY_LIVE_WEBHOOK_SECRET' : 'RAZORPAY_TEST_WEBHOOK_SECRET'),
  },
  adminBootstrapEmails: (process.env.ADMIN_BOOTSTRAP_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  // Shared secret for server-to-server partner integrations (e.g. Knowlarity's
  // get-destination-number lookup) — not a Firebase user token, since the
  // caller here is another company's backend, not a signed-in app user.
  partnerApiKey: process.env.PARTNER_API_KEY,
};
