import React, { useState, useEffect, useRef } from 'react';
import { X, Check, RefreshCw, Smartphone, Phone, ArrowRight } from 'lucide-react';
import {
  PhoneAuthProvider,
  linkWithCredential,
  signInWithPhoneNumber,
  type ConfirmationResult,
} from 'firebase/auth';
import { auth, getRecaptchaVerifier } from '../lib/firebase';
import { api, ApiError } from '../lib/api';

interface OtpModalProps {
  isOpen: boolean;
  mobileNumber: string;
  onClose: () => void;
  onVerifySuccess: () => void;
}

const RECAPTCHA_CONTAINER_ID = 'otp-modal-recaptcha';

export const OtpModal: React.FC<OtpModalProps> = ({ isOpen, onClose, onVerifySuccess }) => {
  const [phone, setPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setPhone('');
    setOtpDigits(['', '', '', '', '', '']);
    setErrorMsg('');
    setConfirmation(null);
  }, [isOpen]);

  useEffect(() => {
    if (!confirmation || timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [confirmation, timer]);

  if (!isOpen) return null;

  const sendOtp = async () => {
    if (!phone.trim()) {
      setErrorMsg('Please enter your mobile number.');
      return;
    }
    setIsSending(true);
    setErrorMsg('');
    try {
      const verifier = getRecaptchaVerifier(RECAPTCHA_CONTAINER_ID);
      const result = await signInWithPhoneNumber(auth, phone.trim(), verifier);
      setConfirmation(result);
      setOtpDigits(['', '', '', '', '', '']);
      setTimer(30);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message.replace('Firebase: ', '') : 'Failed to send OTP.');
    } finally {
      setIsSending(false);
    }
  };

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setErrorMsg('');

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
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
      const phoneCredential = PhoneAuthProvider.credential(confirmation.verificationId, code);

      if (auth.currentUser) {
        // Already signed in (post-registration): link the phone number to the
        // same Firebase account that owns the email, so both resolve to one user.
        await linkWithCredential(auth.currentUser, phoneCredential);
        const idToken = await auth.currentUser.getIdToken(true);
        await api.post('/api/auth/link-mobile', { idToken });
      }

      onVerifySuccess();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md bg-neutral-900/90 border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden text-white">

        {/* Top Glow Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-[#FFED00] shadow-[0_0_10px_#f5b800]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!confirmation ? (
          <>
            {/* Modal Header - collect mobile number */}
            <div className="text-center space-y-2 mb-6 pt-2">
              <div className="mx-auto w-12 h-12 rounded-xl bg-[#FFED00]/20 border border-[#FFED00]/40 flex items-center justify-center text-[#FFED00] mb-2">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight uppercase">Link Your Mobile</h3>
              <p className="text-neutral-400 text-xs">
                Enter your mobile number to link it to your account via OTP.
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full h-14 px-4 text-center text-base font-bold bg-neutral-200 text-neutral-950 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFED00] transition-all"
              />

              <div id={RECAPTCHA_CONTAINER_ID} />

              {errorMsg && <p className="text-xs font-semibold text-rose-400 text-center">{errorMsg}</p>}

              <button
                onClick={sendOtp}
                disabled={isSending}
                className="w-full py-3.5 px-4 bg-[#FFED00] hover:bg-[#e0ac00] text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-widest rounded-lg shadow-lg shadow-[#FFED00]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSending ? (
                  <span>SENDING CODE...</span>
                ) : (
                  <>
                    <span>SEND OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                onClick={onClose}
                className="w-full text-center text-xs text-neutral-400 hover:text-white cursor-pointer"
              >
                Skip for now
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Modal Header - verify OTP */}
            <div className="text-center space-y-2 mb-6 pt-2">
              <div className="mx-auto w-12 h-12 rounded-xl bg-[#FFED00]/20 border border-[#FFED00]/40 flex items-center justify-center text-[#FFED00] mb-2">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight uppercase">ENTER OTP CODE</h3>
              <p className="text-neutral-400 text-xs">
                We sent a 6-digit verification code to{' '}
                <span className="text-[#FFED00] font-mono font-bold">{phone}</span>
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
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono bg-neutral-200 text-neutral-950 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFED00] transition-all"
                  />
                ))}
              </div>

              {errorMsg && <p className="text-xs font-semibold text-rose-400 text-center">{errorMsg}</p>}

              {/* Verify Button */}
              <button
                onClick={handleVerify}
                disabled={isVerifying}
                className="w-full py-3.5 px-4 bg-[#FFED00] hover:bg-[#e0ac00] text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-widest rounded-lg shadow-lg shadow-[#FFED00]/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
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
                  <span className="font-mono text-[#FFED00] font-bold">Resend in {timer}s</span>
                ) : (
                  <button
                    onClick={sendOtp}
                    disabled={isSending}
                    className="flex items-center gap-1 text-[#FFED00] font-bold hover:underline cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
