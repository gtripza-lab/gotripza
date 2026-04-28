"use client";
import { motion } from "framer-motion";
import { TrendingDown, Banknote, LayoutGrid, Lock, Timer, type LucideIcon } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";

const ICONS: Record<string, LucideIcon> = {
  empathy: TrendingDown,
  simplicity: Banknote,
  inspiration: LayoutGrid,
  trust: Lock,
  speed: Timer,
};

const TONES: Record<string, string> = {
  empathy: "text-brand-primary",
  simplicity: "text-amber-300",
  inspiration: "text-brand-mint",
  trust: "text-emerald-300",
  speed: "text-brand-violet",
};

export function OurValues({ dict }: { dict: Dictionary }) {
  const keys = ["empathy", "simplicity", "inspiration", "trust", "speed"] as const;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-primary/70">
          {dict.ourValues.title === "ما نضمنه لك" ? "ضماناتنا" : "Our Promise"}
        </p>
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          {dict.ourValues.title}
        </h2>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {keys.map((key, i) => {
          const item = dict.ourValues.items[key];
          const Icon = ICONS[key];
          const tone = TONES[key];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="group rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition hover:border-white/10 hover:bg-white/[0.04]"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.05] ${tone}`}>
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="mt-4 font-display text-[15px] font-semibold leading-snug">
                {item.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-white/50">{item.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
