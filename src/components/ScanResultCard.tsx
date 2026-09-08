import React, { useState } from 'react';
import { Mail, Phone, ShieldCheck, Car, UserRound, Lock, MessageCircle } from 'lucide-react';
import logo from '../assets/images/logo.png';

export type CallTarget = { kind: 'owner' } | { kind: 'contact'; index: number };

interface ScanResultCardProps {
  label: string;
  owner: { fullName: string; email?: string; mobileNumber?: string | null };
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
   * When provided, phone numbers are hidden and rendered as a "Contact"
   * button that expands the "How would you like to reach out?" choice
   * inline (Masked Call / Message) right below it, instead of exposing the
   * number directly. Picking a method hands off to the caller to run the
   * verify+call/message flow (e.g. a popup with last-4 verification).
   * When omitted, phone numbers render as plain tel: links (unauthenticated
   * order-contact flow, which has no verification step at all).
   */
  onChooseMethod?: (target: CallTarget, method: 'call' | 'message') => void;
}

/**
 * Inline "How would you like to reach out?" choice, replacing the old popup's
 * first screen. `onCancel` is optional — omit it (e.g. for the owner, who
 * has no separate "Contact Owner" toggle button to collapse back to) to hide
 * the Cancel button entirely.
 */
const ContactMethodChoice: React.FC<{
  onChoose: (method: 'call' | 'message') => void;
  onCancel?: () => void;
}> = ({ onChoose, onCancel }) => (
  <div className="space-y-3 p-3 bg-[#FAFAF9] border border-[#E4E2E2] rounded-xl">
    <p className="text-xs font-bold text-[#1B1C1C]">How would you like to reach out?</p>
    <div className="grid grid-cols-2 gap-2">
      <button
        type="button"
        onClick={() => onChoose('call')}
        className="p-3 bg-white border border-[#E4E2E2] rounded-lg flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#FFED00] transition-colors"
      >
        <Phone className="w-5 h-5 text-[#1B1C1C]" />
        <span className="font-bold text-xs text-[#1B1C1C]">Masked Call</span>
        <span className="text-[10px] text-[#9CA3AF]">90 sec · private</span>
      </button>
      <button
        type="button"
        onClick={() => onChoose('message')}
        className="p-3 bg-white border border-[#E4E2E2] rounded-lg flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#FFED00] transition-colors"
      >
        <MessageCircle className="w-5 h-5 text-[#1B1C1C]" />
        <span className="font-bold text-xs text-[#1B1C1C]">Message</span>
        <span className="text-[10px] text-[#9CA3AF]">WhatsApp-style</span>
      </button>
    </div>
    {onCancel && (
      <button
        type="button"
        onClick={onCancel}
        className="w-full h-[36px] bg-[#EFEDED] text-[#5D5F5F] font-bold text-xs rounded-lg cursor-pointer"
      >
        Cancel
      </button>
    )}
  </div>
);

export const ScanResultCard: React.FC<ScanResultCardProps> = ({
  label,
  owner,
  vehicle,
  emergencyContacts,
  onChooseMethod,
}) => {
  const [openTarget, setOpenTarget] = useState<CallTarget | null>(null);

  const targetsMatch = (a: CallTarget, b: CallTarget) =>
    a.kind === 'owner' && b.kind === 'owner' ? true : a.kind === 'contact' && b.kind === 'contact' && a.index === b.index;

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-4 font-['Hanken_Grotesk']">
      <div className="w-full max-w-sm bg-white border border-[#E4E2E2] shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.08)] rounded-[16px] p-8 space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <img src={logo} alt="ScanConnect" className="h-10 w-auto object-contain" />
          <div className="flex items-center gap-2 text-[#1B1C1C]">
            <ShieldCheck className="w-4 h-4" />
            <span className="font-['Rubik'] font-bold uppercase tracking-wide text-xs text-[#736B00]">{label}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-xs font-bold uppercase text-[#9CA3AF] tracking-wide">Owner</p>
            <p className="font-['Rubik'] font-bold text-lg text-[#1B1C1C]">{owner.fullName}</p>
          </div>

          {owner.email && (
            <div className="flex items-center gap-2 text-[#5F5E5E]">
              <Mail className="w-4 h-4 text-[#1B1C1C]" />
              <a href={`mailto:${owner.email}`} className="hover:underline text-sm">
                {owner.email}
              </a>
            </div>
          )}

          {onChooseMethod ? (
            <ContactMethodChoice onChoose={(method) => onChooseMethod({ kind: 'owner' }, method)} />
          ) : (
            owner.mobileNumber && (
              <div className="flex items-center gap-2 text-[#5F5E5E]">
                <Phone className="w-4 h-4 text-[#1B1C1C]" />
                <a href={`tel:${owner.mobileNumber}`} className="hover:underline text-sm">
                  {owner.mobileNumber}
                </a>
              </div>
            )
          )}

          {vehicle && (
            <div className="pt-4 border-t border-[#EFEDED] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#9CA3AF] tracking-wide">
                <Car className="w-3.5 h-3.5" /> Vehicle
              </div>
              {vehicle.nickname && (
                <p className="font-['Rubik'] font-bold text-[#1B1C1C]">{vehicle.nickname}</p>
              )}
              {(vehicle.brand || vehicle.model || vehicle.color) && (
                <p className="text-[#9CA3AF] text-xs">
                  {[vehicle.vehicleType, vehicle.brand, vehicle.model, vehicle.fuelType, vehicle.color]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              )}
            </div>
          )}

          {emergencyContacts.length > 0 && (
            <div className="pt-4 border-t border-[#EFEDED] space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-[#9CA3AF] tracking-wide">
                <UserRound className="w-3.5 h-3.5" /> Emergency Contact{emergencyContacts.length > 1 ? 's' : ''}
              </div>
              {emergencyContacts.map((contact, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="font-['Rubik'] font-bold text-[#1B1C1C] text-sm">{contact.name}</p>
                  {contact.role && <p className="text-[#9CA3AF] text-xs">{contact.role}</p>}
                  {onChooseMethod ? (
                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={() =>
                          setOpenTarget((t) =>
                            t && targetsMatch(t, { kind: 'contact', index: idx }) ? null : { kind: 'contact', index: idx },
                          )
                        }
                        className="flex items-center gap-2 text-[#736B00] hover:underline text-sm font-semibold cursor-pointer"
                      >
                        <Lock className="w-3.5 h-3.5 text-[#1B1C1C]" />
                        Contact
                      </button>
                      {openTarget && targetsMatch(openTarget, { kind: 'contact', index: idx }) && (
                        <ContactMethodChoice
                          onChoose={(method) => {
                            onChooseMethod({ kind: 'contact', index: idx }, method);
                            setOpenTarget(null);
                          }}
                          onCancel={() => setOpenTarget(null)}
                        />
                      )}
                    </div>
                  ) : (
                    contact.phone && (
                      <a
                        href={`tel:${contact.phone}`}
                        className="flex items-center gap-2 text-[#5F5E5E] hover:underline text-sm"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#1B1C1C]" />
                        {contact.phone}
                      </a>
                    )
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
