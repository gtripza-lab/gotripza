import "server-only";
/**
 * Server-side session helpers — read the current Supabase user from
 * cookies. Used by API routes to attach `userId` to AI calls and
 * personalize Raya.
 */
import { createSupabaseServer } from "@/lib/supabase/server";

export type CurrentUser = {
  id: string;
  email: string | null;
};

/** Returns the signed-in user (if any), reading from request cookies. */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  try {
    const sb = createSupabaseServer();
    const {
      data: { user },
    } = await sb.auth.getUser();
    if (!user) return null;
    return { id: user.id, email: user.email ?? null };
  } catch (err) {
    console.warn("[auth] getCurrentUser failed:", (err as Error).message);
    return null;
  }
}

/**
 * Read or generate an anonymous session id from the `gtz_sid` cookie.
 * Used to track conversations for non-signed-in users.
 *
 * NOTE: writing the cookie must happen in middleware or a route handler;
 * this reader is just for the parse route's use.
 */
import { cookies } from "next/headers";
export function getAnonSessionId(): string | null {
  try {
    const c = cookies().get("gtz_sid");
    return c?.value ?? null;
  } catch {
    return null;
  }
}
