import React, { useState } from 'react';
import { User, Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { api, ApiError } from '../lib/api';
import { ScreenType, UserFormData } from '../types';

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
                    placeholder="Rahul Sharma"
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

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-[10px] font-medium tracking-[1px] text-white uppercase">
                  PASSWORD
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#6B7280]">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="At least 6 characters"
                    className="w-full h-[59px] pl-12 pr-12 bg-white/90 text-[#6B7280] font-normal rounded-none text-base focus:outline-none focus:ring-2 focus:ring-[#F2BA03] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#6B7280] hover:text-white cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <p className="text-[10px] font-normal text-white/40 uppercase -mt-2">
                YOU&apos;LL LINK YOUR MOBILE NUMBER VIA OTP RIGHT AFTER THIS STEP
              </p>

              {errorMsg && (
                <p className="text-xs font-semibold text-rose-400">{errorMsg}</p>
              )}

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

