"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Trash2,
  Plane,
  Hotel as HotelIcon,
  Star,
  ArrowRight,
  ExternalLink,
  TrendingDown,
  Award,
  Zap,
  ShieldCheck,
  DollarSign,
  TrendingUp,
  MapPin,
  Thermometer,
  Stamp,
  Shirt,
  Calendar,
  ChevronDown,
  ChevronUp,
  MessageCircleQuestion,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { useChat } from "./ChatContext";
import type { ChatMessage, ChatSearchData } from "./ChatContext";
import { logEvent } from "@/lib/events";
import { trackClick } from "@/lib/trackClick";
import { getPartnerRecommendations } from "@/lib/orchestration";
import { formatPrice } from "@/lib/utils";
import type { FlightOffer, HotelOffer } from "@/lib/travelpayouts";
import type { BudgetVerdict, ConfidenceScore, DestinationIntel } from "@/lib/ai/schemas/intelligence";
import type { Dictionary } from "@/i18n/get-dictionary";

// SpeechRecognition types
interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  abort(): void;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: ISpeechRecognitionEvent) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
}
interface ISpeechRecognitionEvent extends Event {
  results: { 0: { 0: { transcript: string } } };
}
interface ISpeechRecognitionConstructor { new(): ISpeechRecognition; }
declare global {
  interface Window {
    SpeechRecognition?: ISpeechRecognitionConstructor;
    webkitSpeechRecognition?: ISpeechRecognitionConstructor;
  }
}

// ── Quick suggestions shown on empty state ────────────────────────────────
const SUGGESTIONS_AR = [
  "أبغى أسافر تركيا",
  "شهر عسل في المالديف",
  "هل تركيا آمنة للسياحة؟",
  "أفضل وقت لزيارة بالي",
];

const SUGGESTIONS_EN = [
  "I want to visit Turkey",
  "Honeymoon in Maldives",
  "Is Turkey safe for tourists?",
  "Best time to visit Bali",
];

// ── Main Chat Interface ───────────────────────────────────────────────────

