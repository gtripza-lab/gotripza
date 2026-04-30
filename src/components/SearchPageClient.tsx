"use client";
import { useEffect, useRef } from "react";
import { useSearch } from "./search/SearchContext";
import { AISearchBar } from "./AISearchBar";
import { SearchResults } from "./SearchResults";
import { TravelpayoutsSearch } from "./TravelpayoutsSearch";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { Sparkles, LayoutGrid } from "lucide-react";

export function SearchPageClient({
  initialQuery,
  dict,
  locale,
  currency,
}: {
  initialQuery: string;
  dict: Dictionary;
  locale: Locale;
  currency?: string;
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
    <div className="mx-auto max-w-7xl px-4 sm:px-6">

      {/* ── AI Search Bar ─────────────────────────────────────── */}
      <section className="mb-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-mint" />
          <span className="text-sm font-medium text-white/70">
            {isAr
              ? "البحث الذكي — صف رحلتك بكلماتك"
              : "AI Search — describe your trip naturally"}
          </span>
        </div>
        <AISearchBar dict={dict} theme="dark" />
      </section>

      {/* ── AI Results ──────────────────────────────────────────── */}
      {hasResults && (
        <SearchResults dict={dict} />
      )}

      {/* ── Travelpayouts Live Widgets ───────────────────────────
           Always visible so users can search directly even if they
           haven't typed in the AI bar yet, or want to compare live. */}
      <section className="mt-10">
        <div className="mb-5 flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-brand-primary/70" />
          <span className="text-sm font-medium text-white/50">
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
