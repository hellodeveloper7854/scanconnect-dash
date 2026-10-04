import React, { useState } from 'react';
import { Phone, PhoneCall, MessageCircle, ArrowLeft, ShieldAlert, Menu, X, ShoppingBag, CircleHelp, Mail, LogIn } from 'lucide-react';
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

const MENU_ITEMS = [
  { label: 'Shop', href: '/shop', Icon: ShoppingBag },
  { label: 'Help/Demo', href: '/help', Icon: CircleHelp },
  { label: 'Contact Us', href: '/contact', Icon: Mail },
  { label: 'Login', href: '/login', Icon: LogIn },
];

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
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="p-2 -mr-2 text-[#1B1C1C] hover:bg-black/10 rounded-lg cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      <div
        onClick={() => setMenuOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-200 ${menuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      <nav
        aria-hidden={!menuOpen}
        className={`fixed top-0 right-0 bottom-0 z-50 w-72 max-w-[80vw] bg-white shadow-2xl flex flex-col transition-transform duration-200 ease-out ${menuOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="h-14 px-4 flex items-center justify-between bg-[#FFED00]">
          <img src={logo} alt="ScanConnect" className="h-6 w-auto object-contain" />
          <button
            type="button"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            className="p-2 -mr-2 text-[#1B1C1C] hover:bg-black/10 rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-3 space-y-1">
          {MENU_ITEMS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              tabIndex={menuOpen ? 0 : -1}
              className="flex items-center gap-3 py-3 px-3 rounded-xl font-bold text-[#1B1C1C] hover:bg-[#F5F4F1] cursor-pointer"
            >
              <Icon className="w-5 h-5 text-[#5F5E5E]" />
              {label}
            </a>
          ))}
        </div>
      </nav>
    </header>
  );
};

/** An Indian-style HSRP number plate: navy IND strip across the top, tricolor flag strip on the left, light monospace plate text. */
const PlateGraphic: React.FC<{ registration: string }> = ({ registration }) => (
  <div className="flex flex-col w-full rounded-md border border-[#9CA3AF] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.12)] bg-white">
    <div className="bg-[#1E2A78] h-[18px] flex items-center justify-center">
      <span className="text-[10px] font-semibold text-white leading-none tracking-[0.12em]">IND</span>
    </div>
    <div className="flex items-stretch">
      <div className="relative w-6 shrink-0 flex flex-col">
        <div className="flex-1 bg-[#FF9933]" />
        <div className="flex-1 bg-white" />
        <div className="flex-1 bg-[#138808]" />
        <svg viewBox="0 0 24 24" className="absolute left-1/2 top-1/2 w-[18px] h-[18px] -translate-x-1/2 -translate-y-1/2" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" stroke="#1E2A78">
            <circle cx="12" cy="12" r="10.5" strokeWidth="1.5" />
            <circle cx="12" cy="12" r="1.6" fill="#1E2A78" strokeWidth="0" />
            {Array.from({ length: 24 }).map((_, i) => (
              <line key={i} x1="12" y1="12" x2="12" y2="2" strokeWidth="0.8" transform={`rotate(${i * 15} 12 12)`} />
            ))}
          </g>
        </svg>
      </div>
      <div className="relative bg-white flex-1 pl-3 pr-4 py-3 flex items-center justify-center">
        <span className="font-mono font-normal text-[32px] leading-none text-[#2B2B2B] tracking-[0.08em] whitespace-pre">{registration}</span>
      </div>
    </div>
  </div>
);

const BOX = 'h-[132px] p-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:shadow-md active:scale-[0.98] transition-all';
const CALL_BOX = `${BOX} bg-[#FFFCEB] border border-[#F2CC0C]/50 hover:border-[#F2CC0C]`;
const WHATSAPP_BOX = `${BOX} bg-[#EFFBF4] border border-[#25D366]/30 hover:border-[#25D366]`;
const EMERGENCY_BOX = `${BOX} col-span-2 justify-self-center w-3/4 bg-[#FFF1F1] border border-[#D6272C]/30 hover:border-[#D6272C]`;

const callBody = (
  <>
    <div className="w-11 h-11 rounded-full bg-[#FFED00] flex items-center justify-center">
      <Phone className="w-5 h-5 text-[#1B1C1C]" />
    </div>
    <span className="font-bold text-sm text-[#1B1C1C]">Call Vehicle Owner</span>
    <span className="text-[11px] text-[#9A8B00]">90 sec · private</span>
  </>
);

const whatsappBody = (
  <>
    <div className="w-11 h-11 rounded-full bg-[#25D366] flex items-center justify-center">
      <MessageCircle className="w-5 h-5 text-white" />
    </div>
    <span className="font-bold text-sm text-[#1B1C1C]">WhatsApp</span>
    <span className="text-[11px] text-[#1A8754]">Private & secure</span>
  </>
);

/** Masked Call + WhatsApp cards. Buttons when `onChoose` is given, otherwise plain tel:/wa.me links. */
const MethodCards: React.FC<{
  onChoose?: (method: 'call' | 'message') => void;
  callHref?: string;
  whatsappHref?: string;
  onEmergency?: () => void;
  emergencySubtitle?: string;
}> = ({ onChoose, callHref, whatsappHref, onEmergency, emergencySubtitle }) => (
  <div className="grid grid-cols-2 gap-3">
    {onChoose && (
      <>
        <button type="button" onClick={() => onChoose('call')} className={CALL_BOX}>{callBody}</button>
        <button type="button" onClick={() => onChoose('message')} className={WHATSAPP_BOX}>{whatsappBody}</button>
      </>
    )}
    {callHref && <a href={callHref} className={CALL_BOX}>{callBody}</a>}
    {whatsappHref && <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className={WHATSAPP_BOX}>{whatsappBody}</a>}
    {onEmergency && (
      <button type="button" onClick={onEmergency} className={EMERGENCY_BOX}>
        <div className="w-11 h-11 rounded-full bg-[#D6272C] flex items-center justify-center">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-sm text-[#1B1C1C] text-center leading-tight whitespace-nowrap">Emergency Family Contact</span>
        <span className="text-[11px] text-[#B01E23]">{emergencySubtitle}</span>
      </button>
    )}
  </div>
);

export const ScanResultCard: React.FC<ScanResultCardProps> = ({ label, owner, vehicle, emergencyContacts, onChooseMethod }) => {
  const primaryContact = emergencyContacts[0];
  const contactIndex = 0;
  const [view, setView] = useState<'main' | 'emergency'>('main');
  const emergencyDigits = primaryContact?.phone?.replace(/\D/g, '');

  const vehicleSubtitle = vehicle
    ? [vehicle.vehicleType, vehicle.brand, vehicle.model, vehicle.color].filter(Boolean).join(' · ')
    : '';

  if (view === 'emergency' && primaryContact) {
    return (
      <div className="min-h-screen w-full bg-[#F5F4F1] font-['Hanken_Grotesk']">
        <ScanHeader />

        <div className="max-w-md mx-auto px-4 py-5 space-y-4">
          <button
            type="button"
            onClick={() => setView('main')}
            className="flex items-center gap-1 text-sm font-semibold text-[#5F5E5E] cursor-pointer hover:text-[#1B1C1C]"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="bg-white rounded-2xl p-4 space-y-3 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-full bg-[#D6272C] flex items-center justify-center shrink-0">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="font-['Rubik'] font-bold text-lg text-[#1B1C1C] leading-tight">
                  {onChooseMethod ? 'Emergency Family Contact' : primaryContact.role || 'Emergency Family Contact'}
                </h1>
                {!onChooseMethod && <p className="text-xs font-semibold text-[#5F5E5E] truncate">{primaryContact.name}</p>}
              </div>
            </div>

            {onChooseMethod ? (
              <>
                <p className="text-xs font-bold text-[#5D5F5F]">Select the person you want to call</p>
                <div className="space-y-2">
                  {emergencyContacts.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onChooseMethod({ kind: 'contact', index: i }, 'call')}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#FFF1F1] border border-[#D6272C]/30 hover:border-[#D6272C] text-left cursor-pointer active:scale-[0.98] transition-all"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#D6272C] flex items-center justify-center shrink-0">
                        <Phone className="w-4 h-4 text-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm text-[#1B1C1C] truncate">{c.name}</p>
                        {c.role && <p className="text-[11px] text-[#B01E23]">{c.role}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              primaryContact.phone && (
                <MethodCards callHref={`tel:${primaryContact.phone}`} whatsappHref={`https://wa.me/${emergencyDigits}`} />
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F5F4F1] font-['Hanken_Grotesk']">
      <ScanHeader />

      <div className="max-w-md mx-auto px-4 py-5 space-y-4">
        <p className="text-center text-[11px] font-semibold text-[#B0AA9E] uppercase tracking-wide">{label}</p>

        {vehicle && (
          <div className="bg-white rounded-2xl border border-[#D1D5DB] p-4 space-y-3">
            <h1 className="flex items-center gap-2 text-base font-normal text-[#374151]">
              Contact vehicle owner
              <PhoneCall className="w-5 h-5 text-[#374151]" strokeWidth={1.5} />
            </h1>
            <PlateGraphic registration={vehicle.registration} />
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
            <MethodCards
              onChoose={(method) => onChooseMethod({ kind: 'owner' }, method)}
              // One contact: straight into verify-plate → call, same steps as
              // calling the owner. Several: ask which person to call first.
              onEmergency={
                primaryContact
                  ? () =>
                      emergencyContacts.length === 1
                        ? onChooseMethod({ kind: 'contact', index: 0 }, 'call')
                        : setView('emergency')
                  : undefined
              }
              emergencySubtitle={primaryContact?.role ?? 'Call family'}
            />
          ) : (
            <>
              {owner.mobileNumber && (
                <a href={`tel:${owner.mobileNumber}`} className="flex items-center gap-2 text-[#5F5E5E] hover:underline text-sm">
                  <Phone className="w-4 h-4 text-[#1B1C1C]" />
                  {owner.mobileNumber}
                </a>
              )}
              {primaryContact?.phone && (
                <MethodCards onEmergency={() => setView('emergency')} emergencySubtitle={primaryContact.role ?? 'Call family'} />
              )}
            </>
          )}
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
