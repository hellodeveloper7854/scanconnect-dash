import React, { useState, useEffect, useRef } from 'react';
import { Phone, ArrowRight, Check, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { signInWithPhoneNumber, type ConfirmationResult } from 'firebase/auth';
import { auth, getRecaptchaVerifier } from '../lib/firebase';
import { api, ApiError } from '../lib/api';
import { ScreenType, UserFormData } from '../types';
import logoImg from '../assets/images/logo.png';

interface SendOtpScreenProps {
  onVerifySuccess: (data: Partial<UserFormData>) => void;
  onNavigate: (screen: ScreenType) => void;
}

const RECAPTCHA_CONTAINER_ID = 'send-otp-recaptcha';

export const SendOtpScreen: React.FC<SendOtpScreenProps> = ({ onVerifySuccess, onNavigate }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!isOtpSent || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOtpSent, timer]);

  const sendOtp = async () => {
    setErrorMsg('');
    try {
      const verifier = getRecaptchaVerifier(RECAPTCHA_CONTAINER_ID);
      const result = await signInWithPhoneNumber(auth, mobileNumber, verifier);
      setConfirmation(result);
      setIsOtpSent(true);
      setOtpDigits(['', '', '', '', '', '']);
      setTimer(30);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message.replace('Firebase: ', '') : 'Failed to send OTP.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await sendOtp();
    setIsSubmitting(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setErrorMsg('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otpDigits.join('');
    if (code.length < 6) {
      setErrorMsg('Please enter all 6 digits of the OTP code.');
      return;
    }
    if (!confirmation) {
      setErrorMsg('OTP session expired. Please resend the code.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg('');
    try {
      const credential = await confirmation.confirm(code);
      const idToken = await credential.user.getIdToken();
      const { user } = await api.post<{ user: { fullName: string; email: string; mobileNumber: string | null } }>(
        '/api/auth/session',
        { idToken },
      );
      onVerifySuccess({ email: user.email, fullName: user.fullName, mobileNumber: user.mobileNumber ?? '' });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else if (err instanceof Error) {
        setErrorMsg(err.message.replace('Firebase: ', ''));
      } else {
        setErrorMsg('Verification failed. Please try again.');
      }
    } finally {
      setIsVerifying(false);
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
            <div className="inline-flex items-center gap-2 py-1 px-3.5 rounded-full border border-[#E6D400] bg-[#FFED00] shadow-xs mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1B1C1C]" />
              <span className="font-mono text-xs font-semibold tracking-wider text-[#1B1C1C] uppercase">
                Verify Identity
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#0F0F0F] tracking-tight">
              Secure access via OTP
            </h1>
            <p className="text-[#5D5F5F] text-sm sm:text-base font-normal">
              We&apos;ll text a 6-digit code to verify it&apos;s you.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mobile Number */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold tracking-wide text-[#0F0F0F] uppercase">
                Mobile Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  required
                  disabled={isOtpSent}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full h-[52px] pl-12 pr-4 bg-white border border-neutral-300 text-[#0F0F0F] font-normal placeholder-neutral-400 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[#FFED00] focus:border-transparent transition-all disabled:opacity-70 disabled:bg-neutral-50"
                />
              </div>
              {!isOtpSent && (
                <p className="text-xs font-normal text-neutral-400 mt-1">
                  We&apos;ll send a 6-digit code via SMS
                </p>
              )}
            </div>

            {!isOtpSent ? (
              /* Send OTP Button */
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-[52px] bg-[#FFED00] hover:bg-[#e0ac00] text-[#0F0F0F] font-bold text-sm uppercase tracking-wide rounded-xl shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span>Sending SMS...</span>
                ) : (
                  <>
                    <span>Send OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              /* Inline OTP Entry */
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold tracking-wide text-[#0F0F0F] uppercase">
                    Enter OTP Code
                  </label>
                  <div className="flex justify-between gap-2">
                    {otpDigits.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength={1}
                        value={digit}
                        ref={(el) => (inputRefs.current[index] = el)}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-full h-14 text-center text-xl font-bold bg-white border border-neutral-300 text-[#0F0F0F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFED00] focus:border-transparent transition-all"
                      />
                    ))}
                  </div>
                </div>

                {errorMsg && (
                  <p className="text-xs font-semibold text-rose-600">
                    {errorMsg}
                  </p>
                )}

                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={isVerifying}
                  className="w-full h-[52px] bg-[#FFED00] hover:bg-[#e0ac00] text-[#0F0F0F] font-bold text-sm uppercase tracking-wide rounded-xl shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isVerifying ? (
                    <span>Verifying code...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Verify & Proceed</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>Didn&apos;t receive code?</span>
                  {timer > 0 ? (
                    <span className="font-bold text-[#0F0F0F]">
                      Resend in {timer}s
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={sendOtp}
                      className="flex items-center gap-1 text-[#0F0F0F] font-bold hover:underline cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
                    </button>
                  )}
                </div>
              </div>
            )}

            <div id={RECAPTCHA_CONTAINER_ID} />

            {/* Contact Support */}
            <div className="text-center text-sm text-neutral-500 font-normal">
              Trouble logging in?{' '}
              <button
                type="button"
                onClick={() => alert('Support team notified. We will reach out to your registered phone number.')}
                className="text-[#0F0F0F] font-bold hover:underline cursor-pointer"
              >
                Contact Support
              </button>
            </div>
          </form>
        </div>

        {/* Terms disclaimer at bottom */}
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
