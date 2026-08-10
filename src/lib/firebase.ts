import { initializeApp } from 'firebase/app';
import { getAuth, RecaptchaVerifier } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const firebaseApp = initializeApp(firebaseConfig);
export const auth = getAuth(firebaseApp);

const recaptchaVerifiers = new Map<string, RecaptchaVerifier>();

/**
 * Always creates a fresh verifier bound to the given container, clearing any
 * prior instance first. A cached verifier can outlive its DOM node (e.g. a
 * modal closing/reopening) and Firebase then rejects the stale grecaptcha
 * widget with auth/invalid-app-credential.
 */
export function getRecaptchaVerifier(containerId: string): RecaptchaVerifier {
  const existing = recaptchaVerifiers.get(containerId);
  if (existing) {
    existing.clear();
    recaptchaVerifiers.delete(containerId);
  }
  const verifier = new RecaptchaVerifier(auth, containerId, { size: 'invisible' });
  recaptchaVerifiers.set(containerId, verifier);
  return verifier;
}
