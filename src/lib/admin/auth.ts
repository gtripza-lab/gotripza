import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

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
export async function isAdminAuthenticated(): Promise<boolean> {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) return false;
  const cookie = (await cookies()).get(SESSION_COOKIE);
  if (!cookie?.value) return false;
  const expected = deriveSessionToken(adminKey);
  try {
    const provided = Buffer.from(cookie.value);
    const target = Buffer.from(expected);
    if (provided.length !== target.length) return false;
    return timingSafeEqual(provided, target);
  } catch {
    return false;
  }
}
