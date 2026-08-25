import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { QrCode as QrCodeIcon, ArrowRight, ArrowLeft, Check, Plus, User, Phone, Car, Mail, Lock, ShieldOff } from 'lucide-react';
import { auth } from '../lib/firebase';
import { api, ApiError } from '../lib/api';
import { ScanResultCard } from '../components/ScanResultCard';
import logo from '../assets/images/logo.png';

const VEHICLE_TYPES = ['Car', 'Bike', 'Scooter', 'Truck', 'Bus', 'Other'];

type Stage = 'loading' | 'invalid' | 'disabled' | 'inactive-prompt' | 'login-gate' | 'wizard' | 'details';

interface VehicleOption {
  id: string;
  registration: string;
  nickname: string | null;
}

interface ContactOption {
  id: string;
  name: string;
  phone: string;
}

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

type CallTarget = { kind: 'owner' } | { kind: 'contact'; index: number };

const CardShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-4 font-['Hanken_Grotesk']">
    <div className="w-full max-w-md bg-white border border-[#E4E2E2] shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.08)] rounded-[16px] p-8 space-y-6">
      <div className="flex flex-col items-center gap-2 text-center">
        <img src={logo} alt="ScanConnect" className="h-9 w-auto object-contain" />
      </div>
      {children}
    </div>
  </div>
);

