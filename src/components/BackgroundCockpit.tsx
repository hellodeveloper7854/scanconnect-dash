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
          className="w-full h-full object-cover object-center scale-105 filter brightness-[0.7] contrast-[1.15] blur-[0.5px] transform transition-transform duration-1000"
        />
        {/* Dark vignette and yellow glowing ambient lighting accents */}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/60 to-neutral-950/40" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-black/80" />
        
        {/* Subtle dashboard glow simulation */}
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 w-80 h-80 bg-amber-400/5 rounded-full blur-[100px] pointer-events-none" />
      </div>

      {/* Main Content Overlay */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
};
