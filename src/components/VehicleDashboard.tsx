import React, { useState } from 'react';
import { UserFormData } from '../types';
import { DashboardHeader } from './DashboardHeader';
import { DashboardFooter } from './DashboardFooter';
import {
  Building2,
  ShoppingBag,
  ShoppingCart,
  Train,
  Play,
  ChevronLeft,
  ChevronRight,
  Fuel,
  Shield,
  Hospital,
  Wrench,
  Zap,
  FileText,
  Car,
  CreditCard,
  X,
  QrCode,
  Smartphone,
  CheckCircle,
  Scan,
  PhoneCall,
  MessageCircle,
  Sparkles
} from 'lucide-react';

// Custom Yellow Line Art Icons for Vehicle Services matching Image 2
const FuelStationIcon = () => (
  <svg className="w-12 h-12 text-[#F2BA03]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 22V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v17" />
    <path d="M13 11h2a2 2 0 0 1 2 2v4a2 2 0 0 0 2 2h0a2 2 0 0 0 2-2V9l-3-3" />
    <path d="M7 10h2" />
    <circle cx="8" cy="6" r="1" fill="currentColor" />
  </svg>
);

const PoliceStationIcon = () => (
  <svg className="w-12 h-12 text-[#F2BA03]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18" />
    <path d="M5 21V10l7-5 7 5v11" />
    <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
    <path d="M12 7.5l1 2h2l-1.5 1.5.5 2-2-1.2-2 1.2.5-2L9 9.5h2z" fill="currentColor" />
  </svg>
);

const HospitalCareIcon = () => (
  <svg className="w-12 h-12 text-[#F2BA03]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 21h18" />
    <path d="M5 21V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14" />
    <path d="M10 12h4" />
    <path d="M12 10v4" />
    <path d="M9 21v-3h6v3" />
  </svg>
);

const PunctureShopIcon = () => (
  <svg className="w-12 h-12 text-[#F2BA03]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" />
  </svg>
);

const FastagIcon = () => (
  <svg className="w-14 h-12 text-[#F2BA03]" viewBox="0 0 32 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 4a6 6 0 0 1 6 6" />
    <path d="M20 8a3 3 0 0 1 3 3" />
    <text x="1" y="20" fontSize="18" fontWeight="900" fill="currentColor" fontFamily="sans-serif">FT</text>
  </svg>
);

const TrafficChallanIcon = () => (
  <svg className="w-12 h-12 text-[#F2BA03]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
    <path d="M18 12v9" />
    <path d="M15 15h6" />
    <path d="M3 17h8l1-3H5l-1 3z" />
    <path d="M4 17v3h2v-3M9 17v3h2v-3" />
    <circle cx="5" cy="19" r="1" fill="currentColor" />
    <circle cx="10" cy="19" r="1" fill="currentColor" />
  </svg>
);

const VehicleDetailsIcon = () => (
  <svg className="w-12 h-12 text-[#F2BA03]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14l-1.5-4.5a2 2 0 0 0-1.9-1.5H8.4a2 2 0 0 0-1.9 1.5L5 12z" />
    <rect x="3" y="12" width="18" height="6" rx="2" />
    <circle cx="7" cy="15" r="1" fill="currentColor" />
    <circle cx="17" cy="15" r="1" fill="currentColor" />
    <path d="M12 2a4 4 0 0 1 4 4c0 3-4 6-4 6s-4-3-4-6a4 4 0 0 1 4-4z" />
  </svg>
);

const LicenceDetailsIcon = () => (
  <svg className="w-12 h-12 text-[#F2BA03]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="3" />
    <rect x="5" y="8" width="6" height="7" rx="1" />
    <path d="M14 8h5M14 12h5M14 16h3" />
  </svg>
);

interface VehicleDashboardProps {
  userData: UserFormData;
  onLogout: () => void;
  onNavigate?: (nav: string) => void;
  isLoggedIn?: boolean;
}

