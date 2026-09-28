import React, { useState } from 'react';
import { Phone, MessageCircle, ShieldAlert, Menu, X } from 'lucide-react';
import logo from '../assets/images/logo.png';

export type CallTarget = { kind: 'owner' } | { kind: 'contact'; index: number };

interface ScanResultCardProps {
  label: string;
  owner: { fullName: string; mobileNumber?: string | null };
  vehicle: {
    registration: string;
    nickname: string | null;
    vehicleType: string | null;
    brand: string | null;
    model: string | null;
    fuelType?: string | null;
    color: string | null;
  } | null;
  emergencyContacts: { name: string; role: string | null; phone?: string }[];
  /**
   * When provided, phone numbers are hidden and picking Masked Call/Message
   * hands off to the caller to run the verify+call/message flow (e.g. a
   * popup with last-4 verification). When omitted, phone numbers render as
   * plain tel: links (unauthenticated order-contact flow, no verification).
   */
  onChooseMethod?: (target: CallTarget, method: 'call' | 'message') => void;
}

export const ScanHeader: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-10 bg-[#FFED00] shadow-[0_2px_10px_rgba(0,0,0,0.06)]">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
        <a href="/" className="cursor-pointer">
          <img src={logo} alt="ScanConnect" className="h-6 w-auto object-contain" />
        </a>
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          className="p-2 -mr-2 text-[#1B1C1C] hover:bg-black/10 rounded-lg cursor-pointer"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {menuOpen && (
        <div className="bg-[#1B1C1C] border-t border-black/20">
          <div className="max-w-md mx-auto px-4 py-2">
            <a href="/" className="block py-2.5 px-2 rounded-lg font-bold text-white hover:bg-white/10 cursor-pointer">
              Scan Connect Home
            </a>
            <a href="/contact" className="block py-2.5 px-2 rounded-lg font-bold text-white hover:bg-white/10 cursor-pointer">
              Report Wrong Info
            </a>
          </div>
        </div>
      )}
    </header>
  );
};

/** An Indian-style HSRP number plate: white face, black border, blue IND strip with tricolor flag, monospace plate text. */
const PlateGraphic: React.FC<{ registration: string }> = ({ registration }) => (
  <div className="inline-flex rounded-[3px] border-2 border-[#1B1C1C] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.15)] bg-white">
    <div className="bg-[#0B1F51] flex flex-col items-center justify-center gap-0.5 px-1.5 py-1">
      <svg viewBox="0 0 24 16" className="w-4 h-3 shrink-0" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="5.33" y="0" fill="#FF9933" />
        <rect width="24" height="5.33" y="5.33" fill="#FFFFFF" />
        <rect width="24" height="5.34" y="10.66" fill="#138808" />
        <circle cx="12" cy="8" r="2" fill="none" stroke="#000080" strokeWidth="0.3" />
      </svg>
      <span className="text-[6px] font-black text-white leading-none tracking-wide">IND</span>
    </div>
    <div className="bg-white px-3 py-1.5 flex items-center">
      <span className="font-mono font-black text-lg text-[#1B1C1C] tracking-widest">{registration}</span>
    </div>
  </div>
);

const MethodCards: React.FC<{ onChoose: (method: 'call' | 'message') => void }> = ({ onChoose }) => (
  <div className="grid grid-cols-2 gap-3">
    <button
      type="button"
      onClick={() => onChoose('call')}
      className="p-4 bg-[#FFFCEB] border border-[#F2CC0C]/50 rounded-2xl flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#F2CC0C] hover:shadow-md active:scale-[0.98] transition-all"
    >
      <div className="w-11 h-11 rounded-full bg-[#FFED00] flex items-center justify-center">
        <Phone className="w-5 h-5 text-[#1B1C1C]" />
      </div>
      <span className="font-bold text-sm text-[#1B1C1C]">Masked Call</span>
      <span className="text-[11px] text-[#9A8B00]">90 sec · private</span>
    </button>
    <button
      type="button"
      onClick={() => onChoose('message')}
      className="p-4 bg-[#EFFBF4] border border-[#25D366]/30 rounded-2xl flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#25D366] hover:shadow-md active:scale-[0.98] transition-all"
    >
      <div className="w-11 h-11 rounded-full bg-[#25D366] flex items-center justify-center">
        <MessageCircle className="w-5 h-5 text-white" />
      </div>
      <span className="font-bold text-sm text-[#1B1C1C]">Message</span>
      <span className="text-[11px] text-[#1A8754]">WhatsApp style</span>
    </button>
  </div>
);

