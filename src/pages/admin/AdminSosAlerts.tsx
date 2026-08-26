import React, { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import { api } from '../../lib/api';

interface SosAlertRow {
  id: string;
  status: 'ACTIVE' | 'RESOLVED';
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  resolvedAt: string | null;
  user: { fullName: string; email: string; mobileNumber: string | null };
}

export const AdminSosAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<SosAlertRow[] | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [error, setError] = useState('');

  const load = () => {
    const query = statusFilter ? `?status=${statusFilter}` : '';
    api
      .get<{ alerts: SosAlertRow[] }>(`/api/admin/sos-alerts${query}`)
      .then((res) => setAlerts(res.alerts))
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load SOS alerts'));
  };

  useEffect(load, [statusFilter]);

  const resolveAlert = async (id: string) => {
    await api.patch(`/api/admin/sos-alerts/${id}/status`, { status: 'RESOLVED' });
    load();
  };

  if (error) return <div className="p-8 text-rose-400">{error}</div>;

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white uppercase tracking-wide">SOS Alerts</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white/10 border border-white/10 text-white text-sm rounded-md px-3 py-2"
        >
          <option value="">All statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="RESOLVED">Resolved</option>
        </select>
      </div>

      {!alerts ? (
        <div className="text-white/60">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <div className="text-white/60">No SOS alerts found.</div>
      ) : (
        <div className="overflow-x-auto border border-white/10 rounded-xl">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-white/50 uppercase text-xs border-b border-white/10">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Triggered</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id} className="border-b border-white/5">
                  <td className="px-4 py-3">
                    <div className="text-white">{alert.user.fullName}</div>
                    <div className="text-white/40 text-xs">
                      {alert.user.mobileNumber || alert.user.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-white/70">
                    {alert.latitude != null && alert.longitude != null ? (
                      <a
                        href={`https://www.google.com/maps?q=${alert.latitude},${alert.longitude}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[#FFED00] hover:underline"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                        View on map
                      </a>
                    ) : (
                      <span className="text-white/30">Not shared</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-bold uppercase px-2 py-1 rounded ${
                        alert.status === 'ACTIVE' ? 'text-rose-400 bg-rose-400/10' : 'text-emerald-400 bg-emerald-400/10'
                      }`}
                    >
                      {alert.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-white/50 text-xs">
                    {new Date(alert.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {alert.status === 'ACTIVE' && (
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="text-xs font-bold text-[#FFED00] hover:underline cursor-pointer"
                      >
                        Mark Resolved
                      </button>
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
