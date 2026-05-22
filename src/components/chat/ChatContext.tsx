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
import type { TripIntent, TravelContext } from "@/lib/ai/schemas/intent";
import type {
  BudgetVerdict,
  ConfidenceScore,
  DestinationIntel,
  ChatTurn,
  ChatMode,
} from "@/lib/ai/schemas/intelligence";
import type { FlightOffer, HotelOffer } from "@/lib/travelpayouts";
import type { Locale } from "@/i18n/config";
import { currencyForLocale, type Currency } from "@/lib/utils";
import { logEvent } from "@/lib/events";
import { TP_MARKER } from "@/lib/partners";
import { deriveTripLifecycle } from "@/lib/ai/trip-lifecycle";

// ── Re-export for consumers ────────────────────────────────────────────────
export type { ChatMode, TravelContext };

// Default empty context
const EMPTY_CONTEXT: TravelContext = {
  destination: null,
  origin: null,
  departure_date: null,
  return_date: null,
  adults: 2,
  budget_usd: null,
  trip_type: null,
  cabin_class: null,
  traveler_type: null,
  hotel_preferences: [],
  service_interests: [],
  booking_stage: null,
  concerns: [],
};

// Merge: new non-null values override old values; nulls don't erase known values
function mergeContext(current: TravelContext, intent: TripIntent): TravelContext {
  return {
    destination: intent.destination || current.destination,
    origin: intent.origin ?? current.origin,
    departure_date: intent.departure_date ?? current.departure_date,
    return_date: intent.return_date ?? current.return_date,
    adults: intent.adults ?? current.adults,
    budget_usd: intent.budget_usd ?? current.budget_usd,
    trip_type: intent.trip_type ?? current.trip_type,
    cabin_class: intent.cabin_class ?? current.cabin_class,
    traveler_type: current.traveler_type ?? null,
    hotel_preferences: current.hotel_preferences ?? [],
    service_interests: current.service_interests ?? [],
    booking_stage: current.booking_stage ?? null,
    concerns: current.concerns ?? [],
  };
}

type CompanionMemory = {
  summary: string | null;
  knownFacts: string[];
  askedSlots: string[];
  turnCount: number;
  lastUserIntent: string | null;
};

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
  queued?: boolean;
  mode?: ChatMode;          // mode of the AI response
  searchData?: ChatSearchData; // only present when mode === "search"
  context?: TravelContext;
  isLoading?: boolean;
  error?: string;
};

