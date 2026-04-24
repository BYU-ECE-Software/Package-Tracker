import { NextRequest, NextResponse } from 'next/server';

// Runs on the server before any page loads — protects routes without a flash of content.
// Next.js automatically picks up this file when named middleware.ts at the project root.
export function middleware(request: NextRequest) {
  const role = request.cookies.get('appRole')?.value;
  const isAdmin = role === 'admin';

  // Add admin-only routes here — keep in sync with the matcher below
  const adminRoutes = ['/Admin'];

  const isAdminRoute = adminRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isAdminRoute && !isAdmin) {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/Admin/:path*'],
};