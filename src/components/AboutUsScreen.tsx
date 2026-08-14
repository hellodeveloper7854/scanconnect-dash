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
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
  BadgeCheck,
  Clock,
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
                  Scan Connect started with a simple frustration: leaving your phone number on your dashboard meant spam calls, harassment, and zero privacy. We built a smart QR tag that lets anyone reach you instantly — without ever seeing your actual phone number.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => onNavigate('shop')}
                    className="btn-shimmer h-[52px] px-8 bg-[#F2BA03] hover:bg-[#e0ac00] hover:shadow-[0_8px_24px_rgba(242,186,3,0.45)] hover:-translate-y-0.5 text-white font-bold text-sm sm:text-base uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>GET YOUR TAG</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="btn-shimmer h-[52px] px-8 bg-[#0F0F0F] hover:bg-neutral-800 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 border border-[#0F0F0F] text-white font-bold text-sm sm:text-base uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center active:scale-95"
                  >
                    HOW IT WORKS
                  </button>
                </div>
              </div>

              {/* Right Column Image */}
              <div className="lg:col-span-6 flex justify-center lg:justify-end">
                <div className="relative overflow-hidden  max-w-lg w-full">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-5">
              {[
                {
                  icon: Lock,
                  title: 'Privacy by Default',
                  desc: 'Your phone number is never shared or stored in plaintext. Everything we design ensures absolute privacy, keeping unwanted calls and scams at zero.',
                  featured: true,
                },
                {
                  icon: Zap,
                  title: 'Instant & Frictionless',
                  desc: 'No app downloads required for scanners. Anyone with a smartphone camera can scan the tag and alert you instantly.',
                  featured: false,
                },
                {
                  icon: Globe,
                  title: 'Made in India',
                  desc: 'Designed, manufactured, and supported locally by Creative Frameworks for fast-growing Indian cities.',
                  featured: false,
                },
                {
                  icon: ShieldCheck,
                  title: 'Built to Last',
                  desc: 'Weatherproof, UV-resistant tags. No batteries, no maintenance — just a tag that keeps working for years.',
                  featured: true,
                },
                {
                  icon: Clock,
                  title: 'Always-On Support',
                  desc: 'Our helpdesk and SOS response systems are available 24×7, never more than a call or message away.',
                  featured: false,
                },
                {
                  icon: HeartHandshake,
                  title: 'Honest, Transparent Pricing',
                  desc: 'One-time purchase, lifetime activation, no hidden subscriptions or renewal fees — ever.',
                  featured: false,
                },
              ].map((pillar) => {
                const PillarIcon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className={`group relative overflow-hidden rounded-2xl p-6 flex flex-col gap-4 transition-all hover:-translate-y-1 sm:col-span-1 lg:col-span-3 ${
                      pillar.featured
                        ? 'bg-[#1B1C1C] text-white shadow-[0_16px_40px_rgba(0,0,0,0.2)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)]'
                        : 'bg-white border border-neutral-200 shadow-xs hover:shadow-lg hover:border-[#F2BA03]/50'
                    }`}
                  >
                    {/* Decorative oversized watermark icon for visual variety */}
                    <PillarIcon
                      className={`absolute -right-4 -bottom-4 w-28 h-28 rotate-12 pointer-events-none transition-transform group-hover:rotate-6 ${
                        pillar.featured ? 'text-white/[0.06]' : 'text-[#F2BA03]/[0.08]'
                      }`}
                    />

                    <div
                      className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                        pillar.featured ? 'bg-[#F2BA03]' : 'bg-[#1B1C1C]'
                      }`}
                    >
                      <PillarIcon className={`w-7 h-7 ${pillar.featured ? 'text-[#1B1C1C]' : 'text-[#F2BA03]'}`} />
                    </div>
                    <h3 className={`relative z-10 text-xl font-bold ${pillar.featured ? 'text-white' : 'text-[#0F0F0F]'}`}>
                      {pillar.title}
                    </h3>
                    <p className={`relative z-10 text-base leading-relaxed ${pillar.featured ? 'text-neutral-300' : 'text-[#5D5F5F]'}`}>
                      {pillar.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* 4. CUSTOM SOLUTIONS SECTION */}
        <section className="pt-10 sm:pt-12 pb-16 sm:pb-20 bg-white border-t border-neutral-200/60">
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

