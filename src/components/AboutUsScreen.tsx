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
  ArrowRight
} from 'lucide-react';

interface AboutUsScreenProps {
  userData: UserFormData;
  onLogout: () => void;
  onNavigate: (nav: string) => void;
}

export const AboutUsScreen: React.FC<AboutUsScreenProps> = ({
  userData,
  onLogout,
  onNavigate,
}) => {
  const [activeNav, setActiveNav] = useState('About');

  const handleHeaderNav = (navItem: string) => {
    setActiveNav(navItem);
    if (navItem === 'How it works' || navItem === 'QR Scan') {
      onNavigate('dashboard');
    } else if (navItem === 'About') {
      onNavigate('about');
    } else {
      alert(`Navigating to ${navItem}`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 font-sans antialiased">
      {/* Top Header */}
      <DashboardHeader
        userData={userData}
        onLogout={onLogout}
        activeNav={activeNav}
        onNavClick={handleHeaderNav}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* 1. HERO MISSION SECTION */}
        <section className="py-12 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Column Text */}
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-bold tracking-widest text-[#d19d00] uppercase font-mono">
                  OUR MISSION
                </span>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-900 tracking-tight leading-[1.08] font-sans">
                  Privacy shouldn&apos;t cost you a phonecall.
                </h1>

                <p className="text-neutral-600 text-base sm:text-lg leading-relaxed font-normal max-w-xl">
                  Sampark started with a simple frustration: leaving your number on the dashboard meant spam, scams and zero privacy. We built a tag that lets anyone reach you — without ever seeing your number.
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => alert('Order your ScanConnect Vehicle Tag now!')}
                    className="px-7 py-3.5 bg-[#f5b800] hover:bg-amber-400 text-neutral-950 font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-lg shadow-sm transition-colors cursor-pointer"
                  >
                    GET YOUR TAG
                  </button>

                  <button
                    onClick={() => onNavigate('dashboard')}
                    className="px-7 py-3.5 bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-800 font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-lg transition-colors cursor-pointer"
                  >
                    HOW IT WORKS
                  </button>
                </div>
              </div>

              {/* Right Column Image */}
              <div className="lg:col-span-6 flex justify-center lg:justify-end">
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-neutral-200 max-w-lg w-full group">
                  <img
                    src="https://images.unsplash.com/photo-1541348263662-e082662d82da?auto=format&fit=crop&w=1200&q=80"
                    alt="ScanConnect Tag on Car"
                    className="w-full h-[360px] sm:h-[420px] object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Overlay Simulated QR Decal Badge on Car Rear */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white/95 p-3.5 rounded-2xl shadow-2xl border-2 border-[#f5b800] flex flex-col items-center gap-1.5 backdrop-blur-xs">
                    <div className="w-24 h-24 bg-neutral-950 p-2 rounded-xl flex items-center justify-center">
                      {/* Simulated QR decal SVG */}
                      <svg className="w-full h-full text-[#f5b800]" viewBox="0 0 100 100" fill="currentColor">
                        <path d="M0 0h30v30H0zM10 10h10v10H10zM70 0h30v30H70zM80 10h10v10H80zM0 70h30v30H0zM10 80h10v10H10zM40 0h10v20H40zM50 30h20v10H50zM30 40h10v30H30zM50 50h30v10H50zM80 60h20v40H80zM40 80h20v20H40z"/>
                      </svg>
                    </div>
                    <span className="bg-neutral-950 text-[#f5b800] text-[9px] font-black px-2 py-0.5 rounded font-mono uppercase tracking-widest">
                      SCAN ME
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>


        {/* 2. SHARK TANK INDIA & STATS CARD SECTION */}
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#3f4143] text-white rounded-3xl p-8 sm:p-12 lg:p-16 shadow-2xl space-y-8">
              
              {/* Shark Tank Badge Header */}
              <div className="flex items-center gap-2 text-[#f5b800] font-black text-xs uppercase tracking-widest font-mono">
                <Star className="w-4 h-4 fill-current" />
                <span>SHARK TANK INDIA • SEASON 5</span>
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-4 max-w-3xl">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-sans leading-tight">
                  From a parking problem to 9.5 lakh tags.
                </h2>
                <p className="text-neutral-300 text-sm sm:text-base leading-relaxed font-normal">
                  We pitched SCAN ME on Shark Tank India and walked away with the conviction that privacy-first contact belongs on every vehicle. Since then we&apos;ve grown 4x and crossed 950,000 active tags across the country.
                </p>
              </div>

              {/* 4 Grid Stats Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 pt-4">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-1">
                  <div className="text-3xl sm:text-4xl font-black text-[#f5b800] font-sans">
                    950k+
                  </div>
                  <div className="text-[11px] font-mono font-bold tracking-widest text-neutral-300 uppercase">
                    ACTIVE TAGS
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-1">
                  <div className="text-3xl sm:text-4xl font-black text-[#f5b800] font-sans">
                    4x
                  </div>
                  <div className="text-[11px] font-mono font-bold tracking-widest text-neutral-300 uppercase">
                    REVENUE GROWTH
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-1">
                  <div className="text-3xl sm:text-4xl font-black text-[#f5b800] font-sans">
                    98.7%
                  </div>
                  <div className="text-[11px] font-mono font-bold tracking-widest text-neutral-300 uppercase">
                    SATISFACTION
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 space-y-1">
                  <div className="text-3xl sm:text-4xl font-black text-[#f5b800] font-sans">
                    28
                  </div>
                  <div className="text-[11px] font-mono font-bold tracking-widest text-neutral-300 uppercase">
                    STATES SERVED
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>


        {/* 3. WHAT WE STAND FOR SECTION */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight font-sans mb-12">
              What we stand for
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Pillar 1 */}
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-[#f5b800] flex items-center justify-center">
                  <Lock className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">
                  Privacy by default
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  Your number is never the product. Everything we build keeps it hidden, ensuring your personal security remains uncompromised.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-[#f5b800] flex items-center justify-center">
                  <Zap className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">
                  Useful, not flashy
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  A tag that just works. Designed for the critical moment when someone needs to reach you without friction or delay.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="space-y-4">
                <div className="w-10 h-10 rounded-lg bg-amber-50 text-[#f5b800] flex items-center justify-center">
                  <Globe className="w-5 h-5 stroke-[2.2]" />
                </div>
                <h3 className="text-xl font-bold text-neutral-900">
                  Made in India
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed">
                  Designed, built, and supported locally. We understand the unique challenges of urban parking in Indian cities.
                </p>
              </div>
            </div>
          </div>
        </section>


        {/* 4. CUSTOM SOLUTIONS SECTION */}
        <section className="py-20 bg-neutral-50/70 border-t border-neutral-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight font-sans mb-12">
              Custom solutions
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Solution 1: Housing Societies */}
              <div className="bg-white border border-neutral-200/90 rounded-2xl p-8 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-[#f5b800] flex items-center justify-center">
                    <Building2 className="w-5 h-5 stroke-[2]" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900">
                    Housing Societies
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    Streamline resident parking and maintain secure vehicle logs effortlessly through our integrated QR ecosystem.
                  </p>
                </div>

                <button
                  onClick={() => alert('Housing Societies Partnership inquiry')}
                  className="text-xs font-bold text-[#f5b800] hover:text-[#d19d00] tracking-wider uppercase inline-flex items-center gap-1.5 cursor-pointer pt-2"
                >
                  <span>LEARN MORE</span> <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Solution 2: Garages */}
              <div className="bg-white border border-neutral-200/90 rounded-2xl p-8 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-[#f5b800] flex items-center justify-center">
                    <Home className="w-5 h-5 stroke-[2]" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900">
                    Garages
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    Boost customer loyalty with co-branded service tags that keep your contact info just one scan away for your clients.
                  </p>
                </div>

                <button
                  onClick={() => alert('Garage Co-branding inquiry')}
                  className="text-xs font-bold text-[#f5b800] hover:text-[#d19d00] tracking-wider uppercase inline-flex items-center gap-1.5 cursor-pointer pt-2"
                >
                  <span>PARTNER NOW</span> <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Solution 3: Parking Hubs */}
              <div className="bg-white border border-neutral-200/90 rounded-2xl p-8 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-6">
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 text-[#f5b800] flex items-center justify-center">
                    <ParkingSquare className="w-5 h-5 stroke-[2]" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900">
                    Parking Hubs
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    Manage commercial parking lots with real-time analytics and frictionless payment integrations for all tag users.
                  </p>
                </div>

                <button
                  onClick={() => alert('Parking Hubs Demo Request')}
                  className="text-xs font-bold text-[#f5b800] hover:text-[#d19d00] tracking-wider uppercase inline-flex items-center gap-1.5 cursor-pointer pt-2"
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
