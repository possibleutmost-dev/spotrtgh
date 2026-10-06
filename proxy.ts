import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE, adminRoleFromToken } from "@/lib/auth";

/**
 * Keeps unauthenticated visitors away from /admin before the page shell loads.
 * Every admin API route re-checks the cookie independently, so this is a
 * convenience rather than the security boundary.
 *
 * A sub-admin session is valid on exactly one screen — custom matches — so
 * any other console path bounces there rather than to the login form.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/admin/login") return NextResponse.next();

  if (pathname.startsWith("/admin")) {
    const role = adminRoleFromToken(req.cookies.get(ADMIN_COOKIE)?.value);

    if (!role) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.searchParams.set("next", pathname);
      return NextResponse.redirect(url);
    }

    if (role === "sub" && !pathname.startsWith("/admin/custom-matches")) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/custom-matches";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

// Proxy always runs on the Node.js runtime, so the node:crypto token compare
// in lib/auth works here with no runtime declaration.
export const config = {
  matcher: ["/admin/:path*"],
};
