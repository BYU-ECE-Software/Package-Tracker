import type { NextRequest} from 'next/server';
import { NextResponse } from 'next/server';

// Proxy runs on the server before any page loads — this is how we protect routes without a flash of content.
// Next.js automatically picks up this file as long as it is named middleware.ts and sits at the project root.
export function proxy(request: NextRequest) {
  // Read the role cookie that gets set by the TestingRoleProvider (or your real auth system in production)
  // In real dev: swap this out for however your app stores the user's role or session token
  const role = request.cookies.get('appRole')?.value;
  const isAdmin = role === 'admin';

  // Add any admin-only routes here. Any path that starts with one of these will be protected.
  const adminRoutes = ['/adminOnly'];

  const isAdminRoute = adminRoutes.some((route) => request.nextUrl.pathname.startsWith(route));

  // If the user is trying to access an admin route without the right role, send them to the 403 page
  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  // Otherwise let the request through normally
  return NextResponse.next();
}

// The matcher tells Next.js which routes to run this proxy on.
// It should stay in sync with adminRoutes above — if you add a route there, add it here too.
// ':path*' means it matches the route and all sub-routes beneath it.
export const config = {
  matcher: ['/adminOnly/:path*'],
};
