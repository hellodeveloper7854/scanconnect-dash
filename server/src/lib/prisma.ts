import { AsyncLocalStorage } from 'node:async_hooks';
import { PrismaClient } from '@prisma/client';
import { env } from './env.js';

/**
 * Two databases, one codebase: the live client (DATABASE_URL) and an optional
 * test client (TEST_DATABASE_URL). Each HTTP request is pinned to one of them
 * by the appEnv middleware, based on the environment the frontend declares
 * (VITE_APP_ENV -> X-App-Env header). `prisma` below is a proxy that resolves
 * to the current request's client, so every existing `prisma.x.y()` call keeps
 * working unchanged. Anything outside a request (webhooks registered before
 * the middleware, scripts) falls back to the live client.
 */
export type AppEnv = 'live' | 'test';

const liveClient = new PrismaClient();
let testClient: PrismaClient | null = null;

export function isTestDatabaseConfigured(): boolean {
  return Boolean(env.testDatabaseUrl);
}

function getTestClient(): PrismaClient {
  testClient ??= new PrismaClient({ datasourceUrl: env.testDatabaseUrl });
  return testClient;
}

const requestEnv = new AsyncLocalStorage<AppEnv>();

/** Runs `fn` (and everything it awaits) against the given environment's database. */
export function runWithAppEnv<T>(appEnv: AppEnv, fn: () => T): T {
  return requestEnv.run(appEnv, fn);
}

function currentClient(): PrismaClient {
  return requestEnv.getStore() === 'test' ? getTestClient() : liveClient;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = currentClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
