import React, { useRef, useState } from 'react';
import { UserFormData } from '../types';
import { DashboardHeader } from './DashboardHeader';
import { DashboardFooter } from './DashboardFooter';
import { ProductDetailScreen } from './ProductDetailScreen';
import shopBannerImg from '../assets/images/shopbanner.png';
import {
  ArrowRight,
  ChevronRight,
  Star,
  Package,
  Check,
  X,
  Truck,
  Lock,
  Zap,
  PhoneCall,
  Car,
  Bike,
  Home,
  MapPin,
  ShieldCheck,
  QrCode
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
  const heroImageRef = useRef<HTMLDivElement>(null);
  const [heroTilt, setHeroTilt] = useState({ x: 0, y: 0 });

  const handleHeroImageMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = heroImageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setHeroTilt({ x: py * -10, y: px * 10 });
  };

  const resetHeroTilt = () => setHeroTilt({ x: 0, y: 0 });
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [featuresModalProductId, setFeaturesModalProductId] = useState<number | null>(null);

  React.useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo(0, 0);
  }, [selectedProduct]);

  // Deep-link support: /shop#products (footer "eTag" link) scrolls straight
  // to the product catalogue instead of landing at the top of the page.
  React.useEffect(() => {
    if (window.location.hash === '#products') {
      document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Deep-link support: /shop?product=<id> (used by footer links) opens
  // straight into that product's detail view instead of the listing.
  React.useEffect(() => {
    const productId = Number(new URLSearchParams(window.location.search).get('product'));
    if (!productId) return;
    const prod = products.find((p) => p.id === productId);
    if (prod) {
      setSelectedProduct({
        id: prod.id,
        tag: prod.badge || 'SCAN CONNECT',
        rating: '4.8',
        title: prod.title,
        desc: prod.desc,
        price: prod.price && prod.price.startsWith('₹') ? prod.price : '₹499',
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    { icon: Truck, label: 'Free Delivery Across India' },
    { icon: Lock, label: 'Privacy Protected' },
    { icon: Zap, label: 'Instant Activation' },
    { icon: PhoneCall, label: 'Secure Call Routing' },
    { icon: MapPin, label: 'Made for Indian Roads' },
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

  // Our Products — 4 distinct product cards
  const products = [
    {
      id: 1,
      icon: Car,
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
      icon: Bike,
      rating: '4.7/5 Customer Rating',
      title: 'Scan Connect Bike Tag',
      desc: 'Designed specifically for motorcycles and scooters with a compact, durable design that withstands all weather conditions.',
      idealFor: ['Motorcycles', 'Scooters', 'Electric Two-Wheelers'],
      features: [
        'Privacy-Protected Calls',
        'Instant QR Scan',
        'Compact Weatherproof Design',
        'UV Resistant Premium Material',
        'Secure Call Routing',
        'Easy Self Activation',
        'Lifetime QR Activation',
        'No Battery Required',
      ],
      price: 'Starting from ₹399',
      cta: 'View Product',
    },
    {
      id: 3,
      icon: Truck,
      title: 'Fleet & Commercial Tags',
      desc: 'Designed for logistics companies, delivery fleets, taxis, corporate vehicles, and commercial transportation.',
      idealFor: ['Delivery Vehicles', 'Taxi Operators', 'Logistics Companies', 'Corporate Fleets'],
      price: 'Contact for Enterprise Pricing',
      cta: 'Contact Sales',
    },
    {
      id: 4,
      icon: Home,
      title: 'Home & Society QR Tags',
      desc: 'Enable visitors, security personnel, and neighbors to contact residents securely without exposing private phone numbers.',
      idealFor: ['Apartments', 'Villas', 'Gated Communities', 'Residential Complexes'],
      price: 'Starting from ₹349',
      cta: 'View Product',
    },
  ];

  // What's in the Box — product-specific unboxing contents, not a generic brand checklist
  const boxContents = [
    { icon: Package, title: '1x Premium QR Tag', desc: 'Waterproof, UV-resistant tag pre-printed with your unique secure QR code.' },
    { icon: Zap, title: 'Lifetime Activation', desc: 'One-time setup linking the tag to your mobile number — no renewals, ever.' },
    { icon: Lock, title: 'Privacy-First Routing', desc: 'Calls, SMS & WhatsApp reach you without revealing your real number.' },
    { icon: Truck, title: 'Free Express Delivery', desc: 'Shipped across India at no extra cost, typically within 3-5 business days.' },
    { icon: PhoneCall, title: 'Quick-Start Guide', desc: 'Simple instructions to activate and attach your tag in under a minute.' },
    { icon: MapPin, title: 'Priority Support Access', desc: 'Dedicated help for setup, replacements, or activation issues.' },
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
        {/* 1. SHOP HERO BANNER SECTION — asymmetric split with an interactive tilt image */}
        <section className="py-12 sm:py-16 lg:py-20 bg-[#F8F9FB] overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">

              {/* Left Column Text — wider, carries the visual weight */}
              <div className="lg:col-span-9 space-y-5 relative z-10">
                {/* Breadcrumb */}
                <div className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#0F0F0F] uppercase">
                  <ChevronRight className="w-3.5 h-3.5" />
                  <span>SHOP</span>
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-neutral-200 shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#B58500]" />
                  <span className="font-mono text-xs font-bold tracking-wider text-[#B58500] uppercase">
                    OFFICIAL STORE
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-[46px] lg:leading-[1.1] font-black text-[#0F0F0F] tracking-tight font-sans max-w-3xl">
                  Smart Protection for Every Journey
                </h1>

                <p className="text-[#5D5F5F] text-lg sm:text-xl font-semibold">
                  Privacy-First QR Tags for Cars, Bikes &amp; Fleets
                </p>

                <p className="text-[#5D5F5F] text-base sm:text-lg leading-relaxed font-normal max-w-3xl">
                  Protect your personal phone number while staying instantly reachable whenever someone needs to contact you. Whether it&apos;s wrong parking, a vehicle emergency, or a helpful alert, Scan Connect ensures secure communication without revealing your identity.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 max-w-2xl">
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

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                    className="btn-shimmer h-[52px] px-8 bg-[#F2BA03] hover:bg-[#e0ac00] hover:shadow-[0_8px_24px_rgba(242,186,3,0.45)] hover:-translate-y-0.5 text-[#1B1C1C] font-bold text-sm sm:text-base uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                  >
                    <span>View Products</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Right Column Image — smaller, overlapping the text column; tilts toward the cursor on hover */}
              <div className="lg:col-span-3 flex justify-center lg:justify-start lg:-ml-24">
                <div
                  ref={heroImageRef}
                  onMouseMove={handleHeroImageMove}
                  onMouseLeave={resetHeroTilt}
                  className="relative w-full max-w-[240px] sm:max-w-[260px] [perspective:1000px]"
                >
                  <img
                    src={shopBannerImg}
                    alt="ScanConnect Tag Product"
                    style={{
                      transform: `rotateX(${heroTilt.x}deg) rotateY(${heroTilt.y}deg) scale(${heroTilt.x || heroTilt.y ? 1.03 : 1})`,
                    }}
                    className="w-full h-[220px] sm:h-[280px] object-cover rounded-3xl shadow-[0_25px_60px_rgba(0,0,0,0.15)] transition-transform duration-150 ease-out will-change-transform"
                  />
                </div>
              </div>

            </div>

            {/* Trusted Across India */}
            <div className="mt-16 border-t border-neutral-200 pt-10 text-center space-y-4">
              <h2 className="text-2xl sm:text-3xl font-black text-[#0F0F0F]">
                Trusted Across India
              </h2>
              <p className="text-[#5D5F5F] text-sm sm:text-base max-w-2xl mx-auto">
                Helping vehicle owners, businesses, and organizations stay connected with secure, privacy-first communication.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {trustBar.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.label}
                      className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-neutral-200 rounded-full text-xs font-bold text-[#0F0F0F] shadow-xs"
                    >
                      <Icon className="w-3.5 h-3.5 text-[#F2BA03]" />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>


        {/* 2. SCAN CONNECT TAG INTRO SECTION */}
        <section className="py-16 sm:py-20 bg-white border-t border-neutral-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F2BA03]/15 border border-[#F2BA03]/40">
              <QrCode className="w-3.5 h-3.5 text-[#B58500]" />
              <span className="font-mono text-xs font-semibold tracking-wider text-[#B58500] uppercase">
                SCAN CONNECT TAG
              </span>
            </div>
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


        {/* 3. OUR PRODUCTS SECTION */}
        <section id="products" className="py-16 sm:py-20 bg-neutral-50/60 border-t border-neutral-100">
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

            {/* Product Cards Grid (4 cards per row) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {products.map((prod) => {
                const ProductIcon = prod.icon;
                const hasMoreDetails = (prod.idealFor && prod.idealFor.length > 0) || (prod.features && prod.features.length > 0);
                return (
                <div
                  key={prod.id}
                  className="group bg-white border border-neutral-200 rounded-2xl shadow-xs hover:shadow-xl hover:border-[#F2BA03]/40 hover:-translate-y-1 transition-all flex flex-col overflow-hidden"
                >
                  {/* Header — icon, badge, rating */}
                  <div className="p-6 pb-0 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/60 flex items-center justify-center ring-1 ring-amber-100 shrink-0 group-hover:scale-105 transition-transform">
                        <ProductIcon className="w-6 h-6 text-[#F2BA03]" />
                      </div>
                      {prod.badge && (
                        <span className="px-2.5 py-1 bg-[#F2BA03] text-[#1B1C1C] font-bold rounded-full text-[10px] uppercase tracking-wider whitespace-nowrap shrink-0">
                          {prod.badge}
                        </span>
                      )}
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-[#0F0F0F] leading-snug">
                        {prod.title}
                      </h3>
                      {prod.rating && (
                        <div className="flex items-center gap-1 mt-1.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-[#F2BA03] text-[#F2BA03]" />
                          ))}
                          <span className="text-[#5D5F5F] font-medium text-[11px] ml-1">{prod.rating}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Body — short description only; full details live in the modal */}
                  <div className="p-6 pt-4 flex-1 space-y-3">
                    <p className="text-[#5D5F5F] text-sm leading-relaxed line-clamp-3">
                      {prod.desc}
                    </p>

                    {hasMoreDetails && (
                      <button
                        onClick={() => setFeaturesModalProductId(prod.id)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-[#0F0F0F] underline decoration-[#F2BA03] decoration-2 underline-offset-4 hover:text-[#F2BA03] cursor-pointer"
                      >
                        See all features
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Bottom Price & CTA — pinned to the card's bottom edge */}
                  <div className="mt-auto px-6 py-4 bg-neutral-50/80 border-t border-neutral-100 space-y-3">
                    <div>
                      {prod.price ? (
                        <>
                          <span className="text-[10px] font-medium tracking-widest text-[#9CA3AF] uppercase block">
                            Price
                          </span>
                          <span className="text-lg font-semibold text-[#3F3F3F]">
                            {prod.price}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs font-semibold text-[#5D5F5F]">Custom pricing available</span>
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
                      className="btn-shimmer w-full h-[42px] bg-[#0F0F0F] hover:bg-[#F2BA03] hover:shadow-[0_8px_20px_rgba(242,186,3,0.4)] hover:-translate-y-0.5 text-white hover:text-[#0F0F0F] font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-xs"
                    >
                      <span>{prod.cta}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                );
              })}
            </div>

          </div>
        </section>

        {/* Product Features Modal — full "Ideal For" + "Features" detail on demand */}
        {featuresModalProductId !== null && (() => {
          const prod = products.find((p) => p.id === featuresModalProductId);
          if (!prod) return null;
          const ProductIcon = prod.icon;
          return (
            <div
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
              onClick={() => setFeaturesModalProductId(null)}
            >
              <div
                className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100/60 flex items-center justify-center ring-1 ring-amber-100 shrink-0">
                      <ProductIcon className="w-6 h-6 text-[#F2BA03]" />
                    </div>
                    <h3 className="text-lg font-extrabold text-[#0F0F0F] leading-snug">
                      {prod.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => setFeaturesModalProductId(null)}
                    className="p-1 text-neutral-400 hover:text-neutral-900 rounded-lg cursor-pointer shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-[#5D5F5F] text-sm leading-relaxed">
                  {prod.desc}
                </p>

                {prod.idealFor && prod.idealFor.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold tracking-widest text-[#9CA3AF] uppercase block">
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
                )}

                {prod.features && prod.features.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold tracking-widest text-[#9CA3AF] uppercase block">
                      Features
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {prod.features.map((f) => (
                        <div key={f} className="flex items-center gap-2">
                          <Check className="w-3.5 h-3.5 text-[#F2BA03] stroke-[3] shrink-0" />
                          <span className="text-[#1B1C1C] text-sm">{f}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })()}


        {/* 4. WHAT'S IN THE BOX SECTION */}
        <section className="py-16 sm:py-20 bg-white border-t border-neutral-100">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F2BA03]/15 border border-[#F2BA03]/40">
                <Package className="w-3.5 h-3.5 text-[#B58500]" />
                <span className="font-mono text-xs font-bold tracking-wider text-[#B58500] uppercase">
                  WHAT'S IN THE BOX
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#0F0F0F] font-sans">
                Everything You Need, Included
              </h2>
              <p className="text-[#5D5F5F] text-base sm:text-lg">
                No hidden add-ons or renewal fees — every order ships ready to activate.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
              {boxContents.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="h-full bg-neutral-50/70 border border-neutral-200 rounded-2xl p-5 flex flex-col gap-3 hover:border-[#F2BA03]/50 hover:shadow-md transition-all">
                  <div className="w-11 h-11 rounded-xl bg-[#F2BA03]/15 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-[#B58500]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-[#0F0F0F] leading-snug">{title}</h3>
                    <p className="text-sm text-[#5D5F5F] leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>


        {/* 5. NEED MORE THAN ONE? CTA SECTION */}
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
              className="btn-shimmer inline-flex items-center gap-2 h-[52px] px-8 bg-[#F2BA03] hover:bg-[#e0ac00] hover:shadow-[0_8px_24px_rgba(242,186,3,0.45)] hover:-translate-y-0.5 text-[#1B1C1C] font-bold text-sm sm:text-base uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer active:scale-95"
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
