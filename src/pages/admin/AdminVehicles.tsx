import React, { useEffect, useState } from 'react';
import { Search, Trash2 } from 'lucide-react';
import { api } from '../../lib/api';

interface VehicleRow {
  id: string;
  registration: string;
  qrCode: string;
  createdAt: string;
  user: { fullName: string; email: string; mobileNumber: string | null };
}

export const AdminVehicles: React.FC = () => {
  const [vehicles, setVehicles] = useState<VehicleRow[] | null>(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const load = () => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    api
      .get<{ vehicles: VehicleRow[] }>(`/api/admin/vehicles${query}`)
      .then((res) => setVehicles(res.vehicles))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load vehicles'));
  };

  useEffect(() => {
    const handle = setTimeout(load, 300);
    return () => clearTimeout(handle);
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this vehicle?')) return;
    await api.delete(`/api/admin/vehicles/${id}`);
    load();
  };

  if (error) return <div className="p-8 text-rose-400">{error}</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white uppercase tracking-wide">Vehicles</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search registration, QR code"
            className="pl-9 pr-3 h-10 bg-white/10 border border-white/10 text-white text-sm rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-amber-400"
          />
        </div>
      </div>

      {!vehicles ? (
        <div className="text-white/60">Loading vehicles...</div>
      ) : vehicles.length === 0 ? (
        <div className="text-white/60">No vehicles found.</div>
      ) : (
        <div className="overflow-x-auto border border-white/10 rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/50 uppercase text-xs border-b border-white/10">
                <th className="px-4 py-3">Registration</th>
                <th className="px-4 py-3">QR Code</th>
                <th className="px-4 py-3">Owner</th>
                <th className="px-4 py-3">Added</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.id} className="border-b border-white/5">
                  <td className="px-4 py-3 text-white font-mono">{v.registration}</td>
                  <td className="px-4 py-3 text-white/70 font-mono">{v.qrCode}</td>
                  <td className="px-4 py-3">
                    <div className="text-white/80">{v.user.fullName}</div>
                    <div className="text-white/40 text-xs">{v.user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs">{new Date(v.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(v.id)}
                      className="p-1.5 text-white/50 hover:text-rose-400 cursor-pointer"
                      title="Remove vehicle"
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
    </div>
  );
};
