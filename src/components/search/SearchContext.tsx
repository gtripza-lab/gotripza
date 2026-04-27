"use client";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { TripIntent } from "@/lib/gemini";
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
      const parsedJson = (await parseRes.json()) as {
        intent?: TripIntent;
        locale?: "ar" | "en";
        message?: string;
        wants?: Side[];
        followup?: string | null;
        tips?: string | null;
        mock?: boolean;
        error?: string;
      };
      if (!parseRes.ok || !parsedJson.intent) {
        throw new Error(parsedJson.error ?? "parse_failed");
      }
      const intent = parsedJson.intent;
      const locale = parsedJson.locale ?? "en";
      const message = parsedJson.message ?? "";
      const tips = parsedJson.tips ?? null;
      const wants: Side[] =
        Array.isArray(parsedJson.wants) && parsedJson.wants.length
          ? (parsedJson.wants.filter((w) => w === "flights" || w === "hotels") as Side[])
          : ["flights", "hotels"];
      const followup = parsedJson.followup ?? null;

      const searchRes = await fetch("/api/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ intent, currency: uiCurrency }),
      });
      const searchJson = (await searchRes.json()) as {
        flights?: FlightOffer[];
        hotels?: HotelOffer[];
        mock?: boolean;
        currency?: Currency;
        error?: string;
      };
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
      });
      setStatus("ready");
      logEvent("results_rendered", {
        destination: intent.destination,
        flights: searchJson.flights?.length ?? 0,
        hotels: searchJson.hotels?.length ?? 0,
        wants,
        mock: Boolean(parsedJson.mock || searchJson.mock),
      });

      requestAnimationFrame(() => {
        const el = document.getElementById("results");
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "unknown_error");
      setStatus("error");
    }
  }, [initialLocale]);

  const reveal = useCallback((side: Side) => {
    logEvent("followup_revealed", { side });
    setData((d) =>
      d
        ? {
            ...d,
            wants: Array.from(new Set([...d.wants, side])) as Side[],
            followup: null,
          }
        : d,
    );
  }, []);

  const dismissFollowup = useCallback(() => {
    logEvent("followup_dismissed", {});
    setData((d) => (d ? { ...d, followup: null } : d));
  }, []);

  const value = useMemo<SearchContextValue>(
    () => ({
      query,
      setQuery,
      status,
      data,
      error,
      search,
      reveal,
      dismissFollowup,
      uiLocale: initialLocale,
    }),
    [query, status, data, error, search, reveal, dismissFollowup, initialLocale],
  );

  return <SearchContext.Provider value={value}>{children}</SearchContext.Provider>;
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error("useSearch must be used inside <SearchProvider>");
  return ctx;
}
