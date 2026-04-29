import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseService } from "@/lib/supabase/service";

export const runtime = "nodejs";

function computeSignature(body: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(body).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();

    const signature = request.headers.get("x-tp-signature") ?? "";
    const secret = process.env.TP_WEBHOOK_SECRET ?? "changeme";
    const expected = computeSignature(rawBody, secret);

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature, "utf8"),
        Buffer.from(expected, "utf8")
      )
    ) {
      return NextResponse.json(
        { ok: false, error: "Invalid signature" },
        { status: 401 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const { marker, sub_marker, amount, currency, product_type, click_id, gate_name } = body as {
      marker?: string;
      sub_marker?: string;
      amount?: number | string;
      currency?: string;
      product_type?: string;
      click_id?: string;
      gate_name?: string;
    };

    if (amount === undefined || amount === null || !currency || !gate_name) {
      return NextResponse.json(
        { ok: false, error: "Missing required fields: amount, currency, gate_name" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseService();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase.from("booking_clicks") as any).upsert({
      event_type: "conversion",
      provider: gate_name,
      revenue: Number(amount),
      currency,
      marker: marker ?? null,
      sub_marker: sub_marker ?? null,
      product_type: product_type ?? null,
      click_id: click_id ?? null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.error("[travelpayouts webhook] Supabase error:", error.message);
      return NextResponse.json(
        { ok: false, error: "Database error" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[travelpayouts webhook] Unexpected error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
