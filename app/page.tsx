'use client';

import { useRole } from '@/app/providers/TestingRoleProvider';
import { useAuth } from '@/app/providers/TestingAuthProvider';
import PageTitle from '@/components/layout/pageTitle';
import PackageDashboard from '@/components/dashboard/PackageDashboard';
import StudentDashboard from '@/components/dashboard/StudentDashboard';

export default function HomePage() {
  const { isStudent } = useRole();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
        <p className="text-lg text-byu-navy font-medium">
          Welcome to ECE Mail
        </p>
        <p className="text-sm text-gray-500">
          Sign in using the button in the header to get started.
        </p>
      </div>
    );
  }

  return (
    <>
      <PageTitle title={isStudent ? 'MY PACKAGES' : 'PACKAGE DASHBOARD'} />
      {isStudent ? <StudentDashboard /> : <PackageDashboard />}
    </>
  );
}