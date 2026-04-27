"use client";
import { motion } from "framer-motion";
import {
  Heart,
  Sparkles,
  Compass,
  ShieldCheck,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";

export function OurValues({ dict }: { dict: Dictionary }) {
  const items: Array<{
    key: keyof Dictionary["ourValues"]["items"];
    icon: LucideIcon;
    tone: string;
  }> = [
    { key: "empathy", icon: Heart, tone: "text-rose-300" },
    { key: "simplicity", icon: Sparkles, tone: "text-brand-violet" },
    { key: "inspiration", icon: Compass, tone: "text-brand-primary" },
    { key: "trust", icon: ShieldCheck, tone: "text-emerald-300" },
    { key: "speed", icon: Zap, tone: "text-amber-300" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <motion.h2
        initial={{ opacity: 0, y: 8 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-12 font-display text-3xl font-bold sm:text-4xl"
      >
        {dict.ourValues.title}
      </motion.h2>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {items.map(({ key, icon: Icon, tone }, i) => {
          const item = dict.ourValues.items[key];
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 transition hover:border-white/10 hover:bg-white/[0.04]"
            >
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ${tone}`}>
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="mt-4 font-display font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-sm text-white/55">{item.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
