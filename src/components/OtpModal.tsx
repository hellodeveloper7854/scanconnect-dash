import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, X, Check, RefreshCw, Smartphone, Zap } from 'lucide-react';

interface OtpModalProps {
  isOpen: boolean;
  mobileNumber: string;
  onClose: () => void;
  onVerifySuccess: () => void;
}

export const OtpModal: React.FC<OtpModalProps> = ({
  isOpen,
  mobileNumber,
  onClose,
  onVerifySuccess,
}) => {
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setOtpDigits(['', '', '', '', '', '']);
    setTimer(30);
    setErrorMsg('');
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  if (!isOpen) return null;

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setErrorMsg('');

    // Auto move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-neutral-900/90 border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden text-white">
        
        {/* Top Glow Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-amber-400 shadow-[0_0_10px_#f5b800]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2 mb-6 pt-2">
          <div className="mx-auto w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-400 mb-2">
            <Smartphone className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight uppercase">
            ENTER OTP CODE
          </h3>
          <p className="text-neutral-400 text-xs">
            We sent a 6-digit verification code to{' '}
            <span className="text-amber-400 font-mono font-bold">{mobileNumber || '+91 98765 43210'}</span>
          </p>
        </div>

        {/* OTP Input Fields */}
        <div className="space-y-6">
          <div className="flex justify-between gap-2 sm:gap-3">
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono bg-neutral-200 text-neutral-950 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all"
              />
            ))}
          </div>

          {/* Quick Autofill Helper */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleAutofillDemo}
              className="text-[11px] font-bold text-amber-400 hover:underline underline-offset-4 cursor-pointer font-mono inline-flex items-center gap-1"
            >
              <Zap className="w-3 h-3" />
              Click here to auto-fill demo OTP: 482910
            </button>
          </div>

          {errorMsg && (
            <p className="text-xs font-semibold text-rose-400 text-center">
              {errorMsg}
            </p>
          )}

          {/* Verify Button */}
          <button
            onClick={handleVerify}
            disabled={isVerifying}
            className="w-full py-3.5 px-4 bg-amber-400 hover:bg-amber-300 text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-widest rounded-lg shadow-lg shadow-amber-400/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
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

          {/* Resend Timer */}
          <div className="flex items-center justify-between text-xs text-neutral-400 pt-3 border-t border-white/10">
            <span>Didn&apos;t receive code?</span>
            {timer > 0 ? (
              <span className="font-mono text-amber-400 font-bold">
                Resend in {timer}s
              </span>
            ) : (
              <button
                onClick={() => {
                  setTimer(30);
                  alert('A new OTP has been sent via SMS.');
                }}
                className="flex items-center gap-1 text-amber-400 font-bold hover:underline cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
