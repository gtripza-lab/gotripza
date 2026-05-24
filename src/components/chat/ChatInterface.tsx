"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Send,
  Mic,
  MicOff,
  Plus,
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
  Bot,
  Languages,
  Landmark,
  ShieldAlert,
  WalletCards,
  ThumbsDown,
  ThumbsUp,
  CheckCircle2,
  CloudSun,
  ClipboardCheck,
  Camera,
  HeartHandshake,
  Siren,
  Utensils,
  Luggage,
  Navigation,
  Route,
} from "lucide-react";
import { useChat } from "./ChatContext";
import { RayaAgentModal } from "./RayaAgentModal";
import { RyaInstallPrompt } from "./RyaInstallPrompt";
import type { ChatMessage, ChatSearchData, TravelContext } from "./ChatContext";
import { logEvent } from "@/lib/events";
import { trackClick } from "@/lib/trackClick";
import { getPartnerRecommendations } from "@/lib/orchestration";
import {
  deriveTripLifecycle,
  getLifecycleActions,
  isPostBookingLifecycle,
  labelTripLifecycle,
  lifecycleSummary,
  type LifecycleAction,
} from "@/lib/ai/trip-lifecycle";
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
  {
    label: "خطط لي رحلة هادئة إلى تركيا",
    prompt: "خطط لي رحلة هادئة إلى تركيا. اسألني فقط عن المعلومات الناقصة مثل المدينة، الميزانية، وعدد الأيام ثم ابنِ الخطة خطوة بخطوة.",
  },
  {
    label: "اختيار وجهة حسب الميزانية",
    prompt: "ساعدني أختار وجهة سفر حسب ميزانيتي. اسألني عن الميزانية، مدة السفر، ونوع الرحلة ثم اقترح خيارات مناسبة.",
  },
  {
    label: "ترجمة موقف سفر",
    prompt: "أحتاج مساعدة ترجمة أثناء السفر. اسألني عن العبارة أو الموقف، ثم أعطني ترجمة طبيعية وماذا أقول بالضبط.",
  },
  {
    label: "تنبيهات الأمان",
    prompt: "أحتاج تنبيهات أمان واحتيال سياحي قبل السفر. اسألني عن الوجهة ثم أعطني نصائح عملية بدون تهويل.",
  },
];

const SUGGESTIONS_EN = [
  {
    label: "Plan a calm trip to Turkey",
    prompt: "Plan a calm trip to Turkey. Ask only for missing details like city, budget, and number of days, then build the plan step by step.",
  },
  {
    label: "Choose by budget",
    prompt: "Help me choose a destination based on my budget. Ask about budget, trip length, and travel style, then suggest suitable options.",
  },
  {
    label: "Translate a travel moment",
    prompt: "I need help translating a travel situation. Ask me for the phrase or situation, then give me a natural translation and exactly what to say.",
  },
  {
    label: "Safety alerts",
    prompt: "I need practical safety and travel scam alerts before a trip. Ask me for the destination, then give calm practical tips.",
  },
];

// ── Main Chat Interface ───────────────────────────────────────────────────

