import React, { useState } from 'react';
import { Phone, ArrowRight } from 'lucide-react';
import { ScreenType } from '../types';

interface SendOtpScreenProps {
  onSendOtp: (mobileNumber: string) => void;
  onNavigate: (screen: ScreenType) => void;
}

export const SendOtpScreen: React.FC<SendOtpScreenProps> = ({ onSendOtp, onNavigate }) => {
  const [mobileNumber, setMobileNumber] = useState('9881860335');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSendOtp(mobileNumber);
    }, 500);
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 flex items-center justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
        
        {/* Left Column - Verify Branding */}
        <div className="lg:col-span-6 flex flex-col items-start space-y-6">
          {/* Back Button */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-amber-400 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer border border-amber-400/30 shadow-md"
          >
            ← Back to How it works
          </button>

          {/* SCAN ME Badge */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-sm bg-[#F2BA03] text-neutral-950 text-xs font-black tracking-widest uppercase shadow-[0_0_15px_rgba(242,186,3,0.35)] -skew-x-12">
            <span className="skew-x-12 block">SCAN CONNECT</span>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-[48px] font-extrabold tracking-[-0.64px] text-white font-sans leading-[47px]">
              Secure Access to Your <br />
              <span className="text-[#F2BA03] font-black block mt-1 drop-shadow-[0_2px_12px_rgba(242,186,3,0.35)]">
                Vehicle Ecosystem.
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-neutral-300 text-base md:text-lg max-w-md font-normal leading-relaxed">
            Connect instantly with vehicle owners and manage your automotive services with high-octane efficiency.
          </p>

          {/* Trust Banner */}
          <div className="pt-4 flex items-center gap-3">
            <div className="flex items-center -space-x-2 bg-neutral-900/90 p-1.5 rounded-full border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                alt="User Avatar"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border-2 border-neutral-950 object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                alt="User Avatar"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border-2 border-neutral-950 object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80"
                alt="User Avatar"
                referrerPolicy="no-referrer"
                className="w-8 h-8 rounded-full border-2 border-neutral-950 object-cover"
              />
            </div>
            <div className="pl-2 border-l-2 border-[#ffc000]">
              <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest font-mono">
                TRUSTED BY
              </div>
              <div className="text-sm font-extrabold text-white font-mono">
                50k+ Users
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Verify Identity Glassmorphic Card */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end w-full">
          <div className="w-full max-w-[480px] bg-white/[0.08] backdrop-blur-[6px] border border-white/10 rounded-xl p-8 sm:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] relative overflow-hidden">
            
            {/* Phone Icon Circle */}
            <div className="w-12 h-12 bg-[#F2BA03]/20 text-[#F2BA03] border border-[#F2BA03]/40 rounded-xl flex items-center justify-center mb-4">
              <Phone className="w-6 h-6" />
            </div>

            {/* Card Header */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-[32px] font-extrabold text-white tracking-[-0.64px] uppercase leading-[38px] flex flex-col gap-1">
                <span>VERIFY IDENTITY</span>
                <span className="w-12 h-1 bg-[#F2BA03] rounded-full mt-1" />
              </h2>
              <p className="text-[#E2E2E2] text-sm font-semibold leading-[21px] mt-2">
                Quick access via mobile number verification.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Mobile Number */}
              <div className="space-y-2">
                <label className="block text-xs font-bold tracking-[0.6px] text-white uppercase">
                  MOBILE NUMBER
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5E5E5E]">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="9881860335"
                    className="w-full h-[59px] pl-12 pr-4 bg-white/90 text-[#1B1C1C] font-normal placeholder-[#6B7280] rounded-none text-base focus:outline-none focus:ring-2 focus:ring-[#F2BA03] transition-all"
                  />
                </div>
                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mt-1.5 font-mono">
                  WE&apos;LL SEND A 6-DIGIT CODE VIA SMS
                </p>
              </div>

              {/* Send OTP Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[57px] mt-2 bg-[#F2BA03] hover:bg-[#e0ac00] text-[#1B1C1C] font-extrabold text-base uppercase tracking-[1.6px] rounded-none shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>SENDING SMS...</span>
                ) : (
                  <>
                    <span>SEND OTP</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Contact Support */}
              <div className="text-center text-xs text-neutral-400 font-medium">
                Trouble logging in?{' '}
                <button
                  type="button"
                  onClick={() => alert('Support team notified. We will reach out to your registered phone number.')}
                  className="text-[#F2BA03] font-bold hover:underline cursor-pointer"
                >
                  Contact Support
                </button>
              </div>

              {/* Terms disclaimer at bottom */}
              <div className="pt-4 border-t border-white/10 text-center">
                <p className="text-[9px] text-neutral-400 uppercase tracking-widest leading-relaxed font-mono">
                  BY CONTINUING, YOU AGREE TO SCAN CONNECT&apos;S{' '}
                  <span className="text-[#F2BA03] underline cursor-pointer">TERMS OF SERVICE</span> &{' '}
                  <span className="text-[#F2BA03] underline cursor-pointer">PRIVACY POLICY</span>
                </p>
              </div>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
};
