import { NextResponse, type NextRequest } from "next/server";

// Fast first check only: sends visitors with no session cookie to /login.
// The real check (valid signature and role) happens in requireRole() on each page.
// The cookie name must match SESSION_COOKIE in src/server/session.ts.
export function middleware(req: NextRequest) {
  if (!req.cookies.has("sm_session")) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*"],
};
