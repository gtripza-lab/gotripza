"use client";
import { motion } from "framer-motion";
import { Plane, Globe2, BadgeDollarSign } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";

export function StatsBar({ dict }: { dict: Dictionary }) {
  const items = [
    {
      icon: <Plane className="h-5 w-5 text-brand-primary" />,
      count: dict.social.travelersCount,
      label: dict.social.travelers,
    },
    {
      icon: <Globe2 className="h-5 w-5 text-brand-mint" />,
      count: dict.social.destinationsCount,
      label: dict.social.destinations,
    },
    {
      icon: <BadgeDollarSign className="h-5 w-5 text-amber-400" />,
      count: dict.social.savedCount,
      label: dict.social.saved,
    },
  ];

  return (
    <section className="border-y border-white/[0.06] bg-white/[0.02] py-8">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="grid grid-cols-1 gap-6 sm:grid-cols-3"
        >
          {items.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className="flex items-center justify-center gap-4 sm:flex-col sm:gap-2 sm:text-center"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                {item.icon}
              </div>
              <div>
                <div className="font-display text-2xl font-bold text-white">
                  {item.count}
                </div>
                <div className="mt-0.5 text-xs text-white/45">{item.label}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
