import Link from "next/link";

type ServiceItem = {
  icon: string;
  titleAr: string;
  titleEn: string;
  descAr: string;
  descEn: string;
};

const SERVICES: ServiceItem[] = [
  {
    icon: "🛡️",
    titleAr: "تأمين السفر",
    titleEn: "Travel Insurance",
    descAr: "حماية طبية وتعويضات تأخير وفقدان أمتعة قبل السفر.",
    descEn: "Medical cover, delay protection, and baggage support before you fly.",
  },
  {
    icon: "📡",
    titleAr: "شرائح eSIM",
    titleEn: "eSIM Data",
    descAr: "إنترنت عالمي بدون تجوال عبر Airalo وYesim.",
    descEn: "Global data without roaming through Airalo and Yesim.",
  },
  {
    icon: "🎟️",
    titleAr: "أنشطة وتجارب",
    titleEn: "Activities",
    descAr: "تذاكر معالم، جولات، وتجارب محلية للوجهة.",
    descEn: "Attraction tickets, tours, and local experiences.",
  },
  {
    icon: "🚗",
    titleAr: "تأجير سيارات",
    titleEn: "Car Rental",
    descAr: "قارن السيارات عندما تكون الوجهة تحتاج قيادة.",
    descEn: "Compare rentals when the destination is easier by car.",
  },
  {
    icon: "⚖️",
    titleAr: "تعويض الرحلات",
    titleEn: "Flight Compensation",
    descAr: "تحقق من حقك بالتعويض عند تأخير أو إلغاء الرحلات.",
    descEn: "Check compensation eligibility for delayed or cancelled flights.",
  },
  {
    icon: "🔒",
    titleAr: "حماية الاتصال",
    titleEn: "Connection Security",
    descAr: "VPN للسفر عند استخدام شبكات الفنادق والمطارات.",
    descEn: "VPN protection on hotel, airport, and cafe Wi-Fi.",
  },
];

export function TravelerServicesSection({ locale }: { locale: "ar" | "en" }) {
  const isAr = locale === "ar";

  return (
    <section className="border-y border-white/[0.06] bg-white/[0.02]" dir={isAr ? "rtl" : "ltr"}>
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-mint/70">
              {isAr ? "باقي احتياجات الرحلة" : "Trip Essentials"}
            </p>
            <h2 className="font-display text-3xl font-bold text-white">
              {isAr ? "ليست الرحلة طيران فقط" : "Travel Is More Than Flights"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/55">
              {isAr
                ? "سوّقنا داخل GoTripza خدمات يحتاجها المسافر فعلاً: التأمين، الشرائح، الأنشطة، السيارات، وتعويض الرحلات."
                : "GoTripza highlights the services travelers actually need: insurance, eSIMs, activities, cars, and flight compensation."}
            </p>
          </div>
          <Link
            href={`/${locale}/services`}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] px-4 text-sm font-semibold text-white/80 transition hover:bg-white/[0.09] hover:text-white"
          >
            {isAr ? "عرض كل الخدمات" : "View All Services"}
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((item) => (
            <Link
              key={item.titleEn}
              href={`/${locale}/services`}
              className="rounded-2xl border border-white/[0.06] bg-black/20 p-5 transition hover:border-white/15 hover:bg-white/[0.04]"
            >
              <div className="mb-4 text-2xl">{item.icon}</div>
              <h3 className="font-semibold text-white/90">{isAr ? item.titleAr : item.titleEn}</h3>
              <p className="mt-2 text-sm leading-6 text-white/45">{isAr ? item.descAr : item.descEn}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
