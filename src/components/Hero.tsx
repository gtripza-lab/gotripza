"use client";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { AISearchBar } from "./AISearchBar";
import { HeroBackdrop } from "./HeroBackdrop";
import type { Dictionary } from "@/i18n/get-dictionary";

export function Hero({ dict }: { dict: Dictionary }) {
  return (
    <section className="relative overflow-hidden">
      <HeroBackdrop />

      <div className="mx-auto max-w-6xl px-6 pb-16 pt-8 sm:pb-32 sm:pt-12 md:pt-16">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-1.5 text-xs font-medium text-ink-950/80 backdrop-blur-md shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-brand-deep" />
            {dict.hero.badge}
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="mt-4 font-display text-[2rem] font-bold leading-[1.05] tracking-tight text-balance text-ink-950 sm:mt-6 sm:text-4xl md:text-6xl lg:text-7xl"
          >
            <span>{dict.hero.title1}</span>
            <br />
            <span className="text-gradient">{dict.hero.title2}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mx-auto mt-3 max-w-2xl text-balance text-sm text-ink-950/65 sm:mt-5 sm:text-base md:text-lg"
          >
            {dict.hero.subtitle}
          </motion.p>

          <div className="mx-auto mt-6 max-w-3xl sm:mt-10">
            <AISearchBar dict={dict} theme="light" />
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-8 text-[11px] tracking-[0.3em] text-brand-deep/70 sm:mt-14"
          >
            {dict.hero.tagline.toUpperCase()}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
