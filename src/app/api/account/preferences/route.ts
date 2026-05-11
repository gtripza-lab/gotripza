import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/session";
import { getPreferences } from "@/lib/ai/memory/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "auth_required" }, { status: 401 });

  const preferences = await getPreferences(user.id);
  return NextResponse.json({ preferences });
}
