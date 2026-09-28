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
  Lock,
  Mail,
  ShieldOff,
  RefreshCw,
  Eye,
  EyeOff,
  Sun,
  ParkingCircle,
  Truck,
  Maximize2,
  AlertTriangle,
  MessageCircle,
  MessageSquare,
  Bell,
  Star,
  Share2,
  Car,
} from 'lucide-react';
import { auth, getRecaptchaVerifier } from '../lib/firebase';
import { api, ApiError } from '../lib/api';
import { ScanResultCard, ScanHeader, type CallTarget } from '../components/ScanResultCard';
import {
  isValidName,
  isValidPhone,
  isValidEmail,
  isValidPassword,
  VALIDATION_MESSAGES,
  PASSWORD_HINT,
  getAuthErrorMessage,
} from '../lib/validation';
import logo from '../assets/images/logo.png';
import carIcon from '../assets/images/caricon.png';
import carPlatePhoto from '../assets/images/carnp.jpeg';

const WHATSAPP_SUPPORT_NUMBER = '919973878399';

const VEHICLE_TYPES = ['Car', 'Bike', 'Scooter', 'Truck', 'Bus', 'Other'];

const CONTACT_REASONS = [
  { label: 'The lights of this car are on.', icon: Sun },
  { label: 'The car is in no parking.', icon: ParkingCircle },
  { label: 'The car is getting towed.', icon: Truck },
  { label: 'The window or car is open.', icon: Maximize2 },
  { label: 'Something wrong with this car.', icon: AlertTriangle },
];

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

/**
 * TEMPORARY (testing only): shape returned by GET /:code/test-contact-numbers
 * — real phone numbers with no verification, for trying Masked Call/Message
 * while a masking provider isn't wired up. Remove alongside that route once
 * /verify + /masked-call are used for real.
 */
