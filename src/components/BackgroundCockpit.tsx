import React from 'react';
import cockpitBgAsset from '../assets/images/luxury_cockpit_bg_1785132622178.jpg';

export const BackgroundCockpit: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cockpitBg = typeof cockpitBgAsset === 'string' ? cockpitBgAsset : '/src/assets/images/luxury_cockpit_bg_1785132622178.jpg';

  return (
    <div className="relative min-h-screen w-full bg-neutral-950 text-white font-sans overflow-x-hidden selection:bg-amber-400 selection:text-black">
      {/* Background Image Container */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src={cockpitBg}
          alt="Luxury Vehicle Interior Cockpit"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center"
        />
        {/* Subtle dark overlay for text legibility */}
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Main Content Overlay */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
};
