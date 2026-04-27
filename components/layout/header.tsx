'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import RoleToggle from '@/components/dev/RoleToggle';
import SignInSignOut from '@/components/dev/SignInSignOut';
import { useRole } from '@/components/dev/TestingRoleProvider';

const HeaderBar = () => {
  const pathname = usePathname();
  const { isAdmin } = useRole();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Measures the logo width so the white nav bar aligns with it on desktop
  const logoRef = useRef<HTMLAnchorElement>(null);
  const [navPadLeft, setNavPadLeft] = useState<number>(128);

  useLayoutEffect(() => {
    const update = () => {
      const el = logoRef.current;
      if (!el) return;
      const rem =
        parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      setNavPadLeft(el.offsetWidth + rem);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const allNavLinks = [
    { href: '/', label: 'Dashboard', adminOnly: false },
    { href: '/Admin', label: 'Admin', adminOnly: true },
  ];

  // Hide admin nav link from students
  const navLinks = allNavLinks.filter((l) => !l.adminOnly || isAdmin);

  return (
    <div className="sticky top-0 z-50 w-full">
      <header className="bg-byu-navy relative w-full py-4 text-white shadow-md md:w-full">
        <div className="flex items-center justify-between px-6">
          <div className="flex items-center">
            <a
              ref={logoRef}
              href="https://www.byu.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="border-byu-royal mr-4 border-r pr-4"
            >
              <img src="/BYU_monogram_white.svg" alt="BYU logo" className="h-10 w-auto" />
            </a>
            <h1 className="text-2xl">ECE Mail</h1>
          </div>

          <div className="flex items-center gap-3 pr-6 text-base">
            <RoleToggle />
            <SignInSignOut variant="desktop" />

            <button
              type="button"
              className="inline-flex items-center justify-center rounded p-2 hover:bg-white/10 focus:outline-none md:hidden"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              <span className="text-xl" aria-hidden="true">
                {mobileOpen ? '✕' : '☰'}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="text-byu-navy w-full border-t bg-white shadow md:hidden"
        >
          <SignInSignOut variant="mobile" onAction={() => setMobileOpen(false)} />
          <nav className="flex flex-col py-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`px-6 py-4 hover:bg-[#FAFAFA] ${
                  pathname === link.href ? 'bg-gray-100 font-semibold' : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      {/* White nav bar - desktop only */}
      <nav className="text-byu-navy hidden w-full bg-white shadow md:block">
        <div
          className="flex px-6 text-base font-medium"
          style={{ paddingLeft: navPadLeft }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link-hover px-8 py-4 whitespace-nowrap hover:bg-[#FAFAFA] ${
                pathname === link.href ? 'nav-link-active bg-[#FAFAFA] font-semibold' : ''
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
};

export default HeaderBar;