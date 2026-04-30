"use client";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, Star, BadgeCheck, Zap } from "lucide-react";
import Link from "next/link";
import type { Dictionary } from "@/i18n/get-dictionary";

type Props = { dict: Dictionary; locale: "ar" | "en" };

// Each badge links to a page that proves the claim:
// "Verified Partner"   → /about   (our partner network)
// "SSL Encrypted"      → /privacy  (data protection details)
// "No Hidden Fees"     → /disclosure (how we earn / no surcharge)
// "Certified Partners" → /about   (Travelpayouts partner info)
const TRUST_BADGES = [
  {
    icon: <ShieldCheck className="h-5 w-5 text-emerald-400" />,
    key: "verified" as const,
    bg: "bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-400/40 hover:bg-emerald-500/15",
    pageKey: "/about",
  },
  {
    icon: <Lock className="h-5 w-5 text-sky-400" />,
    key: "secure" as const,
    bg: "bg-sky-500/10 border-sky-500/20 hover:border-sky-400/40 hover:bg-sky-500/15",
    pageKey: "/privacy",
  },
  {
    icon: <BadgeCheck className="h-5 w-5 text-brand-violet" />,
    key: "noFees" as const,
    bg: "bg-brand-violet/10 border-brand-violet/20 hover:border-brand-violet/40 hover:bg-brand-violet/15",
    pageKey: "/disclosure",
  },
  {
    icon: <Zap className="h-5 w-5 text-amber-400" />,
    key: "partners" as const,
    bg: "bg-amber-500/10 border-amber-500/20 hover:border-amber-400/40 hover:bg-amber-500/15",
    pageKey: "/about",
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

        {/* Trust badges row — each is a real link */}
        <div className="mb-14 flex flex-wrap justify-center gap-3">
          {TRUST_BADGES.map(({ icon, key, bg, pageKey }, i) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <Link
                href={`/${locale}${pageKey}`}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium text-white/80 backdrop-blur-md transition ${bg}`}
              >
                {icon}
                {trust[key]}
              </Link>
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
