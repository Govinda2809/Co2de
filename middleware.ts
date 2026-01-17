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

  // 1. Force Auth: Redirect to login if accessing protected route without session
  if (isProtectedRoute && !hasAppwriteSession) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // 2. Prevent Double Login: Redirect to dashboard if logged in and trying to access login/signup
  if (hasAppwriteSession && isAuthRoute) {
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
