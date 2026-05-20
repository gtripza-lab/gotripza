import { getSeoInventory } from "@/lib/seo-inventory";
import { DESTINATIONS } from "@/lib/seo-destinations";
import {
  getCountryCostSubjects,
  ORIGIN_MARKETS,
} from "@/lib/global-seo-system";
import { SEO_GUIDE_FAMILIES } from "@/lib/global-travel-guides";
import { scoreGuidePage, scoreTripCostPage } from "@/lib/seo-quality";
import { MetricCard } from "@/components/admin/MetricCard";

export const metadata = { title: "SEO العالمي" };

function pct(value: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

export default function AdminSeoPage() {
  const inventory = getSeoInventory();
  const subjects = [...DESTINATIONS, ...getCountryCostSubjects()];
  const tripSamples = subjects.flatMap((subject) =>
    ORIGIN_MARKETS.slice(0, 6).map((origin) => scoreTripCostPage(subject, origin)),
  );
  const guideSamples = DESTINATIONS.flatMap((destination) =>
    SEO_GUIDE_FAMILIES.map((family) => scoreGuidePage(destination, family)),
  );
  const tripPass = tripSamples.filter((item) => item.publishable).length;
  const guidePass = guideSamples.filter((item) => item.publishable).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">SEO العالمي</h1>
        <p className="mt-1 text-sm text-white/40">
          مخزون صفحات Rya العالمية، جودة النشر، وحالة العائلات البرمجية.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
        <MetricCard label="إجمالي الصفحات" value={inventory.totalProgrammaticPages.toLocaleString()} color="blue" />
        <MetricCard label="Trip Cost" value={inventory.tripCostPages.toLocaleString()} />
        <MetricCard label="Guide Pages" value={inventory.guidePages.toLocaleString()} />
        <MetricCard label="Airport Pages" value={inventory.airportPages.toLocaleString()} />
        <MetricCard label="Hubs" value={(inventory.hubPages + inventory.tripCostSubjectHubs).toLocaleString()} />
        <MetricCard label="اللغات" value={inventory.locales.toLocaleString()} color="green" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
          <h2 className="text-base font-medium text-white">جودة Trip Cost</h2>
          <p className="mt-1 text-xs text-white/35">عينة من الوجهات والأسواق الرئيسية، حد النشر 80.</p>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-4xl font-semibold text-white">{pct(tripPass, tripSamples.length)}</p>
              <p className="mt-1 text-sm text-white/40">{tripPass.toLocaleString()} / {tripSamples.length.toLocaleString()} publishable</p>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
              Active
            </span>
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
          <h2 className="text-base font-medium text-white">جودة Guide Families</h2>
          <p className="mt-1 text-xs text-white/35">كل عائلة محتوى عبر الوجهات، حد النشر 75.</p>
          <div className="mt-5 flex items-end justify-between">
            <div>
              <p className="text-4xl font-semibold text-white">{pct(guidePass, guideSamples.length)}</p>
              <p className="mt-1 text-sm text-white/40">{guidePass.toLocaleString()} / {guideSamples.length.toLocaleString()} publishable</p>
            </div>
            <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-300">
              Active
            </span>
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
        <h2 className="text-base font-medium text-white">عائلات المحتوى</h2>
        <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {SEO_GUIDE_FAMILIES.map((family) => (
            <div key={family} className="rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3">
              <p className="text-sm font-medium text-white/80">{family}</p>
              <p className="mt-1 text-xs text-white/35">{DESTINATIONS.length.toLocaleString()} destinations × {inventory.locales} locales</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
