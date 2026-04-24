// For testing purposes, there are two types of users: "student" and "admin".
// Student/admin role has access to everything originally. once you mark things as admin only then it is removed from student view
// You can mark nav tabs, entire pages, or individual components/buttons as admin only and they will disappear when on student view
// If more roles are added, this file will need to be updated and new ways of switching between multiple roles for testing will be needed (currently uing RoleToggle.tsx)
// the use of isAdmin is supposed to integrate easily with real role authorization in the future

'use client';

import React, { createContext, useContext, useMemo, useState } from 'react';

export type AppRole = 'student' | 'admin';

type RoleContextValue = {
  role: AppRole;
  setRole: (r: AppRole) => void;
  isStudent: boolean;
  isAdmin: boolean;
};

const RoleContext = createContext<RoleContextValue | null>(null);

type TestRoleProviderProps = {
  children: React.ReactNode;
  initialRole: AppRole;
};

export function TestRoleProvider({ children, initialRole }: TestRoleProviderProps) {
  const [role, setRoleState] = useState<AppRole>(initialRole);

  const setRole = (r: AppRole) => {
    setRoleState(r);
    document.cookie = `appRole=${r}; path=/; max-age=31536000`;
  };

  const value = useMemo(
    () => ({
      role,
      setRole,
      isStudent: role === 'student',
      isAdmin: role === 'admin',
    }),
    [role],
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be inside RoleProvider');
  return ctx;
}
