// Layers all of the dev providers in one component so the layout file
// doesn't get cluttered. Replace with your real provider stack before
// shipping.

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
