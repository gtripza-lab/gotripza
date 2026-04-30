"use client";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, Sparkles, ArrowRight, Loader2, Clock, X } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { useSearch } from "./search/SearchContext";
import { cn } from "@/lib/utils";

const LS_KEY = "gotripza_recent_searches";
const MAX_RECENT = 4;

function loadRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function saveRecent(q: string) {
  try {
    const prev = loadRecent().filter((r) => r !== q);
    localStorage.setItem(LS_KEY, JSON.stringify([q, ...prev].slice(0, MAX_RECENT)));
  } catch { /* swallow */ }
}

function clearRecent() {
  try { localStorage.removeItem(LS_KEY); } catch { /* swallow */ }
}

type Theme = "dark" | "light";

// ── Voice search helpers ─────────────────────────────────────────────────
// SpeechRecognition is a browser API not included in TypeScript's default
// lib. Declare the minimal interface we actually use.
interface ISpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  abort(): void;
  onstart: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onresult: ((this: ISpeechRecognition, ev: ISpeechRecognitionEvent) => void) | null;
  onerror:  ((this: ISpeechRecognition, ev: Event) => void) | null;
  onend:    ((this: ISpeechRecognition, ev: Event) => void) | null;
}

interface ISpeechRecognitionEvent extends Event {
  results: { 0: { 0: { transcript: string } } };
}

interface ISpeechRecognitionConstructor {
  new (): ISpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: ISpeechRecognitionConstructor;
    webkitSpeechRecognition?: ISpeechRecognitionConstructor;
  }
}

export function AISearchBar({
  dict,
  theme = "dark",
}: {
  dict: Dictionary;
  theme?: Theme;
}) {
  const { query, setQuery, status, search } = useSearch();
  const loading = status === "loading";
  const isLight = theme === "light";
  const [recent, setRecent] = useState<string[]>([]);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const isAr = typeof document !== "undefined" && document.documentElement.dir === "rtl";

  useEffect(() => {
    setRecent(loadRecent());
  }, []);

  // ── Cleanup voice on unmount ───────────────────────────────────────────
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
    };
  }, []);

  const handleSearch = (q: string) => {
    saveRecent(q);
    setRecent(loadRecent());
    search(q);
  };

  const handleVoice = () => {
    const SR: ISpeechRecognitionConstructor | undefined =
      typeof window !== "undefined"
        ? window.SpeechRecognition ?? window.webkitSpeechRecognition
        : undefined;

    if (!SR) {
      // Graceful degradation — browser doesn't support voice
      alert(isAr ? "المتصفح لا يدعم البحث الصوتي" : "Your browser doesn't support voice search");
      return;
    }

    if (isListening) {
      recognitionRef.current?.abort();
      setIsListening(false);
      return;
    }

    const rec = new SR();
    recognitionRef.current = rec;
    rec.lang = isAr ? "ar-SA" : "en-US";
    rec.continuous = false;
    rec.interimResults = false;

    rec.onstart = () => setIsListening(true);

    rec.onresult = (e: ISpeechRecognitionEvent) => {
      const transcript = e.results[0][0].transcript;
      setQuery(transcript);
      setIsListening(false);
      // Auto-search after voice input
      handleSearch(transcript);
    };

    rec.onerror = () => setIsListening(false);
    rec.onend   = () => setIsListening(false);

    rec.start();
  };

  return (
    <div className="w-full">
      <motion.form
        onSubmit={(e) => {
          e.preventDefault();
          handleSearch(query);
        }}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={cn(
          "group relative flex items-center gap-2 rounded-2xl p-2 transition-shadow",
          isLight
            ? "glass-light-strong focus-within:shadow-[0_16px_50px_rgba(90,108,255,0.2)]"
            : "glass-strong shadow-card focus-within:shadow-glow",
        )}
      >
        <Sparkles
          className={cn(
            "ms-3 h-5 w-5 shrink-0",
            isLight ? "text-brand-deep" : "text-brand-primary",
          )}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={dict.hero.placeholder}
          disabled={loading}
          className={cn(
            "min-w-0 flex-1 bg-transparent px-2 py-3 text-base focus:outline-none",
            isLight
              ? "text-ink-950 placeholder:text-ink-950/40"
              : "text-white placeholder:text-white/40",
          )}
        />
        <button
          type="button"
          onClick={handleVoice}
          aria-label={dict.hero.voice}
          title={isListening ? (isAr ? "إيقاف الاستماع" : "Stop listening") : dict.hero.voice}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition",
            isListening
              ? "animate-pulse bg-rose-500/20 text-rose-400"
              : isLight
              ? "text-ink-950/60 hover:bg-ink-950/5 hover:text-ink-950"
              : "text-white/60 hover:bg-white/10 hover:text-white",
          )}
        >
          {isListening
            ? <MicOff className="h-4 w-4" />
            : <Mic className="h-4 w-4" />}
        </button>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="btn-primary !rounded-xl !px-5 !py-2.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <span className="hidden sm:inline">{dict.hero.cta}</span>
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </>
          )}
        </button>
      </motion.form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="mt-5 flex flex-wrap items-center gap-2"
      >
        <span
          className={cn(
            "text-sm",
            isLight ? "text-ink-950/55" : "text-white/50",
          )}
        >
          {dict.hero.suggestions.title}
        </span>
        {dict.hero.suggestions.items.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => {
              setQuery(item);
              handleSearch(item);
            }}
            className={isLight ? "chip-light" : "chip"}
          >
            {item}
          </button>
        ))}
      </motion.div>

      {/* Recent searches */}
      <AnimatePresence>
        {recent.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.25 }}
            className="mt-3 flex flex-wrap items-center gap-2"
          >
            <Clock className={cn("h-3.5 w-3.5 shrink-0", isLight ? "text-ink-950/35" : "text-white/30")} />
            <span className={cn("text-xs", isLight ? "text-ink-950/40" : "text-white/35")}>
              {isAr ? "بحث سابق:" : "Recent:"}
            </span>
            {recent.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setQuery(r);
                  handleSearch(r);
                }}
                className={cn(
                  "max-w-[180px] truncate rounded-full border px-3 py-1 text-xs transition",
                  isLight
                    ? "border-ink-950/10 bg-ink-950/[0.03] text-ink-950/60 hover:bg-ink-950/[0.06]"
                    : "border-white/10 bg-white/[0.04] text-white/50 hover:bg-white/[0.08]",
                )}
              >
                {r}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { clearRecent(); setRecent([]); }}
              aria-label={isAr ? "مسح السجل" : "Clear history"}
              className={cn("rounded-full p-1 transition", isLight ? "text-ink-950/30 hover:text-ink-950/60" : "text-white/25 hover:text-white/50")}
            >
              <X className="h-3 w-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
