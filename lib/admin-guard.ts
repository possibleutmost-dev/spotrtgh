import { cookies } from "next/headers";
import { ADMIN_COOKIE, adminRoleFromToken, type AdminRole } from "./auth";

/**
 * The admin cookie check for route handlers.
 *
 * This lives apart from lib/auth so that module stays free of next/headers and
 * can be imported by middleware, which runs before a request context exists.
 */

/** The signed-in console role, or null for no valid session. */
export async function adminRole(): Promise<AdminRole | null> {
  const jar = await cookies();
  return adminRoleFromToken(jar.get(ADMIN_COOKIE)?.value);
}

/** Full operator only. Every admin route uses this unless it says otherwise. */
export async function requireAdmin(): Promise<boolean> {
  return (await adminRole()) === "admin";
}

/**
 * Custom matches are the one concern a sub-admin may operate, so only the
 * custom-matches routes (and the crest upload they rely on) accept this.
 */
export async function requireCustomMatchAdmin(): Promise<boolean> {
  return (await adminRole()) !== null;
}
