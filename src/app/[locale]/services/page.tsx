import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getDictionary } from "@/i18n/get-dictionary";
import { tpLink as tpLinkBase } from "@/lib/partners";
import type { Metadata } from "next";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const isAr = params.locale === "ar";
  return {
    title: isAr
      ? "احتياجات المسافر — تأمين · شريحة إنترنت · أنشطة · قطارات | GoTripza"
      : "Traveler Services — Insurance · eSIM · Activities · Trains | GoTripza",
    description: isAr
      ? "كل ما يحتاجه المسافر في مكان واحد: تأمين السفر، شرائح إنترنت عالمية، أنشطة وجولات، قطارات أوروبية، ومزيد."
      : "Everything you need for your trip: travel insurance, global eSIMs, tours, European trains, and more.",
  };
}

// Wrapper that applies the "services_page" subid by default
const tpLink = (promoId: string, partnerUrl: string, subid = "services_page") =>
  tpLinkBase(promoId, partnerUrl, subid);

type ServiceCard = {
  icon: string;
  name_ar: string;
  name_en: string;
  tagline_ar: string;
  tagline_en: string;
  desc_ar: string;
  desc_en: string;
  cta_ar: string;
  cta_en: string;
  url: string | null;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  accentButton: string;
};

function getServices(_locale: Locale): ServiceCard[] {
  const promos = {
    booking:          process.env.NEXT_PUBLIC_TP_PROMO_BOOKING      ?? "4338",
    tripcom:          process.env.NEXT_PUBLIC_TP_PROMO_TRIPCOM      ?? "4064",
    discovercars:     process.env.NEXT_PUBLIC_TP_PROMO_DISCOVERCARS ?? "",
    klook:            process.env.NEXT_PUBLIC_TP_PROMO_KLOOK        ?? "",
    kkday:            process.env.NEXT_PUBLIC_TP_PROMO_KKDAY        ?? "",
    gocity:           process.env.NEXT_PUBLIC_TP_PROMO_GOCITY       ?? "",
    getyourguide:     process.env.NEXT_PUBLIC_TP_PROMO_GYG          ?? "",
    airalo:           process.env.NEXT_PUBLIC_TP_PROMO_AIRALO       ?? "",
    yesim:            process.env.NEXT_PUBLIC_TP_PROMO_YESIM        ?? "",
    visitorscoverage: process.env.NEXT_PUBLIC_TP_PROMO_VC           ?? "",
    ekta:             process.env.NEXT_PUBLIC_TP_PROMO_EKTA         ?? "",
    airhelp:          process.env.NEXT_PUBLIC_TP_PROMO_AIRHELP      ?? "",
    raileurope:       process.env.NEXT_PUBLIC_TP_PROMO_RAILEUROPE   ?? "",
    kiwi:             process.env.NEXT_PUBLIC_TP_PROMO_KIWI         ?? "",
    cheapoair:        process.env.NEXT_PUBLIC_TP_PROMO_CHEAPOAIR    ?? "",
  };

  const all: ServiceCard[] = [
    // ── Travel Insurance ──────────────────────────────────────────
    {
      icon: "🛡️",
      name_ar: "تأمين السفر",
      name_en: "Travel Insurance",
      tagline_ar: "VisitorsCoverage — أفضل تغطية بأقل سعر",
      tagline_en: "VisitorsCoverage — best coverage, lowest price",
      desc_ar: "احمِ رحلتك من المفاجآت: تأخير الرحلات، الطوارئ الطبية، فقدان الأمتعة وأكثر. من دولار واحد في اليوم.",
      desc_en: "Protect your trip from the unexpected: flight delays, medical emergencies, lost baggage & more. From $1/day.",
      cta_ar: "احصل على التأمين",
      cta_en: "Get Insured",
      url: tpLink(promos.visitorscoverage, "https://www.visitorscoverage.com/"),
      accentBg: "bg-blue-50", accentText: "text-blue-700", accentBorder: "border-blue-200", accentButton: "bg-blue-600",
    },
    {
      icon: "🔒",
      name_ar: "EKTA — تأمين فوري",
      name_en: "EKTA — Instant Insurance",
      tagline_ar: "وثيقة فورية · تغطية عالمية",
      tagline_en: "Instant policy · worldwide coverage",
      desc_ar: "تأمين سفر مرن بأسعار تنافسية. وثيقة فورية تصلك على الإيميل خلال دقائق.",
      desc_en: "Flexible travel insurance at competitive rates. Instant policy delivered to your email in minutes.",
      cta_ar: "تأمين الآن",
      cta_en: "Get Policy",
      url: tpLink(promos.ekta, "https://ekta.insurance/"),
      accentBg: "bg-purple-50", accentText: "text-purple-700", accentBorder: "border-purple-200", accentButton: "bg-purple-600",
    },
    // ── eSIM ──────────────────────────────────────────────────────
    {
      icon: "📡",
      name_ar: "Airalo — شريحة إنترنت عالمية",
      name_en: "Airalo — Global eSIM",
      tagline_ar: "أكثر من ٢٠٠ دولة · ابتداءً من ٥ دولارات",
      tagline_en: "200+ countries · from $5",
      desc_ar: "ابقَ متصلاً في أي مكان بدون رسوم التجوال. اشتر شريحتك الإلكترونية قبل سفرك مباشرة.",
      desc_en: "Stay connected anywhere without roaming fees. Buy your eSIM before you travel, activate instantly.",
      cta_ar: "اشتر شريحة الإنترنت",
      cta_en: "Buy eSIM",
      url: tpLink(promos.airalo, "https://www.airalo.com/"),
      accentBg: "bg-indigo-50", accentText: "text-indigo-700", accentBorder: "border-indigo-200", accentButton: "bg-indigo-600",
    },
    {
      icon: "🌐",
      name_ar: "Yesim — eSIM + VPN مجاني",
      name_en: "Yesim — eSIM + Free VPN",
      tagline_ar: "اتصال عالمي · خصوصية كاملة",
      tagline_en: "Global data · full privacy",
      desc_ar: "شريحة إنترنت عالمية مع VPN مجاني في كل رحلة. لا رسوم تجوال، لا مفاجآت.",
      desc_en: "Global eSIM with free VPN included on every trip. No roaming charges, no surprises.",
      cta_ar: "احصل على Yesim",
      cta_en: "Get Yesim",
      url: tpLink(promos.yesim, "https://yesim.app/"),
      accentBg: "bg-cyan-50", accentText: "text-cyan-700", accentBorder: "border-cyan-200", accentButton: "bg-cyan-600",
    },
    // ── Activities ────────────────────────────────────────────────
    {
      icon: "🎟️",
      name_ar: "GetYourGuide — جولات موثّقة",
      name_en: "GetYourGuide — Verified Tours",
      tagline_ar: "٥٠,٠٠٠+ نشاط حول العالم",
      tagline_en: "50,000+ activities worldwide",
      desc_ar: "اكتشف أفضل الجولات والتجارب في وجهتك. حجز فوري، إلغاء مجاني، تقييمات حقيقية.",
      desc_en: "Discover the best tours and experiences at your destination. Instant booking, free cancellation.",
      cta_ar: "استعرض الأنشطة",
      cta_en: "Browse Activities",
      url: tpLink(promos.getyourguide, "https://www.getyourguide.com/"),
      accentBg: "bg-emerald-50", accentText: "text-emerald-700", accentBorder: "border-emerald-200", accentButton: "bg-emerald-600",
    },
    {
      icon: "🎡",
      name_ar: "Klook — أنشطة آسيا والعالم",
      name_en: "Klook — Asia & World Activities",
      tagline_ar: "جولات · تذاكر · تجارب فريدة",
      tagline_en: "Tours · tickets · unique experiences",
      desc_ar: "أفضل منصة للأنشطة في آسيا وأكثر من ١٠٠ وجهة حول العالم. أسعار حصرية للحجز المباشر.",
      desc_en: "The leading activities platform in Asia and 100+ destinations worldwide. Exclusive prices.",
      cta_ar: "اكتشف Klook",
      cta_en: "Explore Klook",
      url: tpLink(promos.klook, "https://www.klook.com/"),
      accentBg: "bg-rose-50", accentText: "text-rose-700", accentBorder: "border-rose-200", accentButton: "bg-rose-600",
    },
    {
      icon: "🏮",
      name_ar: "KKday — تجارب ثقافية",
      name_en: "KKday — Cultural Experiences",
      tagline_ar: "جولات محلية أصيلة",
      tagline_en: "Authentic local experiences",
      desc_ar: "اغمر نفسك في الثقافة المحلية: جولات طهي، ورش حرف يدوية، تجارب تراثية أصيلة.",
      desc_en: "Immerse yourself in local culture: cooking classes, craft workshops, authentic heritage experiences.",
      cta_ar: "اكتشف KKday",
      cta_en: "Explore KKday",
      url: tpLink(promos.kkday, "https://www.kkday.com/"),
      accentBg: "bg-orange-50", accentText: "text-orange-700", accentBorder: "border-orange-200", accentButton: "bg-orange-600",
    },
    {
      icon: "🏙️",
      name_ar: "Go City — بطاقات المعالم",
      name_en: "Go City — Attraction Passes",
      tagline_ar: "وفّر حتى ٤٠٪ على المعالم السياحية",
      tagline_en: "Save up to 40% on top attractions",
      desc_ar: "بطاقة واحدة تفتح لك عشرات المعالم في المدينة. متاحة في لندن، نيويورك، باريس، دبي وأكثر.",
      desc_en: "One pass unlocks dozens of attractions. Available in London, New York, Paris, Dubai & more.",
      cta_ar: "احصل على البطاقة",
      cta_en: "Get City Pass",
      url: tpLink(promos.gocity, "https://gocity.com/"),
      accentBg: "bg-violet-50", accentText: "text-violet-700", accentBorder: "border-violet-200", accentButton: "bg-violet-600",
    },
    // ── Flight Compensation ───────────────────────────────────────
    {
      icon: "⚖️",
      name_ar: "AirHelp — تعويض الرحلات",
      name_en: "AirHelp — Flight Compensation",
      tagline_ar: "استرجع حتى ٦٠٠ يورو عن رحلتك المتأخرة",
      tagline_en: "Claim up to €600 for delayed flights",
      desc_ar: "تأخّرت رحلتك أو أُلغيت؟ AirHelp يسترجع لك التعويض القانوني بدون أي عناء.",
      desc_en: "Flight delayed or cancelled? AirHelp claims your legal compensation with zero hassle.",
      cta_ar: "تحقق من رحلتك",
      cta_en: "Check Your Flight",
      url: tpLink(promos.airhelp, "https://www.airhelp.com/en/check-your-flight/"),
      accentBg: "bg-amber-50", accentText: "text-amber-700", accentBorder: "border-amber-200", accentButton: "bg-amber-600",
    },
    // ── Trains ────────────────────────────────────────────────────
    {
      icon: "🚄",
      name_ar: "Rail Europe — القطارات الأوروبية",
      name_en: "Rail Europe — European Trains",
      tagline_ar: "تذاكر وبطاقات قطارات أوروبا",
      tagline_en: "Train tickets & Eurail passes",
      desc_ar: "سافر بين المدن الأوروبية بالقطار — أسهل وأجمل من الطيران. حجز مباشر بأسعار ضامنة.",
      desc_en: "Travel between European cities by train — easier and more scenic than flying. Direct booking.",
      cta_ar: "احجز قطارك",
      cta_en: "Book Train",
      url: tpLink(promos.raileurope, "https://www.raileurope.com/"),
      accentBg: "bg-red-50", accentText: "text-red-700", accentBorder: "border-red-200", accentButton: "bg-red-600",
    },
    // ── Car Rental ────────────────────────────────────────────────
    {
      icon: "🚗",
      name_ar: "DiscoverCars — تأجير سيارات",
      name_en: "DiscoverCars — Car Rental",
      tagline_ar: "٩٠٠+ شركة تأجير في ١٥٠ دولة",
      tagline_en: "900+ rental companies in 150 countries",
      desc_ar: "قارن أسعار أكبر شركات تأجير السيارات واحجز بأفضل سعر مضمون. إلغاء مجاني.",
      desc_en: "Compare the world's leading car rental companies and book at the guaranteed best price.",
      cta_ar: "قارن السيارات",
      cta_en: "Compare Cars",
      url: tpLink(promos.discovercars, "https://www.discovercars.com/"),
      accentBg: "bg-sky-50", accentText: "text-sky-700", accentBorder: "border-sky-200", accentButton: "bg-sky-600",
    },
    // ── Cheap Flights ─────────────────────────────────────────────
    {
      icon: "🥝",
      name_ar: "Kiwi.com — رحلات بأسعار خفية",
      name_en: "Kiwi.com — Hidden-gem Flights",
      tagline_ar: "مسارات فريدة · أسعار لا تجدها في غيرها",
      tagline_en: "Unique routes · prices you won't find elsewhere",
      desc_ar: "يبحث Kiwi في مئات شركات الطيران عن تركيبات ذكية تعطيك أرخص سعر ممكن.",
      desc_en: "Kiwi searches hundreds of airlines for smart combinations that give you the cheapest possible price.",
      cta_ar: "ابحث عن رحلة",
      cta_en: "Search Flights",
      url: tpLink(promos.kiwi, "https://www.kiwi.com/"),
      accentBg: "bg-teal-50", accentText: "text-teal-700", accentBorder: "border-teal-200", accentButton: "bg-teal-600",
    },
  ];

  // Filter out services with no configured TP promo_id
  return all.filter((s) => s.url !== null);
}

