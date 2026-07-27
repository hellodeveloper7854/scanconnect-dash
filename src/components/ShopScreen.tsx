import React, { useState } from 'react';
import { UserFormData } from '../types';
import { DashboardHeader } from './DashboardHeader';
import { DashboardFooter } from './DashboardFooter';
import {
  Building2,
  ShoppingBag,
  Plane,
  ShoppingCart,
  Train,
  GraduationCap,
  ArrowRight,
  Truck,
  CheckCircle,
  QrCode,
  ShieldCheck,
  Plus
} from 'lucide-react';

interface ShopScreenProps {
  userData: UserFormData;
  onLogout: () => void;
  onNavigate: (nav: string) => void;
}

export const ShopScreen: React.FC<ShopScreenProps> = ({
  userData,
  onLogout,
  onNavigate,
}) => {
  const [activeNav, setActiveNav] = useState('Shop');
  const [visibleProductsCount, setVisibleProductsCount] = useState(6);
  const [cartCount, setCartCount] = useState(0);

  const handleHeaderNav = (navItem: string) => {
    setActiveNav(navItem);
    if (navItem === 'How it works' || navItem === 'QR Scan') {
      onNavigate('dashboard');
    } else if (navItem === 'About' || navItem === 'about') {
      onNavigate('about');
    } else if (navItem === 'Shop' || navItem === 'shop') {
      onNavigate('shop');
    } else if (navItem === 'Contact' || navItem === 'contact') {
      onNavigate('contact');
    } else if (navItem === 'Profile' || navItem === 'profile') {
      onNavigate('profile');
    } else {
      alert(`Navigating to ${navItem}`);
    }
  };

  const ecosystemServices = [
    {
      id: 'councils',
      icon: Building2,
      title: 'Councils &\nMunicipalities',
      desc: 'Smart parking management for faster, easier, and denser urban parking. Our models are specifically designed to meet the high-density demands of city centers.',
    },
    {
      id: 'retail',
      icon: ShoppingBag,
      title: 'Shopping Centres &\nRetail',
      desc: 'Enhancing the shopping experience with convenient parking and data-driven footfall insights to maximize merchant revenue and customer loyalty.',
    },
    {
      id: 'airports',
      icon: Plane,
      title: 'Airports',
      desc: 'Digital innovation transforming airport vehicle parking with real-time capacity monitoring and automated revenue management for travelers.',
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
    {
      id: 'universities',
      icon: GraduationCap,
      title: 'Universities &\nEducation',
      desc: 'Cloud-based systems to streamline and automate parking management for staff and students with real-time analytics and online payments.',
    },
  ];

  const initialProducts = [
    {
      id: 1,
      tag: 'PREMIUM PACK',
      rating: '4.4',
      title: '(Pack of 2)Car SCAN CONNECT tag',
      desc: 'Let people call you for any issues with your parked car without sharing your phone number.',
      price: '₹499',
    },
    {
      id: 2,
      tag: 'PREMIUM PACK',
      rating: '4.4',
      title: '(Pack of 2)Car SCAN CONNECT tag',
      desc: 'Let people call you for any issues with your parked car without sharing your phone number.',
      price: '₹499',
    },
    {
      id: 3,
      tag: 'PREMIUM PACK',
      rating: '4.4',
      title: '(Pack of 2)Car SCAN CONNECT tag',
      desc: 'Let people call you for any issues with your parked car without sharing your phone number.',
      price: '₹499',
    },
    {
      id: 4,
      tag: 'PREMIUM PACK',
      rating: '4.4',
      title: '(Pack of 2)Car SCAN CONNECT tag',
      desc: 'Let people call you for any issues with your parked car without sharing your phone number.',
      price: '₹499',
    },
    {
      id: 5,
      tag: 'PREMIUM PACK',
      rating: '4.4',
      title: '(Pack of 2)Car SCAN CONNECT tag',
      desc: 'Let people call you for any issues with your parked car without sharing your phone number.',
      price: '₹499',
    },
    {
      id: 6,
      tag: 'PREMIUM PACK',
      rating: '4.4',
      title: '(Pack of 2)Car SCAN CONNECT tag',
      desc: 'Let people call you for any issues with your parked car without sharing your phone number.',
      price: '₹499',
    },
    {
      id: 7,
      tag: 'BIKE SPECIAL',
      rating: '4.8',
      title: 'Bike & Scooter SCAN CONNECT Tag',
      desc: 'Waterproof slim helmet/handlebar contact sticker for two-wheelers with instant call routing.',
      price: '₹299',
    },
    {
      id: 8,
      tag: 'FAMILY PACK',
      rating: '4.9',
      title: '(Pack of 4) Multi-Vehicle Scan Tag',
      desc: 'Complete household package for 2 Cars + 2 Bikes with centralized privacy management dashboard.',
      price: '₹899',
    },
    {
      id: 9,
      tag: 'COMMERCIAL',
      rating: '4.7',
      title: 'Fleet & Commercial Vehicle QR Tag',
      desc: 'Heavy-duty reflective sticker for commercial trucks, taxis and delivery vans.',
      price: '₹699',
    },
  ];

  const handleAddToCart = (title: string) => {
    setCartCount((prev) => prev + 1);
    alert(`Added to Cart: ${title}\nTotal items in cart: ${cartCount + 1}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-neutral-900 font-sans antialiased">
      {/* Top Header */}
      <DashboardHeader
        userData={userData}
        onLogout={onLogout}
        activeNav={activeNav}
        onNavClick={handleHeaderNav}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* 1. SHOP HERO BANNER SECTION */}
        <section className="py-12 sm:py-16 bg-[#fbfbfe]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Left Column Text */}
              <div className="lg:col-span-6 space-y-5">
                <span className="text-xs font-bold tracking-wider text-neutral-500 uppercase font-mono block">
                  &gt; SHOP
                </span>

                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-neutral-950 tracking-tight leading-[1.08] font-sans">
                  Smart Protection <br />
                  <span className="text-[#f5b800]">for your commute.</span>
                </h1>

                <p className="text-neutral-600 text-sm sm:text-base leading-relaxed max-w-lg font-normal">
                  One-time purchase, lifetime security. Professional privacy-first contact tags for your car and bike. Free express delivery on all orders.
                </p>

                {/* Badges Pill Row */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-neutral-200 rounded-full text-xs font-bold text-neutral-800 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>950,000+ Tags Active</span>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white border border-neutral-200 rounded-full text-xs font-bold text-neutral-800 shadow-2xs">
                    <Truck className="w-4 h-4 text-neutral-600" />
                    <span>Free Delivery</span>
                  </div>
                </div>
              </div>

              {/* Right Column Graphic Vector Illustration */}
              <div className="lg:col-span-6 flex justify-center lg:justify-end">
                <div className="relative w-full max-w-lg bg-gradient-to-tr from-amber-50/50 via-sky-50/30 to-amber-100/40 rounded-3xl p-6 sm:p-8 flex items-center justify-center border border-neutral-100 shadow-xs">
                  
                  {/* Custom Graphic Scene */}
                  <div className="relative w-full flex items-end justify-between gap-4 py-4">
                    
                    {/* Sleek Red Car Vector */}
                    <div className="w-1/2 relative z-10">
                      <div className="bg-red-600 rounded-2xl p-4 shadow-xl text-white space-y-2 border-2 border-red-700 transform -rotate-1">
                        <div className="flex items-center justify-between border-b border-red-500/60 pb-2">
                          <span className="text-[10px] font-black uppercase tracking-wider font-mono bg-neutral-950 px-2 py-0.5 rounded text-[#f5b800]">
                            MH12-9881
                          </span>
                          <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping" />
                        </div>
                        <div className="h-16 bg-neutral-900 rounded-xl p-2 flex items-center justify-center border border-red-500/40">
                          <div className="w-12 h-12 bg-[#f5b800] rounded-lg p-1 text-neutral-950 flex flex-col items-center justify-center">
                            <QrCode className="w-8 h-8" />
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-around px-4 -mt-2">
                        <div className="w-8 h-8 rounded-full bg-neutral-900 border-2 border-neutral-700 shadow-md" />
                        <div className="w-8 h-8 rounded-full bg-neutral-900 border-2 border-neutral-700 shadow-md" />
                      </div>
                    </div>

                    {/* Smartphone Map Route */}
                    <div className="w-2/5 bg-amber-500 rounded-3xl p-3 shadow-2xl border-4 border-amber-600 text-neutral-950 relative z-20 transform rotate-2">
                      <div className="w-8 h-1 bg-amber-700 rounded-full mx-auto mb-2" />
                      <div className="bg-white rounded-2xl p-3 shadow-inner space-y-2 text-[10px]">
                        <div className="flex items-center gap-1.5 font-bold text-neutral-900">
                          <ShieldCheck className="w-4 h-4 text-emerald-600" />
                          <span>Protected Scan</span>
                        </div>
                        <div className="h-20 bg-sky-50 rounded-xl border border-sky-100 relative p-2 overflow-hidden">
                          {/* Route line */}
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full h-1 bg-amber-400 transform -rotate-12" />
                          </div>
                          <div className="relative z-10 w-4 h-4 bg-red-600 rounded-full text-white flex items-center justify-center text-[8px] font-bold shadow-md">
                            📍
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Commuter Person Illustration */}
                    <div className="w-1/4 flex flex-col items-center justify-end z-30">
                      <div className="w-10 h-10 rounded-full bg-amber-800 text-white flex items-center justify-center font-bold text-xs shadow-md">
                        👤
                      </div>
                      <div className="w-8 h-16 bg-blue-900 rounded-t-xl mt-1 shadow-sm" />
                    </div>

                  </div>

                </div>
              </div>

            </div>
          </div>
        </section>


        {/* 2. SERVICE ECOSYSTEM SECTION */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Header Badge & Titles */}
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
              <span className="inline-block px-4 py-1 bg-[#f5b800] text-neutral-950 text-xs font-black uppercase tracking-widest rounded-full shadow-2xs font-mono">
                Our Reach
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 font-sans">
                Service Ecosystem
              </h2>

              <p className="text-neutral-600 text-sm sm:text-base leading-relaxed font-normal">
                Intelligent parking solutions tailored for every stakeholder. From urban municipalities to private retail giants, SCAN ME streamlines the digital physical transition.
              </p>
            </div>

            {/* 6 Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {ecosystemServices.map((svc) => {
                const IconComp = svc.icon;
                return (
                  <div
                    key={svc.id}
                    className="bg-white border border-neutral-200/90 rounded-2xl p-8 sm:p-10 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between items-center text-center space-y-6"
                  >
                    <div className="flex flex-col items-center space-y-4">
                      {/* Circle Icon */}
                      <div className="w-16 h-16 rounded-full bg-amber-50 border border-[#f5b800]/40 flex items-center justify-center text-[#f5b800]">
                        <IconComp className="w-7 h-7 stroke-[2]" />
                      </div>

                      {/* Card Title */}
                      <h3 className="text-xl font-bold text-neutral-900 leading-tight whitespace-pre-line">
                        {svc.title}
                      </h3>

                      {/* Card Body */}
                      <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed max-w-xs">
                        {svc.desc}
                      </p>
                    </div>

                    {/* Learn More Link */}
                    <button
                      onClick={() => alert(`Details for ecosystem: ${svc.title.replace('\n', ' ')}`)}
                      className="text-xs font-bold text-[#f5b800] hover:text-[#d19d00] tracking-wider uppercase inline-flex items-center gap-1.5 cursor-pointer pt-2"
                    >
                      <span>LEARN MORE</span> <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>

          </div>
        </section>


        {/* 3. OUR PRODUCT SECTION */}
        <section className="py-20 bg-neutral-50/70 border-t border-neutral-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Section Header */}
            <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-neutral-900 font-sans">
                Our Product
              </h2>

              <p className="text-neutral-600 text-sm sm:text-base leading-relaxed font-normal">
                Intelligent parking solutions tailored for every stakeholder. From urban municipalities to private retail giants, SCAN ME streamlines the digital physical transition.
              </p>
            </div>

            {/* Product Cards Grid (3 cards per row) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {initialProducts.slice(0, visibleProductsCount).map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white border border-neutral-200/90 rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-5 group"
                >
                  {/* Top Product Image Graphic Box */}
                  <div className="bg-[#f5b800] rounded-2xl p-6 flex flex-col items-center justify-center relative overflow-hidden aspect-square border border-amber-400/60 shadow-inner">
                    {/* Simulated Tag Decal */}
                    <div className="bg-white text-neutral-900 rounded-2xl p-4 shadow-xl border-2 border-neutral-950 w-full max-w-[220px] flex flex-col items-center space-y-3">
                      {/* Big QR Code */}
                      <div className="w-32 h-32 bg-neutral-950 p-2 rounded-xl flex items-center justify-center border border-neutral-800">
                        <QrCode className="w-full h-full text-[#f5b800]" />
                      </div>

                      {/* NGF132 Logo */}
                      <span className="text-[10px] font-black tracking-wider uppercase font-mono text-neutral-800">
                        NGF132
                      </span>

                      {/* Icon Strip */}
                      <div className="w-full border-t border-neutral-200 pt-2 flex items-center justify-around text-neutral-800 text-[10px] font-bold">
                        <span title="Parking Alert">🏠</span>
                        <span title="No Parking">🚫</span>
                        <span title="Emergency">⚠️</span>
                        <span title="Call Owner">📞</span>
                      </div>
                      <p className="text-[8px] text-center font-semibold text-neutral-600 leading-tight">
                        Wrong Parking, Emergency Contact, any issue with the vehicle, Scan the QR.
                      </p>
                    </div>
                  </div>

                  {/* Badge & Rating Row */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="px-3 py-1 bg-neutral-100 text-neutral-700 font-bold rounded-full text-[10px] uppercase tracking-wider">
                      {prod.tag}
                    </span>
                    <span className="font-extrabold text-amber-500 flex items-center gap-1 font-mono text-xs">
                      ★ {prod.rating}
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-extrabold text-neutral-950 leading-snug">
                      {prod.title}
                    </h3>
                    <p className="text-neutral-500 text-xs leading-relaxed">
                      {prod.desc}
                    </p>
                  </div>

                  {/* Bottom Price & Add to Cart Button */}
                  <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase font-mono block">
                        PRICE
                      </span>
                      <span className="text-2xl font-black text-neutral-950 font-sans">
                        {prod.price}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(prod.title)}
                      className="w-12 h-12 rounded-full bg-neutral-950 hover:bg-[#f5b800] hover:text-neutral-950 text-white flex items-center justify-center transition-all cursor-pointer shadow-md group-hover:scale-105"
                      title="Add to cart"
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom "See More >" Button */}
            {visibleProductsCount < initialProducts.length && (
              <div className="flex justify-start pt-4">
                <button
                  onClick={() => setVisibleProductsCount(initialProducts.length)}
                  className="px-6 py-3 bg-[#f5b800] hover:bg-amber-400 text-neutral-950 font-extrabold text-sm uppercase tracking-wider rounded-xl shadow-sm transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>See More</span> &gt;
                </button>
              </div>
            )}

          </div>
        </section>

      </main>

      {/* Footer */}
      <DashboardFooter />
    </div>
  );
};
