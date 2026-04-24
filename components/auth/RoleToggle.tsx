'use client';

import { useRole } from '@/app/providers/TestingRoleProvider';
import { useAuth } from '@/app/providers/TestingAuthProvider';
import ToggleSwitch from '@/components/ui/ToggleSwitch';

type RoleToggleProps = {
  className?: string;
};

export default function RoleToggle({ className = '' }: RoleToggleProps) {
  const { role, setRole } = useRole();
  const { isAuthenticated } = useAuth();

  const isAdmin = role === 'admin';

  return (
    <div className={`hidden items-center gap-3 text-white/80 sm:flex ${className}`}>
      <span>
        <span className="font-medium text-white">
          {isAdmin ? 'Admin' : 'Student'}
        </span>{' '}
        View
      </span>
      {/* Toggle is locked once signed in — role is determined by the account */}
      <ToggleSwitch
        checked={isAdmin}
        onChange={(val) => setRole(val ? 'admin' : 'student')}
        disabled={isAuthenticated}
      />
    </div>
  );
}