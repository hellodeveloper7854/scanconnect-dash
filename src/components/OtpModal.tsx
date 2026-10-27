import React, { useState, useEffect } from 'react';
import { X, Check, RefreshCw, Smartphone, Phone, ArrowRight, Pencil } from 'lucide-react';
import { auth } from '../lib/firebase';
import { api, ApiError } from '../lib/api';
import { isValidPhone } from '../lib/validation';
import { formatCountdown, useOtpSession } from '../lib/useOtpSession';
import { PhoneInput } from './PhoneInput';
import { OtpDigitsInput } from './OtpDigitsInput';

interface OtpModalProps {
  isOpen: boolean;
  mobileNumber: string;
  onClose: () => void;
  onVerifySuccess: (data?: { mobileNumber?: string }) => void;
}

const RECAPTCHA_CONTAINER_ID = 'otp-modal-recaptcha';
const EMPTY_OTP = ['', '', '', '', '', ''];

export const OtpModal: React.FC<OtpModalProps> = ({ isOpen, onClose, onVerifySuccess }) => {
  const [phone, setPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(EMPTY_OTP);
  const [isVerifying, setIsVerifying] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [syncError, setSyncError] = useState('');
  // The phone is linked on Firebase but the backend sync failed — retry only the sync.
  const [pendingSync, setPendingSync] = useState(false);

  const otp = useOtpSession(RECAPTCHA_CONTAINER_ID, auth.currentUser ? 'link' : 'login');
  const { changeNumber } = otp;

  const phoneError = isValidPhone(phone) ? '' : 'Enter a valid 10-digit mobile number';
  const errorMsg = syncError || otp.error;

  useEffect(() => {
    if (!isOpen) return;
    setPhone('');
    setOtpDigits(EMPTY_OTP);
    setSyncError('');
    setPendingSync(false);
    setPhoneTouched(false);
    changeNumber();
  }, [isOpen, changeNumber]);

  if (!isOpen) return null;

  const sendOtp = async () => {
    setPhoneTouched(true);
    setSyncError('');
    if (phoneError) return;
    const ok = await otp.send(phone);
    if (ok) setOtpDigits(EMPTY_OTP);
  };

  const resendOtp = async () => {
    setSyncError('');
    setOtpDigits(EMPTY_OTP);
    await otp.send(phone);
  };

  const syncWithServer = async (): Promise<boolean> => {
    const current = auth.currentUser;
    if (!current) return true; // phone-only sign-in: the login flow establishes the session itself
    try {
      const idToken = await current.getIdToken(true);
      const res = await api.post<{ user: { mobileNumber: string | null } }>('/api/auth/link-mobile', { idToken });
      setPendingSync(false);
      onVerifySuccess({ mobileNumber: res.user.mobileNumber ?? undefined });
      return true;
    } catch (err) {
      setPendingSync(true);
      setSyncError(
        err instanceof ApiError
          ? err.message
          : 'Your number was verified but we could not save it yet. Please tap Verify again.',
      );
      return false;
    }
  };

  const handleVerify = async () => {
    if (pendingSync) {
      setIsVerifying(true);
      await syncWithServer();
      setIsVerifying(false);
      return;
    }
    const code = otpDigits.join('');
    if (code.length < 6) {
      setSyncError('');
      otp.setError('Please enter all 6 digits of the OTP code.');
      return;
    }
    setIsVerifying(true);
    setSyncError('');
    try {
      const user = await otp.confirmCode(code);
      if (!user) {
        setOtpDigits(EMPTY_OTP);
        return;
      }
      if (auth.currentUser) {
        await syncWithServer();
      } else {
        onVerifySuccess();
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleChangeNumber = () => {
    changeNumber();
    setOtpDigits(EMPTY_OTP);
    setSyncError('');
    setPendingSync(false);
  };

  const goToLogin = async () => {
    await auth.signOut();
    window.location.href = '/login';
  };

  const lockedMsg = otp.isLocked ? `Locked. Try again in ${formatCountdown(otp.lockSecondsLeft)}` : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-label="Link your mobile number"
    >
      <div className="relative w-full max-w-md bg-neutral-900/90 border border-white/15 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden text-white">
        {/* Top Glow Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-[#FFED00] shadow-[0_0_10px_#f5b800]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-white rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!otp.confirmation && !pendingSync ? (
          <>
            {/* Modal Header - collect mobile number */}
            <div className="text-center space-y-2 mb-6 pt-2">
              <div className="mx-auto w-12 h-12 rounded-xl bg-[#FFED00]/20 border border-[#FFED00]/40 flex items-center justify-center text-[#FFED00] mb-2">
                <Phone className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight uppercase">Link Your Mobile</h3>
              <p className="text-neutral-400 text-xs">Enter your mobile number to link it to your account via OTP.</p>
            </div>

            <div className="space-y-4">
              <PhoneInput
                value={phone}
                onChange={setPhone}
                onBlur={() => setPhoneTouched(true)}
                hasError={phoneTouched && !!phoneError}
                className="h-14 rounded-lg bg-neutral-200 border-white/20"
                inputClassName="text-center text-base font-bold bg-neutral-200"
              />

              {phoneTouched && phoneError && !errorMsg && (
                <p className="text-xs font-semibold text-rose-400 text-center">{phoneError}</p>
              )}
              {errorMsg && (
                <p role="alert" className="text-xs font-semibold text-rose-400 text-center">
                  {errorMsg}{' '}
                  {otp.numberTaken && (
                    <button onClick={goToLogin} className="underline font-bold text-[#FFED00] cursor-pointer">
                      Log in instead
                    </button>
                  )}
                </p>
              )}

              <button
                onClick={sendOtp}
                disabled={otp.isSending || otp.isLocked}
                className="w-full py-3.5 px-4 bg-[#FFED00] hover:bg-[#e0ac00] text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-widest rounded-lg shadow-lg shadow-[#FFED00]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {otp.isSending ? (
                  <span>SENDING CODE...</span>
                ) : (
                  <>
                    <span>SEND OTP</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button onClick={onClose} className="w-full text-center text-xs text-neutral-400 hover:text-white cursor-pointer">
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
                <span className="text-[#FFED00] font-mono font-bold">+91 {phone}</span>
              </p>
              <button
                onClick={handleChangeNumber}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#FFED00] hover:underline cursor-pointer min-h-[44px]"
              >
                <Pencil className="w-3 h-3" /> Wrong number? Change it
              </button>
            </div>

            {/* OTP Input Fields */}
            <div className="space-y-6">
              <OtpDigitsInput
                digits={otpDigits}
                onChange={(d) => {
                  setOtpDigits(d);
                  setSyncError('');
                  otp.setError('');
                }}
                disabled={otp.isLocked || pendingSync}
                className="sm:gap-3"
                inputClassName="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold font-mono bg-neutral-200 text-neutral-950 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFED00] transition-all disabled:opacity-50"
              />

              {errorMsg && (
                <p role="alert" className="text-xs font-semibold text-rose-400 text-center">
                  {errorMsg}
                </p>
              )}
              {lockedMsg && <p className="text-xs font-bold text-[#FFED00] text-center">{lockedMsg}</p>}

              {/* Verify Button */}
              <button
                onClick={handleVerify}
                disabled={isVerifying || otp.isLocked}
                className="w-full py-3.5 px-4 bg-[#FFED00] hover:bg-[#e0ac00] text-neutral-950 font-black text-xs sm:text-sm uppercase tracking-widest rounded-lg shadow-lg shadow-[#FFED00]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
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
              {!pendingSync && (
                <div className="flex items-center justify-between text-xs text-neutral-400 pt-3 border-t border-white/10">
                  <span>Didn&apos;t receive code?</span>
                  {otp.timer > 0 ? (
                    <span className="font-mono text-[#FFED00] font-bold">Resend in {otp.timer}s</span>
                  ) : (
                    <button
                      onClick={resendOtp}
                      disabled={otp.isSending || otp.isLocked}
                      className="flex items-center gap-1 text-[#FFED00] font-bold hover:underline cursor-pointer disabled:opacity-60 min-h-[44px]"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> {otp.isSending ? 'Sending...' : 'Resend OTP'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* Always mounted so Resend (which happens on the OTP step) always has a container for a fresh verifier. */}
        <div id={RECAPTCHA_CONTAINER_ID} />
      </div>
    </div>
  );
};
