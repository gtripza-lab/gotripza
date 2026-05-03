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
} from "lucide-react";
import { useChat } from "./ChatContext";
import type { ChatMessage, ChatSearchData } from "./ChatContext";
import { logEvent } from "@/lib/events";
import { trackClick } from "@/lib/trackClick";
import { PartnerRecommendations } from "@/components/PartnerRecommendations";
import { getPartnerRecommendations } from "@/lib/orchestration";
import { formatPrice } from "@/lib/utils";
import type { FlightOffer, HotelOffer } from "@/lib/travelpayouts";
import type { BudgetVerdict, ConfidenceScore, DestinationIntel } from "@/lib/gemini";
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
      className="flex h-full flex-col bg-white/[0.97] dark:bg-[#0f0f17]"
      dir={isAr ? "rtl" : "ltr"}
      style={{ borderRadius: "inherit" }}
    >
      {/* ── Chat header ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-gray-200/70 px-5 py-3.5 bg-white/80 backdrop-blur-sm" style={{ borderRadius: "inherit inherit 0 0" }}>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-brand-primary shadow-sm">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {isAr ? "ريا — مستشارة السفر الذكية" : "Raya — AI Travel Advisor"}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
              <span className="text-[11px] text-gray-500">
                {isAr ? "متاحة الآن · GoTripza" : "Online now · GoTripza"}
              </span>
            </div>
          </div>
        </div>

        {messages.length > 1 && (
          <button
            type="button"
            onClick={clearChat}
            title={isAr ? "محادثة جديدة" : "New conversation"}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* ── Messages ─────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-5 bg-gray-50/50">
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
            className="px-4 pb-3 bg-gray-50/50 border-t border-gray-100"
          >
            <p className="mb-2.5 mt-2.5 text-[11px] font-medium text-gray-400">
              {isAr ? "ابدأ المحادثة:" : "Start a conversation:"}
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => { setInput(s); void sendMessage(s); }}
                  className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs text-gray-600 shadow-sm transition hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                >
                  {s}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input Row ────────────────────────────────────────────── */}
      <div className="border-t border-gray-200/70 px-4 py-3 bg-white">
        <div className="flex items-end gap-2">
          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isAr
                ? "اسألني عن رحلتك أو أي شيء عن السفر..."
                : "Ask me about your trip or anything travel..."
            }
            disabled={isThinking}
            rows={1}
            className="min-h-[44px] flex-1 resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-400 focus:border-violet-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-100 disabled:opacity-50"
            style={{ maxHeight: "120px" }}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
            }}
          />

          {/* Voice */}
          <button
            type="button"
            onClick={handleVoice}
            disabled={isThinking}
            aria-label={isAr ? "بحث صوتي" : "Voice search"}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition disabled:opacity-40 ${
              isListening
                ? "animate-pulse bg-rose-100 text-rose-500"
                : "border border-gray-200 bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            }`}
          >
            {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>

          {/* Send */}
          <button
            type="button"
            onClick={handleSend}
            disabled={isThinking || !input.trim()}
            aria-label={isAr ? "إرسال" : "Send"}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-brand-primary text-white shadow-sm transition hover:scale-105 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
          >
            <Send className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>

        <p className="mt-2 text-center text-[10px] text-gray-400">
          {isAr
            ? "GoTripza · ١٨٠+ شركة طيران · آلاف الفنادق"
            : "GoTripza · 180+ airlines · thousands of hotels"}
        </p>
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
      className="flex items-end gap-2.5"
    >
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-brand-primary shadow-sm">
        <Sparkles className="h-3.5 w-3.5 text-white" />
      </div>
      <div className="rounded-2xl rounded-bl-sm bg-white shadow-sm border border-gray-100 px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "0ms" }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "150ms" }} />
          <span className="h-2 w-2 animate-bounce rounded-full bg-violet-400" style={{ animationDelay: "300ms" }} />
        </div>
        <p className="mt-1 text-[10px] text-gray-400">
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

  if (message.isLoading) return null; // handled by TypingIndicator

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex items-end gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      {/* AI Avatar */}
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-brand-primary shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
      )}

      <div className={`max-w-[85%] space-y-3 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        {/* Text bubble */}
        {message.text && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-line ${
              isUser
                ? "rounded-br-sm bg-gradient-to-br from-violet-500 to-brand-primary text-white shadow-sm"
                : "rounded-bl-sm bg-white border border-gray-100 text-gray-800 shadow-sm"
            } ${message.error ? "border-rose-200 bg-rose-50 text-rose-700" : ""}`}
          >
            {message.text}
          </div>
        )}

        {/* Timestamp */}
        <span className={`px-1 text-[10px] ${isUser ? "text-gray-400" : "text-gray-400"}`}>
          {new Date(message.timestamp).toLocaleTimeString(locale === "ar" ? "ar-SA" : "en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>

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
    <div className="w-full max-w-2xl space-y-4">

      {/* Clarification */}
      {data.clarification_needed && data.clarification_question && (
        <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <MessageCircleQuestion className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <div>
            <p className="text-xs font-semibold text-amber-700">
              {isAr ? "توضيح مطلوب" : "Clarification needed"}
            </p>
            <p className="mt-1 text-xs text-amber-800">{data.clarification_question}</p>
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
        <CompactDestinationIntel intel={data.destination_intel} isAr={isAr} destination={data.intent.destination} />
      )}

      {/* Flights */}
      {showFlights && (
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <Plane className="h-3 w-3 text-brand-primary" />
            {isAr ? "الرحلات" : "Flights"}
            {data.flights.length > 0 && (
              <span className="rounded-full bg-brand-primary/10 px-2 py-0.5 text-[10px] text-brand-primary">
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
            <FlightCards flights={data.flights} fmt={fmt} locale={locale} destination={data.intent.destination} currency={currency} searchUrl={data.flightSearchUrl} dict={dict} />
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
          <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <HotelIcon className="h-3 w-3 text-emerald-500" />
            {isAr ? "الفنادق" : "Hotels"}
            {data.hotels.length > 0 && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700">
                {data.hotels.length}
              </span>
            )}
          </p>
          {data.hotels.length === 0 ? (
            <SearchCTACard
              isAr={isAr}
              icon={<HotelIcon className="h-4 w-4" />}
              title={isAr ? "عرض أسعار الفنادق" : "View Live Hotel Prices"}
              url={data.hotelSearchUrl}
              btnLabel={isAr ? "بحث مباشر" : "Live Search"}
              accent="mint"
            />
          ) : (
            <HotelCards hotels={data.hotels} nights={nights} fmt={fmt} locale={locale} destination={data.intent.destination} currency={currency} searchUrl={data.hotelSearchUrl} dict={dict} />
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
    emerald: { ring: "border-emerald-200", text: "text-emerald-600", bar: "bg-emerald-500", bg: "bg-emerald-50" },
    sky:     { ring: "border-sky-200",     text: "text-sky-600",     bar: "bg-sky-500",     bg: "bg-sky-50" },
    amber:   { ring: "border-amber-200",   text: "text-amber-600",   bar: "bg-amber-500",   bg: "bg-amber-50" },
    rose:    { ring: "border-rose-200",    text: "text-rose-600",    bar: "bg-rose-500",    bg: "bg-rose-50" },
  };
  const c = colorMap[color];

  return (
    <div className={`rounded-xl border ${c.ring} ${c.bg} p-3`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
          <ShieldCheck className="h-3 w-3" />
          {isAr ? "مؤشر الثقة" : "Confidence"}
        </div>
        <span className={`font-display text-lg font-bold ${c.text}`}>
          {score.toFixed(1)}<span className="text-xs text-gray-400">/10</span>
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-gray-200">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(score / 10) * 100}%` }}
          transition={{ duration: 0.7 }}
          className={`h-full rounded-full ${c.bar}`}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-gray-600">
        {isAr ? confidence.label_ar : confidence.label_en}
      </p>
    </div>
  );
}

function CompactBudgetVerdict({ verdict, isAr }: { verdict: BudgetVerdict; isAr: boolean }) {
  const v = verdict.verdict;
  const colorMap = {
    generous:    { ring: "border-emerald-200", badge: "bg-emerald-100 text-emerald-700", bg: "bg-emerald-50", icon: "text-emerald-600" },
    realistic:   { ring: "border-sky-200",     badge: "bg-sky-100 text-sky-700",         bg: "bg-sky-50",     icon: "text-sky-600" },
    tight:       { ring: "border-amber-200",   badge: "bg-amber-100 text-amber-700",     bg: "bg-amber-50",   icon: "text-amber-600" },
    insufficient:{ ring: "border-rose-200",    badge: "bg-rose-100 text-rose-700",       bg: "bg-rose-50",    icon: "text-rose-600" },
  };
  const c = colorMap[v];

  return (
    <div className={`rounded-xl border ${c.ring} ${c.bg} p-3`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
          <DollarSign className={`h-3 w-3 ${c.icon}`} />
          {isAr ? "الميزانية" : "Budget"}
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${c.badge}`}>
          {isAr ? verdict.label_ar : verdict.label_en}
        </span>
      </div>
      <p className="text-[11px] leading-relaxed text-gray-600">
        {isAr ? verdict.explanation_ar : verdict.explanation_en}
      </p>
      {verdict.suggested_budget_usd && (v === "tight" || v === "insufficient") && (
        <p className="mt-1 flex items-center gap-1 text-[10px] text-gray-500">
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
    excellent: "text-emerald-700 bg-emerald-100",
    good:      "text-sky-700 bg-sky-100",
    moderate:  "text-amber-700 bg-amber-100",
    caution:   "text-rose-700 bg-rose-100",
  };
  const safetyLabels = {
    excellent: isAr ? "ممتاز" : "Excellent",
    good:      isAr ? "جيد" : "Good",
    moderate:  isAr ? "متوسط" : "Moderate",
    caution:   isAr ? "تنبيه" : "Caution",
  };

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center justify-between px-4 py-2.5 transition hover:bg-gray-50"
      >
        <div className="flex items-center gap-1.5 text-xs font-medium text-gray-700">
          <MapPin className="h-3.5 w-3.5 text-violet-500" />
          {isAr ? `دليل ${destination}` : `${destination} Guide`}
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${safetyColors[intel.safety_level]}`}>
            {safetyLabels[intel.safety_level]}
          </span>
          {expanded ? <ChevronUp className="h-3.5 w-3.5 text-gray-400" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400" />}
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
              <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                  <Thermometer className="h-3 w-3 text-sky-500" />
                  {isAr ? "الطقس" : "Weather"}
                </p>
                <p className="text-[11px] text-gray-700">{isAr ? intel.weather_now_ar : intel.weather_now_en}</p>
                <p className="mt-1 text-[10px] text-gray-500">
                  <Calendar className="mr-1 inline h-3 w-3" />
                  {isAr ? intel.best_months_ar : intel.best_months_en}
                </p>
              </div>

              {/* Visa */}
              {(intel.visa_note_ar || intel.visa_note_en) && (
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    <Stamp className="h-3 w-3 text-purple-500" />
                    {isAr ? "التأشيرة" : "Visa"}
                  </p>
                  {intel.visa_required_for_saudis !== null && (
                    <span className={`mb-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${intel.visa_required_for_saudis ? "bg-amber-100 text-amber-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {intel.visa_required_for_saudis ? (isAr ? "تأشيرة مطلوبة" : "Visa required") : (isAr ? "بدون تأشيرة" : "Visa-free")}
                    </span>
                  )}
                  <p className="text-[11px] text-gray-700">{isAr ? intel.visa_note_ar : intel.visa_note_en}</p>
                </div>
              )}

              {/* Clothing */}
              {(intel.clothing_tip_ar || intel.clothing_tip_en) && (
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    <Shirt className="h-3 w-3 text-rose-400" />
                    {isAr ? "اللباس" : "Clothing"}
                  </p>
                  <p className="text-[11px] text-gray-700">{isAr ? intel.clothing_tip_ar : intel.clothing_tip_en}</p>
                </div>
              )}

              {/* Activities */}
              {(isAr ? intel.top_activities_ar : intel.top_activities_en).length > 0 && (
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                  <p className="mb-1 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                    <Zap className="h-3 w-3 text-amber-500" />
                    {isAr ? "الأنشطة" : "Activities"}
                  </p>
                  <ul className="space-y-0.5">
                    {(isAr ? intel.top_activities_ar : intel.top_activities_en).slice(0, 3).map((a) => (
                      <li key={a} className="flex items-center gap-1.5 text-[11px] text-gray-700">
                        <span className="h-1 w-1 rounded-full bg-amber-400" />
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
    value:     { badge: isAr ? "أفضل قيمة" : "Best Value",    icon: <Award className="h-3 w-3" />,      cls: "bg-amber-100 text-amber-700 border-amber-200" },
    cheapest:  { badge: isAr ? "الأرخص" : "Cheapest",         icon: <TrendingDown className="h-3 w-3" />, cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    comfortable:{ badge: isAr ? "الأريح" : "Fastest",          icon: <Zap className="h-3 w-3" />,         cls: "bg-sky-100 text-sky-700 border-sky-200" },
  };

  return (
    <div className="space-y-2">
      {options.map(({ type, flight }) => {
        const l = labelMap[type];
        return (
          <div key={`${type}-${flight.flight_number}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition hover:border-gray-200 hover:shadow"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${l.cls}`}>
                {l.icon} {l.badge}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
                  <span className="font-mono">{flight.origin}</span>
                  <ArrowRight className="h-3 w-3 text-gray-400 rtl:rotate-180" />
                  <span className="font-mono">{flight.destination}</span>
                  {flight.duration && (
                    <span className="text-gray-400">· {durationLabel(flight.duration)}</span>
                  )}
                </div>
                <p className="text-[10px] text-gray-500">
                  {flight.airline} {flight.flight_number}
                  {flight.departure_at && ` · ${flight.departure_at.slice(0, 10)}`}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="font-display text-sm font-bold text-gray-900">{fmt(flight.price)}</span>
              <a
                href={flight.link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  logEvent("book_clicked", { kind: "flight", option_type: type, destination, airline: flight.airline, price: flight.price });
                  void trackClick({ resultType: "flight", provider: flight.airline ?? "travelpayouts", origin: flight.origin, destination, price: flight.price, currency, affiliateUrl: flight.link, locale });
                }}
                className="flex h-8 items-center gap-1 rounded-lg bg-gradient-to-r from-violet-500 to-brand-primary px-3 text-xs font-semibold text-white shadow-sm transition hover:scale-105"
              >
                {dict.results.bookNow}
                <ArrowRight className="h-3 w-3 rtl:rotate-180" />
              </a>
            </div>
          </div>
        );
      })}
      <a href={searchUrl} target="_blank" rel="noopener noreferrer"
        className="flex items-center justify-center gap-1 py-1.5 text-[11px] text-gray-400 transition hover:text-gray-600"
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
    value:      { badge: isAr ? "أفضل قيمة" : "Best Value",      icon: <Award className="h-3 w-3" />, cls: "bg-amber-100 text-amber-700 border-amber-200" },
    cheapest:   { badge: isAr ? "الأرخص" : "Cheapest",            icon: <TrendingDown className="h-3 w-3" />, cls: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    comfortable:{ badge: isAr ? "الأفخم" : "Most Luxurious",      icon: <Star className="h-3 w-3" />, cls: "bg-purple-100 text-purple-700 border-purple-200" },
  };

  return (
    <div className="space-y-2">
      {options.map(({ type, hotel }) => {
        const l = labelMap[type];
        return (
          <div key={`${type}-${hotel.hotelId}`}
            className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 bg-white p-3 shadow-sm transition hover:border-gray-200 hover:shadow"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className={`shrink-0 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${l.cls}`}>
                {l.icon} {l.badge}
              </span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="truncate text-xs font-semibold text-gray-800">{hotel.hotelName}</p>
                  {hotel.stars && (
                    <span className="flex shrink-0 items-center gap-0.5 text-[10px] text-amber-500">
                      <Star className="h-2.5 w-2.5 fill-current" />{hotel.stars}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-gray-500">
                  {hotel.location.name} · {nights} {isAr ? "ليالٍ" : "nights"}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="font-display text-sm font-bold text-gray-900">{fmt(hotel.priceFrom)}</span>
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
        className="flex items-center justify-center gap-1 py-1.5 text-[11px] text-gray-400 transition hover:text-gray-600"
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
      className="flex items-center justify-between gap-3 rounded-xl border border-violet-200 bg-violet-50 px-4 py-2.5"
    >
      <span className="text-xs text-violet-800">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => { onYes(); setDismissed(true); }}
          className="rounded-full bg-gradient-to-r from-violet-500 to-brand-primary px-3 py-1 text-xs font-semibold text-white shadow-sm"
        >
          {yesLabel}
        </button>
        <button
          type="button"
          onClick={() => { onNo(); setDismissed(true); }}
          className="rounded-full border border-gray-300 bg-white px-3 py-1 text-xs text-gray-600"
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
  intent: import("@/lib/gemini").TripIntent;
  isAr: boolean;
}) {
  const recs = getPartnerRecommendations(intent, {
    destination: intent.destination,
    origin: intent.origin ?? undefined,
    departure_date: intent.departure_date,
    return_date: intent.return_date,
    adults: intent.adults,
    subid: "ai_chat",
  }, 6);

  if (!recs.length) return null;

  return (
    <div>
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
        {isAr ? "خدمات مُوصى بها لرحلتك" : "Recommended for your trip"}
      </p>
      <PartnerRecommendations
        recs={recs}
        locale={isAr ? "ar" : "en"}
        destination={intent.destination}
        variant="compact"
      />
    </div>
  );
}

// ── Search CTA Card ───────────────────────────────────────────────────────

function SearchCTACard({
  isAr, icon, title, url, btnLabel, accent,
}: {
  isAr: boolean; icon: React.ReactNode; title: string;
  url: string; btnLabel: string; accent: "primary" | "mint";
}) {
  const isPrimary = accent === "primary";
  return (
    <div className={`flex items-center justify-between gap-3 rounded-xl border p-3 ${isPrimary ? "border-violet-100 bg-violet-50" : "border-emerald-100 bg-emerald-50"}`}>
      <div className="flex items-center gap-2 text-xs text-gray-700">
        <span className={isPrimary ? "text-violet-500" : "text-emerald-600"}>{icon}</span>
        {title}
        <span className="flex items-center gap-1 text-[10px] text-gray-400">
          <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${isPrimary ? "bg-violet-400" : "bg-emerald-400"}`} />
          {isAr ? "مباشر" : "Live"}
        </span>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:scale-105 ${isPrimary ? "bg-gradient-to-r from-violet-500 to-brand-primary" : "bg-gradient-to-r from-emerald-500 to-teal-500"}`}
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
