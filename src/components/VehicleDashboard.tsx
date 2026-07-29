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
  Camera,
  MessageSquare,
  Lock,
  PhoneCall,
  MessageCircle,
  Scan,
  ShieldCheck,
  Send,
  Sparkles
} from 'lucide-react';

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
      title: 'Stay connected always',
      desc: 'Receive immediate alerts and emergency notifications directly to your phone wherever you park across India.',
    },
  ];

  // Vehicle Services
  const vehicleServices = [
    { id: 'fuel', title: 'Fuel Station', icon: Fuel, detail: 'Find nearest petrol, diesel & EV charging pumps near your vehicle location.' },
    { id: 'police', title: 'Police Station', icon: Shield, detail: 'Instant contact numbers & directions for nearest traffic and city police stations.' },
    { id: 'hospital', title: 'Hospital Care', icon: Hospital, detail: 'Emergency trauma centers & ambulance contacts available 24/7.' },
    { id: 'puncture', title: 'Puncture Shop', icon: Wrench, detail: '24x7 roadside tyre repair, puncture fix & battery jumpstart services.' },
    { id: 'fastag', title: 'Recharge FASTag', icon: Zap, detail: 'Instant FASTag balance check & toll recharge via UPI/Netbanking.' },
    { id: 'challan', title: 'Traffic Challan', icon: FileText, detail: 'Check pending traffic fines & pay challans online instantly by VIN.' },
    { id: 'vehicle', title: 'Vehicle Details', icon: Car, detail: 'Verify RTO RC status, insurance expiry & vehicle ownership details.' },
    { id: 'licence', title: 'Licence Details', icon: CreditCard, detail: 'Check DL validity, endorsement records & renewal timelines.' },
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
        
        {/* 1. HERO BANNER SECTION */}
        <section className="relative bg-neutral-900 text-white min-h-[480px] lg:min-h-[560px] flex items-center overflow-hidden">
          {/* Background Image with Dark Vignette Gradient */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1920&q=80"
              alt="ScanConnect Team & Vehicle"
              className="w-full h-full object-cover object-center opacity-40 mix-blend-luminosity"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-neutral-950/90 via-neutral-950/70 to-transparent" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 relative z-10 w-full">
            <div className="max-w-2xl space-y-4">
              <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-neutral-400 block font-mono">
                HOW IT WORKS
              </span>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] font-sans text-white">
                Someone{' '}
                <span className="text-[#f5b800] underline decoration-[#f5b800]/40 decoration-4 underline-offset-4">
                  scans.
                </span>{' '}
                <br />
                <span className="text-[#f5b800]">You stay</span> private.{' '}
                <br />
                It&apos;s that simple.
              </h1>

              <p className="text-neutral-300 text-base sm:text-lg max-w-lg font-normal leading-relaxed pt-2">
                No app to install for the person reaching you, and no number ever revealed for you. Here&apos;s exactly what happens.
              </p>
            </div>
          </div>
        </section>


        {/* 2. WHY SCAN CONNECT SECTION */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight font-sans">
              Why Scan Connect
            </h2>

            <p className="text-neutral-600 text-base sm:text-lg lg:text-xl font-medium leading-relaxed italic max-w-3xl mx-auto">
              &ldquo;You never know what may happen to the vehicle when you park it and walk away, you always encounter situations where you wished if things could have been different. When the Unexpected occurs, thats when you would have thought if there was a way around.&rdquo;
            </p>
          </div>
        </section>


        {/* 3. FEATURES OF ECOSYSTEM SECTION */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 font-sans">
                Features Of <span className="text-[#f5b800]">Ecosystem</span>
              </h2>
              <p className="text-neutral-600 text-sm sm:text-base leading-relaxed font-normal">
                Intelligent parking solutions tailored for every stakeholder. From urban municipalities to private retail giants, SCAN ME streamlines the digital physical transition.
              </p>
            </div>

            {/* 4 Feature Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {ecosystemFeatures.map((feat) => {
                const IconComp = feat.icon;
                return (
                  <div
                    key={feat.id}
                    className="bg-white border border-neutral-200/80 rounded-2xl p-8 sm:p-10 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center space-y-4 relative group"
                  >
                    {/* Circle Icon */}
                    <div className="w-16 h-16 rounded-full border border-[#f5b800]/80 flex items-center justify-center text-[#f5b800] mb-2 bg-amber-50/50">
                      <IconComp className="w-7 h-7 stroke-[2]" />
                    </div>

                    {/* Card Title */}
                    <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 leading-tight whitespace-pre-line">
                      {feat.title}
                    </h3>

                    {/* Card Body Text */}
                    <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed max-w-sm">
                      {feat.desc}
                    </p>

                    {/* Learn More Link */}
                    <div className="pt-2">
                      <button
                        onClick={() => alert(`Detailed insights for ${feat.title.replace('\n', ' ')}`)}
                        className="text-xs font-bold text-[#f5b800] hover:text-[#d19d00] tracking-wider uppercase inline-flex items-center gap-1 cursor-pointer"
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


        {/* 4. TUTORIAL VIDEO SECTION */}
        <section className="py-16 bg-neutral-50/60 border-y border-neutral-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl sm:text-4xl font-black text-neutral-900 tracking-tight mb-8 font-sans">
              Tutorial video
            </h2>

            {/* Interactive Video Banner Frame */}
            <div 
              onClick={() => setIsVideoModalOpen(true)}
              className="max-w-3xl mx-auto bg-neutral-900 rounded-2xl overflow-hidden shadow-2xl border border-neutral-200 cursor-pointer relative group aspect-video flex items-center justify-center"
            >
              {/* Thumbnail Background Comic Graphic */}
              <img
                src="https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1200&q=80"
                alt="Tutorial Video Thumbnail"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-80"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/30 flex flex-col items-center justify-between p-6 sm:p-10">
                {/* Header Banner badge inside video */}
                <div className="bg-[#f5b800] text-neutral-950 px-4 py-2 rounded-xl font-black text-sm sm:text-base tracking-wide uppercase shadow-lg border border-black/10 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
                  Contact Vehicle Owner with SCAN CONNECT
                </div>

                {/* Big Red Play Button */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-white ml-1" />
                </div>

                {/* Bottom text */}
                <span className="text-xs sm:text-sm font-semibold text-white/90 bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-md">
                  Click to watch 90-second video walkthrough
                </span>
              </div>
            </div>
          </div>
        </section>


        {/* 5. BENEFITS FEATURES SECTION */}
        <section className="py-20 bg-neutral-50/80 border-t border-neutral-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 font-sans">
                <span className="text-[#f5b800]">Benefits Features</span>
              </h2>
              <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
                One-time purchase, lifetime security. Professional privacy-first contact tags for your car and bike. Free express delivery on all orders.
              </p>
            </div>

            {/* Horizontal Step Cards Carousel / Grid */}
            <div className="relative">
              <div className="flex gap-6 overflow-x-auto pb-6 pt-2 snap-x snap-mandatory scrollbar-none px-2">
                {benefitSteps.map((step) => (
                  <div
                    key={step.num}
                    className="min-w-[280px] sm:min-w-[320px] max-w-[340px] flex-shrink-0 bg-white border border-neutral-200/80 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col justify-between space-y-4 snap-center relative"
                  >
                    <div>
                      {/* Step Pill Number */}
                      <div className="w-12 h-10 bg-[#f5b800] text-neutral-950 font-black text-base rounded-xl flex items-center justify-center mb-6 shadow-sm">
                        {step.num}
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-neutral-900 leading-snug mb-3">
                        {step.title}
                      </h3>

                      <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows for Steps */}
              <div className="flex justify-center items-center gap-3 mt-4">
                <button
                  onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
                  className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <span className="text-xs font-mono font-bold text-neutral-500">
                  {activeStepIndex + 1} / {benefitSteps.length}
                </span>
                <button
                  onClick={() => setActiveStepIndex((prev) => Math.min(benefitSteps.length - 1, prev + 1))}
                  className="w-10 h-10 rounded-full border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>


        {/* 6. VEHICLE SERVICES SECTION */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-neutral-900 font-sans">
                Vehicle Services
              </h2>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => alert('Previous services batch')}
                  className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => alert('Next services batch')}
                  className="w-9 h-9 rounded-full border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 8 Service Cards Grid (4x2 layout) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {vehicleServices.map((svc) => {
                const IconComp = svc.icon;
                return (
                  <button
                    key={svc.id}
                    onClick={() => setSelectedService(svc.id)}
                    className="bg-white border border-neutral-200/90 rounded-2xl p-6 sm:p-8 shadow-xs hover:shadow-md hover:border-[#f5b800] transition-all flex flex-col items-center justify-center text-center space-y-4 group cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-full border border-[#f5b800]/50 bg-amber-50/40 text-[#f5b800] flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconComp className="w-7 h-7 stroke-[1.8]" />
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-neutral-900 leading-snug">
                      {svc.title}
                    </h3>
                  </button>
                );
              })}
            </div>
          </div>
        </section>


        {/* 7. APP DOWNLOAD & VIDEO WALKTHROUGH BANNER SECTION */}
        <section className="py-20 bg-neutral-50/70 border-t border-neutral-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              
              {/* Left Graphic Banner Poster */}
              <div className="lg:col-span-6 flex justify-center">
                <div className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-6 shadow-xl relative overflow-hidden text-neutral-900">
                  <div className="bg-[#f5b800] p-6 rounded-2xl space-y-3 text-neutral-950 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="font-black text-xl tracking-tight">SCAN CONNECT</span>
                      <span className="text-[10px] font-bold bg-neutral-950 text-white px-2 py-0.5 rounded">CONNECTING SOLUTION</span>
                    </div>
                    <h3 className="text-2xl font-black uppercase leading-none">
                      SCAN CONNECT. <br />
                      <span className="text-white">GET STARTED!</span>
                    </h3>
                  </div>

                  <div className="flex items-center gap-6">
                    {/* QR Code */}
                    <div className="p-3 bg-neutral-100 rounded-2xl border border-neutral-200 flex flex-col items-center">
                      <div className="w-28 h-28 bg-neutral-950 p-2 rounded-xl flex items-center justify-center">
                        <QrCode className="w-full h-full text-[#f5b800]" />
                      </div>
                      <span className="text-[9px] font-black uppercase mt-2 text-neutral-800 tracking-wider">
                        SCAN & DOWNLOAD
                      </span>
                    </div>

                    {/* Smartphone Mockup */}
                    <div className="flex-1 bg-neutral-900 text-white rounded-2xl p-4 space-y-2 border border-neutral-800">
                      <div className="w-8 h-1 bg-neutral-700 rounded-full mx-auto mb-2" />
                      <div className="p-2 bg-neutral-800 rounded-lg text-[10px] font-bold text-[#f5b800] flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-[#f5b800]" /> Tyre Solutions
                      </div>
                      <div className="p-2 bg-neutral-800 rounded-lg text-[10px] font-bold text-white flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-[#f5b800]" /> Trusted Partners
                      </div>
                      <div className="p-2 bg-neutral-800 rounded-lg text-[10px] font-bold text-white flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-[#f5b800]" /> Smart Services
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Content */}
              <div className="lg:col-span-6 space-y-6">
                <span className="text-xs font-bold tracking-widest text-neutral-400 uppercase font-mono">
                  VIDEO WALKTHROUGH
                </span>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 tracking-tight font-sans leading-tight">
                  See the full flow in under two minutes.
                </h2>

                <p className="text-neutral-600 text-base sm:text-lg leading-relaxed">
                  From sticking the tag to receiving a masked call — everything your parking problem needs, without sharing your number.
                </p>

                {/* App Store / Google Play Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button 
                    onClick={() => alert('Download ScanConnect for iOS on App Store')}
                    className="px-6 py-3 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-3 shadow-md transition-colors cursor-pointer"
                  >
                    <Smartphone className="w-5 h-5 text-[#f5b800]" />
                    <div className="text-left">
                      <div className="text-[9px] font-normal text-neutral-400">Download on the</div>
                      <div className="text-sm font-bold">App Store</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => alert('Download ScanConnect for Android on Google Play')}
                    className="px-6 py-3 bg-black hover:bg-neutral-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider flex items-center gap-3 shadow-md transition-colors cursor-pointer"
                  >
                    <Play className="w-5 h-5 text-[#f5b800] fill-[#f5b800]" />
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
              const Icon = svc.icon;
              return (
                <>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#f5b800] border border-[#f5b800]/40 flex items-center justify-center">
                    <Icon className="w-6 h-6 stroke-[2]" />
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
                      className="flex-1 py-3 bg-[#f5b800] hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
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
              <h3 className="text-lg font-bold text-[#f5b800] flex items-center gap-2">
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
              <div className="w-16 h-16 rounded-full bg-[#f5b800] text-neutral-950 flex items-center justify-center animate-pulse">
                <Play className="w-8 h-8 fill-current ml-1" />
              </div>
              <p className="text-neutral-300 text-sm max-w-md font-mono">
                [ Walkthrough Video Playing: How ScanConnect Private QR Tag routes anonymous calls & emergency alerts ]
              </p>
              <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#f5b800] h-full w-2/3 animate-pulse" />
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

