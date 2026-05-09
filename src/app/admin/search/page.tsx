import { getBookingStats } from "@/lib/admin/data";
import type { BookingStats, ClickRow } from "@/lib/admin/data";
import { MetricCard } from "@/components/admin/MetricCard";
import dynamic from "next/dynamic";

const AreaChartCard = dynamic(
  () => import("@/components/admin/AdminCharts").then((m) => ({ default: m.AreaChartCard })),
  { ssr: false },
);
const BarChartCard = dynamic(
  () => import("@/components/admin/AdminCharts").then((m) => ({ default: m.BarChartCard })),
  { ssr: false },
);
import { MousePointerClick, Plane, Hotel, LayoutGrid, DollarSign } from "lucide-react";

export const metadata = { title: "Search & Clicks" };

function typeBadge(resultType: string) {
  const t = resultType?.toLowerCase();
  if (t === "flight") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-blue-400">
        <Plane className="h-2.5 w-2.5" />
        Flight
      </span>
    );
  }
  if (t === "hotel") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
        <Hotel className="h-2.5 w-2.5" />
        Hotel
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/50">
      {resultType ?? "—"}
    </span>
  );
}

function formatTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-US", {
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
        Failed to load search &amp; clicks data.
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Search &amp; Clicks</h1>
        <p className="mt-1 text-sm text-white/40">Last 30 days of affiliate click activity</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <MetricCard
          label="Total Clicks (30d)"
          value={stats.total.toLocaleString()}
          icon={MousePointerClick}
        />
        <MetricCard
          label="Flights"
          value={stats.flights.toLocaleString()}
          icon={Plane}
          color="blue"
        />
        <MetricCard
          label="Hotels"
          value={stats.hotels.toLocaleString()}
          icon={Hotel}
          color="green"
        />
        <MetricCard
          label="Others"
          value={stats.others.toLocaleString()}
          icon={LayoutGrid}
          color="yellow"
        />
        <MetricCard
          label="Est. Revenue ($)"
          value={`$${stats.estRevTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          icon={DollarSign}
          color="green"
        />
      </div>

      {/* Daily Clicks Area Chart */}
      {stats.daily.length > 0 && (
        <AreaChartCard
          label="Daily Clicks"
          data={stats.daily as unknown as Record<string, unknown>[]}
          dataKey="clicks"
        />
      )}

      {/* Provider + Destination Bar Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {stats.byProvider.length > 0 && (
          <BarChartCard
            label="Clicks by Provider"
            data={stats.byProvider as unknown as Record<string, unknown>[]}
            nameKey="provider"
            dataKey="clicks"
            horizontal
          />
        )}
        {stats.byDestination.length > 0 && (
          <BarChartCard
            label="Clicks by Destination"
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
            Recent Clicks
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-[10px] font-medium uppercase tracking-widest text-white/30">
                  <th className="pb-3 pr-4 text-left">Time</th>
                  <th className="pb-3 pr-4 text-left">Type</th>
                  <th className="pb-3 pr-4 text-left">Provider</th>
                  <th className="pb-3 pr-4 text-left">Destination</th>
                  <th className="pb-3 text-right">Price</th>
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
