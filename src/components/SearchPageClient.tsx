"use client";
import { useEffect, useRef } from "react";
import { useSearch } from "./search/SearchContext";
import { AISearchBar } from "./AISearchBar";
import { SearchResults } from "./SearchResults";
import { TravelpayoutsSearch } from "./TravelpayoutsSearch";
import { ChatProvider } from "./chat/ChatContext";
import { ChatInterface } from "./chat/ChatInterface";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import type { Currency } from "@/lib/utils";
import { Sparkles, LayoutGrid, MessageSquare } from "lucide-react";

export function SearchPageClient({
  initialQuery,
  dict,
  locale,
  currency,
}: {
  initialQuery: string;
  dict: Dictionary;
  locale: Locale;
  currency?: Currency;
}) {
  const { search, status } = useSearch();
  const didAutoSearch = useRef(false);

  useEffect(() => {
    if (initialQuery && !didAutoSearch.current) {
      didAutoSearch.current = true;
      search(initialQuery);
    }
  }, [initialQuery, search]);

  const isAr = locale === "ar";
  const hasResults = status === "loading" || status === "ready" || status === "error";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 space-y-8">

      {/* ── AI CHAT INTERFACE (Primary UX) ──────────────────────── */}
      <section>
        <div className="mb-3 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-brand-primary" />
          <span className="text-sm font-medium text-white/70">
            {isAr
              ? "المساعد الذكي — تحدّث مع مستشار السفر"
              : "AI Advisor — chat with your travel consultant"}
          </span>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/[0.09] bg-white/[0.025] backdrop-blur-md" style={{ height: "min(680px, 85vh)" }}>
          <ChatProvider locale={locale} initialCurrency={currency}>
            <ChatInterface dict={dict} />
          </ChatProvider>
        </div>
      </section>

      {/* ── CLASSIC AI SEARCH BAR (for power users / direct queries) */}
      <section className="rounded-3xl border border-white/[0.07] bg-white/[0.02] p-5 backdrop-blur-md">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-mint" />
          <span className="text-sm font-medium text-white/55">
            {isAr
              ? "بحث سريع — صف رحلتك مرة واحدة"
              : "Quick search — describe your trip in one go"}
          </span>
        </div>
        <AISearchBar dict={dict} theme="dark" />
      </section>

      {/* ── AI RESULTS (from classic search bar) ──────────────────── */}
      {hasResults && (
        <SearchResults dict={dict} />
      )}

      {/* ── LIVE TRAVELPAYOUTS WIDGETS ────────────────────────────── */}
      <section>
        <div className="mb-4 flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-brand-primary/70" />
          <span className="text-sm font-medium text-white/45">
            {isAr
              ? "بحث مباشر — طيران وفنادق في الوقت الحقيقي"
              : "Live search — flights & hotels in real time"}
          </span>
        </div>
        <TravelpayoutsSearch locale={locale} currency={currency} />
      </section>
    </div>
  );
}
