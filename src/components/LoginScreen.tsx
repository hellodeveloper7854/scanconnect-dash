import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, ShieldCheck, Eye, EyeOff, X } from 'lucide-react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { api, ApiError } from '../lib/api';
import { ScreenType, UserFormData } from '../types';
import logoImg from '../assets/images/logo.png';

interface LoginScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onSubmitSuccess: (data: Partial<UserFormData>) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onNavigate, onSubmitSuccess }) => {
  const [vehicleEmail, setVehicleEmail] = useState('');
  const [accessKey, setAccessKey] = useState('');
  const [showAccessKey, setShowAccessKey] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const credential = await signInWithEmailAndPassword(auth, vehicleEmail, accessKey);
      const idToken = await credential.user.getIdToken();
      const { user } = await api.post<{ user: { fullName: string; email: string; mobileNumber: string | null } }>(
        '/api/auth/session',
        { idToken },
      );
      onSubmitSuccess({
        email: user.email,
        fullName: user.fullName,
        mobileNumber: user.mobileNumber ?? '',
        rememberMe,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else if (err instanceof Error) {
        setErrorMsg(err.message.replace('Firebase: ', ''));
      } else {
        setErrorMsg('Login failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!vehicleEmail) {
      setErrorMsg('Enter your email above first, then tap "Forgot key?".');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, vehicleEmail);
      alert('Password reset instructions sent to your registered email.');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message.replace('Firebase: ', '') : 'Could not send reset email.');
    }
  };

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
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFED00] border border-[#E6D400] mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1B1C1C]" />
              <span className="font-['Inter'] font-bold text-xs tracking-[2px] uppercase text-[#1B1C1C]">
                SECURE LOGIN
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F0F0F] tracking-tight">
              Welcome back
            </h1>
            <p className="text-[#5D5F5F] text-sm sm:text-base font-normal">
              Enter your vehicle dashboard credentials.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Vehicle ID / Email */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold tracking-wide text-[#0F0F0F] uppercase">
                Vehicle ID / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={vehicleEmail}
                  onChange={(e) => setVehicleEmail(e.target.value)}
                  placeholder="driver@scanme.com"
                  className="w-full h-[52px] pl-12 pr-4 bg-white border border-neutral-300 text-[#0F0F0F] font-normal placeholder-neutral-400 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#FFED00] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Access Key */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold tracking-wide text-[#0F0F0F] uppercase">
                Access Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showAccessKey ? 'text' : 'password'}
                  required
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-[52px] pl-12 pr-12 bg-white border border-neutral-300 text-[#0F0F0F] font-normal placeholder-neutral-400 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#FFED00] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowAccessKey((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-[#0F0F0F] cursor-pointer"
                  aria-label={showAccessKey ? 'Hide access key' : 'Show access key'}
                >
                  {showAccessKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#0F0F0F] font-semibold tracking-wide text-xs">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-neutral-300 text-[#B58500] focus:ring-[#FFED00] cursor-pointer"
                />
                <span>Remember me</span>
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[#0F0F0F] font-bold hover:underline tracking-wide text-xs cursor-pointer"
              >
                Forgot key?
              </button>
            </div>

            {errorMsg && (
              <p className="text-xs font-semibold text-rose-600">{errorMsg}</p>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[52px] mt-2 bg-[#FFED00] hover:bg-[#e0ac00] text-[#0F0F0F] font-bold text-sm uppercase tracking-wide rounded-xl shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 py-1">
              <div className="flex-1 h-px bg-neutral-200" />
              <span className="text-neutral-400 text-xs font-semibold uppercase tracking-wider">
                or
              </span>
              <div className="flex-1 h-px bg-neutral-200" />
            </div>

            {/* Register Vehicle Button */}
            <button
              type="button"
              onClick={() => onNavigate('register')}
              className="w-full h-[52px] bg-white hover:bg-neutral-50 border border-neutral-300 text-[#0F0F0F] font-bold text-sm uppercase tracking-wide rounded-xl transition-all cursor-pointer text-center"
            >
              Register Vehicle
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
