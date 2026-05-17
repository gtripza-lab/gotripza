"use client";
/**
 * RyaAdsAuthTrigger
 * CTA button used on the /rya ads landing page.
 * Fires a Google Ads conversion event when the user clicks.
 */
import { useState } from "react";
import { AuthModal } from "@/components/AuthModal";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

function fireAdsConversion() {
  try {
    const adsId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
    const convLabel = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONV_LABEL;
    if (typeof window.gtag === "function" && adsId && convLabel) {
      window.gtag("event", "conversion", {
        send_to: `${adsId}/${convLabel}`,
        value: 5.0,
        currency: "USD",
      });
    }
  } catch {
    // Never block the user flow
  }
}

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
    fireAdsConversion();
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
