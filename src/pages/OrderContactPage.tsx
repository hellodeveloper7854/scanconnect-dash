import React, { useEffect, useState } from 'react';
import { ScanResultCard } from '../components/ScanResultCard';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000';

interface OrderContact {
  orderId: string;
  createdAt: string;
  status: string;
  customer: { fullName: string; email: string; mobileNumber: string | null };
  vehicle: {
    registration: string;
    nickname: string | null;
    vehicleType: string | null;
    brand: string | null;
    model: string | null;
    color: string | null;
  } | null;
  emergencyContact: { name: string; role: string | null; phone: string } | null;
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

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-4">
        <p className="text-sm font-semibold text-red-600">{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-4">
        <p className="text-[#5F5E5E] text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <ScanResultCard
      label={`Order #${data.orderId.slice(0, 8).toUpperCase()}`}
      owner={data.customer}
      vehicle={data.vehicle}
      emergencyContacts={data.emergencyContact ? [data.emergencyContact] : []}
    />
  );
};
