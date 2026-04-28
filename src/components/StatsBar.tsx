"use client";
import { motion } from "framer-motion";
import { Users, Globe, Banknote } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";

const icons = [
  <Users key="u" className="h-5 w-5 text-brand-primary" />,
  <Globe key="g" className="h-5 w-5 text-brand-mint" />,
  <Banknote key="b" className="h-5 w-5 text-amber-400" />,
];

export function StatsBar({ dict }: { dict: Dictionary }) {
  const items = [
    { count: dict.social.travelersCount, label: dict.social.travelers, icon: icons[0] },
    { count: dict.social.destinationsCount, label: dict.social.destinations, icon: icons[1] },
    { count: dict.social.savedCount, label: dict.social.saved, icon: icons[2] },
  ];

  return (
    <section className="border-y border-white/[0.06] bg-white/[0.02] py-10">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 gap-8 sm:grid-cols-3"
        >
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
              className="flex flex-col items-center gap-2 text-center"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                {item.icon}
              </div>
              <div className="font-display text-3xl font-bold text-white">
                {item.count}
              </div>
              <div className="text-sm text-white/50">{item.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
