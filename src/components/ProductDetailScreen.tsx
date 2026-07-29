import React, { useState } from 'react';
import { UserFormData } from '../types';
import { DashboardHeader } from './DashboardHeader';
import { DashboardFooter } from './DashboardFooter';
import {
  Star,
  Truck,
  ShieldCheck,
  Droplets,
  Sun,
  Lock,
  Award,
  ShoppingCart,
  ArrowRight,
  ArrowLeft,
  Phone,
  Zap,
  RefreshCw,
  QrCode,
  CheckCircle,
  Layers,
  Thermometer,
  Sparkles
} from 'lucide-react';

interface ProductDetailScreenProps {
  userData: UserFormData;
  onLogout: () => void;
  onNavigate: (nav: string) => void;
  isLoggedIn?: boolean;
  onBackToShop?: () => void;
  product?: {
    id: number;
    title: string;
    desc: string;
    price: string;
    tag?: string;
    rating?: string;
  };
}

export const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({
  userData,
  onLogout,
  onNavigate,
  isLoggedIn,
  onBackToShop,
  product
}) => {
  const [activeNav, setActiveNav] = useState('Shop');
  const [activeThumbnail, setActiveThumbnail] = useState(0);
  const [activeTab, setActiveTab] = useState<'how' | 'security' | 'reviews'>('how');
  const [cartCount, setCartCount] = useState(0);

  const handleHeaderNav = (navItem: string) => {
    setActiveNav(navItem);
    if (navItem === 'How it works' || navItem === 'QR Scan') {
      onNavigate('dashboard');
    } else if (navItem === 'About' || navItem === 'about') {
      onNavigate('about');
    } else if (navItem === 'Shop' || navItem === 'shop') {
      if (onBackToShop) {
        onBackToShop();
      } else {
        onNavigate('shop');
      }
    } else if (navItem === 'Contact' || navItem === 'contact') {
      onNavigate('contact');
    } else if (navItem === 'Profile' || navItem === 'profile') {
      onNavigate('profile');
    }
  };

  const productTitle = product?.title || 'SCAN ME Pro Tag - Digital Vehicle Protection';
  const productPrice = product?.price || '₹499';

  const thumbnails = [
    { type: 'qr-yellow', id: 0 },
    { type: 'qr-[#f5b800]', id: 1 },
    { type: 'qr-amber', id: 2 },
    { type: 'sc-logo', id: 3 },
  ];

  const handleBuyNow = () => {
    alert(`Proceeding to checkout for ${productTitle} (${productPrice})`);
  };

  const handleAddToCart = () => {
    setCartCount(prev => prev + 1);
    alert(`Added to Cart: ${productTitle}\nTotal in cart: ${cartCount + 1}`);
  };

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

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-16">
        
        {/* Back button */}
        <div className="flex items-center justify-between">
          <button
            onClick={onBackToShop || (() => onNavigate('shop'))}
            className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-neutral-950 uppercase tracking-wider transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shop</span>
          </button>
        </div>

        {/* SECTION 1: TOP PRODUCT DETAIL (IMAGE 1 REPLICA) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* Left Column: Product Gallery */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Preview Box */}
            <div className="bg-[#f5b800] rounded-3xl p-8 sm:p-12 relative overflow-hidden aspect-square border border-amber-400/80 shadow-sm flex flex-col items-center justify-center">
              
              {/* BEST SELLER Tag */}
              <div className="absolute top-5 left-5 bg-[#e2aa00] text-neutral-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-2xs">
                BEST SELLER
              </div>

              {/* Tag Sticker Card */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border-4 border-white w-full max-w-[320px] flex flex-col items-center space-y-4">
                {/* Big QR Code */}
                <div className="w-44 h-44 sm:w-48 sm:h-48 bg-neutral-950 p-3 rounded-2xl flex items-center justify-center border border-neutral-800 shadow-inner">
                  <QrCode className="w-full h-full text-[#f5b800]" />
                </div>

                {/* Tag ID Badge */}
                <span className="text-xs font-black tracking-widest uppercase font-mono text-neutral-900">
                  NGF132
                </span>

                {/* Icon Bar */}
                <div className="w-full border-t border-neutral-200 pt-3 flex items-center justify-around text-neutral-800">
                  <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold" title="Wrong Parking">
                    🏠
                  </div>
                  <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold" title="No Parking">
                    🚫
                  </div>
                  <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold" title="Emergency Contact">
                    ⚠️
                  </div>
                  <div className="w-7 h-7 rounded-full bg-amber-100 flex items-center justify-center text-xs font-bold" title="Scan QR">
                    📞
                  </div>
                </div>

                <p className="text-[10px] text-center font-bold text-neutral-700 leading-tight max-w-[240px]">
                  Wrong Parking, Emergency Contact, any issue with the vehicle, Scan the QR.
                </p>
              </div>
            </div>

            {/* Thumbnail Row (Matching Image 1) */}
            <div className="grid grid-cols-4 gap-3 pt-2">
              {thumbnails.map((thumb, idx) => (
                <button
                  key={thumb.id}
                  onClick={() => setActiveThumbnail(idx)}
                  className={`aspect-square rounded-2xl border-2 flex items-center justify-center p-2 transition-all cursor-pointer ${
                    activeThumbnail === idx
                      ? 'border-amber-500 shadow-md ring-2 ring-amber-400/50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  {thumb.type === 'sc-logo' ? (
                    <div className="w-10 h-10 rounded-full border-2 border-neutral-800 flex items-center justify-center text-neutral-900 font-black text-xs">
                      SC
                    </div>
                  ) : (
                    <div className="w-full h-full bg-[#f5b800] rounded-lg p-1.5 flex flex-col items-center justify-between text-neutral-950">
                      <QrCode className="w-6 h-6" />
                      <div className="w-full h-0.5 bg-neutral-900/30 rounded" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Product Meta & Purchase Info */}
          <div className="lg:col-span-6 space-y-6 pt-1">
            
            {/* Rating Row */}
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-700">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span>4.8/5 Rating</span>
              <span className="text-neutral-300">•</span>
              <span className="text-amber-700 font-semibold">950,000+ Tags Active</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight font-sans leading-tight">
              {productTitle}
            </h1>

            {/* Description */}
            <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
              Secure your vehicle with digital-physical bridges. Masked calls, SMS, and WhatsApp alerts without revealing your phone number to strangers.
            </p>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-4xl sm:text-5xl font-black text-neutral-950 font-sans tracking-tight">
                {productPrice}
              </span>
              <span className="text-lg text-neutral-400 line-through font-medium">
                ₹799
              </span>
              <span className="px-2.5 py-1 bg-red-700 text-white font-extrabold text-xs rounded uppercase tracking-wider">
                37% OFF
              </span>
            </div>

            {/* Delivery Alert Card */}
            <div className="bg-neutral-100/80 border border-dashed border-neutral-300 rounded-2xl p-4 flex items-center gap-3 text-xs font-bold text-neutral-800">
              <Truck className="w-5 h-5 text-neutral-700 shrink-0" />
              <span>Free delivery across India • Arrives in 2-4 days</span>
            </div>

            {/* PRODUCT SPECS 2x2 Grid */}
            <div className="space-y-2 pt-2">
              <span className="text-[10px] font-black tracking-widest text-neutral-400 uppercase font-mono block">
                PRODUCT SPECS
              </span>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-bold text-neutral-800">
                <div className="flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-sky-600" />
                  <span>Weatherproof</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>UV Resistant</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>Easy to Apply</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-neutral-700" />
                  <span>1-Year Warranty</span>
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
              <button
                onClick={handleBuyNow}
                className="py-4 bg-[#f5b800] hover:bg-amber-400 text-neutral-950 font-extrabold text-sm rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
              >
                <span>Buy Now</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>

              <button
                onClick={handleAddToCart}
                className="py-4 bg-[#1e1e1e] hover:bg-neutral-800 text-white font-extrabold text-sm rounded-2xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2.5 active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
            </div>

            {/* Bottom Value Props Row (Image 1) */}
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-neutral-100 text-center text-[10px] font-bold text-neutral-500">
              <div className="flex flex-col items-center gap-1">
                <Lock className="w-4 h-4 text-neutral-700" />
                <span>SECURE PAYMENT</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-neutral-700" />
                <span>DATA MASKING</span>
              </div>
              <div className="flex flex-col items-center gap-1">
                <RefreshCw className="w-4 h-4 text-neutral-700" />
                <span>7 DAY RETURNS</span>
              </div>
            </div>

          </div>

        </section>


        {/* SECTION 2: BUILT FOR THE OPEN ROAD (IMAGE 2 REPLICA) */}
        <section className="py-12 border-t border-neutral-100">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Left Photo */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full rounded-3xl overflow-hidden shadow-xl border border-neutral-200 group">
                <img
                  src="https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1000&q=80"
                  alt="SCAN ME Pro Tag on Car Windshield"
                  className="w-full h-[320px] sm:h-[380px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                
                {/* Oval Tag Sticker Graphic Overlay on Windshield */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-amber-400 border-4 border-white text-neutral-950 w-36 h-28 rounded-[50%] shadow-2xl flex flex-col items-center justify-center text-center p-2 transform -rotate-12">
                  <span className="text-[8px] font-black uppercase tracking-tight">SCAN ME Pro</span>
                  <QrCode className="w-10 h-10 text-neutral-950 my-0.5" />
                  <span className="text-[7px] font-extrabold uppercase">SECURE VEHICLE ID</span>
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-7 space-y-8">
              <h2 className="text-3xl sm:text-4xl font-black text-neutral-950 tracking-tight font-sans">
                Built for the Open Road
              </h2>

              <div className="space-y-6">
                {/* Item 1 */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 text-[#f5b800] flex items-center justify-center shrink-0 mt-0.5">
                    <Layers className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-neutral-950">
                      Triple-Layer Lamination
                    </h3>
                    <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">
                      PET base, high-contrast ink, and an anti-scratch UV protective shield that lasts years.
                    </p>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 text-[#f5b800] flex items-center justify-center shrink-0 mt-0.5">
                    <Thermometer className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-neutral-950">
                      Thermal Endurance
                    </h3>
                    <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">
                      Withstands extreme dashboard temperatures ranging from -10°C to 75°C without peeling.
                    </p>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200/60 text-[#f5b800] flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-neutral-950">
                      Residue-Free Adhesive
                    </h3>
                    <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed">
                      Automotive-grade 3M adhesive that stays firm but leaves no mark when removed.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>


        {/* SECTION 3: TABS & INTERACTIVE CARDS (IMAGE 3 REPLICA) */}
        <section className="pt-6 pb-12 border-t border-neutral-100">
          
          {/* Tab Navigation Header */}
          <div className="border-b border-neutral-200 flex items-center gap-8 text-sm font-bold mb-8">
            <button
              onClick={() => setActiveTab('how')}
              className={`pb-3 cursor-pointer transition-colors relative ${
                activeTab === 'how'
                  ? 'text-neutral-950 border-b-2 border-amber-500 font-extrabold'
                  : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              How It Works
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`pb-3 cursor-pointer transition-colors relative ${
                activeTab === 'security'
                  ? 'text-neutral-950 border-b-2 border-amber-500 font-extrabold'
                  : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              Security Features
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 cursor-pointer transition-colors relative ${
                activeTab === 'reviews'
                  ? 'text-neutral-950 border-b-2 border-amber-500 font-extrabold'
                  : 'text-neutral-400 hover:text-neutral-700'
              }`}
            >
              Customer Reviews
            </button>
          </div>

          {/* TAB 1: HOW IT WORKS */}
          {activeTab === 'how' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fade-in">
              
              {/* Left Large Dark Card */}
              <div className="lg:col-span-8 bg-[#1a1a1a] text-white rounded-3xl p-8 sm:p-10 flex flex-col justify-between space-y-8 relative overflow-hidden border border-neutral-800 shadow-xl">
                
                <div className="space-y-6 relative z-10 max-w-xl">
                  {/* Yellow Phone Icon Circle */}
                  <div className="w-12 h-12 bg-[#f5b800] rounded-full text-neutral-950 flex items-center justify-center shadow-lg">
                    <Phone className="w-6 h-6 stroke-[2.2]" />
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                    Zero Exposure Privacy
                  </h3>

                  <p className="text-neutral-300 text-sm sm:text-base leading-relaxed font-normal">
                    Our cloud-bridge technology ensures that anyone trying to reach you regarding your vehicle never sees your actual phone number. All communication is routed through our secure virtual switch.
                  </p>
                </div>

                {/* Inset Live Simulation Box */}
                <div className="bg-neutral-900/90 border border-neutral-700/80 rounded-2xl p-4 sm:p-5 max-w-sm relative z-10 space-y-2">
                  <span className="text-[9px] font-black tracking-widest text-amber-400 uppercase font-mono block">
                    LIVE SIMULATION
                  </span>
                  <div className="flex items-center justify-between font-mono text-sm sm:text-base text-white">
                    <span>+91 ••••• ••492</span>
                    <span className="bg-[#f5b800] text-neutral-950 font-black text-[10px] uppercase px-2 py-0.5 rounded">
                      CONNECTED
                    </span>
                  </div>
                </div>

                {/* Soft ambient glow overlay */}
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
              </div>

              {/* Right Column 2 Cards */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                
                {/* Card 1: Instant Setup */}
                <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 flex-1 flex flex-col items-center justify-center text-center space-y-3 shadow-xs hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-[#f5b800] flex items-center justify-center">
                    <Zap className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <h4 className="text-lg font-black text-neutral-950">
                    Instant Setup
                  </h4>
                  <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed max-w-xs">
                    Scan, link your number in 30 seconds, and you&apos;re protected. No app download required.
                  </p>
                </div>

                {/* Card 2: Smart Alerts */}
                <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 flex-1 flex flex-col items-center justify-center text-center space-y-3 shadow-xs hover:shadow-md transition-shadow">
                  <div className="w-10 h-10 rounded-full bg-amber-50 text-[#f5b800] flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <h4 className="text-lg font-black text-neutral-950">
                    Smart Alerts
                  </h4>
                  <p className="text-neutral-500 text-xs sm:text-sm leading-relaxed max-w-xs">
                    Get categorized alerts for parking issues, emergencies, or document renewals.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: SECURITY FEATURES */}
          {activeTab === 'security' && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-8 sm:p-10 space-y-6 animate-fade-in">
              <h3 className="text-2xl font-black text-neutral-950">
                Bank-Grade Privacy & Encryption
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
                <div className="bg-white p-5 rounded-2xl border border-neutral-200 space-y-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                  <h4 className="font-bold text-neutral-900">256-Bit Masking</h4>
                  <p className="text-neutral-500">Every call routed through intermediate proxy nodes so phone numbers stay 100% confidential.</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-neutral-200 space-y-2">
                  <Lock className="w-6 h-6 text-amber-500" />
                  <h4 className="font-bold text-neutral-900">Spam Protection</h4>
                  <p className="text-neutral-500">AI-powered filtering prevents nuisance calls and telemarketers from reaching your vehicle line.</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-neutral-200 space-y-2">
                  <Zap className="w-6 h-6 text-sky-600" />
                  <h4 className="font-bold text-neutral-900">Instant Kill Switch</h4>
                  <p className="text-neutral-500">Temporarily disable calls or mute alerts anytime directly from your ScanConnect dashboard.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="bg-neutral-50 border border-neutral-200 rounded-3xl p-8 sm:p-10 space-y-6 animate-fade-in">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-4">
                <h3 className="text-2xl font-black text-neutral-950">
                  Customer Reviews (4.8 / 5.0)
                </h3>
                <span className="text-xs font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                  Verified Owners
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
                <div className="bg-white p-5 rounded-2xl border border-neutral-200 space-y-2">
                  <div className="flex text-amber-400">★★★★★</div>
                  <p className="text-neutral-700 italic">&ldquo;Saved my car from towing in Pune city! A shopkeeper scanned the tag and called me privately.&rdquo;</p>
                  <span className="font-bold text-neutral-900 block pt-1">— Rajesh Sharma, MH-12</span>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-neutral-200 space-y-2">
                  <div className="flex text-amber-400">★★★★★</div>
                  <p className="text-neutral-700 italic">&ldquo;Super simple sticker to apply. Nobody gets my personal WhatsApp or phone number now.&rdquo;</p>
                  <span className="font-bold text-neutral-900 block pt-1">— Ananya Deshmukh, MH-14</span>
                </div>
              </div>
            </div>
          )}

        </section>

      </main>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
};
