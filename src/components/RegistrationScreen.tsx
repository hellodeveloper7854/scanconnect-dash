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
          <div className="inline-flex items-center px-3 py-1 bg-[#695F00] text-white text-sm font-normal tracking-[2px] uppercase">
            NETWORK EXPANSION LIVE
          </div>

          {/* Heading */}
          <div className="space-y-0">
            <h1 className="text-5xl sm:text-[72px] font-black tracking-tight text-white leading-[1] font-sans -skew-x-[10deg]">
              JOIN THE <br />
              <span className="text-[#F2BA03]">
                NETWORK
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-white/70 text-xl leading-[28px] max-w-xl font-normal">
            Join 50k+ vehicle owners in the world&apos;s most secure automotive contact network.
          </p>

          {/* Key Metrics */}
          <div className="pt-6 grid grid-cols-3 gap-6 border-t border-white/10 w-full max-w-md">
            <div>
              <div className="text-3xl md:text-[36px] font-black text-[#F2BA03] leading-none">
                50k+
              </div>
              <div className="text-xs font-bold text-white/50 uppercase tracking-[1px] mt-1">
                ACTIVE USERS
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-[36px] font-black text-[#F2BA03] leading-none">
                100%
              </div>
              <div className="text-xs font-bold text-white/50 uppercase tracking-[1px] mt-1">
                SECURE
              </div>
            </div>
            <div>
              <div className="text-3xl md:text-[36px] font-black text-[#F2BA03] leading-none">
                24/7
              </div>
              <div className="text-xs font-bold text-white/50 uppercase tracking-[1px] mt-1">
                MONITORING
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Registration Form Glassmorphic Card */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end w-full">
          <div className="w-full max-w-[480px] bg-white/5 backdrop-blur-[6px] border border-white/20 rounded-xl p-8 sm:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] relative overflow-hidden">

            {/* Card Header */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-[32px] font-bold text-white leading-[26px]">
                Create your account
              </h2>
              <p className="text-white/[0.93] text-base font-medium leading-[21px] mt-3">
                Secure vehicle contact starts here.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Full Name */}
              <div className="space-y-2">
                <label className="block text-[10px] font-medium tracking-[1px] text-white uppercase">
                  FULL NAME
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#6B7280]">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Kartik Ghodake"
                    className="w-full h-[59px] pl-12 pr-4 bg-white/90 text-[#6B7280] font-normal rounded-none text-base focus:outline-none focus:ring-2 focus:ring-[#F2BA03] transition-all"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div className="space-y-2">
                <label className="block text-[10px] font-medium tracking-[1px] text-white uppercase">
                  MOBILE NUMBER
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#6B7280]">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    placeholder="9881860335"
                    className="w-full h-[59px] pl-12 pr-4 bg-white/90 text-[#6B7280] font-normal rounded-none text-base focus:outline-none focus:ring-2 focus:ring-[#F2BA03] transition-all"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <label className="block text-[10px] font-medium tracking-[1px] text-white uppercase">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#6B7280]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="driver@scanme.com"
                    className="w-full h-[59px] pl-12 pr-4 bg-white/90 text-[#6B7280] font-normal rounded-none text-base focus:outline-none focus:ring-2 focus:ring-[#F2BA03] transition-all"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[58px] mt-2 bg-[#F2BA03] hover:bg-[#e0ac00] text-[#1B1C1C] font-black text-sm uppercase tracking-[2.8px] rounded-none shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
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
            <div className="mt-6 pt-6 border-t border-white/10 text-center text-sm text-white/50 font-semibold">
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

