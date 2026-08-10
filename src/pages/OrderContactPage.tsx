import React, { useEffect, useState } from 'react';
import { Mail, Phone, ShieldCheck } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

interface OrderContact {
  orderId: string;
  createdAt: string;
  status: string;
  customer: { fullName: string; email: string; mobileNumber: string | null };
}

export const OrderContactPage: React.FC<{ token: string }> = ({ token }) => {
  const [data, setData] = useState<OrderContact | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/order-contact/${token}`)
      .then(async (res) => {
        if (!res.ok) throw new Error((await res.json().catch(() => null))?.error ?? 'Not found');
        return res.json();
      })
      .then(setData)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load'));
  }, [token]);

  return (
    <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl p-8 space-y-6 shadow-2xl">
        <div className="flex items-center gap-2 text-amber-500">
          <ShieldCheck className="w-5 h-5" />
          <span className="font-black uppercase tracking-wide text-xs">Order Contact Details</span>
        </div>

        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

        {!data && !error && <p className="text-neutral-500 text-sm">Loading...</p>}

        {data && (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-bold uppercase text-neutral-400">Order</p>
              <p className="font-mono text-neutral-900">{data.orderId.slice(0, 8).toUpperCase()}</p>
            </div>
            <div>
              <p className="text-xs font-bold uppercase text-neutral-400">Customer</p>
              <p className="text-neutral-900 font-bold">{data.customer.fullName}</p>
            </div>
            <div className="flex items-center gap-2 text-neutral-700">
              <Mail className="w-4 h-4 text-amber-500" />
              <a href={`mailto:${data.customer.email}`} className="hover:underline">
                {data.customer.email}
              </a>
            </div>
            {data.customer.mobileNumber && (
              <div className="flex items-center gap-2 text-neutral-700">
                <Phone className="w-4 h-4 text-amber-500" />
                <a href={`tel:${data.customer.mobileNumber}`} className="hover:underline">
                  {data.customer.mobileNumber}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
