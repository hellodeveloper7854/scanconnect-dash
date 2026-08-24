import React from 'react';
import { Mail, Phone, ShieldCheck, Car, UserRound, Lock } from 'lucide-react';
import logo from '../assets/images/logo.png';

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
   * When provided, phone numbers are hidden and rendered as a "Call" button
   * instead of a raw tel: link — clicking it defers to the caller (e.g. to
   * run a last-4-digit verification) rather than exposing the number directly.
   * When omitted, phone numbers render as plain tel: links (unauthenticated
   * order-contact flow, which has no verification step at all).
   */
  onRequestCall?: (target: { kind: 'owner' } | { kind: 'contact'; index: number }) => void;
}

export const ScanResultCard: React.FC<ScanResultCardProps> = ({
  label,
  owner,
  vehicle,
  emergencyContacts,
  onRequestCall,
}) => {
  return (
    <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center p-4 font-['Hanken_Grotesk']">
      <div className="w-full max-w-sm bg-white border border-[#E4E2E2] shadow-[0px_4px_20px_-2px_rgba(0,0,0,0.08)] rounded-[16px] p-8 space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <img src={logo} alt="ScanConnect" className="h-10 w-auto object-contain" />
          <div className="flex items-center gap-2 text-[#FFED00]">
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
              <Mail className="w-4 h-4 text-[#FFED00]" />
              <a href={`mailto:${owner.email}`} className="hover:underline text-sm">
                {owner.email}
              </a>
            </div>
          )}

          {onRequestCall ? (
            <button
              type="button"
              onClick={() => onRequestCall({ kind: 'owner' })}
              className="flex items-center gap-2 text-[#736B00] hover:underline text-sm font-semibold cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-[#FFED00]" />
              Call Owner
            </button>
          ) : (
            owner.mobileNumber && (
              <div className="flex items-center gap-2 text-[#5F5E5E]">
                <Phone className="w-4 h-4 text-[#FFED00]" />
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
              <p className="font-['Rubik'] font-bold text-[#1B1C1C]">{vehicle.nickname || vehicle.registration}</p>
              <p className="text-[#5F5E5E] text-sm font-mono">{vehicle.registration}</p>
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
                  {onRequestCall ? (
                    <button
                      type="button"
                      onClick={() => onRequestCall({ kind: 'contact', index: idx })}
                      className="flex items-center gap-2 text-[#736B00] hover:underline text-sm font-semibold cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-[#FFED00]" />
                      Call
                    </button>
                  ) : (
                    contact.phone && (
                      <a
                        href={`tel:${contact.phone}`}
                        className="flex items-center gap-2 text-[#5F5E5E] hover:underline text-sm"
                      >
                        <Phone className="w-3.5 h-3.5 text-[#FFED00]" />
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
