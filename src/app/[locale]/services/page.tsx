import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getDictionary } from "@/i18n/get-dictionary";
import type { Metadata } from "next";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const isAr = params.locale === "ar";
  return {
    title: isAr
      ? "احتياجات المسافر — تأمين · شريحة إنترنت · أنشطة · قطارات | GoTripza"
      : "Traveler Services — Insurance · eSIM · Activities · Trains | GoTripza",
    description: isAr
      ? "كل ما يحتاجه المسافر في مكان واحد: تأمين السفر، شرائح إنترنت عالمية، أنشطة وجولات، ومزيد."
      : "Everything you need for your trip: travel insurance, global eSIMs, tours, and more.",
  };
}

// ── Partner cards — all links are direct Travelpayouts tracking (tpm.li) ──
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
  url: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  accentButton: string;
};

const SERVICES: ServiceCard[] = [
  // ── Travel Insurance ──────────────────────────────────────────────────
  {
    icon: "🛡️",
    name_ar: "VisitorsCoverage — تأمين السفر",
    name_en: "VisitorsCoverage — Travel Insurance",
    tagline_ar: "أفضل تغطية بأقل سعر · من دولار في اليوم",
    tagline_en: "Best coverage, lowest price · from $1/day",
    desc_ar: "احمِ رحلتك من المفاجآت: تأخير رحلات، طوارئ طبية، فقدان أمتعة وأكثر. اختار خطتك في دقيقتين.",
    desc_en: "Protect your trip from the unexpected: flight delays, medical emergencies, lost baggage & more. Choose your plan in 2 minutes.",
    cta_ar: "احصل على التأمين",
    cta_en: "Get Insured",
    url: "https://visitorscoverage.tpm.li/OjLSplyJ",
    accentBg: "bg-blue-50", accentText: "text-blue-700", accentBorder: "border-blue-200", accentButton: "bg-blue-600",
  },

  // ── eSIM ─────────────────────────────────────────────────────────────
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
    url: "https://airalo.tpm.li/6HeGxPwG",
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
    url: "https://yesim.tpm.li/E7IOi4Zs",
    accentBg: "bg-cyan-50", accentText: "text-cyan-700", accentBorder: "border-cyan-200", accentButton: "bg-cyan-600",
  },
  {
    icon: "🔒",
    name_ar: "NordVPN — أمان رقمي في السفر",
    name_en: "NordVPN — Travel Security",
    tagline_ar: "حماية بياناتك على شبكات Wi-Fi العامة",
    tagline_en: "Protect your data on public Wi-Fi",
    desc_ar: "في الفنادق والمطارات والمقاهي — شبكات Wi-Fi غير آمنة. NordVPN يحمي اتصالك في أي مكان.",
    desc_en: "Hotels, airports, cafes — public Wi-Fi is unsafe. NordVPN secures your connection anywhere.",
    cta_ar: "احصل على NordVPN",
    cta_en: "Get NordVPN",
    url: "https://nordvpn.tpm.li/fExKzOuM",
    accentBg: "bg-blue-50", accentText: "text-blue-800", accentBorder: "border-blue-200", accentButton: "bg-blue-700",
  },

  // ── Activities ────────────────────────────────────────────────────────
  {
    icon: "🎟️",
    name_ar: "Tiqets — تذاكر المتاحف والمعالم",
    name_en: "Tiqets — Museum & Attraction Tickets",
    tagline_ar: "تذاكر فورية · تجاوز طوابير الانتظار",
    tagline_en: "Instant tickets · skip the queue",
    desc_ar: "احجز تذاكر أشهر متاحف ومعالم العالم مسبقاً. QR code مباشر لهاتفك — بدون طابور.",
    desc_en: "Book tickets for the world's top museums and attractions in advance. Direct QR code to your phone — no queue.",
    cta_ar: "احجز تذاكرك",
    cta_en: "Book Tickets",
    url: "https://tiqets.tpm.li/5hX5mUmz",
    accentBg: "bg-rose-50", accentText: "text-rose-700", accentBorder: "border-rose-200", accentButton: "bg-rose-600",
  },
  {
    icon: "🎡",
    name_ar: "Klook — أنشطة آسيا والعالم",
    name_en: "Klook — Asia & World Activities",
    tagline_ar: "جولات · تذاكر · تجارب فريدة",
    tagline_en: "Tours · tickets · unique experiences",
    desc_ar: "أفضل منصة للأنشطة في آسيا وأكثر من ١٠٠ وجهة. أسعار حصرية للحجز المباشر.",
    desc_en: "The leading activities platform in Asia and 100+ destinations worldwide. Exclusive direct-booking prices.",
    cta_ar: "اكتشف Klook",
    cta_en: "Explore Klook",
    url: "https://klook.tpm.li/nrGsmP4o",
    accentBg: "bg-orange-50", accentText: "text-orange-700", accentBorder: "border-orange-200", accentButton: "bg-orange-600",
  },
  {
    icon: "🏮",
    name_ar: "KKday — تجارب ثقافية",
    name_en: "KKday — Cultural Experiences",
    tagline_ar: "جولات محلية أصيلة",
    tagline_en: "Authentic local experiences",
    desc_ar: "اغمر نفسك في الثقافة المحلية: جولات طهي، ورش حرف يدوية، تجارب تراثية أصيلة.",
    desc_en: "Immerse in local culture: cooking classes, craft workshops, authentic heritage experiences.",
    cta_ar: "اكتشف KKday",
    cta_en: "Explore KKday",
    url: "https://kkday.tpm.li/WCCNnGsA",
    accentBg: "bg-amber-50", accentText: "text-amber-700", accentBorder: "border-amber-200", accentButton: "bg-amber-600",
  },

  // ── Flights ───────────────────────────────────────────────────────────
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
    url: "https://kiwi.tpm.li/UjCGbORd",
    accentBg: "bg-teal-50", accentText: "text-teal-700", accentBorder: "border-teal-200", accentButton: "bg-teal-600",
  },

  // ── Flight Compensation ────────────────────────────────────────────────
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
    url: "https://airhelp.tpm.li/mmjS6uvS",
    accentBg: "bg-violet-50", accentText: "text-violet-700", accentBorder: "border-violet-200", accentButton: "bg-violet-600",
  },

  // ── Car Rental ────────────────────────────────────────────────────────
  {
    icon: "🚗",
    name_ar: "AutoEurope — تأجير سيارات أوروبا",
    name_en: "AutoEurope — Europe Car Rental",
    tagline_ar: "أفضل أسعار مضمونة · إلغاء مجاني",
    tagline_en: "Best price guaranteed · free cancellation",
    desc_ar: "اكتشف أوروبا بحريتك الكاملة. AutoEurope يقارن أكبر شركات التأجير ويضمن أفضل سعر.",
    desc_en: "Explore Europe on your own terms. AutoEurope compares top rental companies and guarantees the best price.",
    cta_ar: "احجز سيارتك",
    cta_en: "Book a Car",
    url: "https://autoeurope.tpm.li/juSTrVaH",
    accentBg: "bg-sky-50", accentText: "text-sky-700", accentBorder: "border-sky-200", accentButton: "bg-sky-600",
  },
  {
    icon: "🌍",
    name_ar: "QEEQ — تأجير سيارات عالمي",
    name_en: "QEEQ — Global Car Rental",
    tagline_ar: "٩٠٠+ شركة في ١٥٠ دولة",
    tagline_en: "900+ companies in 150 countries",
    desc_ar: "قارن وأحجز سيارة من أفضل شركات التأجير في العالم. أسعار تنافسية وإلغاء مرن.",
    desc_en: "Compare and book from the world's top car rental companies. Competitive prices and flexible cancellation.",
    cta_ar: "قارن السيارات",
    cta_en: "Compare Cars",
    url: "https://qeeq.tpm.li/xODdj69U",
    accentBg: "bg-emerald-50", accentText: "text-emerald-700", accentBorder: "border-emerald-200", accentButton: "bg-emerald-600",
  },
];

export default async function ServicesPage({
  params,
}: {
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);
  const isAr = locale === "ar";

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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((s) => (
              <a
                key={s.name_en}
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex flex-col rounded-2xl border ${s.accentBorder} ${s.accentBg} p-6 transition-all duration-200 hover:shadow-md hover:scale-[1.01]`}
              >
                <div className="mb-4 flex items-start justify-between">
                  <span className="text-3xl">{s.icon}</span>
                  <span className={`rounded-full border ${s.accentBorder} bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${s.accentText}`}>
                    {isAr ? "عبر Travelpayouts" : "via TP"}
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
        </section>

        {/* ── Trust note ────────────────────────────────────────────── */}
        <section className="mx-auto max-w-4xl px-4 pb-4 sm:px-6">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6 text-center">
            <p className="text-sm text-gray-500">
              {isAr
                ? "🔗 جميع الروابط محمية بنظام تتبع Travelpayouts. عمولاتك مضمونة على كل حجز."
                : "🔗 All links are tracked through Travelpayouts. Your commissions are guaranteed on every booking."}
            </p>
          </div>
        </section>
      </main>

      <Footer dict={dict} locale={locale} />
    </>
  );
}
