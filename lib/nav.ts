// Single source of truth for top-nav links. NavBar maps over this; adding
// or grouping a route is one config edit. Keep entries in display order.
//
// A leaf has `href`. A parent has `children` and no `href` — NavBar renders
// it as a dropdown. `adminOnly` cascades: hiding a parent hides the whole
// subtree; a parent whose children all filter out is hidden automatically.

export type NavItem = {
  href?: string;
  label: string;
  adminOnly?: boolean;
  children?: NavItem[];
};

export const navItems: NavItem[] = [
  { href: '/', label: 'Home' },
  { href: '/Admin', label: 'Admin', adminOnly: true },
];