export default async function ServicesPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);
  const isAr = locale === "ar";
  const services = getServices(locale);

  return (
    <>
      <Navbar dict={dict} locale={locale} />

      <main className="min-h-screen bg-white pb-24">

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-ink-950 via-[#1a1040] to-ink-950 px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-white/60 backdrop-blur-sm">
              <span>🌍</span>
              <span>{isAr ? "جميع الخدمات عبر Travelpayouts" : "All services via Travelpayouts"}</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              {isAr ? "احتياجات المسافر" : "Traveler Services"}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-white/55 leading-relaxed">
              {isAr
                ? "كل ما تحتاجه قبل وأثناء وبعد رحلتك — في مكان واحد. جميع الروابط محمية بنظام Travelpayouts."
                : "Everything you need before, during, and after your trip — in one place. All links secured through Travelpayouts."}
            </p>
          </div>
        </section>

        {/* ── Service Cards Grid ─────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          {services.length === 0 ? (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center">
              <p className="text-lg font-medium text-amber-800">
                {isAr
                  ? "قم بإضافة promo_id للخدمات من لوحة Travelpayouts لتظهر هنا."
                  : "Add promo_ids from your Travelpayouts dashboard to display services here."}
              </p>
              <p className="mt-2 text-sm text-amber-600">
                {isAr
                  ? "اذهب إلى: Travelpayouts → Programs → [Partner] → Tools → Link"
                  : "Go to: Travelpayouts → Programs → [Partner] → Tools → Link"}
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((s) => (
                <a
                  key={s.name_en}
                  href={s.url!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex flex-col rounded-2xl border ${s.accentBorder} ${s.accentBg} p-6 transition-all duration-200 hover:shadow-md hover:scale-[1.01]`}
                >
                  <div className="mb-4 flex items-start justify-between">
                    <span className="text-3xl">{s.icon}</span>
                    <span className={`rounded-full border ${s.accentBorder} bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${s.accentText}`}>
                      {isAr ? "عبر Travelpayouts" : "via Travelpayouts"}
                    </span>
                  </div>

                  <h2 className="text-base font-bold text-gray-900">
                    {isAr ? s.name_ar : s.name_en}
                  </h2>
                  <p className={`mt-0.5 text-xs font-medium ${s.accentText}`}>
                    {isAr ? s.tagline_ar : s.tagline_en}
                  </p>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-gray-600">
                    {isAr ? s.desc_ar : s.desc_en}
                  </p>

                  <div className={`mt-5 inline-flex w-full items-center justify-center gap-1.5 rounded-xl py-2.5 text-sm font-semibold text-white transition-all group-hover:gap-2.5 ${s.accentButton}`}>
                    {isAr ? s.cta_ar : s.cta_en}
                    <span className="transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5">→</span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* ── Trust note ────────────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-4 pb-4 sm:px-6">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-500">
              {isAr
                ? "🔗 جميع الروابط محمية بنظام تتبع Travelpayouts (marker: 522867). عمولاتك مضمونة على كل حجز."
                : "🔗 All links are tracked through Travelpayouts (marker: 522867). Your commissions are guaranteed on every booking."}
            </p>
          </div>
        </section>
      </main>

      <Footer dict={dict} locale={locale} />
    </>
  );
}
