'use client';

import { useEffect, useRef, useState } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { useAuth } from '@/components/dev/TestingAuthProvider';
import { useRole } from '@/components/dev/TestingRoleProvider';
import { DEV_SECRETARIES, DEV_STUDENTS } from '@/lib/devAccounts';
import type { DevAccount } from '@/lib/devAccounts';

type SignInSignOutProps = {
  className?: string;
  variant?: 'desktop' | 'mobile';
  onAction?: () => void;
};

export default function SignInSignOut({
  className = '',
  variant = 'desktop',
  onAction,
}: SignInSignOutProps) {
  const { isAuthenticated, user, signIn, signOut } = useAuth();
  const { role, setRole } = useRole();
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Accounts shown in the dropdown depend on the current role toggle
  const availableAccounts = role === 'admin' ? DEV_SECRETARIES : DEV_STUDENTS;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignIn = (account: DevAccount) => {
    // Lock the role toggle to match the account being signed into
    setRole(account.role === 'STUDENT' ? 'student' : 'admin');
    signIn(account);
    setMenuOpen(false);
    onAction?.();
  };

  const handleSignOut = () => {
    signOut();
    setMenuOpen(false);
    onAction?.();
  };

  const isMobile = variant === 'mobile';

  if (isMobile) {
    return (
      <div ref={containerRef} className={`px-6 py-3 ${className}`}>
        {!isAuthenticated ? (
          <div>
            <p className="mb-2 text-sm font-medium text-byu-navy">
              Sign in as ({role === 'admin' ? 'Secretary' : 'Student'}):
            </p>
            <div className="flex flex-col gap-1">
              {availableAccounts.map((account) => (
                <button
                  key={account.netId}
                  type="button"
                  onClick={() => handleSignIn(account)}
                  className="text-left text-sm text-byu-navy hover:underline"
                >
                  {account.fullName}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-byu-navy">
              <FaUserCircle className="h-4 w-4" />
              <span>{user?.fullName}</span>
            </div>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm underline text-byu-navy"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`hidden items-center sm:flex ${className}`}>
      {!isAuthenticated ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex cursor-pointer items-center gap-1 px-3 font-medium text-white hover:underline"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            Sign In
            <span
              className={`text-xs transition-transform ${menuOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            >
              ▼
            </span>
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-52 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
              role="menu"
            >
              <p className="px-4 py-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                {role === 'admin' ? 'Secretaries' : 'Students'}
              </p>
              {availableAccounts.map((account) => (
                <button
                  key={account.netId}
                  type="button"
                  onClick={() => handleSignIn(account)}
                  className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                  role="menuitem"
                >
                  {account.fullName}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="inline-flex cursor-pointer items-center gap-2 px-3"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
          >
            <FaUserCircle className="h-4 w-4 text-white" />
            <span className="font-medium text-white">{user?.fullName}</span>
            <span
              className={`text-xs text-white transition-transform ${menuOpen ? 'rotate-180' : ''}`}
              aria-hidden="true"
            >
              ▼
            </span>
          </button>

          {menuOpen && (
            <div
              className="absolute right-0 mt-2 w-40 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
              role="menu"
            >
              <button
                type="button"
                onClick={handleSignOut}
                className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                role="menuitem"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}