type ChatContextValue = {
  messages: ChatMessage[];
  isThinking: boolean;
  locale: Locale;
  currency: Currency;
  travelContext: TravelContext;
  companionMemory: CompanionMemory;
  sendMessage: (text: string) => Promise<void>;
  addAssistantMessage: (text: string, mode?: ChatMode) => void;
  clearChat: () => void;
  revealSide: (messageId: string, side: "flights" | "hotels") => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

// ── Helpers ────────────────────────────────────────────────────────────────

function genId(): string {
  return Math.random().toString(36).slice(2, 10);
}

function logRyaConsultantStartedOnce(payload: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  try {
    const key = "gotripza_rya_consultant_started";
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
    logEvent("rya_consultant_started", payload);
  } catch {
    logEvent("rya_consultant_started", payload);
  }
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

function detectAskedSlot(text: string): string | null {
  const t = text.toLowerCase();
  if (/from where|from which|which city|flying from|من أي|من اي|تنطلق|تسافر من/i.test(t)) {
    return "origin";
  }
  if (/when|which month|dates|متى|أي شهر|اي شهر|التواريخ|تاريخ/i.test(t)) {
    return "dates";
  }
  if (/where|destination|going|إلى أين|الى اين|وجهة|تفكر تسافر/i.test(t)) {
    return "destination";
  }
  if (/budget|ميزانية|كم ميزانيتك|spend/i.test(t)) {
    return "budget";
  }
  if (/family|couple|solo|business|عائلة|زوج|لوحدك|عمل/i.test(t)) {
    return "traveler_type";
  }
  return null;
}

function inferMemoryIntent(text: string): string {
  if (/دعم|مشكلة|شكوى|support|refund|not working/i.test(text)) return "support";
  if (/احجز|سعر|أرخص|ابحث|book|price|deal|ready/i.test(text)) return "ready_to_book";
  if (/خطة|برنامج|جدول|ميزانية|plan|itinerary|budget/i.test(text)) return "planning";
  if (/تأمين|insurance|esim|شريحة|activities|أنشطة|visa|فيزا/i.test(text)) return "trip_service";
  return "browsing";
}


// ── Provider ───────────────────────────────────────────────────────────────

export function ChatProvider({
  children,
  locale = "ar",
  initialCurrency,
  initialMessage,
}: {
  children: ReactNode;
  locale?: Locale;
  initialCurrency?: Currency;
  initialMessage?: string;
}) {
  const currency = initialCurrency ?? currencyForLocale(locale);

  // Welcome message — invites conversation, doesn't push search
  const welcomeMsg: ChatMessage = useMemo(() => ({
    id: "welcome",
    role: "assistant",
    mode: "advice",
    text: locale === "ar"
      ? "مرحباً! 👋 أنا ريا، مستشارتك الذكية في GoTripza.\n\nأخبرني عن رحلتك — إلى أين تفكر تسافر؟ أو اسألني أي سؤال عن السفر وأنا هنا أساعدك 🌍"
      : "Hi there! 👋 I'm Rya, your travel companion at GoTripza.\n\nTell me about your trip — where are you thinking of going? Or ask me anything about travel and I'll guide you 🌍",
    timestamp: 0,
  }), [locale]);

  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMsg]);
  const [isThinking, setIsThinking] = useState(false);
  const [travelContext, setTravelContext] = useState<TravelContext>(EMPTY_CONTEXT);
  const [companionMemory, setCompanionMemory] = useState<CompanionMemory>({
    summary: null,
    knownFacts: [],
    askedSlots: [],
    turnCount: 0,
    lastUserIntent: null,
  });
  const abortRef = useRef<AbortController | null>(null);
  const processingRef = useRef(false);
  const queuedMessagesRef = useRef<{ id: string; text: string }[]>([]);

  // Keep a ref in sync so sendMessage can read latest messages without
  // being re-created on every state update (avoids stale-closure & perf issues).
  const messagesRef = useRef(messages);
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  const companionMemoryRef = useRef(companionMemory);
  useEffect(() => { companionMemoryRef.current = companionMemory; }, [companionMemory]);
  const travelContextRef = useRef(travelContext);
  useEffect(() => { travelContextRef.current = travelContext; }, [travelContext]);

  function updateCompanionMemory(userText: string, aiText: string, context: TravelContext) {
    const askedSlot = detectAskedSlot(aiText);
    const facts = [
      context.destination ? `destination:${context.destination}` : null,
      context.origin ? `origin:${context.origin}` : null,
      context.departure_date ? `date:${context.departure_date}` : null,
      context.return_date ? `return:${context.return_date}` : null,
      context.budget_usd ? `budget:$${context.budget_usd}` : null,
      context.trip_type ? `style:${context.trip_type}` : null,
      context.traveler_type ? `traveler:${context.traveler_type}` : null,
      context.booking_stage ? `stage:${context.booking_stage}` : null,
      ...(context.service_interests ?? []).map((interest) => `service:${interest}`),
      ...(context.concerns ?? []).slice(0, 3).map((concern) => `concern:${concern}`),
    ].filter(Boolean) as string[];

    const prior = companionMemoryRef.current.summary;
    const fresh = `${userText.trim()} → ${aiText.trim()}`.replace(/\s+/g, " ").slice(0, 260);
    const priorSlots = companionMemoryRef.current.askedSlots ?? [];
    setCompanionMemory({
      summary: [prior, fresh].filter(Boolean).join(" / ").slice(-900),
      knownFacts: Array.from(new Set([...(companionMemoryRef.current.knownFacts ?? []), ...facts])).slice(-20),
      askedSlots: Array.from(new Set([...priorSlots, ...(askedSlot ? [askedSlot] : [])])).slice(-12),
      turnCount: (companionMemoryRef.current.turnCount ?? 0) + 1,
      lastUserIntent: inferMemoryIntent(userText),
    });
  }

  const addAssistantMessage = useCallback((text: string, mode: ChatMode = "advice") => {
    if (!text.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: genId(),
        role: "assistant",
        text: text.trim(),
        mode,
        timestamp: Date.now(),
      },
    ]);
  }, []);

  // Auto-send initial message from URL ?q= param (homepage suggestion chips)
  const sentInitial = useRef(false);
  useEffect(() => {
    const urlMessage = typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("q")?.trim()
      : undefined;
    const seedMessage = (initialMessage?.trim() || urlMessage || "").trim();
    if (!seedMessage || sentInitial.current) return;

    // Small delay so welcome message renders first
    const timer = setTimeout(() => {
      if (sentInitial.current) return;
      sentInitial.current = true;
      sendMessage(seedMessage);
    }, 400);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMessage]);

  const processMessage = useCallback(async (
    text: string,
    opts: { showUserBubble?: boolean; queuedMessageId?: string } = {},
  ) => {
    const cleanText = text.trim();
    if (!cleanText) return;
    const showUserBubble = opts.showUserBubble ?? true;
    processingRef.current = true;
    if (opts.queuedMessageId) {
      setMessages((prev) =>
        prev.map((message) =>
          message.id === opts.queuedMessageId ? { ...message, queued: false } : message,
        ),
      );
    }

    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;

    const userMsg: ChatMessage = {
      id: genId(),
      role: "user",
      text: cleanText,
      timestamp: Date.now(),
    };

    const thinkingId = genId();
    const thinkingMsg: ChatMessage = {
      id: thinkingId,
      role: "assistant",
      text: "",
      timestamp: Date.now(),
      isLoading: true,
    };

    setMessages((prev) => showUserBubble ? [...prev, userMsg, thinkingMsg] : [...prev, thinkingMsg]);
    setIsThinking(true);
    logRyaConsultantStartedOnce({
      query: cleanText,
      locale,
      bookingStage: travelContextRef.current.booking_stage ?? null,
      destination: travelContextRef.current.destination ?? null,
      source: "rya_consultant",
    });
    logEvent("chat_message_sent", {
      query: cleanText,
      locale,
      bookingStage: travelContextRef.current.booking_stage ?? null,
      destination: travelContextRef.current.destination ?? null,
    });

    try {
      // Build conversation history to send (last 12 messages, excluding current loading msg).
      // Loop-fix E: include the assistant's prior `mode` so the model can see its
      // own state and never re-clarifies after searching.
      const historySnap: ChatTurn[] = messagesRef.current
        .filter((m) => !m.isLoading && m.text.trim())
        .slice(-6)
        .map((m) => ({
          role: m.role === "user" ? "user" : "assistant",
          text: m.text,
          mode: m.role === "user" ? undefined : m.mode,
        }));

      // 3 — Parse intent + determine mode
      const parseRes = await fetch("/api/parse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          query: cleanText,
          history: historySnap,
          context: travelContextRef.current,
          clientMemory: companionMemoryRef.current,
        }),
        signal: abort.signal,
      });

      type ParseResponse = {
        conversation_id?: string | null;
        intent?: TripIntent;
        // Server-authoritative merged context (Phase 3). When present,
        // we trust this over any client-side merge.
        context?: TravelContext;
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
      const shouldPersistFallbackConversation = !parsedJson.conversation_id;

      const wants: ("flights" | "hotels")[] = Array.isArray(parsedJson.wants) && parsedJson.wants.length
        ? parsedJson.wants.filter((w) => w === "flights" || w === "hotels") as ("flights" | "hotels")[]
        : ["flights", "hotels"];

      // Accumulate context. Prefer server's authoritative merged context
      // (Phase 3 orchestrator); fall back to client-side merge for older
      // server builds that don't echo `context` yet.
      const nextContext = parsedJson.context ?? mergeContext(travelContextRef.current, intent);
      const nextStage = deriveTripLifecycle(nextContext);
      if (nextStage !== travelContextRef.current.booking_stage) {
        logEvent("ria_trip_phase_detected", {
          stage: nextStage,
          previousStage: travelContextRef.current.booking_stage ?? null,
          destination: nextContext.destination ?? null,
          locale: aiLocale,
        });
      }
      if (parsedJson.context) {
        setTravelContext(parsedJson.context);
      } else {
        setTravelContext((prev) => mergeContext(prev, intent));
      }

      // 4 — ONLY call search API when mode === "search"
      if (mode !== "search") {
        // Clarify or advice: just show the message, no search
        setMessages((prev) =>
          prev.map((m) =>
            m.id === thinkingId
              ? { ...m, text: aiMessage, isLoading: false, mode, context: nextContext }
              : m,
          ),
        );
        updateCompanionMemory(cleanText, aiMessage, nextContext);

        logEvent("chat_message_sent", {
          mode,
          destination: intent.destination,
          locale: aiLocale,
          bookingStage: nextContext.booking_stage ?? null,
        });

        fetch("/api/history", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            query: cleanText,
            response: aiMessage,
            destination: intent.destination,
            locale: aiLocale,
            mode,
            intent,
            context: nextContext,
            persistConversation: shouldPersistFallbackConversation,
          }),
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
        flightSearchUrl: searchJson.flightSearchUrl ?? `https://www.aviasales.com/?marker=${TP_MARKER}&subid=ai_chat_fallback`,
        hotelSearchUrl: searchJson.hotelSearchUrl ?? `https://tp.media/click?shmarker=${TP_MARKER}&promo_id=4338&subid=ai_chat_fallback`,
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
            ? { ...m, text: aiMessage, isLoading: false, mode, searchData, context: nextContext }
            : m,
        ),
      );
      updateCompanionMemory(cleanText, aiMessage, nextContext);

      logEvent("chat_results_ready", {
        destination: intent.destination,
        flights: searchData.flights.length,
        hotels: searchData.hotels.length,
        locale: aiLocale,
        bookingStage: nextContext.booking_stage ?? null,
      });

      fetch("/api/history", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          query: cleanText,
          response: aiMessage,
          destination: intent.destination,
          locale: aiLocale,
          mode,
          intent,
          context: nextContext,
          persistConversation: shouldPersistFallbackConversation,
        }),
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
      processingRef.current = false;
      const nextQueuedMessage = queuedMessagesRef.current.shift();
      if (nextQueuedMessage) {
        void processMessage(nextQueuedMessage.text, {
          showUserBubble: false,
          queuedMessageId: nextQueuedMessage.id,
        });
      }
    }
  }, [locale, currency]);

  const sendMessage = useCallback(async (text: string) => {
    const cleanText = text.trim();
    if (!cleanText) return;
    if (processingRef.current) {
      const queuedId = genId();
      queuedMessagesRef.current.push({ id: queuedId, text: cleanText });
      setMessages((prev) => [
        ...prev,
        {
          id: queuedId,
          role: "user",
          text: cleanText,
          timestamp: Date.now(),
          queued: true,
        },
      ]);
      logEvent("chat_message_sent", {
        locale,
        queued: true,
        bookingStage: travelContextRef.current.booking_stage ?? null,
        destination: travelContextRef.current.destination ?? null,
      });
      return;
    }
    await processMessage(cleanText, { showUserBubble: true });
  }, [locale, processMessage]);

  const clearChat = useCallback(() => {
    setMessages([welcomeMsg]);
    setIsThinking(false);
    setTravelContext(EMPTY_CONTEXT);
    setCompanionMemory({
      summary: null,
      knownFacts: [],
      askedSlots: [],
      turnCount: 0,
      lastUserIntent: null,
    });
    queuedMessagesRef.current = [];
    processingRef.current = false;
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
    () => ({ messages, isThinking, locale, currency, travelContext, companionMemory, sendMessage, addAssistantMessage, clearChat, revealSide }),
    [messages, isThinking, locale, currency, travelContext, companionMemory, sendMessage, addAssistantMessage, clearChat, revealSide],
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used inside <ChatProvider>");
  return ctx;
}
