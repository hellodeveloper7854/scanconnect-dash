import React, { useEffect, useState } from 'react';
import { Users, Car, ShoppingCart, IndianRupee, UserCheck, UserPlus, Star, Siren } from 'lucide-react';
import { api } from '../../lib/api';

interface AdminStats {
  users: { total: number; emailVerified: number; mobileLinked: number; newLast30Days: number };
  vehicles: { total: number };
  orders: { total: number; paid: number; pending: number; failed: number; revenueInPaise: number };
  reviews: { total: number; averageRating: number };
  sosAlerts: { total: number; active: number };
}

const StatCard: React.FC<{ label: string; value: string; icon: React.ElementType }> = ({ label, value, icon: Icon }) => (
  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-bold uppercase tracking-wide text-white/50">{label}</span>
      <Icon className="w-5 h-5 text-[#FFED00]" />
    </div>
    <div className="text-3xl font-black text-white">{value}</div>
  </div>
);

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<AdminStats>('/api/admin/stats')
      .then(setStats)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load stats'));
  }, []);

  if (error) {
    return <div className="p-8 text-rose-400">{error}</div>;
  }

  if (!stats) {
    return <div className="p-8 text-white/60">Loading dashboard...</div>;
  }

  const revenue = (stats.orders.revenueInPaise / 100).toLocaleString('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  });

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-black text-white uppercase tracking-wide">Dashboard</h1>

      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-white/50 mb-3">Users</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={String(stats.users.total)} icon={Users} />
          <StatCard label="Email Verified" value={String(stats.users.emailVerified)} icon={UserCheck} />
          <StatCard label="Mobile Linked" value={String(stats.users.mobileLinked)} icon={UserCheck} />
          <StatCard label="New (30 days)" value={String(stats.users.newLast30Days)} icon={UserPlus} />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-white/50 mb-3">Vehicles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Registered Vehicles" value={String(stats.vehicles.total)} icon={Car} />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-white/50 mb-3">Orders</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Orders" value={String(stats.orders.total)} icon={ShoppingCart} />
          <StatCard label="Paid" value={String(stats.orders.paid)} icon={ShoppingCart} />
          <StatCard label="Pending" value={String(stats.orders.pending)} icon={ShoppingCart} />
          <StatCard label="Failed" value={String(stats.orders.failed)} icon={ShoppingCart} />
          <StatCard label="Revenue (paid)" value={revenue} icon={IndianRupee} />
        </div>
      </div>

      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-white/50 mb-3">Reviews & SOS</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Reviews" value={String(stats.reviews.total)} icon={Star} />
          <StatCard label="Average Rating" value={stats.reviews.averageRating.toFixed(1)} icon={Star} />
          <StatCard label="Total SOS Alerts" value={String(stats.sosAlerts.total)} icon={Siren} />
          <StatCard label="Active SOS Alerts" value={String(stats.sosAlerts.active)} icon={Siren} />
        </div>
      </div>
    </div>
  );
};
