"use client";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Star, BadgeCheck, Zap } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";

type Props = { dict: Dictionary; locale: "ar" | "en" };

const TRUST_BADGES = [
  {
    icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />,
    key: "verified" as const,
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  {
    icon: <Lock className="h-5 w-5 text-sky-400" />,
    key: "secure" as const,
    bg: "bg-sky-500/10 border-sky-500/20",
  },
  {
    icon: <BadgeCheck className="h-5 w-5 text-purple-400" />,
    key: "noFees" as const,
    bg: "bg-purple-500/10 border-purple-500/20",
  },
  {
    icon: <Zap className="h-5 w-5 text-amber-400" />,
    key: "partners" as const,
    bg: "bg-amber-500/10 border-amber-500/20",
  },
];

export function TrustSection({ dict, locale }: Props) {
  const isAr = locale === "ar";
  const trust = dict.trust;
  const testimonials = trust.testimonials;

  return (
    <section
      dir={isAr ? "rtl" : "ltr"}
      className="relative overflow-hidden py-20"
    >
      {/* Subtle background glow */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-brand-primary/[0.03] to-transparent" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-10 text-center"
        >
          <h2 className="font-display text-2xl font-bold text-white md:text-3xl">
            {trust.title}
          </h2>
        </motion.div>

        {/* Trust badges row */}
        <div className="mb-14 flex flex-wrap justify-center gap-3">
          {TRUST_BADGES.map(({ icon, key, bg }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
              className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-md ${bg}`}
            >
              {icon}
              {trust[key]}
            </motion.div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="grid gap-5 sm:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-sm"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, si) => (
                  <Star key={si} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="flex-1 text-sm leading-relaxed text-white/70">
                &ldquo;{t.text}&rdquo;
              </p>

              {/* Author */}
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-primary/40 to-brand-deep/40 text-xs font-bold text-white">
                  {t.name.slice(0, 1)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/80">{t.name}</p>
                  <p className="text-[11px] text-white/40">{t.city}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
