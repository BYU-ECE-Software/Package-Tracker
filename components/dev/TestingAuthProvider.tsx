'use client';

// TODO: replace with real auth before going to production
// This provider simulates authentication using dev accounts from lib/devAccounts.ts

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { DevAccount } from '@/lib/devAccounts';

type AuthContextType = {
  isAuthenticated: boolean;
  user: DevAccount | null;
  signIn: (account: DevAccount) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type TestAuthProviderProps = {
  children: ReactNode;
  initialAuth: boolean;
};

export function TestAuthProvider({ children, initialAuth }: TestAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth);
  const [user, setUser] = useState<DevAccount | null>(null);

  const signIn = (account: DevAccount) => {
    setIsAuthenticated(true);
    setUser(account);
    document.cookie = 'testing-auth=true; path=/; max-age=31536000';
  };

  const signOut = () => {
    setIsAuthenticated(false);
    setUser(null);
    document.cookie = 'testing-auth=; path=/; max-age=0';
  };

  const value = useMemo(
    () => ({ isAuthenticated, user, signIn, signOut }),
    [isAuthenticated, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within a TestAuthProvider');
  return context;
}