import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy — GoTripza",
};

export default async function PrivacyPage({
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
          {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
        </h1>
        <div className="prose prose-invert mt-8 max-w-none text-white/75">
          <p>
            {isAr
              ? "نحن في GoTripza نلتزم بحماية خصوصيتكم. نقوم بجمع الحد الأدنى من البيانات اللازمة لتحسين تجربة البحث والحجز، ولا نشارك بياناتكم الشخصية مع أي طرف ثالث دون إذنكم الصريح."
              : "At GoTripza we take your privacy seriously. We collect the minimum data required to improve your search and booking experience, and we never share personal information with third parties without your explicit consent."}
          </p>
          <p>
            {isAr
              ? "تُستخدم ملفات تعريف الارتباط (Cookies) لتحسين الأداء وقياس الاستخدام بشكل مجمّع. يمكنكم إدارة تفضيلاتها من إعدادات المتصفح."
              : "We use cookies to improve performance and measure usage in aggregate. You may manage cookie preferences from your browser settings."}
          </p>
          <p>
            {isAr
              ? "للاستفسارات يرجى التواصل عبر البريد الإلكتروني: privacy@gotripza.com"
              : "For inquiries please contact: privacy@gotripza.com"}
          </p>
        </div>
      </main>
      <Footer dict={dict} locale={locale as Locale} />
    </>
  );
}
