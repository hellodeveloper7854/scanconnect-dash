import React from 'react';
import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardFooter } from '../components/DashboardFooter';

const SUPPORT_EMAIL = 'support@scanconnect.co.in';

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: '1. Delete your account from the Scan Connect app',
    body: (
      <>
        <p>The fastest way to delete your account is from inside the Scan Connect Android app:</p>
        <ol className="list-decimal pl-6 space-y-1">
          <li>Open the <strong>Scan Connect</strong> app and sign in.</li>
          <li>Go to <strong>Profile</strong> &rarr; <strong>Security &amp; Privacy</strong>.</li>
          <li>Tap <strong>Delete Account</strong>.</li>
          <li>Confirm by tapping <strong>Delete</strong> in the dialog.</li>
        </ol>
        <p>
          Deletion is immediate and permanent. You will be signed out and will not be able to sign in again with the
          same account.
        </p>
      </>
    ),
  },
  {
    title: '2. Can’t open the app? Request deletion by email',
    body: (
      <>
        <p>
          If you no longer have the app or cannot sign in, email us at{' '}
          <a href={`mailto:${SUPPORT_EMAIL}?subject=Delete%20my%20Scan%20Connect%20account`} className="font-semibold underline">
            {SUPPORT_EMAIL}
          </a>{' '}
          with the subject line <strong>&ldquo;Delete my Scan Connect account&rdquo;</strong>.
        </p>
        <p>
          Send the request from the email address registered on your account, and include the registered mobile
          number so we can verify it is you. We will confirm and complete the deletion within 7 days.
        </p>
      </>
    ),
  },
  {
    title: '3. Data that is deleted',
    body: (
      <>
        <p>When your account is deleted, we permanently remove:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Your profile details &mdash; name, email address and mobile number</li>
          <li>Your profile photo</li>
          <li>Your saved vehicles and vehicle details</li>
          <li>Your emergency contacts</li>
          <li>Your SOS alerts, notifications and app preferences</li>
          <li>Your reviews, support tickets and chat conversations</li>
          <li>Your sign-in (login) identity</li>
        </ul>
        <p>
          Any Scan Connect QR tag linked to your vehicle is released and deactivated, so it no longer shows your
          information to anyone who scans it.
        </p>
      </>
    ),
  },
  {
    title: '4. Data that is kept, and for how long',
    body: (
      <>
        <p>
          If you have ever placed an order, we are required to keep basic <strong>order and payment records</strong>{' '}
          (such as order ID, items, amount, invoice and delivery details) for accounting, tax and legal compliance.
          These records are kept for the period required by applicable Indian law, up to 8 years.
        </p>
        <p>
          Your name, email address and mobile number are removed from your account and replaced with anonymous
          placeholders. The retained order records are no longer linked to a usable account, and you cannot sign in
          to them.
        </p>
        <p>
          Backups may take a short additional time to be overwritten, after which deleted data is no longer
          recoverable.
        </p>
      </>
    ),
  },
  {
    title: '5. Questions',
    body: (
      <p>
        For any question about your data or account deletion, contact us at{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold underline">
          {SUPPORT_EMAIL}
        </a>
        .
      </p>
    ),
  },
];

export const DeleteAccountPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0F0F0F] font-sans antialiased">
      <DashboardHeader
        userData={{ fullName: '', mobileNumber: '', email: '' }}
        onLogout={() => {}}
        activeNav="Delete Account"
        isLoggedIn={false}
        onNavClick={(nav) => {
          const path = nav === 'How it works' ? '/#how-it-works' : nav === 'QR Scan' ? '/qr-scan' : `/${nav.toLowerCase()}`;
          window.location.href = path;
        }}
      />

      <main className="flex-1">
        <div className="py-14 sm:py-20 bg-neutral-50/60 border-b border-neutral-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
            <h1 className="text-3xl sm:text-4xl font-black text-[#0F0F0F] tracking-tight">
              Delete Your Scan Connect Account
            </h1>
            <p className="text-[#5D5F5F] text-sm font-semibold uppercase tracking-wider">Last Updated: November 2026</p>
            <p className="text-[#5D5F5F] text-base sm:text-lg leading-relaxed">
              This page explains how to request deletion of your Scan Connect account and associated data, what is
              deleted, and what we are required to keep. Scan Connect is operated by Creative Frameworks.
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
