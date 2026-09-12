import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
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
    keyId: required('RAZORPAY_KEY_ID'),
    keySecret: required('RAZORPAY_KEY_SECRET'),
    webhookSecret: required('RAZORPAY_WEBHOOK_SECRET'),
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
