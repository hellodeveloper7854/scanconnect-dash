import type { NextFunction, Request, Response } from 'express';
import { isTestDatabaseConfigured, runWithAppEnv } from '../lib/prisma.js';

/**
 * Picks the database for this request from the environment the frontend
 * declares: `X-App-Env: test` header, or `?appEnv=test` for requests that
 * can't carry headers (e.g. <img src>). Anything else — including no value —
 * means live, so a missing/garbled value can never route to the test
 * database by accident, and the live database is what webhooks and other
 * server-to-server callers (which send no such value) always use.
 */
export function appEnvMiddleware(req: Request, res: Response, next: NextFunction) {
  const declared = (req.header('x-app-env') ?? (typeof req.query.appEnv === 'string' ? req.query.appEnv : '')).toLowerCase();

  if (declared !== 'test') {
    return runWithAppEnv('live', next);
  }
  if (!isTestDatabaseConfigured()) {
    return res.status(400).json({ error: 'Test environment is not configured on this server' });
  }
  runWithAppEnv('test', next);
}
