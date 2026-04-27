"use client";
import { motion } from "framer-motion";
import { LogoMark } from "./Logo";
import type { Dictionary } from "@/i18n/get-dictionary";

export function BrandStory({ dict }: { dict: Dictionary }) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-24 md:grid-cols-2 md:items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="relative flex items-center justify-center"
        >
          <div className="relative">
            <div className="absolute -inset-12 rounded-full bg-brand-primary/20 blur-3xl" />
            <div className="relative animate-float">
              <LogoMark size={220} />
            </div>
            <div className="mt-6 text-center font-display text-5xl font-bold">
              Go<span className="text-gradient">Tripza</span>
            </div>
            <div className="mt-2 text-center text-sm tracking-[0.2em] text-brand-primary">
              {dict.hero.tagline.toUpperCase()}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h2 className="font-display text-4xl font-bold sm:text-5xl">
            {dict.brandStory.title}
          </h2>
          <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/70">
            {dict.brandStory.body}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {dict.brandStory.highlights.map((line, i) => (
              <span
                key={i}
                className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-4 py-2 font-display text-sm font-medium backdrop-blur-md"
              >
                <span className="text-gradient">{line}</span>
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
