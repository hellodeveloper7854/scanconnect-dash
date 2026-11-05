// Shared validation patterns and messages used across every form in the app,
// so name/phone/email/password rules (and their error text) stay consistent
// instead of being redefined slightly differently in each component.

export const NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]{1,79}$/;
export const PHONE_PATTERN = /^[6-9]\d{9}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PINCODE_PATTERN = /^\d{6}$/;

export const MIN_PASSWORD_LENGTH = 8;

export const VALIDATION_MESSAGES = {
  name: 'Enter a valid full name (letters only, at least 2 characters)',
  fullName: 'Please enter your full name (First and Last Name)',
  phone: 'Enter a valid 10-digit mobile number',
  email: 'Enter a valid email address',
  pincode: 'Enter a valid 6-digit pincode',
  password: `Password must be at least ${MIN_PASSWORD_LENGTH} characters, with an uppercase letter, a lowercase letter, a number and a symbol`,
  passwordMismatch: 'Passwords do not match',
  required: 'This field is required',
};

/** True when any word is one letter repeated ("ggg", "aaaa") — a placeholder, not a name. */
const hasRepeatedLetterWord = (value: string) =>
  value
    .trim()
    .split(/\s+/)
    .some((word) => {
      const letters = word.replace(/[^A-Za-z]/g, '');
      return letters.length >= 2 && /^(.)\1+$/i.test(letters);
    });

export const isValidName = (value: string) => NAME_PATTERN.test(value.trim()) && !hasRepeatedLetterWord(value);

/** A real first + last name: a valid name made of at least two words. */
export const isValidFullName = (value: string) => isValidName(value) && value.trim().split(/\s+/).length >= 2;

export const getFullNameError = (value: string) => {
  if (!isValidName(value)) return VALIDATION_MESSAGES.name;
  if (!isValidFullName(value)) return VALIDATION_MESSAGES.fullName;
  return '';
};
export const isValidPhone = (value: string) => PHONE_PATTERN.test(value.trim());
export const isValidEmail = (value: string) => EMAIL_PATTERN.test(value.trim());
export const isValidPincode = (value: string) => PINCODE_PATTERN.test(value.trim());
// Generic TLDs that never legitimately follow one another ("gmail.com.com").
const GENERIC_TLDS = new Set(['com', 'net', 'org', 'edu', 'gov', 'info']);
// Throwaway-mailbox providers — a short list of the most common ones.
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  'temp-mail.org',
  '10minutemail.com',
  'guerrillamail.com',
  'sharklasers.com',
  'yopmail.com',
  'trashmail.com',
  'getnada.com',
  'dispostable.com',
  'throwawaymail.com',
  'maildrop.cc',
]);

/**
 * Stricter check for an email being *registered* (sign-up, profile edit): the
 * basic format, no repeated/stacked generic extensions (gmail.com.com), and no
 * disposable domains. Sign-in keeps the looser isValidEmail so an existing
 * account is never locked out by a rule added later.
 */
export const getNewEmailError = (value: string) => {
  const email = value.trim();
  if (!isValidEmail(email)) return VALIDATION_MESSAGES.email;
  const domain = email.slice(email.lastIndexOf('@') + 1).toLowerCase();
  const labels = domain.split('.');
  const last = labels[labels.length - 1];
  const secondLast = labels[labels.length - 2];
  if (last === secondLast || (GENERIC_TLDS.has(last) && GENERIC_TLDS.has(secondLast))) {
    return 'Enter a valid email address (check the ending, e.g. .com)';
  }
  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return 'Please use a permanent email address, not a disposable one';
  }
  return '';
};

/**
 * Password policy for choosing a new password: at least 8 characters with an
 * uppercase letter, a lowercase letter, a digit and a symbol, and no trivially
 * guessable patterns — 4+ of the same character in a row ("1111"), or a 4+
 * ascending/descending run ("1234", "abcd", "4321"). Not used for sign-in.
 */
