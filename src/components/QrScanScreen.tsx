import React, { useState } from 'react';
import {
  QrCode,
  ShieldCheck,
  Scan,
  X,
  Car,
  Lightbulb,
  AlertTriangle,
  Wrench,
  KeyRound,
  Eye,
  ParkingSquare,
  IndianRupee,
  CameraOff,
  Loader2,
  Check,
  MessageSquare,
  PhoneCall,
  MessageCircle,
  Mail
} from 'lucide-react';
import { DashboardHeader } from './DashboardHeader';
import { DashboardFooter } from './DashboardFooter';
import { UserFormData } from '../types';
import scanBannerImg from '../assets/images/scanbanner.png';
import { useQrScanner } from '../lib/useQrScanner';
import { useRevealOnScroll } from '../lib/useRevealOnScroll';

interface QrScanScreenProps {
  userData: UserFormData;
  onLogout: () => void;
  onNavigate: (nav: string) => void;
  isLoggedIn?: boolean;
}

/** Fades + rises a card into place the first time it scrolls into view, with an optional stagger delay. */
const RevealCard: React.FC<{ delayMs?: number; className?: string; children: React.ReactNode }> = ({
  delayMs = 0,
  className = '',
  children,
}) => {
  const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal-on-scroll ${isVisible ? 'is-visible' : ''} ${className}`}
      style={{ animationDelay: isVisible ? `${delayMs}ms` : undefined }}
    >
      {children}
    </div>
  );
};

/** Growing progress bar that only animates once scrolled into view, used behind the step timeline icons. */
const RevealTimelineBar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>();
  return (
    <div ref={ref} className={className}>
      <div className={`h-full bg-gradient-to-r from-[#FFED00] to-[#e0ac00] ${isVisible ? 'animate-timeline-grow' : 'scale-x-0 origin-left'}`} />
    </div>
  );
};

