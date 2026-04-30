"use client";
import { useState } from "react";
import { Plane, BedDouble, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";

// Always read from env — fallback ensures marker is never lost even if env is missing
const MARKER = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER ?? "522867";

type Tab = "flights" | "hotels";

/**
 * Travelpayouts white-label search widget.
 * Tab 1 → Aviasales (flights) white-label with marker
 * Tab 2 → Hotellook (hotels) white-label with marker
 *
 * Affiliate marker is always injected so every booking is tracked.
 * currency is geo-detected by the server and passed down as a prop.
 */
export function TravelpayoutsSearch({
  locale,
  currency: propCurrency,
}: {
  locale: Locale;
  currency?: string;
}) {
  const [tab, setTab]       = useState<Tab>("flights");
  const [loading, setLoading] = useState(true);
  const isAr = locale === "ar";
  const lang = isAr ? "ar" : "en";
  // Use geo-detected currency from parent; fall back to USD (universally safe)
  const currency = propCurrency ?? "USD";

  // Travelpayouts white-label search embed URLs.
  // These are the official partner iframes — they include the affiliate marker
  // so every booking that originates from these iframes is attributed to us.
  const flightsUrl = `https://www.aviasales.com/?marker=${MARKER}&locale=${lang}&currency=${currency}&host=gotripza.com`;
  const hotelsUrl  = `https://hotellook.com/?marker=${MARKER}&locale=${lang}&currency=${currency}&host=gotripza.com`;

  const activeUrl = tab === "flights" ? flightsUrl : hotelsUrl;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden">
      {/* Tab switcher */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => { setTab("flights"); setLoading(true); }}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 py-4 text-sm font-medium transition",
            tab === "flights"
              ? "border-b-2 border-brand-primary bg-brand-primary/10 text-white"
              : "text-white/50 hover:text-white/80",
          )}
        >
          <Plane className="h-4 w-4" />
          {isAr ? "رحلات الطيران" : "Flights"}
        </button>
        <button
          onClick={() => { setTab("hotels"); setLoading(true); }}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 py-4 text-sm font-medium transition",
            tab === "hotels"
              ? "border-b-2 border-brand-mint bg-brand-mint/10 text-white"
              : "text-white/50 hover:text-white/80",
          )}
        >
          <BedDouble className="h-4 w-4" />
          {isAr ? "الفنادق" : "Hotels"}
        </button>
      </div>

      {/* iframe white-label */}
      <div className="relative min-h-[520px] w-full">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-ink-950/60">
            <div className="flex flex-col items-center gap-3 text-white/40">
              <Loader2 className="h-7 w-7 animate-spin" />
              <span className="text-xs">
                {isAr ? "جارٍ تحميل نتائج البحث..." : "Loading search results..."}
              </span>
            </div>
          </div>
        )}
        <iframe
          key={activeUrl}
          src={activeUrl}
          title={tab === "flights" ? "Flight Search" : "Hotel Search"}
          className="h-[520px] w-full border-0"
          allow="payment"
          loading="lazy"
          onLoad={() => setLoading(false)}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-top-navigation"
        />
      </div>

      {/* Affiliate disclosure */}
      <div className="border-t border-white/5 px-6 py-3 text-center text-xs text-white/30">
        {isAr
          ? "GoTripza يحصل على عمولة من كل حجز — بدون تكلفة إضافية عليك"
          : "GoTripza earns a commission on bookings — at no extra cost to you"}
      </div>
    </div>
  );
}
