"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { TripIntent, BudgetVerdict, ConfidenceScore, DestinationIntel, ChatTurn, ChatMode } from "@/lib/gemini";
import type { FlightOffer, HotelOffer } from "@/lib/travelpayouts";
import type { Locale } from "@/i18n/config";
import { currencyForLocale, type Currency } from "@/lib/utils";
import { logEvent } from "@/lib/events";
import { TP_MARKER } from "@/lib/partners";

// ── Re-export for consumers ────────────────────────────────────────────────
export type { ChatMode };

export type ChatSearchData = {
  intent: TripIntent;
  flights: FlightOffer[];
  hotels: HotelOffer[];
  wants: ("flights" | "hotels")[];
  currency: Currency;
  flightSearchUrl: string;
  hotelSearchUrl: string;
  budget_verdict: BudgetVerdict | null;
  confidence: ConfidenceScore | null;
  destination_intel: DestinationIntel | null;
  clarification_needed: boolean;
  clarification_question: string | null;
  tips: string | null;
};

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: number;
  mode?: ChatMode;          // mode of the AI response
  searchData?: ChatSearchData; // only present when mode === "search"
  isLoading?: boolean;
  error?: string;
};

type ChatContextValue = {
  messages: ChatMessage[];
  isThinking: boolean;
  locale: Locale;
  currency: Currency;
  sendMessage: (text: string) => Promise<void>;
  clearChat: () => void;
  revealSide: (messageId: string, side: "flights" | "hotels") => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

// ── Helpers ────────────────────────────────────────────────────────────────

function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function friendlyError(raw: string, locale: string): string {
  const r = raw.toLowerCase();
  if (r.includes("rate") || r.includes("429") || r.includes("resource_exhausted"))
    return locale === "ar"
      ? "النظام مشغول حالياً. انتظر لحظة وحاول مجدداً."
      : "We're handling many requests right now. Please try again in a moment.";
  if (r.includes("network") || r.includes("fetch"))
    return locale === "ar"
      ? "تعذّر الاتصال. تحقق من اتصالك بالإنترنت."
      : "Connection failed. Please check your internet.";
  return locale === "ar"
    ? "عذراً، حدث خطأ. يرجى المحاولة مجدداً."
    : "Something went wrong. Please try again.";
}


// ── Provider ───────────────────────────────────────────────────────────────

export function ChatProvider({
  children,
  locale = "ar",
  initialCurrency,
}: {
  children: ReactNode;
  locale?: Locale;
  initialCurrency?: Currency;
}) {
  const currency = initialCurrency ?? currencyForLocale(locale);

  // Welcome message — invites conversation, doesn't push search
  const welcomeMsg: ChatMessage = useMemo(() => ({
    id: "welcome",
    role: "assistant",
    mode: "advice",
    text: locale === "ar"
      ? "مرحباً! 👋 أنا ريا، مستشارتك الذكية في GoTripza.\n\nأخبرني عن رحلتك — إلى أين تفكر تسافر؟ أو اسألني أي سؤال عن السفر وأنا هنا أساعدك 🌍"
      : "Hi there! 👋 I'm Raya, your AI travel advisor at GoTripza.\n\nTell me about your trip — where are you thinking of going? Or ask me anything about travel and I'll guide you 🌍",
    timestamp: Date.now(),
  }), [locale]);

  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMsg]);
  const [isThinking, setIsThinking] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Keep a ref in sync so sendMessage can read latest messages without
  // being re-created on every state update (avoids stale-closure & perf issues).
  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isThinking) return;

    // Cancel any in-flight request
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;

    // 1 — Add user bubble
    const userMsg: ChatMessage = {
      id: genId(),
      role: "user",
      text: text.trim(),
      timestamp: Date.now(),
    };

    // 2 — Add thinking placeholder
    const thinkingId = genId();
    const thinkingMsg: ChatMessage = {
      id: thinkingId,
      role: "assistant",
      text: "",
      timestamp: Date.now(),
      isLoading: true,
    };

    setMessages((prev) => [...prev, userMsg, thinkingMsg]);
    setIsThinking(true);
    logEvent("chat_message_sent", { query: text, locale });

    try {
      // Build conversation history to send (last 12 messages, excluding current loading msg)
      const historySnap = messagesRef.current
        .filter((m) => !m.isLoading && m.text.trim())
        .slice(-12)
        .map((m): ChatTurn => ({
          role: m.role === "user" ? "user" : "model",
          text: m.text,
        }));

      // 3 — Parse intent + determine mode
      const parseRes = await fetch("/api/parse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: text, history: historySnap }),
        signal: abort.signal,
      });

      type ParseResponse = {
        intent?: TripIntent;
        locale?: "ar" | "en";
        mode?: ChatMode;
        message?: string;
        wants?: ("flights" | "hotels")[];
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
      const aiLocale = parsedJson.locale ?? locale;
      const aiMessage = parsedJson.message ?? "";
      const mode: ChatMode = parsedJson.mode ?? "search";

      const wants: ("flights" | "hotels")[] = Array.isArray(parsedJson.wants) && parsedJson.wants.length
        ? parsedJson.wants.filter((w) => w === "flights" || w === "hotels") as ("flights" | "hotels")[]
        : ["flights", "hotels"];

      // 4 — ONLY call search API when mode === "search"
      if (mode !== "search") {
        // Clarify or advice: just show the message, no search
        setMessages((prev) =>
          prev.map((m) =>
            m.id === thinkingId
              ? { ...m, text: aiMessage, isLoading: false, mode }
              : m,
          ),
        );

        logEvent("chat_message_sent", { mode, destination: intent.destination, locale: aiLocale });

        fetch("/api/history", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ query: text, destination: intent.destination, locale }),
        }).catch(() => null);

        return;
      }

      // mode === "search" — fetch flights + hotels
      const searchRes = await fetch("/api/search", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ intent, currency }),
        signal: abort.signal,
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

      const searchData: ChatSearchData = {
        intent,
        flights: searchJson.flights ?? [],
        hotels: searchJson.hotels ?? [],
        wants,
        currency: searchJson.currency ?? currency,
        flightSearchUrl: searchJson.flightSearchUrl ?? `https://www.aviasales.com/?marker=${TP_MARKER}`,
        hotelSearchUrl: searchJson.hotelSearchUrl ?? `https://tp.media/click?shmarker=${TP_MARKER}&promo_id=4338`,
        budget_verdict: parsedJson.budget_verdict ?? null,
        confidence: parsedJson.confidence ?? null,
        destination_intel: parsedJson.destination_intel ?? null,
        clarification_needed: parsedJson.clarification_needed ?? false,
        clarification_question: parsedJson.clarification_question ?? null,
        tips: parsedJson.tips ?? null,
      };

      // 5 — Replace thinking with AI response + results
      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingId
            ? { ...m, text: aiMessage, isLoading: false, mode, searchData }
            : m,
        ),
      );

      logEvent("chat_results_ready", {
        destination: intent.destination,
        flights: searchData.flights.length,
        hotels: searchData.hotels.length,
        locale: aiLocale,
      });

      fetch("/api/history", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query: text, destination: intent.destination, locale }),
      }).catch(() => null);

    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      const raw = err instanceof Error ? err.message : "unknown";
      const errorText = friendlyError(raw, locale);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === thinkingId
            ? { ...m, text: errorText, isLoading: false, error: raw }
            : m,
        ),
      );
    } finally {
      setIsThinking(false);
    }
  }, [locale, currency, isThinking]);

  const clearChat = useCallback(() => {
    setMessages([welcomeMsg]);
    setIsThinking(false);
    abortRef.current?.abort();
  }, [welcomeMsg]);

  const revealSide = useCallback((messageId: string, side: "flights" | "hotels") => {
    logEvent("chat_followup_revealed", { side });
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId && m.searchData
          ? {
              ...m,
              searchData: {
                ...m.searchData,
                wants: Array.from(new Set([...m.searchData.wants, side])) as ("flights" | "hotels")[],
              },
            }
          : m,
      ),
    );
  }, []);

  const value = useMemo<ChatContextValue>(
    () => ({ messages, isThinking, locale, currency, sendMessage, clearChat, revealSide }),
    [messages, isThinking, locale, currency, sendMessage, clearChat, revealSide],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
  return ctx;
}
