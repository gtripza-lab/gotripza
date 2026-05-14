import { Brain, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { AISearchBar } from "./AISearchBar";
import { HeroBackdrop } from "./HeroBackdrop";
import type { Dictionary } from "@/i18n/get-dictionary";

export function Hero({ dict }: { dict: Dictionary }) {
  const proofIcons = [Brain, MessageCircle, ShieldCheck];

  return (
    <section className="relative overflow-hidden">
      <HeroBackdrop />

      <div className="mx-auto max-w-6xl px-6 pb-16 pt-8 sm:pb-32 sm:pt-12 md:pt-16">
        <div className="text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-4 py-1.5 text-xs font-medium text-ink-950/80 backdrop-blur-md shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-brand-deep" />
            {dict.hero.badge}
          </div>

          <h1 className="mt-4 font-display text-[2rem] font-bold leading-[1.05] tracking-tight text-balance text-ink-950 sm:mt-6 sm:text-4xl md:text-6xl lg:text-7xl">
            <span>{dict.hero.title1}</span>
            <br />
            <span className="text-gradient">{dict.hero.title2}</span>
          </h1>

          <p className="mx-auto mt-3 max-w-2xl text-balance text-sm text-ink-950/65 sm:mt-5 sm:text-base md:text-lg">
            {dict.hero.subtitle}
          </p>

          <div className="mx-auto mt-5 grid max-w-3xl gap-2 text-start sm:grid-cols-3 sm:text-center">
            {dict.hero.proof.map((item, index) => {
              const Icon = proofIcons[index] ?? Sparkles;
              return (
                <div
                  key={item}
                  className="flex min-h-12 items-center gap-2 rounded-full border border-white/65 bg-white/55 px-3 py-2 text-xs font-medium text-ink-950/70 shadow-sm backdrop-blur-md sm:justify-center"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-brand-deep" />
                  <span>{item}</span>
                </div>
              );
            })}
          </div>

          <div className="mx-auto mt-6 max-w-3xl sm:mt-10">
            <AISearchBar dict={dict} theme="light" />
          </div>

          <div className="mt-8 text-[11px] tracking-[0.3em] text-brand-deep/70 sm:mt-14">
            {dict.hero.tagline.toUpperCase()}
          </div>
        </div>
      </div>
    </section>
  );
}
