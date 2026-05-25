import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MessageCircle, ShieldCheck, Sparkles } from "lucide-react";
import { indexableLocales, isLocale, type Locale } from "@/i18n/config";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/JsonLd";
import { SeoBreadcrumb } from "@/components/seo/InternalLinks";
import {
  getSeoIntentPage,
  getSeoIntentPages,
  intentDescription,
  intentFaq,
  intentTitle,
  pageSubject,
} from "@/lib/seo-intent-pages";
import { formatBestMonths } from "@/lib/seo-destinations";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

type Props = { params: Promise<{ locale: string; slug: string }> };

export async function generateStaticParams() {
  return getSeoIntentPages().flatMap((page) => [
    ...indexableLocales.map((locale) => ({ locale, slug: page.slug })),
  ]);
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  if (!isLocale(params.locale)) return {};
  const page = getSeoIntentPage(params.slug);
  if (!page) return {};
  const locale = params.locale as Locale;
  const title = `${intentTitle(page, locale)} — GoTripza`;
  const description = intentDescription(page, locale);

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE}/${locale}/guides/${page.slug}`,
      languages: {
        en: `${BASE}/en/guides/${page.slug}`,
        ar: `${BASE}/ar/guides/${page.slug}`,
        "x-default": `${BASE}/en/guides/${page.slug}`,
      },
    },
    openGraph: {
      type: "article",
      title,
      description,
      siteName: "GoTripza",
    },
  };
}

function guideBullets(kind: string, isAr: boolean, subject: string, months: string) {
  if (kind === "best-esim") {
    return isAr
      ? ["اختر باقة تكفي للخرائط والترجمة والمواصلات.", "فعّل الشريحة قبل الوصول أو في المطار.", "اسأل ريا عن حجم البيانات المناسب لمدة رحلتك."]
      : ["Choose enough data for maps, translation, and transport.", "Activate the eSIM before arrival or at the airport.", "Ask Rya which data size fits your trip length."];
  }
  if (kind === "safe-areas") {
    return isAr
      ? ["ابدأ بالمناطق المركزية والقريبة من النقل.", "تجنب التنقل المتأخر في مناطق غير مألوفة.", "اطلب من ريا فحص الحي قبل الحجز."]
      : ["Start with central areas close to transport.", "Avoid late-night movement in unfamiliar areas.", "Ask Rya to sanity-check a neighborhood before booking."];
  }
  if (kind === "country-budget") {
    return isAr
      ? ["ضع ميزانية يومية للطعام والتنقل والأنشطة.", "اترك هامشاً للطوارئ والمواصلات من المطار.", "ريا تستطيع تقسيم الميزانية حسب أسلوب سفرك."]
      : ["Set a daily budget for food, transport, and activities.", "Leave room for emergencies and airport transport.", "Rya can split the budget by your travel style."];
  }
  if (kind === "honeymoon") {
    return isAr
      ? [`أفضل الشهور غالباً: ${months}.`, "وازن بين الخصوصية وسهولة التنقل.", "اطلب من ريا خطة رومانسية بدون جدول مرهق."]
      : [`Strong months are usually: ${months}.`, "Balance privacy with easy movement.", "Ask Rya for a romantic plan without an exhausting schedule."];
  }
  if (kind === "digital-nomad") {
    return isAr
      ? ["اختر منطقة فيها إنترنت ومقاهي عمل جيدة.", "احسب الإقامة الشهرية قبل الأنشطة.", "ريا تساعدك تقارن بين الأحياء حسب الهدوء والتنقل."]
      : ["Choose an area with reliable internet and work-friendly cafes.", "Price monthly stay before activities.", "Rya can compare neighborhoods by calmness and mobility."];
  }
  if (kind === "cheapest-month") {
    return isAr
      ? ["السفر خارج الذروة يقلل السعر غالباً.", "قارن الشهر مع الطقس وليس السعر فقط.", `ريا تعرف أن ${subject} أفضل في: ${months}.`]
      : ["Off-peak travel often lowers fares.", "Compare the month against weather, not price alone.", `Rya knows ${subject} is strongest in: ${months}.`];
  }
  return isAr
    ? [`أفضل أشهر ${subject}: ${months}.`, "تجنب مواسم الزحام إذا كانت الراحة أهم من الفعاليات.", "ريا تساعدك تختار الوقت حسب الميزانية والطقس ونوع الرحلة."]
    : [`Best months for ${subject}: ${months}.`, "Avoid peak crowds if comfort matters more than events.", "Rya helps choose timing by budget, weather, and travel style."];
}

export default async function GuidePage(props: Props) {
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const isAr = locale === "ar";
  const page = getSeoIntentPage(params.slug);
  if (!page) notFound();

  const subject = pageSubject(page, locale);
  const destination = page.destination;
  const title = intentTitle(page, locale);
  const description = intentDescription(page, locale);
  const months = formatBestMonths(destination.bestMonths, locale);
  const bullets = guideBullets(page.kind, isAr, subject, months);
  const faqs = intentFaq(page, locale);
  const relatedGuides = getSeoIntentPages()
    .filter((item) => item.destination.slug === destination.slug && item.slug !== page.slug)
    .slice(0, 4);
  const breadcrumbs = [
    { name: isAr ? "الرئيسية" : "Home", url: `${BASE}/${locale}` },
    { name: isAr ? "أدلة السفر الذكية" : "Smart Travel Guides", url: `${BASE}/${locale}/guides/${page.slug}` },
    { name: title, url: `${BASE}/${locale}/guides/${page.slug}` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FaqJsonLd items={faqs} />
      <main className="min-h-screen bg-ink-950 pb-20 text-white" dir={isAr ? "rtl" : "ltr"}>
        <section className="mx-auto max-w-4xl px-5 py-12">
          <SeoBreadcrumb
            items={[
              { label: isAr ? "الرئيسية" : "Home", href: `/${locale}` },
              { label: isAr ? "أدلة السفر الذكية" : "Smart travel guides" },
            ]}
            locale={locale}
          />

          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
            <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
            {isAr ? "دليل مبني حول ريا" : "Built around Rya"}
          </div>

          <h1 className="mt-5 max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 md:text-base">
            {description}
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {bullets.map((bullet) => (
              <div key={bullet} className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
                <ShieldCheck className="mb-3 h-4 w-4 text-emerald-300" />
                <p className="text-sm leading-6 text-white/72">{bullet}</p>
              </div>
            ))}
          </div>

          <section className="mt-10 rounded-3xl border border-brand-primary/20 bg-brand-primary/10 p-6">
            <div className="flex items-center gap-2 text-brand-primary">
              <MessageCircle className="h-4 w-4" />
              <h2 className="font-display text-xl font-semibold">
                {isAr ? "كيف تجعل ريا هذا القرار أسهل؟" : "How Rya makes this easier"}
              </h2>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/72">
              {isAr
                ? `بدلاً من قراءة عشر صفحات عن ${subject}، تحدث مع ريا. ستأخذ ميزانيتك، نوع رحلتك، من يسافر معك، وما يقلقك، ثم تعطيك خطوة مناسبة: تخطيط، مقارنة، أو خدمة سفر مفيدة في وقتها.`
                : `Instead of reading ten pages about ${subject}, talk to Rya. She takes your budget, travel style, companions, and concerns, then gives the right next step: planning, comparison, or a useful travel service when it fits.`}
            </p>
            <Link
              href={`/${locale}/search?q=${encodeURIComponent(isAr ? `ساعديني أخطط ${subject}` : `Help me plan ${subject}`)}`}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-ink-950 transition hover:bg-white/90"
            >
              {isAr ? "ابدأ مع ريا" : "Start with Rya"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>

          <section className="mt-10 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="font-display text-lg font-semibold">
                {isAr ? "متى تظهر الخدمات؟" : "When services appear"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/65">
                {isAr
                  ? "ريا لا تدفع روابط مبكرة. إذا احتجت طيراناً أو تأميناً أو eSIM أو أنشطة، ستقترحها لأنها تخدم سياق رحلتك."
                  : "Rya does not push early links. If flights, insurance, eSIMs, or activities help your trip, she recommends them because they fit the context."}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <h2 className="font-display text-lg font-semibold">
                {isAr ? "ربط داخلي ذكي" : "Smart internal linking"}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                <Link className="rounded-full bg-white/10 px-3 py-2 text-white/70 hover:bg-white/15" href={`/${locale}/destinations/${destination.slug}`}>
                  {isAr ? `دليل ${destination.nameAr}` : `${destination.nameEn} guide`}
                </Link>
                <Link className="rounded-full bg-white/10 px-3 py-2 text-white/70 hover:bg-white/15" href={`/${locale}/seasons/${destination.slug}`}>
                  {isAr ? "أفضل وقت" : "Best time"}
                </Link>
                <Link className="rounded-full bg-white/10 px-3 py-2 text-white/70 hover:bg-white/15" href={`/${locale}/visa/${destination.slug}`}>
                  {isAr ? "الفيزا" : "Visa"}
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="font-display text-lg font-semibold">
              {isAr ? `أدلة مرتبطة بـ ${subject}` : `Related ${subject} guides`}
            </h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {relatedGuides.map((related) => (
                <Link
                  key={related.slug}
                  href={`/${locale}/guides/${related.slug}`}
                  className="rounded-xl border border-white/[0.07] bg-black/15 px-4 py-3 text-sm text-white/68 transition hover:border-brand-primary/35 hover:bg-brand-primary/10 hover:text-white"
                >
                  {intentTitle(related, locale)}
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="font-display text-lg font-semibold">
              {isAr ? "أسئلة شائعة" : "Frequently asked questions"}
            </h2>
            <div className="mt-4 space-y-3">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-xl bg-black/15 p-4">
                  <h3 className="text-sm font-semibold text-white/86">{faq.q}</h3>
                  <p className="mt-2 text-sm leading-7 text-white/62">{faq.a}</p>
                </div>
              ))}
            </div>
          </section>
        </section>
      </main>
    </>
  );
}
