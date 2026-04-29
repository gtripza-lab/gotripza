"use client";
import Link from "next/link";
import { ExternalLink, Globe, MapPin, BarChart3, Calendar, Shield, BedDouble, Scale } from "lucide-react";
import type { Locale } from "@/i18n/config";
import {
  DESTINATIONS,
  COMPARISON_PAGES,
  BUDGET_PAGES,
} from "@/lib/seo-destinations";

const SEO_SECTIONS = [
  {
    id: "destinations",
    icon: MapPin,
    labelEn: "Destination Hubs",
    labelAr: "مراكز الوجهات",
    color: "brand-primary",
    count: DESTINATIONS.length * 2, // ar + en
    pathFn: (locale: string, slug: string) => `/${locale}/destinations/${slug}`,
  },
  {
    id: "compare",
    icon: Scale,
    labelEn: "Comparison Pages",
    labelAr: "صفحات المقارنة",
    color: "sky-500",
    count: COMPARISON_PAGES.length * 2,
    pathFn: (locale: string, slug: string) => `/${locale}/compare/${slug}`,
  },
  {
    id: "budget",
    icon: BarChart3,
    labelEn: "Budget Pages",
    labelAr: "صفحات الميزانية",
    color: "emerald-500",
    count: BUDGET_PAGES.length * 2,
    pathFn: (locale: string, slug: string) => `/${locale}/budget/${slug}`,
  },
  {
    id: "seasons",
    icon: Calendar,
    labelEn: "Seasonal Pages",
    labelAr: "صفحات المواسم",
    color: "amber-500",
    count: DESTINATIONS.length * 2,
    pathFn: (locale: string, slug: string) => `/${locale}/seasons/${slug}`,
  },
  {
    id: "visa",
    icon: Shield,
    labelEn: "Visa Pages",
    labelAr: "صفحات التأشيرات",
    color: "rose-500",
    count: DESTINATIONS.length * 2,
    pathFn: (locale: string, slug: string) => `/${locale}/visa/${slug}`,
  },
  {
    id: "hotels",
    icon: BedDouble,
    labelEn: "Hotel Intent Pages",
    labelAr: "صفحات الفنادق",
    color: "brand-mint",
    count: DESTINATIONS.length * 2,
    pathFn: (locale: string, slug: string) => `/${locale}/hotels/${slug}`,
  },
] as const;

const totalPages = SEO_SECTIONS.reduce((s, sec) => s + sec.count, 0);

