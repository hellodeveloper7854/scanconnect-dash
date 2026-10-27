import { API_BASE_URL, ApiError, appEnvHeaders, extractErrorMessage, friendlyMessage, getIdTokenOrNull, SIGN_IN_REQUIRED_MESSAGE } from './api';

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type TicketCategory = 'ORDER' | 'TAG' | 'PAYMENT' | 'ACCOUNT' | 'OTHER';

export const CATEGORY_OPTIONS: { value: TicketCategory; label: string }[] = [
  { value: 'ORDER', label: 'Order' },
  { value: 'TAG', label: 'Tag / QR' },
  { value: 'PAYMENT', label: 'Payment' },
  { value: 'ACCOUNT', label: 'Account' },
  { value: 'OTHER', label: 'Other' },
];
export const categoryLabel = (c: string) => CATEGORY_OPTIONS.find((o) => o.value === c)?.label ?? c;

export const STATUS_LABEL: Record<TicketStatus, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export interface TicketSummary {
  id: string;
  number: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  unread: number;
  createdAt: string;
  lastMessageAt: string;
  lastMessage: { sender: 'USER' | 'ADMIN'; body: string; createdAt: string } | null;
}

export interface TicketAttachmentMeta {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface TicketMessage {
  id: string;
  sender: 'USER' | 'ADMIN';
  body: string;
  createdAt: string;
  attachments: TicketAttachmentMeta[];
}

export interface TicketDetail {
  id: string;
  number: string;
  subject: string;
  category: TicketCategory;
  status: TicketStatus;
  createdAt: string;
  lastMessageAt: string;
}

export const SUBJECT_MIN = 5;
export const SUBJECT_MAX = 120;
export const MESSAGE_MIN = 10;
export const MESSAGE_MAX = 4000;
export const MAX_FILES = 3;
export const MAX_FILE_BYTES = 2 * 1024 * 1024;
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
export const ACCEPT_ATTR = ALLOWED_TYPES.join(',');

export const formatBytes = (n: number) => (n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))} KB` : `${(n / 1024 / 1024).toFixed(1)} MB`);

/**
 * Adds `incoming` files to `current`, enforcing the 3-file / type / 2 MB limits.
 * Returns the new list plus one clear message per rejected file.
 */
export function addFiles(current: File[], incoming: File[]): { files: File[]; errors: string[] } {
  const files = [...current];
  const errors: string[] = [];
  for (const f of incoming) {
    if (files.length >= MAX_FILES) {
      errors.push(`You can attach up to ${MAX_FILES} files. "${f.name}" was not added.`);
      continue;
    }
    if (!ALLOWED_TYPES.includes(f.type)) {
      errors.push(`"${f.name}" is not supported. Only JPEG, PNG, WebP images or PDF files can be attached.`);
      continue;
    }
    if (f.size > MAX_FILE_BYTES) {
      errors.push(`"${f.name}" is ${formatBytes(f.size)}. Each file must be 2 MB or smaller.`);
      continue;
    }
    if (f.size === 0) {
      errors.push(`"${f.name}" is empty.`);
      continue;
    }
    if (files.some((x) => x.name === f.name && x.size === f.size && x.lastModified === f.lastModified)) continue;
    files.push(f);
  }
  return { files, errors };
}

/** Relative time like "just now", "5 min ago", "3 h ago", "2 d ago", else a short date. */
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const h = Math.floor(min / 60);
  if (h < 24) return `${h} h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d} d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export const formatDateTime = (iso: string) =>
  new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

/** Uploads one file as the raw request body to a message of the caller's ticket. */
export async function uploadTicketAttachment(ticketId: string, messageId: string, file: File): Promise<TicketAttachmentMeta> {
  const idToken = await getIdTokenOrNull();
  const res = await fetch(
    `${API_BASE_URL}/api/tickets/${encodeURIComponent(ticketId)}/messages/${encodeURIComponent(messageId)}/attachments`,
    {
      method: 'POST',
      headers: {
        'Content-Type': file.type,
        'X-File-Name': encodeURIComponent(file.name),
        ...appEnvHeaders(),
        ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}),
      },
      body: file,
    },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const fallback = res.status === 413 ? `"${file.name}" is too large (2 MB max).` : 'Failed to upload file';
    throw new ApiError(friendlyMessage(extractErrorMessage(data, fallback), res.status), res.status, data);
  }
  return (data as { attachment: TicketAttachmentMeta }).attachment;
}

/** Uploads files one by one; returns the names that failed. */
export async function uploadAll(ticketId: string, messageId: string, files: File[]): Promise<string[]> {
  const failed: string[] = [];
  for (const f of files) {
    try {
      await uploadTicketAttachment(ticketId, messageId, f);
    } catch {
      failed.push(f.name);
    }
  }
  return failed;
}

/** Fetches an attachment with the bearer token and returns a blob object URL (caller revokes). */
export async function fetchAttachmentUrl(attachmentId: string): Promise<string> {
  const idToken = await getIdTokenOrNull();
  const res = await fetch(`${API_BASE_URL}/api/tickets/attachments/${encodeURIComponent(attachmentId)}`, {
    headers: { ...appEnvHeaders(), ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}) },
  });
  if (!res.ok) {
    throw new ApiError(res.status === 401 ? SIGN_IN_REQUIRED_MESSAGE : 'Could not open the attachment', res.status);
  }
  return URL.createObjectURL(await res.blob());
}
