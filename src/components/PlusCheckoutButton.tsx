"use client";

import { useState } from "react";
import { ExternalLink, Sparkles } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { CHECKOUT_LINKS } from "@/lib/checkout-links";
import { logEvent } from "@/lib/events";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import { AuthModal } from "@/components/AuthModal";

export function PlusCheckoutButton({
  locale,
  interval,
}: {
  locale: Locale;
  interval: "monthly" | "yearly";
}) {
  const isAr = locale === "ar";
  const [showAuth, setShowAuth] = useState(false);

  async function handleClick() {
    logEvent("companion_purchase_clicked", {
      locale,
      source: "plus_page",
      interval,
      provider: "gumroad",
      price: 19.99,
    });

    const sb = createSupabaseBrowser();
    const { data } = await sb.auth.getSession();

    if (data.session) {
      window.open(CHECKOUT_LINKS.ryaCompanion, "_blank");
    } else {
      // Save pending URL across OAuth redirect
      sessionStorage.setItem("gotripza_companion_pending_url", CHECKOUT_LINKS.ryaCompanion);
      setShowAuth(true);
    }
  }

  return (
    <>
      <button
        onClick={handleClick}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-violet-600 text-sm font-semibold text-white transition hover:scale-[1.01] active:scale-[0.99]"
      >
        <Sparkles className="h-4 w-4" />
        {isAr ? "اشترِ Rya Companion بـ $19.99" : "Buy Rya Companion for $19.99"}
        <ExternalLink className="h-4 w-4 opacity-70" />
      </button>

      <AuthModal open={showAuth} locale={locale} onClose={() => setShowAuth(false)} />
    </>
  );
}
