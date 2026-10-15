import { useEffect, useState } from 'react';
import { auth } from './firebase';
import { api, API_BASE_URL, ApiError } from './api';

/**
 * Profile photo helpers. The photo lives on the backend (`/api/avatar`), shared
 * with the mobile app; GET is public so a plain <img src> works.
 */

const AVATAR_EVENT = 'avatar-changed';
const MAX_EDGE = 512;

let cachedUserId: string | null = null;
let version = Date.now();

function notifyChanged() {
  version = Date.now();
  window.dispatchEvent(new Event(AVATAR_EVENT));
}

export function avatarSrc(userId: string): string {
  return `${API_BASE_URL}/api/avatar/${userId}?v=${version}`;
}

/** Downscales to at most 512px and re-encodes as JPEG, so uploads stay small. */
async function resizeToJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Could not process the image'))), 'image/jpeg', 0.85),
  );
}

export async function uploadAvatar(file: File): Promise<void> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.');
  }
  const blob = await resizeToJpeg(file);
  const idToken = await auth.currentUser?.getIdToken();
  const res = await fetch(`${API_BASE_URL}/api/avatar`, {
    method: 'PUT',
    headers: { 'Content-Type': 'image/jpeg', ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}) },
    body: blob,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data?.error ?? 'Failed to upload photo', res.status, data);
  }
  notifyChanged();
}

export async function removeAvatar(): Promise<void> {
  await api.delete('/api/avatar');
  notifyChanged();
}

/**
 * The signed-in user's avatar URL (or null when signed out / not yet known),
 * refreshed whenever a photo is uploaded or removed anywhere in the app.
 * `failed` is set by the <img> onError when the user has no photo yet.
 */
export function useMyAvatar(isLoggedIn: boolean) {
  const [userId, setUserId] = useState<string | null>(isLoggedIn ? cachedUserId : null);
  const [, setTick] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) {
      cachedUserId = null;
      setUserId(null);
      return;
    }
    if (cachedUserId) {
      setUserId(cachedUserId);
    } else {
      api
        .get<{ user: { id: string } }>('/api/auth/me')
        .then((res) => {
          cachedUserId = res.user.id;
          setUserId(res.user.id);
        })
        .catch(() => undefined);
    }
    const onChange = () => setTick((t) => t + 1);
    window.addEventListener(AVATAR_EVENT, onChange);
    return () => window.removeEventListener(AVATAR_EVENT, onChange);
  }, [isLoggedIn]);

  return userId ? avatarSrc(userId) : null;
}
