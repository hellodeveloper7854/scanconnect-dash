import { auth } from './firebase';

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

/**
 * Which backend database this build talks to — set VITE_APP_ENV=test for a
 * test build; anything else (or unset) is live. Sent on every API request so
 * the server can route it to the matching database.
 */
export const APP_ENV: 'test' | 'live' = import.meta.env.VITE_APP_ENV === 'test' ? 'test' : 'live';

/** Headers every API call must carry. Spread into any raw fetch() to the backend. */
export function appEnvHeaders(): Record<string, string> {
  return { 'X-App-Env': APP_ENV };
}

/** Appends ?appEnv=test to a backend URL for requests that can't carry headers, like <img src>. */
export function withAppEnv(url: string): string {
  return APP_ENV === 'test' ? `${url}${url.includes('?') ? '&' : '?'}appEnv=test` : url;
}

/** Waits for Firebase to restore the persisted session, then returns a fresh ID token (or null if signed out). */
export async function getIdTokenOrNull(): Promise<string | null> {
  try {
    await auth.authStateReady();
  } catch {
    /* fall through to currentUser */
  }
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken();
  } catch {
    return null;
  }
}

export const SIGN_IN_REQUIRED_MESSAGE = 'Please sign in to continue';

/** Raw server auth errors → friendly copy shown to users. */
export function friendlyMessage(message: string, status: number): string {
  const m = (message || '').toLowerCase();
  if (m.includes('missing bearer token') || m.includes('invalid or expired token') || m.includes('invalid firebase token') || m.includes('id-token-expired')) {
    return m.includes('expired') ? 'Your session has expired. Please sign in again.' : SIGN_IN_REQUIRED_MESSAGE;
  }
  if (status === 401 && (!message || message === 'Request failed')) return SIGN_IN_REQUIRED_MESSAGE;
  return message;
}

/** Server errors are either a string or a zod `flatten()` object ({ formErrors, fieldErrors }); turn either into text. */
export function extractErrorMessage(data: unknown, fallback = 'Request failed'): string {
  const err = (data as { error?: unknown } | null)?.error;
  if (typeof err === 'string') return err;
  if (err && typeof err === 'object') {
    const { formErrors, fieldErrors } = err as { formErrors?: string[]; fieldErrors?: Record<string, string[] | undefined> };
    if (formErrors?.length) return formErrors[0];
    if (fieldErrors) {
      for (const [field, msgs] of Object.entries(fieldErrors)) {
        if (msgs?.length) return `${field}: ${msgs[0]}`;
      }
    }
  }
  return fallback;
}

/** True when the error means the user is not (or no longer) signed in. */
export function isAuthError(err: unknown): boolean {
  return err instanceof ApiError && (err.status === 401 || err.message === SIGN_IN_REQUIRED_MESSAGE);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const idToken = await getIdTokenOrNull();

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...appEnvHeaders(),
      ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(friendlyMessage(extractErrorMessage(data), res.status), res.status, data);
  }

  return data as T;
}

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(typeof message === 'string' ? message : 'Request failed');
    this.status = status;
    this.details = details;
  }
}

export const api = {
  get: <T>(path: string) => request<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};

/**
 * Downloads a file from an authenticated endpoint. A plain <a href> can't
 * carry the Firebase bearer token, so this fetches with auth and saves the
 * response as a blob instead.
 */
export async function downloadFile(path: string, filename: string): Promise<void> {
  const idToken = await getIdTokenOrNull();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { ...appEnvHeaders(), ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}) },
  });
  if (!res.ok) {
    throw new ApiError(res.status === 401 ? SIGN_IN_REQUIRED_MESSAGE : 'Failed to download file', res.status);
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
