import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export function generateMetadata({ params }: { params: { locale: string } }) {
  return {
    title:
      params.locale === "ar"
        ? "الشروط والأحكام — GoTripza"
        : "Terms & Conditions — GoTripza",
    description:
      params.locale === "ar"
        ? "اقرأ الشروط والأحكام الخاصة باستخدام منصة GoTripza للبحث عن السفر."
        : "Read the Terms & Conditions for using the GoTripza travel search platform.",
  };
}

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
        <div className="mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-primary/70">
            {isAr ? "قانوني" : "Legal"}
          </p>
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            {isAr ? "الشروط والأحكام" : "Terms & Conditions"}
          </h1>
          <p className="mt-3 text-sm text-white/40">
            {isAr ? "آخر تحديث: أبريل 2025" : "Last updated: April 2025"}
          </p>
        </div>

        <div className="space-y-8 text-white/75">
          {isAr ? (
            <>
              <Section title="قبول الشروط">
                <p>
                  باستخدامك لموقع GoTripza (gotripza.com)، فإنك تقر بقراءة هذه الشروط والأحكام والموافقة عليها. إن كنت لا توافق على أي بند من هذه الشروط، يرجى التوقف عن استخدام الموقع.
                </p>
              </Section>

              <Section title="طبيعة الخدمة">
                <p>
                  GoTripza هي منصة بحث وتوصية ذكية تستخدم الذكاء الاصطناعي للبحث عن خيارات السفر من مصادر متعددة وتقديمها للمستخدم. نحن لسنا وكالة سفر ولا نبيع تذاكر الطيران أو غرف الفنادق مباشرة.
                </p>
                <p className="mt-3">
                  تُتم جميع عمليات الحجز الفعلية عبر مواقع شركائنا المعتمدين (مثل Aviasales وHotellook)، وتطبّق شروطهم وأحكامهم وسياسات الإلغاء والاسترداد الخاصة بهم على أي معاملة.
                </p>
              </Section>

              <Section title="دقة المعلومات والأسعار">
                <p>
                  نسعى جاهدين لعرض أسعار ومعلومات دقيقة في الوقت الفعلي. غير أن أسعار الطيران والفنادق متغيرة باستمرار، ولا نضمن توفر أي سعر معروض عند إتمام عملية الحجز على موقع الشريك.
                </p>
                <p className="mt-3">
                  يُعدّ السعر النهائي المعروض على موقع الشريك وقت الحجز هو السعر الملزم قانونياً، وليس السعر الاستشاري المعروض على GoTripza.
                </p>
              </Section>

              <Section title="الإفصاح عن العلاقات التجارية">
                <p>
                  قد تحصل GoTripza على عمولة مالية من شركاء الإحالة عند إتمام عمليات الحجز عبر روابطنا. هذه العمولة لا تُضاف إلى سعر الخدمة التي تدفعها ولا تؤثر عليه. للمزيد، راجع{" "}
                  <a href="/ar/disclosure" className="text-brand-primary hover:underline">صفحة الإفصاح عن الشراكات</a>.
                </p>
              </Section>

              <Section title="حدود المسؤولية">
                <p>تقديم GoTripza خدماتها كما هي (as-is). لا نتحمل المسؤولية عن:</p>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>أي خسائر مالية ناجمة عن اتخاذ قرارات حجز بناءً على المعلومات المعروضة.</li>
                  <li>تغييرات الأسعار أو إلغاء الرحلات أو أوضاع الفنادق بعد الحجز.</li>
                  <li>تصرفات أو إغفالات شركاء الطرف الثالث.</li>
                  <li>الانقطاعات التقنية المؤقتة للخدمة.</li>
                </ul>
              </Section>

              <Section title="الملكية الفكرية">
                <p>
                  جميع محتويات الموقع، بما في ذلك التصميم والشعارات والنصوص والكود البرمجي، هي ملك حصري لـ GoTripza أو مرخصة لها. يُحظر نسخ أو توزيع أو إعادة نشر أي محتوى دون إذن كتابي مسبق.
                </p>
              </Section>

              <Section title="القانون المطبق">
                <p>
                  تخضع هذه الشروط وأي نزاعات ناشئة عنها لقوانين المملكة العربية السعودية. تختص المحاكم السعودية بالنظر في أي نزاعات تتعلق بهذه الشروط.
                </p>
              </Section>

              <Section title="التعديلات">
                <p>
                  نحتفظ بحق تعديل هذه الشروط في أي وقت. سيُبلَّغ المستخدمون بالتغييرات الجوهرية عبر نشرها على هذه الصفحة مع تحديث التاريخ.
                </p>
              </Section>

              <Section title="التواصل">
                <p>
                  لأي استفسارات قانونية:{" "}
                  <a href="mailto:legal@gotripza.com" className="text-brand-primary hover:underline">
                    legal@gotripza.com
                  </a>
                </p>
              </Section>
            </>
          ) : (
            <>
              <Section title="Acceptance of Terms">
                <p>
                  By using GoTripza (gotripza.com) you acknowledge that you have read and agree to these Terms & Conditions. If you do not agree to any provision, please stop using the site.
                </p>
              </Section>

              <Section title="Nature of Service">
                <p>
                  GoTripza is an AI-powered travel search and recommendation platform that aggregates options from multiple sources and presents them to users. We are not a travel agency and do not directly sell airline tickets or hotel rooms.
                </p>
                <p className="mt-3">
                  All actual bookings are completed through our certified partner sites (such as Aviasales and Hotellook). Their terms, conditions, and cancellation/refund policies apply to any transaction.
                </p>
              </Section>

              <Section title="Price Accuracy">
                <p>
                  We strive to display accurate, real-time pricing. However, flight and hotel prices change continuously. We do not guarantee that any displayed price will remain available when you complete a booking on the partner&apos;s site.
                </p>
                <p className="mt-3">
                  The final price shown on the partner site at the time of booking is the legally binding price — not the indicative price shown on GoTripza.
                </p>
              </Section>

              <Section title="Commercial Relationships Disclosure">
                <p>
                  GoTripza may receive a referral commission from affiliate partners when bookings are completed through our links. This commission is not added to the price you pay and does not affect it. See our{" "}
                  <a href="/en/disclosure" className="text-brand-primary hover:underline">Affiliate Disclosure</a> page for full details.
                </p>
              </Section>

              <Section title="Limitation of Liability">
                <p>GoTripza provides its services on an as-is basis. We are not liable for:</p>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>Any financial loss resulting from booking decisions made based on information displayed.</li>
                  <li>Price changes, flight cancellations, or hotel conditions after booking.</li>
                  <li>Actions or omissions by third-party partners.</li>
                  <li>Temporary technical service interruptions.</li>
                </ul>
              </Section>

              <Section title="Intellectual Property">
                <p>
                  All site content — including design, logos, text, and code — is the exclusive property of GoTripza or is licensed to it. Copying, distributing, or republishing any content without prior written permission is prohibited.
                </p>
              </Section>

              <Section title="Governing Law">
                <p>
                  These Terms and any disputes arising from them are governed by the laws of the Kingdom of Saudi Arabia. Saudi courts have jurisdiction over any disputes relating to these Terms.
                </p>
              </Section>

              <Section title="Amendments">
                <p>
                  We reserve the right to amend these Terms at any time. Users will be notified of material changes by their publication on this page with an updated date.
                </p>
              </Section>

              <Section title="Contact">
                <p>
                  For legal inquiries:{" "}
                  <a href="mailto:legal@gotripza.com" className="text-brand-primary hover:underline">
                    legal@gotripza.com
                  </a>
                </p>
              </Section>
            </>
          )}
        </div>
      </main>
      <Footer dict={dict} locale={locale as Locale} />
    </>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h2 className="mb-3 font-display text-xl font-bold text-white">{title}</h2>
      <div className="text-sm leading-relaxed text-white/70">{children}</div>
    </div>
  );
}
