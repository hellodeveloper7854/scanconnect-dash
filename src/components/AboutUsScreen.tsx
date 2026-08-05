import React, { useState } from 'react';
import { UserFormData } from '../types';
import { DashboardHeader } from './DashboardHeader';
import { DashboardFooter } from './DashboardFooter';
import {
  Lock,
  Zap,
  Globe,
  Building2,
  Home,
  ParkingSquare,
  Star,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Users,
  Award
} from 'lucide-react';

interface AboutUsScreenProps {
  userData: UserFormData;
  onLogout: () => void;
  onNavigate: (nav: string) => void;
  isLoggedIn?: boolean;
}

export const AboutUsScreen: React.FC<AboutUsScreenProps> = ({
  userData,
  onLogout,
  onNavigate,
  isLoggedIn,
}) => {
  const [activeNav, setActiveNav] = useState('About');

  const handleHeaderNav = (navItem: string) => {
    setActiveNav(navItem);
    if (navItem === 'How it works' || navItem === 'QR Scan') {
      onNavigate('dashboard');
    } else if (navItem === 'About' || navItem === 'about') {
      onNavigate('about');
    } else if (navItem === 'Shop' || navItem === 'shop') {
      onNavigate('shop');
    } else if (navItem === 'Contact' || navItem === 'contact') {
      onNavigate('contact');
    } else if (navItem === 'Profile' || navItem === 'profile') {
      onNavigate('profile');
    } else {
      onNavigate(navItem.toLowerCase());
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0F0F0F] font-sans antialiased">
      {/* Top Header */}
      <DashboardHeader
        userData={userData}
        onLogout={onLogout}
        activeNav={activeNav}
        isLoggedIn={isLoggedIn}
        onNavClick={handleHeaderNav}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* 1. HERO MISSION SECTION */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
              
              {/* Left Column Text */}
              <div className="lg:col-span-6 space-y-6">
                {/* Mission Badge */}
                <div className="inline-flex items-center gap-2 py-1 px-3.5 rounded-full border border-neutral-200 bg-white shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#F2BA03]" />
                  <span className="font-mono text-xs font-semibold tracking-wider text-[#0F0F0F] uppercase">
                    OUR MISSION
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[42px] lg:leading-[1.15] font-black text-[#0F0F0F] tracking-tight font-sans">
                  Privacy shouldn&apos;t cost you a phone call.
                </h1>

                <p className="text-[#5D5F5F] text-base sm:text-lg leading-relaxed font-normal max-w-xl">
                  Sampark started with a simple frustration: leaving your phone number on your dashboard meant spam calls, harassment, and zero privacy. We built a smart QR tag that lets anyone reach you instantly — without ever seeing your actual phone number.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => onNavigate('shop')}
                    className="h-[52px] px-8 bg-[#F2BA03] hover:bg-[#e0ac00] text-white font-bold text-sm sm:text-base uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>GET YOUR TAG</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="h-[52px] px-8 bg-white border border-[#0F0F0F] hover:bg-neutral-50 text-[#0F0F0F] font-bold text-sm sm:text-base uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center active:scale-95"
                  >
                    HOW IT WORKS
                  </button>
                </div>
              </div>

              {/* Right Column Image & Tag Preview Card */}
              <div className="lg:col-span-6 flex justify-center lg:justify-end">
                <div className="relative rounded-3xl overflow-hidden shadow-xl border border-neutral-200 max-w-lg w-full group bg-neutral-900">
                  <img
                    src="https://images.unsplash.com/photo-1541348263662-e082662d82da?auto=format&fit=crop&w=1200&q=80"
                    alt="ScanConnect Tag on Car"
                    className="w-full h-[360px] sm:h-[420px] object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
                  />
                  
                  {/* Overlay Simulated QR Decal Badge */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 p-4 rounded-2xl shadow-2xl border-2 border-[#F2BA03] flex flex-col items-center gap-2 backdrop-blur-xs">
                    <div className="w-28 h-28 bg-[#0F0F0F] p-2.5 rounded-xl flex items-center justify-center shadow-inner">
                      {/* Simulated QR decal SVG */}
                      <svg className="w-full h-full text-[#F2BA03]" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M0 0h30v30H0zM10 10h10v10H10zM70 0h30v30H70zM80 10h10v10H80zM0 70h30v30H0zM10 80h10v10H10zM40 0h10v20H40zM50 30h20v10H50zM30 40h10v30H30zM50 50h30v10H50zM80 60h20v40H80zM40 80h20v20H40z"/>
                      </svg>
                    </div>
                    <span className="bg-[#0F0F0F] text-[#F2BA03] text-[10px] font-black px-2.5 py-0.5 rounded font-mono uppercase tracking-widest">
                      SCAN CONNECT TAG
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 2. SHARK TANK INDIA & STATS CARD SECTION */}
        <section className="py-10 sm:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#2D2F31] text-white rounded-3xl p-8 sm:p-12 lg:p-14 shadow-2xl space-y-8 relative overflow-hidden">
              
              {/* Background Accent Glow */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-[#F2BA03]/10 rounded-full blur-3xl pointer-events-none" />

              {/* Shark Tank Badge Header */}
              <div className="flex items-center gap-2 text-[#F2BA03] font-black text-xs uppercase tracking-widest font-mono bg-[#0F0F0F]/60 w-fit px-3 py-1.5 rounded-full border border-[#F2BA03]/30">
                <Star className="w-4 h-4 fill-current text-[#F2BA03]" />
                <span>FEATURED ON SHARK TANK INDIA</span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-4 max-w-3xl relative z-10">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-sans leading-tight">
                  From a parking problem to 9.5 lakh active tags.
                </h2>
                <p className="text-neutral-300 text-base leading-relaxed font-normal">
                  We pitched SCAN CONNECT on Shark Tank India and walked away with the conviction that privacy-first contact belongs on every vehicle in India. Since then, we&apos;ve grown 4x and protected over 950,000 drivers across 28 states.
                </p>
              </div>

              {/* 4 Grid Stats Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-4 relative z-10">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-1">
                  <div className="text-3xl sm:text-4xl font-black text-[#F2BA03] font-sans">
                    950k+
                  </div>
                  <div className="text-[11px] font-mono font-bold tracking-widest text-neutral-300 uppercase">
                    ACTIVE VEHICLE TAGS
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-1">
                  <div className="text-3xl sm:text-4xl font-black text-[#F2BA03] font-sans">
                    4x
                  </div>
                  <div className="text-[11px] font-mono font-bold tracking-widest text-neutral-300 uppercase">
                    ANNUAL REVENUE GROWTH
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-1">
                  <div className="text-3xl sm:text-4xl font-black text-[#F2BA03] font-sans">
                    98.7%
                  </div>
                  <div className="text-[11px] font-mono font-bold tracking-widest text-neutral-300 uppercase">
                    CUSTOMER SATISFACTION
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-1">
                  <div className="text-3xl sm:text-4xl font-black text-[#F2BA03] font-sans">
                    28
                  </div>
                  <div className="text-[11px] font-mono font-bold tracking-widest text-neutral-300 uppercase">
                    STATES COVERED
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. WHAT WE STAND FOR SECTION */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <span className="text-xs font-mono font-bold text-[#F2BA03] uppercase tracking-widest">
                CORE VALUES
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0F0F0F] tracking-tight font-sans">
                What We Stand For
              </h2>
              <p className="text-[#5D5F5F] text-base">
                Building reliable, human-centric security products that empower everyday vehicle owners.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
              {/* Pillar 1 */}
              <div className="p-8 rounded-2xl border border-neutral-200 bg-neutral-50/50 hover:bg-white hover:shadow-lg transition-all space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#F2BA03]/15 text-[#0F0F0F] flex items-center justify-center">
                  <Lock className="w-6 h-6 text-[#F2BA03]" />
                </div>
                <h3 className="text-xl font-bold text-[#0F0F0F]">
                  Privacy by Default
                </h3>
                <p className="text-[#5D5F5F] text-sm leading-relaxed">
                  Your phone number is never shared or stored in plaintext. Everything we design ensures absolute privacy, keeping unwanted calls and scams at zero.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="p-8 rounded-2xl border border-neutral-200 bg-neutral-50/50 hover:bg-white hover:shadow-lg transition-all space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#F2BA03]/15 text-[#0F0F0F] flex items-center justify-center">
                  <Zap className="w-6 h-6 text-[#F2BA03]" />
                </div>
                <h3 className="text-xl font-bold text-[#0F0F0F]">
                  Instant & Frictionless
                </h3>
                <p className="text-[#5D5F5F] text-sm leading-relaxed">
                  No mobile app downloads required for scanners. Anyone with a smartphone camera can scan the tag and alert you instantly in urgent situations.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="p-8 rounded-2xl border border-neutral-200 bg-neutral-50/50 hover:bg-white hover:shadow-lg transition-all space-y-4">
                <div className="w-12 h-12 rounded-xl bg-[#F2BA03]/15 text-[#0F0F0F] flex items-center justify-center">
                  <Globe className="w-6 h-6 text-[#F2BA03]" />
                </div>
                <h3 className="text-xl font-bold text-[#0F0F0F]">
                  Made in India
                </h3>
                <p className="text-[#5D5F5F] text-sm leading-relaxed">
                  Designed, manufactured, and supported locally by NGF132 Pvt Ltd. Built to solve the real everyday parking challenges in fast-growing cities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. CUSTOM SOLUTIONS SECTION */}
        <section className="py-16 sm:py-20 bg-neutral-50/80 border-t border-neutral-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12 space-y-2">
              <span className="text-xs font-mono font-bold text-[#F2BA03] uppercase tracking-widest">
                ENTERPRISE & B2B
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-[#0F0F0F] tracking-tight font-sans">
                Custom Solutions
              </h2>
              <p className="text-[#5D5F5F] text-base">
                Tailored vehicle tagging and access management for organizations and commercial hubs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Solution 1: Housing Societies */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0F0F0F] text-[#F2BA03] flex items-center justify-center">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0F0F0F]">
                    Housing Societies
                  </h3>
                  <p className="text-[#5D5F5F] text-sm leading-relaxed">
                    Streamline resident vehicle entry, resolve blocked parking disputes instantly, and maintain verified resident logs without public numbers.
                  </p>
                </div>

                <button
                  onClick={() => alert('Housing Societies Partnership Inquiry sent!')}
                  className="text-xs font-bold text-[#0F0F0F] hover:text-[#F2BA03] tracking-wider uppercase inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>LEARN MORE</span> <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Solution 2: Garages & Workshops */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0F0F0F] text-[#F2BA03] flex items-center justify-center">
                    <Home className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0F0F0F]">
                    Garages & Workshops
                  </h3>
                  <p className="text-[#5D5F5F] text-sm leading-relaxed">
                    Boost repeat service requests with co-branded vehicle tags that keep your service helpline accessible on every customer vehicle.
                  </p>
                </div>

                <button
                  onClick={() => alert('Garage Co-branding Inquiry sent!')}
                  className="text-xs font-bold text-[#0F0F0F] hover:text-[#F2BA03] tracking-wider uppercase inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>PARTNER NOW</span> <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Solution 3: Commercial Parking Hubs */}
              <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-[#0F0F0F] text-[#F2BA03] flex items-center justify-center">
                    <ParkingSquare className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0F0F0F]">
                    Commercial Parking Hubs
                  </h3>
                  <p className="text-[#5D5F5F] text-sm leading-relaxed">
                    Manage valet queues and parking lot overflow with real-time driver notifications, instant emergency moves, and automated logs.
                  </p>
                </div>

                <button
                  onClick={() => alert('Parking Hubs Demo Request sent!')}
                  className="text-xs font-bold text-[#0F0F0F] hover:text-[#F2BA03] tracking-wider uppercase inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>VIEW DEMO</span> <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
};

