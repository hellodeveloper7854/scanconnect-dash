import React, { useEffect, useState } from 'react';
import { QrCode, Download } from 'lucide-react';
import { api, withAppEnv } from '../../lib/api';
import { auth } from '../../lib/firebase';
import { fetchBrandedQrPngBlob, triggerBlobDownload, type StickerSize } from '../../lib/qrSticker';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

type FulfillmentStatus = 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED';

const FULFILLMENT_OPTIONS: { value: FulfillmentStatus; label: string }[] = [
  { value: 'PROCESSING', label: 'Processing' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
];

interface OrderRow {
  id: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  totalInPaise: number;
  createdAt: string;
  qrToken: string | null;
  stickerLanguage: 'en' | 'hi';
  fulfillmentStatus: FulfillmentStatus;
  courierName: string | null;
  trackingId: string | null;
  tags: { id: string; size: StickerSize; sequence: number; qrToken: string }[];
  user: { fullName: string; email: string; mobileNumber: string | null };
  items: { quantity: number; product: { name: string } }[];
  vehicle: { registration: string; nickname: string | null } | null;
  emergencyContact: { name: string; phone: string } | null;
}

const STATUS_OPTIONS: OrderRow['status'][] = ['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED'];

const statusColor: Record<OrderRow['status'], string> = {
  PENDING: 'text-[#FFED00] bg-[#FFED00]/10',
  PAID: 'text-emerald-400 bg-emerald-400/10',
  FAILED: 'text-rose-400 bg-rose-400/10',
  CANCELLED: 'text-white/50 bg-white/5',
  REFUNDED: 'text-sky-400 bg-sky-400/10',
};

/**
 * Dispatch status for one paid order: status, courier and tracking ID. The
 * customer sees these in the app's Order Details timeline (and gets a
 * notification when the status changes).
 */
const DeliveryEditor: React.FC<{ order: OrderRow; onSaved: () => void }> = ({ order, onSaved }) => {
  const [status, setStatus] = useState<FulfillmentStatus>(order.fulfillmentStatus);
  const [courier, setCourier] = useState(order.courierName ?? '');
  const [trackingId, setTrackingId] = useState(order.trackingId ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  if (order.status !== 'PAID') {
    return <span className="text-xs text-white/30">Not paid</span>;
  }

  const dirty =
    status !== order.fulfillmentStatus ||
    courier !== (order.courierName ?? '') ||
    trackingId !== (order.trackingId ?? '');

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      await api.patch(`/api/admin/orders/${order.id}/fulfillment`, {
        status,
        courierName: courier,
        trackingId,
      });
      onSaved();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-1.5 min-w-[170px]">
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as FulfillmentStatus)}
        className="w-full bg-white/10 border border-white/10 text-white text-xs rounded px-2 py-1"
      >
        {FULFILLMENT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value} className="text-black">
            {o.label}
          </option>
        ))}
      </select>
      <input
        value={courier}
        onChange={(e) => setCourier(e.target.value)}
        placeholder="Courier"
        maxLength={80}
        className="w-full bg-white/10 border border-white/10 text-white text-xs rounded px-2 py-1 placeholder:text-white/30"
      />
      <input
        value={trackingId}
        onChange={(e) => setTrackingId(e.target.value)}
        placeholder="Tracking ID"
        maxLength={80}
        className="w-full bg-white/10 border border-white/10 text-white text-xs rounded px-2 py-1 placeholder:text-white/30"
      />
      {dirty && (
        <button
          onClick={save}
          disabled={saving}
          className="w-full text-xs font-bold bg-[#FFED00] text-black rounded px-2 py-1 disabled:opacity-60 cursor-pointer"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      )}
      {message && <div className="text-[11px] text-rose-400">{message}</div>}
    </div>
  );
};

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [error, setError] = useState('');

  const load = () => {
    const query = statusFilter ? `?status=${statusFilter}` : '';
    api
      .get<{ orders: OrderRow[] }>(`/api/admin/orders${query}`)
      .then((res) => setOrders(res.orders))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load orders'));
  };

  useEffect(load, [statusFilter]);

  const updateStatus = async (id: string, status: OrderRow['status']) => {
    await api.patch(`/api/admin/orders/${id}/status`, { status });
    load();
  };

  const [previewToken, setPreviewToken] = useState<string | null>(null);

  if (error) return <div className="p-8 text-rose-400">{error}</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white uppercase tracking-wide">Orders</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/10 border border-white/10 text-white text-sm rounded-md px-3 py-2"
        >
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {!orders ? (
        <div className="text-white/60">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="text-white/60">No orders found.</div>
      ) : (
        <div className="overflow-x-auto border border-white/10 rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/50 uppercase text-xs border-b border-white/10">
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Items</th>
                <th className="px-4 py-3">Language</th>
                <th className="px-4 py-3">Vehicle</th>
                <th className="px-4 py-3">Emergency Contact</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Delivery</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">QR</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-b border-white/5">
                  <td className="px-4 py-3 font-mono text-white/70">{order.id.slice(0, 8)}</td>
                  <td className="px-4 py-3">
                    <div className="text-white">{order.user.fullName}</div>
                    <div className="text-white/40 text-xs">{order.user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {order.items.map((i) => `${i.product.name} x${i.quantity}`).join(', ')}
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {order.stickerLanguage === 'hi' ? 'हिन्दी (Hindi)' : 'English'}
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {order.vehicle ? (
                      <>
                        <div className="text-white">{order.vehicle.nickname || order.vehicle.registration}</div>
                        <div className="text-white/40 text-xs font-mono">{order.vehicle.registration}</div>
                      </>
                    ) : (
                      <span className="text-white/30">Not assigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {order.emergencyContact ? (
                      <>
                        <div className="text-white">{order.emergencyContact.name}</div>
                        <div className="text-white/40 text-xs">{order.emergencyContact.phone}</div>
                      </>
                    ) : (
                      <span className="text-white/30">Not assigned</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white">
                    {(order.totalInPaise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value as OrderRow['status'])}
                      className={`text-xs font-bold uppercase rounded px-2 py-1 border-0 ${statusColor[order.status]}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s} className="text-black">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <DeliveryEditor order={order} onSaved={load} />
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    {order.tags.length > 0 && (
                      <div className="space-y-1">
                        {order.tags.map((tag) => (
                          <button
                            key={tag.id}
                            onClick={async () => {
                              const idToken = await auth.currentUser?.getIdToken();
                              const blob = await fetchBrandedQrPngBlob(
                                `${API_BASE_URL}/api/order-contact/${tag.qrToken}/qr.png`,
                                idToken,
                                { lang: order.stickerLanguage, size: tag.size },
                              );
                              triggerBlobDownload(blob, `scanconnect-qr-${order.id.slice(0, 8)}-${tag.sequence}.png`);
                            }}
                            className="flex items-center gap-1.5 text-xs font-bold text-[#FFED00] hover:underline cursor-pointer"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Tag {tag.sequence} ({tag.size})
                          </button>
                        ))}
                      </div>
                    )}
                    {order.tags.length > 0 ? null : order.qrToken ? (
                      <button
                        onClick={() => setPreviewToken(order.qrToken)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FFED00] hover:underline cursor-pointer"
                      >
                        <QrCode className="w-3.5 h-3.5" />
                        View QR
                      </button>
                    ) : (
                      <span className="text-xs text-white/30">Not generated yet</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {previewToken && (
        <div
          className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4"
          onClick={() => setPreviewToken(null)}
        >
          <div
            className="bg-white rounded-xl p-6 max-w-xs w-full text-center space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-neutral-900 font-bold text-sm">Scan to view customer contact details</p>
            <img
              src={withAppEnv(`${API_BASE_URL}/api/order-contact/${previewToken}/qr.png`)}
              alt="Order QR code"
              className="w-full h-auto"
            />
            <p className="text-neutral-500 text-xs font-mono break-all">
              {window.location.origin}/order-contact/{previewToken}
            </p>
            <button
              onClick={() => setPreviewToken(null)}
              className="w-full h-9 bg-neutral-900 hover:bg-neutral-800 text-white text-sm font-bold rounded-md cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
