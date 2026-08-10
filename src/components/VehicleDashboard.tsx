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
  X,
  QrCode,
  CheckCircle,
  Scan,
  PhoneCall,
  MessageCircle,
  Sparkles
} from 'lucide-react';
import banner from '../assets/images/howitworksbanner.png'
import videoWalkImg from '../assets/images/howitworks/videowalkimg.png'
import tutorialVideoPreviewImg from '../assets/images/howitworks/tutorialvideopreview.png'
import appStoreImg from '../assets/images/howitworks/appstore.png'
import playStoreImg from '../assets/images/howitworks/playstore.png'
import fuelStationImg from '../assets/images/howitworks/services/Fuel Station.png'
import policeStationImg from '../assets/images/howitworks/services/Police Station.png'
import hospitalCareImg from '../assets/images/howitworks/services/Hospital Care.png'
import punctureShopImg from '../assets/images/howitworks/services/Puncture Shop.png'
import rechargeFastagImg from '../assets/images/howitworks/services/Recharge FASTag.png'
import trafficChallanImg from '../assets/images/howitworks/services/Traffic Challan.png'
import vehicleDetailsImg from '../assets/images/howitworks/services/Vehicle Details.png'
import licenceDetailsImg from '../assets/images/howitworks/services/Licence Details.png'

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
    { id: 'fuel', title: 'Fuel Station', image: fuelStationImg, detail: 'Find nearest petrol, diesel & EV charging pumps near your vehicle location.' },
    { id: 'police', title: 'Police Station', image: policeStationImg, detail: 'Instant contact numbers & directions for nearest traffic and city police stations.' },
    { id: 'hospital', title: 'Hospital Care', image: hospitalCareImg, detail: 'Emergency trauma centers & ambulance contacts available 24/7.' },
    { id: 'puncture', title: 'Puncture Shop', image: punctureShopImg, detail: '24x7 roadside tyre repair, puncture fix & battery jumpstart services.' },
    { id: 'fastag', title: 'Recharge FASTag', image: rechargeFastagImg, detail: 'Instant FASTag balance check & toll recharge via UPI/Netbanking.' },
    { id: 'challan', title: 'Traffic Challan', image: trafficChallanImg, detail: 'Check pending traffic fines & pay challans online instantly by VIN.' },
    { id: 'vehicle', title: 'Vehicle Details', image: vehicleDetailsImg, detail: 'Verify RTO RC status, insurance expiry & vehicle ownership details.' },
    { id: 'licence', title: 'Licence Details', image: licenceDetailsImg, detail: 'Check DL validity, endorsement records & renewal timelines.' },
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
        <section className="relative bg-[#1B1C1C] text-white flex items-center overflow-hidden">
          {/* Background Image with Dark Gradient Overlay on the left for text legibility */}
          <div className="absolute inset-0 z-0">
            <img
              src={banner}
              alt="ScanConnect Vehicle Protection"
              className="w-full h-full object-cover object-[85%_15%]"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#1B1C1C] via-[#1B1C1C]/85 to-transparent" />
          </div>

          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 sm:py-24 lg:py-28 relative z-10 w-full">
            <div className="max-w-xl space-y-5">
              <span className="font-['Inter'] font-bold text-xs tracking-[2px] uppercase text-[#9CA3AF] block">
                HOW IT WORKS
              </span>

              <h1 className="font-['Rubik'] font-bold text-3xl sm:text-4xl lg:text-[46px] tracking-[-1px] leading-[1.15] text-white">
                Someone <span className="text-[#F2BA03]">scans.</span>{' '}
                <span className="text-[#F2BA03]">You stay</span> private. It&apos;s that simple.
              </h1>

              <p className="font-['Rubik'] font-medium text-sm sm:text-base text-[#D1D5DB] leading-[26px] max-w-md pt-1">
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
        <section className="py-20 bg-white relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="font-['Rubik','Plus_Jakarta_Sans',sans-serif] font-bold text-3xl sm:text-5xl text-[#1B1C1C] tracking-tight">
                Tutorial video
              </h2>
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
                return (
                  <button
                    key={svc.id}
                    onClick={() => setSelectedService(svc.id)}
                    className="bg-white border border-[#E5E7EB] rounded-2xl p-8 sm:p-10 shadow-xs hover:shadow-md hover:border-[#F2BA03] transition-all flex flex-col items-center justify-center text-center space-y-4 group cursor-pointer"
                  >
                    <div className="group-hover:scale-110 transition-transform flex items-center justify-center h-16">
                      <img src={svc.image} alt={svc.title} className="h-16 w-auto object-contain" />
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
                <img
                  src={videoWalkImg}
                  alt="Scan Connect - Get Started"
                  className="w-full max-w-md "
                />
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
              return (
                <>
                  <div className="flex items-center justify-center p-3 rounded-xl bg-amber-50/80 border border-[#F2BA03]/40 w-fit">
                    <img src={svc.image} alt={svc.title} className="h-14 w-auto object-contain" />
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


