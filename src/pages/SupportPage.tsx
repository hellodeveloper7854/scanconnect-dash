import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ChevronRight, FileText, LifeBuoy, Loader2, Paperclip, Plus, Send, X } from 'lucide-react';
import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardFooter } from '../components/DashboardFooter';
import { InlineNotice, type NoticeState } from '../components/Toast';
import { auth } from '../lib/firebase';
import { api, ApiError, getIdTokenOrNull, isAuthError, SIGN_IN_REQUIRED_MESSAGE } from '../lib/api';
import {
  ACCEPT_ATTR,
  CATEGORY_OPTIONS,
  MAX_FILES,
  MESSAGE_MAX,
  MESSAGE_MIN,
  STATUS_LABEL,
  SUBJECT_MAX,
  SUBJECT_MIN,
  addFiles,
  categoryLabel,
  fetchAttachmentUrl,
  formatBytes,
  formatDateTime,
  timeAgo,
  uploadAll,
  type TicketAttachmentMeta,
  type TicketCategory,
  type TicketDetail,
  type TicketMessage,
  type TicketStatus,
  type TicketSummary,
} from '../lib/tickets';

const STATUS_STYLE: Record<TicketStatus, string> = {
  OPEN: 'text-amber-800 bg-amber-100',
  IN_PROGRESS: 'text-sky-800 bg-sky-100',
  RESOLVED: 'text-emerald-800 bg-emerald-100',
  CLOSED: 'text-neutral-600 bg-neutral-200',
};

