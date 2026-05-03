"use client";
import { ChatProvider } from "./chat/ChatContext";
import { ChatInterface } from "./chat/ChatInterface";
import { buildAviasalesUrl, buildHotelUrl } from "@/lib/partners";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import type { Currency } from "@/lib/utils";
import { MessageSquare, Plane, Hotel, ExternalLink, Shield } from "lucide-react";

export function SearchPageClient({
  initialQuery: _initialQuery,
  dict,
  locale,
  currency,
}: {
  initialQuery: string;
  dict: Dictionary;
  locale: Locale;
  currency?: Currency;
}) {
  const isAr = locale === "ar";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-8">

      {/* ── AI CHAT (Primary experience — conversation first) ────── */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-white/50" />
          <span className="text-sm font-medium text-white/55">
            {isAr
              ? "ريا — مستشارة السفر الذكية"
              : "Raya — your AI travel advisor"}
          </span>
        </div>

        {/* Light card wrapping dark page — premium contrast */}
        <div
          className="overflow-hidden rounded-3xl shadow-2xl shadow-black/20"
          style={{ height: "min(700px, 88vh)" }}
        >
          <ChatProvider locale={locale} initialCurrency={currency}>
            <ChatInterface dict={dict} />
          </ChatProvider>
        </div>
      </section>

      {/* ── DIRECT PARTNER CTAs ───────────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Shield className="h-4 w-4 text-brand-mint/70" />
          <span className="text-sm font-medium text-white/45">
            {isAr
              ? "احجز مباشرة مع أفضل مزودي الخدمة العالميين"
              : "Book directly with the world's top travel providers"}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Flights CTA — Aviasales via TP marker */}
          <a
            href={buildAviasalesUrl({ locale, subid: "search_page_cta" })}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 hover:border-blue-400/30 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-blue-500/5"
          >
            {/* Subtle gradient glow */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 ring-1 ring-blue-400/20 transition-all duration-300 group-hover:bg-blue-500/15 group-hover:ring-blue-400/30">
                <Plane className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-white">
                    {isAr ? "أرخص تذاكر الطيران" : "Cheapest Flights"}
                  </h3>
                  <ExternalLink className="h-3.5 w-3.5 text-white/30 transition-colors group-hover:text-blue-400/60" />
                </div>
                <p className="text-sm text-white/50 leading-relaxed">
                  {isAr
                    ? "قارن أسعار الطيران من مئات الخطوط الجوية في ثوانٍ"
                    : "Compare prices from hundreds of airlines instantly"}
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1.5 text-xs font-medium text-blue-300 ring-1 ring-blue-400/20 transition-all duration-300 group-hover:bg-blue-500/20 group-hover:text-blue-200">
                  <Plane className="h-3 w-3" />
                  {isAr ? "ابحث عن رحلتك" : "Search Flights"}
                </div>
              </div>
            </div>
          </a>

          {/* Hotels CTA — Booking.com via TP promo_id=4338 */}
          <a
            href={buildHotelUrl({ subid: "search_page_cta" })}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-white/[0.03] p-6 backdrop-blur-sm transition-all duration-300 hover:border-brand-mint/30 hover:bg-white/[0.06] hover:shadow-lg hover:shadow-brand-mint/5"
          >
            {/* Subtle gradient glow */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-mint/5 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="relative flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-mint/10 ring-1 ring-brand-mint/20 transition-all duration-300 group-hover:bg-brand-mint/15 group-hover:ring-brand-mint/30">
                <Hotel className="h-6 w-6 text-brand-mint" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-semibold text-white">
                    {isAr ? "أفضل أسعار الفنادق" : "Best Hotel Prices"}
                  </h3>
                  <ExternalLink className="h-3.5 w-3.5 text-white/30 transition-colors group-hover:text-brand-mint/60" />
                </div>
                <p className="text-sm text-white/50 leading-relaxed">
                  {isAr
                    ? "أكثر من مليون فندق وشقة في كل أنحاء العالم"
                    : "Over 1 million hotels & apartments worldwide"}
                </p>
                <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-brand-mint/10 px-3 py-1.5 text-xs font-medium text-brand-mint ring-1 ring-brand-mint/20 transition-all duration-300 group-hover:bg-brand-mint/20 group-hover:text-white">
                  <Hotel className="h-3 w-3" />
                  {isAr ? "ابحث عن فندقك" : "Search Hotels"}
                </div>
              </div>
            </div>
          </a>
        </div>
      </section>
    </div>
  );
}
