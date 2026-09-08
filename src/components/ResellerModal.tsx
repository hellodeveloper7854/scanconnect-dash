import React, { useEffect, useState } from 'react';
import { X, Check, Handshake } from 'lucide-react';
import { api, ApiError } from '../lib/api';

interface ResellerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mirrors server/src/routes/resellers.ts exactly so the backend never
// rejects something the frontend already accepted.
const NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]{1,79}$/;
const PHONE_PATTERN = /^[6-9]\d{9}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const ResellerModal: React.FC<ResellerModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!isOpen) return;
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setNotes('');
    setErrorMsg('');
    setIsSubmitted(false);
    setTouched({});
  }, [isOpen]);

  if (!isOpen) return null;

  const fieldErrors = {
    name: NAME_PATTERN.test(name.trim()) ? '' : 'Enter a valid full name (letters only, at least 2 characters)',
    email: EMAIL_PATTERN.test(email.trim()) ? '' : 'Enter a valid email address',
    phone: PHONE_PATTERN.test(phone.trim()) ? '' : 'Enter a valid 10-digit mobile number',
  };
  const isFormValid = Object.values(fieldErrors).every((e) => !e);
  const markTouched = (field: string) => setTouched((t) => ({ ...t, [field]: true }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, phone: true });
    if (!isFormValid) {
      setErrorMsg('Please fix the highlighted fields before continuing.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await api.post('/api/resellers', {
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setIsSubmitted(true);
    } catch (err) {
      setErrorMsg(err instanceof ApiError ? err.message : 'Failed to submit your request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* Top Accent */}
        <div className="absolute top-0 inset-x-0 h-1 bg-[#FFED00]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-[#1B1C1C] rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="text-center space-y-4 py-6">
            <div className="mx-auto w-14 h-14 rounded-full bg-[#FFED00]/15 flex items-center justify-center text-[#B58500]">
              <Check className="w-7 h-7 stroke-[3]" />
            </div>
            <h3 className="text-xl font-black text-[#1B1C1C] tracking-tight">Request Received</h3>
            <p className="text-[#5D5F5F] text-sm">
              Thanks for your interest in becoming a Scan Connect reseller. Our partnerships team will reach out to you shortly.
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-[#1B1C1C] hover:bg-neutral-800 text-white font-bold text-sm rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="text-center space-y-2 mb-6 pt-2">
              <div className="mx-auto w-12 h-12 rounded-xl bg-[#FFED00]/15 flex items-center justify-center text-[#B58500] mb-2">
                <Handshake className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-black text-[#1B1C1C] tracking-tight">Become a Reseller</h3>
              <p className="text-[#5D5F5F] text-xs">
                Share your details and our team will get in touch about partnership opportunities.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-[#1B1C1C] uppercase tracking-wide mb-1.5">
                    Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value.replace(/[^A-Za-z .'-]/g, ''))}
                    onBlur={() => markTouched('name')}
                    placeholder="Your full name"
                    className={`w-full h-12 px-4 bg-neutral-100 text-[#1B1C1C] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFED00] focus:bg-white transition-all text-sm ${
                      touched.name && fieldErrors.name ? 'border-rose-500' : 'border-neutral-200'
                    }`}
                  />
                  {touched.name && fieldErrors.name && (
                    <p className="text-xs font-semibold text-rose-500 mt-1">{fieldErrors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B1C1C] uppercase tracking-wide mb-1.5">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onBlur={() => markTouched('email')}
                    placeholder="you@example.com"
                    className={`w-full h-12 px-4 bg-neutral-100 text-[#1B1C1C] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFED00] focus:bg-white transition-all text-sm ${
                      touched.email && fieldErrors.email ? 'border-rose-500' : 'border-neutral-200'
                    }`}
                  />
                  {touched.email && fieldErrors.email && (
                    <p className="text-xs font-semibold text-rose-500 mt-1">{fieldErrors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B1C1C] uppercase tracking-wide mb-1.5">
                    Phone <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    onBlur={() => markTouched('phone')}
                    placeholder="9876543210"
                    className={`w-full h-12 px-4 bg-neutral-100 text-[#1B1C1C] border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFED00] focus:bg-white transition-all text-sm ${
                      touched.phone && fieldErrors.phone ? 'border-rose-500' : 'border-neutral-200'
                    }`}
                  />
                  {touched.phone && fieldErrors.phone && (
                    <p className="text-xs font-semibold text-rose-500 mt-1">{fieldErrors.phone}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1B1C1C] uppercase tracking-wide mb-1.5">
                    Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="City, State"
                    className="w-full h-12 px-4 bg-neutral-100 text-[#1B1C1C] border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFED00] focus:bg-white transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1B1C1C] uppercase tracking-wide mb-1.5">
                  Additional Information
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell us about your business, region, or anything else relevant"
                  rows={3}
                  className="w-full px-4 py-3 bg-neutral-100 text-[#1B1C1C] border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFED00] focus:bg-white transition-all text-sm resize-none"
                />
              </div>

              {errorMsg && <p className="text-xs font-semibold text-rose-500">{errorMsg}</p>}

              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className="w-full h-12 bg-[#FFED00] hover:enabled:bg-[#e0ac00] text-[#1B1C1C] font-bold text-sm uppercase tracking-wider rounded-lg shadow-sm transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};
