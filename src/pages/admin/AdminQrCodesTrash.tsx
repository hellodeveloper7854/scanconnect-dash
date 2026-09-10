import React, { useEffect, useState } from 'react';
import { RotateCcw, Trash2, X, AlertTriangle } from 'lucide-react';
import { api } from '../../lib/api';
import { formatQrDisplayId } from '../../lib/qrSticker';
import { AuthedQrImage, type QrCodeRow } from './AdminQrCodes';

/**
 * Trash view for QR codes soft-deleted from QR Code Management — deleting a
 * code there no longer removes it right away, it lands here instead so an
 * admin can restore it or, once they're sure, permanently remove it for good.
 */
export const AdminQrCodesTrash: React.FC = () => {
  const [codes, setCodes] = useState<QrCodeRow[] | null>(null);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [error, setError] = useState('');
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<{ id: string; code: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = () => {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
    api
      .get<{ codes: QrCodeRow[]; total: number }>(`/api/admin/qr-codes/deleted?${params}`)
      .then((res) => {
        setCodes(res.codes);
        setTotal(res.total);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load deleted QR codes'));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const handleRestore = async (id: string) => {
    setRestoringId(id);
    setError('');
    try {
      await api.post(`/api/admin/qr-codes/${id}/restore`, {});
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore QR code');
    } finally {
      setRestoringId(null);
    }
  };

  const confirmPermanentDelete = async () => {
    if (!permanentDeleteTarget) return;
    setIsDeleting(true);
    setError('');
    try {
      await api.delete(`/api/admin/qr-codes/${permanentDeleteTarget.id}/permanent`);
      setPermanentDeleteTarget(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to permanently delete QR code');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-wide">Recover QR Codes</h1>
          <p className="text-white/50 text-sm mt-1">
            QR codes deleted from QR Code Management land here first. Restore them or permanently delete them for good.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center justify-between gap-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm rounded-xl px-4 py-3">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError('')}
            className="text-rose-400 hover:text-rose-300 cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {!codes ? (
        <div className="text-white/60">Loading...</div>
      ) : codes.length === 0 ? (
        <div className="text-white/60">No deleted QR codes.</div>
      ) : (
        <div className="overflow-x-auto border border-white/10 rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/50 uppercase text-xs border-b border-white/10">
                <th className="px-4 py-3">QR</th>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">Deleted</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id} className="border-b border-white/5">
                  <td className="px-4 py-3">
                    <AuthedQrImage id={c.id} alt={c.code} className="w-10 h-10 rounded-md" />
                  </td>
                  <td className="px-4 py-3 text-[#FFED00] font-mono text-xs whitespace-nowrap">
                    {formatQrDisplayId(c.batchName, c.batchSeq)}
                  </td>
                  <td className="px-4 py-3 text-white font-mono">{c.code}</td>
                  <td className="px-4 py-3 text-white/70 text-xs">{c.batchName}</td>
                  <td className="px-4 py-3 text-white/50 text-xs">
                    {c.deletedAt ? new Date(c.deletedAt).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => handleRestore(c.id)}
                      disabled={restoringId === c.id}
                      title="Restore this QR code"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 cursor-pointer disabled:opacity-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> {restoringId === c.id ? 'Restoring...' : 'Restore'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPermanentDeleteTarget({ id: c.id, code: c.code })}
                      title="Permanently delete this QR code"
                      className="p-1.5 text-white/50 hover:text-rose-400 cursor-pointer inline-block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-white/30 text-xs">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} deleted codes
          </p>
          <div className="flex items-center gap-3">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="h-9 px-2 bg-white/10 border border-white/10 text-white text-xs rounded-md cursor-pointer"
            >
              {[25, 50, 100].map((size) => (
                <option key={size} value={size} className="bg-neutral-900 text-white">
                  {size} / page
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="h-9 px-3 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-white/50 text-xs">
              Page {page} of {Math.max(1, Math.ceil(total / pageSize))}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => (p * pageSize < total ? p + 1 : p))}
              disabled={page * pageSize >= total}
              className="h-9 px-3 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {permanentDeleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/10 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <h2 className="font-black text-lg text-white">Permanently delete this QR code?</h2>
            </div>

            <p className="text-sm text-white/70">
              This will permanently delete code{' '}
              <span className="font-mono text-white">{permanentDeleteTarget.code}</span>. This cannot be undone —
              it will no longer be recoverable from this trash view.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPermanentDeleteTarget(null)}
                disabled={isDeleting}
                className="h-10 px-4 text-white/70 hover:text-white text-sm font-bold rounded-md cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmPermanentDelete}
                disabled={isDeleting}
                className="h-10 px-4 bg-rose-500 hover:bg-rose-400 text-white text-sm font-bold rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete Permanently'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
