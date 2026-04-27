import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Terms & Conditions — GoTripza",
};

export default async function TermsPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  if (!isLocale(locale)) notFound();
  const dict = await getDictionary(locale as Locale);
  const isAr = locale === "ar";

  return (
    <>
      <Navbar dict={dict} locale={locale as Locale} />
      <main className="mx-auto max-w-3xl px-6 py-20">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">
          {isAr ? "الشروط والأحكام" : "Terms & Conditions"}
        </h1>
        <div className="prose prose-invert mt-8 max-w-none text-white/75">
          <p>
            {isAr
              ? "GoTripza هي منصة تجميع وتوصية ذكية. تُتم عمليات الحجز الفعلية عبر شركاء موثوقين (شركات الطيران، الفنادق، ومنصات الحجز)، وتطبق شروطهم وأحكامهم على الخدمات المقدّمة."
              : "GoTripza is an intelligent aggregator and recommendation platform. Bookings are completed through trusted partners (airlines, hotels, and booking platforms), whose own terms and conditions apply to the services provided."}
          </p>
          <p>
            {isAr
              ? "قد يحصل GoTripza على عمولة من شركاء الإحالة دون أي تكلفة إضافية على المستخدم. لا نضمن توفر الأسعار المعروضة لحظة إتمام الحجز نظراً لتغيرات السوق."
              : "GoTripza may receive a referral commission from partners at no additional cost to the user. We cannot guarantee that displayed prices remain available at booking time due to market fluctuations."}
          </p>
          <p>
            {isAr
              ? "للاستفسارات: legal@gotripza.com"
              : "For inquiries: legal@gotripza.com"}
          </p>
        </div>
      </main>
      <Footer dict={dict} locale={locale as Locale} />
    </>
  );
}
