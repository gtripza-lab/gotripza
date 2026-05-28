import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  BadgeDollarSign,
  Camera,
  CheckCircle2,
  Crown,
  HeartHandshake,
  Languages,
  Luggage,
  MapPinned,
  PlaneLanding,
  ShieldAlert,
  Siren,
  Utensils,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { PlusCheckoutButton } from "@/components/PlusCheckoutButton";
import { CompanionActivateSection } from "@/components/CompanionActivateSection";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

const BASE = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const isAr = params.locale === "ar";
  const title = isAr ? "Rya by GoTripza — رفيقة السفر الذكية" : "Rya by GoTripza — AI Travel Companion";
  const description = isAr
    ? "مساعدة سفر مستمرة أثناء رحلتك: ترجمة، فهم صور، ميزانية، أمان، مطارات، واقتراحات ذكية طوال الرحلة."
    : "Trip-long travel help: translation, image help, budgeting, safety guidance, airport support, and smarter suggestions throughout your trip.";
  return {
    title,
    description,
    alternates: {
      canonical: `${BASE}/${params.locale}/plus`,
      languages: {
        ar: `${BASE}/ar/plus`,
        en: `${BASE}/en/plus`,
        "x-default": `${BASE}/en/plus`,
      },
    },
  };
}

const FEATURES_AR = [
  "تعمل على الجوال كرفيق سفر خاص بعد تسجيل الدخول",
  "تحفظ سياق رحلتك: الوجهة، الميزانية، التفضيلات، والمخاوف",
  "فهم صور القوائم واللوحات والتذاكر والفواتير أثناء السفر",
  "ترجمة مواقف حقيقية مع السائق، الفندق، المطعم، والمطار",
  "مساعدة المطار، التنقل، الشنطة، الطوارئ، الأمان، والأكل الحلال",
  "اقتراحات هادئة للخدمات عند الحاجة فقط، بدون إزعاج أو روابط عشوائية",
];

const FEATURES_EN = [
  "Works on mobile as your private travel companion after sign-in",
  "Remembers trip context: destination, budget, preferences, and concerns",
  "Understands menus, signs, tickets, and receipts from images",
  "Helps with real conversations at taxis, hotels, restaurants, and airports",
  "Airport, transport, packing, emergency, safety, and halal food support",
  "Calm service suggestions only when useful, without random link spam",
];

const RELIEF_AR = [
  {
    icon: PlaneLanding,
    title: "لا تضيع في المطار",
    desc: "اسأل ريا عن البوابة، الترانزيت، وقت الوصول، الشنط، أو التأخير وتحصل على خطوة واحدة واضحة.",
  },
  {
    icon: MapPinned,
    title: "لا تحتار في الأحياء",
    desc: "ريا تشرح لك أين تسكن حسب عائلة، شهر عسل، ميزانية، قرب المواصلات، أو الأمان.",
  },
  {
    icon: BadgeDollarSign,
    title: "لا تدفع أكثر من اللازم",
    desc: "قبل التأمين، الشريحة، التنقل، أو الجولات، ريا تشرح لماذا تحتاجها ومتى لا تحتاجها.",
  },
  {
    icon: HeartHandshake,
    title: "اسأل قبل أي قرار",
    desc: "مطعم، منطقة، نشاط، تاكسي، موقف غريب، أو صورة غير مفهومة؛ ريا ترافقك بهدوء.",
  },
];

const RELIEF_EN = [
  {
    icon: PlaneLanding,
    title: "Do not get lost at the airport",
    desc: "Ask Rya about gates, transit, arrival timing, bags, or delays and get one clear next step.",
  },
  {
    icon: MapPinned,
    title: "Know where to stay",
    desc: "Rya explains the right areas for families, honeymooners, budget travelers, transport, or safety.",
  },
  {
    icon: BadgeDollarSign,
    title: "Avoid paying more than you should",
    desc: "Before insurance, eSIMs, transport, or tours, Rya explains why you need it and when you do not.",
  },
  {
    icon: HeartHandshake,
    title: "Ask before every travel decision",
    desc: "A restaurant, area, activity, taxi, strange situation, or confusing image; Rya stays calm with you.",
  },
];