export function ChatInterface({ dict }: { dict: Dictionary }) {
  const { messages, isThinking, locale, currency, sendMessage, clearChat } = useChat();
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const isAr = locale === "ar";
  const suggestions = isAr ? SUGGESTIONS_AR : SUGGESTIONS_EN;
  const showSuggestions = messages.length <= 1 && !isThinking;

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, isThinking]);

  // Cleanup voice on unmount
  useEffect(() => {
    return () => { recognitionRef.current?.abort(); };
  }, []);

  const handleSend = async () => {
    const q = input.trim();
    if (!q) return;
    setInput("");
    await sendMessage(q);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const handleVoice = () => {
    const SR = typeof window !== "undefined"
      ? window.SpeechRecognition ?? window.webkitSpeechRecognition
      : undefined;
    if (!SR) { alert(isAr ? "المتصفح لا يدعم البحث الصوتي" : "Voice search not supported"); return; }

    if (isListening) { recognitionRef.current?.abort(); setIsListening(false); return; }

    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = isAr ? "ar-SA" : "en-US";
    rec.continuous = false;
    rec.interimResults = false;
    rec.onstart = () => setIsListening(true);
    rec.onresult = (e: ISpeechRecognitionEvent) => {
      const t = e.results[0][0].transcript;
      setInput(t);
      setIsListening(false);
      void sendMessage(t);
    };
    rec.onerror = () => setIsListening(false);
    rec.onend = () => setIsListening(false);
    rec.start();
  };

  return (
    <div
      className="chat-viewport-lock flex h-full min-w-0 flex-col"
      style={{
        background: "linear-gradient(160deg, #06111e 0%, #0a1a30 50%, #071524 100%)",
        borderRadius: "inherit",
      }}
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* ── Chat header ─────────────────────────────────────────── */}
      <div
        className="flex min-w-0 shrink-0 items-center justify-between gap-3 border-b border-white/[0.08] px-3 py-3 backdrop-blur-xl sm:px-5 sm:py-3.5"
        style={{ background: "rgba(0,0,0,0.35)", borderRadius: "inherit inherit 0 0" }}
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-primary to-violet-600 shadow-lg shadow-violet-900/40">
            <Sparkles className="h-4.5 w-4.5 text-white" />
            <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-[#071524] ring-2 ring-[#071524]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            </span>
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white/90">
              {isAr ? "ريا — مستشارة السفر الذكية" : "Raya — AI Travel Advisor"}
            </p>
            <p className="truncate text-[11px] text-white/40">
              {isAr ? "متاحة الآن · GoTripza" : "Online now · GoTripza"}
            </p>
          </div>
        </div>

        {messages.length > 1 && (
          <button
            type="button"
            onClick={clearChat}
            title={isAr ? "محادثة جديدة" : "New conversation"}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/25 transition hover:bg-white/[0.08] hover:text-white/60"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ── Messages ─────────────────────────────────────────────── */}
      <div
        className="chat-viewport-lock flex-1 min-h-0 min-w-0 overflow-y-auto px-2.5 py-4 space-y-4 sm:px-4 sm:py-5 sm:space-y-5"
        style={{ WebkitOverflowScrolling: "touch", overscrollBehaviorY: "contain", overscrollBehaviorX: "none" }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} dict={dict} currency={currency} locale={locale} />
          ))}
        </AnimatePresence>

        {isThinking && messages[messages.length - 1]?.isLoading && (
          <TypingIndicator isAr={isAr} />
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Quick Suggestions (empty state) ─────────────────────── */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="chat-viewport-lock min-w-0 border-t border-white/[0.06] px-3 pb-3 sm:px-4"
            style={{ background: "rgba(0,0,0,0.20)" }}
          >
            <p className="mb-2.5 mt-2.5 text-[11px] font-medium text-white/35">
              {isAr ? "ابدأ المحادثة:" : "Start a conversation:"}
            </p>
            <div className="flex max-w-full gap-2 overflow-x-auto pb-1 scroll-hide">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setInput(s); void sendMessage(s); }}
                  className="shrink-0 rounded-full border border-white/[0.12] bg-white/[0.05] px-3.5 py-1.5 text-xs text-white/55 transition hover:border-violet-400/40 hover:bg-violet-500/[0.15] hover:text-white/90"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input Row ────────────────────────────────────────────── */}
      <div
        className="chat-viewport-lock shrink-0 border-t border-white/[0.08] px-2 pt-2.5 sm:px-4 sm:pt-3 backdrop-blur-xl"
        style={{ background: "rgba(0,0,0,0.40)", paddingBottom: "max(10px, env(safe-area-inset-bottom))" }}
      >
        <div className="grid w-full max-w-full min-w-0 grid-cols-[minmax(0,1fr)_2.5rem] items-end gap-1.5 min-[390px]:grid-cols-[minmax(0,1fr)_2.5rem_2.5rem] sm:grid-cols-[minmax(0,1fr)_2.75rem_2.75rem] sm:gap-2.5">
          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isAr
                ? "اسألني عن رحلتك..."
                : "Ask me about your trip..."
            }
            disabled={isThinking}
            rows={1}
            className="min-h-[40px] sm:min-h-[44px] flex-1 min-w-0 resize-none rounded-xl sm:rounded-2xl border border-white/[0.12] bg-white/[0.06] px-3 py-2 sm:px-4 sm:py-3 text-sm text-white/90 placeholder:text-white/30 focus:border-violet-400/50 focus:bg-white/[0.09] focus:outline-none focus:ring-2 focus:ring-violet-400/[0.15] disabled:opacity-50"
            style={{ maxHeight: "100px" }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = `${Math.min(t.scrollHeight, 100)}px`;
            }}
          />

          {/* Voice — hidden on extra-small screens to ensure send button stays visible */}
          <button
            type="button"
            onClick={handleVoice}
            disabled={isThinking}
            aria-label={isAr ? "بحث صوتي" : "Voice search"}
            className={`hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg transition disabled:opacity-40 min-[390px]:flex sm:h-11 sm:w-11 sm:rounded-xl ${
              isListening
                ? "animate-pulse bg-rose-500/20 text-rose-400"
                : "border border-white/[0.12] bg-white/[0.05] text-white/35 hover:bg-white/[0.10] hover:text-white/65"
            }`}
          >
            {isListening ? <MicOff className="h-3.5 sm:h-4 w-3.5 sm:w-4" /> : <Mic className="h-3.5 sm:h-4 w-3.5 sm:w-4" />}
          </button>

          {/* Send — ALWAYS visible, never pushed off-screen */}
          <button
            type="button"
            onClick={handleSend}
            disabled={isThinking || !input.trim()}
            aria-label={isAr ? "إرسال" : "Send"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-primary to-violet-600 text-white shadow-md shadow-violet-900/40 transition hover:scale-105 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 sm:h-11 sm:w-11 sm:rounded-xl"
          >
            <Send className="h-3.5 sm:h-4 w-3.5 sm:w-4 rtl:rotate-180" />
          </button>
        </div>

      </div>
    </div>
  );
}

// ── Typing Indicator ──────────────────────────────────────────────────────

