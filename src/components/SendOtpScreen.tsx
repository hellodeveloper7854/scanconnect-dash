import React, { useState, useEffect, useRef } from 'react';
import { Phone, ArrowRight, Check, RefreshCw, Zap } from 'lucide-react';
import { ScreenType } from '../types';

interface SendOtpScreenProps {
  onVerifySuccess: () => void;
  onNavigate: (screen: ScreenType) => void;
}

export const SendOtpScreen: React.FC<SendOtpScreenProps> = ({ onVerifySuccess, onNavigate }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!isOtpSent || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOtpSent, timer]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsOtpSent(true);
      setOtpDigits(['', '', '', '', '', '']);
      setTimer(30);
      setErrorMsg('');
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }, 500);
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

  const handleAutofillDemo = () => {
    setOtpDigits(['4', '8', '2', '9', '1', '0']);
    setErrorMsg('');
    inputRefs.current[5]?.focus();
  };

  const handleVerify = () => {
    const code = otpDigits.join('');
    if (code.length < 6) {
      setErrorMsg('Please enter all 6 digits of the OTP code.');
      return;
    }
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      onVerifySuccess();
    }, 800);
  };

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16 flex items-center justify-center">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center w-full">
        
        {/* Left Column - Verify Branding */}
        <div className="lg:col-span-6 flex flex-col items-start space-y-6">
          {/* Back Button */}
          <button
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neutral-900/80 hover:bg-neutral-800 text-amber-400 font-extrabold text-xs uppercase tracking-wider transition-all cursor-pointer border border-amber-400/30 shadow-md"
          >
            ← Back to How it works
          </button>

          {/* SCAN ME Badge */}
          <div className="inline-flex items-center px-4 py-1.5 bg-[#F2BA03] text-[#1B1C1C] text-xl font-black tracking-[-0.5px] border-2 border-[#1B1C1C] shadow-[4px_4px_0px_#1B1C1C] -skew-x-12">
            <span className="skew-x-12 block">SCAN CONNECT</span>
          </div>

          {/* Heading */}
          <div className="space-y-1 pt-6">
            <h1 className="text-3xl sm:text-[36px] font-extrabold tracking-[-0.64px] text-white font-sans leading-[40px]">
              Secure Access to Your <br />
              <span className="text-[#F2BA03] font-black block mt-1 drop-shadow-[0_2px_12px_rgba(242,186,3,0.35)]">
                Vehicle Ecosystem.
              </span>
            </h1>
          </div>

          {/* Description */}
          <p className="text-white/80 text-xl font-medium max-w-md leading-[26px]">
            Connect instantly with vehicle owners and manage your automotive services with high-octane efficiency.
          </p>

          {/* Trust Banner */}
          <div className="pt-12 flex items-center gap-6 bg-black/40 backdrop-blur-[6px] border-l-4 border-[#F2BA03] p-2">
            <div className="flex items-center -space-x-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                alt="User Avatar"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full border-2 border-[#1B1C1C] bg-[#E5E2E1] object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80"
                alt="User Avatar"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full border-2 border-[#1B1C1C] bg-[#E5E2E1] object-cover"
              />
              <img
                src="https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=100&q=80"
                alt="User Avatar"
                referrerPolicy="no-referrer"
                className="w-10 h-10 rounded-full border-2 border-[#1B1C1C] bg-[#E5E2E1] object-cover"
              />
            </div>
            <div>
              <div className="text-xs font-bold text-[#F2BA03] uppercase tracking-[0.6px]">
                TRUSTED BY
              </div>
              <div className="text-xl font-bold text-white">
                50k+ Users
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Verify Identity Glassmorphic Card */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end w-full">
          <div className="w-full max-w-[440px] bg-white/10 backdrop-blur-[12px] border-2 border-white/30 shadow-[0px_8px_32px_rgba(0,0,0,0.3)] rounded-none p-12 relative overflow-hidden">

            {/* Card Header */}
            <div className="mb-6">
              <h2 className="text-3xl sm:text-[36px] font-extrabold text-white leading-[21px]">
                VERIFY IDENTITY
              </h2>
              <span className="block w-24 h-1 bg-[#F2BA03] mt-4" />
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mobile Number */}
              <div className="space-y-1">
                <label className="block text-xs font-bold tracking-[1.2px] text-white uppercase">
                  MOBILE NUMBER
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#5E5E5E]">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    required
                    disabled={isOtpSent}
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full h-[59px] pl-12 pr-4 bg-white/90 text-[#1B1C1C] font-normal placeholder-[#6B7280] rounded-none text-base focus:outline-none focus:ring-2 focus:ring-[#F2BA03] transition-all disabled:opacity-70"
                  />
                </div>
                {!isOtpSent && (
                  <p className="text-[10px] font-normal text-white/40 uppercase mt-1">
                    WE&apos;LL SEND A 6-DIGIT CODE VIA SMS
                  </p>
                )}
              </div>

              {!isOtpSent ? (
                /* Send OTP Button */
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-[#F2BA03] hover:bg-[#e0ac00] text-[#1B1C1C] font-bold text-sm uppercase tracking-[1.4px] rounded-none shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span>SENDING SMS...</span>
                  ) : (
                    <>
                      <span>SEND OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                /* Inline OTP Entry */
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold tracking-[1.2px] text-white uppercase">
                      ENTER OTP CODE
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
                          className="w-full h-14 text-center text-xl font-bold bg-white/90 text-[#1B1C1C] rounded-none focus:outline-none focus:ring-2 focus:ring-[#F2BA03] transition-all"
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={handleAutofillDemo}
                      className="text-[10px] font-bold text-[#F2BA03] hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <Zap className="w-3 h-3" />
                      Click here to auto-fill demo OTP: 482910
                    </button>
                  </div>

                  {errorMsg && (
                    <p className="text-xs font-semibold text-rose-400">
                      {errorMsg}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="w-full h-14 bg-[#F2BA03] hover:bg-[#e0ac00] text-[#1B1C1C] font-bold text-sm uppercase tracking-[1.4px] rounded-none shadow-md active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {isVerifying ? (
                      <span>VERIFYING CODE...</span>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>VERIFY & PROCEED</span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs text-white/50">
                    <span>Didn&apos;t receive code?</span>
                    {timer > 0 ? (
                      <span className="font-bold text-[#F2BA03]">
                        Resend in {timer}s
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setTimer(30);
                          alert('A new OTP has been sent via SMS.');
                        }}
                        className="flex items-center gap-1 text-[#F2BA03] font-bold hover:underline cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Support */}
              <div className="text-center text-sm text-white/50 font-normal">
                Trouble logging in?{' '}
                <button
                  type="button"
                  onClick={() => alert('Support team notified. We will reach out to your registered phone number.')}
                  className="text-[#F2BA03] font-bold hover:underline cursor-pointer"
                >
                  Contact Support
                </button>
              </div>

              {/* Terms disclaimer at bottom */}
              <div className="text-center">
                <p className="text-[10px] text-white/30 uppercase leading-[16px]">
                  BY CONTINUING, YOU AGREE TO SCAN CONNECT&apos;S{' '}
                  <span className="text-[#F2BA03] underline cursor-pointer">TERMS OF SERVICE</span> &{' '}
                  <span className="text-[#F2BA03] underline cursor-pointer">PRIVACY POLICY</span>
                </p>
              </div>
            </form>

          </div>
        </div>

      </div>
    </div>
  );
};
