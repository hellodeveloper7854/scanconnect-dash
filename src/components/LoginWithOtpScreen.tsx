import React from 'react';
import { Phone, Mail, ShieldCheck } from 'lucide-react';
import { ScreenType } from '../types';

interface LoginWithOtpScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

export const LoginWithOtpScreen: React.FC<LoginWithOtpScreenProps> = ({ onNavigate }) => {
  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex items-center justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">

        {/* Left Column - Access Dashboard Branding */}
        <div className="lg:col-span-6 flex flex-col items-start space-y-6 relative">
          {/* Ambient glow blob */}
          <div className="absolute -left-10 -top-10 w-40 h-40 bg-[#695F00]/20 blur-[32px] rounded-full pointer-events-none" />

          {/* Back Button */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-[#F2BA03] font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer border border-[#F2BA03]/30 shadow-md relative z-10"
          >
            ← Back to How it works
          </button>

          {/* Badge */}
          <div className="inline-flex items-center px-3 py-1 bg-[#FEFE00] text-black text-xs font-bold tracking-[1.2px] uppercase relative z-10">
            NETWORK CONNECTED
          </div>

          {/* Heading */}
          <div className="relative z-10 -skew-x-[10deg]">
            <h1 className="text-[44px] sm:text-[60px] leading-[75px] text-white font-sans">
              <span className="font-semibold block">ACCESS</span>
              <span className="font-semibold block">YOUR</span>
              <span className="font-bold block text-[#F9E534]">DASHBOARD</span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-white text-base leading-[26px] max-w-xs font-normal relative z-10">
            The heartbeat of your vehicle in the palm of your hand. Secure, fast, and unified.
          </p>
        </div>

        {/* Right Column - Glassmorphic Options Card */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end w-full">
          <div className="w-full max-w-[440px] bg-white/10 backdrop-blur-[12px] border-2 border-white/30 shadow-[0px_8px_32px_rgba(0,0,0,0.3)] rounded-none p-12 flex flex-col gap-6 relative overflow-hidden">

            {/* Top Indicator */}
            <div className="flex items-center gap-2 text-white/60">
              <ShieldCheck className="w-3 h-4" />
              <span className="text-[10px] font-normal uppercase tracking-[1px]">END-TO-END ENCRYPTED SESSION</span>
            </div>

            {/* Login Options */}
            <div className="space-y-4">
              {/* Option 1: LOGIN WITH OTP */}
              <button
                type="button"
                onClick={() => onNavigate('send-otp')}
                className="w-full h-[60px] bg-[#F2BA03] hover:bg-[#e0ac00] text-black font-bold text-sm uppercase shadow-[0px_4px_0px_rgba(0,0,0,0.2)] active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <Phone className="w-5 h-5" />
                <span>LOGIN WITH OTP</span>
              </button>

              {/* Divider */}
              <div className="flex items-center gap-4 py-3">
                <div className="flex-1 h-[1px] bg-white/20" />
                <span className="text-white text-[10px] font-medium uppercase tracking-[2px]">
                  OR UTILIZE
                </span>
                <div className="flex-1 h-[1px] bg-white/20" />
              </div>

              {/* Option 2: LOGIN WITH EMAIL */}
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="w-full h-[62px] bg-white/10 hover:bg-white/15 border border-white/20 text-white font-bold text-sm uppercase transition-all flex items-center justify-center gap-3 cursor-pointer"
              >
                <Mail className="w-5 h-5 text-white" />
                <span>LOGIN WITH EMAIL</span>
              </button>
            </div>

            {/* Footer Navigation Link */}
            <div className="pt-8 border-t border-white/10 text-center text-base text-white/50 font-normal">
              New to the network?{' '}
              <button
                onClick={() => onNavigate('register')}
                className="text-[#F9E534] font-bold hover:underline underline-offset-4 ml-1 cursor-pointer"
              >
                Register Now
              </button>
            </div>

            {/* Terms disclaimer */}
            <div className="text-center">
              <p className="text-[10px] text-white/30 uppercase leading-[16px]">
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