export function ChatInterface({ dict }: { dict: Dictionary }) {
  const { messages, isThinking, locale, currency, travelContext, companionMemory, sendMessage, addAssistantMessage, clearChat } = useChat();
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isImageReading, setIsImageReading] = useState(false);
  const [agentOpen, setAgentOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isAr = locale === "ar";
  const suggestions = isAr ? SUGGESTIONS_AR : SUGGESTIONS_EN;
  const showSuggestions = messages.length <= 1 && !isThinking;
  const modePrompts = useMemo(() => ([
    {
      icon: Plane,
      label: isAr ? "ريا المخططة" : "Planner Rya",
      prompt: isAr
        ? "ادخلي وضع ريا المخططة: اسأليني سؤالاً واحداً فقط عن رحلتي، ثم ابنِ ملف رحلة كامل خطوة خطوة."
        : "Switch to Planner Rya: ask me one smart question, then build a complete trip file step by step.",
    },
    {
      icon: Landmark,
      label: isAr ? "ريا في المطار" : "Airport Rya",
      prompt: isAr
        ? "ادخلي وضع ريا في المطار: ساعديني في البوابة، الشنط، التأخير، أو الترانزيت بخطوات قصيرة."
        : "Switch to Airport Rya: help me with gates, bags, delays, or transit in short steps.",
    },
    {
      icon: MapPin,
      label: isAr ? "ريا في المدينة" : "City Rya",
      prompt: isAr
        ? "ادخلي وضع ريا في المدينة: ساعديني في الأحياء، المطاعم، التنقل، الأمان، وأفضل الأماكن."
        : "Switch to City Rya: help with neighborhoods, food, transport, safety, and the best places.",
    },
    {
      icon: Siren,
      label: isAr ? "ريا الطوارئ" : "Emergency Rya",
      prompt: isAr
        ? "ادخلي وضع ريا الطوارئ: أعطيني خطوات هادئة وسريعة لمشكلة سفر طارئة."
        : "Switch to Emergency Rya: give calm, immediate steps for a travel emergency.",
    },
    {
      icon: WalletCards,
      label: isAr ? "ريا الاقتصادية" : "Budget Rya",
      prompt: isAr
        ? "ادخلي وضع ريا الاقتصادية: ساعديني أخفض تكلفة الرحلة بدون ما تخرب التجربة."
        : "Switch to Budget Rya: help me lower trip cost without ruining the experience.",
    },
  ]), [isAr]);

  // Keep the route isolated like a native chat screen. We intentionally do not
  // resize the whole app to visualViewport.height; iOS PWA can report a tiny
  // visual viewport while the keyboard is open, which lifts the composer to the
  // top of the screen. Let the browser handle keyboard panning instead.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;
    const previousHtmlOverflow = root.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    root.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      root.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, []);

  function scrollChatToBottom(behavior: ScrollBehavior = "auto") {
    bottomRef.current?.scrollIntoView({ behavior, block: "end" });
  }

  // Auto-scroll to bottom on new messages. Use instant scrolling on mobile so
  // iOS keyboard resizing does not animate the whole conversation upward.
  useEffect(() => {
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
    scrollChatToBottom(isMobile ? "auto" : "smooth");
  }, [messages.length, isThinking]);

  // Cleanup voice on unmount
  useEffect(() => {
    return () => { recognitionRef.current?.abort(); };
  }, []);

  const handleSend = async () => {
    const q = input.trim();
    if (!q) return;
    setInput("");
    setToolsOpen(false);
    requestAnimationFrame(() => {
      if (inputRef.current) inputRef.current.style.height = "auto";
    });
    await sendMessage(q);
    if (typeof window === "undefined" || window.innerWidth >= 768) {
      inputRef.current?.focus();
    }
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

  const handleImage = async (file: File | null | undefined) => {
    if (!file || isImageReading) return;
    setIsImageReading(true);
    const form = new FormData();
    form.set("image", file);
    form.set("locale", locale);
    form.set("prompt", input.trim() || (isAr ? "حللي هذه الصورة في سياق السفر." : "Analyze this image for travel context."));

    try {
      const res = await fetch("/api/companion/image", { method: "POST", body: form });
      const data = (await res.json().catch(() => ({}))) as { message?: string; error?: string };
      if (res.ok && data.message) {
        addAssistantMessage(data.message, "advice");
        logEvent("companion_image_analyzed", { locale, size: file.size, type: file.type });
      } else if (res.status === 401 || res.status === 402) {
        addAssistantMessage(
          isAr
            ? "فهم الصور متاح ضمن Rya Companion للمستخدمين المسجلين. سجّل دخولك أو فعّل الرفيق لاستخدام هذه الميزة أثناء السفر."
            : "Image help is available with Rya Companion for signed-in travelers. Sign in or activate Companion to use it during your trip.",
          "advice",
        );
      } else {
        throw new Error(data.error ?? "image_failed");
      }
    } catch {
      addAssistantMessage(
        isAr
          ? "لم أستطع قراءة الصورة الآن. جرّب صورة أوضح أو أرسل السؤال نصياً."
          : "I could not read the image right now. Try a clearer image or send the question as text.",
        "advice",
      );
    } finally {
      setIsImageReading(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  return (
    <div
      className="chat-viewport-lock flex h-full min-h-0 min-w-0 flex-col overflow-hidden"
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
              {isAr ? "ريا — رفيقة السفر الذكية" : "Rya — Travel Companion"}
            </p>
            <p className="truncate text-[11px] text-white/40">
              {isAr ? "متاحة الآن · GoTripza" : "Online now · GoTripza"}
            </p>
          </div>
        </div>

        <div className="hidden items-center gap-1 sm:flex">
          <button
            type="button"
            onClick={() => setAgentOpen(true)}
            title={isAr ? "وكلاء ريا المتخصصون" : "Rya specialist agents"}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-white/35 transition hover:bg-white/[0.08] hover:text-white/70"
          >
            <Bot className="h-3.5 w-3.5" />
          </button>
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
      </div>

      <RayaAgentModal locale={locale} open={agentOpen} onClose={() => setAgentOpen(false)} />

      <CompanionMemoryStrip
        locale={locale}
        context={travelContext}
        facts={companionMemory.knownFacts}
      />

      <RyaInstallPrompt locale={locale} />

      <TripNowPanel
        locale={locale}
        context={travelContext}
        onPrompt={(prompt, label) => {
          logEvent("ria_lifecycle_action_clicked", {
            source: "trip_now_panel",
            label,
            stage: travelContext.booking_stage ?? null,
            destination: travelContext.destination ?? null,
            locale,
          });
          void sendMessage(prompt);
        }}
      />

      {/* ── Messages ─────────────────────────────────────────────── */}
      <div
        className="chat-viewport-lock flex-1 min-h-0 min-w-0 overflow-y-auto px-2.5 py-4 space-y-4 scroll-pb-28 sm:px-4 sm:py-5 sm:space-y-5"
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
              {suggestions.slice(0, 2).map((s) => (
                <button
                  key={s.label}
                  type="button"
                  onClick={() => {
                    setInput("");
                    logEvent("ria_quick_action_clicked", { source: "empty_state", label: s.label, locale });
                    void sendMessage(s.prompt);
                  }}
                  className="shrink-0 rounded-full border border-white/[0.12] bg-white/[0.05] px-3.5 py-1.5 text-xs text-white/55 transition hover:border-violet-400/40 hover:bg-violet-500/[0.15] hover:text-white/90"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input Row ────────────────────────────────────────────── */}
      <div
        className="chat-viewport-lock relative z-30 shrink-0 border-t border-white/[0.06] px-2 pt-2 sm:px-4 sm:pt-3 backdrop-blur-xl"
        style={{ background: "linear-gradient(180deg, rgba(6,17,30,0.72), rgba(6,17,30,0.96))", paddingBottom: "max(8px, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-auto flex w-full max-w-3xl items-end gap-1.5 rounded-[1.35rem] border border-white/[0.12] bg-white/[0.07] p-1.5 shadow-2xl shadow-black/25 ring-1 ring-black/10 transition focus-within:border-violet-400/45 focus-within:bg-white/[0.09] focus-within:ring-violet-400/[0.18] sm:gap-2 sm:rounded-[1.6rem] sm:p-2">
          <input
            ref={imageInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => void handleImage(e.target.files?.[0])}
          />
          <button
            type="button"
            onClick={() => setToolsOpen((value) => !value)}
            aria-expanded={toolsOpen}
            aria-label={isAr ? "أدوات ريا" : "Rya tools"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/42 transition hover:bg-white/[0.10] hover:text-white/75 sm:hidden"
          >
            <Plus className={`h-4 w-4 transition ${toolsOpen ? "rotate-45 text-brand-mint" : ""}`} />
          </button>

          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={isImageReading}
            aria-label={isAr ? "فهم صورة" : "Analyze image"}
            title={isAr ? "فهم صورة مع Rya Companion" : "Image help with Rya Companion"}
            className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/42 transition hover:bg-white/[0.10] hover:text-white/75 disabled:opacity-40 sm:flex sm:h-10 sm:w-10"
          >
            <Plus className={`h-4 w-4 ${isImageReading ? "animate-pulse text-brand-mint" : ""}`} />
          </button>

          {/* Textarea */}
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (typeof window !== "undefined" && window.innerWidth >= 768) {
                window.setTimeout(() => scrollChatToBottom("auto"), 260);
              }
            }}
            enterKeyHint="send"
            inputMode="text"
            autoComplete="off"
            autoCorrect="on"
            spellCheck
            dir="auto"
            placeholder={
              isAr
                ? "اسألني عن رحلتك..."
                : "Ask me about your trip..."
            }
            rows={1}
            className="min-h-[36px] min-w-0 flex-1 resize-none border-0 bg-transparent px-1 py-2 text-base leading-5 text-white/92 placeholder:text-white/32 focus:outline-none sm:min-h-[40px] sm:px-2 sm:py-2.5 sm:text-sm"
            style={{ maxHeight: "120px" }}
            disabled={false}
            onInput={(e) => {
              const t = e.currentTarget;
              t.style.height = "auto";
              t.style.height = `${Math.min(t.scrollHeight, 120)}px`;
            }}
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth >= 768) {
                window.setTimeout(() => scrollChatToBottom("auto"), 260);
              }
            }}
          />

          {/* Voice — hidden on extra-small screens to ensure send button stays visible */}
          <button
            type="button"
            onClick={handleVoice}
            disabled={isListening}
            aria-label={isAr ? "بحث صوتي" : "Voice search"}
            className={`hidden h-9 w-9 shrink-0 items-center justify-center rounded-full transition disabled:opacity-40 sm:flex sm:h-10 sm:w-10 ${
              isListening
                ? "animate-pulse bg-rose-500/20 text-rose-400"
                : "text-white/42 hover:bg-white/[0.10] hover:text-white/75"
            }`}
          >
            {isListening ? <MicOff className="h-3.5 sm:h-4 w-3.5 sm:w-4" /> : <Mic className="h-3.5 sm:h-4 w-3.5 sm:w-4" />}
          </button>

          {/* Send — ALWAYS visible, never pushed off-screen */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim()}
            aria-label={isAr ? "إرسال" : "Send"}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-ink-950 shadow-md shadow-black/30 transition hover:scale-105 hover:shadow-lg disabled:cursor-not-allowed disabled:bg-white/[0.12] disabled:text-white/28 disabled:hover:scale-100 sm:h-10 sm:w-10"
          >
            <Send className="h-3.5 w-3.5 rtl:rotate-180 sm:h-4 sm:w-4" />
          </button>
        </div>

        <AnimatePresence>
          {toolsOpen && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              className="mx-auto mt-2 grid w-full max-w-3xl grid-cols-2 gap-2 sm:hidden"
            >
              <button
                type="button"
                onClick={() => {
                  setToolsOpen(false);
                  imageInputRef.current?.click();
                }}
                disabled={isImageReading}
                className="flex h-10 items-center justify-center gap-2 rounded-2xl border border-white/[0.10] bg-white/[0.06] text-xs font-medium text-white/65 disabled:opacity-40"
              >
                <Camera className={`h-4 w-4 ${isImageReading ? "animate-pulse text-brand-mint" : ""}`} />
                {isAr ? "فهم صورة" : "Image help"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setToolsOpen(false);
                  handleVoice();
                }}
                disabled={isListening}
                className="flex h-10 items-center justify-center gap-2 rounded-2xl border border-white/[0.10] bg-white/[0.06] text-xs font-medium text-white/65 disabled:opacity-40"
              >
                {isListening ? <MicOff className="h-4 w-4 text-rose-400" /> : <Mic className="h-4 w-4" />}
                {isAr ? "إملاء صوتي" : "Voice input"}
              </button>
              {modePrompts.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.label}
                    type="button"
                    onClick={() => {
                      setToolsOpen(false);
                      logEvent("ria_mode_selected", { label: mode.label, locale });
                      void sendMessage(mode.prompt);
                    }}
                    className="flex h-10 items-center justify-center gap-2 rounded-2xl border border-white/[0.10] bg-white/[0.06] px-2 text-xs font-medium text-white/65"
                  >
                    <Icon className="h-4 w-4 text-violet-200/80" />
                    <span className="truncate">{mode.label}</span>
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function CompanionMemoryStrip({
  locale,
  context,
  facts,
}: {
  locale: import("@/i18n/config").Locale;
  context: import("./ChatContext").TravelContext;
  facts: string[];
}) {
  const isAr = locale === "ar";
  const chips = [
    context.destination ? (isAr ? `الوجهة ${context.destination}` : `Destination ${context.destination}`) : null,
    context.origin ? (isAr ? `من ${context.origin}` : `From ${context.origin}`) : null,
    context.departure_date ? (isAr ? `موعد ${context.departure_date}` : `Date ${context.departure_date}`) : null,
    context.budget_usd ? (isAr ? `ميزانية $${context.budget_usd.toLocaleString()}` : `Budget $${context.budget_usd.toLocaleString()}`) : null,
    context.traveler_type ? (isAr ? travelerLabelAr(context.traveler_type) : travelerLabelEn(context.traveler_type)) : null,
    context.booking_stage ? labelTripLifecycle(context.booking_stage, locale) : null,
  ].filter(Boolean) as string[];

  if (chips.length === 0 && facts.length === 0) return null;

  return (
    <div className="shrink-0 border-b border-white/[0.05] bg-black/20 px-3 py-2">
      <div className="flex max-w-full items-center gap-2 overflow-x-auto scroll-hide">
        <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">
          {isAr ? "تتذكر" : "Memory"}
        </span>
        {chips.slice(0, 6).map((chip) => (
          <span
            key={chip}
            className="shrink-0 rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/45"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}

function TripNowPanel({
  locale,
  context,
  onPrompt,
}: {
  locale: import("@/i18n/config").Locale;
  context: TravelContext;
  onPrompt: (prompt: string, label: string) => void;
}) {
  const isAr = locale === "ar";
  const stage = deriveTripLifecycle(context);
  const actions = getLifecycleActions(context, locale);
  const show =
    Boolean(context.destination || context.departure_date || context.booking_stage) &&
    stage !== "browsing" &&
    stage !== "support";

  useEffect(() => {
    if (!show) return;
    logEvent("ria_companion_hub_viewed", {
      stage,
      destination: context.destination ?? null,
      locale,
    });
  }, [context.destination, locale, show, stage]);

  if (!show) return null;

  const stageLabel = labelTripLifecycle(stage, locale);
  const summary = lifecycleSummary(stage, locale);
  const tripFileItems = getTripFileItems(context, locale);

  return (
    <div className="shrink-0 border-b border-white/[0.05] bg-[#080f1d]/78 px-3 py-2.5">
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] px-3 py-3 shadow-[0_16px_45px_rgba(0,0,0,0.18)]">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-mint/20 bg-brand-mint/10 px-2 py-1 text-[10px] font-semibold text-brand-mint">
                <CheckCircle2 className="h-3 w-3" />
                {isAr ? "رحلتي الآن" : "My trip now"}
              </span>
              <span className="rounded-full border border-white/[0.08] bg-black/20 px-2 py-1 text-[10px] text-white/50">
                {stageLabel}
              </span>
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-white/58">
              {summary}
            </p>
          </div>
          {context.departure_date && (
            <div className="shrink-0 rounded-xl border border-white/[0.08] bg-black/20 px-2.5 py-2 text-center">
              <p className="text-[9px] text-white/30">{isAr ? "الموعد" : "Date"}</p>
              <p className="mt-0.5 text-[11px] font-semibold text-white/65">{context.departure_date}</p>
            </div>
          )}
        </div>

        {tripFileItems.length > 0 && (
          <div className="mt-3 rounded-xl border border-white/[0.06] bg-black/20 p-3">
            <div className="mb-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/30">
              <ClipboardCheck className="h-3 w-3 text-brand-mint/80" />
              {isAr ? "ملف رحلتي" : "Trip file"}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {tripFileItems.map((item) => (
                <div key={item.label} className="rounded-lg border border-white/[0.05] bg-white/[0.025] px-2.5 py-2">
                  <p className="text-[9px] text-white/28">{item.label}</p>
                  <p className="mt-0.5 truncate text-[11px] font-medium text-white/65">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-3 flex gap-2 overflow-x-auto pb-0.5 scroll-hide">
          {actions.slice(0, 3).map((action) => {
            const Icon = lifecycleIcon(action);
            return (
              <button
                key={action.id}
                type="button"
                onClick={() => onPrompt(action.prompt, action.label)}
                className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-full border border-white/[0.09] bg-white/[0.04] px-3 text-[11px] font-medium text-white/58 transition active:scale-[0.98] active:bg-violet-500/[0.15] hover:border-violet-400/25 hover:text-white/85"
              >
                <Icon className="h-3.5 w-3.5 text-violet-200/80" />
                <span>{action.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getTripFileItems(context: TravelContext, locale: import("@/i18n/config").Locale) {
  const isAr = locale === "ar";
  const traveler = context.traveler_type
    ? (isAr ? travelerLabelAr(context.traveler_type) : travelerLabelEn(context.traveler_type))
    : null;
  const services = (context.service_interests ?? []).slice(0, 4).map((service) => serviceLabel(service, isAr)).join(isAr ? "، " : ", ");
  const concerns = (context.concerns ?? []).slice(0, 2).join(isAr ? "، " : ", ");
  return [
    context.destination && { label: isAr ? "الوجهة" : "Destination", value: context.destination },
    context.departure_date && { label: isAr ? "التاريخ" : "Date", value: context.departure_date },
    context.budget_usd && { label: isAr ? "الميزانية" : "Budget", value: `$${context.budget_usd}` },
    traveler && { label: isAr ? "نوع الرحلة" : "Traveler", value: traveler },
    services && { label: isAr ? "الخدمات المهمة" : "Useful services", value: services },
    concerns && { label: isAr ? "ملاحظات ريا" : "Rya notes", value: concerns },
  ].filter(Boolean) as { label: string; value: string }[];
}

function serviceLabel(value: string, isAr: boolean) {
  if (value === "insurance") return isAr ? "التأمين" : "Insurance";
  if (value === "esim") return isAr ? "الشريحة" : "eSIM";
  if (value === "activities") return isAr ? "الجولات" : "Activities";
  if (value === "cars") return isAr ? "السيارة" : "Cars";
  if (value === "trains") return isAr ? "القطارات" : "Trains";
  if (value === "airport_help") return isAr ? "المطار" : "Airport";
  if (value === "translation") return isAr ? "الترجمة" : "Translation";
  if (value === "emergency") return isAr ? "الطوارئ" : "Emergency";
  if (value === "food") return isAr ? "الأكل" : "Food";
  if (value === "compensation") return isAr ? "التعويض" : "Compensation";
  return value;
}

function lifecycleIcon(action: LifecycleAction) {
  if (action.kind === "airport") return Navigation;
  if (action.kind === "translate") return Languages;
  if (action.kind === "image") return Camera;
  if (action.id === "weather-packing") return CloudSun;
  if (action.kind === "safety") return ShieldAlert;
  if (action.kind === "budget") return WalletCards;
  if (action.kind === "data") return Zap;
  if (action.kind === "packing") return Luggage;
  if (action.kind === "transport") return Route;
  if (action.kind === "emergency") return Siren;
  if (action.kind === "food") return Utensils;
  if (action.kind === "family" || action.kind === "romance") return HeartHandshake;
  if (action.kind === "review") return ClipboardCheck;
  if (action.kind === "booking") return Plane;
  return Luggage;
}

function travelerLabelAr(value: string) {
  return value === "family" ? "رحلة عائلية" : value === "couple" ? "زوجين" : value === "solo" ? "منفرد" : value === "business" ? "عمل" : "أصدقاء";
}

function travelerLabelEn(value: string) {
  return value === "family" ? "Family" : value === "couple" ? "Couple" : value === "solo" ? "Solo" : value === "business" ? "Business" : "Friends";
}

// ── Typing Indicator ──────────────────────────────────────────────────────

function TypingIndicator({ isAr }: { isAr: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      role="status"
      aria-live="polite"
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
          {isAr ? "ريا تراجع سياق رحلتك..." : "Rya is checking your trip context..."}
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
  const { sendMessage, travelContext } = useChat();
  const messageContext = message.context ?? travelContext;
  const showMessageActions = !isPostBookingLifecycle(deriveTripLifecycle(messageContext));

  if (message.isLoading) return null; // handled by TypingIndicator

  function submitFeedback(value: "up" | "down") {
    setFeedback(value);
    logEvent("ria_response_feedback", {
      value,
      mode: message.mode ?? "unknown",
      hasSearchData: Boolean(message.searchData),
      messageId: message.id,
      messageExcerpt: message.text.slice(0, 240),
      destination: message.searchData?.intent.destination ?? messageContext.destination ?? null,
      bookingStage: messageContext.booking_stage ?? null,
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

        {isUser && message.queued && (
          <span className="px-1 text-[10px] text-white/28">
            {locale === "ar" ? "بالانتظار، ريا سترد عليها بعد الرسالة الحالية" : "Queued, Rya will answer after the current reply"}
          </span>
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

        {!isUser && message.id !== "welcome" && !message.error && showMessageActions && (
          <QuickActionBar
            locale={locale}
            message={message}
            context={messageContext}
            disabled={false}
            onAction={(text) => void sendMessage(text)}
          />
        )}

        {!isUser && message.id !== "welcome" && !message.error && message.mode !== "search" && (
          <AdviceServiceNudges
            locale={locale}
            message={message}
            context={messageContext}
          />
        )}

        {!isUser && message.id !== "welcome" && !message.error && (
          <div className="flex items-center gap-1 self-start rounded-full border border-white/[0.06] bg-white/[0.03] p-1">
            <button
              type="button"
              onClick={() => submitFeedback("up")}
              aria-label={locale === "ar" ? "رد مفيد" : "Helpful response"}
              className={`flex h-7 items-center justify-center gap-1 rounded-full px-2 text-[10px] transition ${
                feedback === "up"
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "text-white/25 hover:bg-white/[0.06] hover:text-white/60"
              }`}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              <span>{locale === "ar" ? "مفيد" : "Helpful"}</span>
            </button>
            <button
              type="button"
              onClick={() => submitFeedback("down")}
              aria-label={locale === "ar" ? "رد غير مفيد" : "Unhelpful response"}
              className={`flex h-7 items-center justify-center gap-1 rounded-full px-2 text-[10px] transition ${
                feedback === "down"
                  ? "bg-rose-500/20 text-rose-300"
                  : "text-white/25 hover:bg-white/[0.06] hover:text-white/60"
              }`}
            >
              <ThumbsDown className="h-3.5 w-3.5" />
              <span>{locale === "ar" ? "يحتاج تحسين" : "Needs work"}</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function QuickActionBar({
  locale,
  message,
  context,
  disabled,
  onAction,
}: {
  locale: import("@/i18n/config").Locale;
  message: ChatMessage;
  context: TravelContext;
  disabled: boolean;
  onAction: (text: string) => void;
}) {
  const isAr = locale === "ar";
  const destination = message.searchData?.intent.destination ?? context.destination;
  const destinationLabel = destination ?? (isAr ? "وجهتي الحالية" : "my current destination");
  const hasHotelGap =
    message.searchData?.wants.includes("hotels") &&
    (message.searchData.hotels.length === 0);
  const lifecycleActions = getLifecycleActions(context, locale);
  const postBooking = isPostBookingLifecycle(deriveTripLifecycle(context));
  const actions = postBooking
    ? lifecycleActions.map((action) => ({
        icon: lifecycleIcon(action),
        label: action.label,
        prompt: action.prompt,
      }))
    : [
    {
      icon: Plane,
      label: isAr ? "اعمل خطة" : "Make a plan",
      prompt: destination
        ? isAr
          ? `اعمل لي خطة سفر إلى ${destination}`
          : `Make me a trip plan to ${destination}`
        : isAr
          ? "اعمل لي خطة سفر"
          : "Make me a trip plan",
    },
    {
      icon: WalletCards,
      label: isAr ? "احسب الميزانية" : "Estimate budget",
      prompt: destination
        ? isAr
          ? `احسب لي ميزانية رحلة إلى ${destination}`
          : `Estimate a trip budget for ${destination}`
        : isAr
          ? "احسب لي ميزانية رحلة"
          : "Estimate a trip budget",
    },
    {
      icon: Languages,
      label: isAr ? "ترجمة موقف" : "Translate",
      prompt: isAr
        ? `ساعدني في ترجمة موقف سفر في ${destinationLabel}. اسألني عن العبارة أو الصورة أو الموقف ثم أعطني ترجمة طبيعية ومناسبة.`
        : `Help me translate a travel situation in ${destinationLabel}. Ask me for the phrase, image, or situation, then give me a natural practical translation.`,
    },
    {
      icon: Landmark,
      label: isAr ? "مساعدة المطار" : "Airport help",
      prompt: isAr
        ? `ساعدني خطوة بخطوة في المطار لرحلتي إلى ${destinationLabel}: ماذا أفعل أولا، متى أصل، وماذا أجهز؟`
        : `Guide me step by step at the airport for ${destinationLabel}: what to do first, when to arrive, and what to prepare.`,
    },
    {
      icon: ShieldAlert,
      label: isAr ? "تنبيهات الأمان" : "Safety alerts",
      prompt: isAr
        ? `اعطني تنبيهات أمان واحتيال سياحي مهمة في ${destinationLabel} بدون تهويل، مع نصائح عملية قصيرة.`
        : `Give me practical safety and travel scam alerts for ${destinationLabel} without exaggeration, with short next steps.`,
    },
    {
      icon: ShieldCheck,
      label: isAr ? "تأمين" : "Insurance",
      prompt: destination
        ? isAr
          ? `هل أحتاج تأمين سفر إلى ${destination}؟ اشرح لي متى يفيد وما الذي أراجعه قبل الشراء.`
          : `Do I need travel insurance for ${destination}? Explain when it helps and what to check before buying.`
        : isAr
          ? "هل أحتاج تأمين سفر؟ اشرح لي متى يفيد وما الذي أراجعه قبل الشراء."
          : "Do I need travel insurance? Explain when it helps and what to check before buying.",
    },
    {
      icon: Zap,
      label: isAr ? "شريحة eSIM" : "eSIM",
      prompt: destination
        ? isAr
          ? `هل أحتاج شريحة eSIM في ${destination}؟ اقترح لي أفضل طريقة أجهز الإنترنت قبل الوصول.`
          : `Do I need an eSIM for ${destination}? Suggest the best way to prepare mobile data before arrival.`
        : isAr
          ? "هل أحتاج شريحة eSIM للسفر؟ اقترح لي أفضل طريقة أجهز الإنترنت قبل الوصول."
          : "Do I need a travel eSIM? Suggest the best way to prepare mobile data before arrival.",
    },
    {
      icon: hasHotelGap ? HotelIcon : Sparkles,
      label: hasHotelGap
        ? isAr ? "مناطق السكن" : "Stay areas"
        : isAr ? "خطوة تالية" : "Next step",
      prompt: hasHotelGap && destination
        ? isAr
          ? `اقترح لي أفضل مناطق السكن في ${destination} لأن الفنادق غير مربوطة بعد`
          : `Suggest the best areas to stay in ${destination} while live hotels are being connected`
        : isAr
          ? "ما الخطوة التالية لهذه الرحلة؟"
          : "What is the next step for this trip?",
    },
    ];

  return (
    <div className="flex max-w-full gap-2 overflow-x-auto pb-1 scroll-hide">
      {actions.slice(0, 5).map((action, index) => {
        const Icon = action.icon;
        return (
          <button
            key={action.label}
            type="button"
            disabled={disabled}
            onClick={() => {
              logEvent("ria_quick_action_clicked", {
                source: "message_actions",
                label: action.label,
                destination: destination ?? null,
                stage: context.booking_stage ?? contextStageFromMessage(message),
                locale,
              });
              onAction(action.prompt);
            }}
            className={`h-8 shrink-0 items-center gap-1.5 rounded-full border border-white/[0.10] bg-white/[0.04] px-3 text-[11px] font-medium text-white/50 transition hover:border-violet-400/30 hover:bg-violet-500/[0.12] hover:text-white/85 disabled:cursor-not-allowed disabled:opacity-40 ${
              index > 1 ? "hidden sm:inline-flex" : "inline-flex"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            <span>{action.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function contextStageFromMessage(message: ChatMessage) {
  return message.mode ?? null;
}

function AdviceServiceNudges({
  locale,
  message,
  context,
}: {
  locale: import("@/i18n/config").Locale;
  message: ChatMessage;
  context: import("@/lib/ai/schemas/intent").TravelContext;
}) {
  const isAr = locale === "ar";
  const stage = deriveTripLifecycle(context);
  const postBooking = isPostBookingLifecycle(stage);
  const inferredServices = postBooking ? [] : inferServicesFromText(message.text);
  const mergedContext = {
    ...context,
    service_interests: Array.from(new Set([
      ...(context.service_interests ?? []),
      ...inferredServices,
    ])) as import("@/lib/ai/schemas/intent").TravelContext["service_interests"],
  };

  const shouldShow =
    (mergedContext.service_interests?.length ?? 0) > 0 ||
    (!postBooking && Boolean(mergedContext.destination && (mergedContext.booking_stage === "planning" || mergedContext.booking_stage === "ready_to_book")));
  if (!shouldShow) return null;

  const intent = {
    origin: mergedContext.origin,
    destination: mergedContext.destination,
    departure_date: mergedContext.departure_date,
    return_date: mergedContext.return_date,
    adults: mergedContext.adults,
    budget_usd: mergedContext.budget_usd,
    trip_type: mergedContext.trip_type,
    cabin_class: mergedContext.cabin_class,
    notes: mergedContext.concerns?.join(" ") ?? null,
  };

  const recs = getPartnerRecommendations(
    intent,
    {
      destination: mergedContext.destination ?? undefined,
      origin: mergedContext.origin ?? undefined,
      departure_date: mergedContext.departure_date,
      return_date: mergedContext.return_date,
      adults: mergedContext.adults,
      locale,
      subid: "ria_advice",
    },
    2,
    mergedContext,
  ).filter((rec) => rec.partner.category !== "hotels" && rec.partner.category !== "flights");

  if (!recs.length) return null;

  return (
    <div className="w-full max-w-full space-y-2">
      <div className="flex items-center gap-1.5">
        <div className="h-px flex-1 bg-white/[0.06]" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/28">
          {isAr ? "خدمات مفيدة عند الحاجة" : "Useful when needed"}
        </span>
        <div className="h-px flex-1 bg-white/[0.06]" />
      </div>
      <p className="rounded-xl border border-white/[0.06] bg-white/[0.025] px-3 py-2 text-[10px] leading-5 text-white/32">
        {isAr
          ? "ريا لا تعرض روابط عشوائية؛ تظهر خدمة أو خدمتين فقط عندما يكون لها سبب واضح في سياق رحلتك. روابط الشركاء قد تدعم GoTripza بدون زيادة على السعر."
          : "Rya does not show random links; she only surfaces one or two services when there is a clear reason in your trip context. Partner links may support GoTripza at no extra cost."}
      </p>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {recs.slice(0, 2).map((rec) => (
          <UpsellCard
            key={rec.partner.id}
            rec={rec}
            isAr={isAr}
            destination={mergedContext.destination ?? undefined}
          />
        ))}
      </div>
    </div>
  );
}

function inferServicesFromText(text: string): NonNullable<import("@/lib/ai/schemas/intent").TravelContext["service_interests"]> {
  const services: NonNullable<import("@/lib/ai/schemas/intent").TravelContext["service_interests"]> = [];
  if (/تأمين|insurance|medical|coverage|visa/i.test(text)) services.push("insurance");
  if (/esim|e-sim|شريحة|شرائح|انترنت|إنترنت|roaming|data/i.test(text)) services.push("esim");
  if (/أنشطة|نشاط|جولات|تذاكر|activities|tours|tickets/i.test(text)) services.push("activities");
  if (/سيارة|تأجير|car rental|rent a car|drive/i.test(text)) services.push("cars");
  if (/قطار|قطارات|train|rail/i.test(text)) services.push("trains");
  if (/تعويض|تأخير|تأخرت|delayed|cancelled|compensation/i.test(text)) services.push("compensation");
  return services;
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
  const { revealSide, travelContext } = useChat();
  const isAr = locale === "ar";
  const fmt = (n: number) => formatPrice(n, currency, locale);
  const showFlights = data.wants.includes("flights");
  const showHotels = data.wants.includes("hotels");
  const liveHotelsEnabled = process.env.NEXT_PUBLIC_ENABLE_LIVE_HOTELS === "true";
  const hotelOffers = liveHotelsEnabled ? data.hotels : [];

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
          label={isAr ? "🏨 هل تريد أفضل مناطق السكن؟" : "🏨 Want the best stay areas?"}
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
            {liveHotelsEnabled ? (isAr ? "الفنادق" : "Hotels") : (isAr ? "مناطق السكن" : "Stay areas")}
            {hotelOffers.length > 0 && (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] text-emerald-300">
                {hotelOffers.length}
              </span>
            )}
          </p>
          {hotelOffers.length === 0 ? (
            <SearchCTACard
              isAr={isAr}
              icon={<HotelIcon className="h-4 w-4" />}
              title={isAr ? "عروض الفنادق قريباً" : "Live hotel offers coming soon"}
              note={
                isAr
                  ? "مزود الفنادق لم يكتمل ربطه بعد، لذلك لن تعرض ريا أسعاراً كأنها حية. يمكنها الآن اقتراح أفضل الأحياء، مستوى الأسعار المتوقع، ونصائح اختيار الفندق."
                  : "The hotel provider is not fully connected yet, so Rya will not present prices as live inventory. She can still suggest neighborhoods, expected price ranges, and hotel-picking advice."
              }
              btnLabel={isAr ? "قريباً" : "Soon"}
              accent="mint"
              live={false}
            />
          ) : (
            <HotelCards hotels={hotelOffers} nights={nights} fmt={fmt} locale={locale} destination={data.intent.destination ?? ""} currency={currency} searchUrl={data.hotelSearchUrl} dict={dict} />
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
      <SmartChatPartners intent={data.intent} context={travelContext} isAr={isAr} />
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
  context,
  isAr,
}: {
  intent: import("@/lib/ai/schemas/intent").TripIntent;
  context?: import("@/lib/ai/schemas/intent").TravelContext | null;
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

  const recs = getPartnerRecommendations(intent, urlParams, 2, context);
  if (!recs.length) return null;

  // Split into priority groups: essentials (eSIM + insurance) vs extras
  const essentials = recs.filter((r) =>
    r.partner.category === "esim" || r.partner.category === "insurance"
  );
  const extras = recs.filter((r) =>
    r.partner.category !== "esim" && r.partner.category !== "insurance" &&
    r.partner.category !== "hotels" // hotels already shown above
  );
  const selected = [
    ...essentials.slice(0, 1),
    ...extras.slice(0, essentials.length ? 1 : 2),
  ].slice(0, 2);

  if (!selected.length) return null;

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
          {isAr ? "اقتراحات قد تفيدك" : "Helpful next steps"}
        </span>
        <div className="h-px flex-1 bg-white/[0.07]" />
      </div>

      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">
          {isAr ? "لسبب واضح في رحلتك" : "Because it fits this trip"}
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {selected.map((rec) => (
            <UpsellCard key={rec.partner.id} rec={rec} isAr={isAr} destination={intent.destination ?? undefined} />
          ))}
        </div>
      </div>
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
  const resultType = rec.partner.category === "car_rental"
    ? "car_rental"
    : rec.partner.category === "activities"
      ? "activities"
      : rec.partner.category === "insurance"
        ? "insurance"
        : rec.partner.category === "esim"
          ? "esim"
          : rec.partner.category === "trains"
            ? "trains"
            : rec.partner.id === "airhelp"
              ? "compensation"
              : "partner";

  return (
    <a
      href={rec.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        logEvent("affiliate_upsell_clicked", { type: rec.partner.category, partner: rec.partner.id, destination: destination ?? "" });
        void trackClick({
          resultType,
          provider: rec.partner.id,
          destination: destination ?? "trip",
          affiliateUrl: rec.url,
          locale: isAr ? "ar" : "en",
        });
      }}
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
  url?: string; btnLabel: string; accent: "primary" | "mint";
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
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex h-8 shrink-0 items-center justify-center gap-1 rounded-lg px-3 text-xs font-semibold text-white shadow-sm transition hover:scale-105 ${isPrimary ? "bg-gradient-to-r from-brand-primary to-violet-600" : "bg-gradient-to-r from-emerald-500 to-teal-500"}`}
        >
          {btnLabel}
          <ExternalLink className="h-3 w-3" />
        </a>
      ) : (
        <span className={`flex h-8 shrink-0 items-center justify-center rounded-lg px-3 text-xs font-semibold ${isPrimary ? "bg-violet-500/15 text-violet-200" : "bg-emerald-500/15 text-emerald-200"}`}>
          {btnLabel}
        </span>
      )}
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