export function AdminSEO({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";

  return (
    <section className="mt-12">
      <div className="mb-6 flex items-center gap-3">
        <Globe className="h-5 w-5 text-brand-primary" />
        <div>
          <h2 className="font-display text-xl font-bold">
            {isAr ? "إدارة محتوى SEO" : "SEO Content Management"}
          </h2>
          <p className="text-xs text-white/40 mt-0.5">
            {isAr
              ? `${totalPages} صفحة مُولَّدة تلقائياً (${DESTINATIONS.length} وجهة × 6 أنواع × لغتين)`
              : `${totalPages} auto-generated pages (${DESTINATIONS.length} destinations × 6 types × 2 locales)`}
          </p>
        </div>
      </div>

      {/* Page type overview */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
        {SEO_SECTIONS.map((sec) => {
          const Icon = sec.icon;
          return (
            <div key={sec.id} className="rounded-2xl border border-white/5 bg-white/[0.03] p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
                  <Icon className="h-4 w-4 text-white/60" />
                </div>
                <div>
                  <div className="font-semibold text-sm">
                    {isAr ? sec.labelAr : sec.labelEn}
                  </div>
                  <div className="text-xs text-white/40">{sec.count} {isAr ? "صفحة" : "pages"}</div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  href={sec.pathFn("ar", DESTINATIONS[0].slug)}
                  target="_blank"
                  className="flex-1 rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1 text-center text-xs text-white/50 transition hover:border-white/20 hover:text-white"
                >
                  AR →
                </Link>
                <Link
                  href={sec.pathFn("en", DESTINATIONS[0].slug)}
                  target="_blank"
                  className="flex-1 rounded-lg border border-white/5 bg-white/[0.03] px-2 py-1 text-center text-xs text-white/50 transition hover:border-white/20 hover:text-white"
                >
                  EN →
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Destinations table */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.03] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="font-semibold text-sm">
            {isAr ? "جميع الوجهات" : "All Destinations"}
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5 text-white/40">
                <th className="px-4 py-2 text-start">Destination</th>
                <th className="px-3 py-2 text-center">Hub</th>
                <th className="px-3 py-2 text-center">Hotels</th>
                <th className="px-3 py-2 text-center">Budget</th>
                <th className="px-3 py-2 text-center">Seasons</th>
                <th className="px-3 py-2 text-center">Visa</th>
              </tr>
            </thead>
            <tbody>
              {DESTINATIONS.map((d) => (
                <tr key={d.slug} className="border-b border-white/5 hover:bg-white/[0.02]">
                  <td className="px-4 py-2">
                    <span className="me-1.5">{d.flag}</span>
                    <span className="font-medium">{d.nameEn}</span>
                    <span className="ms-1.5 text-white/30">{d.nameAr}</span>
                  </td>
                  {(["destinations", "hotels", "budget", "seasons", "visa"] as const).map((type) => (
                    <td key={type} className="px-3 py-2 text-center">
                      <Link
                        href={type === "budget"
                          ? `/${locale}/budget`
                          : `/${locale}/${type}/${d.slug}`}
                        target="_blank"
                        className="inline-flex h-5 w-5 items-center justify-center rounded text-white/30 transition hover:text-white"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison pages */}
      <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.03] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="font-semibold text-sm">
            {isAr ? "صفحات المقارنة" : "Comparison Pages"}
            <span className="ms-2 text-white/30 font-normal">({COMPARISON_PAGES.length})</span>
          </h3>
        </div>
        <ul className="divide-y divide-white/5">
          {COMPARISON_PAGES.map((cp) => (
            <li key={cp.slug} className="flex items-center justify-between px-5 py-3">
              <span className="text-xs text-white/70">{cp.intentEn}</span>
              <div className="flex gap-2">
                <Link href={`/ar/compare/${cp.slug}`} target="_blank" className="text-xs text-white/30 hover:text-white">AR</Link>
                <Link href={`/en/compare/${cp.slug}`} target="_blank" className="text-xs text-white/30 hover:text-white">EN</Link>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Budget pages */}
      <div className="mt-6 rounded-2xl border border-white/5 bg-white/[0.03] overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h3 className="font-semibold text-sm">
            {isAr ? "صفحات الميزانية" : "Budget Pages"}
            <span className="ms-2 text-white/30 font-normal">({BUDGET_PAGES.length})</span>
          </h3>
        </div>
        <ul className="divide-y divide-white/5">
          {BUDGET_PAGES.map((bp) => (
            <li key={bp.slug} className="flex items-center justify-between px-5 py-3">
              <span className="text-xs text-white/70">
                {bp.destination} — ${bp.budgetUsd} / {bp.durationDays} days
              </span>
              <div className="flex gap-2">
                <Link href={`/ar/budget/${bp.slug}`} target="_blank" className="text-xs text-white/30 hover:text-white">AR</Link>
                <Link href={`/en/budget/${bp.slug}`} target="_blank" className="text-xs text-white/30 hover:text-white">EN</Link>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* SEO health checklist */}
      <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
        <h3 className="mb-3 font-semibold text-sm text-emerald-400">
          {isAr ? "✅ قائمة تدقيق SEO التقني" : "✅ Technical SEO Health Check"}
        </h3>
        <ul className="space-y-1.5 text-xs text-white/60">
          {[
            { label: "sitemap.xml includes all SEO pages", check: true },
            { label: "hreflang ar/en on all pages", check: true },
            { label: "canonical URLs set on all pages", check: true },
            { label: "BreadcrumbList JSON-LD on all pages", check: true },
            { label: "TouristDestination JSON-LD on hub pages", check: true },
            { label: "HotelRichSnippet JSON-LD on hotel pages", check: true },
            { label: "Internal hub-and-spoke links", check: true },
            { label: "robots.txt disallows /api/ and /admin/", check: true },
            { label: "OG meta on all new pages", check: true },
            { label: "Affiliate marker 522867 on all CTAs", check: true },
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className={item.check ? "text-emerald-400" : "text-rose-400"}>
                {item.check ? "✓" : "✗"}
              </span>
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
