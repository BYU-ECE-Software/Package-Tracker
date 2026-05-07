'use client';

import { useState } from 'react';
import NavBar from './NavBar';
import SignInSignOut from '@/components/dev/SignInSignOut';
import RoleToggle from '@/components/dev/RoleToggle';

const Header: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50 w-full">
      <header className="bg-byu-navy relative w-full py-4 text-white shadow-md md:w-full">
        <div className="flex items-center justify-between px-6">
          <div className="flex items-center">
            <a
              href="https://www.byu.edu"
              target="_blank"
              rel="noopener noreferrer"
              className="border-byu-royal mr-4 border-r pr-4"
            >
              {/* SVG asset — next/image's optimization (resizing, format conversion)
                  doesn't apply, and forcing fixed dimensions fights with the
                  `h-10 w-auto` aspect-preserving sizing used here. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/BYU_monogram_white.svg" alt="BYU logo" className="h-10 w-auto" />
            </a>
            <h1 className="text-2xl">ECE Mailroom</h1>
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

      <NavBar navPadLeft={128} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
    </div>
  );
};

export default Header;
