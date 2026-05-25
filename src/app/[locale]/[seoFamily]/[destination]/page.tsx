import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, MapPin, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { indexableLocales, isLocale, type Locale } from "@/i18n/config";
import { BreadcrumbJsonLd, FaqJsonLd } from "@/components/JsonLd";
import { SeoBreadcrumb } from "@/components/seo/InternalLinks";
import { getDestination } from "@/lib/seo-destinations";
import {
  getGuideStaticParams,
  guideAnswer,
  guideDescription,
  guideFaq,
  guideFamilyTitle,
  guideSections,
  guideTitle,
  isSeoGuideFamily,
} from "@/lib/global-travel-guides";
import { seoCopy } from "@/lib/seo-localization";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

type Props = {
  params: Promise<{ locale: string; seoFamily: string; destination: string }>;
};

function alternates(seoFamily: string, destination: string) {
  return Object.fromEntries([
    ...indexableLocales.map((locale) => [
      locale,
      `${BASE}/${locale}/${seoFamily}/${destination}`,
    ]),
    ["x-default", `${BASE}/en/${seoFamily}/${destination}`],
  ]);
}

function JsonLdScript({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export async function generateStaticParams() {
  return getGuideStaticParams();
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  if (!isLocale(params.locale) || !isSeoGuideFamily(params.seoFamily)) return {};
  const destination = getDestination(params.destination);
  if (!destination) return {};

  const locale = params.locale as Locale;
  const title = guideTitle(params.seoFamily, destination, locale);
  const description = guideDescription(params.seoFamily, destination, locale);

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE}/${locale}/${params.seoFamily}/${destination.slug}`,
      languages: alternates(params.seoFamily, destination.slug),
    },
    openGraph: {
      type: "article",
      title,
      description,
      siteName: "Rya by GoTripza",
      url: `${BASE}/${locale}/${params.seoFamily}/${destination.slug}`,
    },
  };
}

export default async function GlobalSeoGuidePage(props: Props) {
  const params = await props.params;
  if (!isLocale(params.locale) || !isSeoGuideFamily(params.seoFamily)) notFound();
  const locale = params.locale as Locale;
  const isAr = locale === "ar";
  const copy = seoCopy(locale);
  const destination = getDestination(params.destination);
  if (!destination) notFound();

  const title = guideTitle(params.seoFamily, destination, locale);
  const description = guideDescription(params.seoFamily, destination, locale);
  const answer = guideAnswer(params.seoFamily, destination, locale);
  const sections = guideSections(params.seoFamily, destination, locale);
  const faqs = guideFaq(params.seoFamily, destination, locale);
  const pageUrl = `${BASE}/${locale}/${params.seoFamily}/${destination.slug}`;
  const sensitiveGuide = ["travel-safety", "travel-insurance", "travel-scams", "transportation", "esim"].includes(params.seoFamily);

  const breadcrumbs = [
    { name: isAr ? "الرئيسية" : "Home", url: `${BASE}/${locale}` },
    { name: guideFamilyTitle(params.seoFamily), url: `${BASE}/${locale}/${params.seoFamily}/${destination.slug}` },
    { name: title, url: pageUrl },
  ];

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url: pageUrl,
    inLanguage: locale,
    author: { "@type": "Organization", name: "Rya by GoTripza", url: BASE },
    publisher: { "@type": "Organization", name: "Rya by GoTripza", url: BASE },
    about: {
      "@type": "TouristDestination",
      name: destination.nameEn,
      address: { "@type": "PostalAddress", addressCountry: destination.country },
    },
  };

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <FaqJsonLd items={faqs} />
      <JsonLdScript data={webPageJsonLd} />

      <main className="min-h-screen bg-ink-950 pb-20 text-white" dir={isAr ? "rtl" : "ltr"}>
        <section className="mx-auto max-w-5xl px-5 py-12">
          <SeoBreadcrumb
            items={[
              { label: isAr ? "الرئيسية" : "Home", href: `/${locale}` },
              { label: guideFamilyTitle(params.seoFamily) },
            ]}
            locale={locale}
          />

          <div className="mt-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/60">
            <Sparkles className="h-3.5 w-3.5 text-brand-primary" />
            {copy.aiSearchReady}
          </div>

          <div className="mt-5 grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
            <div>
              <h1 className="max-w-3xl font-display text-3xl font-bold leading-tight md:text-5xl">
                {title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/68 md:text-base">
                {description}
              </p>
              <div className="mt-6 rounded-2xl border border-brand-primary/25 bg-brand-primary/10 p-5">
                <p className="text-sm font-semibold text-brand-primary">
                  {copy.shortAnswer}
                </p>
                <p className="mt-2 text-sm leading-7 text-white/76">{answer}</p>
              </div>
            </div>

            <aside className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <h2 className="font-display text-lg font-semibold">
                {copy.destinationSnapshot}
              </h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-white/50">{isAr ? "الوجهة" : "Destination"}</dt>
                  <dd className="font-medium">{destination.nameEn}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-white/50">{isAr ? "الدولة" : "Country"}</dt>
                  <dd className="font-medium">{destination.country}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-white/50">{isAr ? "العملة" : "Currency"}</dt>
                  <dd className="font-medium">{destination.currency}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-white/50">{isAr ? "مطار رئيسي" : "Main airport"}</dt>
                  <dd className="font-medium">{destination.iata}</dd>
                </div>
              </dl>
            </aside>
          </div>

          <section className="mt-10 grid gap-4 md:grid-cols-2">
            {sections.map((section, index) => (
              <article key={section.title} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
                {index === 0 ? (
                  <MapPin className="mb-3 h-5 w-5 text-sky-300" />
                ) : index === 1 ? (
                  <Wallet className="mb-3 h-5 w-5 text-brand-primary" />
                ) : (
                  <ShieldCheck className="mb-3 h-5 w-5 text-emerald-300" />
                )}
                <h2 className="font-display text-lg font-semibold">{section.title}</h2>
                <p className="mt-3 text-sm leading-7 text-white/64">{section.body}</p>
              </article>
            ))}
          </section>

          {sensitiveGuide && (
            <section className="mt-10 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-5">
              <h2 className="font-display text-lg font-semibold text-amber-200">
                {isAr ? "ملاحظة مهمة" : "Important planning note"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/70">{copy.editorialNote}</p>
            </section>
          )}

          <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="font-display text-lg font-semibold">
              {copy.relatedPlanningLinks}
            </h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                [`/${locale}/trip-cost/${destination.slug}/from-london`, isAr ? "تكلفة الرحلة" : "Trip cost from London"],
                [`/${locale}/destinations/${destination.slug}`, isAr ? "دليل الوجهة" : "Destination guide"],
                [`/${locale}/seasons/${destination.slug}`, isAr ? "أفضل وقت للزيارة" : "Best time to visit"],
                [`/${locale}/travel-scams/${destination.slug}`, isAr ? "تجنب الاحتيال" : "Scam prevention"],
              ].map(([href, label]) => (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-black/15 px-4 py-3 text-sm text-white/68 transition hover:border-brand-primary/35 hover:bg-brand-primary/10 hover:text-white"
                >
                  <span className="flex-1">{label}</span>
                  <ArrowRight className="h-3.5 w-3.5 text-white/35" />
                </Link>
              ))}
            </div>
          </section>

          <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="font-display text-lg font-semibold">
              {copy.faq}
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
