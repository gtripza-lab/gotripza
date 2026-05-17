/**
 * /auth/callback — Magic-link / OAuth code exchange handler.
 *
 * Flow:
 *   1. User clicks magic link → Supabase redirects here with ?code=...
 *   2. We exchange the code for a session (sets cookie via SSR client).
 *   3. Ensure profile row exists + ensure launch_free subscription is active.
 *   4. Redirect to next page (defaults to /).
 */
import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServer } from "@/lib/supabase/server";
import {
  upsertProfile,
  ensureLaunchFreeSubscription,
} from "@/lib/ai/memory/store";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams, origin } = new URL(req.url);
  const code = searchParams.get("code");
  const rawNext = searchParams.get("next") || "/";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/?auth_error=missing_code`);
  }

  const sb = await createSupabaseServer();
  const { data, error } = await sb.auth.exchangeCodeForSession(code);

  if (error || !data.session?.user) {
    console.warn("[auth/callback] exchange failed:", error?.message);
    return NextResponse.redirect(
      `${origin}/?auth_error=${encodeURIComponent(error?.message ?? "unknown")}`,
    );
  }

  const user = data.session.user;

  // Detect new signup: created_at within the last 30 seconds
  const createdAt = user.created_at ? new Date(user.created_at).getTime() : 0;
  const isNewUser = Date.now() - createdAt < 30_000;

  // Provision profile + entitlement on first login. Both are idempotent.
  await Promise.all([
    upsertProfile(user.id, {
      email: user.email ?? null,
      display_name:
        (user.user_metadata?.name as string | undefined) ??
        user.email?.split("@")[0] ??
        null,
    }),
    ensureLaunchFreeSubscription(user.id),
  ]).catch((e) => console.warn("[auth/callback] provision warn:", e));

  // For new signups, pass a flag so the client can fire the Ads conversion event
  const redirectUrl = new URL(next, origin);
  if (isNewUser) {
    redirectUrl.searchParams.set("_signup", "1");
  }

  return NextResponse.redirect(redirectUrl);
}
