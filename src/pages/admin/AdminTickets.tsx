import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send, LifeBuoy, Search, Paperclip, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { api, API_BASE_URL, appEnvHeaders, getIdTokenOrNull } from '../../lib/api';

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
type Filter = TicketStatus | 'ALL';

interface TicketUser {
  id: string;
  fullName: string | null;
  email: string | null;
  mobileNumber: string | null;
}

interface Attachment {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
}

interface TicketRow {
  id: string;
  number: string;
  subject: string;
  category: string;
  status: TicketStatus;
  adminUnread: number;
  createdAt: string;
  lastMessageAt: string | null;
  user: TicketUser;
  lastMessage: { sender: 'USER' | 'ADMIN'; body: string; createdAt: string } | null;
}

interface TicketDetail {
  id: string;
  number: string;
  subject: string;
  category: string;
  status: TicketStatus;
  createdAt: string;
  lastMessageAt: string | null;
  user: TicketUser;
}

interface TicketMessage {
  id: string;
  sender: 'USER' | 'ADMIN';
  adminId?: string | null;
  body: string;
  createdAt: string;
  attachments: Attachment[];
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'OPEN', label: 'Open' },
  { key: 'IN_PROGRESS', label: 'In progress' },
  { key: 'RESOLVED', label: 'Resolved' },
  { key: 'CLOSED', label: 'Closed' },
  { key: 'ALL', label: 'All' },
];

const STATUS_OPTIONS: { key: TicketStatus; label: string }[] = [
  { key: 'OPEN', label: 'Open' },
  { key: 'IN_PROGRESS', label: 'In progress' },
  { key: 'RESOLVED', label: 'Resolved' },
  { key: 'CLOSED', label: 'Closed' },
];

const STATUS_STYLE: Record<TicketStatus, string> = {
  OPEN: 'text-sky-300 border-sky-300/40 bg-sky-300/10',
  IN_PROGRESS: 'text-amber-300 border-amber-300/40 bg-amber-300/10',
  RESOLVED: 'text-emerald-300 border-emerald-300/40 bg-emerald-300/10',
  CLOSED: 'text-white/50 border-white/20 bg-white/5',
};

const statusLabel = (s: string) => STATUS_OPTIONS.find((o) => o.key === s)?.label ?? s;
const categoryLabel = (c: string) => (c ? c.charAt(0) + c.slice(1).toLowerCase() : '');

const MAX_LEN = 4000;
const MAX_FILES = 3;
const MAX_FILE_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const LIST_POLL_MS = 10000;
const TICKET_POLL_MS = 5000;

/** A valid human name contains at least one letter (any script). */
const hasValidName = (name: string | null | undefined): boolean => !!name && /\p{L}/u.test(name);

/** Defensive display name: real name, else email / phone, else a neutral label. Never throws. */
const displayName = (u: Partial<TicketUser> | null | undefined): string => {
  if (u && hasValidName(u.fullName)) return (u.fullName as string).trim();
  return u?.email || u?.mobileNumber || 'Unnamed user';
};

const isInvalidName = (u: Partial<TicketUser> | null | undefined): boolean => !!u && !hasValidName(u.fullName);

const InvalidNameBadge: React.FC = () => (
  <span
    title="This user's registered name is not a valid name (no letters)."
    className="text-[10px] uppercase font-bold text-amber-400 border border-amber-400/40 bg-amber-400/10 rounded px-1 shrink-0"
  >
    Invalid name
  </span>
);

const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => (
  <span className={`text-[10px] uppercase font-bold border rounded px-1 shrink-0 ${STATUS_STYLE[status] ?? STATUS_STYLE.CLOSED}`}>
    {statusLabel(status)}
  </span>
);

const CategoryBadge: React.FC<{ category: string }> = ({ category }) => (
  <span className="text-[10px] uppercase font-bold text-white/60 border border-white/20 rounded px-1 shrink-0">
    {categoryLabel(category)}
  </span>
);

const errMsg = (err: unknown, fallback: string) => (err instanceof Error && err.message ? err.message : fallback);

const relativeTime = (iso: string | null): string => {
  if (!iso) return '';
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'now';
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(iso).toLocaleDateString();
};

