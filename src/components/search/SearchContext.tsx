"use client";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { TripIntent, BudgetVerdict, ConfidenceScore, DestinationIntel } from "@/lib/gemini";
import type { FlightOffer, HotelOffer } from "@/lib/travelpayouts";
import type { Locale } from "@/i18n/config";
import { currencyForLocale, type Currency } from "@/lib/utils";
import { logEvent } from "@/lib/events";

type Status = "idle" | "loading" | "ready" | "error";
type Side = "flights" | "hotels";

type SearchData = {
  intent: TripIntent;
  flights: FlightOffer[];
  hotels: HotelOffer[];
  mock: boolean;
  locale: "ar" | "en";
  message: string;
  tips: string | null;
  wants: Side[];
  followup: string | null;
  currency: Currency;
  flightSearchUrl: string;
  hotelSearchUrl: string;
  // Intelligence fields
  budget_verdict: BudgetVerdict | null;
  confidence: ConfidenceScore | null;
  destination_intel: DestinationIntel | null;
  clarification_needed: boolean;
  clarification_question: string | null;
};

type SearchContextValue = {
  query: string;
  setQuery: (q: string) => void;
  status: Status;
  data: SearchData | null;
  error: string | null;
  uiLocale: Locale;
  search: (q: string) => Promise<void>;
  reveal: (side: Side) => void;
  dismissFollowup: () => void;
};

const SearchContext = createContext<SearchContextValue | null>(null);

function friendlyError(raw: string, locale: string): string {
  const r = raw.toLowerCase();
  if (r.includes("rate") || r.includes("quota") || r.includes("429") || r.includes("resource_exhausted"))
    return locale === "ar"
      ? "النظام يعالج طلبات كثيرة الآن. انتظر لحظة وحاول مجدداً."
      : "We're handling a lot of requests. Please try again in a moment.";
  if (r.includes("network") || r.includes("fetch") || r.includes("econnrefused") || r.includes("timeout"))
    return locale === "ar"
      ? "تعذّر الاتصال بالخادم. تحقق من اتصالك بالإنترنت وحاول مجدداً."
      : "Connection failed. Please check your internet and try again.";
  if (r.includes("parse") || r.includes("json") || r.includes("syntax"))
    return locale === "ar"
      ? "تعذّر فهم طلبك. حاول صياغته بشكل مختلف."
      : "We couldn't understand your request. Try rephrasing it.";
  return locale === "ar"
    ? "عذراً، حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى."
    : "An unexpected error occurred. Please try again.";
}

export function SearchProvider({
  children,
  initialLocale = "ar",
}: {
  children: ReactNode;
  initialLocale?: Locale;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [data, setData] = useState<SearchData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (q: string) => {
    if (!q.trim()) return;

    // Redirect to /search on the main domain homepage
    if (typeof window !== "undefined") {
      const host = window.location.hostname;
      const isMainDomain =
        host === "gotripza.com" ||
        host === "www.gotripza.com" ||
        host.endsWith(".vercel.app");
      const isSearchPage = window.location.pathname.includes("/search");
      if (isMainDomain && !isSearchPage) {
        window.location.href = `/${initialLocale}/search?q=${encodeURIComponent(q)}`;
        return;
      }
    }

    setStatus("loading");
    setError(null);
    const uiCurrency = currencyForLocale(initialLocale);
    logEvent("search_submitted", { query: q, locale: initialLocale, currency: uiCurrency });

    try {
      const parseRes = await fetch("/api/parse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: q }),
      });

      type ParseResponse = {
        intent?: TripIntent;
        locale?: "ar" | "en";
        message?: string;
        wants?: Side[];
        followup?: string | null;
        tips?: string | null;
        mock?: boolean;
        error?: string;
        budget_verdict?: BudgetVerdict | null;
        confidence?: ConfidenceScore | null;
        destination_intel?: DestinationIntel | null;
        clarification_needed?: boolean;
        clarification_question?: string | null;
      };

      let parsedJson: ParseResponse = {};
      try { parsedJson = await parseRes.json(); } catch { throw new Error("parse_failed"); }
      if (!parseRes.ok || !parsedJson.intent) throw new Error(parsedJson.error ?? "parse_failed");

      const intent = parsedJson.intent!;
      const locale = parsedJson.locale ?? "en";
      const message = parsedJson.message ?? "";
      const tips = parsedJson.tips ?? null;
      const wants: Side[] = Array.isArray(parsedJson.wants) && parsedJson.wants.length
        ? (parsedJson.wants.filter((w) => w === "flights" || w === "hotels") as Side[])
        : ["flights", "hotels"];
      const followup = parsedJson.followup ?? null;

      const searchRes = await fetch("/api/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ intent, currency: uiCurrency }),
      });

      type SearchResponse = {
        flights?: FlightOffer[];
        hotels?: HotelOffer[];
        mock?: boolean;
        currency?: Currency;
        error?: string;
        flightSearchUrl?: string;
        hotelSearchUrl?: string;
      };

      let searchJson: SearchResponse = {};
      try { searchJson = await searchRes.json(); } catch { throw new Error("search_failed"); }
      if (!searchRes.ok) throw new Error(searchJson.error ?? "search_failed");

      setData({
        intent,
        flights: searchJson.flights ?? [],
        hotels: searchJson.hotels ?? [],
        mock: Boolean(parsedJson.mock || searchJson.mock),
        locale,
        message,
        tips,
        wants,
        followup,
        currency: searchJson.currency ?? uiCurrency,
        flightSearchUrl: searchJson.flightSearchUrl ?? `https://www.aviasales.com/?marker=522867`,
        hotelSearchUrl: searchJson.hotelSearchUrl ?? `https://www.hotellook.com/search?marker=522867`,
        // Intelligence
        budget_verdict: parsedJson.budget_verdict ?? null,
        confidence: parsedJson.confidence ?? null,
        destination_intel: parsedJson.destination_intel ?? null,
        clarification_needed: parsedJson.clarification_needed ?? false,
        clarification_question: parsedJson.clarification_question ?? null,
      });
      setStatus("ready");

      logEvent("results_rendered", {
        destination: intent.destination,
        flights: searchJson.flights?.length ?? 0,
        hotels: searchJson.hotels?.length ?? 0,
        wants,
        mock: Boolean(parsedJson.mock || searchJson.mock),
        confidence_score: parsedJson.confidence?.score ?? null,
      });

      requestAnimationFrame(() => {
        const el = document.getElementById("results");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (err) {
      const raw = err instanceof Error ? err.message : "unknown_error";
      setError(friendlyError(raw, initialLocale));
      setStatus("error");
    }
  }, [initialLocale]);

  const reveal = useCallback((side: Side) => {
    logEvent("followup_revealed", { side });
    setData((d) => d ? { ...d, wants: Array.from(new Set([...d.wants, side])) as Side[], followup: null } : d);
  }, []);

  const dismissFollowup = useCallback(() => {
    logEvent("followup_dismissed", {});
    setData((d) => (d ? { ...d, followup: null } : d));
  }, []);

  const value = useMemo<SearchContextValue>(
    () => ({ query, setQuery, status, data, error, search, reveal, dismissFollowup, uiLocale: initialLocale }),
    [query, status, data, error, search, reveal, dismissFollowup, initialLocale],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used inside <SearchProvider>");
  return ctx;
}
