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
import { BreadcrumbJsonLd, FaqJsonLd, HowToJsonLd } from "@/components/JsonLd";
import { InternalLinks, SeoBreadcrumb } from "@/components/seo/InternalLinks";
import type { Destination } from "@/lib/seo-destinations";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";
const MARKER = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER ?? "522867";

interface Props { params: Promise<{ locale: string; slug: string }> }

export async function generateStaticParams() {
  return DESTINATION_SLUGS.flatMap((slug) => [
    { locale: "ar", slug },
    { locale: "en", slug },
  ]);
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  if (!isLocale(params.locale)) return {};
  const dest = getDestination(params.slug);
  if (!dest) return {};
  const isAr = params.locale === "ar";
  const name = isAr ? dest.nameAr : dest.nameEn;
  const year = "2026";
  const isTurkey = dest.country === "Turkey";
  const intentName = isTurkey && params.slug !== "istanbul"
    ? isAr ? `${name} وتركيا` : `${dest.nameEn} / Turkey`
    : name;

  const title = isAr
    ? `متطلبات تأشيرة ${intentName} ${year} — الوثائق وطريقة التقديم`
    : `${dest.nameEn} Visa Requirements ${year} — Documents & How to Apply`;
  const description = isAr
    ? `دليل عملي لتأشيرة ${intentName}: هل تحتاج فيزا؟ التأشيرة الإلكترونية، الوثائق المطلوبة، مدة المعالجة، ونصائح ريا قبل السفر.`
    : `Practical ${dest.nameEn} visa guide: who needs a visa, e-Visa options, required documents, processing time, and Rya's travel tips.`;

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
    keywords: isAr
      ? `تأشيرة ${name}, متطلبات فيزا ${name}, فيزا ${dest.countryAr}, ${name} visa requirements, ريا`
      : `${dest.nameEn} visa requirements, ${dest.country} visa, ${dest.nameEn} eVisa, travel documents, Rya travel companion`,
    openGraph: { type: "website", title, description, siteName: "GoTripza" },
  };
}

// Well-known nationality groups for display
const GCC = ["SA", "AE", "KW", "QA", "BH", "OM"];
const GCC_LABEL = { en: "GCC nationals", ar: "مواطنو دول الخليج العربي" };
const EU_LABEL = { en: "EU / Schengen passport holders", ar: "حاملو جوازات الاتحاد الأوروبي" };
const WEST_LABEL = { en: "US / UK / AUS / CA / NZ", ar: "الولايات المتحدة، بريطانيا، أستراليا، كندا" };

function visaStatusLabel(status: "free" | "onArrival" | "eVisa" | "required", isAr: boolean) {
  const labels = {
    free: { ar: "غالباً بدون تأشيرة أو دخول ميسر", en: "often visa-free or very simple entry" },
    onArrival: { ar: "غالباً تأشيرة عند الوصول", en: "often visa on arrival" },
    eVisa: { ar: "غالباً تحتاج تأشيرة إلكترونية قبل السفر", en: "often requires an e-Visa before travel" },
    required: { ar: "غالباً تحتاج تأشيرة قبل السفر", en: "often requires a visa before travel" },
  };
  return isAr ? labels[status].ar : labels[status].en;
}

