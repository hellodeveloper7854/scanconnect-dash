import React, { useState } from 'react';
import { User, Phone, Mail, ArrowRight } from 'lucide-react';
import { ScreenType, UserFormData } from '../types';

interface RegistrationScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onSubmitSuccess: (data: UserFormData) => void;
}

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onNavigate, onSubmitSuccess }) => {
  const [formData, setFormData] = useState<UserFormData>({
    fullName: 'Kartik Ghodake',
    mobileNumber: '9881860335',
    email: 'driver@scanme.com',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitSuccess(formData);
    }, 600);
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex items-center justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
        
        {/* Left Column - Hero Branding & Metrics */}
        <div className="lg:col-span-6 flex flex-col items-start space-y-6">
          {/* Back Button */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-[#F2BA03] font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer border border-[#F2BA03]/30 shadow-md"
          >
            ← Back to How it works
          </button>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#F2BA03]/20 border border-[#F2BA03]/40 text-[#F2BA03] text-xs font-extrabold tracking-widest uppercase rounded-sm -skew-x-12">
            <span className="skew-x-12 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#F2BA03] animate-pulse" />
              NETWORK EXPANSION LIVE
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-[48px] font-extrabold tracking-[-0.64px] text-white uppercase italic leading-[47px] font-sans">
              JOIN THE <br />
              <span className="text-[#F2BA03] not-italic font-black block mt-1 drop-shadow-[0_2px_12px_rgba(242,186,3,0.35)]">
                NETWORK
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-[#E2E2E2] text-lg sm:text-[20px] leading-[26px] max-w-xl font-normal">
            Join 50k+ vehicle owners in the world&apos;s most secure automotive contact network.
          </p>

          {/* Key Metrics */}
          <div className="pt-6 grid grid-cols-3 gap-6 border-t border-white/10 w-full max-w-md">
            <div>
              <div className="text-2xl md:text-3xl font-black text-[#F2BA03] font-mono tracking-tight">
                50k+
              </div>
              <div className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-wider mt-0.5">
                ACTIVE USERS
              </div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-black text-[#F2BA03] font-mono tracking-tight">
                100%
              </div>
              <div className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-wider mt-0.5">
                SECURE
              </div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-black text-[#F2BA03] font-mono tracking-tight">
                24/7
              </div>
              <div className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-wider mt-0.5">
                MONITORING
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Registration Form Glassmorphic Card */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end w-full">
          <div className="w-full max-w-[480px] bg-white/[0.08] backdrop-blur-[6px] border border-white/10 rounded-xl p-8 sm:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] relative overflow-hidden">
            
            {/* Card Header */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-[32px] font-extrabold text-white tracking-[-0.64px] uppercase leading-[38px]">
                REGISTER
              </h2>
              <p className="text-[#E2E2E2] text-sm font-semibold leading-[21px] mt-1">
                Secure vehicle contact starts here.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-xs font-bold tracking-[0.6px] text-white uppercase">
                  FULL NAME
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5E5E5E]">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Kartik Ghodake"
                    className="w-full h-[59px] pl-12 pr-4 bg-white/90 text-[#1B1C1C] font-normal placeholder-[#6B7280] rounded-none text-base focus:outline-none focus:ring-2 focus:ring-[#F2BA03] transition-all"
                  />
                </div>
              </div>

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
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    placeholder="9881860335"
                    className="w-full h-[59px] pl-12 pr-4 bg-white/90 text-[#1B1C1C] font-normal placeholder-[#6B7280] rounded-none text-base focus:outline-none focus:ring-2 focus:ring-[#F2BA03] transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="block text-xs font-bold tracking-[0.6px] text-white uppercase">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5E5E5E]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="driver@scanme.com"
                    className="w-full h-[59px] pl-12 pr-4 bg-white/90 text-[#1B1C1C] font-normal placeholder-[#6B7280] rounded-none text-base focus:outline-none focus:ring-2 focus:ring-[#F2BA03] transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[57px] mt-2 bg-[#F2BA03] hover:bg-[#e0ac00] text-[#1B1C1C] font-extrabold text-base uppercase tracking-[1.6px] rounded-none shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>REGISTERING...</span>
                ) : (
                  <>
                    <span>REGISTER NOW</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Navigation Link */}
            <div className="mt-6 text-center text-xs text-neutral-400 font-medium">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-[#F2BA03] font-bold hover:underline underline-offset-4 ml-1 cursor-pointer"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

