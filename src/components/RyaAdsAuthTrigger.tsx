"use client";
/**
 * RyaAdsAuthTrigger
 * CTA button used on the /rya ads landing page.
 * Tracks CTA engagement; final signup conversion fires after auth succeeds.
 */
import { useState } from "react";
import { AuthModal } from "@/components/AuthModal";
import type { Locale } from "@/i18n/config";
import { fireGoogleAdsConversion } from "@/lib/analytics/google";
import { cn } from "@/lib/utils";

function fireGA4Event(eventName: string) {
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", eventName, {
        event_category: "ads_landing",
        event_label: "rya_lp",
      });
    }
  } catch {
    // swallow
  }
}

interface Props {
  locale: Locale;
  variant: "primary" | "large" | "header";
}

export function RyaAdsAuthTrigger({ locale, variant }: Props) {
  const [open, setOpen] = useState(false);
  const isAr = locale === "ar";

  const labels = {
    primary: isAr ? "جرب ريا مجاناً ←" : "Try Rya Free →",
    large:   isAr ? "ابدأ مجاناً — لا بطاقة ائتمان" : "Start Free — No Credit Card",
    header:  isAr ? "سجّل مجاناً" : "Sign Up Free",
  };

  const baseClass = "inline-flex items-center justify-center font-bold transition-all focus-visible:outline-none";

  const variantClass: Record<Props["variant"], string> = {
    primary: "rounded-xl bg-[#3B82F6] px-7 py-3.5 text-sm text-white shadow-lg shadow-[#3B82F6]/25 hover:bg-[#2563EB] hover:shadow-[#3B82F6]/40 active:scale-[0.98]",
    large:   "rounded-xl bg-[#3B82F6] px-8 py-4 text-base text-white shadow-xl shadow-[#3B82F6]/30 hover:bg-[#2563EB] hover:shadow-[#3B82F6]/50 active:scale-[0.98] w-full sm:w-auto",
    header:  "rounded-lg bg-[#3B82F6] px-4 py-2 text-xs text-white hover:bg-[#2563EB]",
  };

  function handleClick() {
    fireGA4Event("rya_cta_click");
    fireGoogleAdsConversion("rya_cta_click", {
      value: 2.0,
      currency: "USD",
      page_path: window.location.pathname,
    });
    setOpen(true);
  }

  return (
    <>
      <button
        onClick={handleClick}
        className={cn(baseClass, variantClass[variant])}
        aria-label={labels[variant]}
      >
        {labels[variant]}
      </button>

      <AuthModal
        open={open}
        onClose={() => setOpen(false)}
        locale={locale}
        nextPath={`/${locale}/search`}
        title={isAr ? "ابدأ مع ريا مجاناً" : "Start with Rya — Free"}
        description={
          isAr
            ? "أدخل بريدك الإلكتروني لتبدأ تخطيط رحلتك مع ريا."
            : "Enter your email to start planning your trip with Rya."
        }
      />
    </>
  );
}
