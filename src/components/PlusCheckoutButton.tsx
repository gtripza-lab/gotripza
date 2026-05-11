"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { logEvent } from "@/lib/events";

export function PlusCheckoutButton({
  locale,
  interval,
}: {
  locale: Locale;
  interval: "monthly" | "yearly";
}) {
  const isAr = locale === "ar";
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function checkout() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/companion/trial", { method: "POST" });
      if (!res.ok) {
        setMessage(isAr ? "تعذر تفعيل التجربة الآن." : "Could not activate the trial right now.");
        return;
      }
      const json = (await res.json()) as { daysRemaining?: number };
      logEvent("companion_trial_started", { locale, source: "plus_page", interval, daysRemaining: json.daysRemaining ?? null });
      window.location.href = `/${locale}/search?source=companion-trial`;
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={checkout}
        disabled={loading}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-violet-600 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {isAr ? "جرّب Rya Companion مجاناً" : "Try Rya Companion free"}
      </button>
      {message && <p className="mt-2 text-xs leading-5 text-amber-300/80">{message}</p>}
    </div>
  );
}