const hasWeakPattern = (value: string) => {
  const s = value.toLowerCase();
  for (let i = 0; i + 3 < s.length; i++) {
    const chunk = s.slice(i, i + 4);
    if (!/^[a-z0-9]{4}$/.test(chunk)) continue;
    const steps = [1, 2, 3].map((k) => chunk.charCodeAt(k) - chunk.charCodeAt(k - 1));
    if (steps.every((d) => d === 0)) return true;
    if (steps.every((d) => d === 1) || steps.every((d) => d === -1)) return true;
  }
  return false;
};

export const getPasswordError = (value: string) => {
  if (!value) return 'Password is required';
  if (value.length < MIN_PASSWORD_LENGTH) return `Password must be at least ${MIN_PASSWORD_LENGTH} characters`;
  if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/\d/.test(value) || !/[^A-Za-z0-9]/.test(value)) {
    return 'Use an uppercase letter, a lowercase letter, a number and a symbol';
  }
  if (hasWeakPattern(value)) return 'Avoid repeated or sequential characters like 1111 or abcd';
  return '';
};

export const isValidPassword = (value: string) => getPasswordError(value) === '';

/** Strips everything but digits and a leading 91, leaving the bare 10-digit number — for use with the fixed "+91" prefix UI. */
export const toBare10DigitPhone = (value: string) =>
  value.replace(/[^\d]/g, '').replace(/^91(?=\d{10}$)/, '').slice(0, 10);

/** Normalizes a bare 10-digit number to E.164 for Firebase (e.g. signInWithPhoneNumber). */
export const toE164Phone = (bare10Digit: string) => `+91${bare10Digit}`;

// Example Indian name shown as placeholder text in every name field.
export const NAME_PLACEHOLDER = 'Rahul Sharma';
export const PHONE_PLACEHOLDER = '9876543210';
export const PASSWORD_HINT = `At least ${MIN_PASSWORD_LENGTH} characters with an uppercase letter, a lowercase letter, a number and a symbol.`;

// Firebase Auth throws errors like `auth/invalid-credential` or
// `auth/user-not-found` — raw codes a user can't act on. This maps the
// common ones to plain messages; anything unmapped falls back to a generic
// message instead of ever showing the raw "Firebase: ..." string or code.
const FIREBASE_AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/invalid-credential': 'Incorrect email or password. Please try again.',
  'auth/wrong-password': 'Incorrect email or password. Please try again.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/invalid-email': 'Enter a valid email address.',
  'auth/user-disabled': 'This account has been disabled. Please contact support.',
  'auth/email-already-in-use': 'An account already exists with this email.',
  'auth/weak-password': `Password is too weak. Use at least ${MIN_PASSWORD_LENGTH} characters with upper, lower, a number and a symbol.`,
  'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
  'auth/network-request-failed': 'Network error. Please check your connection and try again.',
  'auth/invalid-phone-number': 'Enter a valid phone number.',
  'auth/missing-phone-number': 'Enter your phone number.',
  'auth/code-expired': 'This OTP has expired. Please request a new one.',
  'auth/invalid-verification-code': 'Incorrect OTP. Please check the code and try again.',
  'auth/credential-already-in-use': 'This account is already linked to another user.',
  'auth/requires-recent-login': 'Please sign in again to continue.',
  'auth/popup-closed-by-user': 'Sign-in was cancelled.',
};

/** Turns any caught error (Firebase or otherwise) into a message safe to show a user. */
export const getAuthErrorMessage = (err: unknown, fallback = 'Something went wrong. Please try again.') => {
  if (err && typeof err === 'object' && 'code' in err && typeof (err as { code: unknown }).code === 'string') {
    const code = (err as { code: string }).code;
    if (code in FIREBASE_AUTH_ERROR_MESSAGES) return FIREBASE_AUTH_ERROR_MESSAGES[code];
  }
  if (err instanceof Error && !('code' in err)) return err.message.replace('Firebase: ', '');
  return fallback;
};
