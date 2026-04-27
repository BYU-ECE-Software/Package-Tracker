'use client';

// TODO: replace with real auth before going to production
// This provider simulates authentication using dev accounts from lib/devAccounts.ts

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { User } from '@/types/user';
import { fetchUsers } from '@/lib/api/users';

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  signIn: (account: User) => void;
  signOut: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type TestAuthProviderProps = {
  children: ReactNode;
  initialAuth: boolean;
};

export function TestAuthProvider({ children, initialAuth }: TestAuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(initialAuth);
  const [user, setUser] = useState<User | null>(null);

  const signIn = (account: User) => {
    setIsAuthenticated(true);
    setUser(account);
    document.cookie = 'testing-auth=true; path=/; max-age=31536000';

    // Dev accounts have hardcoded ids that don't exist in the database.
    // Resolve to the real seeded user by netId so foreign-key writes
    // (checkedInById, checkedOutById, …) succeed.
    fetchUsers({ search: account.netId, pageSize: 5 })
      .then((res) => {
        const real = res.data.find((u) => u.netId === account.netId);
        if (real) setUser(real);
        else console.warn(
          `Dev account ${account.netId} has no matching DB user — run \`npx prisma db seed\`.`,
        );
      })
      .catch((err) => console.warn('Failed to resolve dev account:', err));
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