const SERVICES = [
  {
    icon: PlaneLanding,
    titleAr: "مساعد المطار",
    titleEn: "Airport Copilot",
    descAr: "الجوازات، الشنط، الترانزيت، البوابة، والتأخير بخطوات قصيرة.",
    descEn: "Immigration, baggage, transit, gates, and delays in calm short steps.",
  },
  {
    icon: Languages,
    titleAr: "مترجم المواقف",
    titleEn: "Situation Translator",
    descAr: "ماذا تقول للسائق، الفندق، المطعم، الصيدلية، أو موظف المطار.",
    descEn: "What to say to a driver, hotel, restaurant, pharmacy, or airport staff.",
  },
  {
    icon: Camera,
    titleAr: "قارئ الصور",
    titleEn: "Travel Image Reader",
    descAr: "افهم منيو، لوحة، تذكرة، فاتورة، أو تعليمات سفر بصورة.",
    descEn: "Understand menus, signs, tickets, receipts, and travel instructions from images.",
  },
  {
    icon: ShieldAlert,
    titleAr: "حماية من الاحتيال",
    titleEn: "Scam & Safety Guard",
    descAr: "تنبيهات تاكسي، صرف عملة، مناطق ليلية، وأساليب احتيال شائعة.",
    descEn: "Taxi, currency, nightlife, and common tourist-scam guidance.",
  },
  {
    icon: BadgeDollarSign,
    titleAr: "ميزانية اليوم",
    titleEn: "Daily Budget Coach",
    descAr: "قسّم مصروفك اليومي بين أكل، تنقل، نشاط، واحتياط.",
    descEn: "Split your day’s money across food, transport, activities, and a buffer.",
  },
  {
    icon: Siren,
    titleAr: "مساعد الطوارئ",
    titleEn: "Emergency Helper",
    descAr: "جواز ضائع، شنطة مفقودة، مرض، تأخير رحلة، أو موقف مزعج.",
    descEn: "Lost passport, missing bag, illness, flight delay, or stressful moments.",
  },
  {
    icon: Utensils,
    titleAr: "الأكل والحلال",
    titleEn: "Food & Halal Help",
    descAr: "أطباق محلية، مطاعم مناسبة، وماذا تسأل قبل الطلب.",
    descEn: "Local dishes, suitable restaurants, and what to ask before ordering.",
  },
  {
    icon: Luggage,
    titleAr: "مساعد الشنطة",
    titleEn: "Packing Assistant",
    descAr: "تجهيزات حسب الطقس، الوجهة، عدد الأيام، الأطفال، والأنشطة.",
    descEn: "Packing guidance by weather, destination, days, kids, and activities.",
  },
  {
    icon: MapPinned,
    titleAr: "مخطط اليوم",
    titleEn: "Today Planner",
    descAr: "اقتراح يوم مناسب حسب الطقس، الطاقة، الميزانية، والزحمة.",
    descEn: "A realistic day plan based on weather, energy, budget, and crowds.",
  },
  {
    icon: HeartHandshake,
    titleAr: "العائلة وشهر العسل",
    titleEn: "Family & Honeymoon Modes",
    descAr: "إيقاع هادئ للأطفال أو تجربة رومانسية بدون جدول مرهق.",
    descEn: "Gentle pacing for families or romantic ideas without an exhausting schedule.",
  },
];

