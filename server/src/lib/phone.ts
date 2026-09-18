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
