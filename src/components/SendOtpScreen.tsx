import React, { useState } from 'react';
import { ArrowRight, Check, RefreshCw, ShieldCheck, X, Pencil } from 'lucide-react';
import { auth } from '../lib/firebase';
import { api, ApiError } from '../lib/api';
import { ScreenType, UserFormData } from '../types';
import logoImg from '../assets/images/logo.png';
import { isValidPhone } from '../lib/validation';
import { formatCountdown, useOtpSession } from '../lib/useOtpSession';
import { PhoneInput } from './PhoneInput';
import { OtpDigitsInput } from './OtpDigitsInput';

interface SendOtpScreenProps {
  onVerifySuccess: (data: Partial<UserFormData>) => void;
  onNavigate: (screen: ScreenType) => void;
}

const RECAPTCHA_CONTAINER_ID = 'send-otp-recaptcha';
const EMPTY_OTP = ['', '', '', '', '', ''];

export const SendOtpScreen: React.FC<SendOtpScreenProps> = ({ onVerifySuccess, onNavigate }) => {
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(EMPTY_OTP);
  const [isVerifying, setIsVerifying] = useState(false);
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [formError, setFormError] = useState('');
  const [noAccount, setNoAccount] = useState(false);

  const otp = useOtpSession(RECAPTCHA_CONTAINER_ID, 'login');
  const isOtpSent = !!otp.confirmation;
  const errorMsg = formError || otp.error;

  const phoneError = isValidPhone(mobileNumber) ? '' : 'Enter a valid 10-digit mobile number';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneTouched(true);
    setNoAccount(false);
    if (phoneError) {
      setFormError('Please fix the highlighted field before continuing.');
      return;
    }
    setFormError('');
    const ok = await otp.send(mobileNumber);
    if (ok) setOtpDigits(EMPTY_OTP);
  };

  const handleResend = async () => {
    setFormError('');
    setOtpDigits(EMPTY_OTP);
    await otp.send(mobileNumber);
  };

  const handleChangeNumber = () => {
    otp.changeNumber();
    setOtpDigits(EMPTY_OTP);
    setFormError('');
    setNoAccount(false);
  };

  const handleVerify = async () => {
    const code = otpDigits.join('');
    if (code.length < 6) {
      setFormError('Please enter all 6 digits of the OTP code.');
      return;
    }
    setIsVerifying(true);
    setFormError('');
    try {
      const user = await otp.confirmCode(code);
      if (!user) {
        setOtpDigits(EMPTY_OTP);
        return;
      }
      try {
        const idToken = await user.getIdToken();
        const { user: backendUser } = await api.post<{
          user: { fullName: string; email: string; mobileNumber: string | null };
        }>('/api/auth/session', { idToken });
        onVerifySuccess({
          email: backendUser.email,
          fullName: backendUser.fullName,
          mobileNumber: backendUser.mobileNumber ?? '',
        });
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) {
          // Verified phone but no Scan Connect account: drop the orphan Firebase phone user.
          setNoAccount(true);
          setFormError('No account found for this mobile number.');
          try {
            await user.delete();
          } catch {
            await auth.signOut();
          }
        } else {
          setFormError(err instanceof ApiError ? err.message : 'Verification failed. Please try again.');
        }
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const lockedMsg = otp.isLocked ? `Locked. Try again in ${formatCountdown(otp.lockSecondsLeft)}` : '';

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
                VERIFY IDENTITY
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
              <PhoneInput
                required
                disabled={isOtpSent}
                value={mobileNumber}
                onChange={setMobileNumber}
                onBlur={() => setPhoneTouched(true)}
                hasError={phoneTouched && !!phoneError && !isOtpSent}
                className="h-[52px] rounded-xl"
              />
              {!isOtpSent && phoneTouched && phoneError ? (
                <p className="text-xs font-semibold text-rose-600 mt-1">{phoneError}</p>
              ) : !isOtpSent ? (
                <p className="text-xs font-normal text-neutral-400 mt-1">
                  We&apos;ll send a 6-digit code via SMS
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleChangeNumber}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0F0F0F] hover:underline cursor-pointer min-h-[44px]"
                >
                  <Pencil className="w-3 h-3" /> Wrong number? Change it
                </button>
              )}
            </div>

            {!isOtpSent ? (
              <>
                {errorMsg && (
                  <p role="alert" className="text-xs font-semibold text-rose-600">
                    {errorMsg}{' '}
                    {noAccount && (
                      <button
                        type="button"
                        onClick={() => onNavigate('register')}
                        className="underline font-bold text-[#0F0F0F] cursor-pointer"
                      >
                        Register now
                      </button>
                    )}
                  </p>
                )}
                {lockedMsg && <p className="text-xs font-bold text-[#B58500]">{lockedMsg}</p>}
                {/* Send OTP Button */}
                <button
                  type="submit"
                  disabled={otp.isSending || otp.isLocked}
                  className="w-full h-[52px] bg-[#FFED00] hover:bg-[#e0ac00] text-[#0F0F0F] font-bold text-sm uppercase tracking-wide rounded-xl shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {otp.isSending ? (
                    <span>Sending SMS...</span>
                  ) : (
                    <>
                      <span>Send OTP</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </>
            ) : (
              /* Inline OTP Entry */
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="block text-xs font-semibold tracking-wide text-[#0F0F0F] uppercase">
                    Enter OTP Code
                  </label>
                  <OtpDigitsInput
                    digits={otpDigits}
                    onChange={(d) => {
                      setOtpDigits(d);
                      setFormError('');
                      otp.setError('');
                    }}
                    disabled={otp.isLocked}
                    inputClassName="w-full h-14 text-center text-xl font-bold bg-white border border-neutral-300 text-[#0F0F0F] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFED00] focus:border-transparent transition-all disabled:opacity-50"
                  />
                </div>

                {errorMsg && (
                  <p role="alert" className="text-xs font-semibold text-rose-600">
                    {errorMsg}{' '}
                    {noAccount && (
                      <button
                        type="button"
                        onClick={() => onNavigate('register')}
                        className="underline font-bold text-[#0F0F0F] cursor-pointer"
                      >
                        Register now
                      </button>
                    )}
                  </p>
                )}
                {lockedMsg && <p className="text-xs font-bold text-[#B58500]">{lockedMsg}</p>}

                <button
                  type="button"
                  onClick={handleVerify}
                  disabled={isVerifying || otp.isLocked}
                  className="w-full h-[52px] bg-[#FFED00] hover:bg-[#e0ac00] text-[#0F0F0F] font-bold text-sm uppercase tracking-wide rounded-xl shadow-sm active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
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
                  {otp.timer > 0 ? (
                    <span className="font-bold text-[#0F0F0F]">Resend in {otp.timer}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={otp.isSending || otp.isLocked}
                      className="flex items-center gap-1 text-[#0F0F0F] font-bold hover:underline cursor-pointer disabled:opacity-60 min-h-[44px]"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> {otp.isSending ? 'Sending...' : 'Resend OTP'}
                    </button>
                  )}
                </div>
              </div>
            )}

            <div id={RECAPTCHA_CONTAINER_ID} />

            {/* Contact Support */}
            <div className="text-center text-sm text-neutral-500 font-normal">
              Trouble logging in?{' '}
              <a
                href="https://wa.me/919973878399?text=Hi%20Scan%20Connect%2C%20I%20need%20help%20logging%20in."
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#0F0F0F] font-bold hover:underline cursor-pointer"
              >
                Contact Support
              </a>
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
