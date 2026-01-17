import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Appwrite session cookies typically start with a_session_
  const hasSession = request.cookies.getAll().some(c => c.name.startsWith('a_session'));

  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/analyze');
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');

  // Basic redirection logic
  if (isProtectedRoute && !hasSession) {
    // We allow /analyze to be viewed but some features might require login
    // However, for a strict protocol, we redirect to login
    // return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthRoute && hasSession) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/analyze/:path*',
    '/login',
    '/signup'
  ],
};
