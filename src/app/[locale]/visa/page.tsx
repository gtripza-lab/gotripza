import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Globe2, MessageCircle, ShieldCheck } from "lucide-react";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/i18n/config";
import { DESTINATION_SLUGS, getDestination, type Destination } from "@/lib/seo-destinations";
import { BreadcrumbJsonLd } from "@/components/JsonLd";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

interface Props {
  params: Promise<{ locale: string }>;
}

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { locale } = await props.params;
  if (!isLocale(locale)) return {};
  const isAr = locale === "ar";
  const title = isAr
    ? "دليل التأشيرات ومتطلبات السفر | Rya by GoTripza"
    : "Visa Requirements and Travel Documents | Rya by GoTripza";
  const description = isAr
    ? "دليل عملي لمعرفة متطلبات التأشيرة حسب الوجهة والجنسية، مع تنبيهات ريا حول الوثائق، مدة المعالجة، والتأكد من المصادر الرسمية قبل السفر."
    : "A practical visa hub for destination requirements, documents, processing time, and Rya reminders to verify official sources before travelling.";

  return {
    title,
    description,
    alternates: {
      canonical: `${BASE}/${locale}/visa`,
      languages: {
        en: `${BASE}/en/visa`,
        ar: `${BASE}/ar/visa`,
        "x-default": `${BASE}/en/visa`,
      },
    },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${BASE}/${locale}/visa`,
      siteName: "GoTripza",
    },
  };
}

function statusForGcc(dest: Destination) {
  if (dest.visaFree.some((code) => ["SA", "AE", "KW", "QA", "BH", "OM", "GCC"].includes(code))) return "free";
  if (dest.visaOnArrival.includes("ALL") || dest.visaOnArrival.some((code) => ["SA", "AE", "KW", "QA", "BH", "OM"].includes(code))) return "arrival";
  if (dest.eVisa) return "evisa";
  return "required";
}

function statusCopy(status: string, isAr: boolean) {
  const copy = {
    free: {
      ar: "دخول ميسر غالباً",
      en: "Often simple entry",
      className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    },
    arrival: {
      ar: "تأشيرة عند الوصول غالباً",
      en: "Often visa on arrival",
      className: "border-sky-500/20 bg-sky-500/10 text-sky-300",
    },
    evisa: {
      ar: "تأشيرة إلكترونية غالباً",
      en: "Often e-Visa",
      className: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    },
    required: {
      ar: "تحقق قبل الحجز",
      en: "Check before booking",
      className: "border-rose-500/20 bg-rose-500/10 text-rose-300",
    },
  } as const;
  const item = copy[status as keyof typeof copy] ?? copy.required;
  return { label: isAr ? item.ar : item.en, className: item.className };
}

export default async function VisaIndexPage(props: Props) {
  const { locale } = await props.params;
  if (!isLocale(locale)) notFound();
  const isAr = locale === "ar";
  const destinations = DESTINATION_SLUGS.map((slug) => getDestination(slug)).filter(Boolean);

  const breadcrumbs = [
    { name: isAr ? "الرئيسية" : "Home", url: `${BASE}/${locale}` },
    { name: isAr ? "دليل التأشيرات" : "Visa Guides", url: `${BASE}/${locale}/visa` },
  ];

  return (
    <>
      <BreadcrumbJsonLd items={breadcrumbs} />
      <main className="min-h-screen bg-ink-950 px-4 py-12 text-white" dir={isAr ? "rtl" : "ltr"}>
        <div className="mx-auto max-w-6xl">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm text-white/50 transition hover:text-white"
          >
            {isAr ? <ArrowRight className="h-4 w-4" /> : <ArrowLeft className="h-4 w-4" />}
            {isAr ? "العودة للرئيسية" : "Back home"}
          </Link>

          <section className="pt-10">
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-primary/25 bg-brand-primary/10 px-4 py-2 text-sm text-brand-primary">
              <ShieldCheck className="h-4 w-4" />
              {isAr ? "تحقق ذكي قبل السفر" : "Smart checks before travel"}
            </div>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-tight md:text-6xl">
              {isAr ? "اعرف متطلبات التأشيرة قبل أن تحجز" : "Know the visa requirements before you book"}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/65">
              {isAr
                ? "ريا تساعدك تفهم المتطلبات العامة حسب الوجهة والجنسية، وتذكرك بالتحقق من المصدر الرسمي قبل الدفع النهائي لأن قواعد التأشيرات تتغير."
                : "Rya helps you understand common requirements by destination and nationality, then reminds you to verify the official source before final payment because visa rules change."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={`/${locale}/search?q=${encodeURIComponent(isAr ? "هل أحتاج تأشيرة لهذه الرحلة؟" : "Do I need a visa for this trip?")}`}
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-600 to-brand-primary px-6 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]"
              >
                <MessageCircle className="h-4 w-4" />
                {isAr ? "اسأل ريا عن التأشيرة" : "Ask Rya about visas"}
              </Link>
            </div>
          </section>

          <section className="mt-12 grid gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 md:grid-cols-3">
            {[
              { icon: Globe2, text: isAr ? "متطلبات حسب الوجهة والجنسية" : "Requirements by destination and passport" },
              { icon: Clock, text: isAr ? "تذكير بمدة المعالجة والتقديم المبكر" : "Processing time and early-apply reminders" },
              { icon: CheckCircle2, text: isAr ? "تنبيه للتحقق من المصادر الرسمية" : "Official-source verification reminders" },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 rounded-xl bg-black/18 p-4 text-sm text-white/70">
                <Icon className="h-5 w-5 shrink-0 text-brand-primary" />
                {text}
              </div>
            ))}
          </section>

          <section className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {destinations.map((dest) => {
              if (!dest) return null;
              const status = statusCopy(statusForGcc(dest), isAr);
              const name = isAr ? dest.nameAr : dest.nameEn;
              return (
                <Link
                  key={dest.slug}
                  href={`/${locale}/visa/${dest.slug}`}
                  className="group rounded-2xl border border-white/10 bg-white/[0.045] p-5 transition hover:border-brand-primary/40 hover:bg-white/[0.07]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-3xl">{dest.flag}</p>
                      <h2 className="mt-3 text-xl font-semibold text-white">
                        {isAr ? `تأشيرة ${name}` : `${dest.nameEn} visa requirements`}
                      </h2>
                      <p className="mt-1 text-sm text-white/45">
                        {isAr ? dest.countryAr : dest.country}
                      </p>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-xs ${status.className}`}>
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-5 line-clamp-3 text-sm leading-6 text-white/55">
                    {isAr ? dest.visaNotes.ar : dest.visaNotes.en}
                  </p>
                </Link>
              );
            })}
          </section>
        </div>
      </main>
    </>
  );
}
