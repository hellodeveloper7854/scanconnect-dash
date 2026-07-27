import React from 'react';
import { ScreenType } from '../types';
import { ShieldCheck, Car, KeyRound, UserPlus, PhoneCall, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  activeScreen: ScreenType;
  onSelectScreen: (screen: ScreenType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeScreen, onSelectScreen }) => {
  const screens: { id: ScreenType; label: string; icon: React.ReactNode }[] = [
    { id: 'register', label: 'Registration', icon: <UserPlus className="w-3.5 h-3.5" /> },
    { id: 'login', label: 'Login', icon: <KeyRound className="w-3.5 h-3.5" /> },
    { id: 'send-otp', label: 'Send OTP', icon: <PhoneCall className="w-3.5 h-3.5" /> },
    { id: 'login-options', label: 'Login with OTP', icon: <Car className="w-3.5 h-3.5" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-neutral-950/75 border-b border-white/10 px-4 lg:px-8 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo Brand */}
        <div 
          onClick={() => onSelectScreen('register')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-lg bg-amber-400 text-neutral-950 flex items-center justify-center font-black text-lg shadow-[0_0_15px_rgba(245,184,0,0.4)] group-hover:scale-105 transition-transform">
            SC
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg tracking-wider text-white uppercase font-mono">
                SCAN<span className="text-amber-400">CONNECT</span>
              </span>
              <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-1.5 py-0.5 rounded border border-amber-400/40 uppercase tracking-widest">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-medium -mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400 inline" /> Secure Automotive Network
            </p>
          </div>
        </div>

        {/* Screen Switcher Tabs */}
        <nav className="flex items-center gap-1 bg-neutral-900/80 p-1 rounded-xl border border-white/10 overflow-x-auto max-w-full">
          {screens.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectScreen(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-amber-400 text-neutral-950 shadow-[0_0_12px_rgba(245,184,0,0.3)] font-bold'
                    : 'text-neutral-300 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
