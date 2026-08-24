import React, { useState } from 'react';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff, ShieldCheck, X } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { api, ApiError } from '../lib/api';
import { ScreenType, UserFormData } from '../types';
import logoImg from '../assets/images/logo.png';

interface RegistrationScreenProps {
  onNavigate: (screen: ScreenType) => void;
  onSubmitSuccess: (data: UserFormData) => void;
}

export const RegistrationScreen: React.FC<RegistrationScreenProps> = ({ onNavigate, onSubmitSuccess }) => {
  const [formData, setFormData] = useState<UserFormData & { password: string }>({
    fullName: '',
    mobileNumber: '',
    email: '',
    password: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      const credential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const idToken = await credential.user.getIdToken();

      await api.post('/api/auth/register', {
        idToken,
        fullName: formData.fullName,
        email: formData.email,
      });

      onSubmitSuccess(formData);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else if (err instanceof Error) {
        setErrorMsg(err.message.replace('Firebase: ', ''));
      } else {
        setErrorMsg('Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
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
            <div className="inline-flex items-center gap-2 py-1 px-3.5 rounded-full border border-neutral-200 bg-white shadow-xs mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#FFED00]" />
              <span className="font-mono text-xs font-semibold tracking-wider text-[#0F0F0F] uppercase">
                Join The Network
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F0F0F] tracking-tight">
              Create your account
            </h1>
            <p className="text-[#5D5F5F] text-sm sm:text-base font-normal">
              Secure vehicle contact starts here.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold tracking-wide text-[#0F0F0F] uppercase">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Rahul Sharma"
                  className="w-full h-[52px] pl-12 pr-4 bg-white border border-neutral-300 text-[#0F0F0F] font-normal placeholder-neutral-400 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#FFED00] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold tracking-wide text-[#0F0F0F] uppercase">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                  <Mail className="w-5 h-5" />
                </div>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="driver@scanme.com"
                  className="w-full h-[52px] pl-12 pr-4 bg-white border border-neutral-300 text-[#0F0F0F] font-normal placeholder-neutral-400 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#FFED00] focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold tracking-wide text-[#0F0F0F] uppercase">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="At least 6 characters"
                  className="w-full h-[52px] pl-12 pr-12 bg-white border border-neutral-300 text-[#0F0F0F] font-normal placeholder-neutral-400 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#FFED00] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-neutral-400 hover:text-[#0F0F0F] cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <p className="text-xs font-normal text-neutral-400 -mt-2">
              You&apos;ll link your mobile number via OTP right after this step
            </p>

            {errorMsg && (
              <p className="text-xs font-semibold text-rose-600">{errorMsg}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[52px] mt-2 bg-[#FFED00] hover:bg-[#e0ac00] text-[#0F0F0F] font-bold text-sm uppercase tracking-wide rounded-xl shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Registering...</span>
              ) : (
                <>
                  <span>Register Now</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Footer Navigation Link */}
          <div className="mt-6 pt-6 border-t border-neutral-100 text-center text-sm text-[#5D5F5F] font-normal">
            Already have an account?{' '}
            <button
              onClick={() => onNavigate('login')}
              className="text-[#0F0F0F] font-bold hover:underline underline-offset-4 ml-1 cursor-pointer"
            >
              Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
