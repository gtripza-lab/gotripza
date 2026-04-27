"use client";
import { motion } from "framer-motion";
import {
  Search,
  Mic,
  Plane,
  Hotel,
  Star,
  Calendar,
  ChevronLeft,
  Sparkles,
} from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";

export function MobileMockups({ dict }: { dict: Dictionary }) {
  const m = dict.mockups;
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">
            {m.title}
          </h2>
          <p className="mt-3 text-white/60">{m.subtitle}</p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          <PhoneFrame delay={0}>
            <SearchScreen dict={dict} />
          </PhoneFrame>
          <PhoneFrame delay={0.15}>
            <TripScreen dict={dict} />
          </PhoneFrame>
          <PhoneFrame delay={0.3}>
            <ConfirmScreen dict={dict} />
          </PhoneFrame>
        </div>
      </div>
    </section>
  );
}

function PhoneFrame({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay }}
      className="relative mx-auto w-full max-w-[300px]"
    >
      <div className="absolute -inset-4 rounded-[3rem] bg-gradient-to-br from-brand-primary/30 via-brand-violet/20 to-brand-mint/20 blur-2xl" />
      <div className="relative rounded-[2.5rem] border border-white/10 bg-ink-950/80 p-2 shadow-card backdrop-blur-md">
        <div className="rounded-[2.1rem] bg-gradient-to-b from-ink-900 to-ink-950 p-3">
          <div className="mb-2 flex items-center justify-between px-3 text-[10px] text-white/60">
            <span>9:41</span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/60" />
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/60" />
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-white/60" />
            </span>
          </div>
          {children}
        </div>
      </div>
    </motion.div>
  );
}

