import React from 'react';
import { MessageSquare, Mail, ShieldCheck } from 'lucide-react';
import { ScreenType } from '../types';

interface LoginWithOtpScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onSelectOtpLogin: () => void;
}

export const LoginWithOtpScreen: React.FC<LoginWithOtpScreenProps> = ({ onNavigate, onSelectOtpLogin }) => {
  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 flex items-center justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
        
        {/* Left Column - Access Dashboard Branding */}
        <div className="lg:col-span-6 flex flex-col items-start space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-sm bg-amber-400 text-neutral-950 text-xs font-black tracking-widest uppercase shadow-[0_0_15px_rgba(245,184,0,0.3)]">
            NETWORK CONNECTED
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase italic leading-[0.95] font-sans">
              ACCESS <br />
              YOUR <br />
              <span className="text-amber-400 not-italic font-black block mt-1 drop-shadow-[0_2px_10px_rgba(245,184,0,0.3)]">
                DASHBOARD
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-neutral-300 text-base md:text-lg max-w-md font-normal leading-relaxed">
            The heartbeat of your vehicle in the palm of your hand. Secure, fast, and unified.
          </p>
        </div>

        {/* Right Column - Glassmorphic Options Card */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end w-full">
          <div className="w-full max-w-md bg-neutral-900/65 backdrop-blur-xl border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl flex flex-col gap-5 relative overflow-hidden">
            
            {/* Top Indicator */}
            <div className="flex items-center justify-center gap-1.5 text-amber-300 text-[10px] font-bold uppercase tracking-widest font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>END-TO-END ENCRYPTED SESSION</span>
            </div>

            {/* Login Options */}
            <div className="space-y-4">
              {/* Option 1: LOGIN WITH OTP */}
              <button
                type="button"
                onClick={onSelectOtpLogin}
                className="w-full py-4 px-5 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-widest rounded-xl shadow-lg shadow-amber-400/20 active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 fill-neutral-950" />
                <span>LOGIN WITH OTP</span>
              </button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[10px]">
                  <span className="bg-neutral-900/90 px-3 text-neutral-400 font-bold uppercase tracking-widest font-mono">
                    OR UTILIZE
                  </span>
                </div>
              </div>

              {/* Option 2: LOGIN WITH EMAIL */}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="w-full py-4 px-5 bg-black/80 hover:bg-black/90 border border-white/20 text-white font-bold text-xs sm:text-sm uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <Mail className="w-5 h-5 text-amber-400" />
                <span>LOGIN WITH EMAIL</span>
              </button>
            </div>

            {/* Footer Navigation Link */}
            <div className="mt-4 text-center text-xs text-neutral-400 font-medium">
              New to the network?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="text-amber-400 font-bold hover:underline underline-offset-4 ml-1 cursor-pointer"
              >
                Register Now
              </button>
            </div>

            {/* Terms disclaimer */}
            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <p className="text-[9px] text-neutral-500 uppercase tracking-widest leading-relaxed font-mono">
                BY CONTINUING, YOU AGREE TO SCAN CONNECT&apos;S{' '}
                <span className="text-amber-400 underline cursor-pointer">TERMS OF SERVICE</span> &{' '}
                <span className="text-amber-400 underline cursor-pointer">PRIVACY POLICY</span>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
