"use client";

import { useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { logEvent } from "@/lib/events";
import { AuthModal } from "@/components/AuthModal";

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
  const [authOpen, setAuthOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("activate") === "companion") void checkout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkout() {
    setLoading(true);
    setMessage("");
    try {
      const res = await fetch("/api/companion/trial", { method: "POST" });
      if (res.status === 401) {
        setMessage(isAr ? "سجّل دخولك أولاً حتى نفعّل Rya Companion ونحفظها في حسابك." : "Sign in first so Rya Companion can be activated and saved to your account.");
        setAuthOpen(true);
        return;
      }
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
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        locale={locale}
        nextPath={`/${locale}/plus?activate=companion`}
        title={isAr ? "سجّل دخولك لتفعيل Rya Companion" : "Sign in to activate Rya Companion"}
        description={isAr ? "نحفظ Rya Companion في حسابك حتى تعمل معك على الجوال وتحتفظ بسياق رحلتك." : "We’ll save Rya Companion to your account so it works on mobile and keeps your trip context."}
      />
    </div>
  );
}