function destinationVisaContext(dest: Destination, isAr: boolean) {
  if (dest.country === "Turkey") {
    const isCappadocia = dest.slug === "cappadocia";
    return {
      title: isCappadocia
        ? isAr ? `إجابة سريعة: هل كابادوكيا لها تأشيرة خاصة؟` : `Quick answer: does Cappadocia have its own visa?`
        : isAr ? `إجابة سريعة عن تأشيرة ${dest.nameAr}` : `Quick answer for ${dest.nameEn} visa requirements`,
      body: isAr
        ? isCappadocia
          ? `${dest.nameAr} تتبع تركيا، لذلك لا توجد “فيزا كابادوكيا” منفصلة. تحتاج فقط إلى متطلبات دخول تركيا حسب جنسيتك، وغالباً تكون التأشيرة الإلكترونية مناسبة لكثير من المسافرين.`
          : `${dest.nameAr} تتبع تركيا، لذلك تحتاج إلى متطلبات دخول تركيا حسب جنسيتك. كثير من المسافرين يستطيعون استخدام التأشيرة الإلكترونية التركية قبل السفر.`
        : isCappadocia
          ? `${dest.nameEn} is in Turkey, so there is no separate “Cappadocia visa”. You only need to meet Turkey entry requirements for your nationality, and many travellers use the Turkish e-Visa system.`
          : `${dest.nameEn} follows Turkey entry rules. Many travellers can use the Turkish e-Visa system before travel, depending on nationality.`,
      tip: isAr
        ? isCappadocia
          ? "إذا كانت رحلتك إلى كابادوكيا عبر إسطنبول أو قيصري أو نفسهير، فمتطلبات الدخول هي نفسها متطلبات دخول تركيا."
          : "تحقق من evisa.gov.tr أو السفارة الرسمية قبل شراء التذاكر، خصوصاً إذا كان جوازك لا يدعم التأشيرة الإلكترونية."
        : isCappadocia
          ? "If you reach Cappadocia via Istanbul, Kayseri, or Nevsehir, the same Turkey entry rules apply."
          : "Check evisa.gov.tr or the official embassy before buying tickets, especially if your passport is not eligible for e-Visa.",
    };
  }

  return {
    title: isAr ? `إجابة سريعة عن تأشيرة ${dest.nameAr}` : `Quick answer for ${dest.nameEn} visa requirements`,
    body: isAr
      ? `متطلبات تأشيرة ${dest.nameAr} تعتمد على جنسيتك ومدة الرحلة. ابدأ من الجدول أدناه، ثم اطلب من ريا فحص حالتك حسب جوازك وتاريخ سفرك.`
      : `${dest.nameEn} visa requirements depend on nationality and trip length. Start with the table below, then ask Rya to check your case by passport and travel date.`,
    tip: isAr
      ? "تأكد دائماً من الموقع الحكومي أو السفارة قبل الحجز النهائي لأن قواعد التأشيرات تتغير."
      : "Always verify with the official government or embassy website before final booking because visa rules change.",
  };
}

function popularVisaQueries(dest: Destination, isAr: boolean) {
  if (isAr) {
    return [
      `متطلبات فيزا ${dest.nameAr}`,
      `هل ${dest.nameAr} تحتاج فيزا؟`,
      `تأشيرة ${dest.countryAr} الإلكترونية`,
      `وثائق السفر إلى ${dest.nameAr}`,
      `كم تستغرق فيزا ${dest.nameAr}`,
    ];
  }
  return [
    `${dest.nameEn} visa requirements`,
    `Do I need a visa for ${dest.nameEn}?`,
    `${dest.country} eVisa`,
    `${dest.nameEn} travel documents`,
    `${dest.nameEn} visa processing time`,
  ];
}

function officialCheckSteps(dest: Destination, isAr: boolean) {
  if (dest.country === "Turkey") {
    return isAr
      ? ["افتح موقع evisa.gov.tr الرسمي.", "اختر جنسيتك ونوع جوازك وتاريخ الوصول.", "تأكد أن الاسم ورقم الجواز مطابقان تماماً.", "احفظ نسخة PDF من التأشيرة واحتفظ بصورة على الجوال."]
      : ["Open the official evisa.gov.tr website.", "Select nationality, passport type, and arrival date.", "Make sure name and passport number match exactly.", "Save the PDF e-Visa and keep a phone copy."];
  }
  return isAr
    ? ["افتح الموقع الحكومي أو موقع السفارة الرسمي.", "اختر جنسيتك ومدة الرحلة والغرض من الزيارة.", "راجع الوثائق والرسوم ومدة المعالجة.", "احتفظ بنسخة رقمية ومطبوعة من الطلب والوثائق."]
    : ["Open the official government or embassy website.", "Select nationality, trip length, and travel purpose.", "Review documents, fees, and processing time.", "Keep digital and printed copies of the application and documents."];
}

