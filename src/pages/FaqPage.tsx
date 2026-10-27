import React, { useMemo, useState } from 'react';
import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardFooter } from '../components/DashboardFooter';
import { Plus, Minus, Search, X } from 'lucide-react';

const FAQS = [
  {
    question: 'How do I transfer a car RC to a new owner in India?',
    answer:
      'Both buyer and seller apply through the RTO with Form 29 & 30, NOC (if interstate), PUC, insurance and ID proof. The RTO updates ownership in the VAHAN database. Allow 2–4 weeks depending on the state.',
  },
  {
    question: 'What is PUC and how often do I need it?',
    answer:
      'A Pollution Under Control (PUC) certificate confirms your vehicle meets emission norms. Petrol/CNG vehicles typically renew every 6 months, and diesel every 6–12 months depending on the state.',
  },
  {
    question: 'Is FASTag mandatory on highways?',
    answer:
      'Yes. FASTag is mandatory for all four-wheelers on national and state highways in India. Vehicles without a valid FASTag are charged double the toll fee at plazas.',
  },
  {
    question: 'How does a Scan Connect Tag protect my privacy?',
    answer:
      'When someone scans your tag, they can call or WhatsApp you through a masked number. Your real phone number is never shown to the person scanning, and theirs is never shown to you.',
  },
  {
    question: 'What happens if my Scan Connect Tag is lost or damaged?',
    answer:
      'You can report a lost or damaged tag from your Profile page and order a replacement. Your existing QR activation and contact settings carry over to the new tag.',
  },
];

export const FaqPage: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [query, setQuery] = useState('');
  const q = query.trim().toLowerCase();
  const results = useMemo(
    () => FAQS.filter((f) => !q || f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q)),
    [q],
  );

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 font-sans antialiased">
      <DashboardHeader
        userData={{ fullName: '', mobileNumber: '', email: '' }}
        onLogout={() => {}}
        activeNav="FAQ"
        isLoggedIn={false}
        onNavClick={(nav) => {
          const path =
            nav === 'How it works' ? '/#how-it-works' : nav === 'QR Scan' ? '/qr-scan' : `/${nav.toLowerCase()}`;
          window.location.href = path;
        }}
      />

      <main className="flex-1">
        <div className="py-14 sm:py-20">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
            <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight">FAQ</h1>
            <p className="text-neutral-500 text-lg sm:text-xl">
              Answers to common car ownership, parking and road rules questions in India.
            </p>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search FAQs"
              placeholder="Search questions and answers"
              className="w-full min-h-[48px] rounded-full border border-neutral-300 bg-white pl-11 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-[#FFED00] focus:border-neutral-900"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-11 h-11 flex items-center justify-center text-neutral-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {results.map((faq, idx) => {
            const isOpen = q ? true : openIndex === idx;
            return (
              <div key={faq.question} className="border border-neutral-200 rounded-2xl overflow-hidden">
                <button
                  onClick={() => !q && setOpenIndex(isOpen ? null : idx)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left cursor-pointer"
                >
                  <span className="font-black text-neutral-900">{faq.question}</span>
                  {isOpen ? (
                    <Minus className="w-4 h-4 text-neutral-500 shrink-0" />
                  ) : (
                    <Plus className="w-4 h-4 text-neutral-500 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-neutral-500 leading-relaxed">{faq.answer}</div>
                )}
              </div>
            );
          })}

          {q && results.length === 0 && (
            <p role="status" className="text-center text-neutral-500 py-6">
              No results for &ldquo;{query.trim()}&rdquo;.
            </p>
          )}

          <div className="border border-neutral-200 bg-[#f8f9fa] rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-black text-neutral-900">Still need help?</p>
              <p className="text-sm text-neutral-500">Can&apos;t find your answer? Our support team will get back to you.</p>
            </div>
            <a
              href="/support#new"
              className="inline-flex items-center justify-center min-h-[44px] px-5 rounded-full bg-[#FFED00] text-[#1B1C1C] font-bold text-sm hover:brightness-95"
            >
              Raise a ticket
            </a>
          </div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
};
