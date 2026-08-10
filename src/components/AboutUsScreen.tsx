import React, { useState } from 'react';
import { UserFormData } from '../types';
import { DashboardHeader } from './DashboardHeader';
import { DashboardFooter } from './DashboardFooter';
import aboutBannerImg from '../assets/images/aboutbanner.png';
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

              {/* Right Column Image */}
              <div className="lg:col-span-6 flex justify-center lg:justify-end">
                <div className="relative overflow-hidden rounded-2xl shadow-lg max-w-lg w-full">
                  <img
                    src={aboutBannerImg}
                    alt="ScanConnect Tag on Car"
                    className="w-full h-[360px] sm:h-[420px] object-cover"
                  />
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
              <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest bg-[#0F0F0F]/60 w-fit px-3 py-1.5 rounded-full">
                <Star className="w-3.5 h-3.5 fill-[#F2BA03] text-[#F2BA03]" />
                <span>SHARK TANK INDIA &bull; SEASON 5</span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-4 max-w-3xl relative z-10">
                <h2 className="font-['Comic_Relief','Comic_Sans_MS',cursive] text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
                  From a parking problem to 9.5 lakh tags.
                </h2>
                <p className="text-neutral-300 text-base leading-relaxed font-normal">
                  We pitched SCAN ME on Shark Tank India and walked away with the conviction that privacy-first contact belongs on every vehicle. Since then we&apos;ve grown 4x and crossed 950,000 active tags across the country.
                </p>
              </div>

              {/* 4 Grid Stats Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-4 relative z-10">
                <div className="bg-white/10 rounded-2xl p-6 space-y-1">
                  <div className="text-3xl sm:text-4xl font-black text-[#F2BA03] font-sans">
                    950k+
                  </div>
                  <div className="text-xs font-bold tracking-widest text-neutral-300 uppercase">
                    ACTIVE TAGS
                  </div>
                </div>

                <div className="bg-white/10 rounded-2xl p-6 space-y-1">
                  <div className="text-3xl sm:text-4xl font-black text-[#F2BA03] font-sans">
                    4x
                  </div>
                  <div className="text-xs font-bold tracking-widest text-neutral-300 uppercase">
                    REVENUE GROWTH
                  </div>
                </div>

                <div className="bg-white/10 rounded-2xl p-6 space-y-1">
                  <div className="text-3xl sm:text-4xl font-black text-[#F2BA03] font-sans">
                    98.7%
                  </div>
                  <div className="text-xs font-bold tracking-widest text-neutral-300 uppercase">
                    SATISFACTION
                  </div>
                </div>

                <div className="bg-white/10 rounded-2xl p-6 space-y-1">
                  <div className="text-3xl sm:text-4xl font-black text-[#F2BA03] font-sans">
                    28
                  </div>
                  <div className="text-xs font-bold tracking-widest text-neutral-300 uppercase">
                    STATES SERVED
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 3. WHAT WE STAND FOR SECTION */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-14 space-y-2">
              <h2 className="text-3xl sm:text-4xl font-black text-[#0F0F0F] tracking-tight font-sans">
                What We Stand For
              </h2>
              <p className="text-[#5D5F5F] text-base sm:text-lg max-w-2xl">
                Building reliable, human-centric security products that empower everyday vehicle owners.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
              {/* Pillar 1 */}
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Lock className="w-5 h-5 text-[#F2BA03] fill-[#F2BA03]" />
                </div>
                <h3 className="text-xl font-bold text-[#0F0F0F]">
                  Privacy by Default
                </h3>
                <p className="text-[#5D5F5F] text-base leading-relaxed">
                  Your phone number is never shared or stored in plaintext. Everything we design ensures absolute privacy, keeping unwanted calls and scams at zero.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[#F2BA03] fill-[#F2BA03]" />
                </div>
                <h3 className="text-xl font-bold text-[#0F0F0F]">
                  Instant &amp; Frictionless
                </h3>
                <p className="text-[#5D5F5F] text-base leading-relaxed">
                  No mobile app downloads required for scanners. Anyone with a smartphone camera can scan the tag and alert you instantly in urgent situations.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="space-y-4">
                <div className="w-11 h-11 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-[#F2BA03]" />
                </div>
                <h3 className="text-xl font-bold text-[#0F0F0F]">
                  Made in India
                </h3>
                <p className="text-[#5D5F5F] text-base leading-relaxed">
                  Designed, manufactured, and supported locally by NGF132 Pvt Ltd. Built to solve the real everyday parking challenges in fast-growing cities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 4. CUSTOM SOLUTIONS SECTION */}
        <section className="py-16 sm:py-20 bg-neutral-50/80 border-t border-neutral-200/60">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-12">
              <h2 className="text-3xl sm:text-4xl font-black text-[#0F0F0F] tracking-tight font-sans">
                Custom Solutions
              </h2>
              <p className="text-[#5D5F5F] text-base sm:text-lg max-w-2xl">
                Tailored vehicle tagging and access management for organizations and commercial hubs.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Solution 1: Housing Societies */}
              <div className="p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <Building2 className="w-6 h-6 text-[#F2BA03]" />
                  <h3 className="text-xl font-bold text-[#0F0F0F]">
                    Housing Societies
                  </h3>
                  <p className="text-[#5D5F5F] text-base leading-relaxed">
                    Streamline resident vehicle entry, resolve blocked parking disputes instantly, and maintain verified resident logs without public numbers.
                  </p>
                </div>

                <button
                  onClick={() => alert('Housing Societies Partnership Inquiry sent!')}
                  className="text-sm font-bold text-[#F2BA03] hover:text-[#d19d00] tracking-wide uppercase inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>LEARN MORE</span> <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Solution 2: Garages & Workshops */}
              <div className="p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <Home className="w-6 h-6 text-[#F2BA03]" />
                  <h3 className="text-xl font-bold text-[#0F0F0F]">
                    Garages &amp; Workshops
                  </h3>
                  <p className="text-[#5D5F5F] text-base leading-relaxed">
                    Boost repeat service requests with co-branded vehicle tags that keep your service helpline accessible on every customer vehicle.
                  </p>
                </div>

                <button
                  onClick={() => alert('Garage Co-branding Inquiry sent!')}
                  className="text-sm font-bold text-[#F2BA03] hover:text-[#d19d00] tracking-wide uppercase inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <span>PARTNER NOW</span> <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Solution 3: Commercial Parking Hubs */}
              <div className="p-8 flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <ParkingSquare className="w-6 h-6 text-[#F2BA03]" />
                  <h3 className="text-xl font-bold text-[#0F0F0F]">
                    Commercial Parking Hubs
                  </h3>
                  <p className="text-[#5D5F5F] text-base leading-relaxed">
                    Manage valet queues and parking lot overflow with real-time driver notifications, instant emergency moves, and automated logs.
                  </p>
                </div>

                <button
                  onClick={() => alert('Parking Hubs Demo Request sent!')}
                  className="text-sm font-bold text-[#F2BA03] hover:text-[#d19d00] tracking-wide uppercase inline-flex items-center gap-1.5 cursor-pointer transition-colors"
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

