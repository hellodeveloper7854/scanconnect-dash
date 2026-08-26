import React, { useEffect, useState } from 'react';
import { api } from '../../lib/api';

interface ContactRow {
  id: string;
  name: string;
  role: string | null;
  phone: string;
  email: string | null;
  isPrimary: boolean;
  createdAt: string;
  user: { fullName: string; email: string };
}

export const AdminEmergencyContacts: React.FC = () => {
  const [contacts, setContacts] = useState<ContactRow[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<{ contacts: ContactRow[] }>('/api/admin/emergency-contacts')
      .then((res) => setContacts(res.contacts))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load contacts'));
  }, []);

  if (error) return <div className="p-8 text-rose-400">{error}</div>;

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-black text-white uppercase tracking-wide">Emergency Contacts</h1>

      {!contacts ? (
        <div className="text-white/60">Loading contacts...</div>
      ) : contacts.length === 0 ? (
        <div className="text-white/60">No emergency contacts have been added yet.</div>
      ) : (
        <div className="overflow-x-auto border border-white/10 rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/50 uppercase text-xs border-b border-white/10">
                <th className="px-4 py-3">Account Owner</th>
                <th className="px-4 py-3">Contact</th>
                <th className="px-4 py-3">Relationship</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Priority</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((c) => (
                <tr key={c.id} className="border-b border-white/5">
                  <td className="px-4 py-3">
                    <div className="text-white">{c.user.fullName}</div>
                    <div className="text-white/40 text-xs">{c.user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-white/80">{c.name}</td>
                  <td className="px-4 py-3 text-white/70">{c.role ?? '—'}</td>
                  <td className="px-4 py-3 text-white/70 font-mono">{c.phone}</td>
                  <td className="px-4 py-3">
                    {c.isPrimary && (
                      <span className="text-xs font-bold uppercase px-2 py-1 rounded text-[#FFED00] bg-[#FFED00]/10">
                        Primary
                      </span>
                    )}
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
