"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import type { Locale } from "@/i18n/config";

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
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ interval, locale }),
      });
      const json = (await res.json()) as { url?: string; error?: string };
      if (res.status === 401) {
        setMessage(isAr ? "سجل دخولك أولاً من زر الدخول بالأعلى." : "Sign in first from the top navigation.");
        return;
      }
      if (res.status === 503 || json.error === "stripe_not_configured") {
        setMessage(isAr ? "Rya Companion غير متاح للدفع الآن. تواصل معنا ونفعّله لك يدوياً عند الإطلاق." : "Rya Companion checkout is not available right now. Contact us and we'll activate it manually at launch.");
        return;
      }
      if (!res.ok || !json.url) {
        setMessage(isAr ? "تعذر فتح صفحة الدفع الآن." : "Could not open checkout right now.");
        return;
      }
      window.location.href = json.url;
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
        {isAr ? "ابدأ مع Rya Companion" : "Start Rya Companion"}
      </button>
      {message && <p className="mt-2 text-xs leading-5 text-amber-300/80">{message}</p>}
    </div>
  );
}
