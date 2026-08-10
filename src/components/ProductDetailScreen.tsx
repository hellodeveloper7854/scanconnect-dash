import React, { useState } from 'react';
import { UserFormData } from '../types';
import { DashboardHeader } from './DashboardHeader';
import { DashboardFooter } from './DashboardFooter';
import { CheckoutFlowScreen } from './CheckoutFlowScreen';
import qrImage from '../assets/images/qrimage.png';
import builtForOpenRoadImg from '../assets/images/builtforopenroad.jpg';
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
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [isCheckoutOpen]);

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

  const productTitle = product?.title || 'SCAN CONNECT Pro Tag - Digital Vehicle Protection';
  const productPrice = product?.price || '₹499';

  const thumbnails = [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }];

  const handleBuyNow = () => {
    setIsCheckoutOpen(true);
  };

  if (isCheckoutOpen) {
    return (
      <CheckoutFlowScreen
        userData={userData}
        onLogout={onLogout}
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        onBackToProduct={() => setIsCheckoutOpen(false)}
        product={{
          id: product?.id || 1,
          title: productTitle,
          desc: product?.desc || '',
          price: productPrice
        }}
      />
    );
  }

  const handleAddToCart = () => {
    setCartCount(prev => prev + 1);
    alert(`Added to Cart: ${productTitle}\nTotal in cart: ${cartCount + 1}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#0F0F0F] font-sans antialiased">
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
            className="inline-flex items-center gap-2 text-xs font-bold text-[#5D5F5F] hover:text-[#0F0F0F] uppercase tracking-wider transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shop</span>
          </button>
        </div>

        {/* SECTION 1: TOP PRODUCT DETAIL */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* Left Column: Product Gallery & Visuals */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Main Preview Container */}
            <div className="rounded-[16px] relative overflow-hidden aspect-square flex items-center justify-center">

              {/* BEST SELLER Tag */}
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-[#FFEF00] text-[#736B00] text-[12px] font-['Hanken_Grotesk'] font-bold uppercase tracking-[1.2px] px-[12px] py-[4px] rounded-full shadow-xs z-10">
                BEST SELLER
              </div>

              <img
                src={qrImage}
                alt={productTitle}
                className="h-full w-auto object-cover"
              />
            </div>

            {/* Thumbnail Row */}
            <div className="grid grid-cols-4 gap-3 sm:gap-4 pt-1">
              {thumbnails.map((thumb, idx) => (
                <button
                  key={thumb.id}
                  onClick={() => setActiveThumbnail(idx)}
                  className={`aspect-square rounded-[8px] border-2 overflow-hidden transition-all cursor-pointer ${
                    activeThumbnail === idx
                      ? 'border-[#676000] opacity-100 shadow-xs'
                      : 'border-[#CCC7AA] opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={qrImage} alt={productTitle} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Product Details */}
          <div className="lg:col-span-6 space-y-6 pt-1">
            
            {/* Rating Row */}
            <div className="flex items-center gap-2 text-[16px] font-['Hanken_Grotesk']">
              <div className="flex text-[#FFD700]">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-[20px] h-[19px] fill-[#FFD700] text-[#FFD700]" />
                ))}
              </div>
              <span className="text-[#5F5E5E] font-normal">4.8/5 Rating</span>
              <span className="w-1 h-1 bg-[#CCC7AA] rounded-full mx-1 inline-block" />
              <span className="text-[#676000] font-bold">950,000+ Tags Active</span>
            </div>

            {/* Heading 1 Title */}
            <h1 className="font-['Rubik'] font-bold text-[28px] sm:text-[36px] leading-[36px] sm:leading-[44px] text-[#1B1C1C] tracking-[-0.4px]">
              {productTitle}
            </h1>

            {/* Description */}
            <p className="font-['Hanken_Grotesk'] font-normal text-[18px] leading-[29px] text-[#5F5E5E]">
              Secure your vehicle with digital-physical bridges. Masked calls, SMS, and WhatsApp alerts without revealing your phone number to strangers.
            </p>

            {/* Price Row */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="font-['Plus_Jakarta_Sans'] font-extrabold text-[44px] sm:text-[56px] leading-[50px] sm:leading-[64px] text-[#1B1C1C] tracking-[-1.28px]">
                {productPrice}
              </span>
              <span className="font-['Hanken_Grotesk'] font-normal text-[18px] text-[#5F5E5E] line-through">
                ₹799
              </span>
              <span className="bg-[#BA1A1A] text-white font-['Hanken_Grotesk'] font-bold text-[12px] leading-[12px] tracking-[1.2px] px-[8px] py-[4px] rounded-[4px] uppercase">
                37% OFF
              </span>
            </div>

            {/* Delivery Alert Banner Box */}
            <div className="bg-[#EFEDED] border border-dashed border-[#CCC7AA] rounded-[8px] p-[16px] flex items-center gap-[12px]">
              <Truck className="w-[22px] h-[16px] text-[#676000] shrink-0" />
              <span className="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#1B1C1C]">
                Free delivery across India &bull; Arrives in 2-4 days
              </span>
            </div>

            {/* PRODUCT SPECS 2x2 Grid */}
            <div className="space-y-[12px] pt-1">
              <span className="font-['Hanken_Grotesk'] font-bold text-[12px] leading-[12px] tracking-[1.2px] text-[#5F5E5E] uppercase block">
                PRODUCT SPECS
              </span>
              <div className="grid grid-cols-2 gap-y-[12px] gap-x-[16px] font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#1B1C1C]">
                <div className="flex items-center gap-[8px]">
                  <Droplets className="w-[16px] h-[16px] text-[#676000] shrink-0" />
                  <span>Weatherproof</span>
                </div>
                <div className="flex items-center gap-[8px]">
                  <Sun className="w-[18px] h-[18px] text-[#676000] shrink-0" />
                  <span>UV Resistant</span>
                </div>
                <div className="flex items-center gap-[8px]">
                  <CheckCircle className="w-[16px] h-[16px] text-[#676000] shrink-0" />
                  <span>Easy to Apply</span>
                </div>
                <div className="flex items-center gap-[8px]">
                  <Award className="w-[18px] h-[18px] text-[#676000] shrink-0" />
                  <span>1-Year Warranty</span>
                </div>
              </div>
            </div>

            {/* Action Buttons Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-[16px] pt-2">
              <button
                onClick={handleBuyNow}
                className="h-[59px] bg-[#F2BA03] hover:bg-[#e0ac00] text-white font-['Rubik'] font-semibold text-[18px] leading-[27px] rounded-[8px] shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] transition-all cursor-pointer flex items-center justify-center gap-[8px] active:scale-95"
              >
                <span>Buy Now</span>
                <ArrowRight className="w-[16px] h-[16px] text-white" />
              </button>

              <button
                onClick={handleAddToCart}
                className="h-[59px] bg-[#1B1C1C] hover:bg-neutral-800 text-white font-['Plus_Jakarta_Sans'] font-normal text-[18px] leading-[27px] rounded-[8px] transition-all cursor-pointer flex items-center justify-center gap-[8px] active:scale-95"
              >
                <ShoppingCart className="w-[20px] h-[21px] text-white" />
                <span>Add to Cart</span>
              </button>
            </div>

            {/* Bottom Trust Badges Row */}
            <div className="grid grid-cols-3 gap-2 pt-[16px] border-t border-[#E4E2E2] text-center font-['Hanken_Grotesk'] font-normal text-[11px] leading-[16px] text-[#5F5E5E]">
              <div className="flex flex-col items-center gap-[4px]">
                <Lock className="w-[16px] h-[21px] text-[#5F5E5E]" />
                <span>SECURE PAYMENT</span>
              </div>
              <div className="flex flex-col items-center gap-[4px]">
                <ShieldCheck className="w-[16px] h-[20px] text-[#5F5E5E]" />
                <span>DATA MASKING</span>
              </div>
              <div className="flex flex-col items-center gap-[4px]">
                <RefreshCw className="w-[16px] h-[16px] text-[#5F5E5E]" />
                <span>7 DAY RETURNS</span>
              </div>
            </div>

          </div>

        </section>


        {/* SECTION 2: BUILT FOR THE OPEN ROAD */}
        <section className="py-10 border-t border-[#E4E2E2]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            
            {/* Left Photo */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full rounded-[16px] overflow-hidden">
                <img
                  src={builtForOpenRoadImg}
                  alt="SCAN CONNECT Tag on Car Windshield"
                  className="w-full h-[320px] sm:h-[420px] object-cover"
                />
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-7 space-y-[32px]">
              <h2 className="font-['Rubik'] font-semibold text-[32px] sm:text-[36px] leading-[40px] sm:leading-[48px] text-[#1B1C1C] tracking-[-0.4px]">
                Built for the Open Road
              </h2>

              <div className="space-y-[24px]">
                {/* Item 1 */}
                <div className="flex items-start gap-[16px]">
                  <div className="w-[20px] h-[20px] text-[#F2BA03] shrink-0 mt-[4px]">
                    <Layers className="w-[18px] h-[19px] fill-[#F2BA03] text-[#F2BA03]" />
                  </div>
                  <div className="space-y-[4px]">
                    <h3 className="font-['Hanken_Grotesk'] font-bold text-[18px] leading-[29px] text-[#1B1C1C]">
                      Triple-Layer Lamination
                    </h3>
                    <p className="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#5F5E5E]">
                      PET base, high-contrast ink, and an anti-scratch UV protective shield that lasts years.
                    </p>
                  </div>
                </div>

                {/* Item 2 */}
                <div className="flex items-start gap-[16px]">
                  <div className="w-[20px] h-[20px] text-[#F2BA03] shrink-0 mt-[4px]">
                    <Thermometer className="w-[18px] h-[18px] fill-[#F2BA03] text-[#F2BA03]" />
                  </div>
                  <div className="space-y-[4px]">
                    <h3 className="font-['Hanken_Grotesk'] font-bold text-[18px] leading-[29px] text-[#1B1C1C]">
                      Thermal Endurance
                    </h3>
                    <p className="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#5F5E5E]">
                      Withstands extreme dashboard temperatures ranging from -10°C to 75°C without peeling.
                    </p>
                  </div>
                </div>

                {/* Item 3 */}
                <div className="flex items-start gap-[16px]">
                  <div className="w-[20px] h-[20px] text-[#F2BA03] shrink-0 mt-[4px]">
                    <Sparkles className="w-[18px] h-[18px] fill-[#F2BA03] text-[#F2BA03]" />
                  </div>
                  <div className="space-y-[4px]">
                    <h3 className="font-['Hanken_Grotesk'] font-bold text-[18px] leading-[29px] text-[#1B1C1C]">
                      Residue-Free Adhesive
                    </h3>
                    <p className="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#5F5E5E]">
                      Automotive-grade 3M adhesive that stays firm but leaves no mark when removed.
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </section>


        {/* SECTION 3: TABS & INTERACTIVE BENTO GRID */}
        <section className="pt-4 pb-12 border-t border-[#E4E2E2]">
          
          {/* Sticky Tab Navigation Header */}
          <div className="border-b border-[#E4E2E2] flex items-center gap-[16px] sm:gap-[32px] mb-[32px] overflow-x-auto">
            <button
              onClick={() => setActiveTab('how')}
              className={`pb-[16px] px-[8px] cursor-pointer transition-colors relative whitespace-nowrap font-['Hanken_Grotesk'] font-bold text-[18px] sm:text-[20px] leading-[24px] ${
                activeTab === 'how'
                  ? 'text-[#676000] border-b-2 border-[#676000]'
                  : 'text-[#5F5E5E] hover:text-[#1B1C1C]'
              }`}
            >
              How It Works
            </button>

            <button
              onClick={() => setActiveTab('security')}
              className={`pb-[16px] px-[8px] cursor-pointer transition-colors relative whitespace-nowrap font-['Hanken_Grotesk'] font-bold text-[18px] sm:text-[20px] leading-[24px] ${
                activeTab === 'security'
                  ? 'text-[#676000] border-b-2 border-[#676000]'
                  : 'text-[#5F5E5E] hover:text-[#1B1C1C]'
              }`}
            >
              Security Features
            </button>

            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-[16px] px-[8px] cursor-pointer transition-colors relative whitespace-nowrap font-['Hanken_Grotesk'] font-bold text-[18px] sm:text-[20px] leading-[24px] ${
                activeTab === 'reviews'
                  ? 'text-[#676000] border-b-2 border-[#676000]'
                  : 'text-[#5F5E5E] hover:text-[#1B1C1C]'
              }`}
            >
              Customer Reviews
            </button>
          </div>

          {/* TAB 1: HOW IT WORKS BENTO GRID */}
          {activeTab === 'how' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-[24px] items-stretch animate-fade-in">
              
              {/* Left Large Dark Feature Card */}
              <div className="lg:col-span-7 bg-[#1B1C1C] text-white rounded-[12px] p-[32px] sm:p-[40px] flex flex-col justify-between min-h-[440px] relative overflow-hidden shadow-lg">
                
                <div className="space-y-[20px] relative z-10 max-w-xl">
                  {/* Yellow Circle Badge with Phone Icon */}
                  <div className="w-[48px] h-[48px] bg-[#F2BA03] rounded-full text-[#1F1C00] flex items-center justify-center">
                    <Phone className="w-[20px] h-[20px] fill-[#1F1C00]" />
                  </div>

                  <h3 className="font-['Rubik'] font-bold text-[28px] sm:text-[36px] leading-[36px] sm:leading-[44px] text-white tracking-[-0.4px]">
                    Zero Exposure Privacy
                  </h3>

                  <p className="font-['Hanken_Grotesk'] font-normal text-[16px] sm:text-[18px] leading-[26px] sm:leading-[29px] text-[#E4E2E2]">
                    Our cloud-bridge technology ensures that anyone trying to reach you regarding your vehicle never sees your actual phone number. All communication is routed through our secure virtual switch.
                  </p>
                </div>

                {/* Inset Live Simulation Box */}
                <div className="bg-[rgba(228,226,226,0.1)] border border-[rgba(255,255,255,0.1)] backdrop-blur-[6px] rounded-[8px] p-[16px] max-w-[320px] relative z-10 space-y-[8px] mt-[24px]">
                  <span className="font-['Hanken_Grotesk'] font-normal text-[12px] leading-[18px] text-[#F2BA03] block uppercase">
                    LIVE SIMULATION
                  </span>
                  <div className="flex items-center justify-between font-mono text-[16px] leading-[24px] text-white tracking-[1.6px]">
                    <span>+91 &bull;&bull;&bull;&bull;&bull; &bull;&bull;492</span>
                    <span className="bg-[#F2BA03] text-[#1F1C00] font-['Hanken_Grotesk'] font-normal text-[10px] uppercase px-[8px] py-[2px] rounded-[4px]">
                      CONNECTED
                    </span>
                  </div>
                </div>

                {/* Yellow Radial Glow Background Accent */}
                <div className="absolute -bottom-[80px] -right-[80px] w-[320px] h-[320px] bg-[rgba(255,239,0,0.1)] rounded-full blur-[32px] pointer-events-none" />
              </div>

              {/* Right Column Secondary Cards */}
              <div className="lg:col-span-5 flex flex-col gap-[24px]">
                
                {/* Card 1: Instant Setup */}
                <div className="bg-[#FAFAFA] border border-[#CCC7AA] rounded-[12px] p-[32px] flex-1 flex flex-col items-center justify-center text-center space-y-[12px] shadow-xs">
                  <div className="w-[24px] h-[40px] flex items-center justify-center text-[#F2BA03]">
                    <Zap className="w-[28px] h-[28px] fill-[#F2BA03] text-[#F2BA03]" />
                  </div>
                  <h4 className="font-['Rubik'] font-semibold text-[22px] sm:text-[24px] leading-[31px] text-[#1B1C1C]">
                    Instant Setup
                  </h4>
                  <p className="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#5F5E5E] max-w-xs">
                    Scan, link your number in 30 seconds, and you&apos;re protected. No app download required.
                  </p>
                </div>

                {/* Card 2: Smart Alerts */}
                <div className="bg-[#FFFFFF] border border-[#CCC7AA] rounded-[12px] p-[32px] flex-1 flex flex-col items-center justify-center text-center space-y-[12px] shadow-xs">
                  <div className="w-[40px] h-[32px] flex items-center justify-center text-[#F2BA03]">
                    <RefreshCw className="w-[28px] h-[28px] text-[#F2BA03]" />
                  </div>
                  <h4 className="font-['Rubik'] font-semibold text-[22px] sm:text-[24px] leading-[31px] text-[#1B1C1C]">
                    Smart Alerts
                  </h4>
                  <p className="font-['Hanken_Grotesk'] font-normal text-[16px] leading-[24px] text-[#5F5E5E] max-w-xs">
                    Get categorized alerts for parking issues, emergencies, or document renewals.
                  </p>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: SECURITY FEATURES */}
          {activeTab === 'security' && (
            <div className="bg-[#FAFAFA] border border-[#E4E2E2] rounded-[12px] p-[24px] sm:p-[40px] space-y-[24px] animate-fade-in">
              <h3 className="font-['Rubik'] font-semibold text-[24px] sm:text-[28px] text-[#1B1C1C]">
                Bank-Grade Privacy & Encryption
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-[20px] font-['Hanken_Grotesk']">
                <div className="bg-white p-[20px] rounded-[12px] border border-[#E4E2E2] space-y-[8px]">
                  <ShieldCheck className="w-[24px] h-[24px] text-[#F2BA03]" />
                  <h4 className="font-bold text-[16px] text-[#1B1C1C]">256-Bit Masking</h4>
                  <p className="text-[#5F5E5E] text-[14px]">Every call routed through intermediate proxy nodes so phone numbers stay 100% confidential.</p>
                </div>
                <div className="bg-white p-[20px] rounded-[12px] border border-[#E4E2E2] space-y-[8px]">
                  <Lock className="w-[24px] h-[24px] text-[#F2BA03]" />
                  <h4 className="font-bold text-[16px] text-[#1B1C1C]">Spam Protection</h4>
                  <p className="text-[#5F5E5E] text-[14px]">AI-powered filtering prevents nuisance calls and telemarketers from reaching your vehicle line.</p>
                </div>
                <div className="bg-white p-[20px] rounded-[12px] border border-[#E4E2E2] space-y-[8px]">
                  <Zap className="w-[24px] h-[24px] text-[#F2BA03]" />
                  <h4 className="font-bold text-[16px] text-[#1B1C1C]">Instant Kill Switch</h4>
                  <p className="text-[#5F5E5E] text-[14px]">Temporarily disable calls or mute alerts anytime directly from your ScanConnect dashboard.</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="bg-[#FAFAFA] border border-[#E4E2E2] rounded-[12px] p-[24px] sm:p-[40px] space-y-[24px] animate-fade-in">
              <div className="flex items-center justify-between border-b border-[#E4E2E2] pb-[16px]">
                <h3 className="font-['Rubik'] font-semibold text-[24px] sm:text-[28px] text-[#1B1C1C]">
                  Customer Reviews (4.8 / 5.0)
                </h3>
                <span className="font-['Hanken_Grotesk'] font-bold text-[12px] text-[#1B1C1C] bg-[#F2BA03] px-[12px] py-[4px] rounded-full uppercase">
                  Verified Owners
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-[20px] font-['Hanken_Grotesk']">
                <div className="bg-white p-[20px] rounded-[12px] border border-[#E4E2E2] space-y-[8px]">
                  <div className="flex text-[#FFD700]">★★★★★</div>
                  <p className="text-[#5F5E5E] text-[15px] italic">&ldquo;Saved my car from towing in Pune city! A shopkeeper scanned the tag and called me privately.&rdquo;</p>
                  <span className="font-bold text-[#1B1C1C] text-[14px] block pt-1">— Rajesh Sharma, MH-12</span>
                </div>
                <div className="bg-white p-[20px] rounded-[12px] border border-[#E4E2E2] space-y-[8px]">
                  <div className="flex text-[#FFD700]">★★★★★</div>
                  <p className="text-[#5F5E5E] text-[15px] italic">&ldquo;Super simple sticker to apply. Nobody gets my personal WhatsApp or phone number now.&rdquo;</p>
                  <span className="font-bold text-[#1B1C1C] text-[14px] block pt-1">— Ananya Deshmukh, MH-14</span>
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