const StatusBadge: React.FC<{ status: TicketStatus }> = ({ status }) => (
  <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap ${STATUS_STYLE[status]}`}>
    {STATUS_LABEL[status]}
  </span>
);

const YELLOW_BTN =
  'inline-flex items-center justify-center gap-2 min-h-[44px] px-5 rounded-full bg-[#FFED00] text-[#1B1C1C] font-bold text-sm hover:brightness-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer transition';
const FIELD =
  'w-full rounded-xl border border-neutral-300 bg-white px-3 py-2.5 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[#FFED00] focus:border-neutral-900';

const messageFromError = (err: unknown, fallback: string) => (err instanceof ApiError ? err.message : fallback);

/* ------------------------------------------------------------------ files */

const FilePreviewList: React.FC<{ files: File[]; onRemove: (i: number) => void; disabled?: boolean }> = ({ files, onRemove, disabled }) => {
  const urls = useMemo(() => files.map((f) => (f.type.startsWith('image/') ? URL.createObjectURL(f) : null)), [files]);
  useEffect(() => () => urls.forEach((u) => u && URL.revokeObjectURL(u)), [urls]);
  if (files.length === 0) return null;
  return (
    <ul className="space-y-2">
      {files.map((f, i) => (
        <li key={`${f.name}-${f.size}-${f.lastModified}`} className="flex items-center gap-3 border border-neutral-200 rounded-xl p-2 bg-white">
          {urls[i] ? (
            <img src={urls[i]!} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
          ) : (
            <span className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-neutral-500" />
            </span>
          )}
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-semibold text-neutral-900 truncate">{f.name}</span>
            <span className="block text-xs text-neutral-500">{formatBytes(f.size)}</span>
          </span>
          <button
            type="button"
            onClick={() => onRemove(i)}
            disabled={disabled}
            aria-label={`Remove ${f.name}`}
            className="min-w-[44px] min-h-[44px] flex items-center justify-center text-neutral-500 hover:text-red-600 cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </li>
      ))}
    </ul>
  );
};

const AttachmentPicker: React.FC<{
  files: File[];
  onChange: (files: File[]) => void;
  onError: (messages: string[]) => void;
  disabled?: boolean;
}> = ({ files, onChange, onError, disabled }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const handlePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked: File[] = e.target.files ? Array.from(e.target.files) : [];
    e.target.value = '';
    const res = addFiles(files, picked);
    onChange(res.files);
    onError(res.errors);
  };
  return (
    <div className="space-y-2">
      <input ref={inputRef} type="file" accept={ACCEPT_ATTR} multiple className="hidden" onChange={handlePick} />
      <button
        type="button"
        disabled={disabled || files.length >= MAX_FILES}
        onClick={() => inputRef.current?.click()}
        className="inline-flex items-center gap-2 min-h-[44px] px-4 rounded-full border border-neutral-300 bg-white text-sm font-semibold text-neutral-800 hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <Paperclip className="w-4 h-4" /> Attach files ({files.length}/{MAX_FILES})
      </button>
      <p className="text-xs text-neutral-500">JPEG, PNG, WebP or PDF, up to 2 MB each.</p>
      <FilePreviewList files={files} onRemove={(i) => onChange(files.filter((_, idx) => idx !== i))} disabled={disabled} />
    </div>
  );
};

/* ------------------------------------------------------------- new ticket */

interface FieldErrors {
  subject?: string;
  message?: string;
}

const NewTicketForm: React.FC<{ onCreated: () => void; onView: (id: string) => void; onSignedOut: () => void }> = ({
  onCreated,
  onView,
  onSignedOut,
}) => {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState<TicketCategory>('ORDER');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [touched, setTouched] = useState({ subject: false, message: false });
  const [serverErrors, setServerErrors] = useState<FieldErrors>({});
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [created, setCreated] = useState<{ id: string; number: string; failedFiles: string[] } | null>(null);
  const dismissNotice = useCallback(() => setNotice(null), []);

  const errors: FieldErrors = {};
  const s = subject.trim();
  const m = message.trim();
  if (s.length < SUBJECT_MIN) errors.subject = `Subject must be at least ${SUBJECT_MIN} characters.`;
  else if (s.length > SUBJECT_MAX) errors.subject = `Subject must be at most ${SUBJECT_MAX} characters.`;
  if (m.length < MESSAGE_MIN) errors.message = `Message must be at least ${MESSAGE_MIN} characters.`;
  else if (m.length > MESSAGE_MAX) errors.message = `Message must be at most ${MESSAGE_MAX} characters.`;

  const shown = (k: keyof FieldErrors) => (touched[k] ? errors[k] : undefined) ?? serverErrors[k];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submittingRef.current) return;
    setTouched({ subject: true, message: true });
    setServerErrors({});
    if (errors.subject || errors.message) return;

    submittingRef.current = true;
    setSubmitting(true);
    setNotice(null);
    try {
      const res = await api.post<{ ticket: { id: string; number: string }; firstMessageId: string }>('/api/tickets', {
        subject: s,
        category,
        message: m,
      });
      const failedFiles = files.length ? await uploadAll(res.ticket.id, res.firstMessageId, files) : [];
      setCreated({ id: res.ticket.id, number: res.ticket.number, failedFiles });
      onCreated();
    } catch (err) {
      if (isAuthError(err)) {
        onSignedOut();
      } else if (err instanceof ApiError && err.status === 403) {
        setNotice({
          kind: 'error',
          message: 'Your name looks invalid. Please update your name in Profile (letters only), then try again.',
        });
      } else if (err instanceof ApiError && err.status === 429) {
        setNotice({ kind: 'error', message: 'You have created several tickets recently. Please wait a while before raising another.' });
      } else if (err instanceof ApiError && err.status === 400) {
        const fe = ((err.details as { error?: { fieldErrors?: Record<string, string[] | undefined> } } | null)?.error?.fieldErrors) ?? {};
        const next: FieldErrors = { subject: fe.subject?.[0], message: fe.message?.[0] };
        setServerErrors(next);
        if (!next.subject && !next.message) setNotice({ kind: 'error', message: err.message });
      } else {
        setNotice({ kind: 'error', message: messageFromError(err, 'Could not create the ticket. Please try again.') });
      }
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  if (created) {
    return (
      <div className="bg-white border border-neutral-200 rounded-2xl p-6 text-center space-y-4" role="status">
        <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
          <LifeBuoy className="w-6 h-6 text-emerald-700" />
        </div>
        <h2 className="text-xl font-black text-neutral-900">Ticket {created.number} created</h2>
        <p className="text-neutral-500 text-sm">Our support team will reply here. We&apos;ll notify you when they do.</p>
        {created.failedFiles.length > 0 && (
          <InlineNotice
            autoHideMs={0}
            onDismiss={() => setCreated({ ...created, failedFiles: [] })}
            notice={{
              kind: 'info',
              message: `The ticket was created, but these files could not be uploaded: ${created.failedFiles.join(', ')}. You can attach them in a reply.`,
            }}
            className="text-left"
          />
        )}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button className={YELLOW_BTN} onClick={() => onView(created.id)}>
            View ticket
          </button>
          <button
            className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-full border border-neutral-300 text-sm font-semibold cursor-pointer hover:bg-neutral-50"
            onClick={() => {
              setCreated(null);
              setSubject('');
              setMessage('');
              setFiles([]);
              setTouched({ subject: false, message: false });
            }}
          >
            Create another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-6 space-y-5">
      <InlineNotice notice={notice} onDismiss={dismissNotice} autoHideMs={0} />
      <div className="space-y-1.5">
        <label htmlFor="tk-subject" className="text-sm font-bold text-neutral-900">
          Subject
        </label>
        <input
          id="tk-subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, subject: true }))}
          maxLength={SUBJECT_MAX + 20}
          aria-invalid={!!shown('subject')}
          aria-describedby="tk-subject-err"
          disabled={submitting}
          className={FIELD}
          placeholder="Short summary of your issue"
        />
        <div className="flex justify-between gap-2 text-xs">
          <span id="tk-subject-err" className="text-red-600" role={shown('subject') ? 'alert' : undefined}>
            {shown('subject')}
          </span>
          <span className="text-neutral-400 shrink-0">
            {s.length}/{SUBJECT_MAX}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="tk-category" className="text-sm font-bold text-neutral-900">
          Category
        </label>
        <select
          id="tk-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as TicketCategory)}
          disabled={submitting}
          className={`${FIELD} min-h-[44px]`}
        >
          {CATEGORY_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="tk-message" className="text-sm font-bold text-neutral-900">
          Message
        </label>
        <textarea
          id="tk-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onBlur={() => setTouched((t) => ({ ...t, message: true }))}
          rows={6}
          aria-invalid={!!shown('message')}
          aria-describedby="tk-message-err"
          disabled={submitting}
          className={`${FIELD} resize-y`}
          placeholder="Describe the problem with as much detail as you can"
        />
        <div className="flex justify-between gap-2 text-xs">
          <span id="tk-message-err" className="text-red-600" role={shown('message') ? 'alert' : undefined}>
            {shown('message')}
          </span>
          <span className={`shrink-0 ${m.length > MESSAGE_MAX ? 'text-red-600' : 'text-neutral-400'}`}>
            {m.length}/{MESSAGE_MAX}
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <span className="text-sm font-bold text-neutral-900">
          Attachments <span className="font-normal text-neutral-500">(optional)</span>
        </span>
        <AttachmentPicker
          files={files}
          onChange={setFiles}
          onError={(errs) => setNotice(errs.length ? { kind: 'error', message: errs.join(' ') } : null)}
          disabled={submitting}
        />
      </div>

      <button type="submit" disabled={submitting} className={`${YELLOW_BTN} w-full sm:w-auto`}>
        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        {submitting ? 'Submitting...' : 'Submit ticket'}
      </button>
    </form>
  );
};

/* ------------------------------------------------------------------- list */

const FILTERS: { key: 'ALL' | TicketStatus; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'OPEN', label: 'Open' },
  { key: 'IN_PROGRESS', label: 'In progress' },
  { key: 'RESOLVED', label: 'Resolved' },
  { key: 'CLOSED', label: 'Closed' },
];

const TicketList: React.FC<{
  tickets: TicketSummary[] | null;
  error: string;
  filter: 'ALL' | TicketStatus;
  onFilter: (f: 'ALL' | TicketStatus) => void;
  onOpen: (id: string) => void;
  onNew: () => void;
  onRetry: () => void;
}> = ({ tickets, error, filter, onFilter, onOpen, onNew, onRetry }) => (
  <div className="space-y-4">
    <div role="group" aria-label="Filter by status" className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
      {FILTERS.map((f) => (
        <button
          key={f.key}
          onClick={() => onFilter(f.key)}
          aria-pressed={filter === f.key}
          className={`shrink-0 min-h-[44px] px-4 rounded-full text-sm font-semibold border cursor-pointer transition ${
            filter === f.key ? 'bg-[#1B1C1C] text-white border-[#1B1C1C]' : 'bg-white text-neutral-700 border-neutral-300 hover:bg-neutral-50'
          }`}
        >
          {f.label}
        </button>
      ))}
    </div>

    {error && (
      <div role="alert" className="border border-red-200 bg-red-50 text-red-800 rounded-xl px-4 py-3 text-sm flex items-center justify-between gap-3">
        <span>{error}</span>
        <button onClick={onRetry} className="font-bold underline min-h-[44px] cursor-pointer">
          Retry
        </button>
      </div>
    )}

    {tickets === null && !error && (
      <div className="flex items-center gap-2 text-neutral-500 py-10 justify-center">
        <Loader2 className="w-4 h-4 animate-spin" /> Loading tickets...
      </div>
    )}

    {tickets && tickets.length === 0 && (
      <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center space-y-3">
        <LifeBuoy className="w-8 h-8 mx-auto text-neutral-400" />
        <p className="font-bold text-neutral-900">{filter === 'ALL' ? 'No tickets yet' : `No ${STATUS_LABEL[filter as TicketStatus].toLowerCase()} tickets`}</p>
        <p className="text-sm text-neutral-500">Need help with an order, tag or payment? Raise a ticket and we&apos;ll get back to you.</p>
        <button className={YELLOW_BTN} onClick={onNew}>
          <Plus className="w-4 h-4" /> New Ticket
        </button>
      </div>
    )}

    {tickets && tickets.length > 0 && (
      <ul className="space-y-3">
        {tickets.map((t) => (
          <li key={t.id}>
            <button
              onClick={() => onOpen(t.id)}
              className="w-full min-h-[44px] text-left bg-white border border-neutral-200 rounded-2xl p-4 hover:border-neutral-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1B1C1C] cursor-pointer flex items-start gap-3"
            >
              <span className="min-w-0 flex-1 space-y-1.5">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  {t.unread > 0 && <span aria-label="Unread reply" className="w-2.5 h-2.5 rounded-full bg-red-500 shrink-0" />}
                  <span className="text-xs font-bold text-neutral-500">{t.number}</span>
                  <StatusBadge status={t.status} />
                  <span className="text-xs text-neutral-500">{categoryLabel(t.category)}</span>
                </span>
                <span className={`block text-neutral-900 break-words ${t.unread > 0 ? 'font-black' : 'font-bold'}`}>{t.subject}</span>
                {t.lastMessage && (
                  <span className="block text-sm text-neutral-500 line-clamp-2 break-words">
                    {t.lastMessage.sender === 'ADMIN' ? 'Support: ' : 'You: '}
                    {t.lastMessage.body}
                  </span>
                )}
                <span className="block text-xs text-neutral-400">Updated {timeAgo(t.lastMessageAt)}</span>
              </span>
              <ChevronRight className="w-5 h-5 text-neutral-400 shrink-0 mt-1" />
            </button>
          </li>
        ))}
      </ul>
    )}
  </div>
);

/* ----------------------------------------------------------------- detail */

const Lightbox: React.FC<{ url: string; name: string; onClose: () => void }> = ({ url, name, onClose }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div role="dialog" aria-modal="true" aria-label={name} className="fixed inset-0 z-[70] bg-black/80 flex items-center justify-center p-4" onClick={onClose}>
      <button onClick={onClose} aria-label="Close preview" className="absolute top-3 right-3 w-11 h-11 rounded-full bg-white text-neutral-900 flex items-center justify-center cursor-pointer">
        <X className="w-5 h-5" />
      </button>
      <img src={url} alt={name} className="max-w-full max-h-full object-contain rounded-lg" onClick={(e) => e.stopPropagation()} />
    </div>
  );
};

const TicketDetailView: React.FC<{
  ticketId: string;
  onBack: () => void;
  onNew: () => void;
  onSignedOut: () => void;
  onChanged: () => void;
}> = ({ ticketId, onBack, onNew, onSignedOut, onChanged }) => {
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loadError, setLoadError] = useState('');
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const dismissNotice = useCallback(() => setNotice(null), []);
  const [reply, setReply] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const sendingRef = useRef(false);
  const [closing, setClosing] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [lightbox, setLightbox] = useState<{ url: string; name: string } | null>(null);
  const blobUrls = useRef<Map<string, string>>(new Map());
  const endRef = useRef<HTMLDivElement>(null);
  const lastCount = useRef(0);

  const load = useCallback(
    async (silent: boolean) => {
      try {
        const res = await api.get<{ ticket: TicketDetail; messages: TicketMessage[] }>(`/api/tickets/${encodeURIComponent(ticketId)}`);
        setTicket(res.ticket);
        setMessages(res.messages);
        setLoadError('');
      } catch (err) {
        if (isAuthError(err)) return onSignedOut();
        if (!silent) setLoadError(err instanceof ApiError && err.status === 404 ? 'This ticket was not found.' : messageFromError(err, 'Failed to load ticket'));
      }
    },
    [ticketId, onSignedOut],
  );

  useEffect(() => {
    setTicket(null);
    load(false);
  }, [load]);

  // Poll every 15s while the tab is visible and the ticket is not closed.
  const isClosed = ticket?.status === 'CLOSED';
  useEffect(() => {
    if (!ticket || isClosed) return;
    const tick = () => {
      if (document.visibilityState === 'visible') load(true);
    };
    const id = setInterval(tick, 15000);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [ticket, isClosed, load]);

  // Scroll to the newest message when the conversation grows.
  useEffect(() => {
    if (messages.length > lastCount.current) endRef.current?.scrollIntoView({ block: 'nearest' });
    lastCount.current = messages.length;
  }, [messages.length]);

  useEffect(() => {
    const map = blobUrls.current;
    return () => map.forEach((u) => URL.revokeObjectURL(u));
  }, []);

  const openAttachment = async (a: TicketAttachmentMeta) => {
    const isImage = a.mimeType.startsWith('image/');
    // Open the tab synchronously so popup blockers allow it, then point it at the blob.
    const win = isImage ? null : window.open('', '_blank');
    try {
      let url = blobUrls.current.get(a.id);
      if (!url) {
        url = await fetchAttachmentUrl(a.id);
        blobUrls.current.set(a.id, url);
      }
      if (isImage) setLightbox({ url, name: a.fileName });
      else if (win) win.location.href = url;
    } catch (err) {
      win?.close();
      if (isAuthError(err)) return onSignedOut();
      setNotice({ kind: 'error', message: messageFromError(err, 'Could not open the attachment') });
    }
  };

  const sendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sendingRef.current) return;
    const body = reply.trim();
    if (!body) {
      setNotice({ kind: 'error', message: 'Please type a message.' });
      return;
    }
    if (body.length > MESSAGE_MAX) {
      setNotice({ kind: 'error', message: `Message must be at most ${MESSAGE_MAX} characters.` });
      return;
    }
    sendingRef.current = true;
    setSending(true);
    setNotice(null);
    try {
      const res = await api.post<{ message: TicketMessage }>(`/api/tickets/${encodeURIComponent(ticketId)}/messages`, { body });
      const failed = files.length ? await uploadAll(ticketId, res.message.id, files) : [];
      setReply('');
      setFiles([]);
      if (failed.length) setNotice({ kind: 'info', message: `Reply sent, but these files could not be uploaded: ${failed.join(', ')}.` });
      await load(true);
      onChanged();
    } catch (err) {
      if (isAuthError(err)) onSignedOut();
      else if (err instanceof ApiError && err.status === 409) {
        setNotice({ kind: 'error', message: err.message });
        load(true);
      } else setNotice({ kind: 'error', message: messageFromError(err, 'Could not send your reply. Please try again.') });
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  const closeTicket = async () => {
    setClosing(true);
    try {
      await api.patch(`/api/tickets/${encodeURIComponent(ticketId)}/status`, { status: 'CLOSED' });
      setConfirmClose(false);
      await load(true);
      onChanged();
    } catch (err) {
      if (isAuthError(err)) onSignedOut();
      else setNotice({ kind: 'error', message: messageFromError(err, 'Could not close the ticket') });
      setConfirmClose(false);
    } finally {
      setClosing(false);
    }
  };

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="inline-flex items-center gap-2 min-h-[44px] text-sm font-semibold text-neutral-700 hover:text-neutral-900 cursor-pointer">
        <ArrowLeft className="w-4 h-4" /> All tickets
      </button>

      {loadError && (
        <div role="alert" className="border border-red-200 bg-red-50 text-red-800 rounded-xl px-4 py-3 text-sm">
          {loadError}
        </div>
      )}
      {!ticket && !loadError && (
        <div className="flex items-center gap-2 text-neutral-500 py-10 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading ticket...
        </div>
      )}

      {ticket && (
        <>
          <div className="bg-white border border-neutral-200 rounded-2xl p-4 sm:p-5 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-neutral-500">{ticket.number}</span>
              <StatusBadge status={ticket.status} />
              <span className="text-xs text-neutral-500">{categoryLabel(ticket.category)}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-neutral-900 break-words">{ticket.subject}</h2>
            <p className="text-xs text-neutral-400">Opened {formatDateTime(ticket.createdAt)}</p>
            {!isClosed && (
              <div className="pt-1">
                {confirmClose ? (
                  <div className="flex flex-wrap items-center gap-2" role="alertdialog" aria-label="Confirm closing ticket">
                    <span className="text-sm text-neutral-700">Close this ticket? You will not be able to reply.</span>
                    <button onClick={closeTicket} disabled={closing} className="min-h-[44px] px-4 rounded-full bg-red-600 text-white text-sm font-bold disabled:opacity-50 cursor-pointer">
                      {closing ? 'Closing...' : 'Yes, close'}
                    </button>
                    <button onClick={() => setConfirmClose(false)} disabled={closing} className="min-h-[44px] px-4 rounded-full border border-neutral-300 text-sm font-semibold cursor-pointer">
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmClose(true)} className="min-h-[44px] px-4 rounded-full border border-neutral-300 text-sm font-semibold hover:bg-neutral-50 cursor-pointer">
                    Close ticket
                  </button>
                )}
              </div>
            )}
          </div>

          <ol className="space-y-3" aria-label="Conversation">
            {messages.map((m) => {
              const mine = m.sender === 'USER';
              return (
                <li key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] sm:max-w-[75%] rounded-2xl px-4 py-3 space-y-2 ${mine ? 'bg-[#FFED00] text-[#1B1C1C] rounded-br-sm' : 'bg-white border border-neutral-200 text-neutral-900 rounded-bl-sm'}`}>
                    <p className="text-xs font-bold opacity-70">{mine ? 'You' : 'Support'}</p>
                    <p className="text-sm whitespace-pre-wrap break-words">{m.body}</p>
                    {m.attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {m.attachments.map((a) => (
                          <button
                            key={a.id}
                            onClick={() => openAttachment(a)}
                            className="inline-flex items-center gap-1.5 min-h-[44px] max-w-full px-3 rounded-full bg-white/80 border border-neutral-300 text-xs font-semibold text-neutral-800 hover:bg-white cursor-pointer"
                          >
                            <Paperclip className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate max-w-[160px]">{a.fileName}</span>
                            <span className="text-neutral-500 shrink-0">{formatBytes(a.sizeBytes)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    <p className="text-[11px] opacity-60">{formatDateTime(m.createdAt)}</p>
                  </div>
                </li>
              );
            })}
            <div ref={endRef} />
          </ol>

          <InlineNotice notice={notice} onDismiss={dismissNotice} autoHideMs={0} />

          {isClosed ? (
            <div className="bg-neutral-100 border border-neutral-200 rounded-2xl p-4 text-sm text-neutral-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span>This ticket is closed and can no longer be replied to.</span>
              <button className={YELLOW_BTN} onClick={onNew}>
                Create a new ticket
              </button>
            </div>
          ) : (
            <form onSubmit={sendReply} className="bg-white border border-neutral-200 rounded-2xl p-4 space-y-3">
              {ticket.status === 'RESOLVED' && <p className="text-xs text-neutral-500">This ticket is marked resolved. Replying will reopen it.</p>}
              <label htmlFor="tk-reply" className="sr-only">
                Reply
              </label>
              <textarea
                id="tk-reply"
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                rows={3}
                disabled={sending}
                className={`${FIELD} resize-y`}
                placeholder="Write a reply..."
              />
              <AttachmentPicker
                files={files}
                onChange={setFiles}
                onError={(errs) => errs.length && setNotice({ kind: 'error', message: errs.join(' ') })}
                disabled={sending}
              />
              <div className="flex items-center justify-between gap-2">
                <span className={`text-xs ${reply.trim().length > MESSAGE_MAX ? 'text-red-600' : 'text-neutral-400'}`}>
                  {reply.trim().length}/{MESSAGE_MAX}
                </span>
                <button type="submit" disabled={sending || !reply.trim()} className={YELLOW_BTN}>
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {sending ? 'Sending...' : 'Send reply'}
                </button>
              </div>
            </form>
          )}
        </>
      )}
      {lightbox && <Lightbox url={lightbox.url} name={lightbox.name} onClose={() => setLightbox(null)} />}
    </div>
  );
};

