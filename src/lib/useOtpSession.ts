import { useCallback, useEffect, useRef, useState } from 'react';
import {
  linkWithPhoneNumber,
  signInWithPhoneNumber,
  type ConfirmationResult,
  type User,
} from 'firebase/auth';
import { auth, clearRecaptchaVerifier, getRecaptchaVerifier } from './firebase';
import { getAuthErrorMessage, toE164Phone } from './validation';

export const OTP_RESEND_SECONDS = 30;
export const OTP_MAX_ATTEMPTS = 5;
export const OTP_LOCK_SECONDS = 5 * 60;

// Wrong-code attempts are tracked per number for the lifetime of the page so
// closing/reopening the modal can't be used to bypass the temporary lock.
const attemptStore = new Map<string, { fails: number; lockedUntil: number }>();

function getRecord(phone: string) {
  let rec = attemptStore.get(phone);
  if (!rec) {
    rec = { fails: 0, lockedUntil: 0 };
    attemptStore.set(phone, rec);
  }
  if (rec.lockedUntil && rec.lockedUntil <= Date.now()) {
    rec.lockedUntil = 0;
    rec.fails = 0;
  }
  return rec;
}

export function formatCountdown(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/**
 * Shared phone-OTP session for the login and "link mobile" flows: sends a code
 * with a fresh reCAPTCHA verifier every time (so Resend really issues a new
 * code and the previous confirmation is discarded), runs the resend countdown,
 * and applies a temporary lock after OTP_MAX_ATTEMPTS wrong codes.
 */
export function useOtpSession(containerId: string, mode: 'login' | 'link') {
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [sentTo, setSentTo] = useState('');
  const [timer, setTimer] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [numberTaken, setNumberTaken] = useState(false);
  const [, forceTick] = useState(0);
  const sendSeq = useRef(0);

  const lockSecondsLeft = sentTo
    ? Math.max(0, Math.ceil((getRecord(toE164Phone(sentTo)).lockedUntil - Date.now()) / 1000))
    : 0;

  useEffect(() => {
    if (timer <= 0 && lockSecondsLeft <= 0) return;
    const id = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
      forceTick((n) => n + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [timer, lockSecondsLeft]);

  useEffect(() => () => clearRecaptchaVerifier(containerId), [containerId]);

  const send = useCallback(
    async (bare10: string): Promise<boolean> => {
      const e164 = toE164Phone(bare10);
      const rec = getRecord(e164);
      if (rec.lockedUntil > Date.now()) {
        setSentTo(bare10);
        setError(
          `Too many incorrect attempts. Please try again in ${formatCountdown(Math.ceil((rec.lockedUntil - Date.now()) / 1000))}.`,
        );
        return false;
      }
      const seq = ++sendSeq.current;
      setIsSending(true);
      setError('');
      setNumberTaken(false);
      setConfirmation(null); // the previous code/session is no longer usable
      try {
        const verifier = getRecaptchaVerifier(containerId); // always a fresh verifier
        const result =
          mode === 'link' && auth.currentUser
            ? await linkWithPhoneNumber(auth.currentUser, e164, verifier)
            : await signInWithPhoneNumber(auth, e164, verifier);
        if (seq !== sendSeq.current) return false; // superseded by a newer request
        setConfirmation(result);
        setSentTo(bare10);
        setTimer(OTP_RESEND_SECONDS);
        return true;
      } catch (err) {
        clearRecaptchaVerifier(containerId);
        const code = (err as { code?: string })?.code;
        if (code === 'auth/credential-already-in-use' || code === 'auth/account-exists-with-different-credential') {
          setNumberTaken(true);
          setError('This mobile number is already registered with another account.');
        } else {
          setError(getAuthErrorMessage(err, 'Failed to send OTP. Please try again.'));
        }
        return false;
      } finally {
        if (seq === sendSeq.current) setIsSending(false);
      }
    },
    [containerId, mode],
  );

  /** Verifies the code. Returns the signed-in/linked user, or null after setting `error`. */
  const confirmCode = useCallback(
    async (code: string): Promise<User | null> => {
      if (!confirmation) {
        setError('OTP session expired. Please resend the code.');
        return null;
      }
      const rec = getRecord(toE164Phone(sentTo));
      if (rec.lockedUntil > Date.now()) {
        setError(
          `Too many incorrect attempts. Please try again in ${formatCountdown(Math.ceil((rec.lockedUntil - Date.now()) / 1000))}.`,
        );
        return null;
      }
      setError('');
      try {
        const cred = await confirmation.confirm(code);
        attemptStore.delete(toE164Phone(sentTo));
        return cred.user;
      } catch (err) {
        const errCode = (err as { code?: string })?.code;
        if (errCode === 'auth/provider-already-linked' && auth.currentUser) {
          // Already linked on Firebase (e.g. a previous attempt linked but the server sync failed).
          return auth.currentUser;
        }
        if (errCode === 'auth/credential-already-in-use' || errCode === 'auth/account-exists-with-different-credential') {
          setNumberTaken(true);
          setError('This mobile number is already registered with another account.');
          return null;
        }
        if (errCode === 'auth/invalid-verification-code') {
          rec.fails += 1;
          if (rec.fails >= OTP_MAX_ATTEMPTS) {
            rec.lockedUntil = Date.now() + OTP_LOCK_SECONDS * 1000;
            setError(
              `Too many incorrect attempts. This number is locked for ${formatCountdown(OTP_LOCK_SECONDS)}. Please try again later.`,
            );
          } else {
            const left = OTP_MAX_ATTEMPTS - rec.fails;
            setError(`Incorrect OTP. ${left} ${left === 1 ? 'attempt' : 'attempts'} left.`);
          }
          forceTick((n) => n + 1);
          return null;
        }
        if (errCode === 'auth/code-expired' || errCode === 'auth/missing-verification-code') {
          setError('This OTP has expired. Please tap Resend OTP to get a new code.');
          return null;
        }
        setError(getAuthErrorMessage(err, 'Verification failed. Please try again.'));
        return null;
      }
    },
    [confirmation, sentTo],
  );

  /** Back to the phone-number step; the number stays in the caller's state so it is pre-filled. */
  const changeNumber = useCallback(() => {
    sendSeq.current++;
    clearRecaptchaVerifier(containerId);
    setConfirmation(null);
    setTimer(0);
    setError('');
    setNumberTaken(false);
    setIsSending(false);
  }, [containerId]);

  return {
    confirmation,
    sentTo,
    timer,
    isSending,
    error,
    setError,
    numberTaken,
    lockSecondsLeft,
    isLocked: lockSecondsLeft > 0,
    send,
    confirmCode,
    changeNumber,
  };
}
