import React from 'react';
import { DashboardHeader } from '../components/DashboardHeader';
import { DashboardFooter } from '../components/DashboardFooter';
import { Linkedin, Twitter } from 'lucide-react';

const TEAM = [
  {
    name: 'Rahul Jain',
    role: 'Founder & CEO',
    bio: 'Leads product and strategy at Scan Connect, focused on building privacy-first contact solutions for vehicle owners across India.',
    linkedin: '#',
    twitter: '#',
  },
  {
    name: 'Ananya Verma',
    role: 'Co-Founder & Head of Operations',
    bio: 'Oversees manufacturing, logistics, and partner relationships, scaling Scan Connect tags to cities across the country.',
    linkedin: '#',
    twitter: '#',
  },
];

export const InvestorsPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 font-sans antialiased">
      <DashboardHeader
        userData={{ fullName: '', mobileNumber: '', email: '' }}
        onLogout={() => {}}
        activeNav="Investors"
        isLoggedIn={false}
        onNavClick={(nav) => {
          const path =
            nav === 'How it works' ? '/' : nav === 'QR Scan' ? '/qr-scan' : `/${nav.toLowerCase()}`;
          window.location.href = path;
        }}
      />

      <main className="flex-1 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center space-y-4 max-w-2xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-black text-neutral-900 tracking-tight">Investors</h1>
            <p className="text-neutral-500 text-lg sm:text-xl">
              Building the privacy-first contact layer for every vehicle in India.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {TEAM.map((person) => (
              <div
                key={person.name}
                className="bg-[#F7F5EF] rounded-2xl p-8 space-y-4 border border-neutral-200/60"
              >
                <div className="w-16 h-16 rounded-full bg-neutral-200 flex items-center justify-center text-xl font-black text-neutral-500">
                  {person.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </div>
                <div>
                  <h2 className="text-xl font-black text-neutral-900">{person.name}</h2>
                  <p className="text-sm font-semibold text-[#F2BA03]">{person.role}</p>
                </div>
                <p className="text-sm text-neutral-600 leading-relaxed">{person.bio}</p>
                <div className="flex items-center gap-3 pt-2">
                  <a
                    href={person.linkedin}
                    className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-neutral-700 transition-colors"
                    title={`${person.name} on LinkedIn`}
                  >
                    <Linkedin className="w-4 h-4" />
                  </a>
                  <a
                    href={person.twitter}
                    className="w-9 h-9 rounded-full bg-neutral-900 text-white flex items-center justify-center hover:bg-neutral-700 transition-colors"
                    title={`${person.name} on Twitter`}
                  >
                    <Twitter className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <DashboardFooter />
    </div>
  );
};
