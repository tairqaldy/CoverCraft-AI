
"use client";

import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import type { ReactNode } from 'react';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';

// Define a mock user structure
const mockUser: User = {
  uid: 'mockUser123',
  email: 'testuser@example.com',
  displayName: 'Test User',
  photoURL: null,
  emailVerified: true,
  isAnonymous: false,
  metadata: {},
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => '',
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({}),
  providerId: 'password' // Or any relevant provider
};


interface AuthContextType {
  user: User | null;
  loading: boolean;
  skipLoginModeActive: boolean;
  activateSkipLogin: () => void;
  deactivateSkipLogin: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  skipLoginModeActive: false,
  activateSkipLogin: () => {},
  deactivateSkipLogin: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [skipLoginModeActive, setSkipLoginModeActive] = useState(false);

  const activateSkipLogin = useCallback(() => {
    setUser(mockUser);
    setSkipLoginModeActive(true);
    setLoading(false); // Ensure loading is false when mock user is set
  }, []);

  const deactivateSkipLogin = useCallback(() => {
    setSkipLoginModeActive(false);
    // This will trigger onAuthStateChanged if a real user was logged in,
    // or set user to null if not.
    setLoading(true); // Allow onAuthStateChanged to take over
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      unsubscribe(); // Unsubscribe after first check
    });
  }, []);

  useEffect(() => {
    if (skipLoginModeActive) {
      setUser(mockUser);
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!skipLoginModeActive) { // Only update if not in skip mode
        setUser(currentUser);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [skipLoginModeActive]);

  if (loading && !skipLoginModeActive) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ user, loading, skipLoginModeActive, activateSkipLogin, deactivateSkipLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
