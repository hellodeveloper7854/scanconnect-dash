import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
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
  X,
  QrCode,
  CheckCircle,
  Scan,
  PhoneCall,
  MessageCircle,
  Sparkles,
  Check,
  ShieldAlert,
  ShieldCheck,
  Phone,
  Users,
  Clock,
  MapPinned,
  Globe2,
  ArrowRight,
  Plane,
  GraduationCap,
  Fuel,
  Shield,
  HeartPulse,
  Wrench,
  FileWarning,
  Car,
  IdCard,
  Zap,
  Ambulance,
  Flame
} from 'lucide-react';
import { BLOG_POSTS } from '../lib/blogPosts';
import { useRevealOnScroll } from '../lib/useRevealOnScroll';
import banner from '../assets/images/howitworksbanner.png'
import logoImg from '../assets/images/logo.png'
import sosEmergencyImg from '../assets/images/sosemmergencyimg.png'
import videoWalkImg from '../assets/images/howitworks/videowalkimg.png'
import tutorialVideoPreviewImg from '../assets/images/howitworks/tutorialvideopreview.png'
import appStoreImg from '../assets/images/howitworks/appstore.png'
import playStoreImg from '../assets/images/howitworks/playstore.png'

interface VehicleDashboardProps {
  userData: UserFormData;
  onLogout: () => void;
  onNavigate?: (nav: string) => void;
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

/** Growing progress bar that only animates once scrolled into view, used behind the How It Works timeline icons. */
const RevealTimelineBar: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { ref, isVisible } = useRevealOnScroll<HTMLDivElement>();
  return (
    <div ref={ref} className={className}>
      <div className={`h-full bg-gradient-to-r from-[#F2BA03] to-[#e0ac00] ${isVisible ? 'animate-timeline-grow' : 'scale-x-0 origin-left'}`} />
    </div>
  );
};

