"use client";
import { useState } from "react";
import { Plane, BedDouble } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Locale } from "@/i18n/config";

const MARKER = "522867";

type Tab = "flights" | "hotels";

/**
 * Travelpayouts white-label search widget.
 * Tab 1 → Aviasales (flights) white-label with marker
 * Tab 2 → Hotellook (hotels) white-label with marker
 *
 * Uses iframe embed — works without API keys.
 * Affiliate marker is always injected so every booking is tracked.
 */
export function TravelpayoutsSearch({ locale }: { locale: Locale }) {
  const [tab, setTab] = useState<Tab>("flights");
  const isAr = locale === "ar";
  const lang = isAr ? "ar" : "en";
  const currency = isAr ? "SAR" : "USD";

  // Travelpayouts official white-label URLs with marker
  const flightsUrl = `https://www.aviasales.com/?marker=${MARKER}&locale=${lang}&currency=${currency}`;
  const hotelsUrl  = `https://hotellook.com/?marker=${MARKER}&locale=${lang}&currency=${currency}`;

  const activeUrl = tab === "flights" ? flightsUrl : hotelsUrl;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] overflow-hidden">
      {/* Tab switcher */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setTab("flights")}
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
          onClick={() => setTab("hotels")}
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
      <div className="relative aspect-[16/10] w-full">
        <iframe
          key={activeUrl}
          src={activeUrl}
          title={tab === "flights" ? "Flight Search" : "Hotel Search"}
          className="absolute inset-0 h-full w-full border-0"
          allow="payment"
          loading="lazy"
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
