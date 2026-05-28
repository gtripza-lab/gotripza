"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ExternalLink, Loader2, Sparkles, LogIn } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import { logEvent } from "@/lib/events";
import type { Locale } from "@/i18n/config";
import { AuthModal } from "@/components/AuthModal";
import { CHECKOUT_LINKS } from "@/lib/checkout-links";

type ActivateState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "active"; expiresAt: string; daysRemaining: number }
  | { status: "already_active"; expiresAt: string; daysRemaining: number }
  | { status: "error"; message: string };

function formatExpiry(iso: string, isAr: boolean): string {
  const d = new Date(iso);
  return d.toLocaleDateString(isAr ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function CompanionActivateSection({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const [email, setEmail]               = useState("");
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [showAuth, setShowAuth]         = useState(false);
  const [state, setState]               = useState<ActivateState>({ status: "idle" });

  // Load session email
  useEffect(() => {
    const sb = createSupabaseBrowser();
    sb.auth.getSession().then(({ data }) => {
      const e = data.session?.user?.email ?? null;
      setSessionEmail(e);
      if (e) setEmail(e);
    });
    const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
      const e = session?.user?.email ?? null;
      setSessionEmail(e);
      if (e) setEmail(e);
      if (_event === "SIGNED_IN") {
        setShowAuth(false);
        // If user signed in after clicking buy, open Gumroad now
        const pending = sessionStorage.getItem("gotripza_companion_pending_url");
        if (pending) {
          sessionStorage.removeItem("gotripza_companion_pending_url");
          window.open(pending, "_blank");
        }
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handleBuy() {
    logEvent("companion_purchase_clicked", { locale, price: 19.99, source: "activate_section" });
    const sb = createSupabaseBrowser();
    const { data } = await sb.auth.getSession();
    if (data.session) {
      window.open(CHECKOUT_LINKS.ryaCompanion, "_blank");
    } else {
      sessionStorage.setItem("gotripza_companion_pending_url", CHECKOUT_LINKS.ryaCompanion);
      setShowAuth(true);
    }
  }

  async function handleActivate() {
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setState({ status: "error", message: isAr ? "أدخل بريداً إلكترونياً صحيحاً" : "Enter a valid email address" });
      return;
    }

    if (!sessionEmail) {
      setShowAuth(true);
      return;
    }

    setState({ status: "loading" });

    try {
      const res = await fetch("/api/companion/unlock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: trimmed }),
      });
      const data = await res.json();

      if (res.ok) {
        if (data.already_active) {
          setState({ status: "already_active", expiresAt: data.expiresAt, daysRemaining: data.daysRemaining });
        } else {
          logEvent("companion_unlocked", { locale, daysRemaining: data.daysRemaining });
          setState({ status: "active", expiresAt: data.expiresAt, daysRemaining: data.daysRemaining });
        }
      } else if (res.status === 402) {
        setState({
          status: "error",
          message: isAr
            ? "لم يتم العثور على شراء بهذا البريد. تأكد من استخدام نفس البريد المستخدم في Gumroad."
            : "No purchase found for this email. Make sure to use the same email you used on Gumroad.",
        });
      } else {
        setState({ status: "error", message: isAr ? "حدث خطأ، حاول مجدداً." : "Something went wrong, please try again." });
      }
    } catch {
      setState({ status: "error", message: isAr ? "تعذر الاتصال بالخادم." : "Could not reach the server." });
    }
  }

  const isSuccess = state.status === "active" || state.status === "already_active";

  return (
    <>
      {/* Purchase CTA */}
      <div className="mt-12 rounded-3xl border border-brand-primary/20 bg-brand-primary/[0.06] p-6 sm:p-8">
        <div className="grid gap-6 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold text-brand-primary">
              {isAr ? "متاحة الآن · دفع آمن عبر Gumroad" : "Available now · Secure checkout via Gumroad"}
            </p>
            <h2 className="mt-2 text-2xl font-bold text-white">
              {isAr ? "Rya Companion — $19.99 · ٦٠ يوماً" : "Rya Companion — $19.99 · 60 days"}
            </h2>
            <p className="mt-2 text-sm leading-7 text-white/50">
              {isAr
                ? "ادفع مرة واحدة واحصل على وصول كامل لريا لمدة 60 يوماً. بعد الشراء فعّل وصولك بالبريد أدناه."
                : "Pay once and get full Rya access for 60 days. After purchase, activate below with your email."}
            </p>
          </div>
          <button
            onClick={handleBuy}
            className="flex h-12 min-w-48 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-violet-600 px-6 text-sm font-semibold text-white transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <Sparkles className="h-4 w-4" />
            {isAr ? "اشترِ الآن بـ $19.99" : "Buy now for $19.99"}
            <ExternalLink className="h-4 w-4 opacity-70" />
          </button>
        </div>
      </div>

      {/* Activation form */}
      <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-6">
        <p className="text-sm font-semibold text-white">
          {isAr ? "فعّل وصولك بعد الشراء" : "Activate your access after purchase"}
        </p>
        <p className="mt-1 text-xs text-white/40">
          {isAr
            ? "أدخل نفس البريد الذي استخدمته في Gumroad لتفعيل ريا لمدة 60 يوماً."
            : "Enter the same email you used on Gumroad to unlock Rya for 60 days."}
        </p>

        {isSuccess ? (
          <div className="mt-5 flex flex-col items-start gap-3 rounded-xl border border-brand-mint/25 bg-brand-mint/[0.08] p-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-mint" />
              <p className="text-sm font-semibold text-brand-mint">
                {state.status === "already_active"
                  ? (isAr ? "وصولك مفعّل بالفعل ✓" : "Your access is already active ✓")
                  : (isAr ? "تم تفعيل Rya Companion بنجاح! ✓" : "Rya Companion activated successfully! ✓")}
              </p>
            </div>
            <p className="text-xs text-white/55">
              {isAr
                ? `وصولك نشط حتى: ${formatExpiry((state as { expiresAt: string }).expiresAt, true)} (${(state as { daysRemaining: number }).daysRemaining} يوم متبقٍ)`
                : `Active until: ${formatExpiry((state as { expiresAt: string }).expiresAt, false)} (${(state as { daysRemaining: number }).daysRemaining} days remaining)`}
            </p>
            <a
              href={`/${locale}`}
              className="mt-1 text-xs font-semibold text-brand-primary hover:underline"
            >
              {isAr ? "ابدأ استخدام ريا ←" : "← Start using Rya"}
            </a>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (state.status === "error") setState({ status: "idle" });
              }}
              placeholder={isAr ? "بريدك في Gumroad" : "Your Gumroad email"}
              dir="ltr"
              className="h-11 flex-1 rounded-xl border border-white/10 bg-white/[0.05] px-4 text-sm text-white placeholder-white/25 outline-none focus:border-brand-primary/60 focus:ring-1 focus:ring-brand-primary/30"
            />
            {!sessionEmail ? (
              <button
                onClick={() => setShowAuth(true)}
                className="flex h-11 items-center justify-center gap-2 rounded-xl border border-white/15 px-5 text-sm font-semibold text-white/70 transition hover:border-white/30 hover:text-white"
              >
                <LogIn className="h-4 w-4" />
                {isAr ? "سجّل دخولك أولاً" : "Sign in first"}
              </button>
            ) : (
              <button
                onClick={handleActivate}
                disabled={state.status === "loading"}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-primary px-6 text-sm font-semibold text-white transition hover:bg-brand-primary/90 disabled:opacity-60"
              >
                {state.status === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                {isAr ? "فعّل الوصول" : "Activate access"}
              </button>
            )}
          </div>
        )}

        {state.status === "error" && (
          <p className="mt-3 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-400">
            {state.message}
          </p>
        )}
      </div>

      <AuthModal open={showAuth} locale={locale} onClose={() => setShowAuth(false)} />
    </>
  );
}
