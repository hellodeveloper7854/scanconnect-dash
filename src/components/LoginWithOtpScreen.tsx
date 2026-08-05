import React from 'react';
import { MessageSquare, Mail, ShieldCheck } from 'lucide-react';
import { ScreenType } from '../types';

interface LoginWithOtpScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onSelectOtpLogin: () => void;
}

export const LoginWithOtpScreen: React.FC<LoginWithOtpScreenProps> = ({ onNavigate, onSelectOtpLogin }) => {
  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex items-center justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
        
        {/* Left Column - Access Dashboard Branding */}
        <div className="lg:col-span-6 flex flex-col items-start space-y-6">
          {/* Back Button */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-[#F2BA03] font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer border border-[#F2BA03]/30 shadow-md"
          >
            ← Back to How it works
          </button>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#F2BA03] text-neutral-950 text-xs font-black tracking-widest uppercase shadow-[0_0_15px_rgba(242,186,3,0.35)] -skew-x-12">
            <span className="skew-x-12 block">NETWORK CONNECTED</span>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-[48px] font-extrabold tracking-[-0.64px] text-white uppercase italic leading-[47px] font-sans">
              ACCESS <br />
              YOUR <br />
              <span className="text-[#F2BA03] not-italic font-black block mt-1 drop-shadow-[0_2px_12px_rgba(242,186,3,0.35)]">
                DASHBOARD
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-[#E2E2E2] text-lg sm:text-[20px] leading-[26px] max-w-xl font-normal">
            The heartbeat of your vehicle in the palm of your hand. Secure, fast, and unified.
          </p>
        </div>

        {/* Right Column - Glassmorphic Options Card */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end w-full">
          <div className="w-full max-w-[480px] bg-white/[0.08] backdrop-blur-[6px] border border-white/10 rounded-xl p-8 sm:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] flex flex-col gap-6 relative overflow-hidden">
            
            {/* Top Indicator */}
            <div className="flex items-center justify-center gap-2 text-[#F2BA03] text-xs font-bold uppercase tracking-[0.6px] font-mono bg-black/40 py-2.5 px-4 rounded-lg border border-white/10">
              <ShieldCheck className="w-4 h-4 text-[#F2BA03]" />
              <span>END-TO-END ENCRYPTED SESSION</span>
            </div>

            {/* Login Options */}
            <div className="space-y-4">
              {/* Option 1: LOGIN WITH OTP */}
              <button
                type="button"
                onClick={onSelectOtpLogin}
                className="w-full h-[57px] bg-[#F2BA03] hover:bg-[#e0ac00] text-[#1B1C1C] font-extrabold text-base uppercase tracking-[1.6px] rounded-none shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <MessageSquare className="w-5 h-5 fill-[#1B1C1C] stroke-[#1B1C1C]" />
                <span>LOGIN WITH OTP</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-[1px] bg-white/20" />
                <span className="text-white/50 text-xs font-bold uppercase tracking-[0.6px]">
                  OR UTILIZE
                </span>
                <div className="flex-1 h-[1px] bg-white/20" />
              </div>

              {/* Option 2: LOGIN WITH EMAIL */}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="w-full h-[57px] bg-black hover:bg-neutral-900 border border-white/20 text-white font-normal text-base uppercase tracking-[1.6px] rounded-none transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <Mail className="w-5 h-5 text-[#F2BA03]" />
                <span>LOGIN WITH EMAIL</span>
              </button>
            </div>

            {/* Footer Navigation Link */}
            <div className="text-center text-xs text-neutral-400 font-medium">
              New to the network?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="text-[#F2BA03] font-bold hover:underline underline-offset-4 ml-1 cursor-pointer"
              >
                Register Now
              </button>
            </div>

            {/* Terms disclaimer */}
            <div className="pt-4 border-t border-white/10 text-center">
              <p className="text-[9px] text-neutral-400 uppercase tracking-widest leading-relaxed font-mono">
                BY CONTINUING, YOU AGREE TO SCAN CONNECT&apos;S{' '}
                <span className="text-[#F2BA03] underline cursor-pointer">TERMS OF SERVICE</span> &{' '}
                <span className="text-[#F2BA03] underline cursor-pointer">PRIVACY POLICY</span>
              </p>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

