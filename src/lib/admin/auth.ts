import "server-only";
import { cookies } from "next/headers";
import { createHmac } from "crypto";

const SESSION_COOKIE = "admin_session";

function deriveSessionToken(adminKey: string): string {
  return createHmac("sha256", adminKey)
    .update("gotripza-admin-session-v1")
    .digest("hex");
}

/**
 * Returns true if the current request has a valid admin session cookie.
 * Always returns false when ADMIN_KEY is not configured.
 */
export function isAdminAuthenticated(): boolean {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) return false;
  const cookie = cookies().get(SESSION_COOKIE);
  if (!cookie?.value) return false;
  return cookie.value === deriveSessionToken(adminKey);
}
