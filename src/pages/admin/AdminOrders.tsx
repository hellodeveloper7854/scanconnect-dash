import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface OrderRow {
  id: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  totalInPaise: number;
  createdAt: string;
  user: { fullName: string; email: string; mobileNumber: string | null };
  items: { quantity: number; product: { name: string } }[];
}

const STATUS_OPTIONS: OrderRow['status'][] = ['PENDING', 'PAID', 'FAILED', 'CANCELLED', 'REFUNDED'];

const statusColor: Record<OrderRow['status'], string> = {
  PENDING: 'text-amber-400 bg-amber-400/10',
  PAID: 'text-emerald-400 bg-emerald-400/10',
  FAILED: 'text-rose-400 bg-rose-400/10',
  CANCELLED: 'text-white/50 bg-white/5',
  REFUNDED: 'text-sky-400 bg-sky-400/10',
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
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Date</th>
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
                  <td className="px-4 py-3 text-white/50 text-xs">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
