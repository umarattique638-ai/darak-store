import { NextResponse, type NextRequest } from "next/server";

/**
 * Route guard (Next 16 "proxy", formerly middleware) for signed-in areas.
 * No access cookie → hand off to the API's refresh endpoint, which rotates the
 * session and redirects back, or sends the visitor to /login. Layouts then ask the
 * API to fully verify the token (signature, blacklist, active session, role).
 */
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (req.cookies.has("darak_at")) return NextResponse.next();
  return NextResponse.redirect(new URL(`/api/auth/refresh?next=${encodeURIComponent(pathname + search)}`, req.url));
}

export const config = { matcher: ["/account/:path*", "/checkout/:path*", "/dashboard/:path*"] };