/* ------------------------------------------------------------------- page */

/** Selected ticket lives in the URL (/support#ticket=<id> or /support/<id>) so Back returns to the list. */
const readSelectedId = (): string | null => {
  const hash = window.location.hash.match(/^#ticket=(.+)$/);
  if (hash) return decodeURIComponent(hash[1]);
  const p = window.location.pathname.match(/^\/support\/([^/]+)\/?$/i);
  return p ? decodeURIComponent(p[1]) : null;
};

export const SupportPage: React.FC = () => {
  const [authState, setAuthState] = useState<'loading' | 'in' | 'out'>('loading');
  const [userData, setUserData] = useState({ fullName: '', mobileNumber: '', email: '' });
  const [tab, setTab] = useState<'list' | 'new'>(() => (window.location.hash === '#new' ? 'new' : 'list'));
  const [selectedId, setSelectedId] = useState<string | null>(readSelectedId);
  const [filter, setFilter] = useState<'ALL' | TicketStatus>('ALL');
  const [tickets, setTickets] = useState<TicketSummary[] | null>(null);
  const [listError, setListError] = useState('');
  const pushedRef = useRef(false);

  const signedOut = useCallback(() => setAuthState('out'), []);

  useEffect(() => {
    let cancelled = false;
    getIdTokenOrNull().then(async (token) => {
      if (cancelled) return;
      if (!token) return setAuthState('out');
      setAuthState('in');
      try {
        const { user } = await api.get<{ user: { fullName: string; email: string; mobileNumber: string | null } }>('/api/auth/me');
        if (!cancelled) setUserData({ fullName: user.fullName, email: user.email, mobileNumber: user.mobileNumber ?? '' });
      } catch (err) {
        if (!cancelled && isAuthError(err)) setAuthState('out');
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onNav = () => {
      setSelectedId(readSelectedId());
      if (window.location.hash === '#new') setTab('new');
    };
    window.addEventListener('popstate', onNav);
    window.addEventListener('hashchange', onNav);
    return () => {
      window.removeEventListener('popstate', onNav);
      window.removeEventListener('hashchange', onNav);
    };
  }, []);

  const loadList = useCallback(async () => {
    try {
      const qs = filter === 'ALL' ? '' : `?status=${filter}`;
      const res = await api.get<{ tickets: TicketSummary[] }>(`/api/tickets${qs}`);
      setTickets(res.tickets);
      setListError('');
    } catch (err) {
      if (isAuthError(err)) return setAuthState('out');
      setListError(messageFromError(err, 'Failed to load tickets'));
    }
  }, [filter]);

  // Refresh whenever the list is on screen (after returning from a ticket, filter change, etc).
  useEffect(() => {
    if (authState === 'in' && tab === 'list' && !selectedId) loadList();
  }, [authState, tab, selectedId, loadList]);

  const changeFilter = (f: 'ALL' | TicketStatus) => {
    if (f === filter) return;
    setTickets(null);
    setFilter(f);
  };

  const openTicket = (id: string) => {
    window.history.pushState(null, '', `/support#ticket=${encodeURIComponent(id)}`);
    pushedRef.current = true;
    setSelectedId(id);
    window.scrollTo(0, 0);
  };

  const backToList = () => {
    if (pushedRef.current) {
      pushedRef.current = false;
      window.history.back();
    } else {
      window.history.replaceState(null, '', '/support');
      setSelectedId(null);
    }
  };

  const showNew = () => {
    if (selectedId) {
      window.history.replaceState(null, '', '/support#new');
      pushedRef.current = false;
      setSelectedId(null);
    }
    setTab('new');
  };

  const goLogin = () => {
    window.location.href = '/login';
  };

  const tabBtn = (key: 'list' | 'new', label: string) => {
    const active = tab === key && !(key === 'new' && selectedId);
    const activeList = key === 'list' && (tab === 'list' || !!selectedId);
    const on = key === 'list' ? activeList : active;
    return (
      <button
        role="tab"
        aria-selected={on}
        onClick={() => {
          if (key === 'list') {
            if (selectedId) backToList();
            setTab('list');
          } else showNew();
        }}
        className={`flex-1 min-h-[44px] px-4 rounded-full text-sm font-bold cursor-pointer transition ${on ? 'bg-[#FFED00] text-[#1B1C1C]' : 'text-neutral-600 hover:bg-neutral-100'}`}
      >
        {label}
      </button>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-neutral-900 font-sans antialiased">
      <DashboardHeader
        userData={userData}
        onLogout={() => {
          auth.signOut().finally(() => (window.location.href = '/'));
        }}
        activeNav="Support"
        isLoggedIn={authState === 'in'}
        onNavClick={(nav) => {
          const path = nav === 'How it works' ? '/#how-it-works' : nav === 'QR Scan' ? '/qr-scan' : nav === 'My Orders' ? '/orders' : `/${nav.toLowerCase()}`;
          window.location.href = path;
        }}
      />

      <main className="flex-1 py-8 sm:py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-black text-[#1B1C1C] tracking-[-0.4px]">Support</h1>
            <p className="text-[#5D5F5F] text-base sm:text-lg">
              Raise a ticket and track replies from our team. Looking for quick answers? Check the{' '}
              <a href="/faq" className="underline font-semibold text-neutral-900">
                FAQ
              </a>
              .
            </p>
          </div>

          {authState === 'loading' && (
            <div className="flex items-center gap-2 text-neutral-500 py-10 justify-center">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading...
            </div>
          )}

          {authState === 'out' && (
            <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center space-y-4">
              <LifeBuoy className="w-8 h-8 mx-auto text-neutral-400" />
              <p className="font-bold text-neutral-900">{SIGN_IN_REQUIRED_MESSAGE}</p>
              <p className="text-sm text-neutral-500">Sign in to create support tickets and view your conversations.</p>
              <button className={YELLOW_BTN} onClick={goLogin}>
                Sign in
              </button>
            </div>
          )}

          {authState === 'in' && (
            <>
              <div role="tablist" aria-label="Support" className="flex gap-1 p-1 bg-white border border-neutral-200 rounded-full">
                {tabBtn('list', 'My Tickets')}
                {tabBtn('new', 'New Ticket')}
              </div>

              {selectedId ? (
                <TicketDetailView
                  key={selectedId}
                  ticketId={selectedId}
                  onBack={backToList}
                  onNew={showNew}
                  onSignedOut={signedOut}
                  onChanged={() => undefined}
                />
              ) : tab === 'new' ? (
                <NewTicketForm
                  onCreated={() => undefined}
                  onView={(id) => {
                    setTab('list');
                    openTicket(id);
                  }}
                  onSignedOut={signedOut}
                />
              ) : (
                <TicketList
                  tickets={tickets}
                  error={listError}
                  filter={filter}
                  onFilter={changeFilter}
                  onOpen={openTicket}
                  onNew={showNew}
                  onRetry={loadList}
                />
              )}
            </>
          )}
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
};
