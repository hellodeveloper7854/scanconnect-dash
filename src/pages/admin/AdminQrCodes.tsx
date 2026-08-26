import React, { useEffect, useState } from 'react';
import JSZip from 'jszip';
import { Download, Printer, X, Search, FileArchive, Trash2, AlertTriangle, ShieldOff, ShieldCheck } from 'lucide-react';
import { api, downloadFile } from '../../lib/api';
import { auth } from '../../lib/firebase';
import {
  StickerLang,
  StickerSize,
  STICKER_DIMENSIONS_PX,
  drawBrandedQrCanvas,
  canvasToBlob,
  fetchBrandedQrPngBlob,
  triggerBlobDownload,
} from '../../lib/qrSticker';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

/**
 * The QR PNG endpoint requires a Bearer token, which a plain <img src> can't
 * send, so this fetches the image as an authenticated blob and renders it via
 * an object URL instead.
 *
 * `onReady` reports back once this tile's final image (branded or not) is
 * actually painted, so callers that trigger window.print() can wait for every
 * tile to finish — otherwise the browser can snapshot the page mid-render and
 * capture some tiles before their branding has been composited in.
 */
const AuthedQrImage: React.FC<{
  id: string;
  alt: string;
  className?: string;
  branded?: boolean;
  lang?: StickerLang;
  size?: StickerSize;
  onReady?: () => void;
}> = ({ id, alt, className, branded, lang = 'en' as StickerLang, size = 'bike' as StickerSize, onReady }) => {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let objectUrl = '';
    let cancelled = false;

    auth.currentUser?.getIdToken().then(async (idToken) => {
      const qrUrl = `${API_BASE_URL}/api/admin/qr-codes/${id}/qr.png`;
      const blob = branded
        ? await fetchBrandedQrPngBlob(qrUrl, idToken, { lang, size })
        : await fetch(qrUrl, { headers: idToken ? { Authorization: `Bearer ${idToken}` } : {} }).then((r) => r.blob());
      if (cancelled) return;
      objectUrl = URL.createObjectURL(blob);
      setSrc(objectUrl);
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id, branded, lang, size]);

  if (!src) {
    const { width, height } = STICKER_DIMENSIONS_PX[size];
    return (
      <div
        className={`${className ?? ''} bg-neutral-100 animate-pulse`}
        style={{ aspectRatio: `${width} / ${height}`, width: '100%' }}
      />
    );
  }
  return <img src={src} alt={alt} className={className} onLoad={onReady} />;
};

interface QrCodeRow {
  id: string;
  code: string;
  status: 'INACTIVE' | 'ACTIVE' | 'DISABLED';
  batchId: string;
  batchName: string;
  createdAt: string;
  activatedAt: string | null;
  vehicle: {
    registration: string;
    nickname: string | null;
    user: { fullName: string; email: string };
  } | null;
}

interface BatchSummary {
  batchId: string;
  batchName: string;
  batchCreatedAt: string;
  total: number;
  activated: number;
}

/** Splits `items` into consecutive groups of at most `size`, e.g. for chunking into print pages. */
function chunk<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function buildFilterParams(filters: {
  statusFilter: string;
  batchFilter: string;
  nameFilter: string;
  dateFrom: string;
  dateTo: string;
}): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.statusFilter) params.set('status', filters.statusFilter);
  if (filters.batchFilter) params.set('batchId', filters.batchFilter);
  if (filters.nameFilter) params.set('name', filters.nameFilter);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  return params;
}

