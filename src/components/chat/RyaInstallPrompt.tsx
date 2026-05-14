"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Share, Smartphone, X } from "lucide-react";
import { logEvent } from "@/lib/events";
import type { Locale } from "@/i18n/config";
import { AuthModal } from "@/components/AuthModal";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type TrialState = {
  active: boolean;
  startedAt: string | null;
  endsAt: string | null;
  daysRemaining: number;
  trialDays: number;
  signedIn?: boolean;
  authRequired?: boolean;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

export function RyaInstallPrompt({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [trial, setTrial] = useState<TrialState | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [showIosHelp, setShowIosHelp] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const standalone = useMemo(() => isStandalone(), []);

  useEffect(() => {
    void fetch("/api/companion/trial")
      .then((res) => res.json())
      .then((json: TrialState) => setTrial(json))
      .catch(() => undefined);

    if (standalone) {
      logEvent("pwa_standalone_opened", { locale });
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
      logEvent("pwa_install_cta_shown", { locale, platform: "install_prompt" });
    };
    const onInstalled = () => {
      logEvent("pwa_app_installed", { locale });
      setDismissed(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("appinstalled", onInstalled);
    if (isIOS() && !standalone) logEvent("pwa_install_cta_shown", { locale, platform: "ios_manual" });
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, [locale, standalone]);

  if (dismissed || standalone) return null;

  const canInstall = !!installEvent || isIOS();
  if (!canInstall && trial?.active) return null;

  async function startTrial() {
    const res = await fetch("/api/companion/trial", { method: "POST" });
    if (res.status === 401) {
      setNotice(isAr ? "سجّل دخولك أولاً حتى نحفظ Rya Companion في حسابك." : "Sign in first so Rya Companion is saved to your account.");
      setAuthOpen(true);
      return null;
    }
    const next = await res.json();
    setTrial(next);
    return next as TrialState;
  }

  async function handleInstall() {
    logEvent("pwa_install_cta_clicked", { locale, platform: isIOS() ? "ios_manual" : "install_prompt" });
    const state = await startTrial();
    if (!state) return;
    if (installEvent) {
      await installEvent.prompt();
      const choice = await installEvent.userChoice.catch(() => null);
      logEvent("pwa_install_cta_clicked", { locale, outcome: choice?.outcome ?? "unknown", trial_days_remaining: state.daysRemaining });
      setInstallEvent(null);
      return;
    }
    setShowIosHelp(true);
    logEvent("pwa_ios_install_instructions_shown", { locale, trial_days_remaining: state.daysRemaining });
  }

  return (
    <div className="shrink-0 border-b border-white/[0.06] bg-black/20 px-2 py-1.5 sm:hidden">
      <div className="rounded-2xl border border-violet-400/15 bg-violet-500/[0.08] px-2.5 py-2">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-violet-500/18 text-violet-200">
            <Smartphone className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-semibold text-white/82">
              {trial?.active
                ? isAr ? `Rya Companion مفعّلة · ${trial.daysRemaining} يوم` : `Rya Companion active · ${trial.daysRemaining}d`
                : trial?.authRequired
                  ? isAr ? "سجّل دخولك لتثبيت Rya Companion" : "Sign in to install Rya Companion"
                  : isAr ? "ثبّت ريا كتطبيق جوال" : "Install Rya as a mobile app"}
            </p>
            {showIosHelp ? (
              <div className="mt-1 rounded-xl border border-white/[0.08] bg-black/25 p-2 text-[11px] leading-5 text-white/55">
                <Share className="me-1 inline h-3.5 w-3.5" />
                {isAr
                  ? "على iPhone: اضغط زر المشاركة في Safari ثم اختر “إضافة إلى الشاشة الرئيسية”."
                  : "On iPhone: tap Share in Safari, then choose “Add to Home Screen”."}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => void handleInstall()}
                className="mt-1 inline-flex h-7 items-center gap-1.5 rounded-full bg-white px-2.5 text-[10px] font-semibold text-ink-950"
              >
                <Download className="h-3.5 w-3.5" />
                {trial?.authRequired ? (isAr ? "تسجيل الدخول" : "Sign in") : (isAr ? "تفعيل وتثبيت" : "Activate & install")}
              </button>
            )}
            {notice && <p className="mt-1 text-[10px] leading-4 text-amber-200/80">{notice}</p>}
          </div>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white/35 hover:bg-white/[0.08]"
            aria-label={isAr ? "إغلاق" : "Close"}
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <AuthModal
        open={authOpen}
        onClose={() => setAuthOpen(false)}
        locale={locale}
        nextPath={`/${locale}/search?source=companion-install`}
        title={isAr ? "سجّل دخولك لتثبيت Rya Companion" : "Sign in to install Rya Companion"}
        description={isAr ? "نحفظ التفعيل والتثبيت في حسابك حتى تظهر بياناته في الأدمن وتستطيع استخدام ريا المستشارة." : "We save activation and install intent to your account so it appears in admin and enables Companion on mobile."}
      />
    </div>
  );
}
