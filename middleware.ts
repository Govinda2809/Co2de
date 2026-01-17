import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Try to find any Appwrite session cookie
  // Appwrite cookies usually look like: a_session_[PROJECT_ID] or a_session_[NAME]
  const allCookies = request.cookies.getAll();
  const hasAppwriteSession = allCookies.some(cookie =>
    cookie.name.startsWith('a_session_') || cookie.name === 'a_session'
  );

  const { pathname } = request.nextUrl;

  // Middleware disabled for now to rely on client-side auth state
  // This prevents issues where the cookie isn't visible to Next.js but the client SDK works
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/analyze/:path*', '/login', '/signup'],
};