export const AdminQrCodes: React.FC = () => {
  const [codes, setCodes] = useState<QrCodeRow[] | null>(null);
  const [batches, setBatches] = useState<BatchSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [statusFilter, setStatusFilter] = useState('');
  const [batchFilter, setBatchFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [quantity, setQuantity] = useState(100);
  const [batchName, setBatchName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloadingZip, setIsDownloadingZip] = useState(false);
  const [error, setError] = useState('');
  const [printBatchId, setPrintBatchId] = useState<string | null>(null);
  const [printCodes, setPrintCodes] = useState<QrCodeRow[] | null>(null);
  const [readyTileCount, setReadyTileCount] = useState(0);
  const [stickerLang, setStickerLang] = useState<StickerLang>('en');
  const [stickerSize, setStickerSize] = useState<StickerSize>('bike');
  const [deleteTarget, setDeleteTarget] = useState<
    | { kind: 'code'; id: string; code: string }
    | { kind: 'batch'; batchId: string; batchName: string; total: number; activated: number }
    | null
  >(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [disableTarget, setDisableTarget] = useState<{ id: string; code: string; disabling: boolean } | null>(null);
  const [isTogglingDisable, setIsTogglingDisable] = useState(false);

  const load = () => {
    const params = buildFilterParams({ statusFilter, batchFilter, nameFilter, dateFrom, dateTo });
    params.set('page', String(page));
    params.set('pageSize', String(pageSize));
    api
      .get<{ codes: QrCodeRow[]; total: number; batches: BatchSummary[] }>(`/api/admin/qr-codes?${params}`)
      .then((res) => {
        setCodes(res.codes);
        setTotal(res.total);
        setBatches(res.batches);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load QR codes'));
  };

  // Filter changes should always jump back to page 1 — otherwise a narrower
  // filter can leave the user stranded on a page number that no longer has
  // any results.
  useEffect(() => {
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, batchFilter, nameFilter, dateFrom, dateTo, pageSize]);

  useEffect(() => {
    const handle = setTimeout(load, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, batchFilter, nameFilter, dateFrom, dateTo, page, pageSize]);

  const handleGenerate = async () => {
    if (!batchName.trim()) {
      setError('Please enter a name for this batch.');
      return;
    }
    setIsGenerating(true);
    setError('');
    try {
      const res = await api.post<{ batchId: string; quantity: number }>('/api/admin/qr-codes/bulk', {
        quantity,
        name: batchName.trim(),
      });
      setBatchFilter(res.batchId);
      setBatchName('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate batch');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadBrandedQrPng = async (id: string, code: string) => {
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const blob = await fetchBrandedQrPngBlob(
        `${API_BASE_URL}/api/admin/qr-codes/${id}/qr.png`,
        idToken,
        { lang: stickerLang, size: stickerSize },
      );
      triggerBlobDownload(blob, `qr-${code}-${stickerSize}-${stickerLang}.png`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download PNG');
    }
  };

  const handleDownloadZip = async () => {
    setIsDownloadingZip(true);
    setError('');
    try {
      const idToken = await auth.currentUser?.getIdToken();
      const params = new URLSearchParams(buildFilterParams({ statusFilter, batchFilter, nameFilter, dateFrom, dateTo }));
      params.set('pageSize', '5000');
      const { codes: allCodes } = await api.get<{ codes: QrCodeRow[] }>(`/api/admin/qr-codes?${params}`);

      const zip = new JSZip();
      for (const c of allCodes) {
        const blob = await fetchBrandedQrPngBlob(
          `${API_BASE_URL}/api/admin/qr-codes/${c.id}/qr.png`,
          idToken,
          { lang: stickerLang, size: stickerSize },
        );
        zip.file(`qr-${c.code}-${stickerSize}-${stickerLang}.png`, blob);
      }
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      triggerBlobDownload(zipBlob, `qr-codes-${stickerSize}-${stickerLang}-${Date.now()}.zip`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download ZIP');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const openPrintView = async (batchId: string) => {
    setPrintBatchId(batchId);
    setReadyTileCount(0);
    const params = new URLSearchParams({ batchId, pageSize: '5000' });
    const res = await api.get<{ codes: QrCodeRow[] }>(`/api/admin/qr-codes?${params}`);
    setPrintCodes(res.codes);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setError('');
    try {
      if (deleteTarget.kind === 'code') {
        await api.delete(`/api/admin/qr-codes/${deleteTarget.id}`);
      } else {
        await api.delete(`/api/admin/qr-codes/batch/${deleteTarget.batchId}`);
        if (batchFilter === deleteTarget.batchId) setBatchFilter('');
      }
      setDeleteTarget(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmToggleDisable = async () => {
    if (!disableTarget) return;
    setIsTogglingDisable(true);
    setError('');
    try {
      await api.patch(`/api/admin/qr-codes/${disableTarget.id}/status`, { disabled: disableTarget.disabling });
      setDisableTarget(null);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update QR code status');
    } finally {
      setIsTogglingDisable(false);
    }
  };

  return (
    <div className="p-8 space-y-6 print:p-0 print:space-y-0">
      <div className="print:hidden space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white uppercase tracking-wide">QR Code Management</h1>
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

      {/* Sticker language & vehicle size — applies to all branded downloads/prints below */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-wrap items-end gap-6">
        <div className="space-y-1">
          <label className="text-xs font-bold text-white/50 uppercase">Sticker Language</label>
          <div className="flex rounded-md overflow-hidden border border-white/10">
            {(['en', 'hi'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setStickerLang(l)}
                className={`h-10 px-4 text-xs font-bold uppercase cursor-pointer ${
                  stickerLang === l ? 'bg-[#FFED00] text-neutral-950' : 'bg-white/10 text-white/70 hover:bg-white/15'
                }`}
              >
                {l === 'en' ? 'English' : 'हिन्दी'}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-white/50 uppercase">Sticker Size</label>
          <div className="flex rounded-md overflow-hidden border border-white/10">
            {(['bike', 'car'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStickerSize(s)}
                className={`h-10 px-4 text-xs font-bold uppercase cursor-pointer ${
                  stickerSize === s ? 'bg-[#FFED00] text-neutral-950' : 'bg-white/10 text-white/70 hover:bg-white/15'
                }`}
              >
                {s === 'bike' ? 'Bike (4×2.5in)' : 'Car (8×5in)'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bulk generate */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-wrap items-end gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-white/50 uppercase">Batch Name</label>
          <input
            type="text"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
            placeholder="e.g. Mall Parking Lot A"
            className="w-56 h-10 px-3 bg-white/10 border border-white/10 text-white text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFED00]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-white/50 uppercase">Quantity</label>
          <input
            type="number"
            min={1}
            max={5000}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Math.min(5000, Number(e.target.value) || 1)))}
            className="w-32 h-10 px-3 bg-white/10 border border-white/10 text-white text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFED00]"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="h-10 px-5 bg-[#FFED00] hover:bg-[#e0ac00] text-neutral-950 font-black text-xs uppercase tracking-wide rounded-md disabled:opacity-60 cursor-pointer"
        >
          {isGenerating ? 'Generating...' : 'Generate Batch'}
        </button>
        <span className="text-white/40 text-xs">Max 5000 per batch.</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-white/40 uppercase">Name</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              placeholder="Search batch name"
              className="pl-9 pr-3 h-10 bg-white/10 border border-white/10 text-white text-sm rounded-md w-56 focus:outline-none focus:ring-2 focus:ring-[#FFED00]"
            />
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 bg-white/10 border border-white/10 text-white text-sm rounded-md cursor-pointer"
        >
          <option value="" className="bg-neutral-900 text-white">All statuses</option>
          <option value="INACTIVE" className="bg-neutral-900 text-white">Inactive</option>
          <option value="ACTIVE" className="bg-neutral-900 text-white">Active</option>
          <option value="DISABLED" className="bg-neutral-900 text-white">Disabled</option>
        </select>
        <select
          value={batchFilter}
          onChange={(e) => setBatchFilter(e.target.value)}
          className="h-10 px-3 bg-white/10 border border-white/10 text-white text-sm rounded-md cursor-pointer max-w-xs"
        >
          <option value="" className="bg-neutral-900 text-white">All batches</option>
          {batches.map((b) => (
            <option key={b.batchId} value={b.batchId} className="bg-neutral-900 text-white">
              {b.batchName} — {new Date(b.batchCreatedAt).toLocaleDateString()} — {b.activated}/{b.total} activated
            </option>
          ))}
        </select>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-white/40 uppercase">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="h-10 px-3 bg-white/10 border border-white/10 text-white text-sm rounded-md cursor-pointer [color-scheme:dark]"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-white/40 uppercase">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="h-10 px-3 bg-white/10 border border-white/10 text-white text-sm rounded-md cursor-pointer [color-scheme:dark]"
          />
        </div>
        {(dateFrom || dateTo) && (
          <button
            onClick={() => {
              setDateFrom('');
              setDateTo('');
            }}
            className="h-10 px-3 text-white/50 hover:text-white text-xs font-bold cursor-pointer"
          >
            Clear dates
          </button>
        )}
        <button
          onClick={handleDownloadZip}
          disabled={isDownloadingZip || total === 0}
          className="inline-flex items-center gap-1.5 h-10 px-4 bg-[#FFED00]/15 hover:bg-[#FFED00]/25 text-[#FFED00] text-xs font-bold rounded-md cursor-pointer disabled:opacity-50"
          title="Download every QR code matching the current filters as a ZIP of PNGs"
        >
          <FileArchive className="w-3.5 h-3.5" /> {isDownloadingZip ? 'Zipping...' : `Download ZIP (${total})`}
        </button>
        {batchFilter && (
          <>
            <button
              onClick={() => downloadFile(`/api/admin/qr-codes/${batchFilter}/download.csv`, `qr-batch-${batchFilter.slice(0, 8)}.csv`)}
              className="inline-flex items-center gap-1.5 h-10 px-4 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-md cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Download CSV
            </button>
            <button
              onClick={() => openPrintView(batchFilter)}
              className="inline-flex items-center gap-1.5 h-10 px-4 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-md cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" /> Print Batch
            </button>
            {(() => {
              const selectedBatch = batches.find((b) => b.batchId === batchFilter);
              if (!selectedBatch) return null;
              const hasActive = selectedBatch.activated > 0;
              return (
                <button
                  onClick={() => setDeleteTarget({ kind: 'batch', ...selectedBatch })}
                  disabled={hasActive}
                  title={hasActive ? 'Deactivate every code in this batch before deleting it' : 'Delete this entire batch'}
                  className="inline-flex items-center gap-1.5 h-10 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold rounded-md cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Batch
                </button>
              );
            })()}
          </>
        )}
      </div>

      {/* Table */}
      {!codes ? (
        <div className="text-white/60">Loading...</div>
      ) : codes.length === 0 ? (
        <div className="text-white/60">No QR codes found.</div>
      ) : (
        <div className="overflow-x-auto border border-white/10 rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/50 uppercase text-xs border-b border-white/10">
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Vehicle Owner</th>
                <th className="px-4 py-3">Batch</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Activated</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => (
                <tr key={c.id} className="border-b border-white/5">
                  <td className="px-4 py-3 text-white font-mono">{c.code}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                        c.status === 'ACTIVE'
                          ? 'text-emerald-400 bg-emerald-400/10'
                          : c.status === 'DISABLED'
                            ? 'text-rose-400 bg-rose-400/10'
                            : 'text-white/50 bg-white/5'
                      }`}
                    >
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {c.vehicle ? (
                      <>
                        <div className="text-white/80">{c.vehicle.user.fullName}</div>
                        <div className="text-white/40 text-xs">
                          {c.vehicle.nickname || c.vehicle.registration}
                        </div>
                      </>
                    ) : (
                      <span className="text-white/30">— unclaimed —</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/70 text-xs">{c.batchName}</td>
                  <td className="px-4 py-3 text-white/50 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-white/50 text-xs">
                    {c.activatedAt ? (
                      new Date(c.activatedAt).toLocaleString()
                    ) : (
                      <span className="text-white/20">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => downloadBrandedQrPng(c.id, c.code)}
                      className="p-1.5 text-white/50 hover:text-[#FFED00] cursor-pointer inline-block"
                      title="Download PNG"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDisableTarget({ id: c.id, code: c.code, disabling: c.status !== 'DISABLED' })}
                      className={`p-1.5 cursor-pointer inline-block ${
                        c.status === 'DISABLED' ? 'text-rose-400 hover:text-emerald-400' : 'text-white/50 hover:text-rose-400'
                      }`}
                      title={c.status === 'DISABLED' ? 'Re-enable this QR code' : 'Disable this QR code'}
                    >
                      {c.status === 'DISABLED' ? <ShieldCheck className="w-4 h-4" /> : <ShieldOff className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ kind: 'code', id: c.id, code: c.code })}
                      disabled={c.status === 'ACTIVE'}
                      className="p-1.5 text-white/50 hover:text-rose-400 cursor-pointer inline-block disabled:opacity-30 disabled:cursor-not-allowed"
                      title={c.status === 'ACTIVE' ? 'Deactivate this code before deleting it' : 'Delete this code'}
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

      {/* Pagination */}
      {total > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-white/30 text-xs">
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total} codes
          </p>
          <div className="flex items-center gap-3">
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
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
      </div>

      {/* Delete confirmation modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/10 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-500/15 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
              </div>
              <h2 className="font-black text-lg text-white">
                {deleteTarget.kind === 'code' ? 'Delete this QR code?' : 'Delete this batch?'}
              </h2>
            </div>

            <p className="text-sm text-white/70">
              {deleteTarget.kind === 'code' ? (
                <>
                  This will permanently delete code <span className="font-mono text-white">{deleteTarget.code}</span>.
                  This cannot be undone.
                </>
              ) : (
                <>
                  This will permanently delete all <span className="font-bold text-white">{deleteTarget.total}</span>{' '}
                  codes in batch <span className="font-bold text-white">{deleteTarget.batchName}</span>. This cannot
                  be undone.
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="h-10 px-4 text-white/70 hover:text-white text-sm font-bold rounded-md cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="h-10 px-4 bg-rose-500 hover:bg-rose-400 text-white text-sm font-bold rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Disable/enable confirmation modal */}
      {disableTarget && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-white/10 rounded-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  disableTarget.disabling ? 'bg-rose-500/15' : 'bg-emerald-500/15'
                }`}
              >
                {disableTarget.disabling ? (
                  <ShieldOff className="w-5 h-5 text-rose-400" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <h2 className="font-black text-lg text-white">
                {disableTarget.disabling ? 'Disable this QR code?' : 'Re-enable this QR code?'}
              </h2>
            </div>

            <p className="text-sm text-white/70">
              {disableTarget.disabling ? (
                <>
                  Scanning code <span className="font-mono text-white">{disableTarget.code}</span> will show a
                  &quot;this QR is disabled, please contact support&quot; message until it&apos;s re-enabled. The
                  linked vehicle and contact details are kept, not deleted.
                </>
              ) : (
                <>
                  Code <span className="font-mono text-white">{disableTarget.code}</span> will resume working exactly
                  as it did before it was disabled.
                </>
              )}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDisableTarget(null)}
                disabled={isTogglingDisable}
                className="h-10 px-4 text-white/70 hover:text-white text-sm font-bold rounded-md cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmToggleDisable}
                disabled={isTogglingDisable}
                className={`h-10 px-4 text-white text-sm font-bold rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                  disableTarget.disabling ? 'bg-rose-500 hover:bg-rose-400' : 'bg-emerald-500 hover:bg-emerald-400'
                }`}
              >
                {isTogglingDisable ? 'Saving...' : disableTarget.disabling ? 'Disable' : 'Re-enable'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Print modal */}
      {printBatchId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 print:relative print:bg-white print:p-0 print:block">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto p-6 print:max-w-none print:w-auto print:h-auto print:max-h-none print:overflow-visible print:rounded-none print:shadow-none print:p-0">
            <div className="flex items-center justify-between mb-4 print:hidden">
              <h2 className="font-black text-lg text-neutral-900">Print QR Batch</h2>
              <div className="flex items-center gap-3">
                {printCodes && readyTileCount < printCodes.length && (
                  <span className="text-xs text-neutral-500">
                    Preparing {readyTileCount}/{printCodes.length}...
                  </span>
                )}
                <button
                  onClick={() => window.print()}
                  disabled={!printCodes || readyTileCount < printCodes.length}
                  className="px-4 py-2 bg-[#FFED00] text-neutral-950 font-bold text-xs rounded-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Print
                </button>
                <button
                  onClick={() => {
                    setPrintBatchId(null);
                    setPrintCodes(null);
                  }}
                  className="p-2 text-neutral-500 hover:text-neutral-900 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            {!printCodes ? (
              <p className="text-neutral-500 text-sm">Loading codes...</p>
            ) : (
              <>
                {/* Letter paper (8.5x11in) at 0.15in margins fits 2x4=8 bike
                    tiles (4x2.5in each) or 1x2=2 car tiles (8x5in each) per
                    page. Chunking into one grid per page (instead of relying
                    on break-after on individual flex items) is what actually
                    keeps each page's tile count exact and stops tiles from
                    being split across a page boundary when printed. */}
                {chunk<QrCodeRow>(printCodes, stickerSize === 'bike' ? 8 : 2).map((pageCodes, pageIndex) => (
                  <div key={pageIndex} className={`qr-print-page qr-print-page--${stickerSize}`}>
                    {pageCodes.map((c) => (
                      <div key={c.id} className={`qr-print-tile qr-print-tile--${stickerSize}`}>
                        <AuthedQrImage
                          id={c.id}
                          alt={c.code}
                          branded
                          lang={stickerLang}
                          size={stickerSize}
                          onReady={() => setReadyTileCount((prev) => prev + 1)}
                        />
                        <span className="text-[10px] font-mono text-neutral-700">{c.code}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
