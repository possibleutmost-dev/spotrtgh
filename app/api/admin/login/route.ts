import { NextResponse } from "next/server";
import {
  checkAdminPassword,
  checkSubAdminPassword,
  adminToken,
  subAdminToken,
  adminEnabled,
  ADMIN_COOKIE,
  ADMIN_ROLE_COOKIE,
  adminCookieOptions,
  type AdminRole,
} from "@/lib/auth";

export async function POST(req: Request) {
  if (!adminEnabled()) {
    return NextResponse.json({ error: "The admin console is disabled" }, { status: 503 });
  }

  let body: { password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  // The operator's password wins ties by being checked first, though lib/auth
  // refuses a sub password equal to the operator's anyway.
  const password = body.password ?? "";
  let role: AdminRole | null = null;
  if (checkAdminPassword(password)) role = "admin";
  else if (checkSubAdminPassword(password)) role = "sub";

  if (!role) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true, role });
  res.cookies.set(ADMIN_COOKIE, role === "admin" ? adminToken() : subAdminToken(), adminCookieOptions());
  // Role hint for the nav. Readable client-side on purpose; the server never
  // trusts it — every check derives the role from the session token.
  res.cookies.set(ADMIN_ROLE_COOKIE, role, { ...adminCookieOptions(), httpOnly: false });
  return res;
}
