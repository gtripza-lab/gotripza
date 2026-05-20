"use client";

import type { Locale } from "@/i18n/config";
import { logEvent } from "@/lib/events";
import { trackClick } from "@/lib/trackClick";

export type TravelerServiceCard = {
  icon: string;
  name_ar: string;
  name_en: string;
  tagline_ar: string;
  tagline_en: string;
  desc_ar: string;
  desc_en: string;
  cta_ar: string;
  cta_en: string;
  url: string;
  provider: string;
  resultType: "flight" | "activities" | "insurance" | "esim" | "car_rental" | "trains" | "compensation" | "partner";
  accentBg: string;
  accentText: string;
  accentBorder: string;
  accentButton: string;
};

export function TravelerServicesGrid({
  services,
  locale,
}: {
  services: TravelerServiceCard[];
  locale: Locale;
}) {
  const isAr = locale === "ar";

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((s) => (
        <a
          key={s.name_en}
          href={s.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => {
            logEvent("traveler_service_clicked", {
              provider: s.provider,
              resultType: s.resultType,
              locale,
            });
            void trackClick({
              resultType: s.resultType,
              provider: s.provider,
              destination: "traveler-services",
              affiliateUrl: s.url,
              locale,
            });
          }}
          className={`group flex flex-col rounded-2xl border ${s.accentBorder} ${s.accentBg} p-6 transition-all duration-200 hover:scale-[1.01] hover:shadow-md`}
        >
          <div className="mb-4 flex items-start justify-between">
            <span className="text-3xl">{s.icon}</span>
            <span className={`rounded-full border ${s.accentBorder} bg-white/[0.06] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${s.accentText}`}>
              {isAr ? "رابط موثق" : "Tracked link"}
            </span>
          </div>

          <h2 className="text-base font-bold text-white/90">
            {isAr ? s.name_ar : s.name_en}
          </h2>
          <p className={`mt-0.5 text-xs font-medium ${s.accentText}`}>
            {isAr ? s.tagline_ar : s.tagline_en}
          </p>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-white/55">
            {isAr ? s.desc_ar : s.desc_en}
          </p>

          <div className={`mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold text-white transition-all group-hover:gap-2.5 ${s.accentButton}`}>
            {isAr ? s.cta_ar : s.cta_en}
            <span className="transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">→</span>
          </div>
        </a>
      ))}
    </div>
  );
}