function TypingIndicator({ isAr }: { isAr: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex w-full min-w-0 items-end gap-2"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-violet-600 shadow-md shadow-violet-900/30">
        <Sparkles className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="max-w-[calc(100%-2.5rem)] rounded-2xl rounded-bl-sm border border-white/[0.12] bg-white/[0.07] px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-violet-300/70" style={{ animationDelay: "0ms" }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-violet-300/70" style={{ animationDelay: "150ms" }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-violet-300/70" style={{ animationDelay: "300ms" }} />
        </div>
        <p className="mt-1 text-[10px] text-white/35">
          {isAr ? "ريا تفكر..." : "Raya is thinking..."}
        </p>
      </div>
    </motion.div>
  );
}

// ── Message Bubble ────────────────────────────────────────────────────────

function MessageBubble({
  message,
  dict,
  currency,
  locale,
}: {
  message: ChatMessage;
  dict: Dictionary;
  currency: import("@/lib/utils").Currency;
  locale: import("@/i18n/config").Locale;
}) {
  const isUser = message.role === "user";
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  if (message.isLoading) return null; // handled by TypingIndicator

  function submitFeedback(value: "up" | "down") {
    setFeedback(value);
    logEvent("ria_response_feedback", {
      value,
      mode: message.mode ?? "unknown",
      hasSearchData: Boolean(message.searchData),
      messageId: message.id,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex w-full min-w-0 items-end gap-2 overflow-hidden ${isUser ? "justify-end" : "justify-start"}`}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary to-violet-600 shadow-md shadow-violet-900/30">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
      )}

      {/* Leave room for the avatar so RTL rows can never exceed the viewport. */}
      <div className={`${
        isUser
          ? "max-w-[82%] sm:max-w-[78%]"
          : "w-[calc(100%-2.5rem)] max-w-[calc(100%-2.5rem)]"
      } space-y-3 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        {/* Text bubble */}
        {message.text && (
          <div
            className={`max-w-full break-words rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap [overflow-wrap:anywhere] ${
              isUser
                ? "rounded-br-sm bg-gradient-to-br from-brand-primary to-violet-600 text-white shadow-md shadow-violet-900/30"
                : message.error
                  ? "rounded-bl-sm border border-rose-400/25 bg-rose-500/[0.12] text-rose-300 backdrop-blur-sm"
                  : "rounded-bl-sm border border-white/[0.12] bg-white/[0.07] text-white/90 backdrop-blur-sm"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Search Results — only for search-mode assistant messages */}
        {!isUser && message.searchData && message.mode === "search" && (
          <ChatSearchResults
            data={message.searchData}
            messageId={message.id}
            dict={dict}
            currency={currency}
            locale={locale}
          />
        )}

        {!isUser && message.id !== "welcome" && !message.error && (
          <div className="flex items-center gap-1 self-start rounded-full border border-white/[0.06] bg-white/[0.03] p-1">
            <button
              type="button"
              onClick={() => submitFeedback("up")}
              aria-label={locale === "ar" ? "رد مفيد" : "Helpful response"}
              className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                feedback === "up"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "text-white/25 hover:bg-white/[0.06] hover:text-white/60"
              }`}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => submitFeedback("down")}
              aria-label={locale === "ar" ? "رد غير مفيد" : "Unhelpful response"}
              className={`flex h-7 w-7 items-center justify-center rounded-full transition ${
                feedback === "down"
                  ? "bg-rose-500/20 text-rose-300"
                  : "text-white/25 hover:bg-white/[0.06] hover:text-white/60"
              }`}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Chat Search Results ───────────────────────────────────────────────────

function ChatSearchResults({
  data,
  messageId,
  dict,
  currency,
  locale,
}: {
  data: ChatSearchData;
  messageId: string;
  dict: Dictionary;
  currency: import("@/lib/utils").Currency;
  locale: import("@/i18n/config").Locale;
}) {
  const { revealSide } = useChat();
  const isAr = locale === "ar";
  const fmt = (n: number) => formatPrice(n, currency, locale);
  const showFlights = data.wants.includes("flights");
  const showHotels = data.wants.includes("hotels");

  const nights = computeNights(data.intent.departure_date, data.intent.return_date) ?? 4;

  const missingSide: "flights" | "hotels" | null = !showHotels
    ? "hotels" : !showFlights ? "flights" : null;

  return (
    <div className="w-full max-w-full space-y-4 sm:max-w-2xl">

      {/* Clarification */}
      {data.clarification_needed && data.clarification_question && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-400/25 bg-amber-500/[0.10] p-4">
          <MessageCircleQuestion className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          <div>
            <p className="text-xs font-semibold text-amber-300">
              {isAr ? "توضيح مطلوب" : "Clarification needed"}
            </p>
            <p className="mt-1 text-xs text-amber-200/80">{data.clarification_question}</p>
          </div>
        </div>
      )}

      {/* Intelligence row */}
      {(data.confidence || data.budget_verdict) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {data.confidence && (
            <CompactConfidence confidence={data.confidence} isAr={isAr} />
          )}
          {data.budget_verdict && (
            <CompactBudgetVerdict verdict={data.budget_verdict} isAr={isAr} />
          )}
        </div>
      )}

      {/* Destination intel (collapsed) */}
      {data.destination_intel && (
        <CompactDestinationIntel intel={data.destination_intel} isAr={isAr} destination={data.intent.destination ?? ""} />
      )}

      {/* Flights */}
      {showFlights && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/40">
            <Plane className="h-3 w-3 text-violet-400" />
            {isAr ? "الرحلات" : "Flights"}
            {data.flights.length > 0 && (
              <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] text-violet-300">
                {data.flights.length}
              </span>
            )}
          </p>
          {data.flights.length === 0 ? (
            <SearchCTACard
              isAr={isAr}
              icon={<Plane className="h-4 w-4" />}
              title={isAr ? "عرض أسعار الطيران" : "View Live Flight Prices"}
              url={data.flightSearchUrl}
              btnLabel={isAr ? "بحث مباشر" : "Live Search"}
              accent="primary"
            />
          ) : (
            <FlightCards flights={data.flights} fmt={fmt} locale={locale} destination={data.intent.destination ?? ""} currency={currency} searchUrl={data.flightSearchUrl} dict={dict} />
          )}
        </div>
      )}

      {/* Followup between sections */}
      {missingSide === "hotels" && !showHotels && (
        <FollowupChip
          label={isAr ? "🏨 هل تريد رؤية الفنادق أيضاً؟" : "🏨 Want to see hotels too?"}
          yesLabel={isAr ? "نعم" : "Yes"}
          noLabel={isAr ? "لا" : "No"}
          onYes={() => revealSide(messageId, "hotels")}
          onNo={() => {}}
        />
      )}

      {/* Hotels */}
      {showHotels && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-white/40">
            <HotelIcon className="h-3 w-3 text-emerald-400" />
            {isAr ? "الفنادق" : "Hotels"}
            {data.hotels.length > 0 && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">
                {data.hotels.length}
              </span>
            )}
          </p>
          {data.hotels.length === 0 ? (
            <SearchCTACard
              isAr={isAr}
              icon={<HotelIcon className="h-4 w-4" />}
              title={isAr ? "أسعار الفنادق المباشرة قريباً" : "Live hotel prices coming soon"}
              note={
                isAr
                  ? "نعمل على تفعيل الربط مع شريك الفنادق. يمكنك فتح البحث المباشر الآن."
                  : "Hotel inventory is being connected. You can still open partner search now."
              }
              url={data.hotelSearchUrl}
              btnLabel={isAr ? "بحث مباشر" : "Live Search"}
              accent="mint"
              live={false}
            />
          ) : (
            <HotelCards hotels={data.hotels} nights={nights} fmt={fmt} locale={locale} destination={data.intent.destination ?? ""} currency={currency} searchUrl={data.hotelSearchUrl} dict={dict} />
          )}
        </div>
      )}

      {missingSide === "flights" && !showFlights && (
        <FollowupChip
          label={isAr ? "✈️ هل تريد رؤية رحلات الطيران؟" : "✈️ Want to see flights too?"}
          yesLabel={isAr ? "نعم" : "Yes"}
          noLabel={isAr ? "لا" : "No"}
          onYes={() => revealSide(messageId, "flights")}
          onNo={() => {}}
        />
      )}

      {/* Smart partner recommendations */}
      <SmartChatPartners intent={data.intent} isAr={isAr} />
    </div>
  );
}

