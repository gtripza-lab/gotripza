"use client";
import { useEffect, useRef } from "react";
import { useSearch } from "./search/SearchContext";
import { AISearchBar } from "./AISearchBar";
import { SearchResults } from "./SearchResults";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const MARKER = "522867";

export function SearchPageClient({
  initialQuery,
  dict,
  locale,
}: {
  initialQuery: string;
  dict: Dictionary;
  locale: Locale;
}) {
  const { search, status } = useSearch();
  const didAutoSearch = useRef(false);

  // Auto-trigger search when arriving from homepage with ?q=
  useEffect(() => {
    if (initialQuery && !didAutoSearch.current) {
      didAutoSearch.current = true;
      search(initialQuery);
    }
  }, [initialQuery, search]);

  const isAr = locale === "ar";
  const lang = isAr ? "ar" : "en";
  const currency = isAr ? "SAR" : "USD";

  // Affiliate-tagged Travelpayouts widget URLs
  const flightsWidgetUrl = `https://www.aviasales.com/?marker=${MARKER}&locale=${lang}&currency=${currency}`;
  const hotelsWidgetUrl  = `https://hotellook.com/?marker=${MARKER}&locale=${lang}&currency=${currency}`;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">

      {/* ── AI Search Bar ───────────────────────────────────────── */}
      <section className="mb-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-mint" />
          <span className="text-sm font-medium text-white/70">
            {isAr ? "البحث الذكي — صف رحلتك بكلماتك" : "AI Search — describe your trip naturally"}
          </span>
        </div>
        <AISearchBar dict={dict} theme="dark" />
      </section>

      {/* ── AI Results ──────────────────────────────────────────── */}
      {(status === "loading" || status === "ready" || status === "error") && (
        <SearchResults dict={dict} />
      )}

      {/* ── Travelpayouts Live Search Widget ────────────────────── */}
      <section className="mt-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm font-semibold text-white/80">
              {isAr ? "🔴 بحث مباشر — أسعار لحظية من مئات الشركات" : "🔴 Live Search — real-time prices from 100s of providers"}
            </span>
            <span className="rounded-full bg-brand-primary/20 px-2 py-0.5 text-[10px] font-bold text-brand-primary">
              LIVE
            </span>
          </div>

          {/* Flights widget */}
          <div className="mb-6 overflow-hidden rounded-3xl border border-white/10">
            <div className="border-b border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white/70">
              ✈️ {isAr ? "رحلات الطيران — أسعار مباشرة" : "Flights — live prices"}
            </div>
            <iframe
              src={flightsWidgetUrl}
              title={isAr ? "بحث رحلات الطيران" : "Flight Search"}
              className="h-[520px] w-full border-0"
              allow="payment"
              loading="lazy"
            />
          </div>

          {/* Hotels widget */}
          <div className="overflow-hidden rounded-3xl border border-white/10">
            <div className="border-b border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-medium text-white/70">
              🏨 {isAr ? "الفنادق — أسعار مباشرة" : "Hotels — live prices"}
            </div>
            <iframe
              src={hotelsWidgetUrl}
              title={isAr ? "بحث الفنادق" : "Hotel Search"}
              className="h-[520px] w-full border-0"
              allow="payment"
              loading="lazy"
            />
          </div>

          {/* Affiliate disclosure */}
          <p className="mt-4 text-center text-xs text-white/30">
            {isAr
              ? `GoTripza يحصل على عمولة من كل حجز (marker: ${MARKER}) — بدون تكلفة إضافية عليك`
              : `GoTripza earns a commission on bookings (marker: ${MARKER}) — at no extra cost to you`}
          </p>
        </motion.div>
      </section>
    </div>
  );
}
