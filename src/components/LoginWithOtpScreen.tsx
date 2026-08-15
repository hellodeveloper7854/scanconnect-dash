import React from 'react';
import { Phone, Mail, ShieldCheck, X } from 'lucide-react';
import { ScreenType } from '../types';
import logoImg from '../assets/images/logo.png';

interface LoginWithOtpScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

export const LoginWithOtpScreen: React.FC<LoginWithOtpScreenProps> = ({ onNavigate }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start sm:items-center justify-center overflow-y-auto bg-black/60 backdrop-blur-sm p-4 py-10 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onNavigate('dashboard');
      }}
    >
      <div className="w-full max-w-md h-fit">
        <div className="relative bg-white border border-neutral-200 rounded-2xl shadow-2xl p-8 sm:p-10">
          {/* Close Button */}
          <button
            onClick={() => onNavigate('dashboard')}
            aria-label="Close"
            className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-[#0F0F0F] hover:bg-neutral-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Logo */}
          <div className="flex justify-center mb-6">
            <button onClick={() => onNavigate('dashboard')} className="cursor-pointer">
              <img src={logoImg} alt="Scan Connect" className="h-9 w-auto object-contain" />
            </button>
          </div>

          {/* Header */}
          <div className="text-center mb-8 space-y-2">
            <div className="inline-flex items-center gap-2 py-1 px-3.5 rounded-full border border-neutral-200 bg-white shadow-xs mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#F2BA03]" />
              <span className="font-mono text-xs font-semibold tracking-wider text-[#0F0F0F] uppercase">
                Secure Sign In
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F0F0F] tracking-tight">
              Access your dashboard
            </h1>
            <p className="text-[#5D5F5F] text-sm sm:text-base font-normal">
              Choose how you&apos;d like to sign in to Scan Connect.
            </p>
          </div>

          {/* Login Options */}
          <div className="space-y-4">
            <button
              type="button"
              onClick={() => onNavigate('send-otp')}
              className="w-full h-14 bg-[#F2BA03] hover:bg-[#e0ac00] text-[#0F0F0F] font-bold text-sm uppercase tracking-wide rounded-xl shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <Phone className="w-5 h-5" />
              <span>Login with OTP</span>
            </button>

            <div className="flex items-center gap-4 py-1">
              <div className="flex-1 h-px bg-neutral-200" />
              <span className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                or
              </span>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>

            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="w-full h-14 bg-white hover:bg-neutral-50 border border-neutral-300 text-[#0F0F0F] font-bold text-sm uppercase tracking-wide rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <Mail className="w-5 h-5 text-[#0F0F0F]" />
              <span>Login with Email</span>
            </button>
          </div>

          {/* Footer Navigation Link */}
          <div className="mt-8 pt-6 border-t border-neutral-100 text-center text-sm text-[#5D5F5F] font-normal">
            New to Scan Connect?{' '}
            <button
              onClick={() => onNavigate('register')}
              className="text-[#0F0F0F] font-bold hover:underline underline-offset-4 ml-1 cursor-pointer"
            >
              Register Now
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-white/70 mt-6 leading-relaxed">
          By continuing, you agree to Scan Connect&apos;s{' '}
          <a href="/terms" className="text-white font-semibold underline underline-offset-2">
            Terms of Service
          </a>{' '}
          &amp;{' '}
          <a href="/terms" className="text-white font-semibold underline underline-offset-2">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};
