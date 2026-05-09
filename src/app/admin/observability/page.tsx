import { Activity, Clock, Gauge, AlertTriangle } from "lucide-react";
import { getObservabilityStats } from "@/lib/admin/data";
import type { AiTraceRow } from "@/lib/admin/data";
import { MetricCard } from "@/components/admin/MetricCard";
import { BarChartCard, DonutChart } from "@/components/admin/AdminCharts";

export const metadata = { title: "Observability" };

export const dynamic = "force-dynamic";

function modeBadge(mode: string | null) {
  const base = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";
  if (mode === "search") return `${base} bg-blue-500/20 text-blue-400`;
  if (mode === "clarify") return `${base} bg-amber-500/20 text-amber-400`;
  if (mode === "advice") return `${base} bg-purple-500/20 text-purple-400`;
  return `${base} bg-white/10 text-white/50`;
}

export default async function ObservabilityPage() {
  const stats = await getObservabilityStats();

  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-white/30">Failed to load observability stats. Check server logs.</p>
      </div>
    );
  }

  const totalErrors = stats.errorsByKind.reduce((sum, e) => sum + e.count, 0);

  return (
    <div className="space-y-8 p-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-xl font-semibold text-white">Observability</h1>
        <p className="mt-1 text-xs text-white/35">Latency percentiles, error breakdown, and slowest traces · last 7 days</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard
          label="P50 Latency"
          value={`${stats.p50.toLocaleString()} ms`}
          icon={Clock}
          color="default"
        />
        <MetricCard
          label="P95 Latency"
          value={`${stats.p95.toLocaleString()} ms`}
          icon={Gauge}
          color={stats.p95 > 2000 ? "yellow" : "default"}
        />
        <MetricCard
          label="P99 Latency"
          value={`${stats.p99.toLocaleString()} ms`}
          icon={Activity}
          color={stats.p99 > 5000 ? "red" : "default"}
        />
        <MetricCard
          label="Error Count"
          value={totalErrors.toLocaleString()}
          icon={AlertTriangle}
          color={totalErrors > 0 ? "red" : "default"}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <BarChartCard
          data={stats.latencyBuckets as unknown as Record<string, unknown>[]}
          nameKey="bucket"
          dataKey="count"
          label="Latency Distribution"
        />
        <DonutChart
          data={stats.statusDistribution as unknown as Record<string, unknown>[]}
          nameKey="status"
          valueKey="count"
          label="Status Distribution"
        />
      </div>

      {/* Errors by kind table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
          Errors by Kind
        </p>
        {stats.errorsByKind.length === 0 ? (
          <p className="py-6 text-center text-xs text-white/20">No errors in the last 7 days</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="pb-2 text-left font-medium text-white/35">Error Kind</th>
                  <th className="pb-2 text-right font-medium text-white/35">Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {stats.errorsByKind.map((row) => (
                  <tr key={row.kind} className="transition-colors hover:bg-white/[0.02]">
                    <td className="py-2.5 pr-4">
                      <span className="rounded-md bg-red-500/10 px-1.5 py-0.5 text-red-400">
                        {row.kind}
                      </span>
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-white/60">
                      {row.count.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slowest traces table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
          Slowest Traces (7d)
        </p>
        {stats.slowestTraces.length === 0 ? (
          <p className="py-6 text-center text-xs text-white/20">No trace data available</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="pb-2 text-left font-medium text-white/35">ID</th>
                  <th className="pb-2 text-left font-medium text-white/35">Mode</th>
                  <th className="pb-2 text-left font-medium text-white/35">Model</th>
                  <th className="pb-2 text-right font-medium text-white/35">Duration</th>
                  <th className="pb-2 text-left font-medium text-white/35">Error Kind</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {stats.slowestTraces.map((trace: AiTraceRow) => (
                  <tr key={trace.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="py-2.5 pr-4 font-mono text-white/30">
                      …{trace.id.slice(-8)}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className={modeBadge(trace.mode)}>
                        {trace.mode ?? "—"}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-white/60">
                      {trace.model ?? "—"}
                    </td>
                    <td className="py-2.5 pr-4 text-right tabular-nums text-white/60">
                      {trace.duration_ms != null
                        ? `${trace.duration_ms.toLocaleString()} ms`
                        : "—"}
                    </td>
                    <td className="py-2.5">
                      {trace.error_kind ? (
                        <span className="rounded-md bg-red-500/10 px-1.5 py-0.5 text-red-400">
                          {trace.error_kind}
                        </span>
                      ) : (
                        <span className="text-white/20">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