export const VehicleDashboard: React.FC<VehicleDashboardProps> = ({ userData, onLogout, onNavigate, isLoggedIn }) => {
  const [activeNav, setActiveNav] = useState('How it works');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [scannedTagId, setScannedTagId] = useState('');
  const [isScanSuccess, setIsScanSuccess] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Features of Ecosystem Data
  const ecosystemFeatures = [
    {
      id: 'councils',
      icon: Building2,
      title: 'Councils &\nMunicipalities',
      desc: 'Smart parking management for faster, easier, and denser urban parking. Our models are specifically designed to meet the high-density demands of city centers.',
    },
    {
      id: 'retail',
      icon: ShoppingBag,
      title: 'Shopping Centre\n& Retail',
      desc: 'Enhancing the shopping experience with convenient parking and data-driven footfall insights to maximize merchant revenue and customer loyalty.',
    },
    {
      id: 'supermarkets',
      icon: ShoppingCart,
      title: 'Supermarkets',
      desc: 'Providing a relaxing shopping experience with monitored security cameras for customer safety and seamless quick-stop parking solutions.',
    },
    {
      id: 'railways',
      icon: Train,
      title: 'Railway Stations',
      desc: 'Simplifying parking for daily commuters with integrated hardware sensors and full support for monthly or seasonal parking permits.',
    },
  ];

  // Benefits Features Steps
  const benefitSteps = [
    {
      num: '01',
      title: 'Stick the tag on your vehicle',
      desc: 'Peel and place the waterproof tag on your windshield or bike. Activate it once by scanning and linking your number — it stays hidden from here on.',
    },
    {
      num: '02',
      title: 'Someone scans the QR',
      desc: 'Blocked your driveway? Lights left on? Anyone points their phone camera at the tag — no app, no sign-up. A simple page opens in their browser.',
    },
    {
      num: '03',
      title: 'They call or message you',
      desc: 'They tap to call, SMS or WhatsApp. Everything is routed through a private SCAN ME number, so neither side ever sees the other’s digits.',
    },
    {
      num: '04',
      title: 'You stay completely private',
      desc: 'You handle it on your terms and your number is never exposed. Reachable when it matters, private the rest of the time.',
    },
    {
      num: '05',
      title: 'Stick it once. Stay reachable forever.',
      desc: 'Peel, place on your windshield or rear glass, and activate in under a minute. Waterproof and built for Indian weather.',
    },
  ];

  // Vehicle Services with Custom SVG Icons
  const vehicleServices = [
    { id: 'fuel', title: 'Fuel Station', renderIcon: FuelStationIcon, detail: 'Find nearest petrol, diesel & EV charging pumps near your vehicle location.' },
    { id: 'police', title: 'Police Station', renderIcon: PoliceStationIcon, detail: 'Instant contact numbers & directions for nearest traffic and city police stations.' },
    { id: 'hospital', title: 'Hospital Care', renderIcon: HospitalCareIcon, detail: 'Emergency trauma centers & ambulance contacts available 24/7.' },
    { id: 'puncture', title: 'Puncture Shop', renderIcon: PunctureShopIcon, detail: '24x7 roadside tyre repair, puncture fix & battery jumpstart services.' },
    { id: 'fastag', title: 'Recharge FASTag', renderIcon: FastagIcon, detail: 'Instant FASTag balance check & toll recharge via UPI/Netbanking.' },
    { id: 'challan', title: 'Traffic Challan', renderIcon: TrafficChallanIcon, detail: 'Check pending traffic fines & pay challans online instantly by VIN.' },
    { id: 'vehicle', title: 'Vehicle Details', renderIcon: VehicleDetailsIcon, detail: 'Verify RTO RC status, insurance expiry & vehicle ownership details.' },
    { id: 'licence', title: 'Licence Details', renderIcon: LicenceDetailsIcon, detail: 'Check DL validity, endorsement records & renewal timelines.' },
  ];

  const handleSimulateScan = () => {
    setIsScanSuccess(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 font-sans antialiased">
      {/* Separate Header Component */}
      <DashboardHeader
        userData={userData}
        onLogout={onLogout}
        activeNav={activeNav}
        isLoggedIn={isLoggedIn}
        onNavClick={(nav) => {
          setActiveNav(nav);
          if ((nav === 'About' || nav === 'about') && onNavigate) {
            onNavigate('about');
          } else if ((nav === 'Shop' || nav === 'shop') && onNavigate) {
            onNavigate('shop');
          } else if ((nav === 'Contact' || nav === 'contact') && onNavigate) {
            onNavigate('contact');
          } else if ((nav === 'Profile' || nav === 'profile') && onNavigate) {
            onNavigate('profile');
          } else if (nav === 'QR Scan') {
            if (onNavigate) {
              onNavigate('qr-scan');
            } else {
              setIsQrScannerOpen(true);
            }
          }
        }}
      />

      {/* MAIN DASHBOARD CONTENT */}
      <main className="flex-1">
        
        {/* 1. HOW IT WORKS HERO BANNER SECTION */}
        <section className="relative bg-[#1B1C1C] text-white min-h-[480px] lg:min-h-[553px] flex items-center overflow-hidden">
          {/* Background Image with Dark Vignette Gradient */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1920&q=80"
              alt="ScanConnect Vehicle Protection"
              className="w-full h-full object-cover object-center opacity-30 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1B1C1C]/95 via-[#1B1C1C]/80 to-transparent" />
          </div>

          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20 relative z-10 w-full">
            <div className="max-w-2xl space-y-6">
              <span className="font-['Inter'] font-bold text-sm tracking-[1px] uppercase text-[#9CA3AF] block">
                HOW IT WORKS
              </span>

              <h1 className="font-['Rubik'] font-bold text-4xl sm:text-5xl lg:text-[60px] tracking-[-1.2px] leading-none text-white">
                Someone scans. You stay private. It&apos;s that simple.
              </h1>

              <p className="font-['Rubik'] font-medium text-base sm:text-lg text-[#CCC7AA] leading-[28px] max-w-xl pt-1">
                No app to install for the person reaching you, and no number ever revealed for you. Here&apos;s exactly what happens.
              </p>
            </div>
          </div>
        </section>


        {/* 2. FEATURES OF ECOSYSTEM SECTION */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl sm:text-5xl lg:text-[64px] tracking-[-3.2px] text-[#1B1C1C] leading-none">
                Features Of <span className="text-[#F2BA03]">Ecosystem</span>
              </h2>
              <p className="font-['Hanken_Grotesk'] font-medium text-base sm:text-lg text-[#5F5E5E] leading-[29px]">
                Intelligent parking solutions tailored for every stakeholder. From urban municipalities to private retail giants, SCAN ME streamlines the digital physical transition.
              </p>
            </div>

            {/* 4 Ecosystem Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {ecosystemFeatures.map((feat) => {
                const IconComp = feat.icon;
                return (
                  <div
                    key={feat.id}
                    className="bg-white border border-[#CCC7AA] rounded-xl p-8 shadow-xs hover:shadow-md transition-shadow flex flex-col items-center text-center space-y-5 relative group"
                  >
                    {/* Icon Circle */}
                    <div className="w-16 h-16 rounded-full border border-[#F2BA03] bg-white flex items-center justify-center text-[#F2BA03] shadow-xs">
                      <IconComp className="w-7 h-7 stroke-[2]" />
                    </div>

                    {/* Title */}
                    <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-2xl text-[#1B1C1C] leading-[31px] whitespace-pre-line">
                      {feat.title}
                    </h3>

                    {/* Desc */}
                    <p className="font-['Hanken_Grotesk'] font-normal text-base text-[#5F5E5E] leading-[26px] max-w-sm">
                      {feat.desc}
                    </p>

                    {/* Learn More */}
                    <div className="pt-2">
                      <button
                        onClick={() => alert(`Detailed insights for ${feat.title.replace('\n', ' ')}`)}
                        className="font-['Hanken_Grotesk'] font-bold text-xs text-[#F2BA03] hover:text-[#d19d00] tracking-[1.2px] uppercase inline-flex items-center gap-2 cursor-pointer"
                      >
                        LEARN MORE <span className="text-sm">→</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </section>


        {/* 3. TUTORIAL VIDEO SECTION */}
        <section className="py-20 bg-[#111215] text-white relative overflow-hidden">
          {/* Subtle Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-[#F2BA03]/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
              <span className="font-['Inter'] font-bold text-xs sm:text-sm tracking-[2px] text-[#F2BA03] uppercase block">
                TUTORIAL VIDEO
              </span>
              <h2 className="font-['Rubik','Plus_Jakarta_Sans',sans-serif] font-bold text-3xl sm:text-5xl text-white tracking-tight">
                How Scan Connect Works in 60 Seconds
              </h2>
              <p className="font-['Inter'] font-normal text-base sm:text-lg text-neutral-400 max-w-2xl mx-auto">
                Watch how simple it is to activate your tag, stick it to your vehicle, and receive encrypted calls without revealing your number.
              </p>
            </div>

            {/* Video Player Box */}
            <div className="max-w-4xl mx-auto relative rounded-3xl overflow-hidden border border-neutral-800 shadow-2xl group bg-neutral-900 aspect-video flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1600&q=80"
                alt="Tutorial Video Preview"
                className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />

              {/* Play Button Trigger */}
              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="relative z-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#F2BA03] text-neutral-950 flex items-center justify-center shadow-xl group-hover:scale-110 active:scale-95 transition-all cursor-pointer ring-8 ring-[#F2BA03]/30"
              >
                <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current translate-x-1" />
              </button>

              {/* Video Info Overlay */}
              <div className="absolute bottom-6 left-6 right-6 z-10 flex flex-wrap items-center justify-between text-xs sm:text-sm font-medium text-neutral-300 gap-4">
                <div className="flex items-center gap-2 bg-neutral-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-neutral-700">
                  <Play className="w-4 h-4 text-[#F2BA03]" /> <span>Official Step-by-Step Tutorial</span>
                </div>
                <div className="bg-neutral-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-neutral-700 font-mono text-[#F2BA03]">
                  Duration: 1:45 min
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* 4. WHY SCAN CONNECT SECTION */}
        <section className="py-20 bg-white border-b border-neutral-100">
          <div className="max-w-5xl mx-auto px-6 sm:px-8 text-center space-y-8">
            <h2 className="font-['Rubik'] font-semibold text-3xl sm:text-[32px] text-[#1B1C1C] tracking-tight">
              Why Scan Connect
            </h2>

            <p className="font-['Comic_Relief','Comic_Sans_MS',cursive] font-normal text-xl sm:text-[26px] leading-[45px] text-[#8E9094] max-w-4xl mx-auto">
              &ldquo;You never know what may happen to the vehicle when you park it and walk away, you always encounter situations where you wished if things could have been different When the Unexpected occurs, thats when you would have thought if there was a way around&rdquo;.
            </p>
          </div>
        </section>


        {/* 5. BENEFITS FEATURES SECTION (FAFAFA BG) */}
        <section className="py-20 bg-[#FAFAFA]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <h2 className="font-['Rubik'] font-semibold text-3xl sm:text-[40px] text-[#FFC400] leading-tight">
                Benefits Features
              </h2>
              <p className="font-['Inter'] font-medium text-base sm:text-xl text-[#6B7280] leading-[32px]">
                One-time purchase, lifetime security. Professional privacy-first contact tags for your car and bike. Free express delivery on all orders.
              </p>
            </div>

            {/* 5 Step Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              {benefitSteps.map((step) => (
                <div
                  key={step.num}
                  className="bg-white border border-[#CCC7AA] rounded-[15px] p-7 shadow-[0_4px_20px_rgba(0,0,0,0.09)] flex flex-col justify-between space-y-4 hover:shadow-lg transition-all"
                >
                  <div className="space-y-4">
                    {/* Circle Badge Number */}
                    <div className="w-[60px] h-[60px] rounded-[12px] bg-[#F2BA03] text-white font-['Inter'] font-bold text-xl flex items-center justify-center shadow-xs">
                      {step.num}
                    </div>

                    <h3 className="font-['Poppins'] font-bold text-xl text-[#111827] leading-[28px]">
                      {step.title}
                    </h3>

                    <p className="font-['Inter'] font-normal text-sm text-[#6B7280] leading-[23px]">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>


        {/* 6. VEHICLE SERVICES SECTION */}
        <section className="py-20 bg-neutral-50/50 border-t border-neutral-100">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="flex items-center justify-between mb-12">
              <h2 className="font-['Rubik','Plus_Jakarta_Sans',sans-serif] font-bold text-3xl sm:text-[38px] text-[#1B1C1C]">
                Vehicle Services
              </h2>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => alert('Previous services batch')}
                  className="w-9 h-9 rounded-full border border-[#CCC7AA] flex items-center justify-center text-[#1B1C1C] hover:bg-neutral-200 cursor-pointer shadow-xs"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => alert('Next services batch')}
                  className="w-9 h-9 rounded-full border border-[#CCC7AA] flex items-center justify-center text-[#1B1C1C] hover:bg-neutral-200 cursor-pointer shadow-xs"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 8 Service Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {vehicleServices.map((svc) => {
                const IconComponent = svc.renderIcon;
                return (
                  <button
                    key={svc.id}
                    onClick={() => setSelectedService(svc.id)}
                    className="bg-white border border-[#E5E7EB] rounded-2xl p-8 sm:p-10 shadow-xs hover:shadow-md hover:border-[#F2BA03] transition-all flex flex-col items-center justify-center text-center space-y-4 group cursor-pointer"
                  >
                    <div className="group-hover:scale-110 transition-transform flex items-center justify-center h-16">
                      <IconComponent />
                    </div>

                    <h3 className="font-['Plus_Jakarta_Sans','Rubik',sans-serif] font-bold text-xl sm:text-2xl text-[#111827] leading-snug">
                      {svc.title}
                    </h3>
                  </button>
                );
              })}
            </div>
          </div>
        </section>


        {/* 7. VIDEO WALKTHROUGH & APP DOWNLOAD SECTION */}
        <section className="py-20 bg-white border-t border-neutral-100">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Graphic Banner Poster */}
              <div className="lg:col-span-6 flex justify-center">
                <div 
                  onClick={() => setIsVideoModalOpen(true)}
                  className="w-full max-w-md bg-[#1B1C1C] text-white rounded-3xl p-6 shadow-2xl relative overflow-hidden border border-neutral-800 cursor-pointer group"
                >
                  <div className="bg-[#F2BA03] p-6 rounded-2xl space-y-3 text-[#1B1C1C] mb-6">
                    <div className="flex items-center justify-between">
                      <span className="font-['Hanken_Grotesk'] font-black text-xl tracking-tight">SCAN CONNECT</span>
                      <span className="text-[10px] font-bold bg-[#1B1C1C] text-white px-2 py-0.5 rounded uppercase tracking-wider">CONNECTING SOLUTION</span>
                    </div>
                    <h3 className="font-['Plus_Jakarta_Sans'] font-black text-2xl uppercase leading-none">
                      SCAN CONNECT. <br />
                      <span className="text-white">GET STARTED!</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* QR Code */}
                    <div className="p-3 bg-neutral-900 rounded-2xl border border-neutral-800 flex flex-col items-center">
                      <div className="w-28 h-28 bg-[#1B1C1C] p-2 rounded-xl flex items-center justify-center">
                        <QrCode className="w-full h-full text-[#F2BA03]" />
                      </div>
                      <span className="text-[9px] font-bold uppercase mt-2 text-white/80 tracking-wider">
                        SCAN & DOWNLOAD
                      </span>
                    </div>

                    {/* Features list */}
                    <div className="flex-1 bg-neutral-900 text-white rounded-2xl p-4 space-y-2 border border-neutral-800">
                      <div className="w-8 h-1 bg-neutral-700 rounded-full mx-auto mb-2" />
                      <div className="p-2 bg-neutral-800/80 rounded-lg text-[10px] font-bold text-[#F2BA03] flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-[#F2BA03]" /> Masked Calls
                      </div>
                      <div className="p-2 bg-neutral-800/80 rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-[#F2BA03]" /> Instant Alerts
                      </div>
                      <div className="p-2 bg-neutral-800/80 rounded-lg text-[10px] font-bold text-white flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-[#F2BA03]" /> Emergency Contact
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Content */}
              <div className="lg:col-span-6 space-y-6">
                <span className="font-['Inter'] font-bold text-base tracking-[1px] text-[#9CA3AF] uppercase block">
                  VIDEO WALKTHROUGH
                </span>

                <h2 className="font-['Comic_Relief','Comic_Sans_MS',cursive] font-bold text-3xl sm:text-4xl lg:text-5xl text-[#1A1A1A] leading-[40px]">
                  See the full flow in under two minutes.
                </h2>

                <p className="font-['Inter'] font-semibold text-base sm:text-lg text-[#6B7280] leading-[26px]">
                  From sticking the tag to receiving a masked call — everything your parking problem needs, without sharing your number.
                </p>

                {/* App Store / Google Play Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button 
                    onClick={() => alert('Download ScanConnect for iOS on App Store')}
                    className="px-6 py-3.5 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-3 shadow-md transition-all cursor-pointer hover:scale-105"
                  >
                    <Smartphone className="w-5 h-5 text-[#F2BA03]" />
                    <div className="text-left">
                      <div className="text-[9px] font-normal text-neutral-400">Download on the</div>
                      <div className="text-sm font-bold">App Store</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => alert('Download ScanConnect for Android on Google Play')}
                    className="px-6 py-3.5 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-3 shadow-md transition-all cursor-pointer hover:scale-105"
                  >
                    <Play className="w-5 h-5 text-[#F2BA03] fill-[#F2BA03]" />
                    <div className="text-left">
                      <div className="text-[9px] font-normal text-neutral-400">GET IT ON</div>
                      <div className="text-sm font-bold">Google Play</div>
                    </div>
                  </button>
                </div>
              </div>

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
                <div className="w-8 h-8 rounded-lg bg-[#F2BA03] text-neutral-950 flex items-center justify-center">
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
                <div className="aspect-square bg-neutral-950 rounded-2xl relative flex flex-col items-center justify-center overflow-hidden border-2 border-dashed border-[#F2BA03]/50 p-6 text-center">
                  {/* Animated Corner Reticles */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-[#F2BA03]" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-[#F2BA03]" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-[#F2BA03]" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-[#F2BA03]" />

                  {/* Laser Scanning Line */}
                  <div className="absolute inset-x-0 h-1 bg-[#F2BA03] shadow-[0_0_15px_#F2BA03] animate-pulse top-1/3" />

                  <QrCode className="w-24 h-24 text-[#F2BA03]/80 mb-3 animate-pulse" />
                  <p className="text-xs text-neutral-300 font-mono">
                    Point camera at vehicle SCAN ME sticker tag...
                  </p>

                  <button
                    onClick={handleSimulateScan}
                    className="mt-4 px-5 py-2.5 bg-[#F2BA03] text-neutral-950 rounded-xl font-extrabold text-xs uppercase tracking-wider hover:bg-amber-400 cursor-pointer shadow-lg transition-transform active:scale-95 flex items-center gap-2"
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
                      className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-[#F2BA03]"
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

      {/* SERVICE DETAILS MODAL */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
          <div className="bg-white text-neutral-900 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative border border-neutral-200 space-y-4">
            <button
              onClick={() => setSelectedService(null)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-800 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {(() => {
              const svc = vehicleServices.find((s) => s.id === selectedService);
              if (!svc) return null;
              const IconComponent = svc.renderIcon;
              return (
                <>
                  <div className="flex items-center justify-center p-3 rounded-xl bg-amber-50/80 border border-[#F2BA03]/40 w-fit">
                    <IconComponent />
                  </div>
                  <h3 className="text-2xl font-black text-neutral-900 tracking-tight">
                    {svc.title}
                  </h3>
                  <p className="text-neutral-600 text-sm leading-relaxed">
                    {svc.detail}
                  </p>
                  
                  <div className="pt-4 border-t border-neutral-100 flex gap-3">
                    <button
                      onClick={() => {
                        alert(`Searching live location database for ${svc.title}...`);
                        setSelectedService(null);
                      }}
                      className="flex-1 py-3 bg-[#F2BA03] hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      SEARCH NEARBY
                    </button>
                    <button
                      onClick={() => setSelectedService(null)}
                      className="px-4 py-3 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer"
                    >
                      CLOSE
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* TUTORIAL VIDEO PLAYER MODAL */}
      {isVideoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-neutral-900 text-white rounded-2xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl relative border border-neutral-800 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <h3 className="text-lg font-bold text-[#F2BA03] flex items-center gap-2">
                <Play className="w-5 h-5 fill-current" />
                ScanConnect Video Walkthrough
              </h3>
              <button
                onClick={() => setIsVideoModalOpen(false)}
                className="p-1.5 text-neutral-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Video Player */}
            <div className="aspect-video bg-black rounded-xl relative flex flex-col items-center justify-center text-center p-8 space-y-4 border border-neutral-800 overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-[#F2BA03] text-neutral-950 flex items-center justify-center animate-pulse">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
              <p className="text-neutral-300 text-sm max-w-md font-mono">
                [ Walkthrough Video Playing: How ScanConnect Private QR Tag routes anonymous calls & emergency alerts ]
              </p>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#F2BA03] h-full w-2/3 animate-pulse" />
              </div>
            </div>

            <p className="text-xs text-neutral-400 text-center">
              ScanConnect QR tags require zero application install for scanning drivers.
            </p>
          </div>
        </div>
      )}

      {/* Separate Footer Component */}
      <DashboardFooter />
    </div>
  );
};