// ── Compact Intelligence Widgets ──────────────────────────────────────────

function CompactConfidence({ confidence, isAr }: { confidence: ConfidenceScore; isAr: boolean }) {
  const score = confidence.score;
  const color = score >= 8 ? "emerald" : score >= 6 ? "sky" : score >= 4 ? "amber" : "rose";
  const colorMap = {
    emerald: { ring: "border-emerald-400/30", text: "text-emerald-300", bar: "bg-emerald-400", bg: "bg-emerald-500/[0.10]" },
    sky:     { ring: "border-sky-400/30",     text: "text-sky-300",     bar: "bg-sky-400",     bg: "bg-sky-500/[0.10]" },
    amber:   { ring: "border-amber-400/30",   text: "text-amber-300",   bar: "bg-amber-400",   bg: "bg-amber-500/[0.10]" },
    rose:    { ring: "border-rose-400/30",    text: "text-rose-300",    bar: "bg-rose-400",    bg: "bg-rose-500/[0.10]" },
  };
  const c = colorMap[color];

  return (
    <div className={`rounded-xl border ${c.ring} ${c.bg} p-3 backdrop-blur-sm`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/40">
          <ShieldCheck className="h-3 w-3" />
          {isAr ? "مؤشر الثقة" : "Confidence"}
        </div>
        <span className={`font-display text-lg font-bold ${c.text}`}>
          {score.toFixed(1)}<span className="text-xs text-white/30">/10</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(score / 10) * 100}%` }}
          transition={{ duration: 0.7 }}
          className={`h-full rounded-full ${c.bar}`}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-white/60">
        {isAr ? confidence.label_ar : confidence.label_en}
      </p>
    </div>
  );
}

function CompactBudgetVerdict({ verdict, isAr }: { verdict: BudgetVerdict; isAr: boolean }) {
  const v = verdict.verdict;
  const colorMap = {
    generous:    { ring: "border-emerald-400/30", badge: "bg-emerald-500/[0.20] text-emerald-300", bg: "bg-emerald-500/[0.08]", icon: "text-emerald-400" },
    realistic:   { ring: "border-sky-400/30",     badge: "bg-sky-500/[0.20] text-sky-300",         bg: "bg-sky-500/[0.08]",     icon: "text-sky-400" },
    tight:       { ring: "border-amber-400/30",   badge: "bg-amber-500/[0.20] text-amber-300",     bg: "bg-amber-500/[0.08]",   icon: "text-amber-400" },
    insufficient:{ ring: "border-rose-400/30",    badge: "bg-rose-500/[0.20] text-rose-300",       bg: "bg-rose-500/[0.08]",    icon: "text-rose-400" },
  };
  const c = colorMap[v];

  return (
    <div className={`rounded-xl border ${c.ring} ${c.bg} p-3 backdrop-blur-sm`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/40">
          <DollarSign className={`h-3 w-3 ${c.icon}`} />
          {isAr ? "الميزانية" : "Budget"}
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.badge}`}>
          {isAr ? verdict.label_ar : verdict.label_en}
        </span>
      </div>
      <p className="text-[11px] leading-relaxed text-white/60">
        {isAr ? verdict.explanation_ar : verdict.explanation_en}
      </p>
      {verdict.suggested_budget_usd && (v === "tight" || v === "insufficient") && (
        <p className="mt-1 flex items-center gap-1 text-[10px] text-white/40">
          <TrendingUp className="h-3 w-3" />
          {isAr ? `الموصى به: $${verdict.suggested_budget_usd.toLocaleString()}` : `Recommended: $${verdict.suggested_budget_usd.toLocaleString()}`}
        </p>
      )}
    </div>
  );
}

