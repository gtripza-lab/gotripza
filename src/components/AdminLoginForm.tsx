"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n/config";

export function AdminLoginForm({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const [key, setKey]         = useState("");
  const [error, setError]     = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef              = useRef<HTMLInputElement>(null);
  const router                = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!key.trim()) return;
    setLoading(true);
    setError(false);

    // Navigate to same page with key param — Next.js Server Component
    // will validate it against ADMIN_KEY env var
    router.push(`/${locale}/admin?key=${encodeURIComponent(key.trim())}`);

    // Small delay so user sees spinner before server re-render
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setError(true); // If still on this page, key was wrong
    setKey("");
    inputRef.current?.focus();
  }

  return (
    <div className="w-full max-w-sm px-6" dir={isAr ? "rtl" : "ltr"}>
      {/* Logo / brand */}
      <div className="mb-8 text-center">
        <span className="font-display text-2xl font-bold text-white">GoTripza</span>
        <p className="mt-1 text-[13px] text-white/30">
          {isAr ? "لوحة تحكم الأدمن" : "Admin Dashboard"}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-white/[0.07] bg-white/[0.04] p-7 backdrop-blur"
      >
        <label className="block text-[13px] font-medium text-white/60 mb-2">
          {isAr ? "مفتاح الدخول" : "Admin Key"}
        </label>

        <input
          ref={inputRef}
          type="password"
          value={key}
          onChange={(e) => { setKey(e.target.value); setError(false); }}
          placeholder={isAr ? "أدخل مفتاح الأدمن" : "Enter admin key"}
          autoComplete="current-password"
          autoFocus
          className={[
            "w-full rounded-xl border px-4 py-3 text-sm text-white placeholder-white/20",
            "bg-white/[0.05] outline-none transition",
            error
              ? "border-red-500/60 focus:border-red-500"
              : "border-white/10 focus:border-brand-primary/60",
          ].join(" ")}
        />

        {error && (
          <p className="mt-2 text-xs text-red-400">
            {isAr ? "مفتاح غير صحيح. حاول مجدداً." : "Incorrect key. Please try again."}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !key.trim()}
          className="mt-5 w-full rounded-xl bg-brand-primary py-3 text-sm font-semibold text-white
                     transition hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {loading
            ? (isAr ? "جارٍ التحقق…" : "Checking…")
            : (isAr ? "دخول" : "Sign in")}
        </button>
      </form>

      <p className="mt-6 text-center text-[11px] text-white/20">
        {isAr
          ? "للوصول إلى لوحة التحكم يجب أن تكون مسؤولاً معتمداً"
          : "Authorized personnel only"}
      </p>
    </div>
  );
}
