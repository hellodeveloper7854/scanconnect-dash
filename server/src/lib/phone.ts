/**
 * All numbers in this app are stored/entered as plain 10-digit Indian mobile
 * numbers (see PHONE_PATTERN in orders.ts / vehicles.ts). Partner-facing APIs
 * (Knowlarity) instead speak E.164 (+91XXXXXXXXXX), so this is the single
 * place that converts between the two — nothing else should format a "+91"
 * number by hand.
 */

/** Strips everything but digits, then keeps only the last 10 — tolerant of "+91", "091", spaces, dashes, etc. */
export function last10Digits(raw: string): string {
  return raw.replace(/\D/g, '').slice(-10);
}

/** Formats a stored 10-digit number (or any messier input) as +91XXXXXXXXXX for partner-facing responses. */
export function toE164India(raw: string): string {
  return `+91${last10Digits(raw)}`;
}

/** True if `raw` reduces to exactly 10 digits once non-digits and a leading country code are stripped. */
export function isValidIndianMobile(raw: string): boolean {
  return last10Digits(raw).length === 10;
}

/**
 * Digits for a WhatsApp / Gupshup `send_to` (country code first, no "+"). Keeps a
 * number's own country code instead of forcing India's: "+14155550123" stays as
 * is, "0091 98765 43210" and "+91 98765 43210" become 919876543210, and a bare
 * 10-digit (or 0-prefixed 11-digit) number is treated as an Indian mobile.
 */
export function toWhatsAppNumber(raw: string): string {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (trimmed.startsWith('+')) return digits;
  if (trimmed.startsWith('00')) return digits.slice(2);
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 11 && digits.startsWith('0')) return `91${digits.slice(1)}`;
  return digits; // 12+ digits: already carries a country code
}
