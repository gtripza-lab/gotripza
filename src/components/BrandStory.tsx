"use client";
import { motion } from "framer-motion";
import { MessageSquare, BarChart3, ArrowUpRight } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";

const STEPS_AR = [
  {
    icon: MessageSquare,
    num: "١",
    title: "صف رحلتك",
    desc: "اكتب وجهتك وتواريخك وميزانيتك بكلماتك — بالعربي أو الإنجليزي.",
  },
  {
    icon: BarChart3,
    num: "٢",
    title: "نقارن المئات",
    desc: "GoTripza يفحص أسعار +١٨٠ شركة طيران وآلاف الفنادق في الوقت الفعلي.",
  },
  {
    icon: ArrowUpRight,
    num: "٣",
    title: "احجز بثقة",
    desc: "اختر الخيار الأنسب وأكمل حجزك مباشرة عند الشريك — بدون رسوم إضافية.",
  },
];

const STEPS_EN = [
  {
    icon: MessageSquare,
    num: "1",
    title: "Describe your trip",
    desc: "Type your destination, dates, and budget — in plain language.",
  },
  {
    icon: BarChart3,
    num: "2",
    title: "We compare hundreds",
    desc: "GoTripza scans 180+ airlines and thousands of hotels in real time.",
  },
  {
    icon: ArrowUpRight,
    num: "3",
    title: "Book with confidence",
    desc: "Pick the best option and complete your booking directly — no extra fees.",
  },
];

export function BrandStory({ dict }: { dict: Dictionary }) {
  const isAr = dict.hero.tagline.includes("ثوانٍ") || dict.hero.tagline.includes("أفضل");
  const steps = isAr ? STEPS_AR : STEPS_EN;

  return (
    <section className="relative overflow-hidden border-y border-white/[0.05] bg-white/[0.015]">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="mb-14 text-center"
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-primary/70">
            {isAr ? "كيف يعمل" : "How it works"}
          </p>
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            {dict.brandStory.title}
          </h2>
        </motion.div>

        <div className="relative grid gap-px sm:grid-cols-3">
          {/* connector line */}
          <div className="pointer-events-none absolute inset-x-0 top-[2.2rem] hidden h-px bg-gradient-to-r from-transparent via-white/10 to-transparent sm:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex flex-col items-center gap-5 px-6 py-10 text-center"
            >
              <div className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md">
                <step.icon className="h-6 w-6 text-brand-primary" strokeWidth={1.5} />
                <span className="absolute -end-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-brand-primary text-[10px] font-bold text-white">
                  {step.num}
                </span>
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-3"
        >
          {dict.brandStory.highlights.map((tag, i) => (
            <span
              key={i}
              className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-sm font-medium text-white/70 backdrop-blur-md"
            >
              <span className="me-1.5 h-1.5 w-1.5 rounded-full bg-brand-primary" />
              {tag}
            </span>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
