import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export type NoticeKind = 'success' | 'error' | 'info';
export interface NoticeState {
  kind: NoticeKind;
  message: string;
}

const STYLES: Record<NoticeKind, string> = {
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  info: 'bg-amber-50 border-amber-200 text-amber-900',
};

const ICONS = { success: CheckCircle, error: AlertCircle, info: Info };

/** Small dismissible in-page notice. Auto-dismisses after `autoHideMs` (0 = never). */
export const InlineNotice: React.FC<{
  notice: NoticeState | null;
  onDismiss: () => void;
  autoHideMs?: number;
  className?: string;
}> = ({ notice, onDismiss, autoHideMs = 6000, className = '' }) => {
  useEffect(() => {
    if (!notice || !autoHideMs) return;
    const t = setTimeout(onDismiss, autoHideMs);
    return () => clearTimeout(t);
  }, [notice, autoHideMs, onDismiss]);

  if (!notice) return null;
  const Icon = ICONS[notice.kind];
  return (
    <div
      role={notice.kind === 'error' ? 'alert' : 'status'}
      className={`flex items-start gap-2 border rounded-xl px-3 py-2.5 text-sm ${STYLES[notice.kind]} ${className}`}
    >
      <Icon className="w-4 h-4 mt-0.5 shrink-0" />
      <span className="flex-1">{notice.message}</span>
      <button onClick={onDismiss} aria-label="Dismiss" className="shrink-0 opacity-60 hover:opacity-100 cursor-pointer">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

/** Fixed-position toast wrapper for screens without a convenient inline spot. */
export const ToastHost: React.FC<{ notice: NoticeState | null; onDismiss: () => void }> = ({ notice, onDismiss }) => (
  <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] w-[92%] max-w-md pointer-events-none">
    <div className="pointer-events-auto">
      <InlineNotice notice={notice} onDismiss={onDismiss} className="shadow-lg" />
    </div>
  </div>
);
