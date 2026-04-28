"use client";
import { useEffect, useRef } from "react";
import { useSearch } from "./search/SearchContext";
import { AISearchBar } from "./AISearchBar";
import { SearchResults } from "./SearchResults";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { Sparkles } from "lucide-react";

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

  useEffect(() => {
    if (initialQuery && !didAutoSearch.current) {
      didAutoSearch.current = true;
      search(initialQuery);
    }
  }, [initialQuery, search]);

  const isAr = locale === "ar";

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
      {(status === "loading" || status === "ready" || status === "error") && (
        <SearchResults dict={dict} />
      )}
    </div>
  );
}
