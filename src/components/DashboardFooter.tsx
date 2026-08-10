import React, { useState } from 'react';
import { Youtube, Instagram, Facebook, Twitter, Linkedin, ChevronDown } from 'lucide-react';

export const DashboardFooter: React.FC = () => {
  const [guidesOpen, setGuidesOpen] = useState(false);

  return (
    <footer className="relative bg-[#F2BA03] text-white pt-20 pb-12 overflow-hidden">
      {/* Top Slanted Diagonal Border */}
      <div
        className="absolute top-0 inset-x-0 h-16 bg-white pointer-events-none"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 100%)' }}
      />
      {/* An alternative crisp slope clip on the footer itself or top white overlay */}
      <div 
        className="absolute top-0 left-0 right-0 h-16 bg-white pointer-events-none"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 12px, 0 54px)' }}
      />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 pt-4">
        
        {/* Top Tagline & Social Icons */}
        <div className="mb-14 space-y-6">
          <p className="text-base sm:text-lg font-semibold text-white/95 max-w-xl leading-snug">
            Privacy-first contact tags for vehicles. Made in India by Creative Frame Works Pvt Ltd.
          </p>

          {/* Social Icons - Dark Olive Circles with White Icons */}
          <div className="flex items-center space-x-3.5">
            {[
              { Icon: Youtube, label: 'YouTube', href: '#' },
              { Icon: Instagram, label: 'Instagram', href: '#' },
              { Icon: Facebook, label: 'Facebook', href: '#' },
              { Icon: Twitter, label: 'Twitter', href: '#' },
              { Icon: Linkedin, label: 'LinkedIn', href: '#' },
            ].map(({ Icon, label, href }, idx) => (
              <a
                key={idx}
                href={href}
                onClick={(e) => {
                  e.preventDefault();
                  alert(`Visit SCAN CONNECT on ${label}`);
                }}
                className="w-10 h-10 rounded-full bg-[#524500] hover:bg-[#3d3300] text-white flex items-center justify-center transition-transform hover:scale-105 cursor-pointer shadow-xs"
                title={label}
              >
                <Icon className="w-5 h-5" strokeWidth={2} />
              </a>
            ))}
          </div>
        </div>

        {/* 5 Column Link Section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 pb-12">
          {/* Column 1: SHOP */}
          <div className="space-y-4">
            <h4 className="text-base font-black tracking-wider text-white uppercase font-sans">
              SHOP
            </h4>
            <ul className="space-y-3 text-sm font-medium text-white/90">
              {[
                { label: 'Bike tag', href: '/shop?product=2' },
                { label: 'Car SCAN ME tag', href: '/shop?product=1' },
                { label: 'How it works', href: '/' },
                { label: 'eTag', href: '/shop#products' },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className="hover:underline cursor-pointer text-left">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: ABOUT */}
          <div className="space-y-4">
            <h4 className="text-base font-black tracking-wider text-white uppercase font-sans">
              ABOUT
            </h4>
            <ul className="space-y-3 text-sm font-medium text-white/90">
              {[
                { label: 'Contact', href: '/contact' },
                { label: 'Become a reseller', href: null },
                { label: 'Investors', href: '/investors' },
                { label: 'Blog', href: '/blog' },
              ].map(({ label, href }) => (
                <li key={label}>
                  {href ? (
                    <a href={href} className="hover:underline cursor-pointer text-left">
                      {label}
                    </a>
                  ) : (
                    <button onClick={() => alert(`About: ${label}`)} className="hover:underline cursor-pointer text-left">
                      {label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: ALL AUTO TOOLS */}
          <div className="space-y-4">
            <h4 className="text-base font-black tracking-wider text-white uppercase font-sans">
              ALL AUTO TOOLS
            </h4>
            <ul className="space-y-3 text-sm font-medium text-white/90">
              {[
                'Car loan calculator',
                'Fuel prices',
                'Contact parked car owner',
                'Auto FAQ',
              ].map((link) => (
                <li key={link}>
                  <button onClick={() => alert(`Tool: ${link}`)} className="hover:underline cursor-pointer text-left">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: PRIVACY POLICY */}
          <div className="space-y-4">
            <h4 className="text-base font-black tracking-wider text-white uppercase font-sans">
              PRIVACY POLICY
            </h4>
            <ul className="space-y-3 text-sm font-medium text-white/90">
              {['Terms & conditions', 'Refund & returns', 'Shipping policy'].map((link) => (
                <li key={link}>
                  <button onClick={() => alert(`Policy: ${link}`)} className="hover:underline cursor-pointer text-left">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: CONTACT */}
          <div className="space-y-4">
            <h4 className="text-base font-black tracking-wider text-white uppercase font-sans">
              CONTACT
            </h4>
            <ul className="space-y-3 text-sm font-medium text-white/90">
              <li>
                <a href="mailto:rj@sampark.me" className="hover:underline block">
                  rj@sampark.me
                </a>
              </li>
              <li>
                <a href="tel:08047359856" className="hover:underline block">
                  080-473-59856
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Thin Horizontal Divider Line */}
        <div className="border-t border-white/60 my-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-semibold text-white/95">
          <div className="relative">
            <button
              onClick={() => setGuidesOpen(!guidesOpen)}
              className="flex items-center gap-2 hover:underline cursor-pointer"
            >
              <span>Guides & articles</span>
              <span className="text-[10px]">▼</span>
            </button>
            {guidesOpen && (
              <div className="absolute left-0 bottom-full mb-2 w-56 bg-neutral-900 text-white rounded-xl p-3.5 shadow-2xl text-xs space-y-2 z-50">
                <p className="font-bold border-b border-neutral-700 pb-1 text-[#f5b800]">Popular Guides:</p>
                <p className="hover:text-[#f5b800] cursor-pointer" onClick={() => alert('Guide 1: How ScanConnect Masks Calls')}>
                  • How Masked Calls Work
                </p>
                <p className="hover:text-[#f5b800] cursor-pointer" onClick={() => alert('Guide 2: Parking Ethics in High Density Cities')}>
                  • Parking Ethics in Cities
                </p>
                <p className="hover:text-[#f5b800] cursor-pointer" onClick={() => alert('Guide 3: FASTag and Challan Integration')}>
                  • FASTag & Challan Setup
                </p>
              </div>
            )}
          </div>

          <p className="text-white/90">
            © 2026 SCAN CONNECT - Creative Frame Works Pvt Ltd
          </p>
        </div>

      </div>
    </footer>
  );
};

