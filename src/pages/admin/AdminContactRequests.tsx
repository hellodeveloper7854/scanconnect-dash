import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface ContactRequestRow {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  createdAt: string;
}

export const AdminContactRequests: React.FC = () => {
  const [requests, setRequests] = useState<ContactRequestRow[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<{ contactRequests: ContactRequestRow[] }>('/api/admin/contact-requests')
      .then((res) => setRequests(res.contactRequests))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load contact requests'));
  }, []);

  if (error) return <div className="p-8 text-rose-400">{error}</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-black text-white uppercase tracking-wide">Contact Us Requests</h1>

      {!requests ? (
        <div className="text-white/60">Loading requests...</div>
      ) : requests.length === 0 ? (
        <div className="text-white/60">No contact requests have been submitted yet.</div>
      ) : (
        <div className="overflow-x-auto border border-white/10 rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/50 uppercase text-xs border-b border-white/10">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Subject</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((r) => (
                <tr key={r.id} className="border-b border-white/5">
                  <td className="px-4 py-3 text-white">{r.fullName}</td>
                  <td className="px-4 py-3 text-white/80">{r.email}</td>
                  <td className="px-4 py-3 text-white/70 font-mono">{r.phone ?? '—'}</td>
                  <td className="px-4 py-3 text-white/70">{r.subject}</td>
                  <td className="px-4 py-3 text-white/70 max-w-sm truncate" title={r.message}>
                    {r.message}
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