export const ScanResultCard: React.FC<ScanResultCardProps> = ({ label, owner, vehicle, emergencyContacts, onChooseMethod }) => {
  const primaryContact = emergencyContacts[0];
  const contactIndex = 0;

  const vehicleSubtitle = vehicle
    ? [vehicle.vehicleType, vehicle.brand, vehicle.model, vehicle.color].filter(Boolean).join(' · ')
    : '';

  return (
    <div className="min-h-screen w-full bg-[#F5F4F1] font-['Hanken_Grotesk']">
      <ScanHeader />

      <div className="max-w-md mx-auto px-4 py-5 space-y-4">
        <div className="text-center space-y-0.5">
          <h1 className="font-['Rubik'] font-bold text-xl text-[#1B1C1C] tracking-tight">Contact Vehicle Owner</h1>
          <p className="text-[11px] font-semibold text-[#B0AA9E] uppercase tracking-wide">{label}</p>
        </div>

        {vehicle && (
          <div className="bg-white rounded-2xl p-4 flex flex-col items-center gap-2 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <PlateGraphic registration={vehicle.nickname ? vehicle.registration : vehicle.registration} />
            {(vehicle.nickname || vehicleSubtitle) && (
              <p className="text-xs font-semibold text-[#5F5E5E]">
                {[vehicle.nickname, vehicleSubtitle].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl p-4 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <p className="text-xs font-bold text-[#5D5F5F]">How would you like to reach the owner?</p>

          {onChooseMethod ? (
            <MethodCards onChoose={(method) => onChooseMethod({ kind: 'owner' }, method)} />
          ) : (
            owner.mobileNumber && (
              <a href={`tel:${owner.mobileNumber}`} className="flex items-center gap-2 text-[#5F5E5E] hover:underline text-sm">
                <Phone className="w-4 h-4 text-[#1B1C1C]" />
                {owner.mobileNumber}
              </a>
            )
          )}
        </div>

        <div className="rounded-2xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="w-full bg-gradient-to-r from-[#D6272C] to-[#B01E23] px-4 py-3.5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5.5 h-5.5 text-white" />
            </div>
            <div className="text-left min-w-0 flex-1">
              <p className="font-['Rubik'] font-extrabold text-white text-[15px]">Emergency</p>
              <p className="text-[11px] text-white/85 truncate">Accident or family emergency? Reach the emergency contact.</p>
            </div>
          </div>

          <div className="bg-white px-4 py-4 space-y-3">
            {primaryContact ? (
              <>
                {primaryContact.role && (
                  <p className="text-xs font-bold text-[#5D5F5F]">{primaryContact.role}</p>
                )}

                {onChooseMethod ? (
                  <MethodCards onChoose={(method) => onChooseMethod({ kind: 'contact', index: contactIndex }, method)} />
                ) : (
                  primaryContact.phone && (
                    <a href={`tel:${primaryContact.phone}`} className="flex items-center gap-2 text-[#5F5E5E] hover:underline text-sm">
                      <Phone className="w-4 h-4 text-[#1B1C1C]" />
                      {primaryContact.phone}
                    </a>
                  )
                )}
              </>
            ) : (
              <p className="text-sm text-[#9CA3AF]">No emergency contact added.</p>
            )}
          </div>
        </div>

        <div className="bg-[#1B1C1C] rounded-2xl px-4 py-3.5 space-y-1">
          <p className="text-[11px] font-bold text-[#FFED00]">
            90 seconds per call · Calls are masked · Spam may get you blocked.
          </p>
          <p className="text-[11px] text-white/60">
            Something wrong?{' '}
            <a href="/contact" className="underline font-semibold text-white/85 cursor-pointer">
              Report incorrect info
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
