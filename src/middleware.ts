import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware — lightweight, runs at Edge.
 *
 * For this MVP phase, we allow all routes through and handle
 * auth/role checks inside page components and API handlers.
 *
 * When the real database is connected, this will be upgraded
 * to use NextAuth's auth() wrapper for session-based routing.
 */
export function middleware(request: NextRequest) {
  // Allow all routes through for now
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|assets|locales).*)',
  ],
};
