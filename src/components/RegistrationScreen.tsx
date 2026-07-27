import React, { useState } from 'react';
import { User, Phone, Mail, ArrowRight, CheckCircle2 } from 'lucide-react';
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
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 flex items-center justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
        
        {/* Left Column - Hero Branding & Metrics */}
        <div className="lg:col-span-6 flex flex-col items-start space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#807200]/40 border border-amber-400/40 text-amber-300 text-xs font-extrabold tracking-widest uppercase rounded-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            NETWORK EXPANSION LIVE
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white uppercase italic leading-[0.95] font-sans">
              JOIN THE <br />
              <span className="text-amber-400 not-italic font-black block mt-1 drop-shadow-[0_2px_10px_rgba(245,184,0,0.3)]">
                NETWORK
              </span>
            </h1>
          </div>

          {/* Subtitle */}
          <p className="text-neutral-300 text-base md:text-lg max-w-md font-normal leading-relaxed">
            Join 50k+ vehicle owners in the world&apos;s most secure automotive contact network.
          </p>

          {/* Key Metrics */}
          <div className="pt-6 grid grid-cols-3 gap-6 border-t border-white/10 w-full max-w-md">
            <div>
              <div className="text-2xl md:text-3xl font-black text-amber-400 font-mono tracking-tight">
                50k+
              </div>
              <div className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-wider mt-0.5">
                ACTIVE USERS
              </div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-black text-amber-400 font-mono tracking-tight">
                100%
              </div>
              <div className="text-[10px] md:text-xs font-bold text-neutral-400 uppercase tracking-wider mt-0.5">
                SECURE
              </div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-black text-amber-400 font-mono tracking-tight">
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
          <div className="w-full max-w-md bg-neutral-900/60 backdrop-blur-md border border-white/10 rounded-xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            {/* Ambient accent inside card */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

            {/* Card Header */}
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Create your account
              </h2>
              <p className="text-neutral-400 text-xs sm:text-sm mt-1">
                Secure vehicle contact starts here.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-neutral-300 uppercase mb-1.5">
                  FULL NAME
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Kartik Ghodake"
                    className="w-full pl-10 pr-4 py-3 bg-[#e5e7eb] text-neutral-900 font-medium placeholder-neutral-500 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
                  />
                </div>
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-neutral-300 uppercase mb-1.5">
                  MOBILE NUMBER
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={formData.mobileNumber}
                    onChange={(e) => setFormData({ ...formData, mobileNumber: e.target.value })}
                    placeholder="9881860335"
                    className="w-full pl-10 pr-4 py-3 bg-[#e5e7eb] text-neutral-900 font-medium placeholder-neutral-500 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-neutral-300 uppercase mb-1.5">
                  EMAIL ADDRESS
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="driver@scanme.com"
                    className="w-full pl-10 pr-4 py-3 bg-[#e5e7eb] text-neutral-900 font-medium placeholder-neutral-500 rounded-sm text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-3 py-3.5 px-4 bg-[#ffc000] hover:bg-amber-400 text-neutral-950 font-extrabold text-xs sm:text-sm uppercase tracking-widest rounded-sm shadow-lg shadow-amber-400/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>REGISTERING...</span>
                ) : (
                  <>
                    <span>REGISTER NOW</span>
                  </>
                )}
              </button>
            </form>

            {/* Footer Navigation Link */}
            <div className="mt-6 text-center text-xs text-neutral-400 font-medium">
              Already have an account?{' '}
              <button
                onClick={() => onNavigate('login')}
                className="text-amber-400 font-bold hover:underline underline-offset-4 ml-1 cursor-pointer"
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
