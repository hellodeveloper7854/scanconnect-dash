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
  Truck,
  ShieldCheck,
  Star,
  Package
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
  const [cartCount, setCartCount] = useState(0);
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
      title: '(Pack of 2) Car SCAN CONNECT tag',
      desc: 'Let people call you for any issues with your parked car without sharing your phone number.',
      price: '₹499',
    },
    {
      id: 2,
      tag: 'PREMIUM PACK',
      rating: '4.4',
      title: '(Pack of 2) Car SCAN CONNECT tag',
      desc: 'Let people call you for any issues with your parked car without sharing your phone number.',
      price: '₹499',
    },
    {
      id: 3,
      tag: 'PREMIUM PACK',
      rating: '4.4',
      title: '(Pack of 2) Car SCAN CONNECT tag',
      desc: 'Let people call you for any issues with your parked car without sharing your phone number.',
      price: '₹499',
    },
    {
      id: 4,
      tag: 'PREMIUM PACK',
      rating: '4.4',
      title: '(Pack of 2) Car SCAN CONNECT tag',
      desc: 'Let people call you for any issues with your parked car without sharing your phone number.',
      price: '₹499',
    },
    {
      id: 5,
      tag: 'PREMIUM PACK',
      rating: '4.4',
      title: '(Pack of 2) Car SCAN CONNECT tag',
      desc: 'Let people call you for any issues with your parked car without sharing your phone number.',
      price: '₹499',
    },
    {
      id: 6,
      tag: 'PREMIUM PACK',
      rating: '4.4',
      title: '(Pack of 2) Car SCAN CONNECT tag',
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

                <h1 className="text-3xl sm:text-4xl lg:text-[42px] lg:leading-[1.15] font-black text-[#0F0F0F] tracking-tight font-sans">
                  Smart Protection <br />
                  <span className="text-[#F2BA03]">for your commute.</span>
                </h1>

                <p className="text-[#5D5F5F] text-base sm:text-lg leading-relaxed font-normal max-w-xl">
                  One-time purchase, lifetime security. Professional privacy-first contact tags for your car and bike. Free express delivery on all orders.
                </p>

                {/* Badges Pill Row */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-neutral-200 rounded-full text-xs font-bold text-[#0F0F0F] shadow-xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>950,000+ Tags Active</span>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-neutral-200 rounded-full text-xs font-bold text-[#0F0F0F] shadow-xs">
                    <Truck className="w-4 h-4 text-[#0F0F0F]" />
                    <span>Free Delivery</span>
                  </div>
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
          </div>
        </section>


        {/* 2. SERVICE ECOSYSTEM SECTION */}
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
                Service Ecosystem
              </h2>

              <p className="text-[#5D5F5F] text-base sm:text-lg leading-relaxed font-normal">
                Intelligent parking solutions tailored for every stakeholder. From urban municipalities to private retail giants, SCAN CONNECT streamlines the digital physical transition.
              </p>
            </div>

            {/* 6 Grid Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {ecosystemServices.map((svc) => {
                const IconComp = svc.icon;
                return (
                  <div
                    key={svc.id}
                    className="bg-white border border-[#CCC7AA] rounded-2xl p-8 sm:p-10 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between items-center text-center space-y-6 group"
                  >
                    <div className="flex flex-col items-center space-y-4">
                      {/* Circle Icon */}
                      <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center text-[#F2BA03] group-hover:scale-110 transition-transform">
                        <IconComp className="w-7 h-7 stroke-[2.2]" />
                      </div>

                      {/* Card Title */}
                      <h3 className="text-2xl font-semibold text-[#0F0F0F] leading-tight whitespace-pre-line">
                        {svc.title}
                      </h3>

                      {/* Card Body */}
                      <p className="text-[#5D5F5F] text-base leading-relaxed max-w-xs">
                        {svc.desc}
                      </p>
                    </div>

                    {/* Learn More Link */}
                    <button
                      onClick={() => alert(`Details for ecosystem: ${svc.title.replace('\n', ' ')}`)}
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


        {/* 3. OUR PRODUCT SECTION */}
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
                Our Products
              </h2>

              <p className="text-[#5D5F5F] text-base sm:text-lg leading-relaxed font-normal">
                Intelligent parking contact tags tailored for cars, bikes, households, and commercial fleets. Instant call routing with maximum privacy protection.
              </p>
            </div>

            {/* Product Cards Grid (3 cards per row) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
              {initialProducts.slice(0, visibleProductsCount).map((prod) => (
                <div
                  key={prod.id}
                  className="bg-white border border-neutral-200 rounded-3xl p-5 sm:p-6 shadow-xs hover:shadow-xl transition-all flex flex-col justify-between space-y-5 group"
                >
                  {/* Top Product Image Graphic Box */}
                  <div
                    onClick={() => setSelectedProduct(prod)}
                    className="rounded-2xl flex items-center justify-center relative overflow-hidden aspect-square cursor-pointer"
                  >
                    <img
                      src={qrImage}
                      alt={prod.title}
                      className="h-full w-auto object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  {/* Badge & Rating Row */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="px-3 py-1 bg-neutral-100 text-[#0F0F0F] font-mono font-bold rounded-full text-[10px] uppercase tracking-wider">
                      {prod.tag}
                    </span>
                    <span className="font-extrabold text-[#0F0F0F] flex items-center gap-1 font-mono text-xs">
                      <Star className="w-3.5 h-3.5 fill-[#F2BA03] text-[#F2BA03]" />
                      <span>{prod.rating}</span>
                    </span>
                  </div>

                  {/* Title & Desc */}
                  <div className="space-y-2 cursor-pointer" onClick={() => setSelectedProduct(prod)}>
                    <h3 className="text-lg font-extrabold text-[#0F0F0F] leading-snug group-hover:text-[#F2BA03] transition-colors">
                      {prod.title}
                    </h3>
                    <p className="text-[#5D5F5F] text-xs sm:text-sm leading-relaxed">
                      {prod.desc}
                    </p>
                  </div>

                  {/* Bottom Price & View Button */}
                  <div className="flex items-center justify-between pt-3">
                    <div>
                      <span className="text-[10px] font-bold tracking-widest text-[#5D5F5F] uppercase block">
                        PRICE
                      </span>
                      <span className="text-2xl font-black text-[#0F0F0F] font-sans">
                        {prod.price}
                      </span>
                    </div>

                    <button
                      onClick={() => setSelectedProduct(prod)}
                      className="w-11 h-11 rounded-full bg-[#0F0F0F] hover:bg-[#F2BA03] text-white hover:text-[#0F0F0F] transition-all cursor-pointer flex items-center justify-center active:scale-95"
                      title="View product details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom "See More" Button */}
            {visibleProductsCount < initialProducts.length && (
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => setVisibleProductsCount(initialProducts.length)}
                  className="h-[52px] px-8 bg-[#F2BA03] hover:bg-[#e0ac00] text-white font-bold text-lg rounded-lg shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                >
                  <span>See More</span>
                  <ChevronRight className="w-5 h-5" />
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

