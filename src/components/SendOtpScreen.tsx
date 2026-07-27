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
          {/* SCAN ME Badge */}
          <div className="inline-flex items-center px-4 py-1.5 rounded-sm bg-amber-400 text-neutral-950 text-xs font-black tracking-widest uppercase shadow-[0_0_15px_rgba(245,184,0,0.3)]">
            SCAN CONNECT
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white font-sans leading-[1.05]">
              Secure Access to Your <br />
              <span className="text-amber-400 font-black block mt-0.5 drop-shadow-[0_2px_10px_rgba(245,184,0,0.3)]">
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
            <div className="pl-2 border-l-2 border-amber-400">
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
          <div className="w-full max-w-md bg-neutral-900/65 backdrop-blur-xl border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            
            {/* Phone Icon Circle */}
            <div className="w-12 h-12 bg-amber-400/20 text-amber-400 border border-amber-400/40 rounded-xl flex items-center justify-center mb-4">
              <Phone className="w-6 h-6" />
            </div>

            {/* Card Header */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                VERIFY PHONE
              </h2>
              <p className="text-neutral-400 text-xs sm:text-sm mt-1">
                Quick access via mobile number verification.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Mobile Number */}
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-neutral-300 uppercase mb-1.5">
                  PHONE NUMBER
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="9881860335"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-200/90 text-neutral-900 font-medium placeholder-neutral-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all font-mono"
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
                className="w-full mt-3 py-3.5 px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-widest rounded-lg shadow-lg shadow-amber-400/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>SENDING SMS...</span>
                ) : (
                  <>
                    <span>SEND VERIFICATION CODE</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-[10px]">
                  <span className="bg-neutral-900/90 px-3 text-neutral-400 font-bold uppercase tracking-widest font-mono">
                    OR CONNECT WITH
                  </span>
                </div>
              </div>

              {/* Contact Support */}
              <div className="text-center text-xs text-neutral-400 font-medium">
                Trouble logging in?{' '}
                <button
                  type="button"
                  onClick={() => alert('Support team notified. We will reach out to your registered phone number.')}
                  className="text-amber-400 font-bold hover:underline cursor-pointer"
                >
                  Contact Support
                </button>
              </div>

              {/* Terms disclaimer at bottom */}
              <div className="pt-4 border-t border-white/10 text-center">
                <p className="text-[9px] text-neutral-500 uppercase tracking-widest leading-relaxed font-mono">
                  BY CONTINUING, YOU AGREE TO SCAN CONNECT&apos;S{' '}
                  <span className="text-amber-400 underline cursor-pointer">TERMS OF SERVICE</span> &{' '}
                  <span className="text-amber-400 underline cursor-pointer">PRIVACY POLICY</span>
                </p>
              </div>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
};
