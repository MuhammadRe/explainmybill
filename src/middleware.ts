// ─────────────────────────────────────────────────────
// Next.js Middleware — Route Protection
// ─────────────────────────────────────────────────────
// Runs on every matched request before the page renders.
// Redirects unauthenticated users away from protected routes.

import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // If user is authenticated, allow the request through
    return NextResponse.next();
  },
  {
    callbacks: {
      // Return true if the request should be allowed to proceed
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Always allow access to auth pages (even without token)
        if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
          return true;
        }

        // Dashboard routes require authentication
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/upload') || pathname.startsWith('/documents') || pathname.startsWith('/settings')) {
          return !!token;
        }

        // API routes that need auth are protected separately in the route handlers
        // Public routes (landing page, etc.) are always accessible
        return true;
      },
    },
  }
);

export const config = {
  // Match all routes except static files and Next.js internals
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
