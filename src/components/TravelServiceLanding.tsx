import Link from "next/link";

type Benefit = { ar: string; en: string };

export function TravelServiceLanding({
  locale,
  eyebrowAr,
  eyebrowEn,
  titleAr,
  titleEn,
  bodyAr,
  bodyEn,
  benefits,
}: {
  locale: "ar" | "en";
  eyebrowAr: string;
  eyebrowEn: string;
  titleAr: string;
  titleEn: string;
  bodyAr: string;
  bodyEn: string;
  benefits: Benefit[];
}) {
  const isAr = locale === "ar";

  return (
    <main className="min-h-screen bg-ink-950 text-white" dir={isAr ? "rtl" : "ltr"}>
      <section className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-mint/70">
          {isAr ? eyebrowAr : eyebrowEn}
        </p>
        <h1 className="font-display text-4xl font-bold leading-tight sm:text-6xl">
          {isAr ? titleAr : titleEn}
        </h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-white/62">
          {isAr ? bodyAr : bodyEn}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={`/${locale}/search`} className="btn-primary !rounded-xl !px-5">
            {isAr ? "اسأل ريا" : "Ask Rya"}
          </Link>
          <Link
            href={`/${locale}/services`}
            className="inline-flex h-11 items-center rounded-xl border border-white/10 bg-white/[0.05] px-5 text-sm font-semibold text-white/80 hover:bg-white/[0.09]"
          >
            {isAr ? "كل خدمات المسافر" : "All traveler services"}
          </Link>
        </div>
      </section>

      <section className="border-y border-white/[0.06] bg-white/[0.025]">
        <div className="mx-auto grid max-w-6xl gap-3 px-6 py-14 md:grid-cols-3">
          {benefits.map((benefit, index) => (
            <div key={index} className="rounded-2xl border border-white/[0.07] bg-black/20 p-6">
              <span className="mb-4 inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-primary/15 text-sm font-bold text-brand-mint">
                {index + 1}
              </span>
              <p className="text-base leading-8 text-white/72">{isAr ? benefit.ar : benefit.en}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
