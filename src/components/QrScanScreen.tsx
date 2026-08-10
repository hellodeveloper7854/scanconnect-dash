import React, { useState } from 'react';
import {
  QrCode,
  ShieldCheck,
  Scan,
  PhoneCall,
  MessageCircle,
  MessageSquare,
  Mail,
  X,
  CheckCircle,
  Sparkles,
  Check,
  Car,
  Lightbulb,
  AlertTriangle,
  Wrench,
  KeyRound,
  Eye,
  ParkingSquare,
  IndianRupee
} from 'lucide-react';
import { DashboardHeader } from './DashboardHeader';
import { DashboardFooter } from './DashboardFooter';
import { UserFormData } from '../types';
import scanBannerImg from '../assets/images/scanbanner.png';

interface QrScanScreenProps {
  userData: UserFormData;
  onLogout: () => void;
  onNavigate: (nav: string) => void;
  isLoggedIn?: boolean;
}

export const QrScanScreen: React.FC<QrScanScreenProps> = ({
  userData,
  onLogout,
  onNavigate,
  isLoggedIn,
}) => {
  const [activeNav, setActiveNav] = useState('QR Scan');
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [scannedTagId, setScannedTagId] = useState('');
  const [isScanSuccess, setIsScanSuccess] = useState(false);

  const handleHeaderNav = (nav: string) => {
    setActiveNav(nav);
    onNavigate(nav);
  };

  const handleSimulateScan = () => {
    setIsScanSuccess(true);
  };

  // Why Millions Trust Scan Connect
  const trustPoints = [
    'Personal Phone Numbers Stay Hidden',
    'Instant Communication During Emergencies',
    'No App Required for the Scanner',
    'Secure Call, SMS & WhatsApp Routing',
    'Fast & Easy QR Scanning',
    'End-to-End Privacy Protection',
    'Works Anywhere, Anytime',
  ];

  // When Can You Use Scan Connect?
  const useCases = [
    { icon: Car, label: 'Vehicle Blocking Your Way' },
    { icon: Lightbulb, label: 'Headlights or Hazard Lights Left On' },
    { icon: AlertTriangle, label: 'Roadside Emergency' },
    { icon: Car, label: 'Accident or Damage Notification' },
    { icon: Wrench, label: 'Flat Tyre or Mechanical Issue' },
    { icon: KeyRound, label: 'Keys Left Inside Vehicle' },
    { icon: Eye, label: 'Suspicious Activity Around the Vehicle' },
    { icon: ParkingSquare, label: 'Wrong Parking Alert' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 font-sans antialiased">
      {/* Header */}
      <DashboardHeader
        userData={userData}
        onLogout={onLogout}
        activeNav={activeNav}
        isLoggedIn={isLoggedIn}
        onNavClick={handleHeaderNav}
      />

      <main className="flex-1">
        {/* SECTION 1: HERO BANNER */}
        <section className="py-12 sm:py-16 lg:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

              {/* Left Content Column */}
              <div className="lg:col-span-6 space-y-8">
                {/* Privacy Guaranteed Badge */}
                <div className="inline-flex items-center gap-2 py-1 px-3.5 rounded-full border border-neutral-200 bg-white">
                  <ShieldCheck className="w-3.5 h-3.5 text-black" />
                  <span className="font-sans font-normal text-xs uppercase tracking-[1px] text-black">
                    PRIVACY GUARANTEED
                  </span>
                </div>

                {/* Headline */}
                <h1 className="text-3xl sm:text-4xl lg:text-[40px] lg:leading-[1.15] font-bold text-black font-sans tracking-normal">
                  Instantly Connect with Vehicle Owners. Completely Private.
                </h1>

                {/* Body paragraph */}
                <p className="text-[#6B7280] font-normal text-lg sm:text-[20px] leading-[24px] max-w-xl">
                  Need to notify a vehicle owner about wrong parking, headlights left on, an accident, or any emergency? Simply scan the Scan Connect QR Tag and reach them instantly&mdash;without revealing your phone number or accessing theirs.
                </p>

                <p className="font-['Inter'] font-bold text-xs tracking-[1.5px] uppercase text-[#F2BA03]">
                  Fast &bull; Secure &bull; Privacy-First &bull; No App Required
                </p>

                {/* Action Buttons Row */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => setIsQrScannerOpen(true)}
                    className="h-[58px] px-8 bg-[#F2BA03] hover:bg-[#e0ac00] text-white font-bold text-base rounded-lg transition-all cursor-pointer flex items-center gap-2 shadow-sm active:scale-95"
                  >
                    <QrCode className="w-5 h-5 text-white" />
                    <span>Scan a QR Tag</span>
                  </button>

                  <button
                    onClick={() => onNavigate('shop')}
                    className="h-[58px] px-8 bg-white hover:bg-neutral-50 text-[#0F0F0F] border border-[#0F0F0F] font-bold text-base rounded-lg transition-all cursor-pointer active:scale-95"
                  >
                    Buy Your Scan Connect Tag
                  </button>
                </div>
              </div>

              {/* Right Image Card Column */}
              <div className="lg:col-span-6 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-[510px] h-[383px] rounded-[16px] overflow-hidden border border-[#E5E7EB] shadow-md bg-[#FFFFFF]">
                  <img
                    src={scanBannerImg}
                    alt="Smartphone scanning ScanConnect vehicle QR tag on car window"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 2: HOW SCAN CONNECT WORKS HEADER */}
        <section className="pt-16 pb-8 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-4">
            <h2 className="text-3xl sm:text-[40px] leading-[1.2] font-bold text-black font-sans">
              How Scan Connect Works
            </h2>
            <p className="font-['Hanken_Grotesk'] font-semibold text-lg text-[#1B1C1C]">
              Three Simple Steps. One Secure Connection.
            </p>
            <p className="text-[#5F5E5E] text-lg sm:text-[20px] leading-[24px] font-normal max-w-4xl mx-auto">
              Scan Connect creates a secure digital bridge between people and vehicles, enabling instant communication while keeping personal information completely private.
            </p>
          </div>
        </section>

        {/* SECTION 3: 3 STEP CARDS */}
        <section className="py-8 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

              {/* Step 1 Card */}
              <div className="bg-white rounded-[15px] p-7 sm:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.09)] border border-neutral-100 flex flex-col items-start text-left min-h-[266px]">
                <div className="w-[60px] h-[60px] bg-[#F2BA03] rounded-[12px] flex items-center justify-center text-white mb-5 shrink-0">
                  <Scan className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-3 font-sans">
                  Step 1 &mdash; Scan the QR Tag
                </h3>
                <p className="text-[#6B7280] text-lg sm:text-[18px] leading-[27px] font-normal">
                  Use your smartphone camera to scan the Scan Connect QR Tag displayed on the vehicle. No app downloads, registrations, or complicated setup required.
                </p>
                <div className="flex items-center gap-2 pt-4">
                  <Check className="w-4 h-4 text-[#F2BA03] stroke-[3]" />
                  <span className="text-sm font-semibold text-[#1B1C1C]">Works with any smartphone</span>
                </div>
              </div>

              {/* Step 2 Card */}
              <div className="bg-white rounded-[15px] p-7 sm:p-8 shadow-[0_4px_4px_rgba(0,0,0,0.09)] border border-neutral-100 flex flex-col items-start text-left min-h-[266px]">
                <div className="w-[60px] h-[60px] bg-[#F2BA03] rounded-[12px] flex items-center justify-center text-white mb-5 shrink-0">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-3 font-sans">
                  Step 2 &mdash; Choose How to Contact
                </h3>
                <p className="text-[#6B7280] text-lg sm:text-[18px] leading-[27px] font-normal">
                  Once the QR page opens, select your preferred way to reach the vehicle owner.
                </p>
                <div className="space-y-2 pt-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#1B1C1C]">
                    <PhoneCall className="w-4 h-4 text-[#F2BA03]" /> Secure Call
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#1B1C1C]">
                    <MessageCircle className="w-4 h-4 text-[#F2BA03]" /> WhatsApp Message
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#1B1C1C]">
                    <Mail className="w-4 h-4 text-[#F2BA03]" /> SMS
                  </div>
                </div>
              </div>

              {/* Step 3 Card */}
              <div className="bg-white rounded-[15px] p-7 sm:p-8 shadow-[0_4px_4px_rgba(0,0,0,0.09)] border border-neutral-100 flex flex-col items-start text-left min-h-[266px]">
                <div className="w-[60px] h-[60px] bg-[#F2BA03] rounded-[12px] flex items-center justify-center text-white mb-5 shrink-0">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-[#111827] mb-3 font-sans">
                  Step 3 &mdash; Privacy Protected
                </h3>
                <p className="text-[#6B7280] text-lg sm:text-[18px] leading-[27px] font-normal">
                  Scan Connect securely routes every call and message through its privacy network. The scanner never sees the owner&apos;s phone number. The owner never sees the scanner&apos;s phone number. Both parties stay protected while communicating seamlessly.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* SECTION 4: WHY MILLIONS TRUST SCAN CONNECT */}
        <section className="py-16 sm:py-20 bg-[#FAFAFA] border-t border-neutral-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-[38px] font-black text-[#0F0F0F] font-sans">
                Why Millions Trust Scan Connect
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trustPoints.map((point) => (
                <div key={point} className="flex items-center gap-3 bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs">
                  <Check className="w-4 h-4 text-[#F2BA03] stroke-[3] shrink-0" />
                  <span className="font-['Hanken_Grotesk'] font-medium text-sm sm:text-base text-[#1B1C1C]">{point}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5: WHEN CAN YOU USE SCAN CONNECT? */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
              <h2 className="text-3xl sm:text-[38px] font-black text-[#0F0F0F] font-sans">
                When Can You Use Scan Connect?
              </h2>
              <p className="text-[#5F5E5E] text-base sm:text-lg leading-relaxed">
                Whether it&apos;s a minor inconvenience or a critical situation, Scan Connect helps you connect with the vehicle owner instantly.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {useCases.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="bg-white border border-[#E5E7EB] rounded-xl p-6 flex flex-col items-center text-center gap-3 shadow-xs hover:shadow-md hover:border-[#F2BA03] transition-all"
                >
                  <Icon className="w-7 h-7 text-[#F2BA03]" />
                  <span className="font-['Hanken_Grotesk'] font-semibold text-sm text-[#1B1C1C]">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6: READY TO SECURE CTA */}
        <section className="py-16 sm:py-20 bg-white border-t border-neutral-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-[40px] leading-[1.2] font-bold text-black font-sans">
                Ready to Protect Your Privacy?
              </h2>
              <p className="text-black/80 text-lg sm:text-[20px] leading-[24px] font-normal max-w-3xl mx-auto">
                Join thousands of smart vehicle owners who rely on Scan Connect for secure, hassle-free communication every day.
              </p>
              <p className="text-[#5F5E5E] text-base sm:text-lg leading-[26px] max-w-3xl mx-auto">
                Stay reachable when it matters&mdash;without ever exposing your personal phone number.
              </p>
              <p className="font-['Hanken_Grotesk'] font-bold text-lg text-[#1B1C1C]">
                Your Vehicle. Your Privacy. Your Peace of Mind.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => onNavigate('shop')}
                className="h-[66px] px-10 bg-[#0F0F0F] hover:bg-black text-white font-bold text-lg sm:text-[20px] rounded-[12px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] transition-all cursor-pointer active:scale-95 inline-flex items-center justify-center gap-2"
              >
                <Car className="w-5 h-5" />
                Get Your Scan Connect Tag
              </button>
              <button
                onClick={() => onNavigate('shop')}
                className="h-[66px] px-10 bg-white hover:bg-neutral-50 text-black border border-[#5F5E5E] font-bold text-lg sm:text-[20px] rounded-[12px] transition-all cursor-pointer active:scale-95 inline-flex items-center justify-center gap-2"
              >
                <IndianRupee className="w-5 h-5" />
                View Plans & Pricing
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* QR SCANNER MODAL */}
      {isQrScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-neutral-900 text-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative border border-neutral-800 space-y-5">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#f5b800] text-neutral-950 flex items-center justify-center">
                  <Scan className="w-4 h-4 stroke-[2.5]" />
                </div>
                <h3 className="text-base font-black text-white uppercase tracking-wider font-mono">
                  SCAN CONNECT TAG READER
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsQrScannerOpen(false);
                  setIsScanSuccess(false);
                }}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {!isScanSuccess ? (
              <div className="space-y-4">
                {/* Simulated Camera Scanner Viewfinder */}
                <div className="aspect-square bg-neutral-950 rounded-2xl relative flex flex-col items-center justify-center overflow-hidden border-2 border-dashed border-[#f5b800]/50 p-6 text-center">
                  {/* Animated Corner Reticles */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#f5b800]" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#f5b800]" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#f5b800]" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#f5b800]" />

                  {/* Laser Scanning Line */}
                  <div className="absolute inset-x-0 h-1 bg-[#f5b800] shadow-[0_0_15px_#f5b800] animate-pulse top-1/3" />

                  <QrCode className="w-24 h-24 text-[#f5b800]/80 mb-3 animate-pulse" />
                  <p className="text-xs text-neutral-300 font-mono">
                    Point camera at vehicle SCAN ME sticker tag...
                  </p>

                  <button
                    onClick={handleSimulateScan}
                    className="mt-4 px-5 py-2.5 bg-[#f5b800] text-neutral-950 rounded-xl font-extrabold text-xs uppercase tracking-wider hover:bg-amber-400 cursor-pointer shadow-lg transition-transform active:scale-95 flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" /> Simulate QR Tag Detect
                  </button>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-neutral-400 uppercase mb-1">
                    Or Enter Tag ID Manually:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. SC-MH12-9881"
                      value={scannedTagId}
                      onChange={(e) => setScannedTagId(e.target.value)}
                      className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#f5b800]"
                    />
                    <button
                      onClick={handleSimulateScan}
                      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-xs rounded-xl cursor-pointer"
                    >
                      Connect
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Success Masked Connection Screen */
              <div className="space-y-4 animate-fade-in text-center py-2">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>

                <div>
                  <span className="text-[10px] font-bold tracking-widest text-emerald-400 uppercase font-mono">
                    VEHICLE TAG DETECTED
                  </span>
                  <h4 className="text-xl font-black text-white mt-1">
                    Vehicle: MH-12-SC-9881
                  </h4>
                  <p className="text-xs text-neutral-400 mt-1">
                    Privacy Shield Active • Owner Phone Masked
                  </p>
                </div>

                <div className="bg-neutral-950 p-4 rounded-2xl border border-neutral-800 space-y-3 text-left">
                  <div className="flex items-center justify-between text-xs text-neutral-300">
                    <span className="font-bold">Contact Channel:</span>
                    <span className="text-amber-400 font-mono">Private Proxy Bridge</span>
                  </div>
                  <div className="flex items-center justify-between text-xs text-neutral-300">
                    <span className="font-bold">Your Number Exposed:</span>
                    <span className="text-emerald-400 font-bold">NEVER (0%)</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    onClick={() => alert('📞 Initiating Privacy-Masked Voice Call to Vehicle Owner...')}
                    className="py-3 bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-amber-300"
                  >
                    <PhoneCall className="w-4 h-4" /> Masked Call
                  </button>
                  <button
                    onClick={() => alert('💬 Opening Anonymous WhatsApp Proxy Chat with Vehicle Owner...')}
                    className="py-3 bg-emerald-500 text-neutral-950 font-black text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-2 cursor-pointer hover:bg-emerald-400"
                  >
                    <MessageCircle className="w-4 h-4" /> WhatsApp
                  </button>
                </div>

                <button
                  onClick={() => setIsScanSuccess(false)}
                  className="text-xs text-neutral-400 hover:text-white underline cursor-pointer pt-2"
                >
                  Scan Another Vehicle Tag
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
};
