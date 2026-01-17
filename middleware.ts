import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get session cookie from Appwrite (it usually starts with 'a_session_')
  const sessionToken = request.cookies.getAll().find(c => c.name.startsWith('a_session_'));
  
  const { pathname } = request.nextUrl;

  // Define protected routes
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/analyze');
  
  // Define auth routes (only for guests)
  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/signup');

  // 1. If trying to access protected route without session -> redirect to login
  if (isProtectedRoute && !sessionToken) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(url);
  }

  // 2. If trying to access auth routes while logged in -> redirect to dashboard
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/analyze/:path*', '/login', '/signup'],
};
