import { env } from './env.js';
import { currentAppEnv } from './prisma.js';

/**
 * Base URL of the frontend that QR links should open. A request pinned to the
 * test environment (see middleware/appEnv.ts) uses TEST_FRONTEND_URL when set,
 * so QR codes generated in test mode open the test site instead of production.
 */
export function frontendBaseUrl(): string {
  return currentAppEnv() === 'test' && env.testFrontendUrl ? env.testFrontendUrl : env.corsOrigin;
}
