import Link from "next/link";
import { BadgeCheck, HandCoins, ShieldCheck } from "lucide-react";
import type { Locale } from "@/i18n/config";

export function TrustDisclosureBand({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const items = [
    {
      icon: ShieldCheck,
      title: isAr ? "توصيات حسب السياق" : "Contextual recommendations",
      body: isAr
        ? "ريا تقترح التأمين أو الشريحة أو الأنشطة عندما تخدم موقف الرحلة، وليس كإعلانات عشوائية."
        : "Rya suggests insurance, eSIMs, or activities when they serve the trip moment, not as random ads.",
    },
    {
      icon: HandCoins,
      title: isAr ? "روابط شركاء بشفافية" : "Transparent partner links",
      body: isAr
        ? "قد نحصل على عمولة من بعض الشركاء عند الحجز، بدون زيادة على سعرك."
        : "We may earn a partner commission on some bookings, at no extra cost to you.",
    },
    {
      icon: BadgeCheck,
      title: isAr ? "الفنادق مؤجلة بوضوح" : "Hotels are clearly staged",
      body: isAr
        ? "إلى أن يكتمل ربط الفنادق، ريا تقدم مناطق سكن ونصائح اختيار بدلاً من عروض غير جاهزة."
        : "Until hotel inventory is connected, Rya gives stay areas and hotel-picking advice instead of pretending live offers exist.",
    },
  ];

  return (
    <section className="border-y border-white/[0.06] bg-white/[0.018]" dir={isAr ? "rtl" : "ltr"}>
      <div className="mx-auto grid max-w-7xl gap-3 px-6 py-10 md:grid-cols-3">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-2xl border border-white/[0.07] bg-black/20 p-5">
              <Icon className="mb-4 h-5 w-5 text-brand-mint" />
              <h3 className="text-sm font-semibold text-white/88">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-white/50">{item.body}</p>
            </div>
          );
        })}
      </div>
      <div className="mx-auto max-w-7xl px-6 pb-10">
        <Link
          href={`/${locale}/disclosure`}
          className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-semibold text-white/58 transition hover:bg-white/[0.08] hover:text-white/80"
        >
          {isAr ? "اقرأ سياسة الشفافية والشراكات" : "Read our transparency and partner disclosure"}
        </Link>
      </div>
    </section>
  );
}

