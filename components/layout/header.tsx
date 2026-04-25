'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import BYULogo from '@/public/BYU_monogram_white.svg';
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
    <div className="w-full sticky top-0 z-50">
      {/* Navy bar */}
      <header className="relative w-full bg-byu-navy text-white py-4 shadow-md">
        <div className="px-6 flex items-center justify-between">
          <div className="flex items-center">
            <a
              ref={logoRef}
              href="https://www.byu.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="mr-4 border-r-[1px] border-byu-royal"
            >
              <Image
                src={BYULogo}
                alt="BYU Logo"
                className="h-10 w-auto"
                priority
              />
            </a>
            <h1 className="text-2xl">ECE Mail</h1>
          </div>

          <div className="flex items-center gap-4 pr-6">
            <RoleToggle />
            <SignInSignOut variant="desktop" />
            <button
              className="inline-flex items-center justify-center p-2 rounded md:hidden hover:bg-white/10 focus:outline-none"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
              aria-controls="mobile-menu"
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? (
                <AiOutlineClose size={22} />
              ) : (
                <AiOutlineMenu size={22} />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileOpen && (
        <div
          id="mobile-menu"
          className="md:hidden w-full bg-white text-byu-navy shadow border-t"
        >
          <SignInSignOut
            variant="mobile"
            onAction={() => setMobileOpen(false)}
          />
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
      <nav className="hidden md:block w-full bg-white text-byu-navy shadow">
        <div
          className="flex text-base font-medium px-6"
          style={{ paddingLeft: navPadLeft }}
        >
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-8 py-4 hover:bg-[#FAFAFA] rounded-md block ${
                pathname === link.href ? 'bg-gray-100 font-semibold' : ''
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