export default async function PlusPage(props: { params: Promise<{ locale: string }> }) {
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);
  const isAr = locale === "ar";
  const features = isAr ? FEATURES_AR : FEATURES_EN;
  const relief = isAr ? RELIEF_AR : RELIEF_EN;

  return (
    <>
      <Navbar dict={dict} locale={locale} />
      <main
        className="min-h-screen bg-ink-950 px-4 pt-10"
        style={{ paddingBottom: "calc(6rem + env(safe-area-inset-bottom, 0px))" }}
        dir={isAr ? "rtl" : "ltr"}
      >
        <section className="mx-auto max-w-5xl">
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/[0.04] ring-1 ring-white/10">
              <Image
                src="/brand/rya/rya-app-icon.png"
                alt="Rya by GoTripza"
                width={80}
                height={80}
                className="rounded-3xl"
                priority
              />
            </div>
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/[0.08] px-4 py-2 text-sm text-brand-primary">
              <Crown className="h-4 w-4" />
              {isAr ? "Rya by GoTripza — رفيقة سفر عالمية" : "Rya by GoTripza — global travel companion"}
            </p>
            <h1 className="mt-5 font-display text-4xl font-black tracking-tight text-white sm:text-6xl">
              {isAr ? "ريا معك قبل الرحلة وأثناءها" : "Rya stays with you before and during the trip"}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
              {isAr
                ? "قيمة Rya Companion ليست في الدردشة، بل في أنها تعرف سياق رحلتك وتساعدك في المطار، الترجمة، الصور، الميزانية، الأمان، والطعام عندما تحتاجها فعلاً."
                : "Rya Companion is not just chat. It remembers your trip context and helps with airports, translation, images, budgeting, safety, and food exactly when you need it."}
            </p>
          </div>

          <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {relief.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="rounded-2xl border border-white/[0.08] bg-white/[0.035] p-4">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-primary/[0.12] text-brand-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h2 className="text-sm font-semibold text-white">{item.title}</h2>
                  <p className="mt-2 text-xs leading-6 text-white/45">{item.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2">
            <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-6 shadow-card">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {isAr ? "Rya Companion" : "Rya Companion"}
                  </h2>
                  <p className="mt-1 text-sm text-white/40">
                    {isAr ? "مساعدة سفر طوال الرحلة" : "Travel help throughout the trip"}
                  </p>
                </div>
                <Image
                  src="/brand/rya/rya-social-profile.png"
                  alt=""
                  width={56}
                  height={56}
                  className="rounded-2xl"
                />
              </div>
              <div className="mt-6">
                <div className="flex flex-wrap items-end gap-3">
                  <span className="text-4xl font-bold text-white">$19.99</span>
                  <span className="pb-1 text-sm font-medium text-white/35">
                    {isAr ? "· ٦٠ يوماً" : "· 60 days"}
                  </span>
                  <span className="rounded-full border border-brand-mint/20 bg-brand-mint/10 px-3 py-1 text-xs font-semibold text-brand-mint">
                    {isAr ? "دفع آمن عبر Gumroad" : "Secure checkout via Gumroad"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-white/40">
                  {isAr
                    ? "ادفع مرة واحدة واحصل على وصول كامل لريا لمدة 60 يوماً. بعد الشراء فعّل وصولك بالبريد أدناه."
                    : "Pay once and get full Rya access for 60 days. After purchase, activate below with your email."}
                </p>
              </div>
              <ul className="mt-6 space-y-3">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-white/60">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-brand-mint" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <PlusCheckoutButton locale={locale} interval="monthly" />
              </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-brand-mint/20 bg-brand-mint/[0.06] p-6">
              <div className="pointer-events-none absolute -end-16 -top-16 h-44 w-44 rounded-full bg-brand-primary/20 blur-3xl" />
              <h2 className="text-xl font-semibold text-white">
                {isAr ? "التثبيت على الجوال" : "Install on mobile"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/55">
                {isAr
                  ? "افتح ريا من الجوال واضغط تثبيت. على Android يظهر التثبيت مباشرة، وعلى iPhone اختر مشاركة ثم إضافة إلى الشاشة الرئيسية."
                  : "Open Rya on mobile and install it. Android shows an install prompt; on iPhone, tap Share then Add to Home Screen."}
              </p>
              <div className="mt-5 rounded-xl bg-black/20 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-mint">
                  {isAr ? "مصمم للمواقف التي لا تنتظر" : "Built for moments that cannot wait"}
                </p>
                <div className="mt-3 space-y-2 text-sm text-white/55">
                  <p>{isAr ? "افهم قائمة طعام أو لوحة في الشارع بصورة" : "Understand a menu, sign, or ticket from an image"}</p>
                  <p>{isAr ? "اسأل عن منطقة، احتيال شائع، أو موقف في المطار" : "Ask about an area, common scam, or airport situation"}</p>
                  <p>{isAr ? "استخدمها بعد تسجيل الدخول حتى تحفظ ريا سياق رحلتك" : "Use it after sign-in so Rya keeps your trip context"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-12">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold text-brand-mint">
                {isAr ? "الخدمات التي تجعل ريا لا تُقاوم" : "Services that make Rya hard to leave behind"}
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                {isAr ? "ليست دردشة سفر. إنها صندوق أدواتك أثناء الرحلة." : "Not a travel chat. Your trip toolkit in one companion."}
              </h2>
              <p className="mt-3 text-sm leading-7 text-white/45">
                {isAr
                  ? "كل خدمة مصممة لموقف حقيقي: عندما تصل متأخراً، لا تفهم لوحة، تخاف من تاكسي، تحتاج أكل مناسب، أو تريد إنقاذ يومك بدون بحث طويل."
                  : "Every service is designed for a real moment: arriving late, not understanding a sign, avoiding a taxi scam, finding safe food, or saving a day without endless searching."}
              </p>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {SERVICES.map((service) => {
                const Icon = service.icon;
                return (
                  <div key={service.titleEn} className="rounded-2xl border border-white/[0.07] bg-white/[0.035] p-5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-primary/10 text-brand-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-4 text-base font-semibold text-white">
                      {isAr ? service.titleAr : service.titleEn}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-white/45">
                      {isAr ? service.descAr : service.descEn}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <CompanionActivateSection locale={locale} />
        </section>
      </main>
      <Footer dict={dict} locale={locale} />
    </>
  );
}
