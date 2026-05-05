import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

// 4-hour session duration
const SESSION_MAX_AGE = 60 * 60 * 4;

export async function POST(req: NextRequest) {
  let key = "";
  try {
    const body = await req.json() as { key?: string };
    key = body.key?.trim() ?? "";
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const adminKey = process.env.ADMIN_KEY;

  // Refuse all access if ADMIN_KEY env var is not configured
  if (!adminKey) {
    console.error("[admin] ADMIN_KEY env var is not set — denying all access");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  if (!key || key !== adminKey) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Valid key — set httpOnly session cookie
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", adminKey, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  // Logout — clear the cookie
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  });
  return res;
}
