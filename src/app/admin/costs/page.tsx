import { getCostStats } from "@/lib/admin/data";
import { MetricCard } from "@/components/admin/MetricCard";
import { AreaChartCard } from "@/components/admin/AdminCharts";

export const metadata = { title: "Cost Center" };

type CostStats = {
  totalCostUsd: number;
  costToday: number;
  costThisWeek: number;
  avgCostPerConv: number;
  byModel: {
    model: string;
    tokens_in: number;
    tokens_out: number;
    cost_usd: number;
    calls: number;
  }[];
  daily: { date: string; cost_usd: number; calls: number }[];
};

function fmt4(value: number): string {
  return `$${value.toFixed(4)}`;
}

function fmt2(value: number): string {
  return `$${value.toFixed(2)}`;
}

function fmtComma(value: number): string {
  return value.toLocaleString("en-US");
}

export default async function CostCenterPage() {
  const stats: CostStats | null = await getCostStats().catch(() => null);

  const totalCostUsd = stats?.totalCostUsd ?? 0;
  const costToday = stats?.costToday ?? 0;
  const costThisWeek = stats?.costThisWeek ?? 0;
  const avgCostPerConv = stats?.avgCostPerConv ?? 0;
  const byModel = stats?.byModel ?? [];
  const daily = stats?.daily ?? [];

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Cost Control Center</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Monitor AI inference spend across models and time periods.
        </p>
      </div>

      {/* Yellow info box */}
      <div className="flex items-start gap-3 rounded-lg border border-yellow-300 bg-yellow-50 px-4 py-3 text-sm text-yellow-800">
        <span className="mt-0.5 shrink-0 text-yellow-500" aria-hidden="true">
          ⚠
        </span>
        <p>
          Cost estimates are based on OpenAI list prices. Actual costs may vary.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Today's Cost" value={fmt4(costToday)} />
        <MetricCard label="This Week" value={fmt2(costThisWeek)} />
        <MetricCard label="Total 30d" value={fmt2(totalCostUsd)} />
        <MetricCard label="Avg Cost / Conv" value={fmt4(avgCostPerConv)} />
      </div>

      {/* Daily cost area chart */}
      {daily.length > 0 && (
        <AreaChartCard
          label="Daily Cost (30d)"
          data={daily as unknown as Record<string, unknown>[]}
          dataKey="cost_usd"
          prefix="$"
        />
      )}

      {/* Model breakdown table */}
      <div className="rounded-lg border bg-card shadow-sm">
        <div className="border-b px-6 py-4">
          <h2 className="text-base font-semibold">Model Breakdown</h2>
        </div>
        {byModel.length === 0 ? (
          <p className="px-6 py-8 text-sm text-muted-foreground">No model data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3">Model</th>
                  <th className="px-6 py-3 text-right">Calls</th>
                  <th className="px-6 py-3 text-right">Tokens In</th>
                  <th className="px-6 py-3 text-right">Tokens Out</th>
                  <th className="px-6 py-3 text-right">Cost</th>
                  <th className="px-6 py-3 text-right">% of Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {byModel.map((row) => {
                  const pct =
                    totalCostUsd > 0
                      ? ((row.cost_usd / totalCostUsd) * 100).toFixed(1)
                      : "0.0";
                  return (
                    <tr key={row.model} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-3 font-mono text-xs">{row.model}</td>
                      <td className="px-6 py-3 text-right tabular-nums">
                        {fmtComma(row.calls)}
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums">
                        {fmtComma(row.tokens_in)}
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums">
                        {fmtComma(row.tokens_out)}
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums font-medium">
                        {fmt4(row.cost_usd)}
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums text-muted-foreground">
                        {pct}%
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
