'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { AiOutlineMenu, AiOutlineClose } from 'react-icons/ai';
import BYULogo from '@/public/BYU_monogram_white.svg';

// TODO: import auth utilities once auth is wired up
// import { adminLogout } from '@/api/auth';

const HeaderBar = () => {
  const pathname = usePathname();
  const router = useRouter();
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

  const navLinks = [
    { href: '/', label: 'Dashboard' },
    { href: '/Admin', label: 'Admin' },
  ];

  // TODO: replace with real auth logout once auth is wired up
  const handleSignOut = async () => {
    try {
      // await adminLogout();
      router.push('/login');
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  return (
    <div className="w-full sticky top-0 z-50">
      {/* Navy bar */}
      <header className="relative w-full md:w-screen bg-byu-navy text-white py-4 shadow-md">
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

          <div className="flex items-center gap-3 pr-6 text-base">
            {/* TODO: show user name and avatar here once auth is wired up */}
            <button
              type="button"
              onClick={handleSignOut}
              className="hidden sm:inline text-white/90 underline underline-offset-4 decoration-white/50 hover:text-white hover:decoration-white transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-byu-navy active:opacity-80"
            >
              Sign out
            </button>
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
          <div className="flex items-center gap-3 px-6 py-4 border-b">
            {/* TODO: show user name and avatar here once auth is wired up */}
            <button
              className="underline ml-auto"
              onClick={handleSignOut}
            >
              Sign out
            </button>
          </div>
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