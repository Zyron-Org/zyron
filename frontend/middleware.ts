import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Protected route prefixes — any URL starting with one of these
 * requires authentication. Unauthenticated requests are redirected
 * to /auth/login with the original URL as a `redirect` query param.
 */
const PROTECTED_PREFIXES = ["/portal", "/auditor", "/admin"];

/**
 * Routes within protected prefixes that are publicly accessible
 * (e.g. auth callback pages). None currently.
 */
const PUBLIC_EXCEPTIONS: string[] = [];

/**
 * The cookie/localStorage key where the JWT is stored.
 * We can only read cookies in middleware — localStorage is not available.
 * The auth-context stores the token under this cookie name when it calls
 * document.cookie after login (added in this PR).
 */
const JWT_COOKIE = "zyron_jwt_token";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if this route requires auth
  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    pathname.startsWith(prefix)
  );

  if (!isProtected) return NextResponse.next();

  // Allow any explicit public exceptions within protected areas
  if (PUBLIC_EXCEPTIONS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Read JWT from cookie (set by auth-context on login/loginAs)
  const token = request.cookies.get(JWT_COOKIE)?.value;

  if (!token) {
    // Redirect to login, encoding the original path so we can return after auth
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes EXCEPT Next.js internals and static files
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
