import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, Send, MessageCircle } from 'lucide-react';
import { api } from '../../lib/api';

type ThreadStatus = 'OPEN' | 'CLOSED';
type Filter = 'OPEN' | 'CLOSED' | 'ALL';

interface ChatUser {
  id: string;
  fullName: string | null;
  email: string | null;
  mobileNumber: string | null;
}

interface ThreadRow {
  id: string;
  status: ThreadStatus;
  adminUnread: number;
  lastMessageAt: string | null;
  createdAt: string;
  user: ChatUser;
  lastMessage: { sender: 'USER' | 'ADMIN'; body: string; createdAt: string } | null;
}

interface ThreadDetail {
  id: string;
  status: ThreadStatus;
  createdAt: string;
  lastMessageAt: string | null;
  user: ChatUser;
}

interface ChatMessage {
  id: string;
  sender: 'USER' | 'ADMIN';
  adminId?: string | null;
  body: string;
  createdAt: string;
}

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'OPEN', label: 'Open' },
  { key: 'CLOSED', label: 'Closed' },
  { key: 'ALL', label: 'All' },
];

const MAX_LEN = 2000;
const LIST_POLL_MS = 8000;
const THREAD_POLL_MS = 4000;

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

export const AdminLiveChat: React.FC = () => {
  const [filter, setFilter] = useState<Filter>('OPEN');
  const [threads, setThreads] = useState<ThreadRow[] | null>(null);
  const [listError, setListError] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [thread, setThread] = useState<ThreadDetail | null>(null);
  const [messages, setMessages] = useState<ChatMessage[] | null>(null);
  const [threadError, setThreadError] = useState('');
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [actionError, setActionError] = useState('');
  const [statusBusy, setStatusBusy] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const atBottomRef = useRef(true);
  const selectedRef = useRef<string | null>(null);
  selectedRef.current = selectedId;
  const filterRef = useRef<Filter>(filter);
  filterRef.current = filter;

  const loadList = useCallback(async () => {
    const f = filterRef.current;
    try {
      const res = await api.get<{ threads: ThreadRow[] }>(`/api/admin/chat/threads?status=${f}`);
      if (f !== filterRef.current) return;
      setThreads(res.threads);
      setListError('');
    } catch (err) {
      setListError(errMsg(err, 'Failed to load conversations'));
    }
  }, []);

  const loadThread = useCallback(async () => {
    const id = selectedRef.current;
    if (!id) return;
    try {
      const res = await api.get<{ thread: ThreadDetail; messages: ChatMessage[] }>(`/api/admin/chat/threads/${id}`);
      if (id !== selectedRef.current) return;
      setThread(res.thread);
      setMessages((prev) => {
        if (prev && prev.length === res.messages.length && prev[prev.length - 1]?.id === res.messages[res.messages.length - 1]?.id) {
          return prev;
        }
        return res.messages;
      });
      setThreadError('');
    } catch (err) {
      if (id === selectedRef.current) setThreadError(errMsg(err, 'Failed to load conversation'));
    }
  }, []);

  // List polling (restarts + refetches on filter change).
  useEffect(() => {
    setThreads(null);
  }, [filter]);
  usePolling(loadList, LIST_POLL_MS);
  useEffect(() => {
    loadList();
  }, [filter, loadList]);

  // Conversation polling.
  useEffect(() => {
    setThread(null);
    setMessages(null);
    setThreadError('');
    setActionError('');
    setDraft('');
    atBottomRef.current = true;
  }, [selectedId]);
  usePolling(loadThread, THREAD_POLL_MS, !!selectedId);

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

  const send = async () => {
    const body = draft.trim();
    if (!body || sending || !selectedId) return;
    setSending(true);
    setActionError('');
    try {
      const res = await api.post<{ message: ChatMessage }>(`/api/admin/chat/threads/${selectedId}/messages`, { body });
      setDraft('');
      atBottomRef.current = true;
      setMessages((prev) => (prev && !prev.some((m) => m.id === res.message.id) ? [...prev, res.message] : prev));
      loadThread();
      loadList();
    } catch (err) {
      setActionError(errMsg(err, 'Failed to send message'));
    } finally {
      setSending(false);
    }
  };

  const setStatus = async (status: ThreadStatus) => {
    if (!selectedId || statusBusy) return;
    setStatusBusy(true);
    setActionError('');
    try {
      await api.patch(`/api/admin/chat/threads/${selectedId}/status`, { status });
      await Promise.all([loadThread(), loadList()]);
    } catch (err) {
      setActionError(errMsg(err, 'Failed to update conversation'));
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

  const showConversation = !!selectedId;

  return (
    <div className="h-screen flex flex-col p-4 md:p-8 gap-4 print:hidden">
      <h1 className="text-2xl font-black text-white uppercase tracking-wide shrink-0">Live Chat</h1>

      <div className="flex-1 min-h-0 flex border border-white/10 rounded-xl overflow-hidden">
        {/* Conversation list */}
        <div
          className={`${showConversation ? 'hidden md:flex' : 'flex'} w-full md:w-80 lg:w-96 shrink-0 flex-col border-r border-white/10 min-h-0`}
        >
          <div className="flex items-center gap-2 p-3 border-b border-white/10 shrink-0">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  filter === f.key ? 'bg-[#FFED00] text-[#1B1C1C]' : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto">
            {listError && <div className="p-4 text-sm text-rose-400">{listError}</div>}
            {!threads ? (
              !listError && <div className="p-4 text-white/60 text-sm">Loading conversations...</div>
            ) : threads.length === 0 ? (
              <div className="p-4 text-white/60 text-sm">No {filter === 'ALL' ? '' : filter.toLowerCase() + ' '}conversations.</div>
            ) : (
              threads.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={`w-full text-left px-4 py-3 border-b border-white/5 cursor-pointer transition-colors ${
                    selectedId === t.id ? 'bg-[#FFED00]/10' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-white truncate">{t.user.fullName || 'Unnamed user'}</span>
                    <span className="text-xs text-white/40 shrink-0">{relativeTime(t.lastMessage?.createdAt ?? t.lastMessageAt ?? t.createdAt)}</span>
                  </div>
                  <div className="text-xs text-white/40 truncate">
                    {[t.user.mobileNumber, t.user.email].filter(Boolean).join(' · ') || '—'}
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <span className="text-sm text-white/60 truncate">
                      {t.lastMessage ? `${t.lastMessage.sender === 'ADMIN' ? 'You: ' : ''}${t.lastMessage.body}` : 'No messages yet'}
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      {t.status === 'CLOSED' && (
                        <span className="text-[10px] uppercase font-bold text-white/40 border border-white/20 rounded px-1">Closed</span>
                      )}
                      {t.adminUnread > 0 && (
                        <span className="min-w-5 h-5 px-1.5 rounded-full bg-[#FFED00] text-[#1B1C1C] text-xs font-black flex items-center justify-center">
                          {t.adminUnread}
                        </span>
                      )}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Conversation */}
        <div className={`${showConversation ? 'flex' : 'hidden md:flex'} flex-1 min-w-0 min-h-0 flex-col`}>
          {!selectedId ? (
            <div className="flex-1 flex flex-col items-center justify-center text-white/40 gap-2">
              <MessageCircle className="w-10 h-10" />
              <span>Select a conversation</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 shrink-0">
                <button
                  onClick={() => setSelectedId(null)}
                  className="md:hidden p-1 text-white/70 hover:text-white cursor-pointer"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-white truncate">{thread?.user.fullName || 'Unnamed user'}</div>
                  <div className="text-xs text-white/50 truncate">
                    {[thread?.user.mobileNumber, thread?.user.email].filter(Boolean).join(' · ')}
                  </div>
                </div>
                {thread && (
                  <button
                    onClick={() => setStatus(thread.status === 'OPEN' ? 'CLOSED' : 'OPEN')}
                    disabled={statusBusy}
                    className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-white/5 text-white/80 hover:bg-white/10 disabled:opacity-50 cursor-pointer shrink-0"
                  >
                    {thread.status === 'OPEN' ? 'Close conversation' : 'Reopen'}
                  </button>
                )}
              </div>

              <div ref={scrollRef} onScroll={onScroll} className="flex-1 overflow-y-auto p-4 space-y-3">
                {threadError && <div className="text-sm text-rose-400">{threadError}</div>}
                {!messages ? (
                  !threadError && <div className="text-white/60 text-sm">Loading messages...</div>
                ) : messages.length === 0 ? (
                  <div className="text-white/60 text-sm">No messages yet.</div>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className={`flex ${m.sender === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                          m.sender === 'ADMIN' ? 'bg-[#FFED00] text-[#1B1C1C]' : 'bg-white/10 text-white'
                        }`}
                      >
                        <div className="whitespace-pre-wrap break-words text-sm">{m.body}</div>
                        <div className={`text-[10px] mt-1 ${m.sender === 'ADMIN' ? 'text-[#1B1C1C]/60' : 'text-white/40'}`}>
                          {new Date(m.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-white/10 p-3 shrink-0 space-y-2">
                {actionError && <div className="text-sm text-rose-400">{actionError}</div>}
                {thread?.status === 'CLOSED' && (
                  <div className="text-xs text-white/40">This conversation is closed. Replying will reopen it.</div>
                )}
                <div className="flex items-end gap-2">
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value.slice(0, MAX_LEN))}
                    onKeyDown={onKeyDown}
                    rows={2}
                    maxLength={MAX_LEN}
                    placeholder="Type a reply... (Enter to send, Shift+Enter for new line)"
                    className="flex-1 resize-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#FFED00]/50"
                  />
                  <button
                    onClick={send}
                    disabled={sending || !draft.trim()}
                    className="h-10 px-4 rounded-lg bg-[#FFED00] text-[#1B1C1C] font-bold text-sm flex items-center gap-2 disabled:opacity-50 cursor-pointer"
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
    </div>
  );
};
