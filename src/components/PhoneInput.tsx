import React from 'react';
import { toBare10DigitPhone } from '../lib/validation';

interface PhoneInputProps {
  /** Bare 10-digit number (no +91, no spaces) — the only thing the field ever holds. */
  value: string;
  onChange: (bare10Digit: string) => void;
  onBlur?: () => void;
  hasError?: boolean;
  disabled?: boolean;
  required?: boolean;
  id?: string;
  className?: string;
  inputClassName?: string;
}

/**
 * Every mobile number field in the app is Indian-only, so the "+91" is fixed
 * and never typed — the box only ever accepts and shows the 10 local digits.
 * Kept as one component so every phone field (own number, emergency
 * contacts, inquiry forms, etc.) behaves identically.
 */
export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  onBlur,
  hasError,
  disabled,
  required,
  id,
  className = '',
  inputClassName = '',
}) => {
  return (
    <div
      className={`flex items-stretch h-[46px] bg-white border rounded-lg overflow-hidden transition-all focus-within:ring-2 ${
        hasError ? 'border-red-500 focus-within:ring-red-400' : 'border-[#CCC7AA] focus-within:ring-[#FFED00]'
      } ${className}`}
    >
      <span className="flex items-center px-3 bg-[#F5F4F1] text-[#1B1C1C] font-semibold text-sm border-r border-[#CCC7AA] select-none shrink-0">
        +91
      </span>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        required={required}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange(toBare10DigitPhone(e.target.value))}
        onBlur={onBlur}
        placeholder="9876543210"
        maxLength={10}
        className={`flex-1 min-w-0 h-full px-3 bg-white text-[#1B1C1C] font-normal placeholder-neutral-400 text-sm outline-none disabled:bg-[#F5F3F3] disabled:text-[#5F5E5E] ${inputClassName}`}
      />
    </div>
  );
};
