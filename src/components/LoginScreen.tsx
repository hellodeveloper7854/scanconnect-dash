import React, { useState } from 'react';
import { Mail, Lock, Shield, ArrowRight, ShieldCheck } from 'lucide-react';
import { ScreenType, UserFormData } from '../types';

interface LoginScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onSubmitSuccess: (data: Partial<UserFormData>) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate, onSubmitSuccess }) => {
  const [vehicleEmail, setVehicleEmail] = useState('driver@scanme.com');
  const [accessKey, setAccessKey] = useState('password123');
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
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 flex items-center justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
        
        {/* Left Column - Digital Shield Branding */}
        <div className="lg:col-span-6 flex flex-col items-start space-y-6">
          {/* Shield Emblem */}
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-neutral-950 flex items-center justify-center shadow-[0_0_25px_rgba(245,184,0,0.4)] border border-amber-300">
            <Shield className="w-8 h-8 fill-neutral-950 stroke-neutral-950" />
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-6xl md:text-6xl font-black tracking-tight text-white font-sans leading-[1.05]">
              Your Vehicle&apos;s <br />
              <span className="text-amber-400 font-black block mt-0.5 drop-shadow-[0_2px_10px_rgba(245,184,0,0.3)]">
                Digital Shield.
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-neutral-300 text-base md:text-lg max-w-md font-normal leading-relaxed">
            Connect safely with other drivers while maintaining your privacy. Join the fleet of secure vehicle services today.
          </p>

          {/* Encryption & Privacy Badges */}
          <div className="pt-4 flex flex-wrap gap-3 w-full">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-neutral-900/80 border border-white/10 text-neutral-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>ENCRYPTED CONNECTION</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-neutral-900/80 border border-white/10 text-neutral-300 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>PRIVACY FIRST</span>
            </div>
          </div>
        </div>

        {/* Right Column - Login Glassmorphic Card */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end w-full">
          <div className="w-full max-w-md bg-neutral-900/65 backdrop-blur-xl border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
            
            {/* Top Right Secure Hub Badge */}
            <div className="absolute top-4 right-4 bg-amber-400 text-neutral-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-sm shadow-md font-mono transform rotate-1">
              SECURE HUB
            </div>

            {/* Card Header */}
            <div className="mb-6 pt-1">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight uppercase">
                LOGIN
              </h2>
              <p className="text-neutral-400 text-xs sm:text-sm mt-1">
                Please enter your vehicle dashboard credentials
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Vehicle ID / Email */}
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-neutral-300 uppercase mb-1.5">
                  VEHICLE ID / EMAIL
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={vehicleEmail}
                    onChange={(e) => setVehicleEmail(e.target.value)}
                    placeholder="driver@scanme.com"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-200/90 text-neutral-900 font-medium placeholder-neutral-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Access Key */}
              <div>
                <label className="block text-[10px] font-bold tracking-widest text-neutral-300 uppercase mb-1.5">
                  ACCESS KEY
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={accessKey}
                    onChange={(e) => setAccessKey(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 bg-neutral-200/90 text-neutral-900 font-medium placeholder-neutral-500 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all font-mono"
                  />
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-neutral-300 font-bold tracking-wider text-[11px]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-neutral-800 border-white/20 text-amber-400 focus:ring-amber-400 focus:ring-offset-neutral-900 cursor-pointer"
                  />
                  <span>REMEMBER ME</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert('Password reset instructions sent to your registered email.')}
                  className="text-amber-400 font-bold hover:underline tracking-wider text-[11px] uppercase cursor-pointer"
                >
                  FORGOT KEY?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-3 py-3.5 px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-widest rounded-lg shadow-lg shadow-amber-400/20 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>AUTHENTICATING...</span>
                ) : (
                  <>
                    <span>LOGIN</span>
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
                    NEW USER?
                  </span>
                </div>
              </div>

              {/* Register Vehicle Button */}
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="w-full py-3.5 px-4 bg-black/80 hover:bg-black/90 border border-white/20 text-white font-bold text-xs uppercase tracking-widest rounded-lg transition-all cursor-pointer text-center"
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
