'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FiChevronDown } from 'react-icons/fi';
import SignInSignOut from '@/components/dev/SignInSignOut';
import { useRole } from '@/components/dev/TestingRoleProvider';
import { navItems, type NavItem } from '@/lib/nav';

type NavBarProps = {
  navPadLeft?: number;
  mobileOpen: boolean;
  setMobileOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

// Filter the tree by role. A parent whose children all hide is itself
// hidden, so we never render an empty dropdown.
function filterForRole(items: NavItem[], isAdmin: boolean): NavItem[] {
  const out: NavItem[] = [];
  for (const item of items) {
    if (item.adminOnly && !isAdmin) continue;
    if (item.children) {
      const kids = filterForRole(item.children, isAdmin);
      if (kids.length === 0) continue;
      out.push({ ...item, children: kids });
    } else {
      out.push(item);
    }
  }
  return out;
}

const NavBar = ({ navPadLeft = 128, mobileOpen, setMobileOpen }: NavBarProps) => {
  const desktopNavRef = useRef<HTMLDivElement | null>(null);
  const dropdownRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const [navSize, setNavSize] = useState<'base' | 'sm' | 'xs'>('base');

  // Single string identifies which dropdown is open (by label). Only one
  // dropdown can be open at a time, which simplifies state and matches
  // typical menu-bar UX.
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  const { role } = useRole();
  const isAdmin = role === 'admin';

  const visibleItems = filterForRole(navItems, isAdmin);

  // Shrink desktop nav text if the row gets too wide.
  useLayoutEffect(() => {
    const el = desktopNavRef.current;
    if (!el) return;

    const fits = () => el.scrollWidth <= el.clientWidth;

    const update = () => {
      setNavSize('base');

      requestAnimationFrame(() => {
        if (fits()) return;
        setNavSize('sm');

        requestAnimationFrame(() => {
          if (fits()) return;
          setNavSize('xs');
        });
      });
    };

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [navPadLeft, openMenu]);

  // Close dropdowns on outside click or Escape.
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const insideAny = Array.from(dropdownRefs.current.values()).some(
        (el) => el?.contains(target) ?? false,
      );
      if (!insideAny) setOpenMenu(null);
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenMenu(null);
        setMobileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [setMobileOpen]);

  const setRef = (key: string) => (el: HTMLDivElement | null) => {
    dropdownRefs.current.set(key, el);
  };

  const closeAll = () => {
    setOpenMenu(null);
    setMobileOpen(false);
  };

  return (
    <>
      {/* ------ Mobile nav bar ------ */}
      {mobileOpen && (
        <div id="mobile-menu" className="text-byu-navy w-full border-t bg-white shadow md:hidden">
          <nav className="flex flex-col py-2 text-base font-medium">
            {visibleItems.map((item) =>
              item.children ? (
                <div key={item.label} ref={setRef(`mobile-${item.label}`)}>
                  <button
                    type="button"
                    onClick={() =>
                      setOpenMenu((cur) => (cur === item.label ? null : item.label))
                    }
                    className={`flex w-full items-center justify-between px-6 py-4 text-left hover:bg-[#FAFAFA] ${
                      openMenu === item.label ? 'bg-[#FAFAFA]' : ''
                    }`}
                  >
                    <span>{item.label}</span>
                    <FiChevronDown className="text-byu-navy h-4 w-4" aria-hidden="true" />
                  </button>

                  {openMenu === item.label && (
                    <div className="flex flex-col text-sm">
                      {item.children.map((child) => (
                        <Link
                          key={child.href ?? child.label}
                          href={child.href ?? '#'}
                          onClick={closeAll}
                          className="text-byu-navy px-10 py-2 text-left hover:bg-[#FAFAFA]"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.href ?? item.label}
                  href={item.href ?? '#'}
                  onClick={() => setMobileOpen(false)}
                  className="px-6 py-4 text-left hover:bg-[#FAFAFA]"
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="border-t border-gray-200">
            <SignInSignOut variant="mobile" onAction={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* ------ Desktop nav bar ------ */}
      <nav className="text-byu-navy hidden w-full bg-white shadow md:block">
        <div
          ref={desktopNavRef}
          className={`flex px-6 font-medium ${
            navSize === 'base' ? 'text-base' : navSize === 'sm' ? 'text-sm' : 'text-xs'
          }`}
          style={{ paddingLeft: navPadLeft }}
        >
          {visibleItems.map((item) =>
            item.children ? (
              <div key={item.label} className="relative" ref={setRef(`desktop-${item.label}`)}>
                <button
                  type="button"
                  onClick={() =>
                    setOpenMenu((cur) => (cur === item.label ? null : item.label))
                  }
                  className={`nav-link-hover inline-flex items-center gap-2 px-8 py-4 whitespace-nowrap hover:bg-[#FAFAFA] ${
                    openMenu === item.label ? 'nav-link-active bg-[#FAFAFA]' : ''
                  }`}
                >
                  <span>{item.label}</span>
                  <FiChevronDown className="text-byu-navy h-3 w-3" aria-hidden="true" />
                </button>

                {openMenu === item.label && (
                  <div className="absolute top-full left-0 w-64 border border-gray-200 bg-white shadow-lg">
                    {item.children.map((child) => (
                      <Link
                        key={child.href ?? child.label}
                        href={child.href ?? '#'}
                        onClick={() => setOpenMenu(null)}
                        className="text-byu-navy block w-full px-6 py-3 text-left hover:bg-gray-50"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.href ?? item.label}
                href={item.href ?? '#'}
                className="nav-link-hover px-8 py-4 whitespace-nowrap hover:bg-[#FAFAFA]"
              >
                {item.label}
              </Link>
            ),
          )}
        </div>
      </nav>
    </>
  );
};

export default NavBar;
