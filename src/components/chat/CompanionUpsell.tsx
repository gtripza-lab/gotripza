"use client";

import { useState } from "react";
import { X, Sparkles, Lock, CheckCircle2, ArrowRight } from "lucide-react";
import { logEvent } from "@/lib/events";

// ── Upsell banner (shown at messages 3, 6, 9) ─────────────────────────────

interface UpsellBannerProps {
  message: string;
  locale: "ar" | "en";
  onDismiss: () => void;
}

export function UpsellBanner({ message, locale, onDismiss }: UpsellBannerProps) {
  const isAr = locale === "ar";

  return (
    <div
      className="relative mx-0.5 mt-3 flex items-center gap-2.5 rounded-xl border border-violet-500/25 px-3.5 py-2.5"
      dir={isAr ? "rtl" : "ltr"}
      style={{
        background: "linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(88,28,135,0.08) 100%)",
      }}
    >
      <Sparkles size={15} className="shrink-0 text-violet-400" />
      <a
        href="https://gumroad.com/l/wnjwbp"
        target="_blank"
        rel="noopener noreferrer"
        className="flex-1 min-w-0 text-[12px] leading-snug text-white/75 hover:text-white/90 transition-colors"
        onClick={() => logEvent("companion_upsell_clicked", { source: "banner", url: "https://gumroad.com/l/wnjwbp" })}
      >
        {message}
      </a>
      <button
        type="button"
        onClick={onDismiss}
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-white/30 transition hover:text-white/60"
        aria-label={isAr ? "إغلاق" : "Dismiss"}
      >
        <X size={12} />
      </button>
    </div>
  );
}

// ── Paywall modal (shown when free limit reached) ─────────────────────────

interface PaywallModalProps {
  locale: "ar" | "en";
  onClose: () => void;
}

const COMPANION_FEATURES_AR = [
  "محادثات غير محدودة مع ريا",
  "ذاكرة شخصية — ريا تتذكر رحلاتك",
  "قراءة الصور (منيو، تذاكر، لافتات)",
  "تحليل عميق وخطط مخصصة",
  "لا إعلانات · لا توقف",
];

const COMPANION_FEATURES_EN = [
  "Unlimited conversations with Rya",
  "Personal memory — Rya remembers your trips",
  "Photo reading (menus, tickets, signs)",
  "Deep analysis & personalized plans",
  "No ads · No limits",
];

export function PaywallModal({ locale, onClose }: PaywallModalProps) {
  const isAr = locale === "ar";
  const features = isAr ? COMPANION_FEATURES_AR : COMPANION_FEATURES_EN;

  return (
    /* backdrop */
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      {/* sheet */}
      <div
        className="relative w-full max-w-sm rounded-t-3xl sm:rounded-3xl border border-white/10 pb-safe"
        style={{
          background: "linear-gradient(160deg, #0d1e35 0%, #10162b 100%)",
          maxHeight: "90dvh",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
        dir={isAr ? "rtl" : "ltr"}
      >
        {/* drag handle (mobile) */}
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-white/15 sm:hidden" />

        {/* close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 end-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/8 text-white/50 transition hover:bg-white/12 hover:text-white/80"
        >
          <X size={16} />
        </button>

        <div className="px-6 pb-6 pt-5">
          {/* icon + title */}
          <div className="mb-5 flex flex-col items-center gap-2 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-brand-primary shadow-lg shadow-violet-900/40">
              <Lock size={24} className="text-white" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {isAr ? "وصلت للحد اليومي المجاني" : "You reached your free daily limit"}
            </h2>
            <p className="text-[13px] text-white/55 leading-relaxed">
              {isAr
                ? "ستُعاد المحادثة المجانية غداً. أو فعّل Rya Companion مرة واحدة وأنهِ القيود نهائياً."
                : "Free chat resets tomorrow. Or activate Rya Companion once and remove all limits permanently."}
            </p>
          </div>

          {/* features */}
          <ul className="mb-5 flex flex-col gap-2.5">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2.5">
                <CheckCircle2 size={15} className="shrink-0 text-violet-400" />
                <span className="text-[13px] text-white/75">{f}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <a
            href="https://gumroad.com/l/wnjwbp"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => logEvent("companion_upsell_clicked", { source: "paywall_cta", url: "https://gumroad.com/l/wnjwbp" })}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-brand-primary py-3.5 text-[15px] font-semibold text-white shadow-lg shadow-violet-900/30 transition active:scale-[0.98]"
          >
            <Sparkles size={16} />
            {isAr ? "فعّل Rya Companion — $19.99" : "Get Rya Companion — $19.99"}
            <ArrowRight size={15} className={isAr ? "rotate-180" : ""} />
          </a>

          {/* secondary — wait */}
          <button
            type="button"
            onClick={onClose}
            className="mt-2.5 w-full py-2.5 text-[13px] text-white/35 transition hover:text-white/55"
          >
            {isAr ? "انتظر حتى غداً — مجاناً" : "Wait until tomorrow — free"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Hook to manage upsell state ────────────────────────────────────────────

export function useUpsellState() {
  const [dismissedUpsells, setDismissedUpsells] = useState<Set<number>>(new Set());
  const [showPaywall, setShowPaywall] = useState(false);

  function dismissUpsell(msgCount: number) {
    setDismissedUpsells((prev) => new Set([...prev, msgCount]));
  }

  function openPaywall() {
    setShowPaywall(true);
  }

  function closePaywall() {
    setShowPaywall(false);
  }

  return { dismissedUpsells, showPaywall, dismissUpsell, openPaywall, closePaywall };
}
