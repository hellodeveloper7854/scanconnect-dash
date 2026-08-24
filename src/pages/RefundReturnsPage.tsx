import React from 'react';
import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardFooter } from '../components/DashboardFooter';

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: '1. Overview',
    body: (
      <>
        <p>
          All purchases, cancellations, returns, and refund requests for Scan Connect products are governed strictly
          by this Refund &amp; Returns Policy, read together with our Terms &amp; Conditions and Shipping Policy.
        </p>
      </>
    ),
  },
  {
    title: '2. Delivery & OTP Verification Notice',
    body: (
      <>
        <p>
          Prepaid orders require OTP verification upon delivery to ensure secure handing over of packages.
        </p>
        <p>
          If your package is marked as &ldquo;Delivered&rdquo; on the tracking system without an OTP verification or
          physical receipt, or if you receive a damaged, incomplete, or wrong product, you must notify our support
          team within 48 hours of delivery.
        </p>
        <p>
          Genuine non-delivery issues raised within this timeframe will be investigated immediately; failure to
          resolve valid claims may result in formal escalation through authorized legal and consumer grievance
          portals.
        </p>
      </>
    ),
  },
  {
    title: '3. Cancellation',
    body: (
      <>
        <p>Orders can be cancelled prior to dispatch by contacting our support team.</p>
        <p>Once an order has been dispatched, it cannot be cancelled mid-transit.</p>
      </>
    ),
  },
  {
    title: '4. Refund Eligibility',
    body: (
      <>
        <p>
          Refunds are processed only for damaged, defective, or incorrect items reported within 48 hours of receipt,
          along with unboxing proof/images.
        </p>
      </>
    ),
  },
  {
    title: '5. Processing Time',
    body: (
      <>
        <p>Approved refunds will be initiated to the original payment method within 5&ndash;7 business days.</p>
      </>
    ),
  },
  {
    title: '6. How to Raise a Request',
    body: (
      <>
        <p>To raise a cancellation, return, or refund request, please contact us with:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Order number</li>
          <li>Registered mobile number/email</li>
          <li>Photographs of the package and product</li>
          <li>Unboxing video, where available</li>
          <li>Description of the issue</li>
        </ul>
      </>
    ),
  },
  {
    title: '7. Contact Us',
    body: (
      <>
        <p>For questions regarding cancellations, returns, or refunds, please contact:</p>
        <p className="font-bold text-[#1B1C1C]">Scan Connect Support</p>
        <p>
          Email:{' '}
          <a href="mailto:support@scanconnect.com" className="text-[#FFED00] font-semibold hover:underline">
            support@scanconnect.com
          </a>
        </p>
        <p>
          Phone:{' '}
          <a href="tel:08047359856" className="text-[#FFED00] font-semibold hover:underline">
            080-473-59856
          </a>
        </p>
      </>
    ),
  },
];

export const RefundReturnsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0F0F0F] font-sans antialiased">
      <DashboardHeader
        userData={{ fullName: '', mobileNumber: '', email: '' }}
        onLogout={() => {}}
        activeNav="Refund & Returns"
        isLoggedIn={false}
        onNavClick={(nav) => {
          const path = nav === 'How it works' ? '/' : nav === 'QR Scan' ? '/qr-scan' : `/${nav.toLowerCase()}`;
          window.location.href = path;
        }}
      />

      <main className="flex-1">
        <div className="py-14 sm:py-20 bg-neutral-50/60 border-b border-neutral-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-[#0F0F0F] tracking-tight">Refund &amp; Returns Policy</h1>
            <p className="text-[#5D5F5F] text-sm font-semibold uppercase tracking-wider">Last Updated: August 2026</p>
            <p className="text-[#5D5F5F] text-base sm:text-lg leading-relaxed">
              This Refund &amp; Returns Policy explains how order cancellations, returns, and refunds are handled for
              Scan Connect products purchased through our website.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 space-y-10">
          {SECTIONS.map((section) => (
            <div key={section.title} className="space-y-3 pb-8 border-b border-neutral-100 last:border-b-0">
              <h2 className="text-xl sm:text-2xl font-black text-[#0F0F0F] tracking-tight">{section.title}</h2>
              <div className="text-[#5D5F5F] text-base leading-relaxed space-y-3">{section.body}</div>
            </div>
          ))}

          <div className="pt-2 space-y-1">
            <p className="font-black text-[#1B1C1C] text-lg">Scan Connect</p>
            <p className="text-[#5D5F5F] font-semibold">Smart Protection. Secure Connection.</p>
            <p className="text-[#5D5F5F]">Operated by Creative Frameworks</p>
          </div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
};
