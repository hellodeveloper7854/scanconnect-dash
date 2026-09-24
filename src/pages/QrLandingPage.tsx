import React, { useEffect, useRef, useState } from 'react';
import {
  signInWithPhoneNumber,
  linkWithCredential,
  EmailAuthProvider,
  type ConfirmationResult,
} from 'firebase/auth';
import {
  QrCode as QrCodeIcon,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Phone,
  Car,
  Lock,
  ShieldOff,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { auth, getRecaptchaVerifier } from '../lib/firebase';
import { api, ApiError } from '../lib/api';
import { ScanResultCard, type CallTarget } from '../components/ScanResultCard';
import logo from '../assets/images/logo.png';
import carIcon from '../assets/images/caricon.png';

const WHATSAPP_SUPPORT_NUMBER = '919973878399';

const VEHICLE_TYPES = ['Car', 'Bike', 'Scooter', 'Truck', 'Bus', 'Other'];

const RECAPTCHA_CONTAINER_ID = 'qr-activation-recaptcha';

type Stage = 'loading' | 'invalid' | 'disabled' | 'inactive-prompt' | 'wizard' | 'success' | 'details';

interface VehicleData {
  registration: string;
  nickname: string | null;
  vehicleType: string | null;
  brand: string | null;
  model: string | null;
  fuelType: string | null;
  color: string | null;
}

/** Shape returned by GET /:code/details and POST /:code/activate — no phone numbers. */
interface DetailsData {
  owner: { fullName: string };
  vehicle: VehicleData;
  emergencyContacts: { name: string; role: string | null }[];
}

/** Shape returned by POST /:code/verify — includes phone numbers, once the last-4 check passes. */
interface VerifiedData {
  owner: { fullName: string; mobileNumber: string | null };
  vehicle: VehicleData;
  emergencyContacts: { name: string; role: string | null; phone: string }[];
}

const CardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen w-full bg-[#FAFAF9] flex flex-col items-center px-4 py-10 sm:py-16 font-['Hanken_Grotesk']">
    <div className="w-full max-w-md space-y-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <a href="/" className="cursor-pointer">
          <img src={logo} alt="ScanConnect" className="h-9 w-auto object-contain" />
        </a>
      </div>
      {children}
    </div>
  </div>
);

/** Response shape of POST /:code/masked-call. */
interface MaskedCallResult {
  virtualNumber: string;
  isMasked: boolean;
  destinationPhone: string;
  callerPhone: string;
}

/**
 * Shown once someone has already picked a contact method (Masked Call or
 * Message) from the inline choice on the details card. Two internal screens:
 *  1. "verify" — enter the last 4 registration digits, plus (for a masked
 *     call only) the caller's own phone number, so a future Knowlarity
 *     SR-number/click-to-call integration has a real request to connect.
 *  2. "call" — a 90-second countdown and a "Call <number>" button that opens
 *     the phone's own dialer. Until Knowlarity is wired up server-side, the
 *     number dialed is the real destination number (see masked-call route).
 * Message (WhatsApp) skips the caller-phone field and the call screen,
 * verifying then opening wa.me directly.
 */
const CallVerifyModal: React.FC<{ code: string; target: CallTarget; method: 'call' | 'message'; onClose: () => void }> = ({
  code,
  target,
  method,
  onClose,
}) => {
  const [last4, setLast4] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [maskedCall, setMaskedCall] = useState<MaskedCallResult | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(90);

  useEffect(() => {
    if (!maskedCall) return;
    if (secondsLeft <= 0) {
      onClose();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [maskedCall, secondsLeft, onClose]);

  const handleVerifyForMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const result = await api.post<VerifiedData>(`/api/qr/${code}/verify`, { last4 });
      const phone =
        target.kind === 'owner' ? result.owner.mobileNumber : result.emergencyContacts[target.index]?.phone;
      if (phone) {
        window.open(`https://wa.me/${phone.replace(/\D/g, '')}`, '_blank', 'noopener,noreferrer');
        onClose();
      } else {
        onClose();
      }
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetupMaskedCall = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const result = await api.post<MaskedCallResult>(`/api/qr/${code}/masked-call`, {
        last4,
        callerPhone,
        target,
      });
      setMaskedCall(result);
      setSecondsLeft(90);
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Screen 3: countdown + call button, after a masked call has been set up.
  if (maskedCall) {
    return (
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
          <div className="text-center space-y-1">
            <Phone className="w-8 h-8 text-[#1B1C1C] mx-auto" />
            <h1 className="font-['Rubik'] font-bold text-xl text-[#1B1C1C]">Call the Vehicle Owner</h1>
            <p className="text-sm text-[#5F5E5E]">
              You have {secondsLeft} seconds. Abuse will block your number.
            </p>
          </div>

          <ul className="text-xs text-[#5F5E5E] space-y-1 list-disc list-inside">
            <li>Do not use this for theft, harassment, or stalking.</li>
            <li>Do not use this for spam or marketing calls.</li>
            <li>Do not use this to buy, sell, or rent the vehicle.</li>
          </ul>

          <a
            href={`tel:${maskedCall.virtualNumber}`}
            className="w-full h-[52px] bg-[#FFED00] hover:bg-[#e0ac00] rounded-lg font-bold text-[#1B1C1C] shadow-xs transition-colors cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            <Phone className="w-4 h-4" />
            Call {maskedCall.virtualNumber}
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full h-[44px] bg-[#EFEDED] text-[#5D5F5F] font-bold rounded-lg cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // Verify last-4 digits (+ caller's phone for a masked call).
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
        <form onSubmit={method === 'call' ? handleSetupMaskedCall : handleVerifyForMessage} className="space-y-4">
          <div className="text-center space-y-1">
            <Car className="w-8 h-8 text-[#1B1C1C] mx-auto" />
            <h1 className="font-['Rubik'] font-bold text-xl text-[#1B1C1C]">Verify the Plate Number</h1>
            <p className="text-sm text-[#5F5E5E]">Enter the last 4 digits of the vehicle&apos;s plate.</p>
          </div>

          <input
            type="text"
            required
            maxLength={4}
            autoFocus
            value={last4}
            onChange={(e) => {
              setLast4(e.target.value.toUpperCase());
              setErrorMsg('');
            }}
            placeholder="e.g. 1234"
            className="w-full h-[54px] text-center text-lg font-mono tracking-[6px] bg-white border border-[#CCC7AA] rounded-lg outline-none focus:ring-2 focus:ring-[#FFED00]"
          />

          {method === 'call' && (
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5D5F5F]">
                Your phone (needed for a masked call)
              </label>
              <input
                type="tel"
                required
                value={callerPhone}
                onChange={(e) => {
                  setCallerPhone(e.target.value);
                  setErrorMsg('');
                }}
                placeholder="+91 98765 43210"
                className="w-full h-[48px] px-3 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
              />
            </div>
          )}

          {errorMsg && <p className="text-sm font-semibold text-red-600 text-center">{errorMsg}</p>}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-[48px] bg-[#EFEDED] text-[#5D5F5F] font-bold rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || last4.length !== 4 || (method === 'call' && !callerPhone.trim())}
              className="flex-1 h-[48px] bg-[#FFED00] hover:bg-[#e0ac00] rounded-lg font-bold text-[#1B1C1C] shadow-xs transition-colors cursor-pointer active:scale-95 disabled:opacity-60"
            >
              {isSubmitting ? 'Checking...' : method === 'call' ? 'Setup Masked Call' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/** 4-step stepper header shared by every step of the activation wizard, styled after the reference flow's dot-and-line progress bar. */
const WizardStepper: React.FC<{ step: 1 | 2 | 3 | 4 }> = ({ step }) => (
  <div className="flex items-center justify-center gap-2">
    {[1, 2, 3, 4].map((n) => (
      <React.Fragment key={n}>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
            step === n ? 'bg-[#FFED00] text-[#1B1C1C]' : step > n ? 'bg-[#FFED00]/30 text-[#736B00]' : 'bg-[#E9E8E7] text-[#6B7280]'
          }`}
        >
          {step > n ? <Check className="w-4 h-4" /> : n}
        </div>
        {n < 4 && <div className="w-6 h-[2px] bg-[#CCC7AA]" />}
      </React.Fragment>
    ))}
  </div>
);

const ActivationWizard: React.FC<{ code: string; onDone: (r: DetailsData) => void }> = ({ code, onDone }) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: vehicle
  const [vehicleType, setVehicleType] = useState('');
  const [registration, setRegistration] = useState('');
  const [noRegistrationYet, setNoRegistrationYet] = useState(false);

  // Step 2: phone + OTP
  const [mobileNumber, setMobileNumber] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpTimer, setOtpTimer] = useState(30);
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!isOtpSent || otpTimer <= 0) return;
    const interval = setInterval(() => setOtpTimer((t) => t - 1), 1000);
    return () => clearInterval(interval);
  }, [isOtpSent, otpTimer]);

  // Step 3: emergency contacts (Family required, Friend optional)
  const [familyName, setFamilyName] = useState('');
  const [familyPhone, setFamilyPhone] = useState('');
  const [friendName, setFriendName] = useState('');
  const [friendPhone, setFriendPhone] = useState('');
  const [contactsSkipped, setContactsSkipped] = useState(false);

  // Step 4: complete profile
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const step1Valid = vehicleType.trim().length > 0 && (noRegistrationYet || registration.trim().length > 0);
  const step3Valid = contactsSkipped || (familyName.trim().length > 0 && familyPhone.trim().length > 0);
  const step4Valid =
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    password.length >= 6 &&
    password === confirmPassword;

  const sendOtp = async () => {
    if (!mobileNumber.trim()) return;
    setSubmitError('');
    setIsSendingOtp(true);
    try {
      const verifier = getRecaptchaVerifier(RECAPTCHA_CONTAINER_ID);
      const result = await signInWithPhoneNumber(auth, mobileNumber.trim(), verifier);
      setConfirmation(result);
      setIsOtpSent(true);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpTimer(30);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message.replace('Firebase: ', '') : 'Failed to send OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleOtpDigitChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const next = [...otpDigits];
    next[index] = value.slice(-1);
    setOtpDigits(next);
    setSubmitError('');
    if (value && index < 5) otpInputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const code = otpDigits.join('');
    if (code.length < 6) {
      setSubmitError('Please enter all 6 digits of the OTP code.');
      return;
    }
    if (!confirmation) {
      setSubmitError('OTP session expired. Please resend the code.');
      return;
    }
    setIsVerifyingOtp(true);
    setSubmitError('');
    try {
      const credential = await confirmation.confirm(code);
      const idToken = await credential.user.getIdToken();
      await api.post('/api/auth/phone-session', { idToken });
      setIsPhoneVerified(true);
      setStep(3);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Verification failed. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleFinish = async () => {
    setSubmitError('');
    setIsSubmitting(true);
    try {
      if (!auth.currentUser) {
        throw new Error('Your session expired. Please verify your phone number again.');
      }

      // Link an email/password credential to the phone-authed Firebase user,
      // then fill in the real name/email that /phone-session left as
      // placeholders, so the account is fully usable going forward.
      const accountEmail = `${mobileNumber.replace(/\D/g, '')}@scanconnect.in`;
      const credential = EmailAuthProvider.credential(accountEmail, password);
      await linkWithCredential(auth.currentUser, credential);
      const idToken = await auth.currentUser.getIdToken(true);
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      await api.post('/api/auth/register', { idToken, fullName, email: accountEmail });

      const payload = {
        personal: { fullName },
        emergencyContacts: contactsSkipped
          ? []
          : [
              { kind: 'new' as const, name: familyName.trim(), phone: familyPhone.trim(), role: 'Family' },
              ...(friendName.trim() && friendPhone.trim()
                ? [{ kind: 'new' as const, name: friendName.trim(), phone: friendPhone.trim(), role: 'Friend' }]
                : []),
            ],
        vehicle: {
          registration: noRegistrationYet ? 'PENDING' : registration.trim().toUpperCase(),
          vehicleType: vehicleType.trim(),
        },
      };
      const result = await api.post<VerifiedData>(`/api/qr/${code}/activate`, payload);
      onDone(result);
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message);
      } else if (err instanceof Error) {
        setSubmitError(err.message.replace('Firebase: ', ''));
      } else {
        setSubmitError('Failed to activate. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <WizardStepper step={step} />

      {step === 1 && (
        <div className="space-y-4">
          <div className="flex flex-col items-center gap-2 text-center">
            <img src={carIcon} alt="" className="w-16 h-16 object-contain" />
            <h1 className="font-['Rubik'] font-bold text-lg text-[#1B1C1C]">Activate Your QR Sticker</h1>
            <p className="text-xs text-[#5F5E5E]">
              Code <span className="font-bold text-[#1B1C1C]">{code}</span>
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5D5F5F]">Vehicle Type</label>
            <select
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
              className="w-full h-[46px] px-3 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00] cursor-pointer"
            >
              <option value="">Select vehicle type</option>
              {VEHICLE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5D5F5F]">Vehicle Registration Number</label>
            <input
              type="text"
              disabled={noRegistrationYet}
              value={registration}
              onChange={(e) => setRegistration(e.target.value.toUpperCase())}
              placeholder="e.g. KA01AB1234"
              className="w-full h-[46px] px-3 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00] disabled:bg-[#F5F3F3] disabled:text-[#5F5E5E]"
            />
            <label className="flex items-start gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                checked={noRegistrationYet}
                onChange={(e) => {
                  setNoRegistrationYet(e.target.checked);
                  if (e.target.checked) setRegistration('');
                }}
                className="mt-0.5 w-4 h-4 accent-[#FFED00]"
              />
              <span className="text-[11px] text-[#5F5E5E]">
                I don&apos;t have my registration number yet. You can add it later from your dashboard.
              </span>
            </label>
          </div>

          {submitError && <p className="text-sm font-semibold text-red-600">{submitError}</p>}

          <button
            onClick={() => setStep(2)}
            disabled={!step1Valid}
            className="w-full h-[48px] bg-[#FFED00] hover:bg-[#e0ac00] rounded-lg font-bold text-[#1B1C1C] transition-colors cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            Next — Enter Your Details <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h1 className="font-['Rubik'] font-bold text-lg text-[#1B1C1C]">Your Details</h1>
            <p className="text-xs text-[#5F5E5E]">
              Vehicle: <span className="font-bold text-[#1B1C1C]">{noRegistrationYet ? 'Pending' : registration}</span>
            </p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5D5F5F]">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="tel"
                required
                disabled={isOtpSent}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full h-[46px] pl-10 pr-3 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00] disabled:bg-[#F5F3F3] disabled:text-[#5F5E5E]"
              />
            </div>
          </div>

          {!isOtpSent ? (
            <button
              onClick={sendOtp}
              disabled={isSendingOtp || !mobileNumber.trim()}
              className="w-full h-[48px] bg-[#FFED00] hover:bg-[#e0ac00] rounded-lg font-bold text-[#1B1C1C] transition-colors cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSendingOtp ? 'Sending OTP...' : 'Send OTP via WhatsApp/SMS'}
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[#5F5E5E] text-center">
                OTP sent to your phone. Check your messages.
              </p>
              <div className="flex justify-between gap-2">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    ref={(el) => (otpInputRefs.current[index] = el)}
                    onChange={(e) => handleOtpDigitChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-full h-12 text-center text-lg font-bold bg-white border border-[#CCC7AA] rounded-lg outline-none focus:ring-2 focus:ring-[#FFED00]"
                  />
                ))}
              </div>

              <button
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp}
                className="w-full h-[48px] bg-[#FFED00] hover:bg-[#e0ac00] rounded-lg font-bold text-[#1B1C1C] transition-colors cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isVerifyingOtp ? 'Verifying...' : 'Verify & Activate QR'}
              </button>

              <div className="flex items-center justify-between text-xs text-[#5F5E5E]">
                <span>Didn&apos;t receive code?</span>
                {otpTimer > 0 ? (
                  <span className="font-bold text-[#1B1C1C]">Resend in {otpTimer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={sendOtp}
                    className="flex items-center gap-1 text-[#1B1C1C] font-bold hover:underline cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          <div id={RECAPTCHA_CONTAINER_ID} />

          {submitError && <p className="text-sm font-semibold text-red-600 text-center">{submitError}</p>}

          {!isOtpSent && (
            <button
              onClick={() => setStep(1)}
              className="w-full h-[44px] border border-[#1B1C1C] rounded-lg font-bold text-[#1B1C1C] cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back to vehicle details
            </button>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h1 className="font-['Rubik'] font-bold text-lg text-[#1B1C1C]">Emergency Contacts</h1>
            <p className="text-xs text-[#5F5E5E]">
              If something urgent happens with your vehicle, scanners can reach your nominated contacts — without
              seeing their numbers.
            </p>
          </div>

          <div className="space-y-3 border border-[#CCC7AA] rounded-lg p-3">
            <p className="text-xs font-bold text-[#5D5F5F]">
              Family contact <span className="text-red-500">*</span>
            </p>
            <p className="text-[10px] text-[#9CA3AF] -mt-2">
              Just a name and number — you can fine-tune later in your dashboard.
            </p>
            <input
              type="text"
              value={familyName}
              onChange={(e) => setFamilyName(e.target.value)}
              placeholder="Contact name — e.g. Priya (spouse)"
              className="w-full h-[42px] px-3 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
            />
            <input
              type="text"
              value={familyPhone}
              onChange={(e) => setFamilyPhone(e.target.value)}
              placeholder="Mobile number — 98765 43210"
              className="w-full h-[42px] px-3 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
            />
          </div>

          <div className="space-y-3 border border-[#CCC7AA] rounded-lg p-3">
            <p className="text-xs font-bold text-[#5D5F5F]">
              Friend contact <span className="text-[#9CA3AF] font-normal">(optional)</span>
            </p>
            <input
              type="text"
              value={friendName}
              onChange={(e) => setFriendName(e.target.value)}
              placeholder="Contact name — e.g. Priya (spouse)"
              className="w-full h-[42px] px-3 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
            />
            <input
              type="text"
              value={friendPhone}
              onChange={(e) => setFriendPhone(e.target.value)}
              placeholder="Mobile number — 98765 43210"
              className="w-full h-[42px] px-3 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
            />
          </div>

          {submitError && <p className="text-sm font-semibold text-red-600">{submitError}</p>}

          <button
            onClick={() => {
              setContactsSkipped(false);
              setStep(4);
            }}
            disabled={!step3Valid}
            className="w-full h-[48px] bg-[#FFED00] hover:bg-[#e0ac00] rounded-lg font-bold text-[#1B1C1C] transition-colors cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            Save & Continue <ArrowRight className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setContactsSkipped(true);
              setStep(4);
            }}
            className="w-full text-center text-xs font-bold text-[#5F5E5E] hover:underline cursor-pointer"
          >
            Skip for now
          </button>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h1 className="font-['Rubik'] font-bold text-lg text-[#1B1C1C]">Complete Your Profile</h1>
            <p className="text-xs text-[#5F5E5E]">Add your name and set a password to secure your account.</p>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5D5F5F]">Username (Phone Number)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="text"
                disabled
                value={mobileNumber}
                className="w-full h-[46px] pl-10 pr-3 bg-[#F5F3F3] border border-[#CCC7AA] rounded-lg text-sm text-[#5F5E5E] outline-none"
              />
            </div>
            <p className="text-[10px] text-[#9CA3AF]">This is your login username. It cannot be changed.</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5D5F5F]">First Name</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="w-full h-[44px] px-3 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5D5F5F]">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="w-full h-[44px] px-3 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5D5F5F]">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full h-[46px] pl-10 pr-10 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1B1C1C] cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5D5F5F]">Confirm Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Type password again"
                className="w-full h-[46px] pl-10 pr-10 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-[#1B1C1C] cursor-pointer"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword.length > 0 && password !== confirmPassword && (
              <p className="text-[10px] text-red-600">Passwords do not match.</p>
            )}
          </div>

          {submitError && <p className="text-sm font-semibold text-red-600">{submitError}</p>}

          <button
            onClick={handleFinish}
            disabled={!step4Valid || isSubmitting || !isPhoneVerified}
            className="w-full h-[48px] bg-[#FFED00] hover:bg-[#e0ac00] rounded-lg font-bold text-[#1B1C1C] transition-colors cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSubmitting ? 'Activating...' : 'Save & Continue'}
          </button>
        </div>
      )}
    </div>
  );
};

export const QrLandingPage: React.FC<{ code: string }> = ({ code }) => {
  const [stage, setStage] = useState<Stage>('loading');
  const [statusChecked, setStatusChecked] = useState(false);
  const [pendingStage, setPendingStage] = useState<'inactive-prompt' | 'details' | null>(null);
  const [detailsData, setDetailsData] = useState<DetailsData | null>(null);
  const [callChoice, setCallChoice] = useState<{ target: CallTarget; method: 'call' | 'message' } | null>(null);

  useEffect(() => {
    api
      .get<{ status: 'INACTIVE' | 'ACTIVE' | 'DISABLED' }>(`/api/qr/${code}`)
      .then((res) => {
        if (res.status === 'DISABLED') {
          setPendingStage('disabled');
          setStatusChecked(true);
          return;
        }
        if (res.status === 'ACTIVE') {
          return api.get<DetailsData>(`/api/qr/${code}/details`).then((details) => {
            setDetailsData(details);
            setPendingStage('details');
            setStatusChecked(true);
          });
        }
        setPendingStage('inactive-prompt');
        setStatusChecked(true);
      })
      .catch(() => {
        setStage('invalid');
        setStatusChecked(true);
      });
  }, [code]);

  useEffect(() => {
    if (statusChecked && pendingStage && stage === 'loading') {
      setStage(pendingStage);
    }
  }, [statusChecked, pendingStage, stage]);

  if (stage === 'loading') {
    return (
      <CardShell>
        <p className="text-center text-[#5F5E5E] text-sm">Loading...</p>
      </CardShell>
    );
  }

  if (stage === 'invalid') {
    return (
      <CardShell>
        <div className="text-center space-y-2">
          <QrCodeIcon className="w-10 h-10 text-[#9CA3AF] mx-auto" />
          <h1 className="font-['Rubik'] font-bold text-xl text-[#1B1C1C]">QR Code Not Recognized</h1>
          <p className="text-sm text-[#5F5E5E]">
            This code isn&apos;t registered in our system. If you believe this is an error, please contact support.
          </p>
        </div>
      </CardShell>
    );
  }

  if (stage === 'disabled') {
    return (
      <CardShell>
        <div className="text-center space-y-2">
          <ShieldOff className="w-10 h-10 text-[#D6272C] mx-auto" />
          <h1 className="font-['Rubik'] font-bold text-xl text-[#1B1C1C]">This QR is Disabled</h1>
          <p className="text-sm text-[#5F5E5E]">Please contact the support team.</p>
        </div>
      </CardShell>
    );
  }

  if (stage === 'inactive-prompt') {
    return (
      <CardShell>
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center mx-auto">
            <img src={carIcon} alt="" className="w-24 h-24 object-contain" />
          </div>
          <h1 className="font-['Rubik'] font-bold text-xl text-[#1B1C1C]">Activate This QR Tag?</h1>
          <p className="text-sm text-[#5F5E5E]">
            This tag hasn&apos;t been claimed yet. Activate it to link it to your vehicle, personal details, and
            emergency contact.
          </p>
          <button
            onClick={() => setStage('wizard')}
            className="w-full h-[52px] bg-[#FFED00] hover:bg-[#e0ac00] rounded-lg font-bold text-[#1B1C1C] shadow-xs transition-colors cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            Yes, Activate <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-xs text-[#8B5CF6]">
            If you need any help please{' '}
            <a
              href={`https://wa.me/${WHATSAPP_SUPPORT_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline hover:text-[#7C3AED] cursor-pointer"
            >
              click here WhatsApp Live Support
            </a>
          </p>
        </div>
      </CardShell>
    );
  }

  if (stage === 'wizard') {
    return (
      <CardShell>
        <ActivationWizard
          code={code}
          onDone={(result) => {
            setDetailsData(result);
            setStage('success');
          }}
        />
      </CardShell>
    );
  }

  if (stage === 'success') {
    return (
      <CardShell>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#FFED00] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9 text-[#1B1C1C]" />
          </div>
          <h1 className="font-['Rubik'] font-bold text-xl text-[#1B1C1C]">QR Activated!</h1>
          <p className="text-sm text-[#5F5E5E]">
            Your sticker <span className="font-bold text-[#1B1C1C]">{code}</span> is now live. Anyone who scans it
            can contact you securely.
          </p>
          <button
            onClick={() => setStage('details')}
            className="w-full h-[48px] bg-[#FFED00] hover:bg-[#e0ac00] rounded-lg font-bold text-[#1B1C1C] shadow-xs transition-colors cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            Preview Your QR Page <ArrowRight className="w-4 h-4" />
          </button>
          <a
            href="/"
            className="w-full h-[48px] border border-[#1B1C1C] rounded-lg font-bold text-[#1B1C1C] cursor-pointer flex items-center justify-center gap-2"
          >
            Go to Dashboard
          </a>

          <div className="text-left space-y-2 pt-2">
            <p className="text-xs font-bold text-[#5D5F5F]">What&apos;s next?</p>
            <ul className="text-xs text-[#5F5E5E] space-y-1.5 list-disc list-inside">
              <li>Stick it on your vehicle — place the sticker where it&apos;s easily visible.</li>
              <li>Your number stays private — scanners contact you via WhatsApp/call, they never see your phone number.</li>
              <li>Customize in your dashboard — toggle call masking, update vehicle details, manage contacts.</li>
            </ul>
          </div>
        </div>
      </CardShell>
    );
  }

  if (stage === 'details' && detailsData) {
    return (
      <>
        <ScanResultCard
          label={`QR Code ${code}`}
          owner={detailsData.owner}
          vehicle={detailsData.vehicle}
          emergencyContacts={detailsData.emergencyContacts}
          onChooseMethod={(target, method) => setCallChoice({ target, method })}
        />
        {callChoice && (
          <CallVerifyModal
            code={code}
            target={callChoice.target}
            method={callChoice.method}
            onClose={() => setCallChoice(null)}
          />
        )}
      </>
    );
  }

  return null;
};
