import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export function generateMetadata({ params }: { params: { locale: string } }) {
  return {
    title:
      params.locale === "ar"
        ? "الإفصاح عن الشراكات التجارية — GoTripza"
        : "Affiliate Disclosure — GoTripza",
    description:
      params.locale === "ar"
        ? "إفصاح GoTripza عن علاقاتها التجارية مع شركاء الإحالة وتأثيرها على التوصيات."
        : "GoTripza's disclosure of its commercial relationships with affiliate partners and their effect on recommendations.",
  };
}

export default async function DisclosurePage({
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
            {isAr ? "شفافية" : "Transparency"}
          </p>
          <h1 className="font-display text-4xl font-bold sm:text-5xl">
            {isAr ? "الإفصاح عن الشراكات التجارية" : "Affiliate Disclosure"}
          </h1>
          <p className="mt-3 text-sm text-white/40">
            {isAr ? "آخر تحديث: أبريل 2025" : "Last updated: April 2025"}
          </p>
        </div>

        {/* Summary box */}
        <div className="mb-10 rounded-3xl border border-brand-primary/25 bg-gradient-to-br from-brand-primary/10 to-brand-deep/5 p-7">
          <div className="mb-3 flex items-center gap-2">
            <span className="text-2xl">💡</span>
            <span className="font-display text-lg font-bold text-white">
              {isAr ? "الخلاصة بكل وضوح" : "The short version"}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-white/80">
            {isAr
              ? "GoTripza تحصل على عمولة عند حجزك عبر روابطنا. لكن هذه العمولة لا تُضاف إلى سعرك ولا تؤثر على التوصيات التي نقدمها. هدفنا دائماً تقديم أفضل خيار لك، لأن ذلك هو ما يبني ثقتك ويجعلك تعود إلينا."
              : "GoTripza earns a commission when you book through our links. However, this commission is not added to your price and does not influence the recommendations we make. Our goal is always to show you the best option, because your trust is what keeps you coming back."}
          </p>
        </div>

        <div className="space-y-8 text-white/75">
          {isAr ? (
            <>
              <Section title="ما هو الإفصاح التابع (Affiliate Disclosure)؟">
                <p>
                  الإفصاح التابع هو إعلام المستخدمين بأن الموقع قد يحصل على عمولة مالية عند إجراء عمليات حجز عبر الروابط الموجودة على الموقع. هذا الإفصاح متطلب قانوني في كثير من دول العالم، ونحن نقدمه طوعاً وبشفافية تامة.
                </p>
              </Section>

              <Section title="كيف يعمل نموذج العمولات في GoTripza؟">
                <p>GoTripza مسجلة كناشر في شبكة Travelpayouts للتحالف السياحي. عند قيامك بما يلي:</p>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>النقر على زر "احجز الآن" لرحلة طيران أو فندق</li>
                  <li>إتمام عملية الحجز على موقع الشريك خلال نافذة زمنية محددة</li>
                </ul>
                <p className="mt-3">
                  يحصل GoTripza على عمولة من شركة الطيران أو الفندق أو منصة الحجز — تتراوح عادةً بين 1% و8% من قيمة الحجز — ويدفعها الشريك التجاري لا المستخدم.
                </p>
              </Section>

              <Section title="هل تؤثر العمولات على التوصيات؟">
                <p>
                  <strong className="text-white/90">لا.</strong> التوصيات التي يقدمها GoTripza محددة بالكامل بخوارزميات الذكاء الاصطناعي والبيانات الفعلية للسعر والجودة. لا نُبرز خياراً معيناً بسبب ارتفاع عمولته، ولا نُخفي خيارات ذات عمولة أقل.
                </p>
                <p className="mt-3">
                  نعرض دائماً: الأفضل قيمة + الأرخص + الأريح — بناءً على بيانات حقيقية لا اعتبارات تجارية.
                </p>
              </Section>

              <Section title="هل يدفع المستخدم أكثر عند الحجز عبر GoTripza؟">
                <p>
                  <strong className="text-white/90">لا.</strong> أسعار الحجز التي ستجدها على موقع الشريك عند التوجيه من GoTripza هي نفس الأسعار التي ستجدها لو زرت موقعهم مباشرة. العمولة يدفعها الشريك من حسابه، ليس من جيب المستخدم.
                </p>
              </Section>

              <Section title="شركاؤنا الحاليون">
                <p>نتعاون حالياً مع الشركاء التاليين من خلال شبكة Travelpayouts:</p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    { name: "Aviasales", type: "تذاكر طيران" },
                    { name: "Hotellook", type: "فنادق" },
                    { name: "DiscoverCars", type: "تأجير سيارات" },
                    { name: "GetYourGuide", type: "جولات وأنشطة" },
                    { name: "Kiwitaxi", type: "نقل مطار" },
                    { name: "Omio", type: "قطارات وحافلات" },
                  ].map((p) => (
                    <div key={p.name} className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                      <div className="font-semibold text-white/90 text-sm">{p.name}</div>
                      <div className="text-xs text-white/45 mt-0.5">{p.type}</div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="دعمك يُبقينا مجانيين">
                <p>
                  GoTripza متاح مجاناً للمستخدمين بالكامل. لا اشتراكات، لا رسوم خفية. العمولات التابعة هي المصدر الرئيسي لتمويل تطوير المنصة وتشغيل خوادم الذكاء الاصطناعي.
                </p>
                <p className="mt-3">
                  عند حجزك عبر روابطنا، أنت لا تدفع شيئاً إضافياً — لكنك تساهم في الإبقاء على GoTripza خدمة مجانية ومستمرة التطوير للجميع.
                </p>
              </Section>

              <Section title="استفساراتك">
                <p>
                  إن كان لديك أي استفسار حول نموذج العمل أو علاقاتنا التجارية، تواصل معنا:{" "}
                  <a href="mailto:hello@gotripza.com" className="text-brand-primary hover:underline">
                    hello@gotripza.com
                  </a>
                </p>
              </Section>
            </>
          ) : (
            <>
              <Section title="What is an Affiliate Disclosure?">
                <p>
                  An affiliate disclosure informs users that a website may earn a financial commission when bookings are made through links on the site. This disclosure is a legal requirement in many countries, and we provide it voluntarily and with full transparency.
                </p>
              </Section>

              <Section title="How GoTripza's Commission Model Works">
                <p>GoTripza is registered as a publisher in the Travelpayouts travel affiliate network. When you:</p>
                <ul className="mt-3 list-disc space-y-2 pl-5">
                  <li>Click a "Book Now" button for a flight or hotel</li>
                  <li>Complete a booking on the partner site within a specified time window</li>
                </ul>
                <p className="mt-3">
                  GoTripza earns a commission from the airline, hotel, or booking platform — typically ranging from 1% to 8% of the booking value — paid by the partner, not the user.
                </p>
              </Section>

              <Section title="Do Commissions Affect Recommendations?">
                <p>
                  <strong className="text-white/90">No.</strong> GoTripza's recommendations are determined entirely by AI algorithms and actual price/quality data. We do not highlight a particular option because it has a higher commission, nor do we suppress lower-commission options.
                </p>
                <p className="mt-3">
                  We always show: Best Value + Cheapest + Most Comfortable — based on real data, not commercial considerations.
                </p>
              </Section>

              <Section title="Does the User Pay More When Booking via GoTripza?">
                <p>
                  <strong className="text-white/90">No.</strong> The booking prices you find on the partner site when redirected from GoTripza are the same prices you'd find visiting their site directly. The commission is paid by the partner out of their margin, not added to your price.
                </p>
              </Section>

              <Section title="Our Current Partners">
                <p>We currently work with the following partners through the Travelpayouts network:</p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {[
                    { name: "Aviasales", type: "Flights" },
                    { name: "Hotellook", type: "Hotels" },
                    { name: "DiscoverCars", type: "Car rental" },
                    { name: "GetYourGuide", type: "Tours & activities" },
                    { name: "Kiwitaxi", type: "Airport transfers" },
                    { name: "Omio", type: "Trains & buses" },
                  ].map((p) => (
                    <div key={p.name} className="rounded-xl border border-white/8 bg-white/[0.03] p-3">
                      <div className="font-semibold text-white/90 text-sm">{p.name}</div>
                      <div className="text-xs text-white/45 mt-0.5">{p.type}</div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="Your Support Keeps Us Free">
                <p>
                  GoTripza is completely free for users. No subscriptions, no hidden fees. Affiliate commissions are the primary source of funding for platform development and running the AI infrastructure.
                </p>
                <p className="mt-3">
                  When you book through our links, you pay nothing extra — but you help keep GoTripza free and continually improving for everyone.
                </p>
              </Section>

              <Section title="Questions">
                <p>
                  If you have any questions about our business model or commercial relationships, contact us at:{" "}
                  <a href="mailto:hello@gotripza.com" className="text-brand-primary hover:underline">
                    hello@gotripza.com
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
