import { Brain, Sparkles, Zap, Banknote, CreditCard, type LucideIcon } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";

const ICONS: Record<string, LucideIcon> = {
  ai: Brain,
  smart: Sparkles,
  fast: Zap,
  support: Banknote,
  secure: CreditCard,
};

const TONES: Record<string, { icon: string; bar: string }> = {
  ai: { icon: "text-brand-primary", bar: "bg-brand-primary" },
  smart: { icon: "text-brand-violet", bar: "bg-brand-violet" },
  fast: { icon: "text-amber-300", bar: "bg-amber-300" },
  support: { icon: "text-brand-mint", bar: "bg-brand-mint" },
  secure: { icon: "text-emerald-300", bar: "bg-emerald-300" },
};

export function ValuesGrid({ dict }: { dict: Dictionary }) {
  const keys = ["ai", "smart", "fast", "support", "secure"] as const;

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-12 text-center">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-primary/70">
          {dict.values.title === "لماذا GoTripza؟" ? "الميزة" : "The Advantage"}
        </p>
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          {dict.values.title}
        </h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {keys.map((key) => {
          const item = dict.values.items[key];
          const Icon = ICONS[key];
          const { icon: iconTone, bar } = TONES[key];
          return (
            <div
              key={key}
              className="group relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.025] p-6 transition hover:border-white/10 hover:bg-white/[0.05]"
            >
              <span
                className={`absolute inset-x-0 top-0 h-px ${bar} opacity-0 transition-opacity duration-300 group-hover:opacity-60`}
              />
              <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.04] ${iconTone}`}>
                <Icon className="h-5 w-5" strokeWidth={1.5} />
              </div>
              <h3 className="mt-4 font-display text-[15px] font-semibold leading-snug">
                {item.title}
              </h3>
              <p className="mt-1.5 text-xs leading-relaxed text-white/50">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
