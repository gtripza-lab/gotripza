import dynamic from "next/dynamic";
import { getDashboardStats } from "@/lib/admin/data";
import { MetricCard } from "@/components/admin/MetricCard";

const AreaChartCard = dynamic(
  () => import("@/components/admin/AdminCharts").then((m) => ({ default: m.AreaChartCard })),
  { ssr: false },
);

export const metadata = { title: "Dashboard" };

type AiTraceRow = {
  id: string;
  mode: string | null;
  status: string;
  duration_ms: number | null;
  model: string | null;
  tokens_in: number | null;
  tokens_out: number | null;
  error_kind: string | null;
  created_at: string;
};

function statusBadge(status: string) {
  const base = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";
  if (status === "ok") return `${base} bg-emerald-500/20 text-emerald-400`;
  if (status === "salvaged") return `${base} bg-amber-500/20 text-amber-400`;
  return `${base} bg-red-500/20 text-red-400`;
}

function modeBadge(mode: string | null) {
  const base = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";
  if (mode === "search") return `${base} bg-blue-500/20 text-blue-400`;
  if (mode === "clarify") return `${base} bg-amber-500/20 text-amber-400`;
  if (mode === "advice") return `${base} bg-purple-500/20 text-purple-400`;
  return `${base} bg-white/10 text-white/50`;
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#08080d] flex items-center justify-center">
        <div className="text-center rounded-2xl bg-white/[0.03] border border-white/[0.06] p-10">
          <p className="text-red-400 text-lg font-semibold mb-2">Failed to load dashboard</p>
          <p className="text-white/40 text-sm">Could not retrieve dashboard stats. Please try again later.</p>
        </div>
      </div>
    );
  }

  const errorRatePct = (stats.errorRate * 100).toFixed(1);
  const estRevFormatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(stats.estRevWeek);

  return (
    <div className="min-h-screen bg-[#08080d] px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-semibold tracking-tight">Operations Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">Real-time metrics and activity</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          label="Conversations (24h)"
          value={stats.conversations24h.toLocaleString()}
        />
        <MetricCard
          label="Conversations (7d)"
          value={stats.conversationsWeek.toLocaleString()}
        />
        <MetricCard
          label="AI Traces (total)"
          value={stats.aiTracesTotal.toLocaleString()}
        />
        <MetricCard
          label="Clicks (24h)"
          value={stats.searchClicks24h.toLocaleString()}
        />
        <MetricCard
          label="Est. Revenue (7d)"
          value={estRevFormatted}
        />
        <MetricCard
          label="Avg Latency"
          value={`${stats.avgLatencyMs.toLocaleString()} ms`}
          sub={`${errorRatePct}% error rate`}
        />
      </div>

      {/* Area Chart */}
      <AreaChartCard
        label="Daily Conversations (14d)"
        data={stats.dailyConversations as unknown as Record<string, unknown>[]}
        dataKey="count"
      />

      {/* Recent AI Traces Table */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-white text-base font-medium">Recent AI Traces</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-6 py-3 text-white/40 font-medium">Time</th>
                <th className="text-left px-6 py-3 text-white/40 font-medium">Mode</th>
                <th className="text-left px-6 py-3 text-white/40 font-medium">Status</th>
                <th className="text-left px-6 py-3 text-white/40 font-medium">Model</th>
                <th className="text-right px-6 py-3 text-white/40 font-medium">Latency</th>
                <th className="text-right px-6 py-3 text-white/40 font-medium">Tokens In / Out</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentTraces.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-white/40">
                    No traces found.
                  </td>
                </tr>
              ) : (
                stats.recentTraces.map((trace: AiTraceRow) => (
                  <tr
                    key={trace.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-3 text-white/60 whitespace-nowrap">
                      {new Date(trace.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-3">
                      <span className={modeBadge(trace.mode)}>
                        {trace.mode ?? "—"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={statusBadge(trace.status)}>
                        {trace.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-white/60 font-mono text-xs">
                      {trace.model ?? "—"}
                    </td>
                    <td className="px-6 py-3 text-right text-white/60 tabular-nums">
                      {trace.duration_ms != null
                        ? `${trace.duration_ms.toLocaleString()} ms`
                        : "—"}
                    </td>
                    <td className="px-6 py-3 text-right text-white/60 tabular-nums font-mono text-xs">
                      {trace.tokens_in != null || trace.tokens_out != null
                        ? `${(trace.tokens_in ?? 0).toLocaleString()} / ${(trace.tokens_out ?? 0).toLocaleString()}`
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
