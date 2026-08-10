import React, { useState } from 'react';
import { Mail, Lock, Shield, ArrowRight, ShieldCheck } from 'lucide-react';
import { ScreenType, UserFormData } from '../types';

interface LoginScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onSubmitSuccess: (data: Partial<UserFormData>) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate, onSubmitSuccess }) => {
  const [vehicleEmail, setVehicleEmail] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onSubmitSuccess({ email: vehicleEmail, accessKey, rememberMe });
    }, 600);
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex items-center justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
        
        {/* Left Column - Digital Shield Branding */}
        <div className="lg:col-span-6 flex flex-col items-start space-y-6">
          {/* Back Button */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-[#F2BA03] font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer border border-[#F2BA03]/30 shadow-md"
          >
            ← Back to How it works
          </button>

          {/* Shield Emblem */}
          <div className="w-12 h-[50px] bg-[#F2BA03] text-neutral-950 flex items-center justify-center rounded-lg shadow-[0_0_25px_rgba(242,186,3,0.4)]">
            <Shield className="w-8 h-8 fill-neutral-950 stroke-neutral-950" />
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-[48px] font-extrabold tracking-[-0.64px] text-white font-sans leading-[47px]">
              Your Vehicle&apos;s <br />
              <span className="text-[#F2BA03] font-black block mt-1 drop-shadow-[0_2px_12px_rgba(242,186,3,0.35)]">
                Digital Shield.
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-[#E2E2E2] text-lg sm:text-[20px] leading-[26px] max-w-xl font-normal">
            Connect safely with other drivers while maintaining your privacy. Join the fleet of secure vehicle services today.
          </p>

          {/* Encryption & Privacy Badges (Trust Indicators) */}
          <div className="pt-2 flex flex-col sm:flex-row gap-4 w-full max-w-lg">
            <div className="flex-1 flex items-center gap-3 px-4 py-3.5 h-[54px] bg-black/40 border border-white/10 backdrop-blur-[2px] rounded-lg text-white text-xs font-bold uppercase tracking-[0.6px]">
              <ShieldCheck className="w-5 h-5 text-[#F2BA03] shrink-0" />
              <span>ENCRYPTED CONNECTION</span>
            </div>
            <div className="flex-1 flex items-center gap-3 px-4 py-3.5 h-[54px] bg-black/40 border border-white/10 backdrop-blur-[2px] rounded-lg text-white text-xs font-bold uppercase tracking-[0.6px]">
              <ShieldCheck className="w-5 h-5 text-[#F2BA03] shrink-0" />
              <span>PRIVACY FIRST</span>
            </div>
          </div>
        </div>

        {/* Right Column - Login Glassmorphic Card */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end w-full">
          <div className="w-full max-w-[480px] bg-white/[0.08] backdrop-blur-[6px] border border-white/10 rounded-xl p-8 sm:p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] relative overflow-hidden">
            
            {/* Top Right Secure Hub Badge (Skewed per Figma spec) */}
            <div className="absolute top-0 right-0 bg-[#F2BA03] text-black text-base font-black px-4 py-2 shadow-md -skew-x-12">
              <span className="skew-x-12 block">SECURE HUB</span>
            </div>

            {/* Card Header */}
            <div className="mb-6 pt-2">
              <h2 className="text-2xl sm:text-[32px] font-extrabold text-white tracking-[-0.64px] uppercase leading-[38px]">
                LOGIN
              </h2>
              <p className="text-[#E2E2E2] text-sm font-semibold leading-[21px] mt-1">
                Please enter your vehicle dashboard credentials
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Vehicle ID / Email */}
              <div className="space-y-2">
                <label className="block text-xs font-bold tracking-[0.6px] text-white uppercase">
                  VEHICLE ID / EMAIL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5E5E5E]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={vehicleEmail}
                    onChange={(e) => setVehicleEmail(e.target.value)}
                    placeholder="driver@scanme.com"
                    className="w-full h-[59px] pl-12 pr-4 bg-white/90 text-[#1B1C1C] font-normal placeholder-[#6B7280] rounded-none text-base focus:outline-none focus:ring-2 focus:ring-[#F2BA03] transition-all"
                  />
                </div>
              </div>

              {/* Access Key */}
              <div className="space-y-2">
                <label className="block text-xs font-bold tracking-[0.6px] text-white uppercase">
                  ACCESS KEY
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5E5E5E]">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    required
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-[59px] pl-12 pr-4 bg-white/90 text-[#1B1C1C] font-normal placeholder-[#6B7280] rounded-none text-base focus:outline-none focus:ring-2 focus:ring-[#F2BA03] transition-all"
                  />
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-white font-bold tracking-[0.6px] text-xs">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-5 h-5 rounded-none bg-transparent border-2 border-white text-[#F2BA03] focus:ring-[#F2BA03] cursor-pointer"
                  />
                  <span>REMEMBER ME</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset instructions sent to your registered email.')}
                  className="text-[#F2BA03] font-bold hover:underline tracking-[0.6px] text-xs uppercase cursor-pointer"
                >
                  FORGOT KEY?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[57px] mt-2 bg-[#F2BA03] hover:bg-[#e0ac00] text-[#1B1C1C] font-medium text-base uppercase tracking-[1.6px] rounded-none shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>AUTHENTICATING...</span>
                ) : (
                  <>
                    <span>LOGIN</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-[1px] bg-white/20" />
                <span className="text-white/50 text-xs font-bold uppercase tracking-[0.6px]">
                  OR
                </span>
                <div className="flex-1 h-[1px] bg-white/20" />
              </div>

              {/* Register Vehicle Button */}
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="w-full h-[57px] bg-black hover:bg-neutral-900 border border-white/20 text-white font-normal text-base uppercase tracking-[1.6px] rounded-none transition-all cursor-pointer text-center"
              >
                REGISTER VEHICLE
              </button>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
};