interface TestContactNumbers {
  registrationLast4: string;
  owner: { mobileNumber: string | null };
  emergencyContacts: { phone: string }[];
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

/**
 * Shown once someone has already picked a contact method (Masked Call or
 * Message) from the inline choice on the details card. Internal screens:
 *  1. "verify" — enter the last 4 registration digits, plus (for a masked
 *     call only) the caller's own phone number, so a future Knowlarity
 *     SR-number/click-to-call integration has a real request to connect.
 *  2. "reason" — pick why the owner is being contacted, shown for both
 *     methods once verification passes.
 *  3a. "call" — a 90-second countdown and a "Call <number>" button that opens
 *      the phone's own dialer (masked call only).
 *  3b. "sent" — confirmation screen after a WhatsApp message is opened.
 *
 * TEMPORARY (testing only): fetches real numbers from
 * GET /:code/test-contact-numbers and checks the last-4 digits client-side,
 * so masked-call/message can be tried without a masking provider wired up
 * yet. /verify and /masked-call are untouched — swap back to posting to
 * those once Knowlarity (or similar) is integrated, so the phone number
 * never reaches the client before the digit check passes server-side.
 */
const CallVerifyModal: React.FC<{
  code: string;
  target: CallTarget;
  method: 'call' | 'message';
  /** Masked registration prefix shown next to the last-4 input, e.g. "JH05ED" from "JH05ED••••". */
  platePrefix: string;
  onClose: () => void;
}> = ({ code, target, method, platePrefix, onClose }) => {
  const [screen, setScreen] = useState<'verify' | 'reason' | 'call' | 'sent'>('verify');
  const [last4, setLast4] = useState('');
  const [callerPhone, setCallerPhone] = useState('');
  const [reason, setReason] = useState(CONTACT_REASONS[0].label);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [callNumber, setCallNumber] = useState<string | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(90);
  const [testData, setTestData] = useState<TestContactNumbers | null>(null);
  const [callerPhoneTouched, setCallerPhoneTouched] = useState(false);

  const callerPhoneError =
    method === 'call' && !isValidPhone(callerPhone) ? VALIDATION_MESSAGES.phone : '';

  useEffect(() => {
    api
      .get<TestContactNumbers>(`/api/qr/${code}/test-contact-numbers`)
      .then(setTestData)
      .catch(() => setErrorMsg('Could not load contact info. Please try again.'));
  }, [code]);

  useEffect(() => {
    if (screen !== 'call') return;
    if (secondsLeft <= 0) {
      onClose();
      return;
    }
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [screen, secondsLeft, onClose]);

  const checkLast4 = () => last4.toUpperCase() === (testData?.registrationLast4 ?? '').toUpperCase();

  const targetPhone = testData
    ? target.kind === 'owner'
      ? testData.owner.mobileNumber
      : testData.emergencyContacts[target.index]?.phone
    : null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setCallerPhoneTouched(true);
    if (!checkLast4()) {
      setErrorMsg('Incorrect digits. Please try again.');
      return;
    }
    if (callerPhoneError) {
      setErrorMsg('Please fix the highlighted field before continuing.');
      return;
    }
    if (!targetPhone) {
      setErrorMsg('No phone number available for this contact.');
      return;
    }
    // Masked Call skips the contact-reason step and goes straight to the
    // call/countdown screen; only Message (WhatsApp) asks for a reason.
    if (method === 'call') {
      setCallNumber(targetPhone);
      setSecondsLeft(90);
      setScreen('call');
    } else {
      setScreen('reason');
    }
  };

  const handleSendReason = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPhone) return;
    setIsSubmitting(true);
    window.open(
      `https://wa.me/${targetPhone.replace(/\D/g, '')}?text=${encodeURIComponent(reason)}`,
      '_blank',
      'noopener,noreferrer',
    );
    setIsSubmitting(false);
    setScreen('sent');
  };

  // Screen: confirmation after a WhatsApp message has been opened.
  if (screen === 'sent') {
    return (
      <div className="min-h-screen w-full bg-[#F5F4F1] font-['Hanken_Grotesk']">
        <ScanHeader />
        <div className="max-w-md mx-auto px-4 py-6 space-y-4">
          <div className="bg-white rounded-2xl p-6 space-y-3 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="w-14 h-14 rounded-full bg-[#25D366]/15 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-[#25D366]" />
            </div>
            <div className="space-y-1">
              <h1 className="font-['Rubik'] font-bold text-xl text-[#1B1C1C]">Message sent</h1>
              <p className="text-sm text-[#9CA3AF]">Thank you for helping. The owner has been notified.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 flex gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="w-10 h-10 rounded-full bg-[#F5F4F1] flex items-center justify-center shrink-0">
              <Car className="w-5 h-5 text-[#5D5F5F]" />
            </div>
            <div className="space-y-2 min-w-0">
              <div>
                <p className="text-sm font-bold text-[#1B1C1C]">Notification sent to the owner of the vehicle</p>
                <p className="text-xs text-[#9CA3AF]">WhatsApp, SMS and app alert were sent where available.</p>
              </div>
              <span className="inline-block bg-[#F5F4F1] rounded-full px-3 py-1 text-xs font-mono font-bold text-[#1B1C1C]">
                Plate {platePrefix}
                {last4}
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                <span className="inline-flex items-center gap-1.5 bg-[#EFFBF4] text-[#1A8754] text-xs font-bold px-3 py-1.5 rounded-full">
                  <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                </span>
                <span className="inline-flex items-center gap-1.5 bg-[#EFFBF4] text-[#1A8754] text-xs font-bold px-3 py-1.5 rounded-full">
                  <MessageSquare className="w-3.5 h-3.5" /> SMS
                </span>
                <span className="inline-flex items-center gap-1.5 bg-[#EFFBF4] text-[#1A8754] text-xs font-bold px-3 py-1.5 rounded-full">
                  <Bell className="w-3.5 h-3.5" /> App
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div>
              <p className="text-sm font-bold text-[#1B1C1C]">Spread the word</p>
              <p className="text-xs text-[#9CA3AF]">Know someone who&apos;d find this useful? Share Scan Connect.</p>
            </div>
            <a
              href={`https://wa.me/?text=${encodeURIComponent('Check out Scan Connect — a QR tag that lets people reach vehicle owners without ever seeing their phone number. https://scanconnect.in')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-[46px] bg-[#EFFBF4] text-[#1A8754] rounded-full font-bold text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-[#25D366]/15 transition-colors"
            >
              <Share2 className="w-4 h-4" /> Share on WhatsApp
            </a>
          </div>

          <div className="bg-white rounded-2xl p-4 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)] text-center">
            <div className="flex items-center justify-center gap-1 text-[#F2CC0C]">
              <Star className="w-4 h-4 fill-current" />
              <p className="text-sm font-bold text-[#1B1C1C]">Rate us</p>
            </div>
            <p className="text-xs text-[#9CA3AF]">A quick 5-star review on the Play Store or App Store helps a lot.</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="h-[42px] bg-[#1B1C1C] rounded-lg flex items-center justify-center text-white text-xs font-bold">
                Google Play
              </div>
              <div className="h-[42px] bg-[#1B1C1C] rounded-lg flex items-center justify-center text-white text-xs font-bold">
                App Store
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full h-[48px] bg-[#FFED00] hover:bg-[#e0ac00] rounded-full font-bold text-[#1B1C1C] shadow-xs transition-colors cursor-pointer active:scale-95"
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  // Screen: countdown + call button, after a masked call has been set up.
  if (screen === 'call' && callNumber) {
    return (
      <div className="min-h-screen w-full bg-[#F5F4F1] font-['Hanken_Grotesk']">
        <ScanHeader />
        <div className="max-w-md mx-auto px-4 py-6 space-y-4">
          <div className="bg-white rounded-2xl p-6 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="space-y-1">
              <h1 className="font-['Rubik'] font-bold text-xl text-[#1B1C1C]">Call the vehicle owner</h1>
              <p className="text-sm text-[#9CA3AF]">
                You have <span className="font-bold text-[#1B1C1C]">{secondsLeft}</span> seconds. Abuse will block
                your number.
              </p>
            </div>

            <div className="bg-[#F5F4F1] rounded-2xl p-4 space-y-2">
              <p className="text-xs font-bold text-[#5D5F5F]">You can get blocked for:</p>
              <ul className="text-xs text-[#5F5E5E] space-y-1 list-disc list-inside">
                <li>Test / prank calls</li>
                <li>Spam</li>
                <li>Buying, selling or renting the vehicle</li>
              </ul>
            </div>

            <a
              href={`tel:${callNumber}`}
              className="w-full h-[52px] bg-[#FFED00] hover:bg-[#e0ac00] rounded-full font-bold text-[#1B1C1C] shadow-xs transition-colors cursor-pointer active:scale-95 flex items-center justify-center gap-2"
            >
              Call {callNumber}
            </a>

            <button
              type="button"
              onClick={onClose}
              className="w-full h-[44px] text-[#5D5F5F] font-bold cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Screen: pick a reason for contacting the owner, shown after verification.
  if (screen === 'reason') {
    return (
      <div className="min-h-screen w-full bg-[#F5F4F1] font-['Hanken_Grotesk']">
        <ScanHeader />
        <div className="max-w-md mx-auto px-4 py-6">
          <form onSubmit={handleSendReason} className="bg-white rounded-2xl p-6 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="space-y-1">
              <h1 className="font-['Rubik'] font-bold text-xl text-[#1B1C1C]">Why contact the vehicle owner?</h1>
              <p className="text-sm text-[#9CA3AF]">This is shared with the owner along with your message.</p>
            </div>

            <div className="space-y-2">
              {CONTACT_REASONS.map(({ label, icon: Icon }) => (
                <label
                  key={label}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border cursor-pointer transition-colors ${
                    reason === label ? 'border-[#F2CC0C] bg-[#FFFCEB]' : 'border-[#E4E2E2] bg-white'
                  }`}
                >
                  <Icon className="w-4.5 h-4.5 text-[#5D5F5F] shrink-0" />
                  <span className="flex-1 text-sm font-semibold text-[#1B1C1C]">{label}</span>
                  <input
                    type="radio"
                    name="reason"
                    checked={reason === label}
                    onChange={() => setReason(label)}
                    className="w-4 h-4 accent-[#F2CC0C]"
                  />
                </label>
              ))}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-[52px] bg-[#FFED00] hover:bg-[#e0ac00] rounded-full font-bold text-[#1B1C1C] shadow-xs transition-colors cursor-pointer active:scale-95 disabled:opacity-60"
            >
              {isSubmitting ? 'Sending...' : 'Send message'}
            </button>

            <button type="button" onClick={onClose} className="w-full h-[40px] text-[#5D5F5F] font-bold cursor-pointer">
              Cancel
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Screen: verify last-4 digits (+ caller's phone for a masked call).
  return (
    <div className="min-h-screen w-full bg-[#F5F4F1] font-['Hanken_Grotesk']">
      <ScanHeader />
      <div className="max-w-md mx-auto px-4 py-6">
        <div className="bg-white rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="h-40 relative overflow-hidden">
            <img src={carPlatePhoto} alt="Vehicle number plate" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>

          <form onSubmit={handleVerify} className="p-6 space-y-4">
            <div className="space-y-1">
              <h1 className="font-['Rubik'] font-bold text-xl text-[#1B1C1C]">Verify the plate number</h1>
              <p className="text-sm text-[#9CA3AF]">Enter the last 4 digits of the vehicle plate.</p>
            </div>

            <div className="flex items-stretch gap-2">
              <div className="flex items-center px-3 h-[54px] bg-[#F5F4F1] rounded-lg">
                <span className="font-mono font-bold text-base text-[#1B1C1C] tracking-wide">{platePrefix}</span>
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
                placeholder="LAST 4 DIGITS"
                className="flex-1 h-[54px] text-center text-sm font-bold tracking-[2px] uppercase bg-white border-2 border-[#1B1C1C] rounded-lg outline-none focus:ring-2 focus:ring-[#FFED00] placeholder:text-[#9CA3AF] placeholder:tracking-[2px] placeholder:font-bold"
              />
            </div>

            {method === 'call' && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5D5F5F]">
                  Your phone <span className="font-normal text-[#9CA3AF]">· needed for a masked call</span>
                </label>
                <input
                  type="tel"
                  required
                  value={callerPhone}
                  onChange={(e) => {
                    setCallerPhone(e.target.value);
                    setErrorMsg('');
                  }}
                  onBlur={() => setCallerPhoneTouched(true)}
                  placeholder="9876543210"
                  className={`w-full h-[48px] px-3 bg-white border rounded-lg text-sm outline-none focus:ring-2 ${
                    callerPhoneTouched && callerPhoneError
                      ? 'border-red-500 focus:ring-red-400'
                      : 'border-[#CCC7AA] focus:ring-[#FFED00]'
                  }`}
                />
                {callerPhoneTouched && callerPhoneError && (
                  <p className="text-xs font-semibold text-red-600">{callerPhoneError}</p>
                )}
              </div>
            )}

            {errorMsg && <p className="text-sm font-semibold text-red-600 text-center">{errorMsg}</p>}

            <button
              type="submit"
              disabled={!testData || last4.length !== 4 || (method === 'call' && !callerPhone.trim())}
              className="w-full h-[52px] bg-[#FFED00] hover:bg-[#e0ac00] rounded-full font-bold text-[#1B1C1C] shadow-xs transition-colors cursor-pointer active:scale-95 disabled:opacity-60"
            >
              {!testData ? 'Loading...' : 'Continue'}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full h-[40px] text-[#5D5F5F] font-bold cursor-pointer"
            >
              Cancel
            </button>
          </form>
        </div>
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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Touched state so the wizard highlights exactly which field blocked
  // advancing, instead of only disabling the Next button with no reason.
  const [step1Touched, setStep1Touched] = useState({ vehicleType: false, registration: false });
  const [step2Touched, setStep2Touched] = useState(false);
  const [step3Touched, setStep3Touched] = useState({ familyName: false, familyPhone: false });
  const [step4Touched, setStep4Touched] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  const step1Errors = {
    vehicleType: vehicleType.trim() ? '' : 'Select a vehicle type',
    registration:
      noRegistrationYet || registration.trim().length > 0 ? '' : 'Enter your vehicle registration number',
  };
  const step1Valid = !step1Errors.vehicleType && !step1Errors.registration;

  const mobileNumberError = isValidPhone(mobileNumber) ? '' : VALIDATION_MESSAGES.phone;

  const step3Errors = {
    familyName: contactsSkipped || isValidName(familyName) ? '' : VALIDATION_MESSAGES.name,
    familyPhone: contactsSkipped || isValidPhone(familyPhone) ? '' : VALIDATION_MESSAGES.phone,
  };
  const step3Valid = !step3Errors.familyName && !step3Errors.familyPhone;

  const step4Errors = {
    firstName: isValidName(firstName) ? '' : 'Enter a valid first name (letters only)',
    lastName: isValidName(lastName) ? '' : 'Enter a valid last name (letters only)',
    email: isValidEmail(email) ? '' : VALIDATION_MESSAGES.email,
    password: isValidPassword(password) ? '' : VALIDATION_MESSAGES.password,
    confirmPassword: password === confirmPassword ? '' : VALIDATION_MESSAGES.passwordMismatch,
  };
  const step4Valid =
    !step4Errors.firstName &&
    !step4Errors.lastName &&
    !step4Errors.email &&
    !step4Errors.password &&
    !step4Errors.confirmPassword;

  const sendOtp = async () => {
    setStep2Touched(true);
    if (mobileNumberError) {
      setSubmitError('Please fix the highlighted field before continuing.');
      return;
    }
    setSubmitError('');
    setIsSendingOtp(true);
    try {
      const verifier = getRecaptchaVerifier(RECAPTCHA_CONTAINER_ID);
      const digitsOnly = mobileNumber.replace(/[^\d]/g, '').replace(/^91(?=\d{10}$)/, '');
      const result = await signInWithPhoneNumber(auth, `+91${digitsOnly}`, verifier);
      setConfirmation(result);
      setIsOtpSent(true);
      setOtpDigits(['', '', '', '', '', '']);
      setOtpTimer(30);
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err) {
      setSubmitError(getAuthErrorMessage(err, 'Failed to send OTP.'));
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
      if (err instanceof ApiError) {
        setSubmitError(err.message);
      } else {
        setSubmitError(getAuthErrorMessage(err, 'Verification failed. Please try again.'));
      }
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
      const accountEmail = email.trim().toLowerCase();
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
      const result = await api.post<DetailsData>(`/api/qr/${code}/activate`, payload);
      onDone(result);
    } catch (err) {
      if (err instanceof ApiError) {
        setSubmitError(err.message);
      } else {
        setSubmitError(getAuthErrorMessage(err, 'Failed to activate. Please try again.'));
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
              onBlur={() => setStep1Touched((t) => ({ ...t, vehicleType: true }))}
              className={`w-full h-[46px] px-3 bg-white border rounded-lg text-sm outline-none focus:ring-2 cursor-pointer ${
                step1Touched.vehicleType && step1Errors.vehicleType
                  ? 'border-red-500 focus:ring-red-400'
                  : 'border-[#CCC7AA] focus:ring-[#FFED00]'
              }`}
            >
              <option value="">Select vehicle type</option>
              {VEHICLE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            {step1Touched.vehicleType && step1Errors.vehicleType && (
              <p className="text-xs font-semibold text-red-600">{step1Errors.vehicleType}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5D5F5F]">Vehicle Registration Number</label>
            <input
              type="text"
              disabled={noRegistrationYet}
              value={registration}
              onChange={(e) => setRegistration(e.target.value.toUpperCase())}
              onBlur={() => setStep1Touched((t) => ({ ...t, registration: true }))}
              placeholder="e.g. KA01AB1234"
              className={`w-full h-[46px] px-3 bg-white border rounded-lg text-sm outline-none focus:ring-2 disabled:bg-[#F5F3F3] disabled:text-[#5F5E5E] ${
                step1Touched.registration && step1Errors.registration
                  ? 'border-red-500 focus:ring-red-400'
                  : 'border-[#CCC7AA] focus:ring-[#FFED00]'
              }`}
            />
            {step1Touched.registration && step1Errors.registration && (
              <p className="text-xs font-semibold text-red-600">{step1Errors.registration}</p>
            )}
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
            onClick={() => {
              setStep1Touched({ vehicleType: true, registration: true });
              if (step1Valid) setStep(2);
            }}
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
                onBlur={() => setStep2Touched(true)}
                placeholder="+91 98765 43210"
                className={`w-full h-[46px] pl-10 pr-3 bg-white border rounded-lg text-sm outline-none focus:ring-2 disabled:bg-[#F5F3F3] disabled:text-[#5F5E5E] ${
                  step2Touched && mobileNumberError && !isOtpSent
                    ? 'border-red-500 focus:ring-red-400'
                    : 'border-[#CCC7AA] focus:ring-[#FFED00]'
                }`}
              />
            </div>
            {step2Touched && mobileNumberError && !isOtpSent && (
              <p className="text-xs font-semibold text-red-600">{mobileNumberError}</p>
            )}
          </div>

          {!isOtpSent ? (
            <button
              onClick={sendOtp}
              disabled={isSendingOtp}
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
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5D5F5F]">Contact Name</label>
              <input
                type="text"
                value={familyName}
                onChange={(e) => setFamilyName(e.target.value)}
                onBlur={() => setStep3Touched((t) => ({ ...t, familyName: true }))}
                placeholder="e.g. Priya Sharma (spouse)"
                className={`w-full h-[42px] px-3 bg-white border rounded-lg text-sm outline-none focus:ring-2 ${
                  step3Touched.familyName && step3Errors.familyName
                    ? 'border-red-500 focus:ring-red-400'
                    : 'border-[#CCC7AA] focus:ring-[#FFED00]'
                }`}
              />
              {step3Touched.familyName && step3Errors.familyName && (
                <p className="text-xs font-semibold text-red-600">{step3Errors.familyName}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5D5F5F]">Mobile Number</label>
              <input
                type="text"
                value={familyPhone}
                onChange={(e) => setFamilyPhone(e.target.value)}
                onBlur={() => setStep3Touched((t) => ({ ...t, familyPhone: true }))}
                placeholder="e.g. 98765 43210"
                className={`w-full h-[42px] px-3 bg-white border rounded-lg text-sm outline-none focus:ring-2 ${
                  step3Touched.familyPhone && step3Errors.familyPhone
                    ? 'border-red-500 focus:ring-red-400'
                    : 'border-[#CCC7AA] focus:ring-[#FFED00]'
                }`}
              />
              {step3Touched.familyPhone && step3Errors.familyPhone && (
                <p className="text-xs font-semibold text-red-600">{step3Errors.familyPhone}</p>
              )}
            </div>
          </div>

          <div className="space-y-3 border border-[#CCC7AA] rounded-lg p-3">
            <p className="text-xs font-bold text-[#5D5F5F]">
              Friend contact <span className="text-[#9CA3AF] font-normal">(optional)</span>
            </p>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5D5F5F]">Contact Name</label>
              <input
                type="text"
                value={friendName}
                onChange={(e) => setFriendName(e.target.value)}
                placeholder="e.g. Arjun Mehta (friend)"
                className="w-full h-[42px] px-3 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5D5F5F]">Mobile Number</label>
              <input
                type="text"
                value={friendPhone}
                onChange={(e) => setFriendPhone(e.target.value)}
                placeholder="e.g. 98765 43210"
                className="w-full h-[42px] px-3 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
              />
            </div>
          </div>

          {submitError && <p className="text-sm font-semibold text-red-600">{submitError}</p>}

          <button
            onClick={() => {
              setStep3Touched({ familyName: true, familyPhone: true });
              if (!step3Valid) return;
              setContactsSkipped(false);
              setStep(4);
            }}
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
                onBlur={() => setStep4Touched((t) => ({ ...t, firstName: true }))}
                placeholder="Rahul"
                className={`w-full h-[44px] px-3 bg-white border rounded-lg text-sm outline-none focus:ring-2 ${
                  step4Touched.firstName && step4Errors.firstName
                    ? 'border-red-500 focus:ring-red-400'
                    : 'border-[#CCC7AA] focus:ring-[#FFED00]'
                }`}
              />
              {step4Touched.firstName && step4Errors.firstName && (
                <p className="text-[10px] font-semibold text-red-600">{step4Errors.firstName}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#5D5F5F]">Last Name</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                onBlur={() => setStep4Touched((t) => ({ ...t, lastName: true }))}
                placeholder="Sharma"
                className={`w-full h-[44px] px-3 bg-white border rounded-lg text-sm outline-none focus:ring-2 ${
                  step4Touched.lastName && step4Errors.lastName
                    ? 'border-red-500 focus:ring-red-400'
                    : 'border-[#CCC7AA] focus:ring-[#FFED00]'
                }`}
              />
              {step4Touched.lastName && step4Errors.lastName && (
                <p className="text-[10px] font-semibold text-red-600">{step4Errors.lastName}</p>
              )}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5D5F5F]">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => setStep4Touched((t) => ({ ...t, email: true }))}
                placeholder="you@example.com"
                className={`w-full h-[46px] pl-10 pr-3 bg-white border rounded-lg text-sm outline-none focus:ring-2 ${
                  step4Touched.email && step4Errors.email
                    ? 'border-red-500 focus:ring-red-400'
                    : 'border-[#CCC7AA] focus:ring-[#FFED00]'
                }`}
              />
            </div>
            {step4Touched.email && step4Errors.email ? (
              <p className="text-[10px] font-semibold text-red-600">{step4Errors.email}</p>
            ) : (
              <p className="text-[10px] text-[#9CA3AF]">This email will be linked to your phone number {mobileNumber}.</p>
            )}
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
                onBlur={() => setStep4Touched((t) => ({ ...t, password: true }))}
                placeholder="At least 6 characters"
                className={`w-full h-[46px] pl-10 pr-10 bg-white border rounded-lg text-sm outline-none focus:ring-2 ${
                  step4Touched.password && step4Errors.password
                    ? 'border-red-500 focus:ring-red-400'
                    : 'border-[#CCC7AA] focus:ring-[#FFED00]'
                }`}
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
            {step4Touched.password && step4Errors.password ? (
              <p className="text-[10px] font-semibold text-red-600">{step4Errors.password}</p>
            ) : (
              <p className="text-[10px] text-[#9CA3AF]">{PASSWORD_HINT}</p>
            )}
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
                onBlur={() => setStep4Touched((t) => ({ ...t, confirmPassword: true }))}
                placeholder="Type password again"
                className={`w-full h-[46px] pl-10 pr-10 bg-white border rounded-lg text-sm outline-none focus:ring-2 ${
                  step4Touched.confirmPassword && step4Errors.confirmPassword
                    ? 'border-red-500 focus:ring-red-400'
                    : 'border-[#CCC7AA] focus:ring-[#FFED00]'
                }`}
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
            {step4Touched.confirmPassword && step4Errors.confirmPassword && (
              <p className="text-[10px] font-semibold text-red-600">{step4Errors.confirmPassword}</p>
            )}
          </div>

          {submitError && <p className="text-sm font-semibold text-red-600">{submitError}</p>}

          <button
            onClick={() => {
              setStep4Touched({
                firstName: true,
                lastName: true,
                email: true,
                password: true,
                confirmPassword: true,
              });
              if (!step4Valid) {
                setSubmitError('Please fix the highlighted fields before continuing.');
                return;
              }
              if (!isPhoneVerified) {
                setSubmitError('Please verify your phone number before continuing.');
                return;
              }
              handleFinish();
            }}
            disabled={isSubmitting}
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
    if (callChoice) {
      return (
        <CallVerifyModal
          code={code}
          target={callChoice.target}
          method={callChoice.method}
          platePrefix={detailsData.vehicle.registration.replace(/•+$/, '')}
          onClose={() => setCallChoice(null)}
        />
      );
    }
    return (
      <ScanResultCard
        label={`QR Code ${code}`}
        owner={detailsData.owner}
        vehicle={detailsData.vehicle}
        emergencyContacts={detailsData.emergencyContacts}
        onChooseMethod={(target, method) => setCallChoice({ target, method })}
      />
    );
  }

  return null;
};