export const QrScanScreen: React.FC<QrScanScreenProps> = ({
  userData,
  onLogout,
  onNavigate,
  isLoggedIn,
}) => {
  const [activeNav, setActiveNav] = useState('QR Scan');
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);

  const handleHeaderNav = (nav: string) => {
    setActiveNav(nav);
    onNavigate(nav);
  };

  const handleDetect = (data: string) => {
    const looksLikeUrl = /^https?:\/\//i.test(data);
    window.location.href = looksLikeUrl ? data : `https://${data}`;
  };

  const { videoRef, status: scannerStatus } = useQrScanner(isQrScannerOpen, handleDetect);

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
                <div className="inline-flex items-center gap-2 py-1 px-3.5 rounded-full border border-[#E6D400] bg-[#FFED00]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#1B1C1C]" />
                  <span className="font-sans font-normal text-xs uppercase tracking-[1px] text-[#1B1C1C]">
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

                <p className="font-['Inter'] font-bold text-xs tracking-[1.5px] uppercase text-[#B58500]">
                  Fast &bull; Secure &bull; Privacy-First &bull; No App Required
                </p>

                {/* Action Buttons Row */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-4 pt-2">
                  <button
                    onClick={() => setIsQrScannerOpen(true)}
                    className="btn-shimmer sm:hidden w-full h-[58px] px-8 bg-[#FFED00] hover:bg-[#e0ac00] hover:shadow-[0_8px_24px_rgba(242,186,3,0.45)] hover:-translate-y-0.5 text-[#1B1C1C] font-bold text-base rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm active:scale-95"
                  >
                    <QrCode className="w-5 h-5 text-[#1B1C1C]" />
                    <span>Scan a QR Tag</span>
                  </button>

                  <button
                    onClick={() => { window.location.href = '/shop#products'; }}
                    className="btn-shimmer w-full sm:w-auto h-[58px] px-8 bg-[#0F0F0F] hover:bg-neutral-800 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 text-white border border-[#0F0F0F] font-bold text-base rounded-lg transition-all cursor-pointer active:scale-95 flex items-center justify-center"
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

        {/* SECTION 3: 3 STEP CARDS — same timeline UI as the home page "Simple. Secure. Instant." section */}
        <section className="py-12 sm:py-16 bg-gradient-to-b from-[#FFFBF0] to-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 items-stretch">
              {/* Connecting timeline — desktop only, grows left-to-right once scrolled into view */}
              <RevealTimelineBar className="hidden md:block absolute top-[42px] left-[16.66%] right-[16.66%] h-[3px] bg-neutral-200 rounded-full overflow-hidden" />

              {[
                {
                  num: '1',
                  icon: Scan,
                  title: 'Step 1 — Scan the QR Tag',
                  desc: 'Use your smartphone camera to scan the Scan Connect QR Tag displayed on the vehicle. No app downloads, registrations, or complicated setup required.',
                  extra: (
                    <div className="flex items-center gap-2 pt-3">
                      <Check className="w-4 h-4 text-[#1B1C1C] stroke-[3]" />
                      <span className="text-sm font-semibold text-[#1B1C1C]">Works with any smartphone</span>
                    </div>
                  ),
                },
                {
                  num: '2',
                  icon: MessageSquare,
                  title: 'Step 2 — Choose How to Contact',
                  desc: 'Once the QR page opens, select your preferred way to reach the vehicle owner.',
                  extra: (
                    <div className="space-y-2 pt-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#1B1C1C]">
                        <PhoneCall className="w-4 h-4 text-[#FFED00]" /> Secure Call
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#1B1C1C]">
                        <MessageCircle className="w-4 h-4 text-[#FFED00]" /> WhatsApp Message
                      </div>
                      <div className="flex items-center gap-2 text-sm font-semibold text-[#1B1C1C]">
                        <Mail className="w-4 h-4 text-[#FFED00]" /> SMS
                      </div>
                    </div>
                  ),
                },
                {
                  num: '3',
                  icon: ShieldCheck,
                  title: 'Step 3 — Privacy Protected',
                  desc: "Scan Connect securely routes every call and message through its privacy network. The scanner never sees the owner's phone number. The owner never sees the scanner's phone number. Both parties stay protected while communicating seamlessly.",
                  extra: null,
                },
              ].map((step, idx) => {
                const StepIcon = step.icon;
                return (
                  <RevealCard
                    key={step.num}
                    delayMs={idx * 350}
                    className="relative flex flex-col items-center text-center group h-full"
                  >
                    {/* Icon + step number badge */}
                    <div className="relative z-10 w-[84px] h-[84px] rounded-full bg-gradient-to-br from-[#FFED00] to-[#e0ac00] flex items-center justify-center shadow-[0_10px_30px_rgba(242,186,3,0.4)] mb-7 ring-8 ring-white group-hover:scale-105 transition-transform duration-300 shrink-0">
                      <StepIcon className="w-9 h-9 text-white stroke-[1.75]" />
                      <span className="absolute -top-2 -right-1.5 w-8 h-8 rounded-full bg-[#1B1C1C] text-white font-['Inter'] font-extrabold text-xs flex items-center justify-center shadow-lg ring-2 ring-white">
                        {step.num}
                      </span>
                    </div>

                    {/* Card body — flex-1 + equal padding keeps every card the same height regardless of copy length */}
                    <div className="w-full flex-1 bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.07)] flex flex-col gap-3 hover:shadow-[0_16px_40px_rgba(242,186,3,0.18)] hover:border-[#FFED00]/50 hover:-translate-y-1.5 transition-all duration-300 text-left">
                      <h3 className="font-['Poppins'] font-bold text-lg sm:text-xl text-[#111827] leading-snug">
                        {step.title}
                      </h3>
                      <p className="font-['Inter'] font-normal text-sm text-[#374151] leading-[23px]">
                        {step.desc}
                      </p>
                      {step.extra}
                    </div>
                  </RevealCard>
                );
              })}
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
                  <Check className="w-4 h-4 text-[#1B1C1C] stroke-[3] shrink-0" />
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
              {useCases.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="h-full bg-white border border-[#E5E7EB] rounded-xl p-6 flex flex-col items-center justify-center text-center gap-3 shadow-xs hover:shadow-md hover:border-[#FFED00] transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-[#FFED00] flex items-center justify-center shrink-0">
                    <Icon className="w-6 h-6 text-[#1B1C1C]" />
                  </div>
                  <span className="font-['Hanken_Grotesk'] font-semibold text-sm text-[#1B1C1C] leading-snug flex items-center min-h-[40px]">{label}</span>
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

            <div className="flex flex-col sm:flex-row items-stretch justify-center gap-4 pt-2">
              <button
                onClick={() => { window.location.href = '/shop#products'; }}
                className="btn-shimmer h-[66px] px-10 w-full sm:flex-1 bg-[#0F0F0F] hover:bg-black hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 text-white font-bold text-lg sm:text-[20px] rounded-[12px] shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] transition-all cursor-pointer active:scale-95 inline-flex items-center justify-center gap-2"
              >
                <Car className="w-5 h-5" />
                Get Your Scan Connect Tag
              </button>
              <button
                onClick={() => { window.location.href = '/shop#products'; }}
                className="btn-shimmer h-[66px] px-10 w-full sm:flex-1 bg-[#FFED00] hover:bg-[#e0ac00] hover:shadow-[0_8px_24px_rgba(242,186,3,0.45)] hover:-translate-y-0.5 text-[#1B1C1C] font-bold text-lg sm:text-[20px] rounded-[12px] transition-all cursor-pointer active:scale-95 inline-flex items-center justify-center gap-2"
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
                onClick={() => setIsQrScannerOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-square bg-neutral-950 rounded-2xl relative flex flex-col items-center justify-center overflow-hidden border-2 border-dashed border-[#f5b800]/50">
              {/* Always mounted so the ref exists before getUserMedia resolves; hidden until actively scanning. */}
              {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
              <video
                ref={videoRef}
                muted
                playsInline
                className={`w-full h-full object-cover ${scannerStatus === 'scanning' ? '' : 'hidden'}`}
              />

              {scannerStatus === 'scanning' && (
                <>
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#f5b800]" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#f5b800]" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#f5b800]" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#f5b800]" />
                  <div className="absolute inset-x-0 h-1 bg-[#f5b800] shadow-[0_0_15px_#f5b800] animate-pulse top-1/3" />
                </>
              )}

              {scannerStatus === 'requesting' && (
                <div className="flex flex-col items-center gap-3 text-center p-6">
                  <Loader2 className="w-10 h-10 text-[#f5b800] animate-spin" />
                  <p className="text-xs text-neutral-300 font-mono">Requesting camera access...</p>
                </div>
              )}

              {scannerStatus === 'denied' && (
                <div className="flex flex-col items-center gap-3 text-center p-6">
                  <CameraOff className="w-10 h-10 text-rose-400" />
                  <p className="text-sm text-white font-bold">Camera access denied</p>
                  <p className="text-xs text-neutral-400">
                    Scanning a QR tag needs camera permission. Enable it for this site in your browser settings and try again.
                  </p>
                </div>
              )}

              {scannerStatus === 'unsupported' && (
                <div className="flex flex-col items-center gap-3 text-center p-6">
                  <CameraOff className="w-10 h-10 text-rose-400" />
                  <p className="text-sm text-white font-bold">Camera not available</p>
                  <p className="text-xs text-neutral-400">
                    This browser or device doesn&apos;t support camera access, so QR scanning isn&apos;t possible here.
                  </p>
                </div>
              )}

              {scannerStatus === 'error' && (
                <div className="flex flex-col items-center gap-3 text-center p-6">
                  <CameraOff className="w-10 h-10 text-rose-400" />
                  <p className="text-sm text-white font-bold">Something went wrong</p>
                  <p className="text-xs text-neutral-400">Close this and try scanning again.</p>
                </div>
              )}
            </div>

            {scannerStatus === 'scanning' && (
              <p className="text-xs text-neutral-400 font-mono text-center">
                Point the camera at a Scan Connect QR tag...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
};