const formatSize = (bytes: number) => (bytes >= 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`);

/** Runs `fn` immediately and then every `ms`, paused while the tab is hidden. */
function usePolling(fn: () => void, ms: number, enabled = true) {
  const ref = useRef(fn);
  ref.current = fn;
  useEffect(() => {
    if (!enabled) return;
    let timer: number | undefined;
    const start = () => {
      if (timer !== undefined) return;
      timer = window.setInterval(() => ref.current(), ms);
    };
    const stop = () => {
      if (timer !== undefined) {
        window.clearInterval(timer);
        timer = undefined;
      }
    };
    const onVis = () => {
      if (document.hidden) stop();
      else {
        ref.current();
        start();
      }
    };
    ref.current();
    if (!document.hidden) start();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      stop();
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [ms, enabled]);
}

/** Authenticated fetch of a ticket attachment as a Blob. */
async function fetchAttachmentBlob(att: Attachment): Promise<Blob> {
  const token = await getIdTokenOrNull();
  const res = await fetch(`${API_BASE_URL}/api/tickets/attachments/${att.id}`, {
    headers: { ...appEnvHeaders(), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!res.ok) throw new Error(res.status === 401 ? 'Please sign in to continue' : 'Failed to load attachment');
  const blob = await res.blob();
  return blob.type ? blob : new Blob([blob], { type: att.mimeType });
}

/** Uploads one file as a raw body to an admin reply message. */
async function uploadAttachment(ticketId: string, messageId: string, file: File): Promise<void> {
  const token = await getIdTokenOrNull();
  const res = await fetch(`${API_BASE_URL}/api/admin/tickets/${ticketId}/messages/${messageId}/attachments`, {
    method: 'POST',
    headers: {
      ...appEnvHeaders(),
      'Content-Type': file.type || 'application/octet-stream',
      'X-File-Name': encodeURIComponent(file.name),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: file,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const e = (data as { error?: unknown }).error;
    throw new Error(typeof e === 'string' ? e : 'Upload failed');
  }
}

interface DraftFile {
  key: string;
  file: File;
  preview: string | null;
}

const AttachmentChip: React.FC<{ att: Attachment; mine: boolean; onImage: (url: string, name: string) => void; onError: (m: string) => void }> = ({
  att,
  mine,
  onImage,
  onError,
}) => {
  const [busy, setBusy] = useState(false);
  const isImage = att.mimeType.startsWith('image/');

  const open = async () => {
    if (busy) return;
    setBusy(true);
    // Open the tab synchronously (inside the click) so popup blockers allow it.
    const win = !isImage ? window.open('', '_blank') : null;
    try {
      const blob = await fetchAttachmentBlob(att);
      const url = URL.createObjectURL(blob);
      if (isImage) {
        onImage(url, att.fileName);
      } else if (win) {
        win.location.href = url;
        window.setTimeout(() => URL.revokeObjectURL(url), 60000);
      } else {
        const a = document.createElement('a');
        a.href = url;
        a.download = att.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.setTimeout(() => URL.revokeObjectURL(url), 10000);
      }
    } catch (err) {
      win?.close();
      onError(errMsg(err, 'Failed to load attachment'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      onClick={open}
      disabled={busy}
      title={att.fileName}
      className={`flex items-center gap-2 min-h-11 max-w-full px-3 rounded-lg text-xs font-semibold border cursor-pointer disabled:opacity-60 ${
        mine ? 'border-[#1B1C1C]/30 bg-[#1B1C1C]/10 text-[#1B1C1C]' : 'border-white/20 bg-white/5 text-white'
      }`}
    >
      {isImage ? <Paperclip className="w-4 h-4 shrink-0" /> : <FileText className="w-4 h-4 shrink-0" />}
      <span className="truncate">{busy ? 'Opening...' : att.fileName}</span>
      <span className="opacity-60 shrink-0">{formatSize(att.sizeBytes)}</span>
    </button>
  );
};

export const AdminTickets: React.FC = () => {
  const [filter, setFilter] = useState<Filter>('OPEN');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [tickets, setTickets] = useState<TicketRow[] | null>(null);
  const [listError, setListError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [messages, setMessages] = useState<TicketMessage[] | null>(null);
  const [ticketError, setTicketError] = useState('');
  const [draft, setDraft] = useState('');
  const [files, setFiles] = useState<DraftFile[]>([]);
  const [sending, setSending] = useState(false);
  const [actionError, setActionError] = useState('');
  const [statusBusy, setStatusBusy] = useState(false);
  const [toast, setToast] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [lightbox, setLightbox] = useState<{ url: string; name: string } | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const atBottomRef = useRef(true);
  const selectedRef = useRef<string | null>(null);
  selectedRef.current = selectedId;
  const filterRef = useRef<Filter>(filter);
  filterRef.current = filter;
  const queryRef = useRef(query);
  queryRef.current = query;
  const filesRef = useRef<DraftFile[]>([]);
  filesRef.current = files;
  const lightboxRef = useRef<string | null>(null);
  lightboxRef.current = lightbox?.url ?? null;

  const showToast = useCallback((kind: 'ok' | 'err', text: string) => setToast({ kind, text }), []);
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Debounce search input.
  useEffect(() => {
    const t = window.setTimeout(() => setQuery(search.trim()), 300);
    return () => window.clearTimeout(t);
  }, [search]);

  // Revoke object URLs on unmount.
  useEffect(
    () => () => {
      filesRef.current.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
      if (lightboxRef.current) URL.revokeObjectURL(lightboxRef.current);
    },
    [],
  );

  const loadList = useCallback(async () => {
    const f = filterRef.current;
    const q = queryRef.current;
    try {
      const params = new URLSearchParams({ status: f });
      if (q) params.set('q', q);
      const res = await api.get<{ tickets: TicketRow[] }>(`/api/admin/tickets?${params.toString()}`);
      if (f !== filterRef.current || q !== queryRef.current) return;
      setTickets(res.tickets);
      setListError('');
    } catch (err) {
      setListError(errMsg(err, 'Failed to load tickets'));
    }
  }, []);

  const loadTicket = useCallback(async () => {
    const id = selectedRef.current;
    if (!id) return;
    try {
      const res = await api.get<{ ticket: TicketDetail; messages: TicketMessage[] }>(`/api/admin/tickets/${id}`);
      if (id !== selectedRef.current) return;
      setTicket(res.ticket);
      setMessages((prev) => {
        const last = (arr: TicketMessage[]) => arr[arr.length - 1];
        if (
          prev &&
          prev.length === res.messages.length &&
          last(prev)?.id === last(res.messages)?.id &&
          prev.reduce((n, m) => n + m.attachments.length, 0) === res.messages.reduce((n, m) => n + m.attachments.length, 0)
        ) {
          return prev;
        }
        return res.messages;
      });
      setTicketError('');
    } catch (err) {
      if (id === selectedRef.current) setTicketError(errMsg(err, 'Failed to load ticket'));
    }
  }, []);

  // List: reset to skeleton + refetch when filter/search changes, then poll.
  useEffect(() => {
    setTickets(null);
    loadList();
  }, [filter, query, loadList]);
  usePolling(loadList, LIST_POLL_MS);

  // Ticket: reset when selection changes, then poll.
  useEffect(() => {
    setTicket(null);
    setMessages(null);
    setTicketError('');
    setActionError('');
    setDraft('');
    setFiles((prev) => {
      prev.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
      return [];
    });
    atBottomRef.current = true;
  }, [selectedId]);
  usePolling(loadTicket, TICKET_POLL_MS, !!selectedId);

  // Auto-scroll only when already at bottom.
  useEffect(() => {
    const el = scrollRef.current;
    if (el && atBottomRef.current) el.scrollTop = el.scrollHeight;
  }, [messages]);

  const onScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    atBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
  };

  const closeLightbox = useCallback(() => {
    setLightbox((cur) => {
      if (cur) URL.revokeObjectURL(cur.url);
      return null;
    });
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeLightbox();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, closeLightbox]);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files];
    for (const file of Array.from(list)) {
      if (next.length >= MAX_FILES) {
        setActionError(`You can attach up to ${MAX_FILES} files.`);
        break;
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        setActionError(`${file.name}: only JPEG, PNG, WebP images or PDF files are allowed.`);
        continue;
      }
      if (file.size > MAX_FILE_BYTES) {
        setActionError(`${file.name}: file is larger than 2 MB.`);
        continue;
      }
      if (file.size === 0) {
        setActionError(`${file.name}: file is empty.`);
        continue;
      }
      next.push({
        key: `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      });
    }
    setFiles(next);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (key: string) => {
    setFiles((prev) => {
      const f = prev.find((x) => x.key === key);
      if (f?.preview) URL.revokeObjectURL(f.preview);
      return prev.filter((x) => x.key !== key);
    });
  };

  const send = async () => {
    const body = draft.trim();
    if (!body || sending || !selectedId) return;
    const id = selectedId;
    setSending(true);
    setActionError('');
    let msg: TicketMessage;
    try {
      const res = await api.post<{ message: TicketMessage }>(`/api/admin/tickets/${id}/messages`, { body });
      msg = res.message;
    } catch (err) {
      setActionError(errMsg(err, 'Failed to send reply'));
      setSending(false);
      return;
    }

    // Reply exists now: clear the text and upload the attachments.
    const toUpload = files;
    if (selectedRef.current === id) {
      setDraft('');
      atBottomRef.current = true;
      setMessages((prev) => (prev && !prev.some((m) => m.id === msg.id) ? [...prev, msg] : prev));
    }
    const failed: DraftFile[] = [];
    const failures: string[] = [];
    for (const f of toUpload) {
      try {
        await uploadAttachment(id, msg.id, f.file);
      } catch (err) {
        failed.push(f);
        failures.push(`${f.file.name}: ${errMsg(err, 'Upload failed')}`);
      }
    }
    toUpload.filter((f) => !failed.includes(f)).forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
    if (selectedRef.current === id) {
      setFiles(failed);
      if (failures.length) {
        setActionError(`Reply sent, but some attachments failed. Remove them or attach to a new reply. ${failures.join(' ')}`);
      }
      loadTicket();
    }
    loadList();
    setSending(false);
  };

  const changeStatus = async (status: TicketStatus) => {
    if (!selectedId || !ticket || statusBusy || status === ticket.status) return;
    setStatusBusy(true);
    setActionError('');
    try {
      await api.patch(`/api/admin/tickets/${selectedId}/status`, { status });
      showToast('ok', `Ticket ${ticket.number} marked as ${statusLabel(status)}.`);
      await Promise.all([loadTicket(), loadList()]);
    } catch (err) {
      showToast('err', errMsg(err, 'Failed to update status'));
    } finally {
      setStatusBusy(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      send();
    }
  };

  const showDetail = !!selectedId;

  return (
    <div className="h-[calc(100vh-3.5rem)] md:h-screen flex flex-col p-4 md:p-8 gap-4 print:hidden">
      <h1 className="text-2xl font-black text-white uppercase tracking-wide shrink-0">Support Tickets</h1>

      <div className="flex-1 min-h-0 flex border border-white/10 rounded-xl overflow-hidden">
        {/* Ticket list */}
        <div className={`${showDetail ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 shrink-0 flex-col border-r border-white/10 min-h-0`}>
          <div className="p-3 border-b border-white/10 shrink-0 space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subject, name, email, SC-1001"
                aria-label="Search tickets"
                className="w-full min-h-11 bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFED00]/50"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 min-h-11 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                    filter === f.key ? 'bg-[#FFED00] text-[#1B1C1C]' : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {listError && <div className="p-4 text-sm text-rose-400">{listError}</div>}
            {!tickets ? (
              !listError && (
                <div className="animate-pulse" aria-busy="true" aria-label="Loading tickets">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="px-4 py-3 border-b border-white/5 space-y-2">
                      <div className="h-4 w-2/3 rounded bg-white/10" />
                      <div className="h-3 w-1/2 rounded bg-white/5" />
                      <div className="h-3 w-5/6 rounded bg-white/5" />
                    </div>
                  ))}
                </div>
              )
            ) : tickets.length === 0 ? (
              <div className="p-4 text-white/60 text-sm">
                {query ? 'No tickets match your search.' : `No ${filter === 'ALL' ? '' : statusLabel(filter).toLowerCase() + ' '}tickets.`}
              </div>
            ) : (
              tickets.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`w-full text-left px-4 py-3 min-h-11 border-b border-white/5 cursor-pointer transition-colors ${
                    selectedId === t.id ? 'bg-[#FFED00]/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#FFED00] shrink-0">{t.number}</span>
                    <span className="text-xs text-white/40 shrink-0">{relativeTime(t.lastMessage?.createdAt ?? t.lastMessageAt ?? t.createdAt)}</span>
                  </div>
                  <div className="font-semibold text-white truncate">{t.subject}</div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-sm text-white/70 truncate">{displayName(t.user)}</span>
                    {isInvalidName(t.user) && <InvalidNameBadge />}
                  </div>
                  <div className="text-xs text-white/40 truncate">
                    {[t.user?.mobileNumber, t.user?.email].filter(Boolean).join(' · ') || '—'}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <CategoryBadge category={t.category} />
                    <StatusBadge status={t.status} />
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="text-sm text-white/60 truncate">
                      {t.lastMessage ? `${t.lastMessage.sender === 'ADMIN' ? 'You: ' : ''}${t.lastMessage.body}` : 'No messages yet'}
                    </span>
                    {t.adminUnread > 0 && (
                      <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#FFED00] text-[#1B1C1C] text-xs font-black flex items-center justify-center shrink-0">
                        {t.adminUnread}
                      </span>
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Ticket detail */}
        <div className={`${showDetail ? 'flex' : 'hidden md:flex'} flex-1 min-w-0 min-h-0 flex-col`}>
          {!selectedId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-white/40 gap-2">
              <LifeBuoy className="w-10 h-10" />
              <span>Select a ticket</span>
            </div>
          ) : (
            <>
              <div className="flex items-start gap-3 px-4 py-3 border-b border-white/10 shrink-0">
                <button
                  onClick={() => setSelectedId(null)}
                  className="md:hidden min-w-11 min-h-11 flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
                  aria-label="Back to tickets"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0 flex-1">
                  {ticket ? (
                    <>
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        <span className="text-xs font-bold text-[#FFED00] shrink-0">{ticket.number}</span>
                        <CategoryBadge category={ticket.category} />
                        <StatusBadge status={ticket.status} />
                      </div>
                      <div className="font-bold text-white break-words">{ticket.subject}</div>
                      <div className="flex items-center gap-2 min-w-0 mt-0.5">
                        <span className="text-sm text-white/80 truncate">{displayName(ticket.user)}</span>
                        {isInvalidName(ticket.user) && <InvalidNameBadge />}
                      </div>
                      <div className="text-xs text-white/50 break-all">
                        {[ticket.user?.mobileNumber, ticket.user?.email].filter(Boolean).join(' · ')}
                      </div>
                    </>
                  ) : (
                    <div className="space-y-1.5 animate-pulse" aria-busy="true" aria-label="Loading ticket">
                      <div className="h-3 w-24 rounded bg-white/10" />
                      <div className="h-4 w-56 rounded bg-white/10" />
                      <div className="h-3 w-40 rounded bg-white/5" />
                    </div>
                  )}
                </div>
                {ticket && (
                  <label className="shrink-0 flex flex-col gap-1 text-[10px] uppercase font-bold text-white/40">
                    Status
                    <select
                      value={ticket.status}
                      disabled={statusBusy}
                      onChange={(e) => changeStatus(e.target.value as TicketStatus)}
                      className="min-h-11 bg-white/5 border border-white/10 rounded-lg px-2 text-sm font-semibold normal-case text-white focus:outline-none focus:border-[#FFED00]/50 disabled:opacity-50 cursor-pointer"
                    >
                      {STATUS_OPTIONS.map((o) => (
                        <option key={o.key} value={o.key} className="bg-neutral-900">
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </label>
                )}
              </div>

              <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto p-4 space-y-3">
                {ticketError && <div className="text-sm text-rose-400">{ticketError}</div>}
                {!messages ? (
                  !ticketError && (
                    <div className="space-y-3 animate-pulse" aria-busy="true" aria-label="Loading messages">
                      <div className="h-16 w-3/5 rounded-2xl bg-white/10" />
                      <div className="h-12 w-2/5 rounded-2xl bg-white/10 ml-auto" />
                      <div className="h-10 w-1/2 rounded-2xl bg-white/10" />
                    </div>
                  )
                ) : messages.length === 0 ? (
                  <div className="text-white/60 text-sm">No messages yet.</div>
                ) : (
                  messages.map((m) => {
                    const mine = m.sender === 'ADMIN';
                    return (
                      <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] md:max-w-[80%] rounded-2xl px-4 py-2 ${mine ? 'bg-[#FFED00] text-[#1B1C1C]' : 'bg-white/10 text-white'}`}>
                          <div className={`text-[10px] font-bold uppercase mb-0.5 ${mine ? 'text-[#1B1C1C]/60' : 'text-white/40'}`}>
                            {mine ? 'You' : displayName(ticket?.user)}
                          </div>
                          <div className="whitespace-pre-wrap break-words text-sm">{m.body}</div>
                          {m.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {m.attachments.map((a) => (
                                <AttachmentChip
                                  key={a.id}
                                  att={a}
                                  mine={mine}
                                  onImage={(url, name) => setLightbox({ url, name })}
                                  onError={(t) => showToast('err', t)}
                                />
                              ))}
                            </div>
                          )}
                          <div className={`text-[10px] mt-1 ${mine ? 'text-[#1B1C1C]/60' : 'text-white/40'}`}>
                            {new Date(m.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="border-t border-white/10 p-3 shrink-0 space-y-2">
                {actionError && <div className="text-sm text-rose-400">{actionError}</div>}
                {(ticket?.status === 'CLOSED' || ticket?.status === 'RESOLVED') && (
                  <div className="text-xs text-white/40">This ticket is {statusLabel(ticket.status).toLowerCase()}. Replying will move it back to In progress.</div>
                )}
                {files.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {files.map((f) => (
                      <div key={f.key} className="flex items-center gap-2 pl-2 pr-1 min-h-11 rounded-lg border border-white/15 bg-white/5 max-w-full">
                        {f.preview ? (
                          <img src={f.preview} alt="" className="w-8 h-8 rounded object-cover shrink-0" />
                        ) : (
                          <FileText className="w-5 h-5 text-white/60 shrink-0" />
                        )}
                        <span className="text-xs text-white/80 truncate max-w-[10rem]">{f.file.name}</span>
                        <span className="text-[10px] text-white/40 shrink-0">{formatSize(f.file.size)}</span>
                        <button
                          onClick={() => removeFile(f.key)}
                          disabled={sending}
                          aria-label={`Remove ${f.file.name}`}
                          className="min-w-11 min-h-11 flex items-center justify-center text-white/60 hover:text-white cursor-pointer disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="flex items-end gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                    onChange={(e) => addFiles(e.target.files)}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={sending || files.length >= MAX_FILES}
                    aria-label="Attach files"
                    title={`Attach up to ${MAX_FILES} images or PDFs (max 2 MB each)`}
                    className="h-11 min-w-11 flex items-center justify-center rounded-lg bg-white/5 text-white/70 hover:bg-white/10 disabled:opacity-50 cursor-pointer"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value.slice(0, MAX_LEN))}
                    onKeyDown={onKeyDown}
                    rows={2}
                    maxLength={MAX_LEN}
                    placeholder="Type a reply... (Enter to send, Shift+Enter for new line)"
                    className="flex-1 min-w-0 resize-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFED00]/50"
                  />
                  <button
                    onClick={send}
                    disabled={sending || !draft.trim()}
                    className="h-11 px-4 rounded-lg bg-[#FFED00] text-[#1B1C1C] font-bold text-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    <Send className="w-4 h-4" /> {sending ? 'Sending' : 'Send'}
                  </button>
                </div>
                <div className="text-[10px] text-white/30 text-right">
                  {draft.length}/{MAX_LEN}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {toast && (
        <div
          role="status"
          className={`fixed bottom-4 right-4 left-4 sm:left-auto z-50 flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold shadow-lg border ${
            toast.kind === 'ok' ? 'bg-neutral-900 text-emerald-300 border-emerald-300/40' : 'bg-neutral-900 text-rose-300 border-rose-300/40'
          }`}
        >
          {toast.kind === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{toast.text}</span>
        </div>
      )}

      {lightbox && (
        <div
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.name}
        >
          <button
            onClick={closeLightbox}
            aria-label="Close image"
            className="absolute top-3 right-3 min-w-11 min-h-11 flex items-center justify-center rounded-full bg-white/10 text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <img src={lightbox.url} alt={lightbox.name} className="max-w-full max-h-full object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};
