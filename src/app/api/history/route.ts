import { NextRequest, NextResponse } from "next/server";
import { createSupabaseService } from "@/lib/supabase/service";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabase = createSupabaseService();

    const { data, error } = await supabase
      .from("search_history")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("[history GET] Supabase error:", error.message);
      return NextResponse.json({ history: [] });
    }

    return NextResponse.json({ history: data ?? [] });
  } catch (err) {
    console.error("[history GET] Unexpected error:", err);
    return NextResponse.json({ history: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    const { query, destination, locale } = body as {
      query?: string;
      destination?: string;
      locale?: string;
    };

    const supabase = createSupabaseService();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("search_history") as any).insert({
      query: query ?? null,
      destination: destination ?? null,
      locale: locale ?? null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[history POST] Supabase error:", error.message);
      // Best-effort — return ok even on DB error
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[history POST] Unexpected error:", err);
    return NextResponse.json({ ok: true });
  }
}
