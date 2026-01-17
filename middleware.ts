import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const allCookies = request.cookies.getAll();
<<<<<<< HEAD
  
  // Appwrite session cookies are usually named a_session_[PROJECT_ID]
  const hasSession = allCookies.some(cookie => 
=======
  const hasAppwriteSession = allCookies.some(cookie =>
>>>>>>> 499689fa5298b70d7ac393ad928573c9e46d40bf
    cookie.name.startsWith('a_session_') || cookie.name === 'a_session'
  );

  const { pathname } = request.nextUrl;

<<<<<<< HEAD
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

=======
  // Middleware disabled for now to rely on client-side auth state
  // This prevents issues where the cookie isn't visible to Next.js but the client SDK works
>>>>>>> 499689fa5298b70d7ac393ad928573c9e46d40bf
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