function SearchScreen({ dict }: { dict: Dictionary }) {
  const s = dict.mockups.screens.search;
  return (
    <div className="rounded-[1.8rem] bg-ink-950 p-4 text-white">
      <ChevronLeft className="h-4 w-4 text-white/60" />
      <div className="mt-3 text-sm font-medium">
        {s.greet} <span className="ms-1">👋</span>
      </div>
      <div className="mt-1 font-display text-xl font-bold leading-tight">
        {s.prompt}
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 p-2.5">
        <Search className="h-3.5 w-3.5 text-white/40" />
        <span className="flex-1 text-[11px] text-white/40">{s.input}</span>
        <Mic className="h-3.5 w-3.5 text-brand-primary" />
      </div>

      <div className="mt-4 text-[11px] font-semibold text-white/70">
        {s.popular}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <DestinationChip name={s.place1} sub={s.place1Sub} hue="from-amber-500/40 to-rose-500/40" />
        <DestinationChip name={s.place2} sub={s.place2Sub} hue="from-sky-400/40 to-indigo-500/40" />
      </div>

      <div className="mt-4 text-[11px] font-semibold text-white/70">{s.ai}</div>
      <div className="mt-2 overflow-hidden rounded-2xl border border-white/10">
        <div className="relative h-24 bg-gradient-to-br from-amber-600/60 via-orange-700/40 to-purple-900/60">
          <div className="absolute end-2 top-2 inline-flex items-center gap-1 rounded-full bg-black/40 px-2 py-0.5 text-[9px] backdrop-blur">
            <Sparkles className="h-2.5 w-2.5 text-brand-mint" /> AI
          </div>
          <div className="absolute inset-x-2 bottom-2">
            <div className="text-sm font-bold">{s.feature}</div>
            <div className="text-[10px] text-white/70">{s.featureSub}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DestinationChip({
  name,
  sub,
  hue,
}: {
  name: string;
  sub: string;
  hue: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${hue} p-2 h-16`}>
      <div className="absolute inset-x-2 bottom-1.5">
        <div className="text-[11px] font-bold leading-tight">{name}</div>
        <div className="text-[9px] text-white/70">{sub}</div>
      </div>
    </div>
  );
}

function TripScreen({ dict }: { dict: Dictionary }) {
  const t = dict.mockups.screens.trip;
  return (
    <div className="rounded-[1.8rem] bg-paper p-4 text-ink-950">
      <div className="flex items-center justify-between">
        <ChevronLeft className="h-4 w-4 text-ink-950/60" />
        <span className="text-[10px] text-ink-950/40">···</span>
      </div>
      <div className="mt-3 font-display text-base font-bold">{t.title}</div>
      <div className="mt-0.5 text-[10px] text-ink-950/60">{t.dates}</div>

      <div className="mt-3 flex gap-1 rounded-full bg-ink-950/5 p-1 text-[10px]">
        <span className="flex-1 rounded-full bg-white px-2 py-1 text-center font-semibold shadow-sm">
          {t.tabBest}
        </span>
        <span className="flex-1 px-2 py-1 text-center text-ink-950/50">
          {t.tabFastest}
        </span>
        <span className="flex-1 px-2 py-1 text-center text-ink-950/50">
          {t.tabCheapest}
        </span>
      </div>

      <div className="mt-3 rounded-2xl border border-ink-950/5 bg-white p-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold">
            <Plane className="h-3 w-3 text-brand-primary" /> {t.flight}
          </span>
          <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-semibold text-amber-700">
            Best
          </span>
        </div>
        <div className="mt-2 text-[11px] font-bold">{t.flightTime}</div>
        <div className="mt-0.5 flex items-center justify-between text-[10px] text-ink-950/60">
          <span>{t.flightDirect}</span>
          <span className="font-display text-base font-bold text-ink-950">$320</span>
        </div>
      </div>

      <div className="mt-2 rounded-2xl border border-ink-950/5 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-1 text-[11px] font-semibold">
          <Hotel className="h-3 w-3 text-brand-mint" /> {t.hotel}
        </div>
        <div className="mt-1 text-[11px] font-bold">{t.hotelName}</div>
        <div className="mt-1 flex items-center justify-between text-[10px] text-ink-950/60">
          <span className="inline-flex items-center gap-0.5">
            <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
            {t.rating}
          </span>
          <span className="font-display text-base font-bold text-ink-950">$420</span>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <div>
          <div className="text-[9px] text-ink-950/60">{t.total}</div>
          <div className="font-display text-lg font-bold">$740</div>
        </div>
        <button className="rounded-full bg-gradient-to-r from-brand-primary to-brand-deep px-4 py-2 text-[10px] font-bold text-white">
          {t.book}
        </button>
      </div>
    </div>
  );
}

function ConfirmScreen({ dict }: { dict: Dictionary }) {
  const c = dict.mockups.screens.confirm;
  return (
    <div className="rounded-[1.8rem] bg-paper p-4 text-ink-950">
      <ChevronLeft className="h-4 w-4 text-ink-950/60" />
      <div className="mt-3 font-display text-base font-bold leading-tight">
        {c.title} <span>🎉</span>
      </div>
      <div className="mt-2 text-[9px] text-ink-950/60">{c.ref}</div>
      <div className="text-[11px] font-mono">TR212345678</div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 rounded-2xl border border-ink-950/5 bg-white p-3 shadow-sm">
          <Plane className="h-3.5 w-3.5 text-brand-primary" />
          <div className="flex-1">
            <div className="text-[11px] font-semibold">{c.flight}</div>
            <div className="text-[10px] text-ink-950/60">JED → DXB</div>
            <div className="text-[10px] text-ink-950/60">May 26</div>
          </div>
          <span className="text-[10px] font-semibold text-brand-primary">
            {c.view}
          </span>
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-ink-950/5 bg-white p-3 shadow-sm">
          <Hotel className="h-3.5 w-3.5 text-brand-mint" />
          <div className="flex-1">
            <div className="text-[11px] font-semibold">{c.hotelLabel}</div>
            <div className="text-[10px] text-ink-950/60">Modern Downtown</div>
            <div className="text-[10px] text-ink-950/60">May 26 - 31</div>
          </div>
          <span className="text-[10px] font-semibold text-brand-primary">
            {c.view}
          </span>
        </div>
      </div>

      <button className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-2xl border border-ink-950/10 bg-white py-2.5 text-[11px] font-semibold">
        <Calendar className="h-3 w-3" />
        {c.calendar}
      </button>

      <div className="mt-4 text-center text-[10px] text-ink-950/60">
        {c.wish}
      </div>
    </div>
  );
}
