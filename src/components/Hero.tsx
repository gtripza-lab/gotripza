import { Brain, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { AISearchBar } from "./AISearchBar";
import { HeroBackdrop } from "./HeroBackdrop";
import { Logo, LogoMark } from "./Logo";
import type { Dictionary } from "@/i18n/get-dictionary";

export function Hero({ dict }: { dict: Dictionary }) {
  const proofIcons = [Brain, MessageCircle, ShieldCheck];

  return (
    <section className="relative overflow-hidden">
      <HeroBackdrop />

      <div className="mx-auto max-w-6xl px-6 pb-16 pt-8 sm:pb-32 sm:pt-12 md:pt-16">
        <div className="text-center">
          <div className="mx-auto mb-5 flex justify-center">
            <Logo size="lg" />
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-brand-mint" />
            {dict.hero.badge}
          </div>

          <h1 className="mx-auto mt-4 max-w-4xl font-display text-[2.4rem] font-black leading-[0.98] tracking-tight text-balance text-white sm:mt-6 sm:text-5xl md:text-7xl lg:text-8xl">
            <span>{dict.hero.title1}</span>
            <br />
            <span className="text-gradient">{dict.hero.title2}</span>
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-balance text-sm leading-7 text-white/62 sm:mt-5 sm:text-base md:text-lg">
            {dict.hero.subtitle}
          </p>

          <div className="mx-auto mt-5 grid max-w-3xl gap-2 text-start sm:grid-cols-3 sm:text-center">
            {dict.hero.proof.map((item, index) => {
              const Icon = proofIcons[index] ?? Sparkles;
              return (
                <div
                  key={item}
                  className="flex min-h-12 items-center gap-2 rounded-full border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-medium text-white/68 shadow-sm backdrop-blur-md sm:justify-center"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-brand-mint" />
                  <span>{item}</span>
                </div>
              );
            })}
          </div>

          <div className="relative mx-auto mt-6 max-w-3xl sm:mt-10">
            <div className="pointer-events-none absolute -inset-5 rounded-[2rem] bg-gradient-to-r from-brand-primary/18 via-brand-violet/12 to-brand-mint/16 blur-2xl" />
            <AISearchBar dict={dict} theme="dark" />
          </div>

          <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-[10px] tracking-[0.26em] text-white/45 backdrop-blur sm:mt-14">
            <LogoMark size={16} />
            {dict.hero.tagline.toUpperCase()}
          </div>
        </div>
      </div>
    </section>
  );
}
