import React, { useEffect, useState } from 'react';
import { UserFormData } from '../types';
import { DashboardHeader } from './DashboardHeader';
import { DashboardFooter } from './DashboardFooter';
import { api, ApiError, withAppEnv } from '../lib/api';
import { auth } from '../lib/firebase';
import { fetchBrandedQrPngBlob, triggerBlobDownload, type StickerSize } from '../lib/qrSticker';
import { Package, ShoppingBag, Download, ChevronRight, ArrowLeft, Check } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

const TAG_SIZE_LABEL: Record<StickerSize, string> = {
  car: 'Car Tag',
  bike: 'Bike Tag',
  helmet: 'Helmet Tag',
  transport: 'Transport Tag',
};

/** One physical tag from this order (see OrderTag in schema.prisma) — each downloads at its own correct sticker size. */
interface OrderTagRow {
  id: string;
  size: StickerSize;
  sequence: number;
  qrToken: string;
}

interface OrderRow {
  id: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
  totalInPaise: number;
  createdAt: string;
  qrToken: string | null;
  stickerLanguage?: 'en' | 'hi';
  tags: OrderTagRow[];
  items: { quantity: number; priceInPaise?: number; product: { name: string } }[];
  subtotalInPaise?: number;
  discountInPaise?: number;
  couponCode?: string | null;
  razorpayPaymentId?: string | null;
  shippingName?: string | null;
  shippingPhone?: string | null;
  shippingAddress?: string | null;
  shippingCity?: string | null;
  shippingPincode?: string | null;
  fulfillmentStatus?: 'PROCESSING' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED';
  courierName?: string | null;
  trackingId?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
}

const formatPaise = (paise: number) => (paise / 100).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
const formatDateTime = (iso?: string | null) =>
  iso
    ? new Date(iso).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' })
    : '';

const FULFILLMENT_STEPS: { key: NonNullable<OrderRow['fulfillmentStatus']>; label: string }[] = [
  { key: 'PROCESSING', label: 'Processing' },
  { key: 'SHIPPED', label: 'Shipped' },
  { key: 'OUT_FOR_DELIVERY', label: 'Out for delivery' },
  { key: 'DELIVERED', label: 'Delivered' },
];

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

const DetailRow: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex items-start justify-between gap-6 py-2 text-sm">
    <span className="text-neutral-500 shrink-0">{label}</span>
    <span className="font-semibold text-neutral-900 text-right break-words min-w-0">{children}</span>
  </div>
);

