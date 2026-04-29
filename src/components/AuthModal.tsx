"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Mail, CheckCircle, Loader2 } from "lucide-react";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import type { Locale } from "@/i18n/config";

type Step = "idle" | "loading" | "sent" | "error";

interface Props {
  open: boolean;
  onClose: () => void;
  locale: Locale;
}

export function AuthModal({ open, onClose, locale }: Props) {
  const isAr = locale === "ar";
  const [email, setEmail] = useState("");
  const [step, setStep]   = useState<Step>("idle");
  const [errMsg, setErrMsg] = useState("");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed || !trimmed.includes("@")) return;

    setStep("loading");
    setErrMsg("");

    try {
      const supabase = createSupabaseBrowser();
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo: `${appUrl}/${locale}/search`,
          shouldCreateUser: true,
        },
      });

      if (error) {
        setStep("error");
        setErrMsg(error.message);
      } else {
        setStep("sent");
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
          {/* Backdrop */}
          <motion.div
            key="auth-backdrop"
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          />

          {/* Modal */}
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
              {/* Close */}
              <button
                onClick={handleClose}
                className="absolute top-4 end-4 flex h-8 w-8 items-center justify-center rounded-full text-white/40 hover:text-white/80 hover:bg-white/[0.06] transition"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>

              {step === "sent" ? (
                /* ── Success state ── */
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
                </div>
              ) : (
                /* ── Email form ── */
                <>
                  <div className="mb-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-primary/10 mb-4">
                      <Mail className="h-5 w-5 text-brand-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      {isAr ? "مرحباً بك في GoTripza" : "Welcome to GoTripza"}
                    </h2>
                    <p className="mt-1 text-sm text-white/40">
                      {isAr
                        ? "أدخل بريدك الإلكتروني — سنرسل لك رابط دخول فوري"
                        : "Enter your email — we'll send you a magic link"}
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
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3
                                 text-sm text-white placeholder-white/25 outline-none
                                 focus:border-brand-primary/50 transition"
                    />

                    {errMsg && (
                      <p className="text-xs text-red-400 px-1">{errMsg}</p>
                    )}

                    <button
                      type="submit"
                      disabled={step === "loading" || !email.trim()}
                      className="flex items-center justify-center gap-2 w-full rounded-xl bg-brand-primary
                                 py-3 text-sm font-semibold text-white transition
                                 hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {step === "loading" ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          {isAr ? "جارٍ الإرسال…" : "Sending…"}
                        </>
                      ) : (
                        isAr ? "إرسال رابط الدخول" : "Send magic link"
                      )}
                    </button>
                  </form>

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
