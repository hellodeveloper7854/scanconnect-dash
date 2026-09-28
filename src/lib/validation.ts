// Shared validation patterns and messages used across every form in the app,
// so name/phone/email/password rules (and their error text) stay consistent
// instead of being redefined slightly differently in each component.

export const NAME_PATTERN = /^[A-Za-z][A-Za-z .'-]{1,79}$/;
export const PHONE_PATTERN = /^[6-9]\d{9}$/;
export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PINCODE_PATTERN = /^\d{6}$/;

export const MIN_PASSWORD_LENGTH = 6;

export const VALIDATION_MESSAGES = {
  name: 'Enter a valid full name (letters only, at least 2 characters)',
  phone: 'Enter a valid 10-digit mobile number',
  email: 'Enter a valid email address',
  pincode: 'Enter a valid 6-digit pincode',
  password: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
  passwordMismatch: 'Passwords do not match',
  required: 'This field is required',
};

export const isValidName = (value: string) => NAME_PATTERN.test(value.trim());
export const isValidPhone = (value: string) => PHONE_PATTERN.test(value.trim());
export const isValidEmail = (value: string) => EMAIL_PATTERN.test(value.trim());
export const isValidPincode = (value: string) => PINCODE_PATTERN.test(value.trim());
export const isValidPassword = (value: string) => value.length >= MIN_PASSWORD_LENGTH;

/** Strips everything but digits and a leading 91, leaving the bare 10-digit number — for use with the fixed "+91" prefix UI. */
export const toBare10DigitPhone = (value: string) =>
  value.replace(/[^\d]/g, '').replace(/^91(?=\d{10}$)/, '').slice(0, 10);

/** Normalizes a bare 10-digit number to E.164 for Firebase (e.g. signInWithPhoneNumber). */
export const toE164Phone = (bare10Digit: string) => `+91${bare10Digit}`;

// Example Indian name shown as placeholder text in every name field.
export const NAME_PLACEHOLDER = 'Rahul Sharma';
export const PHONE_PLACEHOLDER = '9876543210';
export const PASSWORD_HINT = `At least ${MIN_PASSWORD_LENGTH} characters. Letters, numbers and symbols are all accepted.`;

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
  'auth/weak-password': `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
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
