import { z } from 'zod';

/**
 * Input rules shared by every route, so the website, the mobile app and any
 * other client are held to the same standard (client-side checks are only a
 * convenience; these are the real gate).
 */

/** A person's name: letters (plus space . ' -), each word >= 2 letters, >= 3 letters in total. */
export function isValidPersonName(value: string): boolean {
  const v = value.trim();
  if (v.length < 3 || v.length > 80) return false;
  if (!/^[A-Za-z][A-Za-z .'-]*$/.test(v)) return false;
  const words = v.split(/\s+/);
  const letters = (w: string) => w.replace(/[^A-Za-z]/g, '').length;
  return words.every((w) => letters(w) >= 2) && letters(v) >= 3;
}

export const PERSON_NAME_MESSAGE = 'Enter a valid full name (letters only, at least 2 letters in each part).';

export const fullNameSchema = z
  .string()
  .trim()
  .refine(isValidPersonName, { message: PERSON_NAME_MESSAGE });

/** 10-digit Indian mobile numbers that are obvious dummies (6666666666, 9898989898, 9876543210). */
export function isDummyPhone(tenDigits: string): boolean {
  if (new Set(tenDigits.split('')).size <= 2) return true;
  return tenDigits === '9876543210' || tenDigits === '0123456789';
}

/** Last 10 digits of a phone string, ignoring +91 / spaces / dashes. */
export function last10(value: string): string {
  return value.replace(/\D/g, '').slice(-10);
}

/** Emergency-contact style phone: 6-20 chars, and when it is a 10-digit Indian number it must not be a dummy. */
export const contactPhoneSchema = z
  .string()
  .min(6)
  .max(20)
  .refine((v) => {
    const digits = last10(v);
    return digits.length < 10 || !isDummyPhone(digits);
  }, { message: 'Enter a real mobile number.' });

/** Vehicle registration with spaces/hyphens removed and upper-cased. */
export function normalizeRegistration(value: string): string {
  return value.toUpperCase().replace(/[\s-]/g, '');
}

// 2-letter state, 1-2 digit RTO, 0-3 letter series, 4-digit number: MH12AB1234, DL1CAB1234, GJ011234
const PLATE = /^[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{4}$/;
const BH_PLATE = /^\d{2}BH\d{4}[A-Z]{1,2}$/; // Bharat series 22BH1234AA

export function isValidRegistration(value: string): boolean {
  const v = normalizeRegistration(value);
  return PLATE.test(v) || BH_PLATE.test(v);
}

export const registrationSchema = z
  .string()
  .min(1)
  .max(30)
  .refine(isValidRegistration, { message: 'Enter a valid number plate, e.g. MH12AB1234.' })
  // Stored upper-cased with spaces/hyphens removed, so "gj01 ab-1234" and "GJ01AB1234" are one plate.
  .transform(normalizeRegistration);

/** Vehicle make / model: letters, digits, space, dot, hyphen; at least one letter. */
export const vehicleTextSchema = z
  .string()
  .trim()
  .max(60)
  .refine((v) => v === '' || (/^[A-Za-z0-9][A-Za-z0-9 .\-]{0,59}$/.test(v) && /[A-Za-z]/.test(v)), {
    message: 'Use letters and numbers only (no symbols).',
  });
