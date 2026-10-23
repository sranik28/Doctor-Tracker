import { type NextRequest, NextResponse } from 'next/server';

import { getSafeRedirectPath } from '@/lib/safe-redirect';

const SESSION_COOKIES = ['accessToken', 'refreshToken'] as const;
const PROTECTED_PREFIXES = ['/dashboard', '/doctors', '/patients'] as const;
const LOGIN_PATH = '/login';

const isProtectedPath = (pathname: string): boolean =>
  PROTECTED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

/**
 * Optimistic, cookie-presence-only redirects. This is the fast path; the real
 * check is the (dashboard) layout, which validates the session against the API.
 */
export function proxy(request: NextRequest) {
  const { pathname, search, searchParams } = request.nextUrl;
  const hasSession = SESSION_COOKIES.some((name) => request.cookies.has(name));

  if (isProtectedPath(pathname) && !hasSession) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === LOGIN_PATH && hasSession) {
    const target = getSafeRedirectPath(searchParams.get('next'));
    return NextResponse.redirect(new URL(target, request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Everything except API calls, Next internals and files with an extension.
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
