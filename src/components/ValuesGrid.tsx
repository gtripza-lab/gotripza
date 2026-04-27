import { Brain, Sparkles, Zap, Headphones, ShieldCheck, type LucideIcon } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";

export function ValuesGrid({ dict }: { dict: Dictionary }) {
  const items: Array<{ key: keyof Dictionary["values"]["items"]; icon: LucideIcon; tone: string }> = [
    { key: "ai", icon: Brain, tone: "text-brand-primary" },
    { key: "smart", icon: Sparkles, tone: "text-brand-violet" },
    { key: "fast", icon: Zap, tone: "text-amber-300" },
    { key: "support", icon: Headphones, tone: "text-brand-mint" },
    { key: "secure", icon: ShieldCheck, tone: "text-emerald-300" },
  ];

  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <h2 className="mb-10 text-center font-display text-3xl font-bold sm:text-4xl">
        {dict.values.title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {items.map(({ key, icon: Icon, tone }) => {
          const item = dict.values.items[key];
          return (
            <div
              key={key}
              className="glass group rounded-2xl p-6 transition hover:-translate-y-1 hover:shadow-glow"
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 ${tone}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-sm text-white/60">{item.desc}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
