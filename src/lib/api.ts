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

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const idToken = await auth.currentUser?.getIdToken();

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
    throw new ApiError(data?.error ?? 'Request failed', res.status, data);
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
  const idToken = await auth.currentUser?.getIdToken();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { ...appEnvHeaders(), ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}) },
  });
  if (!res.ok) {
    throw new ApiError('Failed to download file', res.status);
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
