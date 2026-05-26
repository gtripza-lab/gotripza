"use client";

import { ExternalLink, Sparkles } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { CHECKOUT_LINKS } from "@/lib/checkout-links";
import { logEvent } from "@/lib/events";

export function PlusCheckoutButton({
  locale,
  interval,
}: {
  locale: Locale;
  interval: "monthly" | "yearly";
}) {
  const isAr = locale === "ar";

  return (
    <a
      href={CHECKOUT_LINKS.ryaCompanion}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        logEvent("companion_checkout_clicked", {
          locale,
          source: "plus_page",
          interval,
          provider: "gumroad",
          price: 19.99,
        })
      }
      className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-violet-600 text-sm font-semibold text-white transition hover:scale-[1.01]"
    >
      <Sparkles className="h-4 w-4" />
      {isAr ? "اشترِ Rya Companion بـ $19.99" : "Buy Rya Companion for $19.99"}
      <ExternalLink className="h-4 w-4 opacity-70" />
    </a>
  );
}
