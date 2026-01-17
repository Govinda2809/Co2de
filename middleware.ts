import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const allCookies = request.cookies.getAll();
  
  // Appwrite session cookies are usually named a_session_[PROJECT_ID]
  const hasSession = allCookies.some(cookie => 
    cookie.name.startsWith('a_session_') || cookie.name === 'a_session'
  );
  
  const { pathname } = request.nextUrl;

  // 1. PROTECTED ROUTES (Analyze, Dashboard)
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/analyze');
  
  if (isProtectedRoute && !hasSession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. AUTH ROUTES (Login, Signup) - Redirect to dashboard if session exists
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');

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
