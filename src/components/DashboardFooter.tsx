import React, { useState } from 'react';
import { Youtube, Instagram, Facebook, Twitter, Linkedin, ChevronDown } from 'lucide-react';

export const DashboardFooter: React.FC = () => {
  const [guidesOpen, setGuidesOpen] = useState(false);

  return (
    <footer className="relative bg-[#f5b800] text-neutral-900 pt-16 pb-8 overflow-hidden">
      {/* Top Slanted Diagonal Accent */}
      <div 
        className="absolute top-0 inset-x-0 h-10 bg-white"
        style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 0)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-4">
        {/* Top Tagline & Social Icons */}
        <div className="mb-12">
          <p className="text-base sm:text-lg font-medium text-neutral-900 max-w-xl mb-6">
            Privacy-first contact tags for vehicles. Made in India by NGF132 Pvt Ltd.
          </p>

          {/* Social Icons */}
          <div className="flex items-center space-x-3">
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
                className="w-10 h-10 rounded-full bg-[#837000] text-[#f5b800] flex items-center justify-center hover:bg-neutral-900 hover:text-white transition-colors cursor-pointer"
                title={label}
              >
                <Icon className="w-5 h-5 fill-current" />
              </a>
            ))}
          </div>
        </div>

        {/* 5 Column Link Section */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-8 pb-12">
          {/* Column 1: SHOP */}
          <div>
            <h4 className="text-base font-black tracking-wider text-neutral-950 uppercase mb-4">
              SHOP
            </h4>
            <ul className="space-y-2.5 text-sm font-medium text-neutral-900">
              {['Car & Bike tag', 'Car SCAN ME tag', 'How it works', 'Free eTag'].map((link) => (
                <li key={link}>
                  <button onClick={() => alert(`Shop item: ${link}`)} className="hover:underline cursor-pointer">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 2: ABOUT */}
          <div>
            <h4 className="text-base font-black tracking-wider text-neutral-950 uppercase mb-4">
              ABOUT
            </h4>
            <ul className="space-y-2.5 text-sm font-medium text-neutral-900">
              {['Contact', 'Become a reseller', 'Franchise login', 'Investors', 'Blog'].map((link) => (
                <li key={link}>
                  <button onClick={() => alert(`About: ${link}`)} className="hover:underline cursor-pointer">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: ALL AUTO TOOLS */}
          <div>
            <h4 className="text-base font-black tracking-wider text-neutral-950 uppercase mb-4">
              ALL AUTO TOOLS
            </h4>
            <ul className="space-y-2.5 text-sm font-medium text-neutral-900">
              {[
                'Car loan calculator',
                'Fuel prices',
                'Contact parked car owner',
                'Car games',
                'Auto FAQ',
              ].map((link) => (
                <li key={link}>
                  <button onClick={() => alert(`Tool: ${link}`)} className="hover:underline cursor-pointer">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: PRIVACY POLICY */}
          <div>
            <h4 className="text-base font-black tracking-wider text-neutral-950 uppercase mb-4">
              PRIVACY POLICY
            </h4>
            <ul className="space-y-2.5 text-sm font-medium text-neutral-900">
              {['Terms & conditions', 'Refund & returns', 'Shipping policy'].map((link) => (
                <li key={link}>
                  <button onClick={() => alert(`Policy: ${link}`)} className="hover:underline cursor-pointer">
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: CONTACT */}
          <div>
            <h4 className="text-base font-black tracking-wider text-neutral-950 uppercase mb-4">
              CONTACT
            </h4>
            <ul className="space-y-2.5 text-sm font-medium text-neutral-900">
              <li>
                <a href="mailto:rj@sampark.me" className="hover:underline font-mono">
                  rj@sampark.me
                </a>
              </li>
              <li>
                <a href="tel:08047359856" className="hover:underline font-mono">
                  080-473-59856
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Horizontal Divider Line */}
        <div className="border-t border-neutral-900/20 my-6" />

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-neutral-900">
          <div className="relative">
            <button
              onClick={() => setGuidesOpen(!guidesOpen)}
              className="flex items-center gap-1.5 hover:underline cursor-pointer font-semibold"
            >
              <span>Guides & articles</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${guidesOpen ? 'rotate-180' : ''}`} />
            </button>
            {guidesOpen && (
              <div className="absolute left-0 bottom-full mb-2 w-56 bg-neutral-900 text-white rounded-lg p-3 shadow-xl text-xs space-y-1.5 z-50">
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

          <p className="text-neutral-900/80 font-mono">
            © 2026 SCAN CONNECT - NGF132 Pvt Ltd
          </p>
        </div>
      </div>
    </footer>
  );
};
