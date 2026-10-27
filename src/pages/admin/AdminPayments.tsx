import React, { useEffect, useState } from 'react';
import { IndianRupee, RotateCcw } from 'lucide-react';
import { api } from '../../lib/api';

interface PaymentRow {
  id: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  totalInPaise: number;
  razorpayPaymentId: string | null;
  createdAt: string;
  user: { fullName: string; email: string };
}

const statusColor: Record<PaymentRow['status'], string> = {
  PENDING: 'text-[#FFED00] bg-[#FFED00]/10',
  PAID: 'text-emerald-400 bg-emerald-400/10',
  FAILED: 'text-rose-400 bg-rose-400/10',
  CANCELLED: 'text-white/50 bg-white/5',
  REFUNDED: 'text-sky-400 bg-sky-400/10',
};

const formatMoney = (paise: number) =>
  (paise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });

export const AdminPayments: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRow[] | null>(null);
  const [summary, setSummary] = useState<{ totalRevenueInPaise: number; totalRefundedInPaise: number } | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [showUnpaid, setShowUnpaid] = useState(false);
  const [total, setTotal] = useState(0);

  const load = () => {
    // Server-side filter, applied before paging, when unpaid attempts are hidden.
    const query = `?pageSize=100${statusFilter ? `&status=${statusFilter}` : ''}${showUnpaid ? '' : '&hasPaymentId=true'}`;
    api
      .get<{ payments: PaymentRow[]; summary: typeof summary; total?: number }>(`/api/admin/payments${query}`)
      .then((res) => {
        setPayments(res.payments);
        setSummary(res.summary);
        setTotal(res.total ?? res.payments.length);
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load payments'));
  };

  useEffect(load, [statusFilter, showUnpaid]);

  // The API lists every order. Orders that never produced a Razorpay payment
  // (PENDING / FAILED / abandoned checkouts) have no payment id, so by default
  // only records with a payment id are shown.
  const hasPaymentId = (p: PaymentRow) => !!p.razorpayPaymentId?.trim();
  const visible = payments ? (showUnpaid ? payments : payments.filter(hasPaymentId)) : null;
  const hiddenCount = payments && visible ? payments.length - visible.length : 0;
  const listedPaise = visible ? visible.reduce((sum, p) => sum + p.totalInPaise, 0) : 0;

  if (error) return <div className="p-4 md:p-8 text-rose-400">{error}</div>;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-black text-white uppercase tracking-wide">Payments</h1>
        <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 min-h-11 text-sm text-white/70 cursor-pointer">
          <input
            type="checkbox"
            checked={showUnpaid}
            onChange={(e) => setShowUnpaid(e.target.checked)}
            className="w-4 h-4 accent-[#FFED00] cursor-pointer"
          />
          Show unpaid attempts
        </label>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/10 border border-white/10 text-white text-sm rounded-md px-3 min-h-11"
        >
          <option value="">All statuses</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
          <option value="REFUNDED">Refunded</option>
          <option value="PENDING">Pending</option>
        </select>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wide text-white/50">Total Revenue</span>
              <IndianRupee className="w-4 h-4 text-[#FFED00]" />
            </div>
            <div className="text-2xl font-black text-white">{formatMoney(summary.totalRevenueInPaise)}</div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wide text-white/50">Total Refunded</span>
              <RotateCcw className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl font-black text-white">{formatMoney(summary.totalRefundedInPaise)}</div>
          </div>
        </div>
      )}

      {visible && (
        <p className="text-xs text-white/50">
          Showing {visible.length} {showUnpaid ? 'record(s)' : 'payment(s) with a payment ID'} · listed amount{' '}
          {formatMoney(listedPaise)}
          {!showUnpaid && hiddenCount > 0 && ` · ${hiddenCount} unpaid attempt(s) hidden`}
          {total > (payments?.length ?? 0) && ` · latest ${payments?.length} of ${total} orders loaded`}
        </p>
      )}

      {!visible ? (
        <div className="text-white/60">Loading payments...</div>
      ) : visible.length === 0 ? (
        <div className="text-white/60">No payments found.</div>
      ) : (
        <div className="overflow-x-auto border border-white/10 rounded-xl">
          <table className="w-full min-w-[640px] text-sm [&_th:first-child]:sticky [&_td:first-child]:sticky [&_th:first-child]:left-0 [&_td:first-child]:left-0 [&_th:first-child]:bg-neutral-950 [&_td:first-child]:bg-neutral-950">
            <thead>
              <tr className="text-left text-white/50 uppercase text-xs border-b border-white/10">
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Razorpay Payment ID</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((p) => (
                <tr key={p.id} className="border-b border-white/5">
                  <td className="px-4 py-3">
                    <div className="text-white">{p.user?.fullName || '—'}</div>
                    <div className="text-white/40 text-xs">{p.user?.email || '—'}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-white/70">
                    {hasPaymentId(p) ? (
                      p.razorpayPaymentId
                    ) : (
                      <span className="font-sans text-xs italic text-white/40">No payment (abandoned)</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white">{formatMoney(p.totalInPaise)}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${statusColor[p.status]}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs">{new Date(p.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
