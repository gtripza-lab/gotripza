import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getDictionary } from "@/i18n/get-dictionary";
import { TravelerServicesGrid, type TravelerServiceCard } from "@/components/TravelerServicesGrid";
import type { Metadata } from "next";

export async function generateMetadata(props: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const params = await props.params;
  const isAr = params.locale === "ar";
  return {
    title: isAr
      ? "خدمات المسافر — تأمين · شرائح · أنشطة · سيارات · قطارات"
      : "Traveler Services — Insurance · eSIM · Activities · Cars · Trains",
    description: isAr
      ? "كل ما يحتاجه المسافر في مكان واحد: تأمين السفر، شرائح إنترنت عالمية، أنشطة وجولات، تأجير سيارات، تعويض رحلات، وقطارات."
      : "Everything you need for your trip: travel insurance, global eSIMs, tours, car rental, flight compensation, and trains.",
  };
}

// ── Partner cards — all links use Travelpayouts affiliate tracking (tpm.li) ──
const SERVICES: TravelerServiceCard[] = [
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
    provider: "visitorscoverage",
    resultType: "insurance",
    accentBg: "bg-blue-500/[0.08]", accentText: "text-blue-300", accentBorder: "border-blue-500/20", accentButton: "bg-blue-600",
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
    provider: "airalo",
    resultType: "esim",
    accentBg: "bg-indigo-500/[0.08]", accentText: "text-indigo-300", accentBorder: "border-indigo-500/20", accentButton: "bg-indigo-600",
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
    provider: "yesim",
    resultType: "esim",
    accentBg: "bg-cyan-500/[0.08]", accentText: "text-cyan-300", accentBorder: "border-cyan-500/20", accentButton: "bg-cyan-600",
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
    provider: "nordvpn",
    resultType: "partner",
    accentBg: "bg-blue-500/[0.08]", accentText: "text-blue-200", accentBorder: "border-blue-500/20", accentButton: "bg-blue-700",
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
    provider: "tiqets",
    resultType: "activities",
    accentBg: "bg-rose-500/[0.08]", accentText: "text-rose-300", accentBorder: "border-rose-500/20", accentButton: "bg-rose-600",
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
    provider: "klook",
    resultType: "activities",
    accentBg: "bg-orange-500/[0.08]", accentText: "text-orange-300", accentBorder: "border-orange-500/20", accentButton: "bg-orange-600",
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
    provider: "kkday",
    resultType: "activities",
    accentBg: "bg-amber-500/[0.08]", accentText: "text-amber-300", accentBorder: "border-amber-500/20", accentButton: "bg-amber-600",
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
    provider: "kiwi",
    resultType: "flight",
    accentBg: "bg-teal-500/[0.08]", accentText: "text-teal-300", accentBorder: "border-teal-500/20", accentButton: "bg-teal-600",
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
    provider: "airhelp",
    resultType: "compensation",
    accentBg: "bg-violet-500/[0.08]", accentText: "text-violet-300", accentBorder: "border-violet-500/20", accentButton: "bg-violet-600",
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
    provider: "autoeurope",
    resultType: "car_rental",
    accentBg: "bg-sky-500/[0.08]", accentText: "text-sky-300", accentBorder: "border-sky-500/20", accentButton: "bg-sky-600",
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
    provider: "qeeq",
    resultType: "car_rental",
    accentBg: "bg-emerald-500/[0.08]", accentText: "text-emerald-300", accentBorder: "border-emerald-500/20", accentButton: "bg-emerald-600",
  },
  {
    icon: "🚄",
    name_ar: "Rail Europe — قطارات أوروبا",
    name_en: "Rail Europe — Europe Trains",
    tagline_ar: "تنقل بين المدن الأوروبية بسهولة",
    tagline_en: "City-to-city train travel across Europe",
    desc_ar: "خيار ممتاز إذا كانت رحلتك بين باريس، لندن، أمستردام، روما أو برشلونة. القطار أحياناً أوفر وأسهل من الطيران الداخلي.",
    desc_en: "Great for trips between Paris, London, Amsterdam, Rome, or Barcelona. Trains can be easier and better value than short flights.",
    cta_ar: "استكشف القطارات",
    cta_en: "Explore Trains",
    url: "https://www.raileurope.com/",
    provider: "raileurope",
    resultType: "trains",
    accentBg: "bg-lime-500/[0.08]", accentText: "text-lime-300", accentBorder: "border-lime-500/20", accentButton: "bg-lime-700",
  },
];

export default async function ServicesPage(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;
  if (!isLocale(params.locale)) notFound();
  const locale = params.locale as Locale;
  const dict = await getDictionary(locale);
  const isAr = locale === "ar";

  return (
    <>
      <Navbar dict={dict} locale={locale} />

      <main className="min-h-screen bg-ink-950 pb-24">

        {/* ── Hero ──────────────────────────────────────────────────── */}
        <section className="bg-gradient-to-br from-ink-950 via-[#1a1040] to-ink-950 px-4 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/[0.08] px-4 py-2 text-sm text-brand-primary/80 backdrop-blur-sm">
              <span>✈️</span>
              <span>{isAr ? "شركاء موثوقون · خدمات مختارة بعناية" : "Trusted partners · Carefully selected services"}</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
              {isAr ? "احتياجات المسافر" : "Traveler Services"}
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-base text-white/55 leading-relaxed">
              {isAr
                ? "كل ما تحتاجه قبل وأثناء وبعد رحلتك — في مكان واحد: تأمين، شرائح إنترنت، أنشطة، سيارات، قطارات، وتعويض رحلات."
                : "Everything you need before, during, and after your trip — in one place: insurance, eSIMs, tours, cars, trains, and flight compensation."}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6">
          <div className="grid gap-3 md:grid-cols-3">
            {[
              {
                title: isAr ? "قبل السفر" : "Before Travel",
                body: isAr ? "تأمين السفر، eSIM، VPN، وخطة أنشطة أولية." : "Insurance, eSIM, VPN, and an initial activities plan.",
              },
              {
                title: isAr ? "أثناء الرحلة" : "During The Trip",
                body: isAr ? "أنشطة، تذاكر معالم، سيارات، قطارات، وتنقلات أسهل." : "Activities, attraction tickets, cars, trains, and easier movement.",
              },
              {
                title: isAr ? "بعد المشكلة" : "After Disruption",
                body: isAr ? "تعويض الرحلات المتأخرة أو الملغاة عبر شركاء مختصين." : "Compensation support for delayed or cancelled flights.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
                <h2 className="font-semibold text-white/90">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/50">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Service Cards Grid ─────────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <TravelerServicesGrid services={SERVICES} locale={locale} />
        </section>

      </main>

      <Footer dict={dict} locale={locale} />
    </>
  );
}
