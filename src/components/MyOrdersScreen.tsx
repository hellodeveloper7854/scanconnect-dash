import React, { useEffect, useState } from 'react';
import { UserFormData } from '../types';
import { DashboardHeader } from './DashboardHeader';
import { DashboardFooter } from './DashboardFooter';
import { api, ApiError, downloadFile } from '../lib/api';
import { Package, ShoppingBag, Download } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

interface OrderRow {
  id: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  totalInPaise: number;
  createdAt: string;
  qrToken: string | null;
  items: { quantity: number; product: { name: string } }[];
}

interface MyOrdersScreenProps {
  userData: UserFormData;
  onLogout: () => void;
  onNavigate: (nav: string) => void;
  isLoggedIn?: boolean;
}

const statusColor: Record<OrderRow['status'], string> = {
  PENDING: 'text-amber-700 bg-amber-100',
  PAID: 'text-emerald-700 bg-emerald-100',
  FAILED: 'text-rose-700 bg-rose-100',
  CANCELLED: 'text-neutral-600 bg-neutral-100',
  REFUNDED: 'text-sky-700 bg-sky-100',
};

export const MyOrdersScreen: React.FC<MyOrdersScreenProps> = ({ userData, onLogout, onNavigate, isLoggedIn }) => {
  const [activeNav, setActiveNav] = useState('Profile');
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get<{ orders: OrderRow[] }>('/api/orders/mine')
      .then((res) => setOrders(res.orders))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load orders'));
  }, []);

  const handleHeaderNav = (navItem: string) => {
    setActiveNav(navItem);
    if (navItem === 'How it works') {
      onNavigate('dashboard');
    } else if (navItem === 'QR Scan') {
      onNavigate('qr-scan');
    } else if (navItem === 'About' || navItem === 'about') {
      onNavigate('about');
    } else if (navItem === 'Shop' || navItem === 'shop') {
      onNavigate('shop');
    } else if (navItem === 'Contact' || navItem === 'contact') {
      onNavigate('contact');
    } else if (navItem === 'Profile' || navItem === 'profile') {
      onNavigate('profile');
    } else if (navItem === 'My Orders') {
      onNavigate('orders');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fa] text-neutral-900 font-sans antialiased">
      <DashboardHeader
        userData={userData}
        onLogout={onLogout}
        activeNav={activeNav}
        isLoggedIn={isLoggedIn}
        onNavClick={handleHeaderNav}
      />

      <main className="flex-1 py-10 sm:py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2">
            <h1 className="text-4xl sm:text-5xl font-black text-[#FFED00] tracking-[-0.4px]">My Orders</h1>
            <p className="text-[#5D5F5F] text-base sm:text-lg">Track everything you&apos;ve ordered from ScanConnect.</p>
          </div>

          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

          {!orders ? (
            <div className="text-neutral-500">Loading your orders...</div>
          ) : orders.length === 0 ? (
            <div className="bg-white border border-[#EEEEEE] rounded-xl p-12 flex flex-col items-center gap-4 text-center">
              <ShoppingBag className="w-10 h-10 text-neutral-300" />
              <p className="text-neutral-500">You haven&apos;t placed any orders yet.</p>
              <button
                onClick={() => onNavigate('shop')}
                className="px-6 py-2.5 bg-[#FFED00] hover:bg-[#e0ac00] text-[#1B1C1C] font-bold text-sm rounded-lg cursor-pointer"
              >
                Browse Shop
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-[#EEEEEE] rounded-xl p-6 flex items-center justify-between gap-6 flex-wrap"
                >
                  <div className="flex items-center gap-4">
                    {order.qrToken ? (
                      <img
                        src={`${API_BASE_URL}/api/order-contact/${order.qrToken}/qr.png`}
                        alt="Order QR tag"
                        className="w-11 h-11 rounded-lg border border-[#EEEEEE] shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                        <Package className="w-5 h-5 text-[#676000]" />
                      </div>
                    )}
                    <div>
                      <div className="font-mono text-sm text-neutral-500">#{order.id.slice(0, 8).toUpperCase()}</div>
                      <div className="text-sm text-neutral-700">
                        {order.items.map((i) => `${i.product.name} x${i.quantity}`).join(', ')}
                      </div>
                      <div className="text-xs text-neutral-400 mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="font-bold text-neutral-900">
                      {(order.totalInPaise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' })}
                    </span>
                    <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${statusColor[order.status]}`}>
                      {order.status}
                    </span>
                    {order.qrToken && (
                      <button
                        onClick={() =>
                          downloadFile(
                            `/api/order-contact/${order.qrToken}/qr.png`,
                            `scanconnect-qr-${order.id.slice(0, 8)}.png`,
                          )
                        }
                        title="Download QR"
                        className="p-2 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
};