function CompactDestinationIntel({ intel, isAr, destination }: { intel: DestinationIntel; isAr: boolean; destination: string }) {
  const [expanded, setExpanded] = useState(false);
  const safetyColors = {
    excellent: "text-emerald-300 bg-emerald-500/[0.18]",
    good:      "text-sky-300 bg-sky-500/[0.18]",
    moderate:  "text-amber-300 bg-amber-500/[0.18]",
    caution:   "text-rose-300 bg-rose-500/[0.18]",
  };
  const safetyLabels = {
    excellent: isAr ? "ممتاز" : "Excellent",
    good:      isAr ? "جيد" : "Good",
    moderate:  isAr ? "متوسط" : "Moderate",
    caution:   isAr ? "تنبيه" : "Caution",
  };

  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.10] bg-white/[0.05] backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center justify-between px-4 py-2.5 transition hover:bg-white/[0.05]"
      >
        <div className="flex items-center gap-1.5 text-xs font-medium text-white/70">
          <MapPin className="h-3.5 w-3.5 text-violet-400" />
          {isAr ? `دليل ${destination}` : `${destination} Guide`}
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${safetyColors[intel.safety_level]}`}>
            {safetyLabels[intel.safety_level]}
          </span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5 text-white/30" /> : <ChevronDown className="h-3.5 w-3.5 text-white/30" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="grid gap-3 px-4 pb-4 sm:grid-cols-2">
              {/* Weather */}
              <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-3">
                <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/35">
                  <Thermometer className="h-3 w-3 text-sky-400" />
                  {isAr ? "الطقس" : "Weather"}
                </p>
                <p className="text-[11px] text-white/75">{isAr ? intel.weather_now_ar : intel.weather_now_en}</p>
                <p className="mt-1 text-[10px] text-white/40">
                  <Calendar className="mr-1 inline h-3 w-3" />
                  {isAr ? intel.best_months_ar : intel.best_months_en}
                </p>
              </div>

              {/* Visa */}
              {(intel.visa_note_ar || intel.visa_note_en) && (
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-3">
                  <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/35">
                    <Stamp className="h-3 w-3 text-purple-400" />
                    {isAr ? "التأشيرة" : "Visa"}
                  </p>
                  {intel.visa_required_for_saudis !== null && (
                    <span className={`mb-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${intel.visa_required_for_saudis ? "bg-amber-500/[0.18] text-amber-300" : "bg-emerald-500/[0.18] text-emerald-300"}`}>
                      {intel.visa_required_for_saudis ? (isAr ? "تأشيرة مطلوبة" : "Visa required") : (isAr ? "بدون تأشيرة" : "Visa-free")}
                    </span>
                  )}
                  <p className="text-[11px] text-white/75">{isAr ? intel.visa_note_ar : intel.visa_note_en}</p>
                </div>
              )}

              {/* Clothing */}
              {(intel.clothing_tip_ar || intel.clothing_tip_en) && (
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-3">
                  <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/35">
                    <Shirt className="h-3 w-3 text-rose-400" />
                    {isAr ? "اللباس" : "Clothing"}
                  </p>
                  <p className="text-[11px] text-white/75">{isAr ? intel.clothing_tip_ar : intel.clothing_tip_en}</p>
                </div>
              )}

              {/* Activities */}
              {(isAr ? intel.top_activities_ar : intel.top_activities_en).length > 0 && (
                <div className="rounded-lg border border-white/[0.08] bg-white/[0.04] p-3">
                  <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-white/35">
                    <Zap className="h-3 w-3 text-amber-400" />
                    {isAr ? "الأنشطة" : "Activities"}
                  </p>
                  <ul className="space-y-0.5">
                    {(isAr ? intel.top_activities_ar : intel.top_activities_en).slice(0, 3).map((a) => (
                      <li key={a} className="flex items-center gap-1.5 text-[11px] text-white/70">
                        <span className="h-1 w-1 rounded-full bg-amber-400/70" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Flight Cards ──────────────────────────────────────────────────────────

function FlightCards({
  flights, fmt, locale, destination, currency, searchUrl, dict,
}: {
  flights: FlightOffer[];
  fmt: (n: number) => string;
  locale: import("@/i18n/config").Locale;
  destination: string;
  currency: string;
  searchUrl: string;
  dict: Dictionary;
}) {
  const isAr = locale === "ar";
  const options = useMemo(() => pickThreeFlights(flights), [flights]);

  const labelMap = {
    value:      { badge: isAr ? "أفضل قيمة" : "Best Value",  icon: <Award className="h-3 w-3" />,       cls: "bg-amber-500/[0.18] text-amber-300 border-amber-400/25" },
    cheapest:   { badge: isAr ? "الأرخص" : "Cheapest",        icon: <TrendingDown className="h-3 w-3" />, cls: "bg-emerald-500/[0.18] text-emerald-300 border-emerald-400/25" },
    comfortable:{ badge: isAr ? "الأريح" : "Fastest",         icon: <Zap className="h-3 w-3" />,          cls: "bg-sky-500/[0.18] text-sky-300 border-sky-400/25" },
  };

  return (
    <div className="space-y-2">
      {options.map(({ type, flight }) => {
        const l = labelMap[type];
        return (
          /* Mobile: stack info on top, price+button below.  sm+: single row */
          <div key={`${type}-${flight.flight_number}`}
            className="flex flex-col gap-2 rounded-xl border border-white/[0.10] bg-white/[0.06] p-3 backdrop-blur-sm transition hover:border-white/[0.18] hover:bg-white/[0.09] sm:flex-row sm:items-center sm:justify-between"
          >
            {/* Top row: badge + route info */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${l.cls}`}>
                {l.icon} {l.badge}
              </span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-1 text-xs font-semibold text-white/90">
                  <span className="font-mono">{flight.origin}</span>
                  <ArrowRight className="h-3 w-3 text-white/35 rtl:rotate-180" />
                  <span className="font-mono">{flight.destination}</span>
                  {flight.duration && (
                    <span className="text-white/35">· {durationLabel(flight.duration)}</span>
                  )}
                </div>
                <p className="truncate text-[10px] text-white/40">
                  {flight.airline} {flight.flight_number}
                  {flight.departure_at && ` · ${flight.departure_at.slice(0, 10)}`}
                </p>
              </div>
            </div>
            {/* Bottom row on mobile: price + book button, full width */}
            <div className="flex items-center justify-between gap-2 sm:shrink-0 sm:justify-end">
              <span className="font-display text-sm font-bold text-white">{fmt(flight.price)}</span>
              <a
                href={flight.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  logEvent("book_clicked", { kind: "flight", option_type: type, destination, airline: flight.airline, price: flight.price });
                  void trackClick({ resultType: "flight", provider: flight.airline ?? "travelpayouts", origin: flight.origin, destination, price: flight.price, currency, affiliateUrl: flight.link, locale });
                }}
                className="flex h-8 items-center gap-1 rounded-lg bg-gradient-to-r from-brand-primary to-violet-600 px-3 text-xs font-semibold text-white shadow-sm transition hover:scale-105"
              >
                {dict.results.bookNow}
                <ArrowRight className="h-3 w-3 rtl:rotate-180" />
              </a>
            </div>
          </div>
        );
      })}
      <a href={searchUrl} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-1 py-1.5 text-[11px] text-white/30 transition hover:text-white/60"
      >
        {isAr ? "عرض المزيد من الرحلات" : "View more flights"}
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

