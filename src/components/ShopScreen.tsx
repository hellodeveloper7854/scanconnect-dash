import React, { useState } from 'react';
import { UserFormData } from '../types';
import { DashboardHeader } from './DashboardHeader';
import { DashboardFooter } from './DashboardFooter';
import { ProductDetailScreen } from './ProductDetailScreen';
import shopBannerImg from '../assets/images/shopbanner.png';
import qrImage from '../assets/images/qrimage.png';
import {
  Building2,
  ShoppingBag,
  Plane,
  ShoppingCart,
  Train,
  GraduationCap,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Star,
  Package,
  Check
} from 'lucide-react';

interface ShopScreenProps {
  userData: UserFormData;
  onLogout: () => void;
  onNavigate: (nav: string) => void;
  isLoggedIn?: boolean;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({
  userData,
  onLogout,
  onNavigate,
  isLoggedIn,
}) => {
  const [activeNav, setActiveNav] = useState('Shop');
  const [visibleProductsCount, setVisibleProductsCount] = useState(6);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [selectedProduct]);

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

  // Trusted Across India trust bar
  const trustBar = [
    { emoji: '🚚', label: 'Free Delivery Across India' },
    { emoji: '🔒', label: 'Privacy Protected' },
    { emoji: '⚡', label: 'Instant Activation' },
    { emoji: '📞', label: 'Secure Call Routing' },
    { emoji: '🇮🇳', label: 'Made for Indian Roads' },
  ];

  // SCAN CONNECT TAG — Perfect For list
  const perfectFor = [
    'Wrong Parking Alerts',
    'Emergency Contact',
    'Vehicle Safety Notifications',
    'Lost Vehicle Assistance',
    'Society & Office Parking',
    'Commercial Fleets',
  ];

