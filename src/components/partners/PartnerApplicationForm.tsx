"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

type FormState = "idle" | "loading" | "success" | "error";

export function PartnerApplicationForm({ locale = "ar" }: { locale?: string }) {
  const isAr = locale === "ar";
  const [state, setState] = useState<FormState>("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const links = String(form.get("socialLinks") ?? "")
      .split(/\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);

    setState("loading");
    setMessage("");

    try {
      const res = await fetch("/api/partners/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.get("fullName"),
          email: form.get("email"),
          country: form.get("country"),
          socialLinks: links,
          mainPlatform: form.get("mainPlatform"),
          audienceSize: Number(form.get("audienceSize") || 0),
          whyJoin: form.get("whyJoin"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.detail || data?.error || "request_failed");
      setState("success");
      setMessage(
        data.existing
          ? isAr
            ? "طلبك موجود لدينا بالفعل. سنراجع حالته قريباً."
            : "Your application already exists. We'll review it soon."
          : isAr
            ? "تم إرسال طلبك. بعد الموافقة سيعمل رابطك وكودك تلقائياً."
            : "Application received. Your referral link and code activate after approval.",
      );
      event.currentTarget.reset();
    } catch (err) {
      setState("error");
      setMessage(
        isAr
          ? "تعذر إرسال الطلب. تأكد من الروابط والبيانات ثم حاول مرة أخرى."
          : "Could not submit the application. Check your links and try again.",
      );
      console.warn("[partners/apply]", (err as Error).message);
    }
  }

  const inputClass =
    "w-full rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#00D4B3]/60 focus:bg-white/[0.07]";

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
            placeholder={isAr ? "ضع كل رابط في سطر منفصل" : "One link per line"}
          />
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
        {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : state === "success" ? <CheckCircle2 className="h-4 w-4" /> : <Send className="h-4 w-4" />}
        {state === "loading"
          ? isAr ? "جارٍ الإرسال..." : "Submitting..."
          : isAr ? "إرسال طلب الانضمام" : "Apply to join"}
      </button>

      {message && (
        <p className={`mt-4 rounded-2xl px-4 py-3 text-sm ${state === "error" ? "border border-red-400/20 bg-red-400/10 text-red-100" : "border border-emerald-400/20 bg-emerald-400/10 text-emerald-100"}`}>
          {message}
        </p>
      )}
    </form>
  );
}
