"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "./Logo";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { cn } from "@/lib/utils";

export function Navbar({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const items = [
    { label: dict.nav.flights, href: "#flights" },
    { label: dict.nav.hotels, href: "#hotels" },
    { label: dict.nav.packages, href: "#packages" },
    { label: dict.nav.explore, href: "#explore" },
  ];

  // Switch nav theme based on scroll position so it reads well over both
  // the light hero and the dark sections below.
  const [overDark, setOverDark] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      // hero is roughly 90vh; flip past 70% of it
      const threshold = window.innerHeight * 0.7;
      setOverDark(window.scrollY > threshold);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href={`/${locale}`}>
          <Logo />
        </Link>
        <nav
          className={cn(
            "hidden items-center gap-1 rounded-full px-2 py-1.5 backdrop-blur-md md:flex transition-colors",
            overDark
              ? "border border-white/10 bg-white/[0.04]"
              : "border border-white/70 bg-white/60 shadow-sm",
          )}
        >
          {items.map((it) => (
            <a
              key={it.href}
              href={it.href}
              className={cn(
                "rounded-full px-4 py-1.5 text-sm transition",
                overDark
                  ? "text-white/80 hover:bg-white/10 hover:text-white"
                  : "text-ink-950/70 hover:bg-ink-950/5 hover:text-ink-950",
              )}
            >
              {it.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <LocaleSwitcher current={locale} overDark={overDark} />
          <button
            className={cn(
              "hidden rounded-full px-4 py-2 text-sm md:inline-flex",
              overDark
                ? "text-white/80 hover:text-white"
                : "text-ink-950/70 hover:text-ink-950",
            )}
          >
            {dict.nav.signin}
          </button>
          <button className="btn-primary !py-2 !text-sm">{dict.nav.getStarted}</button>
        </div>
      </div>
    </header>
  );
}
