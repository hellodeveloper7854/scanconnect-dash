import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { api, ApiError } from '../lib/api';

export interface BackendUser {
  id: string;
  firebaseUid: string;
  fullName: string;
  email: string;
  emailVerified: boolean;
  mobileNumber: string | null;
  mobileVerified: boolean;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

interface AuthContextValue {
  firebaseUser: FirebaseUser | null;
  user: BackendUser | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  isAdmin: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<BackendUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBackendUser = async () => {
    try {
      const res = await api.get<{ user: BackendUser }>('/api/auth/me');
      setUser(res.user);
    } catch (err) {
      // No backend record yet (mid-registration) or session invalid.
      if (!(err instanceof ApiError && err.status === 404)) {
        console.error(err);
      }
      setUser(null);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        await fetchBackendUser();
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const logout = async () => {
    await auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        isLoading,
        isLoggedIn: Boolean(firebaseUser && user),
        isAdmin: user?.role === 'ADMIN',
        refreshUser: fetchBackendUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
