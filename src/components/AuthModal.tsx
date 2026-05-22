"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Mail, CheckCircle, Loader2, LogIn } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import { getGoogleAdsConversionTarget } from "@/lib/analytics/google";
import { trackXEvent } from "@/lib/analytics/x";
import { logEvent } from "@/lib/events";
import type { Locale } from "@/i18n/config";

type Step = "idle" | "loading" | "oauth" | "sent" | "error";

function fireSignupConversion() {
  try {
    const conversionTarget = getGoogleAdsConversionTarget();
    if (typeof window.gtag === "function" && conversionTarget) {
      window.gtag("event", "conversion", {
        send_to: conversionTarget,
        value: 5.0,
        currency: "USD",
      });
    }
    if (typeof window.gtag === "function") {
      window.gtag("event", "sign_up", { method: "magic_link" });
    }
    trackXEvent("CompleteRegistration", { method: "magic_link" });
  } catch {
    // Never block the user flow
  }
}

interface Props {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  nextPath?: string;
  title?: string;
  description?: string;
}

export function AuthModal({ open, onClose, locale, nextPath, title, description }: Props) {
  const isAr = locale === "ar";
  const [email, setEmail] = useState("");
  const [step, setStep]   = useState<Step>("idle");
  const [errMsg, setErrMsg] = useState("");
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);
  const [now, setNow] = useState<number>(() => Date.now());

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";
  const callbackUrl = `${appUrl}/auth/callback?next=${encodeURIComponent(nextPath ?? `/${locale}/search`)}`;
  const cooldownSeconds = Math.max(0, Math.ceil((cooldownUntil - now) / 1000));
  const isEmailCoolingDown = cooldownSeconds > 0;
  const isCompanionFlow = Boolean(nextPath?.includes("activate=companion") || title?.toLowerCase().includes("companion"));

  const friendlyError = useMemo(() => {
    const lower = errMsg.toLowerCase();
    if (lower.includes("rate limit") || lower.includes("too many") || lower.includes("exceeded")) {
      return isAr
        ? "أرسلنا رابطاً قبل قليل. انتظر قليلاً أو استخدم تسجيل الدخول عبر Google."
        : "We sent a link recently. Please wait a moment or continue with Google.";
    }
    if (lower.includes("provider") || lower.includes("oauth")) {
      return isAr
        ? "تسجيل Google يحتاج تفعيله من Supabase أولاً. استخدم البريد الآن أو فعّل Google Provider."
        : "Google sign-in must be enabled in Supabase first. Use email for now or enable the Google provider.";
    }
    return errMsg;
  }, [errMsg, isAr]);

  useEffect(() => {
    try {
      const saved = Number(window.localStorage.getItem("gotripza_auth_email_cooldown_until") ?? 0);
      if (saved > Date.now()) setCooldownUntil(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!open || !cooldownUntil) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [cooldownUntil, open]);

  useEffect(() => {
    if (!open) return;
    logEvent("auth_initiated", {
      source: isCompanionFlow ? "companion_auth_modal" : "auth_modal",
      nextPath: nextPath ?? null,
      locale,
    });
    if (isCompanionFlow) {
      logEvent("companion_signup_started", {
        source: "auth_modal_open",
        nextPath: nextPath ?? null,
        locale,
      });
    }
  }, [isCompanionFlow, locale, nextPath, open]);

  function startEmailCooldown(seconds = 60) {
    const until = Date.now() + seconds * 1000;
    setCooldownUntil(until);
    setNow(Date.now());
    try {
      window.localStorage.setItem("gotripza_auth_email_cooldown_until", String(until));
    } catch {
      /* ignore */
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) return;
    if (isEmailCoolingDown) return;

    setStep("loading");
    setErrMsg("");
    logEvent("auth_initiated", {
      method: "magic_link",
      source: isCompanionFlow ? "companion_auth_submit" : "auth_submit",
      locale,
    });
    if (isCompanionFlow) {
      logEvent("companion_signup_started", {
        method: "magic_link",
        source: "auth_submit",
        locale,
      });
    }

    try {
      const supabase = createSupabaseBrowser();
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: callbackUrl,
          shouldCreateUser: true,
        },
      });

      if (error) {
        setStep("error");
        setErrMsg(error.message);
        if (/rate limit|too many|exceeded/i.test(error.message)) {
          startEmailCooldown(300);
        }
      } else {
        startEmailCooldown(60);
        fireSignupConversion();
        setStep("sent");
      }
    } catch (err) {
      setStep("error");
      setErrMsg((err as Error).message);
    }
  }

  async function handleGoogleSignIn() {
    setStep("oauth");
    setErrMsg("");
    logEvent("auth_initiated", {
      method: "google",
      source: isCompanionFlow ? "companion_google_auth" : "google_auth",
      locale,
    });
    if (isCompanionFlow) {
      logEvent("companion_signup_started", {
        method: "google",
        source: "google_auth",
        locale,
      });
    }
    try {
      const supabase = createSupabaseBrowser();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: callbackUrl,
          queryParams: {
            access_type: "offline",
            prompt: "select_account",
          },
        },
      });

      if (error) {
        setStep("error");
        setErrMsg(error.message);
      } else {
        fireSignupConversion();
        if (typeof window.gtag === "function") {
          window.gtag("event", "sign_up", { method: "google" });
        }
        trackXEvent("CompleteRegistration", { method: "google" });
      }
    } catch (err) {
      setStep("error");
      setErrMsg((err as Error).message);
    }
  }

  function handleClose() {
    setEmail("");
    setStep("idle");
    setErrMsg("");
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="auth-backdrop"
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          <motion.div
            key="auth-modal"
            className="fixed inset-0 z-[61] flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: "spring", stiffness: 340, damping: 28 }}
          >
            <div
              className="relative w-full max-w-sm rounded-2xl border border-white/[0.08] bg-[#0d0d14] p-7 shadow-2xl"
              dir={isAr ? "rtl" : "ltr"}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleClose}
                className="absolute top-4 end-4 flex h-8 w-8 items-center justify-center rounded-full text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              {step === "sent" ? (
                <div className="flex flex-col items-center py-4 text-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10">
                    <CheckCircle className="h-7 w-7 text-green-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">
                      {isAr ? "تحقق من بريدك!" : "Check your inbox!"}
                    </h2>
                    <p className="mt-1.5 text-sm text-white/50">
                      {isAr
                        ? `أرسلنا رابط دخول إلى ${email}. صالح لمدة ساعة.`
                        : `We sent a sign-in link to ${email}. Valid for 1 hour.`}
                    </p>
                  </div>
                  <button
                    onClick={handleClose}
                    className="mt-2 w-full rounded-xl bg-white/[0.07] py-2.5 text-sm text-white/70 hover:bg-white/10 transition"
                  >
                    {isAr ? "حسناً" : "Got it"}
                  </button>
                  {isEmailCoolingDown && (
                    <p className="text-xs text-white/35">
                      {isAr
                        ? `يمكنك طلب رابط جديد بعد ${cooldownSeconds} ثانية.`
                        : `You can request another link in ${cooldownSeconds}s.`}
                    </p>
                  )}
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 mb-4">
                      <Mail className="h-5 w-5 text-brand-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      {title ?? (isAr ? "مرحباً بك في GoTripza" : "Welcome to GoTripza")}
                    </h2>
                    <p className="mt-1 text-sm text-white/40">
                      {description ?? (isAr
                        ? "أدخل بريدك الإلكتروني — سنرسل لك رابط دخول فوري"
                        : "Enter your email — we'll send you a magic link")}
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrMsg(""); }}
                      placeholder={isAr ? "بريدك الإلكتروني" : "your@email.com"}
                      autoFocus
                      autoComplete="email"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-brand-primary/50 transition"
                    />

                    <button
                      type="submit"
                      disabled={step === "loading" || isEmailCoolingDown || !email.trim()}
                      className="flex items-center justify-center gap-2 w-full rounded-xl bg-brand-primary py-3 text-sm font-semibold text-white transition hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {step === "loading" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {isAr ? "جارٍ الإرسال…" : "Sending…"}
                        </>
                      ) : isEmailCoolingDown ? (
                        isAr ? `انتظر ${cooldownSeconds} ثانية` : `Wait ${cooldownSeconds}s`
                      ) : (
                        isAr ? "إرسال رابط الدخول" : "Send magic link"
                      )}
                    </button>

                    <div className="flex items-center gap-3 py-1">
                      <div className="h-px flex-1 bg-white/10" />
                      <span className="text-[11px] text-white/30">{isAr ? "أو" : "or"}</span>
                      <div className="h-px flex-1 bg-white/10" />
                    </div>

                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      disabled={step === "oauth" || step === "loading"}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] py-3 text-sm font-semibold text-white/80 transition hover:bg-white/[0.10] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {step === "oauth" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {isAr ? "جارٍ التحويل…" : "Redirecting…"}
                        </>
                      ) : (
                        <>
                          <LogIn className="h-4 w-4" />
                          {isAr ? "المتابعة باستخدام Google" : "Continue with Google"}
                        </>
                      )}
                    </button>
                  </form>

                  {isEmailCoolingDown && step !== "loading" && (
                    <p className="mt-3 rounded-xl border border-amber-400/15 bg-amber-400/10 px-3 py-2 text-xs leading-5 text-amber-100/75">
                      {isAr
                        ? `لحماية حسابك، انتظر ${cooldownSeconds} ثانية قبل طلب رابط جديد. يمكنك استخدام Google فوراً.`
                        : `To protect your account, wait ${cooldownSeconds}s before requesting another link. You can use Google immediately.`}
                    </p>
                  )}

                  {friendlyError && (
                    <p className="mt-3 rounded-xl border border-red-400/15 bg-red-400/10 px-3 py-2 text-xs leading-5 text-red-100/80">
                      {friendlyError}
                    </p>
                  )}

                  <p className="mt-5 text-center text-[11px] text-white/25 leading-relaxed">
                    {isAr
                      ? "بالمتابعة توافق على سياسة الخصوصية وشروط الاستخدام"
                      : "By continuing you agree to our Privacy Policy and Terms of Use"}
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