  // Our Reach — 6 industries with benefits sub-lists
  const ourReach = [
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

  // Our Products — 4 distinct product cards
  const products = [
    {
      id: 1,
      emoji: '🚗',
      badge: 'Best Seller',
      rating: '4.8/5 Customer Rating',
      title: 'Scan Connect Car Tag (Pack of 2)',
      desc: 'Never worry about missed parking alerts again. Anyone can contact you instantly without seeing your personal phone number.',
      idealFor: ['Cars & SUVs', 'Residential Parking', 'Office Parking', 'Shopping Malls', 'Public Parking'],
      features: [
        'Privacy-Protected Calls',
        'Instant QR Scan',
        'Waterproof & Weatherproof',
        'UV Resistant Premium Material',
        'Secure Call Routing',
        'Easy Self Activation',
        'Lifetime QR Activation',
        'No Battery Required',
      ],
      price: '₹499',
      cta: 'View Product',
    },
    {
      id: 2,
      emoji: '🏍',
      title: 'Scan Connect Bike Tag',
      desc: 'Designed specifically for motorcycles and scooters with a compact, durable design that withstands all weather conditions.',
      idealFor: ['Motorcycles', 'Scooters', 'Electric Two-Wheelers'],
      price: 'Starting from ₹399',
      cta: 'View Product',
    },
    {
      id: 3,
      emoji: '🚛',
      title: 'Fleet & Commercial Tags',
      desc: 'Designed for logistics companies, delivery fleets, taxis, corporate vehicles, and commercial transportation.',
      idealFor: ['Delivery Vehicles', 'Taxi Operators', 'Logistics Companies', 'Corporate Fleets'],
      price: 'Contact for Enterprise Pricing',
      cta: 'Contact Sales',
    },
    {
      id: 4,
      emoji: '🏠',
      title: 'Home & Society QR Tags',
      desc: 'Enable visitors, security personnel, and neighbors to contact residents securely without exposing private phone numbers.',
      idealFor: ['Apartments', 'Villas', 'Gated Communities', 'Residential Complexes'],
      cta: 'View Product',
    },
  ];

  // Why Choose Scan Connect checklist
  const whyChoose = [
    'One-Time Purchase',
    'Lifetime Activation',
    'Privacy-First Technology',
    'Instant Secure Calling',
    'WhatsApp & SMS Support',
    'Premium Waterproof QR Tags',
    'No App Required for Scanners',
    'Easy DIY Installation',
    'Fast Delivery Across India',
    'Dedicated Customer Support',
  ];

  if (selectedProduct) {
    return (
      <ProductDetailScreen
        product={selectedProduct}
        userData={userData}
        onLogout={onLogout}
        onNavigate={onNavigate}
        isLoggedIn={isLoggedIn}
        onBackToShop={() => setSelectedProduct(null)}
      />
    );
  }

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
        {/* 1. SHOP HERO BANNER SECTION */}
        <section className="py-12 sm:py-16 lg:py-20 bg-[#F8F9FB]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">

              {/* Left Column Text */}
              <div className="lg:col-span-6 space-y-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#0F0F0F] uppercase">
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span>SHOP</span>
                </div>

                <span className="font-mono text-xs font-semibold tracking-wider text-[#F2BA03] uppercase block">
                  OFFICIAL STORE
                </span>

                <h1 className="text-3xl sm:text-4xl lg:text-[42px] lg:leading-[1.15] font-black text-[#0F0F0F] tracking-tight font-sans">
                  Smart Protection for Every Journey
                </h1>

                <p className="text-[#5D5F5F] text-lg sm:text-xl font-semibold">
                  Privacy-First QR Tags for Cars, Bikes &amp; Fleets
                </p>

                <p className="text-[#5D5F5F] text-base sm:text-lg leading-relaxed font-normal max-w-xl">
                  Protect your personal phone number while staying instantly reachable whenever someone needs to contact you. Whether it&apos;s wrong parking, a vehicle emergency, or a helpful alert, Scan Connect ensures secure communication without revealing your identity.
                </p>

                <div className="space-y-2 pt-1">
                  {[
                    'One-Time Purchase • Lifetime Activation',
                    'No Monthly Subscription',
                    'Free Express Delivery Across India',
                    'Made in India',
                  ].map((line) => (
                    <div key={line} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#F2BA03] stroke-[3] shrink-0" />
                      <span className="text-[#1B1C1C] text-sm sm:text-base font-medium">{line}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column Image */}
              <div className="lg:col-span-6 flex justify-center lg:justify-end">
                <div className="relative overflow-hidden max-w-lg w-full">
                  <img
                    src={shopBannerImg}
                    alt="ScanConnect Tag Product"
                    className="w-full h-[280px] sm:h-[340px] object-contain"
                  />
                </div>
              </div>

            </div>

            {/* Trusted Across India */}
            <div className="mt-16 border-t border-neutral-200 pt-10 text-center space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F0F0F]">
                Trusted Across India
              </h2>
              <p className="text-[#F2BA03] text-xl sm:text-2xl font-extrabold">
                950,000+ Active QR Tags
              </p>
              <p className="text-[#5D5F5F] text-sm sm:text-base max-w-2xl mx-auto">
                Helping vehicle owners, businesses, and organizations stay connected with secure, privacy-first communication.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {trustBar.map((item) => (
                  <div
                    key={item.label}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-neutral-200 rounded-full text-xs font-bold text-[#0F0F0F] shadow-xs"
                  >
                    <span>{item.emoji}</span>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>


        {/* 2. SCAN CONNECT TAG INTRO SECTION */}
        <section className="py-16 sm:py-20 bg-white border-t border-neutral-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <span className="font-mono text-xs font-semibold tracking-wider text-[#F2BA03] uppercase block">
              SCAN CONNECT TAG
            </span>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F0F0F] font-sans">
              The Smart QR Tag That Protects Your Privacy
            </h2>
            <p className="text-[#5D5F5F] text-base sm:text-lg leading-relaxed font-normal">
              From wrong parking notifications to emergency assistance, Scan Connect lets anyone contact you instantly&mdash;without ever revealing your personal phone number.
            </p>

            <div className="pt-4">
              <span className="font-bold text-sm uppercase tracking-wider text-[#0F0F0F] block mb-4">
                Perfect For
              </span>
              <div className="flex flex-wrap items-center justify-center gap-3">
                {perfectFor.map((item) => (
                  <span
                    key={item}
                    className="px-4 py-2 bg-neutral-100 rounded-full text-sm font-semibold text-[#0F0F0F]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>


        {/* 3. OUR REACH SECTION */}
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Header Badge & Titles */}
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 py-1 px-3.5 rounded-full border border-neutral-200 bg-white shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-[#F2BA03]" />
                <span className="font-mono text-xs font-semibold tracking-wider text-[#0F0F0F] uppercase">
                  OUR REACH
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-[#0F0F0F] font-sans">
                Smart Mobility Solutions for Every Parking Ecosystem
              </h2>

              <p className="text-[#5D5F5F] text-base sm:text-lg leading-relaxed font-normal">
                From smart cities to private enterprises, Scan Connect delivers intelligent parking communication solutions that improve convenience, safety, and operational efficiency.
              </p>
            </div>

            {/* 6 Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {ourReach.map((svc) => {
                const IconComp = svc.icon;
                return (
                  <div
                    key={svc.id}
                    className="bg-white border border-[#CCC7AA] rounded-2xl p-8 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between space-y-5"
                  >
                    <div className="space-y-4">
                      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-[#F2BA03]">
                        <IconComp className="w-7 h-7 stroke-[2.2]" />
                      </div>

                      <h3 className="text-xl font-semibold text-[#0F0F0F] leading-tight">
                        {svc.title}
                      </h3>

                      <p className="text-[#5D5F5F] text-sm leading-relaxed">
                        {svc.desc}
                      </p>

                      <div className="pt-2 space-y-1.5">
                        <span className="text-[10px] font-bold tracking-widest text-[#5D5F5F] uppercase block">
                          Benefits
                        </span>
                        {svc.benefits.map((b) => (
                          <div key={b} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-[#F2BA03] stroke-[3] shrink-0" />
                            <span className="text-[#1B1C1C] text-sm">{b}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Learn More Link */}
                    <button
                      onClick={() => alert(`Details for: ${svc.title}`)}
                      className="text-xs font-bold text-[#F2BA03] hover:text-[#d19d00] tracking-wider uppercase inline-flex items-center gap-1.5 cursor-pointer pt-2 transition-colors"
                    >
                      <span>LEARN MORE</span> <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        </section>


        {/* 4. OUR PRODUCTS SECTION */}
        <section className="py-16 sm:py-20 bg-neutral-50/60 border-t border-neutral-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
              <div className="inline-flex items-center gap-2 py-1 px-3.5 rounded-full border border-neutral-200 bg-white shadow-xs">
                <Package className="w-3.5 h-3.5 text-[#F2BA03]" />
                <span className="font-mono text-xs font-semibold tracking-wider text-[#0F0F0F] uppercase">
                  CATALOGUE
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-[#0F0F0F] font-sans">
                Find the Perfect Scan Connect Tag
              </h2>

              <p className="text-[#5D5F5F] text-base sm:text-lg leading-relaxed font-normal">
                Premium QR-based contact tags designed for individuals, families, businesses, and commercial fleets.
              </p>
            </div>

            {/* Product Cards Grid (2 cards per row) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mb-8">
              {products.map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      {prod.id === 1 ? (
                        <img src={qrImage} alt={prod.title} className="w-14 h-14 rounded-lg object-cover" />
                      ) : (
                        <span className="text-4xl">{prod.emoji}</span>
                      )}
                      {prod.badge && (
                        <span className="px-3 py-1 bg-[#F2BA03] text-[#1B1C1C] font-bold rounded-full text-[10px] uppercase tracking-wider">
                          {prod.badge}
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl sm:text-2xl font-extrabold text-[#0F0F0F] leading-snug">
                      {prod.title}
                    </h3>

                    {prod.rating && (
                      <div className="flex items-center gap-1.5 text-sm font-bold text-[#0F0F0F]">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-[#F2BA03] text-[#F2BA03]" />
                        ))}
                        <span className="text-[#5D5F5F] font-medium ml-1">{prod.rating}</span>
                      </div>
                    )}

                    <p className="text-[#5D5F5F] text-sm sm:text-base leading-relaxed">
                      {prod.desc}
                    </p>

                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold tracking-widest text-[#5D5F5F] uppercase block">
                        Ideal For
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {prod.idealFor.map((item) => (
                          <span key={item} className="px-2.5 py-1 bg-neutral-100 rounded-full text-xs font-semibold text-[#0F0F0F]">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>

                    {prod.features && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] font-bold tracking-widest text-[#5D5F5F] uppercase block">
                          Features
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {prod.features.map((f) => (
                            <div key={f} className="flex items-center gap-2">
                              <Check className="w-3.5 h-3.5 text-[#F2BA03] stroke-[3] shrink-0" />
                              <span className="text-[#1B1C1C] text-xs sm:text-sm">{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Price & CTA */}
                  <div className="flex items-center justify-between pt-4 border-t border-neutral-100">
                    <div>
                      {prod.price && (
                        <>
                          <span className="text-[10px] font-bold tracking-widest text-[#5D5F5F] uppercase block">
                            PRICE
                          </span>
                          <span className="text-xl sm:text-2xl font-black text-[#0F0F0F] font-sans">
                            {prod.price}
                          </span>
                        </>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setSelectedProduct({
                          id: prod.id,
                          tag: prod.badge || 'SCAN CONNECT',
                          rating: '4.8',
                          title: prod.title,
                          desc: prod.desc,
                          price: prod.price && prod.price.startsWith('₹') ? prod.price : '₹499',
                        })
                      }
                      className="h-[44px] px-5 bg-[#0F0F0F] hover:bg-[#F2BA03] text-white hover:text-[#0F0F0F] font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-2 active:scale-95 shadow-xs"
                    >
                      <span>{prod.cta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>


        {/* 5. WHY CHOOSE SCAN CONNECT SECTION */}
        <section className="py-16 sm:py-20 bg-white border-t border-neutral-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F0F0F] font-sans">
                Why Choose Scan Connect?
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {whyChoose.map((item) => (
                <div key={item} className="flex items-start gap-2.5 bg-neutral-50/70 border border-neutral-200 rounded-xl p-4">
                  <Check className="w-4 h-4 text-[#F2BA03] stroke-[3] mt-0.5 shrink-0" />
                  <span className="text-sm font-semibold text-[#0F0F0F] leading-snug">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* 6. NEED MORE THAN ONE? CTA SECTION */}
        <section className="py-16 sm:py-20 bg-white border-t border-neutral-100">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F0F0F]">
              Need More Than One?
            </h2>
            <p className="text-[#5D5F5F] text-base sm:text-lg leading-relaxed">
              Whether you&apos;re an individual, business, apartment association, dealership, or fleet operator, we offer bulk orders, reseller programs, franchise opportunities, and enterprise solutions tailored to your needs.
            </p>
            <button
              onClick={() => onNavigate('contact')}
              className="inline-flex items-center gap-2 h-[52px] px-8 bg-[#F2BA03] hover:bg-[#e0ac00] text-[#1B1C1C] font-bold text-sm sm:text-base uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <span>Explore More Products</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

      </main>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
};