export const VehicleDashboard: React.FC<VehicleDashboardProps> = ({ userData, onLogout, onNavigate, isLoggedIn }) => {
  const [activeNav, setActiveNav] = useState('How it works');
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [scannedTagId, setScannedTagId] = useState('');
  const [isScanSuccess, setIsScanSuccess] = useState(false);
  const [servicesPerView, setServicesPerView] = useState(4);
  const [servicesPage, setServicesPage] = useState(0);

  // Cards-per-view tracks the same breakpoints as the services grid
  // (1 col on mobile, 2 on sm, 4 on lg) so the carousel paging matches what's visible.
  React.useEffect(() => {
    const computePerView = () => {
      if (window.innerWidth >= 1024) return 4;
      if (window.innerWidth >= 640) return 2;
      return 1;
    };
    const onResize = () => setServicesPerView(computePerView());
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Why Choose Scan Connect — situations list
  const whyChooseScenarios = [
    'Someone blocking your vehicle',
    'Headlights left ON',
    'Windows left open',
    'A parking emergency',
    'An accident or damage',
    'A security concern',
  ];

  // How It Works — 3 Steps
  const howItWorksSteps = [
    {
      num: '01',
      icon: QrCode,
      title: 'Activate Your Tag',
      desc: 'Attach the premium waterproof QR tag to your car or bike and activate it once by linking your mobile number securely.',
    },
    {
      num: '02',
      icon: Scan,
      title: 'Anyone Scans & Connects',
      desc: 'Using any smartphone camera—no app, no registration—they simply scan and choose to Call, SMS, or WhatsApp you instantly.',
    },
    {
      num: '03',
      icon: ShieldCheck,
      title: 'Your Privacy Stays Protected, Anywhere',
      desc: 'Neither party ever sees the other’s number. Stay reachable at airports, malls, offices, or the roadside—anywhere in India.',
    },
  ];

  // SOS Emergency Assistance highlights
  const sosHighlights = [
    { icon: PhoneCall, label: 'One-Tap Emergency Calling' },
    { icon: Users, label: 'Notify Family & Friends' },
    { icon: Clock, label: 'Available 24×7' },
    { icon: ShieldAlert, label: 'Designed for Roadside Emergencies' },
    { icon: Globe2, label: 'Works Across India' },
  ];

  // Second SOS block — Emergency Help When Every Second Counts. "Emergency Family
  // Contact" leads the list and is flagged `differentiator: true` since it's unique
  // to Scan Connect, unlike the generic services (ambulance, police, etc.) that follow.
  const emergencyQuickAccess = [
    { label: 'Emergency Family Contact', icon: Users, differentiator: true },
    { label: 'Ambulance', icon: Ambulance, differentiator: false },
    { label: 'Police', icon: Shield, differentiator: false },
    { label: 'Fire Department', icon: Flame, differentiator: false },
    { label: 'Hospitals', icon: HeartPulse, differentiator: false },
    { label: 'Roadside Assistance', icon: Wrench, differentiator: false },
  ];

  // Why Thousands Choose — benefits checklist. `core: true` marks the strongest
  // differentiators, which get an emphasized visual treatment in the grid.
  const thousandsChooseBenefits = [
    { label: 'Privacy-Protected Communication', core: true },
    { label: 'Premium Waterproof QR Tag', core: false },
    { label: 'No Monthly Subscription', core: true },
    { label: 'Lifetime QR Activation', core: true },
    { label: 'No App Required for Visitors', core: false },
    { label: 'Instant Call', core: false },
    { label: 'Secure Contact Routing', core: true },
    { label: 'Fast Delivery Across India', core: false },
    { label: 'Easy Self Activation', core: false },
    { label: 'Works 24×7', core: false },
  ];

  // Smart Vehicle Services
  const vehicleServices = [
    { id: 'fuel', title: 'Nearby Fuel Stations', icon: Fuel, detail: 'Find nearest petrol, diesel & EV charging pumps near your vehicle location.' },
    { id: 'police', title: 'Police Assistance', icon: Shield, detail: 'Instant contact numbers & directions for nearest traffic and city police stations.' },
    { id: 'hospital', title: 'Hospitals & Emergency Care', icon: HeartPulse, detail: 'Emergency trauma centers & ambulance contacts available 24/7.' },
    { id: 'puncture', title: 'Tyre & Puncture Repair', icon: Wrench, detail: '24x7 roadside tyre repair, puncture fix & battery jumpstart services.' },
    { id: 'fastag', title: 'FASTag Recharge', icon: Zap, detail: 'Instant FASTag balance check & toll recharge via UPI/Netbanking.' },
    { id: 'challan', title: 'Traffic Challan Check', icon: FileWarning, detail: 'Check pending traffic fines & pay challans online instantly by VIN.' },
    { id: 'vehicle', title: 'Vehicle Information', icon: Car, detail: 'Verify RTO RC status, insurance expiry & vehicle ownership details.' },
    { id: 'licence', title: 'Driving Licence Verification', icon: IdCard, detail: 'Check DL validity, endorsement records & renewal timelines.' },
  ];

  // Industries We Serve — 6 industries with benefits sub-lists
  const industries = [
    {
      id: 'municipal',
      icon: Building2,
      title: 'Municipal Corporations',
      desc: 'Digitize urban parking with intelligent vehicle identification, real-time communication, and efficient parking management designed for high-density cities.',
      benefits: ['Smart Parking Management', 'Digital Vehicle Communication', 'Reduced Traffic Congestion', 'Better Citizen Experience'],
    },
    {
      id: 'retail',
      icon: ShoppingBag,
      title: 'Shopping Centres & Retail',
      desc: 'Improve customer satisfaction with seamless parking communication while gaining valuable operational insights to enhance retail experiences.',
      benefits: ['Better Customer Convenience', 'Improved Parking Flow', 'Increased Visitor Satisfaction', 'Enhanced Merchant Experience'],
    },
    {
      id: 'airports',
      icon: Plane,
      title: 'Airports',
      desc: 'Transform airport parking through digital vehicle communication, faster customer assistance, and intelligent parking operations.',
      benefits: ['Efficient Parking Management', 'Improved Traveler Experience', 'Real-Time Communication', 'Smart Digital Infrastructure'],
    },
    {
      id: 'supermarkets',
      icon: ShoppingCart,
      title: 'Supermarkets',
      desc: 'Offer shoppers a hassle-free parking experience with quick owner notifications and improved vehicle safety.',
      benefits: ['Faster Customer Assistance', 'Safer Parking Areas', 'Convenient Shopping Experience', 'Better Parking Utilization'],
    },
    {
      id: 'railways',
      icon: Train,
      title: 'Railway Stations',
      desc: 'Simplify commuter parking with secure vehicle identification, monthly pass integration, and seamless communication.',
      benefits: ['Daily Commuter Convenience', 'Digital Permit Management', 'Smart Parking Solutions', 'Efficient Operations'],
    },
    {
      id: 'universities',
      icon: GraduationCap,
      title: 'Universities & Educational Campuses',
      desc: 'Create safer campuses with intelligent vehicle management for students, faculty, and visitors.',
      benefits: ['Campus Parking Management', 'Student & Staff Convenience', 'Visitor Vehicle Communication', 'Data & Analytics Dashboard'],
    },
  ];

  // Customer Benefits
  const customerBenefits = [
    'Protect your personal phone number',
    'Avoid unnecessary spam calls',
    'Receive genuine parking-related alerts',
    'Easy installation in under one minute',
    'Weatherproof premium quality',
    'Works with any smartphone',
    'No battery required',
    'Lifetime usability',
    'Made for Indian roads and conditions',
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
          } else if (nav === 'My Orders' && onNavigate) {
            onNavigate('orders');
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

        {/* 1. HERO SECTION */}
        <section className="relative bg-[#1B1C1C] text-white flex items-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src={banner}
              alt="Scan Connect Vehicle Protection"
              className="w-full h-full object-cover object-[85%_15%]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1B1C1C] via-[#1B1C1C]/85 to-transparent" />
          </div>

          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-20 lg:py-24 relative z-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 max-w-xl space-y-5">
                <h1 className="font-['Rubik'] font-bold text-3xl sm:text-4xl lg:text-[46px] tracking-[-1px] leading-[1.15] text-white">
                  Protect Your Privacy. <br></br><span className="text-[#F2BA03]">Stay Reachable.</span>
                </h1>
                <p className="font-['Rubik'] font-semibold text-lg sm:text-xl text-white leading-[1.3]">
                  The Smart QR Tag for Every Vehicle.
                </p>

                <p className="font-['Rubik'] font-normal text-xs sm:text-sm text-[#D1D5DB] leading-[24px] max-w-md pt-1">
                  Whether it&apos;s a blocked driveway, headlights left on, or an emergency, anyone can contact you instantly&mdash;without ever seeing your phone number.
                </p>

                <p className="font-['Inter'] font-bold text-xs tracking-[1.5px] uppercase text-[#F2BA03]">
                  Privacy-First &bull; Instant Contact &bull; No App Required &bull; Lifetime Access
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => { window.location.href = '/shop#products'; }}
                    className="btn-shimmer h-[52px] px-8 bg-[#F2BA03] hover:bg-[#e0ac00] hover:shadow-[0_8px_24px_rgba(242,186,3,0.45)] hover:-translate-y-0.5 text-[#1B1C1C] font-bold text-sm sm:text-base uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>Buy Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                    className="h-[52px] px-8 bg-transparent border border-white/60 hover:bg-white/10 text-white font-bold text-sm sm:text-base uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center active:scale-95"
                  >
                    How It Works
                  </button>
                </div>
              </div>

              {/* Floating QR card — fills the empty right side, draws the eye
                  to the product, and scanning it takes shoppers straight to
                  the shop's products section. */}
              <div className="hidden lg:flex lg:col-span-5 justify-end">
                <div className="animate-gentle-float bg-white rounded-2xl p-5 shadow-2xl border border-white/20 w-56 xl:w-64 flex flex-col items-center gap-3">
                  <img src={logoImg} alt="Scan Connect" className="h-6 w-auto object-contain" />
                  <QRCodeSVG
                    value={`${window.location.origin}/shop#products`}
                    size={168}
                    level="M"
                    marginSize={0}
                    fgColor="#1B1C1C"
                    bgColor="#FFFFFF"
                    title="Scan to shop Scan Connect QR tags"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>


        {/* 2. WHY CHOOSE SCAN CONNECT SECTION */}
        <section className="py-20 bg-[#FAFAFA] border-t border-neutral-100">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-5">
                <span className="font-['Inter'] font-bold text-xs tracking-[2px] uppercase text-[#F2BA03] block">
                  WHY CHOOSE SCAN CONNECT?
                </span>
                <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl sm:text-[40px] tracking-tight text-[#1B1C1C] leading-tight">
                  Privacy Meets Convenience
                </h2>
                <p className="font-['Hanken_Grotesk'] font-normal text-base sm:text-lg text-[#5F5E5E] leading-[28px]">
                  Traditional parking contact stickers expose your personal phone number to everyone. Scan Connect changes that.
                </p>
                <p className="font-['Hanken_Grotesk'] font-normal text-base sm:text-lg text-[#5F5E5E] leading-[28px]">
                  Your vehicle becomes instantly reachable while your identity stays protected through our secure communication platform.
                </p>
              </div>

              <button
                onClick={() => setIsVideoModalOpen(true)}
                className="relative rounded-2xl overflow-hidden shadow-lg border border-[#E5E7EB] group cursor-pointer block w-full"
              >
                <img
                  src={videoWalkImg}
                  alt="Scan Connect walkthrough: scan the QR code and instantly contact the vehicle owner"
                  className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-black/20 transition-colors">
                  <span className="relative flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20">
                    <span className="absolute inset-0 rounded-full bg-[#F2BA03] animate-ping opacity-75" />
                    <span className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#F2BA03] flex items-center justify-center shadow-xl">
                      <Play className="w-6 h-6 sm:w-7 sm:h-7 text-[#1B1C1C] fill-current ml-1" />
                    </span>
                  </span>
                </div>
              </button>
            </div>

            <div className="mt-16 sm:mt-20 bg-white border border-[#E5E7EB] rounded-2xl p-8 sm:p-10 shadow-xs">
              <p className="font-['Hanken_Grotesk'] font-bold text-base text-[#1B1C1C] mb-5">
                Whether it&apos;s:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                {whyChooseScenarios.map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#F2BA03]/15 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-[#F2BA03] stroke-[3]" />
                    </div>
                    <span className="font-['Hanken_Grotesk'] font-medium text-base text-[#1B1C1C]">{item}</span>
                  </div>
                ))}
              </div>
              <p className="font-['Hanken_Grotesk'] font-semibold text-sm text-[#5F5E5E] pt-5 mt-5 border-t border-neutral-100">
                People can reach you instantly without compromising your privacy.
              </p>
            </div>
          </div>
        </section>


        {/* 3. HOW IT WORKS SECTION */}
        <section id="how-it-works" className="py-20 bg-gradient-to-b from-[#FFFBF0] to-white">
          <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <RevealCard className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <span className="font-['Inter'] font-bold text-xs tracking-[2px] uppercase text-[#F2BA03] block">
                HOW IT WORKS
              </span>
              <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl sm:text-5xl tracking-tight text-[#1B1C1C] leading-tight">
                Simple. Secure. Instant.
              </h2>
            </RevealCard>

            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 max-w-5xl mx-auto items-stretch">
              {/* Connecting timeline — desktop only, grows left-to-right once scrolled into view */}
              <RevealTimelineBar className="hidden md:block absolute top-[42px] left-[16.66%] right-[16.66%] h-[3px] bg-neutral-200 rounded-full overflow-hidden" />

              {howItWorksSteps.map((step, idx) => {
                const StepIcon = step.icon;
                return (
                  <RevealCard
                    key={step.num}
                    delayMs={idx * 350}
                    className="relative flex flex-col items-center text-center group h-full"
                  >
                    {/* Icon + step number badge */}
                    <div className="relative z-10 w-[84px] h-[84px] rounded-full bg-gradient-to-br from-[#F2BA03] to-[#e0ac00] flex items-center justify-center shadow-[0_10px_30px_rgba(242,186,3,0.4)] mb-7 ring-8 ring-white group-hover:scale-105 transition-transform duration-300 shrink-0">
                      <StepIcon className="w-9 h-9 text-white stroke-[1.75]" />
                      <span className="absolute -top-2 -right-1.5 w-8 h-8 rounded-full bg-[#1B1C1C] text-white font-['Inter'] font-extrabold text-xs flex items-center justify-center shadow-lg ring-2 ring-white">
                        {step.num}
                      </span>
                    </div>

                    {/* Mobile-only connector below the icon, between stacked steps */}
                    {idx < howItWorksSteps.length - 1 && (
                      <div className="md:hidden absolute top-[84px] left-1/2 -translate-x-1/2 w-0.5 h-12 bg-gradient-to-b from-[#F2BA03]/50 to-[#F2BA03]/10" />
                    )}

                    {/* Card body — flex-1 + equal padding keeps every card the same height regardless of copy length */}
                    <div className="w-full flex-1 bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-7 shadow-[0_8px_30px_rgba(0,0,0,0.07)] flex flex-col justify-center gap-3 hover:shadow-[0_16px_40px_rgba(242,186,3,0.18)] hover:border-[#F2BA03]/50 hover:-translate-y-1.5 transition-all duration-300">
                      <h3 className="font-['Poppins'] font-bold text-lg sm:text-xl text-[#111827] leading-snug">
                        {step.title}
                      </h3>
                      <p className="font-['Inter'] font-normal text-sm text-[#374151] leading-[23px]">
                        {step.desc}
                      </p>
                    </div>
                  </RevealCard>
                );
              })}
            </div>
          </div>
        </section>


        {/* 4. CUSTOMER BENEFITS SECTION */}
        <section className="py-20 bg-[#FAFAFA] border-t border-neutral-100">
          <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <span className="font-['Inter'] font-bold text-xs tracking-[2px] uppercase text-[#F2BA03] block">
                CUSTOMER BENEFITS
              </span>
              <h2 className="font-['Rubik'] font-semibold text-3xl sm:text-[40px] text-[#1B1C1C] leading-tight">
                More Than Just a QR Sticker
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {customerBenefits.map((benefit) => (
                <div key={benefit} className="flex items-center gap-3 bg-white border border-[#E5E7EB] rounded-xl p-4 shadow-xs">
                  <Check className="w-4 h-4 text-[#F2BA03] stroke-[3] shrink-0" />
                  <span className="font-['Hanken_Grotesk'] font-medium text-sm sm:text-base text-[#1B1C1C]">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* 5. INDUSTRIES WE SERVE SECTION */}
        <section className="py-20 bg-[#FAFAFA] border-t border-neutral-100">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
              <span className="font-['Inter'] font-bold text-xs tracking-[2px] uppercase text-[#F2BA03] block">
                INDUSTRIES WE SERVE
              </span>
              <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl sm:text-5xl tracking-tight text-[#1B1C1C] leading-tight">
                Smart Mobility Solutions for Every Parking Ecosystem
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {industries.map((ind) => {
                const IconComp = ind.icon;
                return (
                  <div
                    key={ind.id}
                    className="bg-white border border-[#E5E7EB] rounded-2xl p-7 hover:shadow-lg transition-all flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-4">
                      <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center text-[#F2BA03]">
                        <IconComp className="w-6 h-6 stroke-[2.2]" />
                      </div>
                      <h3 className="font-['Plus_Jakarta_Sans'] font-semibold text-lg text-[#1B1C1C] leading-snug">
                        {ind.title}
                      </h3>
                      <p className="font-['Hanken_Grotesk'] font-normal text-sm text-[#6B7280] leading-[22px]">
                        {ind.desc}
                      </p>
                      <div className="pt-2 space-y-1.5">
                        <span className="text-[10px] font-bold tracking-widest text-[#9CA3AF] uppercase block">
                          Benefits
                        </span>
                        {ind.benefits.map((b) => (
                          <div key={b} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-[#F2BA03] stroke-[3] shrink-0" />
                            <span className="font-['Hanken_Grotesk'] text-[#1B1C1C] text-sm">{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>


        {/* 6. SMART VEHICLE SERVICES SECTION */}
        <section className="py-20 bg-white border-t border-neutral-100">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            {(() => {
              const totalPages = Math.max(1, Math.ceil(vehicleServices.length / servicesPerView));
              const currentPage = Math.min(servicesPage, totalPages - 1);
              const goToPage = (page: number) => setServicesPage(((page % totalPages) + totalPages) % totalPages);

              return (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-2">
                      <span className="font-['Inter'] font-bold text-xs tracking-[2px] uppercase text-[#F2BA03] block">
                        SMART VEHICLE SERVICES
                      </span>
                      <h2 className="font-['Rubik','Plus_Jakarta_Sans',sans-serif] font-bold text-3xl sm:text-[38px] text-[#1B1C1C]">
                        Everything Your Vehicle Needs in One Place
                      </h2>
                    </div>

                    <div className="hidden sm:flex items-center gap-3">
                      <div className="flex items-center gap-1.5" aria-label={`Page ${currentPage + 1} of ${totalPages}`}>
                        {Array.from({ length: totalPages }).map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => goToPage(idx)}
                            aria-label={`Go to page ${idx + 1}`}
                            className={`rounded-full transition-all cursor-pointer ${
                              idx === currentPage ? 'w-5 h-1.5 bg-[#F2BA03]' : 'w-1.5 h-1.5 bg-[#E5E7EB] hover:bg-[#F2BA03]/50'
                            }`}
                          />
                        ))}
                      </div>
                      <button
                        onClick={() => goToPage(currentPage - 1)}
                        aria-label="Previous services"
                        className="w-9 h-9 rounded-full border border-[#CCC7AA] flex items-center justify-center text-[#1B1C1C] hover:bg-neutral-200 cursor-pointer shadow-xs"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => goToPage(currentPage + 1)}
                        aria-label="Next services"
                        className="w-9 h-9 rounded-full border border-[#CCC7AA] flex items-center justify-center text-[#1B1C1C] hover:bg-neutral-200 cursor-pointer shadow-xs"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <p className="font-['Hanken_Grotesk'] font-normal text-base text-[#5F5E5E] max-w-2xl mb-12">
                    Access useful automotive services directly from the Scan Connect ecosystem.
                  </p>

                  {/* Sliding carousel track — width driven by number of pages, offset by currentPage */}
                  <div className="overflow-hidden">
                    <div
                      className="flex transition-transform duration-500 ease-out"
                      style={{ transform: `translateX(-${currentPage * 100}%)` }}
                    >
                      {Array.from({ length: totalPages }).map((_, pageIdx) => (
                        <div
                          key={pageIdx}
                          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch shrink-0 w-full"
                        >
                          {vehicleServices
                            .slice(pageIdx * servicesPerView, pageIdx * servicesPerView + servicesPerView)
                            .map((svc) => {
                              const SvcIcon = svc.icon;
                              return (
                                <button
                                  key={svc.id}
                                  onClick={() => setSelectedService(svc.id)}
                                  className="h-full bg-white border border-[#E5E7EB] rounded-2xl p-8 shadow-xs hover:shadow-md hover:border-[#F2BA03] transition-all flex flex-col items-center text-center group cursor-pointer"
                                >
                                  <div className="flex-1 flex items-center justify-center">
                                    <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center text-[#F2BA03] group-hover:scale-110 transition-transform">
                                      <SvcIcon className="w-6 h-6 stroke-[2.2]" />
                                    </div>
                                  </div>

                                  <h3 className="mt-5 min-h-[56px] flex items-center justify-center font-['Plus_Jakarta_Sans','Rubik',sans-serif] font-bold text-lg text-[#111827] leading-snug">
                                    {svc.title}
                                  </h3>
                                </button>
                              );
                            })}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mobile pagination dots — arrows are desktop-only, so mobile needs a visible page indicator too */}
                  <div className="sm:hidden flex items-center justify-center gap-1.5 mt-6">
                    {Array.from({ length: totalPages }).map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => goToPage(idx)}
                        aria-label={`Go to page ${idx + 1}`}
                        className={`rounded-full transition-all cursor-pointer ${
                          idx === currentPage ? 'w-5 h-1.5 bg-[#F2BA03]' : 'w-1.5 h-1.5 bg-[#E5E7EB]'
                        }`}
                      />
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </section>


        {/* 7. SOS EMERGENCY ASSISTANCE SECTION */}
        <section className="py-20 bg-[#1B1C1C] text-white relative overflow-hidden">
          <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[#F2BA03]/10 rounded-full blur-[120px] pointer-events-none -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-[28rem] h-[28rem] bg-red-500/10 rounded-full blur-[140px] pointer-events-none translate-x-1/3 translate-y-1/3" />

          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

              {/* Left column — copy + highlight cards */}
              <RevealCard className="space-y-8 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F2BA03]/15 border border-[#F2BA03]/40">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F2BA03] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F2BA03]" />
                  </span>
                  <span className="font-['Inter'] font-bold text-xs tracking-[2px] uppercase text-[#F2BA03]">
                    SOS EMERGENCY ASSISTANCE
                  </span>
                </div>

                <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl sm:text-5xl tracking-tight text-white leading-tight">
                  Help is Just <span className="text-[#F2BA03]">One Tap</span> Away
                </h2>

                <p className="font-['Hanken_Grotesk'] font-normal text-base sm:text-lg text-neutral-300 leading-[28px]">
                  In an emergency, every second matters. The SOS button in the Scan Connect app gives you instant access to critical emergency services and your trusted contacts&mdash;without wasting time searching for phone numbers.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                  {sosHighlights.map(({ icon: Icon, label }) => (
                    <div
                      key={label}
                      className="group bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col items-start gap-3 hover:border-[#F2BA03]/60 hover:bg-white/[0.08] hover:-translate-y-0.5 transition-all"
                    >
                      <div className="w-10 h-10 rounded-lg bg-[#F2BA03]/15 flex items-center justify-center group-hover:bg-[#F2BA03]/25 group-hover:scale-110 transition-all">
                        <Icon className="w-5 h-5 text-[#F2BA03]" />
                      </div>
                      <span className="font-['Hanken_Grotesk'] font-semibold text-sm text-white leading-snug">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Quick access pills — the actual services one tap away */}
                <div className="text-left">
                  <span className="font-['Inter'] font-bold text-xs uppercase tracking-[2px] text-neutral-400 block mb-3">
                    One tap connects you to
                  </span>
                  <div className="flex flex-wrap gap-2.5">
                    {emergencyQuickAccess.map((item) => {
                      const ItemIcon = item.icon;
                      return item.differentiator ? (
                        <span
                          key={item.label}
                          className="inline-flex items-center gap-2 pl-3.5 pr-2.5 py-2 bg-[#F2BA03] rounded-full text-sm font-bold text-[#1B1C1C] shadow-[0_6px_18px_rgba(242,186,3,0.35)]"
                        >
                          <ItemIcon className="w-4 h-4" />
                          {item.label}
                          <span className="px-1.5 py-0.5 rounded-full bg-[#1B1C1C] text-[#F2BA03] text-[9px] font-extrabold uppercase tracking-wide">
                            Only Here
                          </span>
                        </span>
                      ) : (
                        <span
                          key={item.label}
                          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white/5 border border-white/10 rounded-full text-sm font-semibold text-neutral-200 hover:border-[#F2BA03]/50 hover:bg-white/[0.08] transition-all"
                        >
                          <ItemIcon className="w-4 h-4 text-[#F2BA03]" />
                          {item.label}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </RevealCard>

              {/* Right column — SOS emergency image, framed to pop against the dark section */}
              <RevealCard delayMs={150} className="relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-[#F2BA03]/25 via-red-500/15 to-transparent rounded-[28px] blur-2xl pointer-events-none animate-sos-glow" />
                <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] group">
                  <img
                    src={sosEmergencyImg}
                    alt="Scan Connect SOS emergency assistance"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#1B1C1C]/80 via-[#1B1C1C]/5 to-transparent" />
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-3xl pointer-events-none" />

                  {/* Floating SOS badge */}
                  <div className="absolute top-5 right-5 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 shadow-lg shadow-red-900/40">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                    </span>
                    <span className="font-['Inter'] font-extrabold text-xs tracking-[1.5px] text-white uppercase">
                      Live SOS
                    </span>
                  </div>

                  {/* Bottom caption overlay */}
                  <div className="absolute bottom-0 inset-x-0 p-5 sm:p-6 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#F2BA03] flex items-center justify-center shrink-0">
                      <ShieldAlert className="w-4.5 h-4.5 text-[#1B1C1C]" />
                    </div>
                    <p className="font-['Hanken_Grotesk'] font-bold text-white text-sm sm:text-base">
                      24&times;7 Emergency Response, Anywhere in India
                    </p>
                  </div>
                </div>
              </RevealCard>
            </div>

            <RevealCard delayMs={250} className="mt-14 bg-gradient-to-r from-white/[0.06] to-white/[0.02] border border-white/10 rounded-2xl p-8 sm:p-10 text-center space-y-3 max-w-4xl mx-auto">
              <h3 className="font-['Plus_Jakarta_Sans'] font-bold text-xl sm:text-2xl text-white">
                Stay Safe Wherever You Go
              </h3>
              <p className="font-['Hanken_Grotesk'] font-normal text-base text-neutral-300 leading-[28px] max-w-2xl mx-auto">
                Whether you&apos;re driving through a busy city, travelling on highways, or parking in unfamiliar locations, the Scan Connect SOS feature ensures that help is always just a tap away.
              </p>
              <p className="font-['Hanken_Grotesk'] font-bold text-lg text-[#F2BA03] pt-2 inline-flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                Your Safety. Your Family&apos;s Peace of Mind. Always Connected.
              </p>
            </RevealCard>
          </div>
        </section>


        {/* 8. DOWNLOAD THE APP SECTION */}
        <section className="py-20 bg-white border-t border-neutral-100">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

              {/* Left Graphic Banner Poster */}
              <div className="lg:col-span-6 flex justify-center">
                <img
                  src={videoWalkImg}
                  alt="Scan Connect - Get Started"
                  className="w-full max-w-md "
                />
              </div>

              {/* Right Content */}
              <div className="lg:col-span-6 space-y-6">
                <span className="font-['Inter'] font-bold text-base tracking-[1px] text-[#9CA3AF] uppercase block">
                  DOWNLOAD THE APP
                </span>

                <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl sm:text-[40px] text-[#1A1A1A] tracking-tight leading-tight">
                  Manage Your Vehicle Anytime
                </h2>

                <p className="font-['Inter'] font-semibold text-base sm:text-lg text-[#6B7280] leading-[26px]">
                  Access your Scan Connect dashboard to manage multiple vehicles, update contact details, view scan history, receive instant notifications, access vehicle services, and manage SOS settings.
                </p>

                <p className="font-['Inter'] font-bold text-sm text-[#1B1C1C]">
                  Available for Android and iOS.
                </p>

                {/* App Store / Google Play Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => alert('Download ScanConnect for iOS on App Store')}
                    className="cursor-pointer transition-transform hover:scale-105"
                  >
                    <img src={appStoreImg} alt="Download on the App Store" className="h-11 sm:h-12" />
                  </button>

                  <button
                    onClick={() => alert('Download ScanConnect for Android on Google Play')}
                    className="cursor-pointer transition-transform hover:scale-105"
                  >
                    <img src={playStoreImg} alt="Get it on Google Play" className="h-11 sm:h-12" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </section>


        {/* 9. SOCIAL PROOF — GUIDES & ARTICLES SECTION */}
        <section className="py-16 sm:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="flex items-center justify-between">
              <h2 className="font-['Plus_Jakarta_Sans'] font-black text-3xl sm:text-4xl text-neutral-900 tracking-tight">
                Guides & articles
              </h2>
              <a
                href="/blog"
                className="hidden sm:inline-flex items-center gap-1.5 text-sm font-bold text-neutral-900 underline decoration-amber-400 decoration-2 underline-offset-4"
              >
                View more
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {BLOG_POSTS.slice(0, 3).map((post) => (
                <a
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group bg-white rounded-2xl border border-neutral-200/60 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="h-[180px] bg-neutral-100 flex items-center justify-center text-neutral-400 text-xs font-semibold px-4 text-center">
                    {post.title}
                  </div>
                  <div className="p-6 space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wide text-neutral-400">{post.date}</p>
                    <h3 className="text-xl font-black text-neutral-900 leading-snug group-hover:text-[#F2BA03] transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-neutral-500 line-clamp-2">{post.excerpt}</p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-neutral-900 underline decoration-amber-400 decoration-2 underline-offset-4">
                      Read article
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </a>
              ))}
            </div>

            <a
              href="/blog"
              className="sm:hidden inline-flex items-center gap-1.5 text-sm font-bold text-neutral-900 underline decoration-amber-400 decoration-2 underline-offset-4"
            >
              View more
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>


        {/* 10. ABOUT COMPANY SECTION */}
        <section className="py-20 bg-[#1B1C1C] text-white">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center space-y-5">
            <span className="font-['Inter'] font-bold text-xs tracking-[2px] uppercase text-[#F2BA03] block">
              ABOUT COMPANY
            </span>
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl sm:text-[40px] tracking-tight text-white leading-tight">
              Made in India. Built for Smarter Mobility.
            </h2>
            <p className="font-['Hanken_Grotesk'] font-normal text-base sm:text-lg text-neutral-300 leading-[28px]">
              Scan Connect is developed by Creative Frame Works Pvt. Ltd. with one mission: to make vehicle communication secure, simple, and privacy-first.
            </p>
            <p className="font-['Hanken_Grotesk'] font-normal text-base sm:text-lg text-neutral-300 leading-[28px]">
              We&apos;re committed to helping millions of vehicle owners stay connected without compromising personal information.
            </p>
          </div>
        </section>


        {/* 11. LEFTOVER: WHY THOUSANDS CHOOSE SCAN CONNECT SECTION */}
        {/* <section className="py-20 bg-[#FAFAFA]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
              <span className="font-['Inter'] font-bold text-xs tracking-[2px] uppercase text-[#F2BA03] block">
                WHY THOUSANDS CHOOSE SCAN CONNECT
              </span>
              <h2 className="font-['Rubik'] font-bold text-3xl sm:text-[40px] text-[#1B1C1C] leading-tight">
                One Purchase. Lifetime Peace of Mind.
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-6xl mx-auto items-stretch">
              {thousandsChooseBenefits.map((benefit) => (
                <div
                  key={benefit.label}
                  className={`h-full rounded-xl p-5 flex items-center gap-3 transition-all ${
                    benefit.core
                      ? 'bg-white border-2 border-[#F2BA03] shadow-[0_6px_20px_rgba(242,186,3,0.18)]'
                      : 'bg-white border border-[#E5E7EB] shadow-xs'
                  }`}
                >
                  <div
                    className={`rounded-full flex items-center justify-center shrink-0 ${
                      benefit.core ? 'w-7 h-7 bg-[#F2BA03]' : 'w-4 h-4'
                    }`}
                  >
                    <Check
                      className={benefit.core ? 'w-4 h-4 text-white stroke-[3]' : 'w-4 h-4 text-[#F2BA03] stroke-[3]'}
                    />
                  </div>
                  <span
                    className={`font-['Hanken_Grotesk'] leading-snug ${
                      benefit.core ? 'font-bold text-base text-[#1B1C1C]' : 'font-medium text-sm text-[#4B5563]'
                    }`}
                  >
                    {benefit.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section> */}


        {/* 12. LEFTOVER: VIDEO SECTION */}
        <section className="py-20 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
              <span className="font-['Inter'] font-bold text-xs tracking-[2px] uppercase text-[#F2BA03] block">
                VIDEO SECTION
              </span>
              <h2 className="font-['Rubik','Plus_Jakarta_Sans',sans-serif] font-bold text-3xl sm:text-5xl text-[#1B1C1C] tracking-tight">
                See Scan Connect in Action
              </h2>
              <p className="font-['Hanken_Grotesk'] font-normal text-base text-[#5F5E5E] leading-[26px] max-w-2xl mx-auto">
                Watch our quick 90-second walkthrough and discover how Scan Connect helps people reach you without revealing your phone number.
              </p>
            </div>

            {/* Video Player Box */}
            <button
              onClick={() => setIsVideoModalOpen(true)}
              className="max-w-4xl mx-auto relative rounded-3xl overflow-hidden border border-neutral-200 shadow-2xl group bg-white block w-full cursor-pointer"
            >
              <img
                src={tutorialVideoPreviewImg}
                alt="Tutorial Video Preview"
                className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            </button>
          </div>
        </section>


        {/* 13. LEFTOVER: ABOUT SCAN CONNECT SECTION */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center space-y-6">
            <span className="font-['Inter'] font-bold text-xs tracking-[2px] uppercase text-[#F2BA03] block">
              ABOUT SCAN CONNECT
            </span>
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl sm:text-[42px] tracking-tight text-[#1B1C1C] leading-tight">
              The Smarter Way to Connect with Your Parked Vehicle
            </h2>
            <p className="font-['Hanken_Grotesk'] font-normal text-base sm:text-lg text-[#5F5E5E] leading-[28px]">
              Your vehicle is often left unattended&mdash;in parking lots, offices, shopping malls, railway stations, hospitals, or on the roadside. Unexpected situations can happen anytime.
            </p>
            <p className="font-['Hanken_Grotesk'] font-normal text-base sm:text-lg text-[#5F5E5E] leading-[28px]">
              With Scan Connect, anyone can safely reach you by simply scanning the QR code attached to your vehicle. Your phone number always remains private while you receive instant calls, SMS, or WhatsApp notifications.
            </p>
            <p className="font-['Hanken_Grotesk'] font-bold text-lg sm:text-xl text-[#1B1C1C] leading-[30px] pt-2">
              No complicated setup. No app required for the person scanning.
              <br />
              Just smart, secure communication whenever it matters.
            </p>
          </div>
        </section>


        {/* 14. CTA SECTION */}
        <section className="py-20 bg-white border-t border-neutral-100">
          <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 text-center space-y-6">
            <h2 className="font-['Plus_Jakarta_Sans'] font-extrabold text-3xl sm:text-5xl tracking-tight text-[#1B1C1C] leading-tight">
              Ready to Protect Your Privacy?
            </h2>
            <p className="font-['Hanken_Grotesk'] font-medium text-base sm:text-lg text-[#5F5E5E] leading-[28px] max-w-2xl mx-auto">
              Join thousands of vehicle owners who trust Scan Connect every day. Secure your vehicle with a smart QR contact tag today.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <button
                onClick={() => { window.location.href = '/shop#products'; }}
                className="btn-shimmer h-[56px] px-9 bg-[#F2BA03] hover:bg-[#e0ac00] hover:shadow-[0_8px_24px_rgba(242,186,3,0.45)] hover:-translate-y-0.5 text-[#1B1C1C] font-bold text-base uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Buy Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-shimmer h-[56px] px-9 bg-[#1B1C1C] hover:bg-neutral-800 hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 border border-[#1B1C1C] text-white font-bold text-base uppercase tracking-wider rounded-lg transition-all cursor-pointer flex items-center justify-center active:scale-95"
              >
                Learn More
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
              const SvcIcon = svc.icon;
              return (
                <>
                  <div className="w-14 h-14 rounded-full bg-neutral-100 flex items-center justify-center text-[#F2BA03]">
                    <SvcIcon className="w-6 h-6 stroke-[2.2]" />
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
                Scan Connect Video Walkthrough
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
                [ Walkthrough Video Playing: Activate your QR tag, receive secure calls, protect your privacy, and handle parking emergencies ]
              </p>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#F2BA03] h-full w-2/3 animate-pulse" />
              </div>
            </div>

            <p className="text-xs text-neutral-400 text-center">
              Scan Connect QR tags require zero application install for scanning drivers.
            </p>
          </div>
        </div>
      )}

      {/* Separate Footer Component */}
      <DashboardFooter />
    </div>
  );
};
