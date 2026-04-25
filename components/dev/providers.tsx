// layers all of the providers in one file so the layout.tsx file doesn't get cluttered

'use client';

import type { ReactNode } from 'react';
import { TestAuthProvider } from './TestingAuthProvider';
import { TestRoleProvider, type AppRole } from './TestingRoleProvider';

type ProvidersProps = {
  children: ReactNode;
  initialRole: AppRole;
  initialAuth: boolean;
};

export default function Providers({ children, initialRole, initialAuth }: ProvidersProps) {
  return (
    <TestAuthProvider initialAuth={initialAuth}>
      <TestRoleProvider initialRole={initialRole}>{children}</TestRoleProvider>
    </TestAuthProvider>
  );
}
