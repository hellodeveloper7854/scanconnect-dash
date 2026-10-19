import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Razorpay credentials for both modes. Which set a request uses is decided per
// request by the environment the frontend declares (X-App-Env, see
// middleware/appEnv.ts): test requests use RAZORPAY_TEST_*, everything else
// uses RAZORPAY_LIVE_*. A set may be left out entirely (that mode's payments
// then return 503), but a set that is present must be complete and its key id's
// rzp_test_/rzp_live_ prefix must match the mode — so a mismatched pair (e.g. a
// live key pasted into the test slot) fails fast at boot, not at checkout.
export interface RazorpayCredentials {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
}

function razorpayCredentials(mode: 'live' | 'test'): RazorpayCredentials | null {
  const prefix = `RAZORPAY_${mode.toUpperCase()}_`;
  const keyId = process.env[`${prefix}KEY_ID`];
  if (!keyId) return null;
  const expectedPrefix = mode === 'live' ? 'rzp_live_' : 'rzp_test_';
  if (!keyId.startsWith(expectedPrefix)) {
    throw new Error(`${prefix}KEY_ID must start with "${expectedPrefix}". Check your .env.`);
  }
  return {
    keyId,
    keySecret: required(`${prefix}KEY_SECRET`),
    webhookSecret: required(`${prefix}WEBHOOK_SECRET`),
  };
}

const razorpayLive = razorpayCredentials('live');
const razorpayTest = razorpayCredentials('test');
if (!razorpayLive && !razorpayTest) {
  throw new Error('Missing Razorpay credentials: set RAZORPAY_LIVE_* and/or RAZORPAY_TEST_* in .env');
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:3000',
  // Extra browser origins allowed to call the API (comma-separated), on top of
  // corsOrigin — e.g. a test frontend on Netlify. corsOrigin stays the single
  // primary URL because QR links are built from it.
  corsAllowedOrigins: [
    process.env.CORS_ORIGIN ?? 'http://localhost:3000',
    ...(process.env.CORS_ALLOWED_ORIGINS ?? '').split(','),
  ]
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean),
  databaseUrl: required('DATABASE_URL'),
  // Optional second database used when the frontend declares VITE_APP_ENV=test
  // (sent as the X-App-Env header). Requests that don't declare it use DATABASE_URL.
  testDatabaseUrl: process.env.TEST_DATABASE_URL,
  // Public URL of the test frontend. QR links built during a test-environment
  // request point here instead of corsOrigin, so scanning a test QR opens the test site.
  testFrontendUrl: process.env.TEST_FRONTEND_URL?.trim().replace(/\/+$/, ''),
  firebase: {
    projectId: required('FIREBASE_PROJECT_ID'),
    clientEmail: required('FIREBASE_CLIENT_EMAIL'),
    privateKey: required('FIREBASE_PRIVATE_KEY').replace(/\\n/g, '\n'),
  },
  razorpay: { live: razorpayLive, test: razorpayTest },
  adminBootstrapEmails: (process.env.ADMIN_BOOTSTRAP_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean),
  // Shared secret for server-to-server partner integrations (e.g. Knowlarity's
  // get-destination-number lookup) — not a Firebase user token, since the
  // caller here is another company's backend, not a signed-in app user.
  partnerApiKey: process.env.PARTNER_API_KEY,
  // Knowlarity account credentials, used to fetch the masked number shown to
  // scanners from the account's bought-numbers list. /:code/masked-call
  // returns 503 until both keys are set.
  knowlarity: {
    apiKey: process.env.KNOWLARITY_API_KEY, // sent as x-api-key (application access key)
    srApiKey: process.env.KNOWLARITY_SR_API_KEY, // sent as Authorization (SR API key)
    channel: process.env.KNOWLARITY_CHANNEL ?? 'Basic', // Basic | Advance | Premium | Enterprise
    // Optional comma-separated allow-list of live SR numbers. When set, these are
    // handed out (round-robin) instead of the account's bought-numbers list —
    // for numbers whose call flow isn't configured yet.
    maskedNumbers: (process.env.KNOWLARITY_MASKED_NUMBERS ?? '')
      .split(',')
      .map((n) => n.trim())
      .filter(Boolean),
    baseUrl: process.env.KNOWLARITY_BASE_URL ?? 'https://kpi.knowlarity.com',
  },
  // Gupshup WhatsApp template messaging. Optional; the QR message route
  // returns 503 until all three are set.
  gupshup: {
    userId: process.env.GUPSHUP_USER_ID, // client id, e.g. 2000XXXXXX
    token: process.env.GUPSHUP_TOKEN, // secret token (Bearer)
    templateId: process.env.GUPSHUP_TEMPLATE_ID, // whatsAppTemplateId of the approved template
    baseUrl: process.env.GUPSHUP_BASE_URL ?? 'https://mediaapi.smsgupshup.com',
  },
};
