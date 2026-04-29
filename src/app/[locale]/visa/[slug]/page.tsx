import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, Shield, CheckCircle2, XCircle, Globe, Clock } from "lucide-react";
import { isLocale, type Locale } from "@/i18n/config";
import {
  DESTINATION_SLUGS,
  getDestination,
  COMPARISON_PAGES,
  BUDGET_PAGES,
} from "@/lib/seo-destinations";
import { BreadcrumbJsonLd } from "@/components/JsonLd";
import { InternalLinks, SeoBreadcrumb } from "@/components/seo/InternalLinks";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";
const MARKER = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER ?? "522867";

interface Props { params: { locale: string; slug: string } }

export async function generateStaticParams() {
  return DESTINATION_SLUGS.flatMap((slug) => [
    { locale: "ar", slug },
    { locale: "en", slug },
  ]);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isLocale(params.locale)) return {};
  const dest = getDestination(params.slug);
  if (!dest) return {};
  const isAr = params.locale === "ar";
  const name = isAr ? dest.nameAr : dest.nameEn;

  const title = isAr
    ? `تأشيرة ${name} — المتطلبات والتطبيق 2025 | GoTripza`
    : `${dest.nameEn} Visa Requirements & How to Apply 2025 | GoTripza`;
  const description = isAr
    ? `دليل تأشيرة ${name} الشامل: من يحتاج تأشيرة؟ التأشيرة الإلكترونية، الوثائق المطلوبة، والنصائح العملية.`
    : `Complete ${dest.nameEn} visa guide: who needs a visa, e-Visa options, required documents, and practical application tips.`;

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE}/${params.locale}/visa/${params.slug}`,
      languages: {
        en: `${BASE}/en/visa/${params.slug}`,
        ar: `${BASE}/ar/visa/${params.slug}`,
        "x-default": `${BASE}/en/visa/${params.slug}`,
      },
    },
    openGraph: { type: "website", title, description, siteName: "GoTripza" },
  };
}

// Well-known nationality groups for display
const GCC = ["SA", "AE", "KW", "QA", "BH", "OM"];
const GCC_LABEL = { en: "GCC nationals", ar: "مواطنو دول الخليج العربي" };
const EU_LABEL = { en: "EU / Schengen passport holders", ar: "حاملو جوازات الاتحاد الأوروبي" };
const WEST_LABEL = { en: "US / UK / AUS / CA / NZ", ar: "الولايات المتحدة، بريطانيا، أستراليا، كندا" };

export default async function VisaPage({ params }: Props) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isAr = locale === "ar";

  const dest = getDestination(params.slug);
  if (!dest) notFound();

  const name = isAr ? dest.nameAr : dest.nameEn;
  const flightUrl = `https://www.aviasales.com/?marker=${MARKER}&destination=${dest.iata}&subid=visa_page`;

  // Determine GCC visa status
  const gccFree = dest.visaFree.includes("SA") || dest.visaFree.includes("AE")
    || dest.visaFree.includes("GCC") || (dest.visaOnArrival.includes("ALL"));
  const gccOnArrival = !gccFree && (dest.visaOnArrival.some((c) => GCC.includes(c)) || dest.visaOnArrival.includes("ALL"));
  const gccStatus = gccFree ? "free" : gccOnArrival ? "onArrival" : dest.eVisa ? "eVisa" : "required";

  const visaRows = [
    {
      group: GCC_LABEL,
      status: gccStatus,
    },
    {
      group: EU_LABEL,
      status: dest.visaFree.includes("EU") ? "free" : dest.visaOnArrival.includes("EU") ? "onArrival" : dest.eVisa ? "eVisa" : "required",
    },
    {
      group: WEST_LABEL,
      status: dest.visaFree.includes("US") ? "free" : dest.visaOnArrival.includes("US") ? "onArrival" : dest.eVisa ? "eVisa" : "required",
    },
  ] as const;

  const STATUS_CONFIG = {
    free: {
      icon: CheckCircle2,
      color: "emerald",
      label: { en: "Visa-free", ar: "بدون تأشيرة" },
    },
    onArrival: {
      icon: CheckCircle2,
      color: "sky",
      label: { en: "Visa on arrival", ar: "تأشيرة عند الوصول" },
    },
    eVisa: {
      icon: Globe,
      color: "amber",
      label: { en: "e-Visa required", ar: "تأشيرة إلكترونية" },
    },
    required: {
      icon: XCircle,
      color: "rose",
      label: { en: "Visa required", ar: "تأشيرة مطلوبة" },
    },
  };

  const budgetPages = BUDGET_PAGES.filter((b) => b.destination === params.slug);
  const comparisons = COMPARISON_PAGES.filter(
    (c) => c.destA === params.slug || c.destB === params.slug,
  );

  const internalLinks = [
    {
      href: `/${locale}/destinations/${params.slug}`,
      label: isAr ? `دليل ${name} الشامل` : `Complete ${dest.nameEn} guide`,
      icon: dest.flag,
    },
    {
      href: `/${locale}/seasons/${params.slug}`,
      label: isAr ? `أفضل وقت لزيارة ${name}` : `Best time to visit ${dest.nameEn}`,
      icon: "📅",
    },
    ...budgetPages.slice(0, 1).map((b) => ({
      href: `/${locale}/budget/${b.slug}`,
      label: isAr ? `ميزانية ${name}` : `${dest.nameEn} budget guide`,
      icon: "💰",
    })),
    ...comparisons.slice(0, 2).map((c) => ({
      href: `/${locale}/compare/${c.slug}`,
      label: isAr ? c.intentAr : c.intentEn,
      icon: "⚖️",
    })),
  ];

  const breadcrumbs = [
    { name: isAr ? "الرئيسية" : "Home", url: `${BASE}/${locale}` },
    { name: isAr ? "دليل التأشيرات" : "Visa Guides", url: `${BASE}/${locale}/visa` },
    { name: isAr ? `تأشيرة ${name}` : `${dest.nameEn} Visa`, url: `${BASE}/${locale}/visa/${params.slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />

      <main className="min-h-screen bg-ink-950 text-white" dir={isAr ? "rtl" : "ltr"}>
        <div className="container mx-auto max-w-3xl px-4 py-12">
          <SeoBreadcrumb
            items={[
              { label: isAr ? "الرئيسية" : "Home", href: `/${locale}` },
              { label: isAr ? "التأشيرات" : "Visa Guides" },
            ]}
            locale={locale}
          />

          <div className="mt-4 flex items-center gap-3">
            <span className="text-4xl">{dest.flag}</span>
            <h1 className="font-display text-2xl font-bold md:text-3xl">
              {isAr
                ? `تأشيرة ${name} — دليل 2025 الشامل`
                : `${dest.nameEn} Visa Requirements — 2025 Guide`}
            </h1>
          </div>

          {/* Key info banner */}
          <div className="mt-5 glass rounded-2xl p-5">
            <p className="text-sm leading-relaxed text-white/75">
              {isAr ? dest.visaNotes.ar : dest.visaNotes.en}
            </p>
            {dest.eVisa && (
              <div className="mt-3 flex items-center gap-2 text-sm text-amber-400">
                <Globe className="h-4 w-4" />
                {isAr ? "التأشيرة الإلكترونية متاحة عبر الإنترنت" : "e-Visa available online"}
              </div>
            )}
          </div>

          {/* Nationality grid */}
          <section className="mt-6 glass rounded-2xl p-6">
            <h2 className="mb-4 font-display text-lg font-bold">
              {isAr ? "متطلبات التأشيرة حسب الجنسية" : "Visa Requirements by Nationality"}
            </h2>
            <div className="space-y-3">
              {visaRows.map((row, i) => {
                const cfg = STATUS_CONFIG[row.status];
                const Icon = cfg.icon;
                return (
                  <div
                    key={i}
                    className={`flex items-center justify-between rounded-xl border border-${cfg.color}-500/20 bg-${cfg.color}-500/10 px-4 py-3`}
                  >
                    <span className="text-sm text-white/75">
                      {isAr ? row.group.ar : row.group.en}
                    </span>
                    <div className={`flex items-center gap-1.5 text-${cfg.color}-400 text-sm font-medium`}>
                      <Icon className="h-4 w-4" />
                      {isAr ? cfg.label.ar : cfg.label.en}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* How to apply */}
          <section className="mt-6 glass rounded-2xl p-6">
            <h2 className="mb-4 font-display text-lg font-bold">
              {isAr ? "كيف تتقدم بطلب التأشيرة؟" : "How to Apply for a Visa"}
            </h2>
            <ol className="space-y-3">
              {(isAr ? [
                `تحقق من متطلبات تأشيرة ${name} لجنسيتك`,
                "جهّز الوثائق: جواز سفر ساري، صور شخصية، حجز فندق وطيران",
                "إذا كانت التأشيرة الإلكترونية متاحة، تقدم بها قبل السفر بـ 48-72 ساعة",
                "للتأشيرة في السفارة، تقدم قبل 4-8 أسابيع من السفر",
                "احتفظ بنسخة رقمية ومطبوعة من جميع الوثائق",
              ] : [
                `Check ${dest.nameEn} visa requirements for your nationality`,
                "Prepare documents: valid passport, photos, hotel + flight bookings, bank statements",
                "If e-Visa is available, apply 48–72 hours before travel",
                "For embassy visas, apply 4–8 weeks in advance",
                "Keep digital and printed copies of all documents",
              ]).map((step, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-primary/20 text-xs font-bold text-brand-primary">
                    {i + 1}
                  </span>
                  <span className="text-sm text-white/70">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Required documents */}
          <section className="mt-6 glass rounded-2xl p-6">
            <h2 className="mb-4 font-display text-lg font-bold">
              {isAr ? "الوثائق المطلوبة عادةً" : "Typically Required Documents"}
            </h2>
            <ul className="space-y-2">
              {(isAr ? [
                "جواز سفر ساري المفعول لمدة 6 أشهر على الأقل",
                "صور شخصية حديثة (مقاس جواز السفر)",
                "تأكيد حجز الفندق",
                "تأكيد حجز رحلة الطيران (ذهاباً وإياباً)",
                "كشف حساب بنكي لآخر 3-6 أشهر",
                "تأمين سفر (موصى به في معظم الدول)",
              ] : [
                "Valid passport (minimum 6 months validity)",
                "Recent passport-sized photographs",
                "Hotel booking confirmation",
                "Return flight booking confirmation",
                "Bank statements (3–6 months)",
                "Travel insurance (recommended / required in some countries)",
              ]).map((doc, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-white/70">
                  <Shield className="h-3.5 w-3.5 text-brand-primary shrink-0" />
                  {doc}
                </li>
              ))}
            </ul>
          </section>

          {/* Important disclaimer */}
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
            <Clock className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-white/60 leading-relaxed">
              {isAr
                ? "تنبيه: معلومات التأشيرة عرضة للتغيير. تحقق دائماً من السفارة الرسمية أو الموقع الحكومي لـ" + name + " قبل سفرك."
                : `Disclaimer: Visa requirements change frequently. Always verify with the official ${dest.nameEn} embassy or government website before travelling.`}
            </p>
          </div>

          {/* CTA */}
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={flightUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-deep px-5 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]"
            >
              {isAr ? `ابحث عن أرخص طيران إلى ${name}` : `Find cheapest flights to ${dest.nameEn}`}
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>

          <InternalLinks
            title={isAr ? "روابط ذات صلة" : "Related Guides"}
            links={internalLinks}
            locale={locale}
          />
        </div>
      </main>
    </>
  );
}
