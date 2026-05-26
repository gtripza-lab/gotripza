"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Send, ArrowRight, LogIn } from "lucide-react";

type FormState = "idle" | "loading" | "success" | "existing" | "error";

export function PartnerApplicationForm({ locale = "ar" }: { locale?: string }) {
  const isAr = locale === "ar";
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");

  function normaliseLinks(raw: string): string[] {
    return raw
      .split(/\n|,/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => (s.startsWith("http://") || s.startsWith("https://") ? s : `https://${s}`));
  }

  function friendlyValidationError(issues: Record<string, string[]>): string {
    if (issues.socialLinks?.length) {
      return isAr
        ? "روابط حساباتك يجب أن تكون روابط كاملة (مثال: https://instagram.com/yourhandle)."
        : "Social links must be full URLs (e.g. https://instagram.com/yourhandle).";
    }
    if (issues.whyJoin?.length) {
      return isAr
        ? "الإجابة على سؤال «لماذا تريد الانضمام؟» قصيرة جداً (20 حرفاً على الأقل)."
        : "Your answer to 'Why join?' is too short (at least 20 characters).";
    }
    const firstField = Object.keys(issues)[0];
    if (firstField) {
      return isAr
        ? `يوجد خطأ في حقل "${firstField}". تحقق من البيانات وأعد المحاولة.`
        : `There's an error in the "${firstField}" field. Please review and try again.`;
    }
    return isAr
      ? "تعذر إرسال الطلب. تحقق من البيانات وأعد المحاولة."
      : "Could not submit. Please review your data and try again.";
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const links = normaliseLinks(String(form.get("socialLinks") ?? ""));
    const email = String(form.get("email") ?? "").trim().toLowerCase();

    if (links.length === 0) {
      setState("error");
      setMessage(
        isAr
          ? "أضف رابطاً واحداً على الأقل لحسابك على وسائل التواصل الاجتماعي."
          : "Add at least one social media link.",
      );
      return;
    }

    setState("loading");
    setMessage("");

    try {
      const res = await fetch("/api/partners/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.get("fullName"),
          email,
          country: form.get("country"),
          socialLinks: links,
          mainPlatform: form.get("mainPlatform"),
          audienceSize: Number(form.get("audienceSize") || 0),
          whyJoin: form.get("whyJoin"),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data?.error === "validation" && data?.issues?.fieldErrors) {
          setState("error");
          setMessage(friendlyValidationError(data.issues.fieldErrors));
        } else {
          throw new Error(data?.detail || data?.error || "request_failed");
        }
        return;
      }
      setSubmittedEmail(email);
      setState(data.existing ? "existing" : "success");
      event.currentTarget.reset();
    } catch (err) {
      setState("error");
      setMessage(
        isAr
          ? "تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت وأعد المحاولة."
          : "Could not reach the server. Check your connection and try again.",
      );
      console.warn("[partners/apply]", (err as Error).message);
    }
  }

  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#00D4B3]/60 focus:bg-white/[0.07]";

  /* ── Success card (new application) ── */
  if (state === "success") {
    return (
      <div className="rounded-[28px] border border-emerald-400/20 bg-emerald-400/[0.06] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-8">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-8 w-8 shrink-0 text-emerald-400" />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
              {isAr ? "تم الاستلام" : "Application received"}
            </p>
            <h2 className="mt-0.5 text-xl font-black text-white">
              {isAr ? "طلبك في طريقه إلى الفريق" : "Your application is on its way"}
            </h2>
          </div>
        </div>

        <ol className={`mt-6 space-y-4 border-r-2 border-white/10 pr-4 text-sm text-white/70 leading-6 ${isAr ? "" : "border-r-0 border-l-2 pl-4 pr-0"}`}>
          <li className="relative">
            <span className={`absolute top-1 ${isAr ? "-right-[21px]" : "-left-[21px]"} h-2.5 w-2.5 rounded-full bg-emerald-400`} />
            {isAr
              ? <><strong className="text-white">أُرسل طلبك</strong> — سيراجعه الفريق خلال 1-3 أيام عمل.</>
              : <><strong className="text-white">Application sent</strong> — the team will review it within 1-3 business days.</>}
          </li>
          <li className="relative">
            <span className={`absolute top-1 ${isAr ? "-right-[21px]" : "-left-[21px]"} h-2.5 w-2.5 rounded-full bg-white/20`} />
            {isAr
              ? <>
                  <strong className="text-white">سجّل حساباً</strong> — أنشئ حساباً على GoTripza بنفس البريد الذي استخدمته:
                  <br />
                  <code className="mt-1 inline-block rounded-lg bg-white/[0.08] px-2 py-0.5 text-xs text-emerald-300 break-all">{submittedEmail}</code>
                </>
              : <>
                  <strong className="text-white">Create an account</strong> — sign up on GoTripza using the same email:
                  <br />
                  <code className="mt-1 inline-block rounded-lg bg-white/[0.08] px-2 py-0.5 text-xs text-emerald-300 break-all">{submittedEmail}</code>
                </>}
          </li>
          <li className="relative">
            <span className={`absolute top-1 ${isAr ? "-right-[21px]" : "-left-[21px]"} h-2.5 w-2.5 rounded-full bg-white/20`} />
            {isAr
              ? <><strong className="text-white">بعد الموافقة</strong> — يُفعَّل رابطك ورمزك تلقائياً وتبدأ العمولات.</>
              : <><strong className="text-white">After approval</strong> — your referral link and code activate automatically.</>}
          </li>
        </ol>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/partner/dashboard"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#060A13] transition hover:bg-white/90"
          >
            <LogIn className="h-4 w-4" />
            {isAr ? "الدخول إلى لوحة الشريك" : "Go to partner dashboard"}
          </Link>
          <button
            onClick={() => { setState("idle"); setSubmittedEmail(""); }}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-white/60 transition hover:bg-white/[0.05]"
          >
            {isAr ? "تقديم طلب آخر" : "Submit another application"}
          </button>
        </div>
      </div>
    );
  }

  /* ── Existing application card ── */
  if (state === "existing") {
    return (
      <div className="rounded-[28px] border border-amber-400/20 bg-amber-400/[0.06] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-8">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-8 w-8 shrink-0 text-amber-400" />
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-amber-400">
              {isAr ? "طلب موجود" : "Already applied"}
            </p>
            <h2 className="mt-0.5 text-xl font-black text-white">
              {isAr ? "وجدنا طلبك في قاعدة البيانات" : "We found your existing application"}
            </h2>
          </div>
        </div>
        <p className="mt-4 text-sm leading-7 text-white/60">
          {isAr
            ? <>البريد <code className="rounded bg-white/[0.08] px-1.5 py-0.5 text-amber-300 text-xs">{submittedEmail}</code> مسجّل مسبقاً. ادخل إلى لوحة الشريك لمتابعة حالة طلبك وإحصائياتك.</>
            : <>Email <code className="rounded bg-white/[0.08] px-1.5 py-0.5 text-amber-300 text-xs">{submittedEmail}</code> is already registered. Go to your dashboard to check your application status.</>}
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/partner/dashboard"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#060A13] transition hover:bg-white/90"
          >
            <ArrowRight className="h-4 w-4" />
            {isAr ? "الدخول إلى لوحة الشريك" : "Go to partner dashboard"}
          </Link>
        </div>
      </div>
    );
  }

  /* ── Default form ── */
  return (
    <form onSubmit={onSubmit} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-black/30 backdrop-blur-xl md:p-7">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-xs font-semibold text-white/55">{isAr ? "الاسم الكامل" : "Full name"}</span>
          <input name="fullName" required minLength={2} className={inputClass} placeholder={isAr ? "محمد يوسف" : "Your name"} />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-semibold text-white/55">{isAr ? "البريد الإلكتروني" : "Email"}</span>
          <input name="email" type="email" required className={inputClass} placeholder="you@example.com" />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-semibold text-white/55">{isAr ? "الدولة" : "Country"}</span>
          <input name="country" required className={inputClass} placeholder={isAr ? "السعودية" : "Saudi Arabia"} />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-semibold text-white/55">{isAr ? "المنصة الرئيسية" : "Main platform"}</span>
          <select name="mainPlatform" required className={inputClass}>
            <option value="TikTok">TikTok</option>
            <option value="Instagram">Instagram</option>
            <option value="X">X</option>
            <option value="YouTube">YouTube</option>
            <option value="Snapchat">Snapchat</option>
            <option value="Website">Website</option>
          </select>
        </label>
        <label className="space-y-2">
          <span className="text-xs font-semibold text-white/55">{isAr ? "حجم الجمهور التقريبي" : "Audience size"}</span>
          <input name="audienceSize" type="number" min={0} required className={inputClass} placeholder="10000" />
        </label>
        <label className="space-y-2 md:col-span-2">
          <span className="text-xs font-semibold text-white/55">{isAr ? "روابط حساباتك" : "Social links"}</span>
          <textarea
            name="socialLinks"
            required
            rows={3}
            className={inputClass}
            placeholder={isAr ? "https://instagram.com/yourhandle\nhttps://tiktok.com/@yourhandle" : "https://instagram.com/yourhandle\nhttps://tiktok.com/@yourhandle"}
          />
          <p className="text-[11px] text-white/35 leading-relaxed">
            {isAr
              ? "رابط كامل لكل حساب — مثال: https://instagram.com/yourhandle (سطر لكل رابط)"
              : "Full URL per account — e.g. https://instagram.com/yourhandle (one per line)"}
          </p>
        </label>
        <label className="space-y-2 md:col-span-2">
          <span className="text-xs font-semibold text-white/55">{isAr ? "لماذا تريد الانضمام؟" : "Why do you want to join?"}</span>
          <textarea
            name="whyJoin"
            required
            minLength={20}
            rows={4}
            className={inputClass}
            placeholder={isAr ? "حدثنا عن جمهورك ونوع محتوى السفر الذي تقدمه." : "Tell us about your audience and travel content."}
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={state === "loading"}
        className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] px-5 py-3 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        {state === "loading"
          ? isAr ? "جارٍ الإرسال..." : "Submitting..."
          : isAr ? "إرسال طلب الانضمام" : "Apply to join"}
      </button>

      {state === "error" && message && (
        <p className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-100">
          {message}
        </p>
      )}
    </form>
  );
}
