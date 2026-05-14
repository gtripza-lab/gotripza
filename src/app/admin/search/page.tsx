import { getBookingStats } from "@/lib/admin/data";
import type { BookingStats, ClickRow } from "@/lib/admin/data";
import { MetricCard } from "@/components/admin/MetricCard";
import dynamic from "next/dynamic";

const AreaChartCard = dynamic(
  () => import("@/components/admin/AdminCharts").then((m) => ({ default: m.AreaChartCard })),
  {},
);
const BarChartCard = dynamic(
  () => import("@/components/admin/AdminCharts").then((m) => ({ default: m.BarChartCard })),
  {},
);
import { MousePointerClick, Plane, Hotel, LayoutGrid, DollarSign, ShieldCheck } from "lucide-react";

export const metadata = { title: "البحث والنقرات" };

function typeBadge(resultType: string) {
  const t = resultType?.toLowerCase();
  if (t === "flight") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-400">
        <Plane className="h-2.5 w-2.5" />
        طيران
      </span>
    );
  }
  if (t === "hotel") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
        <Hotel className="h-2.5 w-2.5" />
        فندق
      </span>
    );
  }
  if (["insurance", "esim", "activities", "car_rental", "trains", "compensation"].includes(t)) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-violet-300">
        <ShieldCheck className="h-2.5 w-2.5" />
        {serviceTypeLabel(t)}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/50">
      {resultType ?? "—"}
    </span>
  );
}

function serviceTypeLabel(type: string) {
  const labels: Record<string, string> = {
    insurance: "تأمين",
    esim: "eSIM",
    activities: "أنشطة",
    car_rental: "سيارات",
    trains: "قطارات",
    compensation: "تعويض",
  };
  return labels[type] ?? type;
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("ar-SA", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatPrice(price: number | null, currency: string | null) {
  if (price == null) return "—";
  const cur = currency?.toUpperCase() ?? "USD";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(price);
  } catch {
    return `${cur} ${price.toLocaleString()}`;
  }
}

export default async function SearchPage() {
  const stats: BookingStats | null = await getBookingStats();

  if (!stats) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-white/40">
        تعذر تحميل بيانات البحث والنقرات.
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white">البحث والنقرات</h1>
        <p className="mt-1 text-sm text-white/40">آخر 30 يوم من نقرات الشراكات والبحث</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <MetricCard
          label="إجمالي النقرات 30 يوم"
          value={stats.total.toLocaleString()}
          icon={MousePointerClick}
        />
        <MetricCard
          label="الطيران"
          value={stats.flights.toLocaleString()}
          icon={Plane}
          color="blue"
        />
        <MetricCard
          label="الفنادق"
          value={stats.hotels.toLocaleString()}
          icon={Hotel}
          color="green"
        />
        <MetricCard
          label="خدمات السفر"
          value={stats.serviceClicks.toLocaleString()}
          icon={ShieldCheck}
          color="blue"
        />
        <MetricCard
          label="أخرى"
          value={stats.others.toLocaleString()}
          icon={LayoutGrid}
          color="yellow"
        />
        <MetricCard
          label="دخل تقديري"
          value={`$${stats.estRevTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          icon={DollarSign}
          color="green"
        />
      </div>

      {stats.byService.length > 0 && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
            تسويق خدمات السفر
          </p>
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {stats.byService.map((row) => (
              <div key={row.type} className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
                <p className="text-xs text-white/35">{serviceTypeLabel(row.type)}</p>
                <p className="mt-1 text-2xl font-semibold text-white">{row.clicks.toLocaleString("ar-SA")}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Daily Clicks Area Chart */}
      {stats.daily.length > 0 && (
        <AreaChartCard
          label="النقرات اليومية"
          data={stats.daily as unknown as Record<string, unknown>[]}
          dataKey="clicks"
        />
      )}

      {/* Provider + Destination Bar Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {stats.byProvider.length > 0 && (
          <BarChartCard
            label="النقرات حسب الشريك"
            data={stats.byProvider as unknown as Record<string, unknown>[]}
            nameKey="provider"
            dataKey="clicks"
            horizontal
          />
        )}
        {stats.byDestination.length > 0 && (
          <BarChartCard
            label="النقرات حسب الوجهة"
            data={stats.byDestination as unknown as Record<string, unknown>[]}
            nameKey="destination"
            dataKey="clicks"
            horizontal
            color="#34d399"
          />
        )}
      </div>

      {/* Recent Clicks Table */}
      {stats.recentClicks.length > 0 && (
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
            آخر النقرات
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10px] font-medium uppercase tracking-widest text-white/30">
                  <th className="pb-3 pr-4 text-right">الوقت</th>
                  <th className="pb-3 pr-4 text-right">النوع</th>
                  <th className="pb-3 pr-4 text-right">الشريك</th>
                  <th className="pb-3 pr-4 text-right">الوجهة</th>
                  <th className="pb-3 text-right">السعر</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {stats.recentClicks.map((row: ClickRow) => (
                  <tr key={row.id} className="group hover:bg-white/[0.02]">
                    <td className="py-3 pr-4 text-left text-[11px] text-white/40 whitespace-nowrap">
                      {formatTime(row.created_at)}
                    </td>
                    <td className="py-3 pr-4 text-left">
                      {typeBadge(row.result_type)}
                    </td>
                    <td className="py-3 pr-4 text-left text-white/70 whitespace-nowrap">
                      {row.provider ?? "—"}
                    </td>
                    <td className="py-3 pr-4 text-left text-white/50">
                      {row.destination ?? "—"}
                    </td>
                    <td className="py-3 text-right font-semibold text-white/80 whitespace-nowrap">
                      {formatPrice(row.price, row.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
