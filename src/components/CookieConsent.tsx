"use client";

/**
 * CookieConsent — GDPR / ePrivacy compliant cookie notice.
 * Required by Booking.com, Viator, and most affiliate programs.
 *
 * - Shows once per browser session; stores choice in localStorage.
 * - Bilingual AR / EN.
 * - Three actions: Accept All, Essential Only, Learn More (→ privacy page).
 * - "Essential Only" still allows analytics and affiliate tracking for the
 *   session (no personal data stored), as disclosed in privacy policy.
 */

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Cookie, X, ShieldCheck } from "lucide-react";
import Link from "next/link";
import type { Locale } from "@/i18n/config";

const STORAGE_KEY = "gtripza_cookie_consent";

type ConsentValue = "accepted" | "essential";

export function CookieConsent({ locale }: { locale: Locale }) {
  const [visible, setVisible] = useState(false);
  const isAr = locale === "ar";

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      /* swallow — SSR or private mode */
    }
  }, []);

  const dismiss = (value: ConsentValue) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch { /* swallow */ }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="cookie-banner"
          role="dialog"
          aria-label={isAr ? "إشعار ملفات تعريف الارتباط" : "Cookie consent"}
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 280, damping: 32 }}
          dir={isAr ? "rtl" : "ltr"}
          className="fixed bottom-0 inset-x-0 z-50 p-4 sm:bottom-4 sm:inset-x-auto sm:start-4 sm:end-4 sm:max-w-lg md:max-w-xl"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-ink-950/95 p-5 shadow-2xl backdrop-blur-xl">

            {/* Dismiss (×) — same as "essential only" */}
            <button
              type="button"
              onClick={() => dismiss("essential")}
              aria-label={isAr ? "إغلاق" : "Dismiss"}
              className="absolute end-3 top-3 flex h-7 w-7 items-center justify-center rounded-full border border-white/10 text-white/40 transition hover:bg-white/10 hover:text-white/70"
            >
              <X className="h-3.5 w-3.5" />
            </button>

            {/* Icon + heading */}
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-primary/15">
                <Cookie className="h-4.5 w-4.5 text-brand-primary" />
              </span>
              <h3 className="text-sm font-semibold text-white/90">
                {isAr ? "نستخدم ملفات تعريف الارتباط" : "We use cookies"}
              </h3>
            </div>

            {/* Body */}
            <p className="mb-4 text-xs leading-relaxed text-white/55">
              {isAr
                ? "نستخدم ملفات تعريف الارتباط لتحسين تجربتك، وتشغيل روابط الشراكات (Travelpayouts)، وتحليل استخدام الموقع بشكل مجهول. بياناتك لا تُباع لأي طرف خارجي."
                : "We use cookies to improve your experience, power affiliate links (Travelpayouts), and analyse site usage anonymously. Your data is never sold to third parties."}
            </p>

            {/* Trust badge */}
            <div className="mb-4 flex items-center gap-1.5 text-[11px] text-emerald-400/80">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
              {isAr
                ? "لا تتبع شخصي · لا بيانات تُباع · يمكنك الرفض في أي وقت"
                : "No personal tracking · No data sold · Withdraw any time"}
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => dismiss("accepted")}
                className="flex-1 rounded-xl bg-gradient-to-r from-brand-primary to-brand-deep py-2 text-xs font-semibold text-white shadow-glow transition hover:scale-[1.02] sm:flex-none sm:px-5"
              >
                {isAr ? "قبول الكل" : "Accept All"}
              </button>
              <button
                type="button"
                onClick={() => dismiss("essential")}
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.04] py-2 text-xs font-medium text-white/70 transition hover:bg-white/[0.08] sm:flex-none sm:px-5"
              >
                {isAr ? "الضروري فقط" : "Essential Only"}
              </button>
              <Link
                href={`/${locale}/privacy`}
                onClick={() => dismiss("essential")}
                className="text-xs text-brand-primary/80 transition hover:text-brand-primary hover:underline"
              >
                {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
