import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Middleware disabled for now to rely on client-side auth state
  // This prevents issues where the cookie isn't visible to Next.js but the client SDK works
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/analyze/:path*', '/login', '/signup'],
};