const OrderDetails: React.FC<{ order: OrderRow; onBack: () => void }> = ({ order, onBack }) => {
  const stepIndex = FULFILLMENT_STEPS.findIndex((st) => st.key === (order.fulfillmentStatus ?? 'PROCESSING'));
  const isPaid = order.status === 'PAID' || order.status === 'REFUNDED';
  const stepTime: Record<string, string> = {
    PROCESSING: formatDateTime(order.createdAt),
    SHIPPED: formatDateTime(order.shippedAt),
    DELIVERED: formatDateTime(order.deliveredAt),
  };
  const address = [order.shippingAddress, order.shippingCity, order.shippingPincode].filter(Boolean).join(', ');
  const paymentLabel =
    order.status === 'PAID'
      ? 'Paid'
      : order.status === 'REFUNDED'
        ? 'Refunded'
        : order.status === 'PENDING'
          ? 'Awaiting payment'
          : order.status.charAt(0) + order.status.slice(1).toLowerCase();

  return (
    <div className="space-y-6">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 min-h-[44px] text-sm font-bold text-[#1B1C1C] hover:underline cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to My Orders
      </button>

      <div className="bg-white border border-[#EEEEEE] rounded-xl p-6 space-y-2">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <h2 className="text-2xl font-black text-[#1B1C1C]">Order #{order.id.slice(0, 8).toUpperCase()}</h2>
          <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full ${statusColor[order.status]}`}>{order.status}</span>
        </div>
        <p className="text-xs text-neutral-500 font-mono break-all">Order ID: {order.id}</p>
        <p className="text-sm text-neutral-500">Placed on {formatDateTime(order.createdAt)}</p>
      </div>

      <div className="bg-white border border-[#EEEEEE] rounded-xl p-6">
        <h3 className="font-black text-[#1B1C1C] mb-3">Items</h3>
        <ul className="divide-y divide-neutral-100">
          {order.items.map((item, idx) => (
            <li key={idx} className="flex items-center justify-between gap-4 py-2 text-sm">
              <span className="text-neutral-800">
                {item.product.name} x{item.quantity}
              </span>
              {item.priceInPaise != null && <span className="font-semibold">{formatPaise(item.priceInPaise * item.quantity)}</span>}
            </li>
          ))}
        </ul>
        <div className="mt-3 pt-3 border-t border-neutral-100 divide-y divide-neutral-50">
          {!!order.subtotalInPaise && <DetailRow label="Subtotal">{formatPaise(order.subtotalInPaise)}</DetailRow>}
          {!!order.discountInPaise && (
            <DetailRow label={`Discount${order.couponCode ? ` (${order.couponCode})` : ''}`}>-{formatPaise(order.discountInPaise)}</DetailRow>
          )}
          <DetailRow label="Total">{formatPaise(order.totalInPaise)}</DetailRow>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-[#EEEEEE] rounded-xl p-6">
          <h3 className="font-black text-[#1B1C1C] mb-2">Shipping address</h3>
          {order.shippingName || address ? (
            <div className="text-sm text-neutral-700 space-y-0.5">
              {order.shippingName && <p className="font-semibold">{order.shippingName}</p>}
              {address && <p>{address}</p>}
              {order.shippingPhone && <p>Phone: {order.shippingPhone}</p>}
            </div>
          ) : (
            <p className="text-sm text-neutral-500">No shipping address recorded.</p>
          )}
        </div>

        <div className="bg-white border border-[#EEEEEE] rounded-xl p-6">
          <h3 className="font-black text-[#1B1C1C] mb-2">Payment</h3>
          <div className="divide-y divide-neutral-50">
            <DetailRow label="Status">{paymentLabel}</DetailRow>
            <DetailRow label="Amount">{formatPaise(order.totalInPaise)}</DetailRow>
            {order.razorpayPaymentId && (
              <DetailRow label="Payment ID">
                <span className="font-mono text-xs">{order.razorpayPaymentId}</span>
              </DetailRow>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-[#EEEEEE] rounded-xl p-6">
        <h3 className="font-black text-[#1B1C1C] mb-4">Order status</h3>
        {isPaid ? (
          <ol className="space-y-4">
            {FULFILLMENT_STEPS.map((st, idx) => {
              const done = idx <= stepIndex;
              const time = stepTime[st.key];
              return (
                <li key={st.key} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                      done ? 'bg-[#FFED00] text-[#1B1C1C]' : 'bg-neutral-100 text-neutral-300'
                    }`}
                  >
                    {done ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <span className="w-2 h-2 rounded-full bg-neutral-300" />}
                  </span>
                  <div className="min-w-0">
                    <p className={`text-sm font-bold ${done ? 'text-[#1B1C1C]' : 'text-neutral-400'}`}>{st.label}</p>
                    {done && time && <p className="text-xs text-neutral-500">{time}</p>}
                    {st.key === 'SHIPPED' && done && (order.courierName || order.trackingId) && (
                      <p className="text-xs text-neutral-600">
                        {order.courierName}
                        {order.courierName && order.trackingId ? ' · ' : ''}
                        {order.trackingId && (
                          <>
                            Tracking ID: <span className="font-mono">{order.trackingId}</span>
                          </>
                        )}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="text-sm text-neutral-500">
            {order.status === 'PENDING'
              ? 'This order is waiting for payment to be completed.'
              : `This order is ${order.status.toLowerCase()}.`}
          </p>
        )}
      </div>

      {order.tags.length > 0 && (
        <div className="bg-white border border-[#EEEEEE] rounded-xl p-6">
          <h3 className="font-black text-[#1B1C1C] mb-2">Your tags</h3>
          <ul className="space-y-1">
            {order.tags.map((tag) => (
              <li key={tag.id} className="text-sm text-neutral-700">
                {order.tags.length > 1 ? `Tag ${tag.sequence} — ${TAG_SIZE_LABEL[tag.size]}` : TAG_SIZE_LABEL[tag.size]}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export const MyOrdersScreen: React.FC<MyOrdersScreenProps> = ({ userData, onLogout, onNavigate, isLoggedIn }) => {
  const [activeNav, setActiveNav] = useState('Profile');
  const [orders, setOrders] = useState<OrderRow[] | null>(null);
  const [error, setError] = useState('');
  // Selected order lives in the URL hash (#order=<id>) so the browser Back button returns to the list.
  const readHashOrderId = () => {
    const m = window.location.hash.match(/^#order=(.+)$/);
    return m ? decodeURIComponent(m[1]) : null;
  };
  const [selectedId, setSelectedId] = useState<string | null>(readHashOrderId);

  useEffect(() => {
    const onHash = () => setSelectedId(readHashOrderId());
    window.addEventListener('popstate', onHash);
    window.addEventListener('hashchange', onHash);
    return () => {
      window.removeEventListener('popstate', onHash);
      window.removeEventListener('hashchange', onHash);
    };
  }, []);

  const openOrder = (id: string) => {
    window.history.pushState(null, '', `/orders#order=${encodeURIComponent(id)}`);
    setSelectedId(id);
    window.scrollTo(0, 0);
  };

  const backToList = () => {
    if (window.location.hash.startsWith('#order=')) {
      window.history.back();
    } else {
      setSelectedId(null);
    }
  };

  const selectedOrder = orders?.find((o) => o.id === selectedId) ?? null;

  useEffect(() => {
    api
      .get<{ orders: OrderRow[] }>('/api/orders/mine')
      .then((res) => setOrders(res.orders))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Failed to load orders'));
  }, []);

  const handleHeaderNav = (navItem: string) => {
    setActiveNav(navItem);
    if (navItem === 'How it works') {
      onNavigate('dashboard#how-it-works');
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
            <h1 className="text-4xl sm:text-5xl font-black text-[#1B1C1C] tracking-[-0.4px]">My Orders</h1>
            <p className="text-[#5D5F5F] text-base sm:text-lg">Track everything you&apos;ve ordered from ScanConnect.</p>
          </div>

          {error && <p role="alert" className="text-sm font-semibold text-red-600">{error}</p>}

          {selectedId && orders && !selectedOrder ? (
            <div className="bg-white border border-[#EEEEEE] rounded-xl p-8 space-y-4 text-center">
              <p className="text-neutral-500">We couldn&apos;t find that order.</p>
              <button onClick={backToList} className="min-h-[44px] px-6 bg-[#FFED00] text-[#1B1C1C] font-bold text-sm rounded-lg cursor-pointer">
                Back to My Orders
              </button>
            </div>
          ) : selectedOrder ? (
            <OrderDetails order={selectedOrder} onBack={backToList} />
          ) : !orders ? (
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
                <div key={order.id} className="bg-white border border-[#EEEEEE] rounded-xl p-6 space-y-4 hover:border-[#FFED00] hover:shadow-sm transition-all">
                  <div
                    role="link"
                    tabIndex={0}
                    aria-label={`View details for order ${order.id.slice(0, 8).toUpperCase()}`}
                    onClick={() => openOrder(order.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        openOrder(order.id);
                      }
                    }}
                    className="flex items-center justify-between gap-6 flex-wrap cursor-pointer min-h-[44px] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFED00] rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      {order.tags.length > 0 ? (
                        <img
                          src={withAppEnv(`${API_BASE_URL}/api/order-contact/${order.tags[0].qrToken}/qr.png`)}
                          alt="Order QR tag"
                          className="w-11 h-11 rounded-lg shrink-0"
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
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-[#1B1C1C] min-h-[44px]">
                        View details
                        <ChevronRight className="w-5 h-5" aria-hidden="true" />
                      </span>
                    </div>
                  </div>

                  {/* One row per physical tag — each downloads at its own correct sticker size (see OrderTag in schema.prisma). */}
                  {order.tags.length > 0 && (
                    <div className="pt-3 border-t border-neutral-100 space-y-2">
                      {order.tags.map((tag) => (
                        <div key={tag.id} className="flex items-center justify-between gap-4">
                          <span className="text-sm text-neutral-600">
                            {order.tags.length > 1 ? `Tag ${tag.sequence} — ${TAG_SIZE_LABEL[tag.size]}` : TAG_SIZE_LABEL[tag.size]}
                          </span>
                          <button
                            onClick={async () => {
                              const idToken = await auth.currentUser?.getIdToken();
                              const blob = await fetchBrandedQrPngBlob(
                                `${API_BASE_URL}/api/order-contact/${tag.qrToken}/qr.png`,
                                idToken,
                                { lang: order.stickerLanguage ?? 'en', size: tag.size },
                              );
                              triggerBlobDownload(blob, `scanconnect-qr-${order.id.slice(0, 8)}-${tag.sequence}.png`);
                            }}
                            title="Download QR"
                            className="p-2 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 cursor-pointer"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
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
