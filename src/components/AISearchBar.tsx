"use client";
import { motion } from "framer-motion";
import { Mic, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import { useSearch } from "./search/SearchContext";
import { cn } from "@/lib/utils";

type Theme = "dark" | "light";

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

  return (
    <div className="w-full">
      <motion.form
        onSubmit={(e) => {
          e.preventDefault();
          search(query);
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
          aria-label={dict.hero.voice}
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
            isLight
              ? "text-ink-950/60 hover:bg-ink-950/5 hover:text-ink-950"
              : "text-white/60 hover:bg-white/10 hover:text-white",
          )}
        >
          <Mic className="h-4 w-4" />
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
              search(item);
            }}
            className={isLight ? "chip-light" : "chip"}
          >
            {item}
          </button>
        ))}
      </motion.div>
    </div>
  );
}
