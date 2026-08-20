import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface ResellerRow {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string | null;
  notes: string | null;
  createdAt: string;
}

export const AdminResellers: React.FC = () => {
  const [resellers, setResellers] = useState<ResellerRow[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<{ resellers: ResellerRow[] }>('/api/admin/resellers')
      .then((res) => setResellers(res.resellers))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load resellers'));
  }, []);

  if (error) return <div className="p-8 text-rose-400">{error}</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-black text-white uppercase tracking-wide">Reseller Requests</h1>

      {!resellers ? (
        <div className="text-white/60">Loading resellers...</div>
      ) : resellers.length === 0 ? (
        <div className="text-white/60">No reseller requests have been submitted yet.</div>
      ) : (
        <div className="overflow-x-auto border border-white/10 rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/50 uppercase text-xs border-b border-white/10">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Additional Info</th>
                <th className="px-4 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {resellers.map((r) => (
                <tr key={r.id} className="border-b border-white/5">
                  <td className="px-4 py-3 text-white">{r.name}</td>
                  <td className="px-4 py-3 text-white/80">{r.email}</td>
                  <td className="px-4 py-3 text-white/70 font-mono">{r.phone}</td>
                  <td className="px-4 py-3 text-white/70">{r.address ?? '—'}</td>
                  <td className="px-4 py-3 text-white/70 max-w-xs truncate" title={r.notes ?? ''}>
                    {r.notes ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-white/50 whitespace-nowrap">
                    {new Date(r.createdAt).toLocaleString()}
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
