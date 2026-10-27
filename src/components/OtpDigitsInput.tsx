import React, { useEffect, useRef } from 'react';

interface OtpDigitsInputProps {
  digits: string[];
  onChange: (digits: string[]) => void;
  disabled?: boolean;
  className?: string;
  /** Classes applied to every box (size, colours). */
  inputClassName?: string;
}

/**
 * Six single-digit boxes with paste / SMS autofill support (a whole 6-digit
 * code dropped in any box is spread across all boxes — previously only the
 * last digit was kept, which made a correct OTP look wrong).
 */
export const OtpDigitsInput: React.FC<OtpDigitsInputProps> = ({
  digits,
  onChange,
  disabled,
  className = '',
  inputClassName = '',
}) => {
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const t = setTimeout(() => refs.current[0]?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  const fill = (start: number, raw: string) => {
    const incoming = raw.replace(/\D/g, '');
    if (!incoming) return;
    const next = [...digits];
    let i = start;
    for (const ch of incoming) {
      if (i > 5) break;
      next[i++] = ch;
    }
    onChange(next);
    refs.current[Math.min(i, 5)]?.focus();
  };

  return (
    <div className={`flex justify-between gap-2 ${className}`} role="group" aria-label="One-time password">
      {digits.map((digit, index) => (
        <input
          key={index}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          aria-label={`Digit ${index + 1}`}
          maxLength={6}
          disabled={disabled}
          value={digit}
          ref={(el) => {
            refs.current[index] = el;
          }}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');
            if (value.length > 1) {
              fill(index, value);
              return;
            }
            const next = [...digits];
            next[index] = value;
            onChange(next);
            if (value && index < 5) refs.current[index + 1]?.focus();
          }}
          onPaste={(e) => {
            e.preventDefault();
            fill(index, e.clipboardData.getData('text'));
          }}
          onKeyDown={(e) => {
            if (e.key === 'Backspace' && !digits[index] && index > 0) refs.current[index - 1]?.focus();
            if (e.key === 'ArrowLeft' && index > 0) refs.current[index - 1]?.focus();
            if (e.key === 'ArrowRight' && index < 5) refs.current[index + 1]?.focus();
          }}
          className={inputClassName}
        />
      ))}
    </div>
  );
};
