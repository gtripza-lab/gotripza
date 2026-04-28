"use server";
import { createSupabaseService } from "./supabase/service";

export type TrackClickInput = {
  resultType: "flight" | "hotel";
  provider: string;
  origin?: string | null;
  destination: string;
  price?: number | null;
  currency?: string;
  affiliateUrl: string;
  locale?: string;
  sessionId?: string;
};

export type TrackClickResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

/**
 * Server action — logs a booking-click intent to Supabase.
 * Always resolves (never throws) so it never blocks the user redirect.
 */
export async function trackClick(input: TrackClickInput): Promise<TrackClickResult> {
  try {
    const sb = createSupabaseService();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (sb as any)
      .from("booking_clicks")
      .insert({
        session_id:   input.sessionId ?? null,
        locale:       input.locale ?? null,
        result_type:  input.resultType,
        provider:     input.provider,
        origin:       input.origin ?? null,
        destination:  input.destination,
        price:        input.price ?? null,
        currency:     input.currency ?? "USD",
        affiliate_url: input.affiliateUrl,
      })
      .select("id")
      .single();

    if (error) return { ok: false, error: (error as { message: string }).message };
    return { ok: true, id: (data as { id: string }).id };
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
}
