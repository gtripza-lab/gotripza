import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export function generateMetadata({ params }: { params: { locale: string } }) {
  return {
    title:
      params.locale === "ar"
        ? "سياسة الخصوصية — GoTripza"
        : "Privacy Policy — GoTripza",
    description:
      params.locale === "ar"
        ? "اقرأ سياسة الخصوصية الخاصة بـ GoTripza وتعرّف على كيفية حماية بياناتك الشخصية."
        : "Read GoTripza's Privacy Policy and learn how we protect your personal data.",
  };
}

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
        <div className="mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-primary/70">
            {isAr ? "قانوني" : "Legal"}
          </p>
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
          </h1>
          <p className="mt-3 text-sm text-white/40">
            {isAr ? "آخر تحديث: أبريل 2025" : "Last updated: April 2025"}
          </p>
        </div>

        <div className="space-y-8 text-white/75">

          {isAr ? (
            <>
              <Section title="مقدمة">
                <p>
                  مرحباً بك في GoTripza. نحن نلتزم بحماية خصوصيتك وبياناتك الشخصية. توضح هذه السياسة كيفية جمع المعلومات واستخدامها وتخزينها وحمايتها عند استخدامك لموقعنا الإلكتروني gotripza.com وخدماتنا المرتبطة به.
                </p>
              </Section>

              <Section title="المعلومات التي نجمعها">
                <p className="mb-3">نجمع نوعين من المعلومات:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    <strong className="text-white/90">معلومات تقدمها أنت:</strong> عند البحث عن رحلة، نعالج استعلامك النصي لاستخراج تفاصيل الوجهة والتواريخ وتفضيلات السفر لتقديم نتائج دقيقة.
                  </li>
                  <li>
                    <strong className="text-white/90">بيانات الاستخدام التلقائية:</strong> نجمع بيانات مجمّعة ومجهولة الهوية حول استخدام الموقع، مثل: عدد الزيارات، الصفحات المُشاهدة، أنواع الأجهزة المستخدمة، والوجهات الأكثر بحثاً — وذلك لتحسين تجربة المستخدم وجودة الخدمة.
                  </li>
                </ul>
              </Section>

              <Section title="ملفات تعريف الارتباط (Cookies)">
                <p>
                  نستخدم ملفات تعريف الارتباط لأغراض وظيفية وتحليلية بحتة. لا نستخدمها للإعلانات المستهدفة. تشمل الكوكيز التي نستخدمها:
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>كوكيز الجلسة: لحفظ إعدادات اللغة والعملة خلال زيارتك.</li>
                  <li>كوكيز تحليلية مجهولة: لفهم كيفية استخدام الموقع بشكل مجمّع.</li>
                </ul>
                <p className="mt-3">
                  يمكنك إدارة أو تعطيل ملفات تعريف الارتباط من إعدادات متصفحك في أي وقت، علماً بأن ذلك قد يؤثر على بعض وظائف الموقع.
                </p>
              </Section>

              <Section title="كيف نستخدم معلوماتك">
                <p>نستخدم البيانات التي نجمعها للأغراض التالية حصراً:</p>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>معالجة استعلامات البحث وإرجاع نتائج سفر ذات صلة.</li>
                  <li>تحسين دقة نماذج الذكاء الاصطناعي لفهم نوايا المستخدمين.</li>
                  <li>تحليل الأداء العام للموقع وتحديد مشاكل تقنية.</li>
                  <li>الامتثال للمتطلبات القانونية والتنظيمية.</li>
                </ul>
              </Section>

              <Section title="مشاركة البيانات">
                <p>
                  لا نبيع بياناتك الشخصية ولا نؤجرها أو نتاجر بها تحت أي ظرف. نشارك البيانات في الحالات التالية فقط:
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>
                    <strong className="text-white/90">شركاء التحويل:</strong> عند النقر على رابط حجز، يتم توجيهك إلى موقع شريكنا (مثل Aviasales أو Hotellook) وقد تنتقل بيانات جلستك إليهم وفق سياسة خصوصيتهم.
                  </li>
                  <li>
                    <strong className="text-white/90">مزودو الخدمات التقنية:</strong> نستخدم Supabase لتسجيل أحداث الاستخدام المجهولة، وVercel لاستضافة الموقع. هؤلاء الشركاء ملزمون باتفاقيات عدم الإفصاح.
                  </li>
                  <li>
                    <strong className="text-white/90">المتطلبات القانونية:</strong> نكشف عن البيانات إن طُلب منا ذلك قانونياً من قِبل الجهات الرقابية المختصة.
                  </li>
                </ul>
              </Section>

              <Section title="روابط الطرف الثالث">
                <p>
                  يحتوي موقعنا على روابط لمواقع شريكة (شركات طيران، فنادق، منصات حجز). نحن لسنا مسؤولين عن ممارسات الخصوصية لدى هذه الجهات وننصحك بمراجعة سياسات خصوصيتها قبل تقديم أي بيانات شخصية.
                </p>
              </Section>

              <Section title="الاحتفاظ بالبيانات">
                <p>
                  نحتفظ ببيانات الاستخدام المجمّعة لمدة لا تتجاوز 12 شهراً من تاريخ جمعها. لا نحتفظ بأي معلومات تعريفية شخصية مرتبطة بالمستخدمين.
                </p>
              </Section>

              <Section title="حقوقك">
                <p>وفقاً للوائح حماية البيانات المعمول بها، تتمتع بالحقوق التالية:</p>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>حق الوصول إلى أي بيانات شخصية نحتفظ بها عنك.</li>
                  <li>حق تصحيح البيانات غير الدقيقة.</li>
                  <li>حق طلب حذف بياناتك.</li>
                  <li>حق الاعتراض على معالجة بيانات بعينها.</li>
                </ul>
                <p className="mt-3">
                  لممارسة أي من هذه الحقوق، تواصل معنا على: <a href="mailto:privacy@gotripza.com" className="text-brand-primary hover:underline">privacy@gotripza.com</a>
                </p>
              </Section>

              <Section title="الأمان">
                <p>
                  نطبق إجراءات أمنية تقنية وتنظيمية مناسبة لحماية بياناتك من الوصول غير المصرح به أو الإفصاح أو التعديل أو الإتلاف. يتضمن ذلك التشفير عبر بروتوكول HTTPS ومراجعات أمنية دورية.
                </p>
              </Section>

              <Section title="التعديلات على هذه السياسة">
                <p>
                  نحتفظ بالحق في تعديل هذه السياسة في أي وقت. ستُنشر التعديلات على هذه الصفحة مع تحديث تاريخ آخر مراجعة. نشجعك على مراجعة هذه الصفحة دورياً.
                </p>
              </Section>

              <Section title="التواصل معنا">
                <p>
                  لأي استفسارات أو مخاوف تتعلق بالخصوصية، يرجى التواصل عبر:{" "}
                  <a href="mailto:privacy@gotripza.com" className="text-brand-primary hover:underline">
                    privacy@gotripza.com
                  </a>
                </p>
              </Section>
            </>
          ) : (
            <>
              <Section title="Introduction">
                <p>
                  Welcome to GoTripza. We are committed to protecting your privacy and personal data. This policy explains how we collect, use, store, and protect information when you use our website gotripza.com and related services.
                </p>
              </Section>

              <Section title="Information We Collect">
                <p className="mb-3">We collect two types of information:</p>
                <ul className="list-disc space-y-2 pl-5">
                  <li>
                    <strong className="text-white/90">Information you provide:</strong> When you search for a trip, we process your natural language query to extract destination details, dates, and travel preferences to return accurate results.
                  </li>
                  <li>
                    <strong className="text-white/90">Automatically collected usage data:</strong> We collect anonymised, aggregated data about site usage — such as page views, device types, and popular destinations — to improve user experience and service quality.
                  </li>
                </ul>
              </Section>

              <Section title="Cookies">
                <p>
                  We use cookies solely for functional and analytical purposes. We do not use cookies for targeted advertising. Our cookies include:
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>Session cookies: to remember your language and currency preferences during your visit.</li>
                  <li>Anonymous analytics cookies: to understand how the site is used in aggregate.</li>
                </ul>
                <p className="mt-3">
                  You can manage or disable cookies from your browser settings at any time. Note that doing so may affect some site functionality.
                </p>
              </Section>

              <Section title="How We Use Your Information">
                <p>We use collected data exclusively for:</p>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>Processing search queries and returning relevant travel results.</li>
                  <li>Improving the accuracy of our AI models for understanding user intent.</li>
                  <li>Analysing overall site performance and identifying technical issues.</li>
                  <li>Complying with legal and regulatory requirements.</li>
                </ul>
              </Section>

              <Section title="Data Sharing">
                <p>
                  We do not sell, rent, or trade your personal data under any circumstances. We share data only in the following cases:
                </p>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>
                    <strong className="text-white/90">Affiliate partners:</strong> When you click a booking link, you are directed to our partner&apos;s website (e.g. Aviasales or Hotellook), and session data may transfer to them under their own privacy policy.
                  </li>
                  <li>
                    <strong className="text-white/90">Technical service providers:</strong> We use Supabase for anonymous event logging and Vercel for site hosting. These providers are bound by data processing agreements.
                  </li>
                  <li>
                    <strong className="text-white/90">Legal requirements:</strong> We disclose data if required by law or competent regulatory authorities.
                  </li>
                </ul>
              </Section>

              <Section title="Third-Party Links">
                <p>
                  Our site contains links to partner websites (airlines, hotels, booking platforms). We are not responsible for the privacy practices of these parties and encourage you to review their privacy policies before submitting any personal information.
                </p>
              </Section>

              <Section title="Data Retention">
                <p>
                  We retain aggregated usage data for no more than 12 months from collection. We do not retain any personally identifiable information linked to individual users.
                </p>
              </Section>

              <Section title="Your Rights">
                <p>Under applicable data protection regulations, you have the right to:</p>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>Access any personal data we hold about you.</li>
                  <li>Correct inaccurate data.</li>
                  <li>Request deletion of your data.</li>
                  <li>Object to certain data processing activities.</li>
                </ul>
                <p className="mt-3">
                  To exercise any of these rights, contact us at:{" "}
                  <a href="mailto:privacy@gotripza.com" className="text-brand-primary hover:underline">
                    privacy@gotripza.com
                  </a>
                </p>
              </Section>

              <Section title="Security">
                <p>
                  We implement appropriate technical and organisational security measures to protect your data from unauthorised access, disclosure, alteration, or destruction. This includes HTTPS encryption and regular security reviews.
                </p>
              </Section>

              <Section title="Changes to This Policy">
                <p>
                  We reserve the right to amend this policy at any time. Changes will be published on this page with an updated revision date. We encourage you to review this page periodically.
                </p>
              </Section>

              <Section title="Contact Us">
                <p>
                  For any privacy-related questions or concerns, please contact us at:{" "}
                  <a href="mailto:privacy@gotripza.com" className="text-brand-primary hover:underline">
                    privacy@gotripza.com
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