const LoginGate: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      if (mode === 'login') {
        const credential = await signInWithEmailAndPassword(auth, email, password);
        const idToken = await credential.user.getIdToken();
        await api.post('/api/auth/session', { idToken });
      } else {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        const idToken = await credential.user.getIdToken();
        await api.post('/api/auth/register', { idToken, fullName, email });
      }
      onSuccess();
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message);
      } else if (err instanceof Error) {
        setErrorMsg(err.message.replace('Firebase: ', ''));
      } else {
        setErrorMsg('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="text-center space-y-1">
        <h1 className="font-['Rubik'] font-bold text-xl text-[#1B1C1C]">
          {mode === 'login' ? 'Log In to Activate' : 'Create an Account'}
        </h1>
        <p className="text-sm text-[#5F5E5E]">
          You need to be signed in before activating this QR tag.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {mode === 'register' && (
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
              className="w-full h-[46px] pl-10 pr-3 bg-white border border-[#CCC7AA] rounded-lg text-sm text-[#1B1C1C] outline-none focus:ring-2 focus:ring-[#FFED00]"
            />
          </div>
        )}
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email address"
            className="w-full h-[46px] pl-10 pr-3 bg-white border border-[#CCC7AA] rounded-lg text-sm text-[#1B1C1C] outline-none focus:ring-2 focus:ring-[#FFED00]"
          />
        </div>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full h-[46px] pl-10 pr-3 bg-white border border-[#CCC7AA] rounded-lg text-sm text-[#1B1C1C] outline-none focus:ring-2 focus:ring-[#FFED00]"
          />
        </div>

        {errorMsg && <p className="text-sm font-semibold text-red-600">{errorMsg}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-[48px] bg-[#FFED00] hover:bg-[#e0ac00] rounded-lg font-bold text-white shadow-xs transition-colors cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Register'}
        </button>
      </form>

      <p className="text-center text-xs text-[#5F5E5E]">
        {mode === 'login' ? (
          <>
            New here?{' '}
            <button onClick={() => setMode('register')} className="text-[#736B00] font-bold hover:underline cursor-pointer">
              Create an account
            </button>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <button onClick={() => setMode('login')} className="text-[#736B00] font-bold hover:underline cursor-pointer">
              Log in
            </button>
          </>
        )}
      </p>
    </div>
  );
};

/**
 * Shown when someone clicks "Call" on the details page — verifies the last 4
 * digits of the vehicle registration before revealing/dialing the specific
 * phone number they asked for, rather than gating the whole details page.
 */
const CallVerifyModal: React.FC<{ code: string; target: CallTarget; onClose: () => void }> = ({
  code,
  target,
  onClose,
}) => {
  const [last4, setLast4] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const result = await api.post<VerifiedData>(`/api/qr/${code}/verify`, { last4 });
      const phone =
        target.kind === 'owner' ? result.owner.mobileNumber : result.emergencyContacts[target.index]?.phone;
      if (phone) {
        window.location.href = `tel:${phone}`;
      }
      onClose();
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-center space-y-1">
            <Car className="w-8 h-8 text-[#FFED00] mx-auto" />
            <h1 className="font-['Rubik'] font-bold text-xl text-[#1B1C1C]">Verify Vehicle</h1>
            <p className="text-sm text-[#5F5E5E]">
              Enter the last 4 digits of the vehicle&apos;s registration number to place this call.
            </p>
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
              disabled={isSubmitting || last4.length !== 4}
              className="flex-1 h-[48px] bg-[#FFED00] hover:bg-[#e0ac00] rounded-lg font-bold text-white shadow-xs transition-colors cursor-pointer active:scale-95 disabled:opacity-60"
            >
              {isSubmitting ? 'Checking...' : 'Call'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ActivationWizard: React.FC<{ code: string; onDone: (r: DetailsData) => void }> = ({ code, onDone }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1: personal
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileReadOnly, setMobileReadOnly] = useState(false);

  useEffect(() => {
    api
      .get<{ user: { fullName: string; mobileNumber: string | null; mobileVerified: boolean } }>('/api/auth/me')
      .then((res) => {
        setFullName(res.user.fullName ?? '');
        if (res.user.mobileVerified && res.user.mobileNumber) {
          setMobileNumber(res.user.mobileNumber);
          setMobileReadOnly(true);
        }
      })
      .catch(() => {});
  }, []);

  // Step 2: emergency contacts
  const [existingContacts, setExistingContacts] = useState<ContactOption[] | null>(null);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [isAddContactOpen, setIsAddContactOpen] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactRole, setNewContactRole] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactEmail, setNewContactEmail] = useState('');
  const [newContacts, setNewContacts] = useState<{ name: string; role: string; phone: string; email: string }[]>([]);

  useEffect(() => {
    api
      .get<{ contacts: ContactOption[] }>('/api/profile/emergency-contacts')
      .then((res) => setExistingContacts(res.contacts))
      .catch(() => setExistingContacts([]));
  }, []);

  // Step 3: vehicle
  const [existingVehicles, setExistingVehicles] = useState<VehicleOption[] | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [useNewVehicle, setUseNewVehicle] = useState(false);
  const [registration, setRegistration] = useState('');
  const [nickname, setNickname] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [fuelType, setFuelType] = useState('');
  const [color, setColor] = useState('');

  useEffect(() => {
    api
      .get<{ vehicles: VehicleOption[] }>('/api/profile/vehicles')
      .then((res) => {
        setExistingVehicles(res.vehicles);
        if (res.vehicles.length === 0) setUseNewVehicle(true);
      })
      .catch(() => {
        setExistingVehicles([]);
        setUseNewVehicle(true);
      });
  }, []);

  const step1Valid = fullName.trim().length > 0 && mobileNumber.trim().length > 0;
  const step2Valid = selectedContactIds.length + newContacts.length > 0;
  const step3Valid = useNewVehicle
    ? !!(registration.trim() && nickname.trim() && vehicleType.trim() && brand.trim() && model.trim() && fuelType.trim() && color.trim())
    : !!selectedVehicleId;

  const handleAddContact = () => {
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    setNewContacts((prev) => [
      ...prev,
      {
        name: newContactName.trim(),
        role: newContactRole.trim(),
        phone: newContactPhone.trim(),
        email: newContactEmail.trim(),
      },
    ]);
    setNewContactName('');
    setNewContactRole('');
    setNewContactPhone('');
    setNewContactEmail('');
    setIsAddContactOpen(false);
  };

  const toggleContact = (id: string) => {
    setSelectedContactIds((prev) => (prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]));
  };

  const handleFinish = async () => {
    setSubmitError('');
    setIsSubmitting(true);
    try {
      const payload = {
        personal: { fullName: fullName.trim() },
        emergencyContacts: [
          ...selectedContactIds.map((id) => ({ kind: 'existing' as const, id })),
          ...newContacts.map((c) => ({
            kind: 'new' as const,
            name: c.name,
            phone: c.phone,
            role: c.role || undefined,
            email: c.email || undefined,
          })),
        ],
        ...(useNewVehicle
          ? {
              vehicle: {
                registration: registration.trim(),
                nickname: nickname.trim(),
                vehicleType: vehicleType.trim(),
                brand: brand.trim(),
                model: model.trim(),
                fuelType: fuelType.trim(),
                color: color.trim(),
              },
            }
          : { vehicleId: selectedVehicleId }),
      };
      const result = await api.post<VerifiedData>(`/api/qr/${code}/activate`, payload);
      onDone(result);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Failed to activate. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Stepper */}
      <div className="flex items-center justify-center gap-2">
        {[1, 2, 3].map((n) => (
          <React.Fragment key={n}>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                step === n ? 'bg-[#FFED00] text-white' : step > n ? 'bg-[#FFED00]/30 text-[#736B00]' : 'bg-[#E9E8E7] text-[#6B7280]'
              }`}
            >
              {step > n ? <Check className="w-4 h-4" /> : n}
            </div>
            {n < 3 && <div className="w-8 h-[2px] bg-[#CCC7AA]" />}
          </React.Fragment>
        ))}
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h1 className="font-['Rubik'] font-bold text-lg text-[#1B1C1C]">Personal Details</h1>
            <p className="text-xs text-[#5F5E5E]">Required to activate this tag.</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5D5F5F]">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full h-[46px] pl-10 pr-3 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#5D5F5F]">Phone Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="text"
                required
                disabled={mobileReadOnly}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full h-[46px] pl-10 pr-3 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00] disabled:bg-[#F5F3F3] disabled:text-[#5F5E5E]"
              />
            </div>
            {mobileReadOnly && <p className="text-[10px] text-[#9CA3AF]">Verified number on your account.</p>}
          </div>
          <button
            onClick={() => setStep(2)}
            disabled={!step1Valid}
            className="w-full h-[48px] bg-[#FFED00] hover:bg-[#e0ac00] rounded-lg font-bold text-white transition-colors cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
          >
            Next <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h1 className="font-['Rubik'] font-bold text-lg text-[#1B1C1C]">Emergency Contact</h1>
            <p className="text-xs text-[#5F5E5E]">Select or add at least one emergency contact.</p>
          </div>

          {!existingContacts ? (
            <p className="text-sm text-[#5F5E5E]">Loading contacts...</p>
          ) : (
            <div className="space-y-2">
              {existingContacts.map((c) => (
                <label
                  key={c.id}
                  className="flex items-center gap-3 p-3 border border-[#CCC7AA] rounded-lg cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedContactIds.includes(c.id)}
                    onChange={() => toggleContact(c.id)}
                    className="w-4 h-4 accent-[#FFED00]"
                  />
                  <span className="text-sm text-[#1B1C1C]">
                    {c.name} — {c.phone}
                  </span>
                </label>
              ))}
              {newContacts.map((c, idx) => (
                <div key={idx} className="flex items-center gap-3 p-3 border border-[#FFED00] bg-[#FFED00]/5 rounded-lg">
                  <Check className="w-4 h-4 text-[#736B00]" />
                  <span className="text-sm text-[#1B1C1C]">
                    {c.name}
                    {c.role && <span className="text-[#9CA3AF]"> · {c.role}</span>} — {c.phone}{' '}
                    <span className="text-[10px] text-[#9CA3AF]">(new)</span>
                  </span>
                </div>
              ))}
            </div>
          )}

          {!isAddContactOpen ? (
            <button
              type="button"
              onClick={() => setIsAddContactOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1B1C1C] hover:underline cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add a new emergency contact
            </button>
          ) : (
            <div className="space-y-3 border border-[#CCC7AA] rounded-lg p-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5D5F5F]">Full Name</label>
                <input
                  type="text"
                  required
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  placeholder="e.g. Alex Morgan"
                  className="w-full h-[42px] px-3 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5D5F5F]">Role / Relationship</label>
                <input
                  type="text"
                  value={newContactRole}
                  onChange={(e) => setNewContactRole(e.target.value)}
                  placeholder="e.g. Security Supervisor"
                  className="w-full h-[42px] px-3 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5D5F5F]">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  placeholder="e.g. +44 7700 900888"
                  className="w-full h-[42px] px-3 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5D5F5F]">Email Address</label>
                <input
                  type="email"
                  value={newContactEmail}
                  onChange={(e) => setNewContactEmail(e.target.value)}
                  placeholder="e.g. alex.morgan@example.com"
                  className="w-full h-[42px] px-3 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddContactOpen(false)}
                  className="flex-1 py-2 bg-[#EFEDED] text-[#5D5F5F] font-bold text-xs rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddContact}
                  className="flex-1 py-2 bg-[#FFED00] text-white font-bold text-xs rounded-lg cursor-pointer"
                >
                  Add
                </button>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep(1)}
              className="flex-1 h-[48px] border border-[#1B1C1C] rounded-lg font-bold text-[#1B1C1C] cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!step2Valid}
              className="flex-1 h-[48px] bg-[#FFED00] hover:bg-[#e0ac00] rounded-lg font-bold text-white transition-colors cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <h1 className="font-['Rubik'] font-bold text-lg text-[#1B1C1C]">Vehicle Details</h1>
            <p className="text-xs text-[#5F5E5E]">All fields are required to activate this tag.</p>
          </div>

          {existingVehicles && existingVehicles.length > 0 && (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUseNewVehicle(false)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer ${!useNewVehicle ? 'bg-[#FFED00] text-white' : 'bg-[#EFEDED] text-[#5D5F5F]'}`}
              >
                Use Existing
              </button>
              <button
                type="button"
                onClick={() => setUseNewVehicle(true)}
                className={`flex-1 py-2 rounded-lg text-xs font-bold cursor-pointer ${useNewVehicle ? 'bg-[#FFED00] text-white' : 'bg-[#EFEDED] text-[#5D5F5F]'}`}
              >
                Add New
              </button>
            </div>
          )}

          {!useNewVehicle && existingVehicles && existingVehicles.length > 0 ? (
            <select
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full h-[46px] px-3 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00] cursor-pointer"
            >
              <option value="">Select a vehicle</option>
              {existingVehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nickname ? `${v.nickname} — ${v.registration}` : v.registration}
                </option>
              ))}
            </select>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <input
                value={registration}
                onChange={(e) => setRegistration(e.target.value)}
                placeholder="Registration Number"
                className="col-span-2 h-[44px] px-3 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
              />
              <input
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Nickname"
                className="h-[44px] px-3 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
              />
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className="h-[44px] px-3 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00] cursor-pointer"
              >
                <option value="">Vehicle Type</option>
                {VEHICLE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Brand"
                className="h-[44px] px-3 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
              />
              <input
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Model"
                className="h-[44px] px-3 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
              />
              <input
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                placeholder="Fuel Type"
                className="h-[44px] px-3 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
              />
              <input
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="Color"
                className="h-[44px] px-3 bg-white border border-[#CCC7AA] rounded-lg text-sm outline-none focus:ring-2 focus:ring-[#FFED00]"
              />
            </div>
          )}

          {submitError && <p className="text-sm font-semibold text-red-600">{submitError}</p>}

          <div className="flex gap-3">
            <button
              onClick={() => setStep(2)}
              className="flex-1 h-[48px] border border-[#1B1C1C] rounded-lg font-bold text-[#1B1C1C] cursor-pointer flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleFinish}
              disabled={!step3Valid || isSubmitting}
              className="flex-1 h-[48px] bg-[#FFED00] hover:bg-[#e0ac00] rounded-lg font-bold text-white transition-colors cursor-pointer active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isSubmitting ? 'Activating...' : 'Activate Tag'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export const QrLandingPage: React.FC<{ code: string }> = ({ code }) => {
  const [stage, setStage] = useState<Stage>('loading');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);
  const [statusChecked, setStatusChecked] = useState(false);
  const [pendingStage, setPendingStage] = useState<'inactive-prompt' | 'details' | null>(null);
  const [detailsData, setDetailsData] = useState<DetailsData | null>(null);
  const [callTarget, setCallTarget] = useState<CallTarget | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

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
    if (statusChecked && authChecked && pendingStage && stage === 'loading') {
      setStage(pendingStage);
    }
  }, [statusChecked, authChecked, pendingStage, stage]);

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
          <div className="w-14 h-14 rounded-full bg-[#FFED00] flex items-center justify-center mx-auto">
            <QrCodeIcon className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-['Rubik'] font-bold text-xl text-[#1B1C1C]">Activate This QR Tag?</h1>
          <p className="text-sm text-[#5F5E5E]">
            This tag hasn&apos;t been claimed yet. Activate it to link it to your vehicle, personal details, and
            emergency contact.
          </p>
          <button
            onClick={() => setStage(isLoggedIn ? 'wizard' : 'login-gate')}
            className="w-full h-[52px] bg-[#FFED00] hover:bg-[#e0ac00] rounded-lg font-bold text-white shadow-xs transition-colors cursor-pointer active:scale-95 flex items-center justify-center gap-2"
          >
            Yes, Activate <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </CardShell>
    );
  }

  if (stage === 'login-gate') {
    return (
      <CardShell>
        <LoginGate onSuccess={() => setStage('wizard')} />
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
            setStage('details');
          }}
        />
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
          onRequestCall={(target) => setCallTarget(target)}
        />
        {callTarget && (
          <CallVerifyModal code={code} target={callTarget} onClose={() => setCallTarget(null)} />
        )}
      </>
    );
  }

  return null;
};
