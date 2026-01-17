import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const allCookies = request.cookies.getAll();

  // Appwrite session cookies start with a_session_
  const hasAppwriteSession = allCookies.some(cookie =>
    cookie.name.startsWith('a_session_') || cookie.name === 'a_session'
  );

  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/analyze');
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');

  // Middleware disabled to rely on client-side auth state
  // This prevents infinite redirect loops on localhost where cookies may not sync to server
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