// ── Hotel Cards ───────────────────────────────────────────────────────────

function HotelCards({
  hotels, nights, fmt, locale, destination, currency, searchUrl, dict,
}: {
  hotels: HotelOffer[];
  nights: number;
  fmt: (n: number) => string;
  locale: import("@/i18n/config").Locale;
  destination: string;
  currency: string;
  searchUrl: string;
  dict: Dictionary;
}) {
  const isAr = locale === "ar";
  const options = useMemo(() => pickThreeHotels(hotels), [hotels]);

  const labelMap = {
    value:      { badge: isAr ? "أفضل قيمة" : "Best Value",      icon: <Award className="h-3 w-3" />,       cls: "bg-amber-500/[0.18] text-amber-300 border-amber-400/25" },
    cheapest:   { badge: isAr ? "الأرخص" : "Cheapest",            icon: <TrendingDown className="h-3 w-3" />, cls: "bg-emerald-500/[0.18] text-emerald-300 border-emerald-400/25" },
    comfortable:{ badge: isAr ? "الأفخم" : "Most Luxurious",      icon: <Star className="h-3 w-3" />,         cls: "bg-purple-500/[0.18] text-purple-300 border-purple-400/25" },
  };

  return (
    <div className="space-y-2">
      {options.map(({ type, hotel }) => {
        const l = labelMap[type];
        return (
          /* Mobile: stack info on top, price+button below.  sm+: single row */
          <div key={`${type}-${hotel.hotelId}`}
            className="flex flex-col gap-2 rounded-xl border border-white/[0.10] bg-white/[0.06] p-3 backdrop-blur-sm transition hover:border-white/[0.18] hover:bg-white/[0.09] sm:flex-row sm:items-center sm:justify-between"
          >
            {/* Top row: badge + hotel name */}
            <div className="flex items-center gap-2.5 min-w-0">
              <span className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${l.cls}`}>
                {l.icon} {l.badge}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <p className="truncate text-xs font-semibold text-white/90">{hotel.hotelName}</p>
                  {hotel.stars && (
                    <span className="flex shrink-0 items-center gap-0.5 text-[10px] text-amber-400">
                      <Star className="h-2.5 w-2.5 fill-current" />{hotel.stars}
                    </span>
                  )}
                </div>
                <p className="truncate text-[10px] text-white/40">
                  {hotel.location.name} · {nights} {isAr ? "ليالٍ" : "nights"}
                </p>
              </div>
            </div>
            {/* Bottom row on mobile: price + book button, full width */}
            <div className="flex items-center justify-between gap-2 sm:shrink-0 sm:justify-end">
              <span className="font-display text-sm font-bold text-white">{fmt(hotel.priceFrom)}</span>
              <a
                href={hotel.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  logEvent("book_clicked", { kind: "hotel", option_type: type, hotel: hotel.hotelName, destination, price: hotel.priceFrom });
                  void trackClick({ resultType: "hotel", provider: "booking", destination, price: hotel.priceFrom, currency, affiliateUrl: hotel.link, locale });
                }}
                className="flex h-8 items-center gap-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-3 text-xs font-semibold text-white shadow-sm transition hover:scale-105"
              >
                {dict.results.bookNow}
                <ArrowRight className="h-3 w-3 rtl:rotate-180" />
              </a>
            </div>
          </div>
        );
      })}
      <a href={searchUrl} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-1 py-1.5 text-[11px] text-white/30 transition hover:text-white/60"
      >
        {isAr ? "عرض المزيد من الفنادق" : "View more hotels"}
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

// ── Followup Chip ─────────────────────────────────────────────────────────

function FollowupChip({
  label, yesLabel, noLabel, onYes, onNo,
}: {
  label: string; yesLabel: string; noLabel: string;
  onYes: () => void; onNo: () => void;
}) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center justify-between gap-3 rounded-xl border border-violet-400/20 bg-violet-500/[0.08] px-4 py-2.5"
    >
      <span className="text-xs text-violet-200/80">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => { onYes(); setDismissed(true); }}
          className="rounded-full bg-gradient-to-r from-brand-primary to-violet-600 px-3 py-1 text-xs font-semibold text-white shadow-sm"
        >
          {yesLabel}
        </button>
        <button
          type="button"
          onClick={() => { onNo(); setDismissed(true); }}
          className="rounded-full border border-white/[0.15] bg-white/[0.06] px-3 py-1 text-xs text-white/50"
        >
          {noLabel}
        </button>
      </div>
    </motion.div>
  );
}

// ── Smart Chat Partners ───────────────────────────────────────────────────

function SmartChatPartners({
  intent,
  isAr,
}: {
  intent: import("@/lib/ai/schemas/intent").TripIntent;
  isAr: boolean;
}) {
  const urlParams = {
    destination: intent.destination ?? "",
    origin: intent.origin ?? undefined,
    departure_date: intent.departure_date,
    return_date: intent.return_date,
    adults: intent.adults,
    subid: "ai_chat",
  };

  const recs = getPartnerRecommendations(intent, urlParams, 8);
  if (!recs.length) return null;

  // Split into priority groups: essentials (eSIM + insurance) vs extras
  const essentials = recs.filter((r) =>
    r.partner.category === "esim" || r.partner.category === "insurance"
  );
  const extras = recs.filter((r) =>
    r.partner.category !== "esim" && r.partner.category !== "insurance" &&
    r.partner.category !== "hotels" // hotels already shown above
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="mt-4 space-y-3"
    >
      {/* Raya intro */}
      <div className="flex items-center gap-1.5">
        <div className="h-px flex-1 bg-white/[0.07]" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
          {isAr ? "✨ أكمل رحلتك مع" : "✨ Complete your trip with"}
        </span>
        <div className="h-px flex-1 bg-white/[0.07]" />
      </div>

      {/* Essential add-ons: eSIM + Insurance */}
      {essentials.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
            {isAr ? "إضافات أساسية" : "Essential add-ons"}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {essentials.slice(0, 4).map((rec) => (
              <UpsellCard key={rec.partner.id} rec={rec} isAr={isAr} destination={intent.destination ?? undefined} />
            ))}
          </div>
        </div>
      )}

      {/* Extras: activities, car rental, trains, cheap flights */}
      {extras.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
            {isAr ? "أنشطة وخدمات إضافية" : "Activities & more"}
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {extras.slice(0, 6).map((rec) => (
              <UpsellCard key={rec.partner.id} rec={rec} isAr={isAr} destination={intent.destination ?? undefined} />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── Single upsell card (compact) ─────────────────────────────────────────

const UPSELL_ACCENT: Record<string, { border: string; bg: string; text: string }> = {
  blue:    { border: "border-blue-500/20",    bg: "bg-blue-500/[0.07]",    text: "text-blue-400"    },
  teal:    { border: "border-teal-500/20",    bg: "bg-teal-500/[0.07]",    text: "text-teal-400"    },
  sky:     { border: "border-sky-500/20",     bg: "bg-sky-500/[0.07]",     text: "text-sky-400"     },
  emerald: { border: "border-emerald-500/20", bg: "bg-emerald-500/[0.07]", text: "text-emerald-400" },
  rose:    { border: "border-rose-500/20",    bg: "bg-rose-500/[0.07]",    text: "text-rose-400"    },
  orange:  { border: "border-orange-500/20",  bg: "bg-orange-500/[0.07]",  text: "text-orange-400"  },
  violet:  { border: "border-violet-500/20",  bg: "bg-violet-500/[0.07]",  text: "text-violet-400"  },
  indigo:  { border: "border-indigo-500/20",  bg: "bg-indigo-500/[0.07]",  text: "text-indigo-400"  },
  cyan:    { border: "border-cyan-500/20",    bg: "bg-cyan-500/[0.07]",    text: "text-cyan-400"    },
  purple:  { border: "border-purple-500/20",  bg: "bg-purple-500/[0.07]",  text: "text-purple-400"  },
  amber:   { border: "border-amber-500/20",   bg: "bg-amber-500/[0.07]",   text: "text-amber-400"   },
  red:     { border: "border-red-500/20",     bg: "bg-red-500/[0.07]",     text: "text-red-400"     },
};

function UpsellCard({
  rec,
  isAr,
  destination,
}: {
  rec: import("@/lib/orchestration").PartnerRec;
  isAr: boolean;
  destination?: string;
}) {
  const c = UPSELL_ACCENT[rec.partner.accentColor] ?? UPSELL_ACCENT.blue;

  return (
    <a
      href={rec.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => logEvent("affiliate_upsell_clicked", { type: rec.partner.category, partner: rec.partner.id, destination: destination ?? "" })}
      className={`group flex items-center gap-2 rounded-xl border p-2.5 transition hover:brightness-110 ${c.border} ${c.bg}`}
    >
      <span className="text-base shrink-0">{rec.partner.icon}</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-semibold text-white/85">{rec.partner.name}</p>
        <p className={`truncate text-[10px] ${c.text}`}>
          {isAr ? rec.reason_ar.split("—")[0].trim() : rec.reason_en.split("—")[0].trim()}
        </p>
      </div>
      <ExternalLink className="h-3 w-3 shrink-0 text-white/20 transition group-hover:text-white/50" />
    </a>
  );
}

// ── Search CTA Card ───────────────────────────────────────────────────────

function SearchCTACard({
  isAr, icon, title, note, url, btnLabel, accent, live = true,
}: {
  isAr: boolean; icon: React.ReactNode; title: string;
  note?: string;
  url: string; btnLabel: string; accent: "primary" | "mint";
  live?: boolean;
}) {
  const isPrimary = accent === "primary";
  return (
    <div className={`flex flex-col gap-3 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between ${isPrimary ? "border-violet-400/20 bg-violet-500/[0.08]" : "border-emerald-400/20 bg-emerald-500/[0.08]"}`}>
      <div className="flex min-w-0 items-start gap-2 text-xs text-white/65">
        <span className={`mt-0.5 shrink-0 ${isPrimary ? "text-violet-400" : "text-emerald-400"}`}>{icon}</span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span>{title}</span>
            <span className="flex items-center gap-1 text-[10px] text-white/30">
              <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${isPrimary ? "bg-violet-400" : "bg-emerald-400"}`} />
              {live ? (isAr ? "مباشر" : "Live") : (isAr ? "قريباً" : "Soon")}
            </span>
          </div>
          {note && <p className="mt-1 text-[11px] leading-relaxed text-white/40">{note}</p>}
        </div>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex h-8 shrink-0 items-center justify-center gap-1 rounded-lg px-3 text-xs font-semibold text-white shadow-sm transition hover:scale-105 ${isPrimary ? "bg-gradient-to-r from-brand-primary to-violet-600" : "bg-gradient-to-r from-emerald-500 to-teal-500"}`}
      >
        {btnLabel}
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────

function pickThreeFlights(flights: FlightOffer[]) {
  if (!flights.length) return [];
  const key = (f: FlightOffer) => `${f.flight_number}|${f.departure_at?.slice(0, 16) ?? ""}`;
  const byValue = [...flights].sort((a, b) => a.price + (a.duration ?? 0) / 4 - (b.price + (b.duration ?? 0) / 4));
  const byPrice = [...flights].sort((a, b) => a.price - b.price);
  const byDuration = [...flights].sort((a, b) => (a.duration ?? 9999) - (b.duration ?? 9999));
  const seen = new Set<string>();
  const result: Array<{ type: "value" | "cheapest" | "comfortable"; flight: FlightOffer }> = [];
  const tryAdd = (type: "value" | "cheapest" | "comfortable", sorted: FlightOffer[]) => {
    for (const f of sorted) {
      if (!seen.has(key(f))) { seen.add(key(f)); result.push({ type, flight: f }); return; }
    }
  };
  tryAdd("value", byValue);
  tryAdd("cheapest", byPrice);
  tryAdd("comfortable", byDuration);
  return result;
}

function pickThreeHotels(hotels: HotelOffer[]) {
  if (!hotels.length) return [];
  const byValue = [...hotels].sort((a, b) => (b.stars ?? 0) / (b.priceFrom || 1) - (a.stars ?? 0) / (a.priceFrom || 1));
  const byPrice = [...hotels].sort((a, b) => a.priceFrom - b.priceFrom);
  const byStars = [...hotels].sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));
  const seen = new Set<number>();
  const result: Array<{ type: "value" | "cheapest" | "comfortable"; hotel: HotelOffer }> = [];
  const tryAdd = (type: "value" | "cheapest" | "comfortable", sorted: HotelOffer[]) => {
    for (const h of sorted) {
      if (!seen.has(h.hotelId)) { seen.add(h.hotelId); result.push({ type, hotel: h }); return; }
    }
  };
  tryAdd("value", byValue);
  tryAdd("cheapest", byPrice);
  tryAdd("comfortable", byStars);
  return result;
}

function computeNights(checkIn?: string | null, checkOut?: string | null): number | null {
  if (!checkIn || !checkOut) return null;
  const diff = Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86_400_000);
  return diff > 0 ? diff : null;
}

function durationLabel(d?: number): string {
  if (!d) return "";
  return `${Math.floor(d / 60)}h ${d % 60}m`;
}
