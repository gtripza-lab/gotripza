"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const locale = (params?.locale as string) ?? "ar";
  const isAr = locale === "ar";

  useEffect(() => {
    console.error("[GoTripza Error]", error);
  }, [error]);

  return (
    <main
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-[80vh] flex items-center justify-center px-6"
    >
      <div className="text-center max-w-md">
        <p className="text-6xl mb-4 select-none">⚠️</p>
        <h1 className="font-display text-3xl font-bold mb-3 text-white">
          {isAr ? "حدث خطأ غير متوقع" : "Something went wrong"}
        </h1>
        <p className="text-white/55 mb-8 leading-relaxed text-sm">
          {isAr ? (
            <>
              حدث خطأ غير متوقع. يرجى المحاولة مجدداً — إذا استمرت المشكلة،
              تواصل معنا على{" "}
              <a href="mailto:hello@gotripza.com" className="text-brand-primary hover:underline">
                hello@gotripza.com
              </a>
            </>
          ) : (
            <>
              An unexpected error occurred. Please try again — if the problem
              persists, contact us at{" "}
              <a href="mailto:hello@gotripza.com" className="text-brand-primary hover:underline">
                hello@gotripza.com
              </a>
            </>
          )}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-primary/90"
          >
            {isAr ? "↺ حاول مجدداً" : "↺ Try Again"}
          </button>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/70 transition hover:border-white/30 hover:text-white"
          >
            {isAr ? "← الرئيسية" : "← Go Home"}
          </Link>
        </div>
      </div>
    </main>
  );
}