export default async function VisaPage(props: Props) {
  const params = await props.params;
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
  const quick = destinationVisaContext(dest, isAr);
  const popularQueries = popularVisaQueries(dest, isAr);
  const officialSteps = officialCheckSteps(dest, isAr);

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
      <FaqJsonLd
        items={[
          {
            q: isAr ? `ما أسرع إجابة عن تأشيرة ${name}؟` : `What is the quick answer for ${dest.nameEn} visa requirements?`,
            a: quick.body,
          },
          {
            q: isAr ? `هل أحتاج تأشيرة لزيارة ${name}؟` : `Do I need a visa to visit ${dest.nameEn}?`,
            a: isAr ? dest.visaNotes.ar : dest.visaNotes.en,
          },
          {
            q: isAr ? `كم يستغرق الحصول على تأشيرة ${name}؟` : `How long does it take to get a ${dest.nameEn} visa?`,
            a: isAr
              ? dest.eVisa
                ? `التأشيرة الإلكترونية لـ${name} تُعالَج عادةً خلال 48-72 ساعة.`
                : `تأشيرة ${name} عبر السفارة تستغرق عادةً 4-8 أسابيع.`
              : dest.eVisa
              ? `The ${dest.nameEn} e-Visa is typically processed within 48–72 hours.`
              : `A ${dest.nameEn} embassy visa usually takes 4–8 weeks to process.`,
          },
          {
            q: isAr ? `هل يمكنني الحصول على تأشيرة ${name} عند الوصول؟` : `Can I get a ${dest.nameEn} visa on arrival?`,
            a: isAr
              ? dest.visaOnArrival.includes("ALL") || dest.visaOnArrival.includes("SA") || dest.visaOnArrival.includes("AE")
                ? `نعم، تأشيرة ${name} متاحة عند الوصول لكثير من الجنسيات.`
                : `تأشيرة ${name} عند الوصول غير متاحة لجميع الجنسيات. تحقق من السفارة.`
              : dest.visaOnArrival.includes("ALL") || dest.visaOnArrival.includes("US") || dest.visaOnArrival.includes("EU")
              ? `Yes, ${dest.nameEn} offers visa on arrival for many nationalities.`
              : `${dest.nameEn} visa on arrival is not available for all nationalities. Check with the embassy.`,
          },
          ...(dest.country === "Turkey" ? [{
            q: isAr ? "هل كابادوكيا تحتاج فيزا منفصلة عن تركيا؟" : "Does Cappadocia require a separate visa from Turkey?",
            a: isAr
              ? "لا. كابادوكيا داخل تركيا، لذلك تطبق متطلبات دخول تركيا نفسها ولا توجد تأشيرة منفصلة للمنطقة."
              : "No. Cappadocia is inside Turkey, so Turkey entry requirements apply and there is no separate regional visa.",
          }] : []),
          {
            q: isAr ? `كم تكلفة تأشيرة ${name}؟` : `How much does a ${dest.nameEn} visa cost?`,
            a: isAr
              ? `تتفاوت رسوم تأشيرة ${name} حسب الجنسية ونوع التأشيرة. راجع الموقع الرسمي للتأكد من الرسوم الحالية.`
              : `${dest.nameEn} visa fees vary by nationality and visa type. Check the official government website for current fees.`,
          },
        ]}
      />
      <HowToJsonLd
        name={isAr ? `كيف تحصل على تأشيرة ${name}` : `How to Get a ${dest.nameEn} Visa`}
        description={isAr ? `دليل خطوة بخطوة للحصول على تأشيرة ${name}` : `Step-by-step guide to applying for a ${dest.nameEn} visa`}
        steps={isAr ? [
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
        ]}
      />

      <main className="min-h-screen bg-ink-950 text-white pb-20 md:pb-0" dir={isAr ? "rtl" : "ltr"}>
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

          <section className="mt-6 rounded-2xl border border-brand-primary/20 bg-brand-primary/[0.08] p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-primary/80">
              {isAr ? "مختصر مفيد" : "Short answer"}
            </p>
            <h2 className="mt-2 font-display text-xl font-bold text-white">
              {quick.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/72">
              {quick.body}
            </p>
            <p className="mt-3 rounded-xl bg-black/20 px-3 py-2 text-xs leading-6 text-white/55">
              {quick.tip}
            </p>
          </section>

          <section className="mt-6 glass rounded-2xl p-6">
            <h2 className="font-display text-lg font-bold">
              {isAr ? "ما الذي يبحث عنه المسافرون؟" : "Popular searches this page answers"}
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {popularQueries.map((query) => (
                <span key={query} className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-white/58">
                  {query}
                </span>
              ))}
            </div>
          </section>

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
            <p className="mt-4 text-xs leading-6 text-white/45">
              {isAr
                ? `للمسافرين من الخليج: ${visaStatusLabel(gccStatus, true)}. إذا كانت جنسيتك مختلفة، اطلب من ريا فحص الحالة حسب جوازك قبل الحجز.`
                : `For GCC travellers: ${visaStatusLabel(gccStatus, false)}. If your passport is different, ask Rya to check your exact case before booking.`}
            </p>
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

          <section className="mt-6 glass rounded-2xl p-6">
            <h2 className="mb-4 font-display text-lg font-bold">
              {isAr ? "كيف تتحقق من المتطلبات الرسمية؟" : "How to verify official requirements"}
            </h2>
            <ol className="space-y-3">
              {officialSteps.map((step, index) => (
                <li key={step} className="flex items-start gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-xs font-bold text-white/70">
                    {index + 1}
                  </span>
                  <span className="text-sm leading-6 text-white/68">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-6 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5">
              <h2 className="font-display text-base font-bold">
                {isAr ? "قبل الحجز" : "Before booking"}
              </h2>
              <p className="mt-2 text-sm leading-7 text-white/58">
                {isAr
                  ? `تأكد من صلاحية الجواز، تاريخ الوصول، واسم المسافر قبل شراء تذاكر ${name}. إذا كان عندك توقف في دولة أخرى، افحص متطلبات الترانزيت أيضاً.`
                  : `Check passport validity, arrival date, and traveller name before buying ${dest.nameEn} tickets. If you transit through another country, check transit rules too.`}
              </p>
            </div>
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-5">
              <h2 className="font-display text-base font-bold">
                {isAr ? "ما الذي تسأله ريا؟" : "What to ask Rya"}
              </h2>
              <p className="mt-2 text-sm leading-7 text-white/58">
                {isAr
                  ? `اكتب: “أنا أحمل جواز [الجنسية] وأسافر إلى ${name} في [الشهر] لمدة [عدد الأيام]، هل أحتاج فيزا؟”`
                  : `Write: “I hold a [nationality] passport and travel to ${dest.nameEn} in [month] for [days]. Do I need a visa?”`}
              </p>
            </div>
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

          {/* Ask Raya CTA */}
          <div className="mt-10 rounded-3xl bg-gradient-to-br from-green-600/20 to-blue-600/20 border border-green-500/30 p-8 text-center">
            <div className="text-3xl mb-3">🛂</div>
            <h3 className="text-xl font-bold text-white mb-2">
              {isAr ? `اسألي ريا عن تأشيرة ${name}` : `Ask Raya about your ${dest.nameEn} visa`}
            </h3>
            <p className="text-white/60 mb-5 text-sm">
              {isAr ? "ريا تعرف متطلبات التأشيرة لجنسيتك وتساعدك في التخطيط" : "Raya knows visa requirements for your nationality and helps you plan accordingly"}
            </p>
            <a
              href={`/${locale}/search?q=${encodeURIComponent(isAr ? `تأشيرة ${name} كيف أحصل عليها` : `${dest.nameEn} visa requirements how to apply`)}`}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-green-600 to-blue-600 px-8 py-3 text-sm font-bold text-white shadow-lg hover:opacity-90 transition-opacity"
            >
              {isAr ? "اسألي ريا" : "Ask Raya"}
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
