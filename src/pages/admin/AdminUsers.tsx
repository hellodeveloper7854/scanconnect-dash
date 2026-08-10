import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api } from '../../lib/api';

interface UserRow {
  id: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  mobileNumber: string | null;
  mobileVerified: boolean;
  role: 'USER' | 'ADMIN';
  isSuspended: boolean;
  createdAt: string;
}

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserRow[] | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    api
      .get<{ users: UserRow[] }>(`/api/admin/users${query}`)
      .then((res) => setUsers(res.users))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load users'));
  };

  useEffect(() => {
    const handle = setTimeout(load, 300);
    return () => clearTimeout(handle);
  }, [search]);

  const toggleSuspend = async (user: UserRow) => {
    await api.patch(`/api/admin/users/${user.id}/suspend`, { isSuspended: !user.isSuspended });
    load();
  };

  if (error) return <div className="p-8 text-rose-400">{error}</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white uppercase tracking-wide">Users</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, mobile"
            className="pl-9 pr-3 h-10 bg-white/10 border border-white/10 text-white text-sm rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      {!users ? (
        <div className="text-white/60">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-white/60">No users found.</div>
      ) : (
        <div className="overflow-x-auto border border-white/10 rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/50 uppercase text-xs border-b border-white/10">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Mobile</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-white/5">
                  <td className="px-4 py-3 text-white">{u.fullName}</td>
                  <td className="px-4 py-3 text-white/70">
                    {u.email}
                    {u.emailVerified && <span className="ml-2 text-[10px] text-emerald-400 uppercase">verified</span>}
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {u.mobileNumber ?? <span className="text-white/30">not linked</span>}
                    {u.mobileVerified && <span className="ml-2 text-[10px] text-emerald-400 uppercase">verified</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                        u.role === 'ADMIN' ? 'text-amber-400 bg-amber-400/10' : 'text-white/60 bg-white/5'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                        u.isSuspended ? 'text-rose-400 bg-rose-400/10' : 'text-emerald-400 bg-emerald-400/10'
                      }`}
                    >
                      {u.isSuspended ? 'Suspended' : 'Active'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => toggleSuspend(u)}
                      className={`text-xs font-bold hover:underline cursor-pointer ${
                        u.isSuspended ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {u.isSuspended ? 'Reactivate' : 'Suspend'}
                    </button>
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
