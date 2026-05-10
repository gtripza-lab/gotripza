import type { Metadata } from "next";
import { Activity, Clock, Cpu, DollarSign, AlertTriangle } from "lucide-react";
import { getAiStats } from "@/lib/admin/data";
import { MetricCard } from "@/components/admin/MetricCard";
import { AgentWorkflowPanel } from "@/components/admin/AgentWorkflowPanel";
import { getAgentWorkflowStatuses } from "@/lib/openai/agent-workflows";
import nextDynamic from "next/dynamic";

const BarChartCard = nextDynamic(
  () => import("@/components/admin/AdminCharts").then((m) => ({ default: m.BarChartCard })),
  { ssr: false },
);
const DonutChart = nextDynamic(
  () => import("@/components/admin/AdminCharts").then((m) => ({ default: m.DonutChart })),
  { ssr: false },
);

export const metadata: Metadata = {
  title: "AI Control Center",
};

export const dynamic = "force-dynamic";

export default async function AiControlCenterPage() {
  const stats = await getAiStats();
  const agentWorkflows = getAgentWorkflowStatuses();

  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-white/30">Failed to load AI stats. Check server logs.</p>
      </div>
    );
  }

  const totalCost = stats.byModel.reduce((sum, m) => sum + m.cost_usd, 0);
  const errorCount = stats.byStatus.find((s) => s.status === "error")?.count ?? 0;
  const feedback = stats.feedback;

  return (
    <div className="space-y-8 p-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-xl font-semibold text-white">AI Control Center</h1>
        <p className="mt-1 text-xs text-white/35">Last 7 days · all models · all modes</p>
      </div>

      <AgentWorkflowPanel workflows={agentWorkflows} />

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard
          label="Total Traces (7d)"
          value={stats.totalTraces.toLocaleString()}
          icon={Activity}
          color="blue"
        />
        <MetricCard
          label="Avg Latency"
          value={`${stats.avgLatency.toLocaleString()} ms`}
          icon={Clock}
          color="default"
        />
        <MetricCard
          label="P95 Latency"
          value={`${stats.p95Latency.toLocaleString()} ms`}
          icon={Cpu}
          color={stats.p95Latency > 5000 ? "red" : stats.p95Latency > 2000 ? "yellow" : "default"}
        />
        <MetricCard
          label="Total Cost"
          value={`$${totalCost.toFixed(4)}`}
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          label="Error Count (7d)"
          value={errorCount.toLocaleString()}
          icon={AlertTriangle}
          color={errorCount > 0 ? "red" : "default"}
        />
        <MetricCard
          label="Raya Helpful Rate"
          value={`${Math.round(feedback.helpfulRate * 100)}%`}
          icon={Activity}
          color={feedback.unhelpful > feedback.helpful ? "yellow" : "green"}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DonutChart
          data={stats.byMode as unknown as Record<string, unknown>[]}
          nameKey="mode"
          valueKey="count"
          label="Mode Distribution"
        />
        <BarChartCard
          data={stats.hourlyVolume as unknown as Record<string, unknown>[]}
          dataKey="count"
          nameKey="hour"
          label="Hourly Volume (24h)"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
            Raya Feedback (30d)
          </p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-white/[0.03] p-3">
              <p className="text-xs text-white/35">Total</p>
              <p className="mt-1 text-xl font-semibold text-white">{feedback.total}</p>
            </div>
            <div className="rounded-xl bg-emerald-500/[0.08] p-3">
              <p className="text-xs text-emerald-300/70">Helpful</p>
              <p className="mt-1 text-xl font-semibold text-emerald-300">{feedback.helpful}</p>
            </div>
            <div className="rounded-xl bg-rose-500/[0.08] p-3">
              <p className="text-xs text-rose-300/70">Unhelpful</p>
              <p className="mt-1 text-xl font-semibold text-rose-300">{feedback.unhelpful}</p>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            {feedback.byMode.length ? feedback.byMode.map((row) => (
              <div key={row.mode} className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2 text-xs">
                <span className="text-white/60">{row.mode}</span>
                <span className="text-white/35">
                  {row.helpful} up · {row.unhelpful} down
                </span>
              </div>
            )) : (
              <p className="py-4 text-center text-xs text-white/20">No feedback yet</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
            Recent Raya Ratings
          </p>
          {feedback.recent.length === 0 ? (
            <p className="py-6 text-center text-xs text-white/20">No ratings yet</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="pb-2 text-left font-medium text-white/35">Rating</th>
                    <th className="pb-2 text-left font-medium text-white/35">Mode</th>
                    <th className="pb-2 text-left font-medium text-white/35">Path</th>
                    <th className="pb-2 text-left font-medium text-white/35">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {feedback.recent.map((row) => (
                    <tr key={String(row.id)} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 pr-4">
                        <span className={`rounded-md px-1.5 py-0.5 ${row.value === "up" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                          {row.value === "up" ? "Helpful" : "Unhelpful"}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-white/50">{row.mode}</td>
                      <td className="py-2.5 pr-4 text-white/35">{row.path ?? "—"}</td>
                      <td className="py-2.5 text-white/35">
                        {new Date(row.created_at).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Model breakdown table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
          Model Breakdown
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="pb-2 text-left font-medium text-white/35">Model</th>
                <th className="pb-2 text-right font-medium text-white/35">Calls</th>
                <th className="pb-2 text-right font-medium text-white/35">Tokens In</th>
                <th className="pb-2 text-right font-medium text-white/35">Tokens Out</th>
                <th className="pb-2 text-right font-medium text-white/35">Cost (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {stats.byModel.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-white/20">
                    No data
                  </td>
                </tr>
              ) : (
                stats.byModel.map((row) => (
                  <tr key={row.model} className="transition-colors hover:bg-white/[0.02]">
                    <td className="py-2.5 pr-4 font-mono text-white/70">{row.model}</td>
                    <td className="py-2.5 text-right tabular-nums text-white/60">
                      {row.count.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-white/60">
                      {row.tokens_in.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-white/60">
                      {row.tokens_out.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right tabular-nums text-emerald-400">
                      ${row.cost_usd.toFixed(4)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent errors table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
          Recent Errors
        </p>
        {stats.recentErrors.length === 0 ? (
          <p className="py-6 text-center text-xs text-white/20">No errors in the last 7 days</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="pb-2 text-left font-medium text-white/35">Time</th>
                  <th className="pb-2 text-left font-medium text-white/35">Model</th>
                  <th className="pb-2 text-left font-medium text-white/35">Error Kind</th>
                  <th className="pb-2 text-left font-medium text-white/35">Message</th>
                  <th className="pb-2 text-left font-medium text-white/35">Conv ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {stats.recentErrors.map((err) => {
                  const msg = err.error_message ?? "—";
                  const truncatedMsg = msg.length > 80 ? msg.slice(0, 80) + "…" : msg;
                  const convIdSuffix = err.conversation_id
                    ? err.conversation_id.slice(-8)
                    : "—";
                  const time = new Date(err.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <tr key={err.id} className="transition-colors hover:bg-white/[0.02]">
                      <td className="py-2.5 pr-4 tabular-nums text-white/40 whitespace-nowrap">
                        {time}
                      </td>
                      <td className="py-2.5 pr-4 font-mono text-white/60">
                        {err.model ?? "—"}
                      </td>
                      <td className="py-2.5 pr-4">
                        <span className="rounded-md bg-red-500/10 px-1.5 py-0.5 text-red-400">
                          {err.error_kind ?? "unknown"}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 max-w-xs text-white/50" title={err.error_message ?? undefined}>
                        {truncatedMsg}
                      </td>
                      <td className="py-2.5 font-mono text-white/30">
                        {convIdSuffix}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
