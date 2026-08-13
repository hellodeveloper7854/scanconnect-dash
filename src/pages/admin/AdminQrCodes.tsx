import React, { useEffect, useState } from 'react';
import { Download, Printer, X, Search, FileArchive } from 'lucide-react';
import { api, downloadFile } from '../../lib/api';
import { auth } from '../../lib/firebase';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

/**
 * The QR PNG endpoint requires a Bearer token, which a plain <img src> can't
 * send, so this fetches the image as an authenticated blob and renders it via
 * an object URL instead.
 */
const AuthedQrImage: React.FC<{ id: string; alt: string; className?: string }> = ({ id, alt, className }) => {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let objectUrl = '';
    let cancelled = false;

    auth.currentUser?.getIdToken().then((idToken) => {
      fetch(`${API_BASE_URL}/api/admin/qr-codes/${id}/qr.png`, {
        headers: idToken ? { Authorization: `Bearer ${idToken}` } : {},
      })
        .then((res) => res.blob())
        .then((blob) => {
          if (cancelled) return;
          objectUrl = URL.createObjectURL(blob);
          setSrc(objectUrl);
        });
    });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [id]);

  if (!src) {
    return <div className={`${className ?? ''} bg-neutral-100 animate-pulse`} />;
  }
  return <img src={src} alt={alt} className={className} />;
};

interface QrCodeRow {
  id: string;
  code: string;
  status: 'INACTIVE' | 'ACTIVE';
  batchId: string;
  batchName: string;
  createdAt: string;
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

  const load = () => {
    const params = buildFilterParams({ statusFilter, batchFilter, nameFilter, dateFrom, dateTo });
    api
      .get<{ codes: QrCodeRow[]; total: number; batches: BatchSummary[] }>(`/api/admin/qr-codes?${params}`)
      .then((res) => {
        setCodes(res.codes);
        setTotal(res.total);
        setBatches(res.batches);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load QR codes'));
  };

  useEffect(() => {
    const handle = setTimeout(load, 300);
    return () => clearTimeout(handle);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, batchFilter, nameFilter, dateFrom, dateTo]);

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

  const handleDownloadZip = async () => {
    setIsDownloadingZip(true);
    setError('');
    try {
      const params = buildFilterParams({ statusFilter, batchFilter, nameFilter, dateFrom, dateTo });
      await downloadFile(`/api/admin/qr-codes/download.zip?${params}`, `qr-codes-${Date.now()}.zip`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download ZIP');
    } finally {
      setIsDownloadingZip(false);
    }
  };

  const openPrintView = async (batchId: string) => {
    setPrintBatchId(batchId);
    const params = new URLSearchParams({ batchId, pageSize: '5000' });
    const res = await api.get<{ codes: QrCodeRow[] }>(`/api/admin/qr-codes?${params}`);
    setPrintCodes(res.codes);
  };

  if (error) return <div className="p-8 text-rose-400">{error}</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white uppercase tracking-wide">QR Code Management</h1>
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
            className="w-56 h-10 px-3 bg-white/10 border border-white/10 text-white text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
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
            className="w-32 h-10 px-3 bg-white/10 border border-white/10 text-white text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="h-10 px-5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs uppercase tracking-wide rounded-md disabled:opacity-60 cursor-pointer"
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
              className="pl-9 pr-3 h-10 bg-white/10 border border-white/10 text-white text-sm rounded-md w-56 focus:outline-none focus:ring-2 focus:ring-amber-400"
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
          className="inline-flex items-center gap-1.5 h-10 px-4 bg-amber-400/15 hover:bg-amber-400/25 text-amber-400 text-xs font-bold rounded-md cursor-pointer disabled:opacity-50"
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
                        c.status === 'ACTIVE' ? 'text-emerald-400 bg-emerald-400/10' : 'text-white/50 bg-white/5'
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
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => downloadFile(`/api/admin/qr-codes/${c.id}/qr.png`, `qr-${c.code}.png`)}
                      className="p-1.5 text-white/50 hover:text-amber-400 cursor-pointer inline-block"
                      title="Download PNG"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-white/30 text-xs">{total} total codes</p>

      {/* Print modal */}
      {printBatchId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 print:bg-white print:p-0">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[85vh] overflow-y-auto p-6 print:max-h-none print:rounded-none print:shadow-none">
            <div className="flex items-center justify-between mb-4 print:hidden">
              <h2 className="font-black text-lg text-neutral-900">Print QR Batch</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-amber-400 text-neutral-950 font-bold text-xs rounded-md cursor-pointer"
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
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {printCodes.map((c) => (
                  <div key={c.id} className="flex flex-col items-center gap-1 p-2 border border-neutral-200 rounded-lg">
                    <AuthedQrImage id={c.id} alt={c.code} className="w-24 h-24" />
                    <span className="text-[10px] font-mono text-neutral-700">{c.code}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
