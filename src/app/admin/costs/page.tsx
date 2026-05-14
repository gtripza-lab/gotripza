import { getCostStats } from "@/lib/admin/data";
import { MetricCard } from "@/components/admin/MetricCard";
import dynamic from "next/dynamic";

const AreaChartCard = dynamic(
  () => import("@/components/admin/AdminCharts").then((m) => ({ default: m.AreaChartCard })),
  {},
);

export const metadata = { title: "مركز التكلفة" };

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
  const dailyAlertLimit = Number(process.env.OPENAI_DAILY_COST_ALERT_USD ?? "5");

  const totalCostUsd = stats?.totalCostUsd ?? 0;
  const costToday = stats?.costToday ?? 0;
  const costThisWeek = stats?.costThisWeek ?? 0;
  const avgCostPerConv = stats?.avgCostPerConv ?? 0;
  const byModel = stats?.byModel ?? [];
  const daily = stats?.daily ?? [];
  const overDailyLimit = costToday >= dailyAlertLimit;

  return (
    <div className="space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-white">مركز مراقبة التكلفة</h1>
        <p className="text-sm text-white/40 mt-1">
          متابعة تكلفة OpenAI حسب النموذج والفترة، مع تنبيه يومي عند تجاوز الحد.
        </p>
      </div>

      <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-400">
        <span className="mt-0.5 shrink-0" aria-hidden="true">⚠</span>
        <p>
          التقديرات مبنية على أسعار OpenAI المعلنة وقد تختلف الفاتورة الفعلية قليلاً. حد التنبيه اليومي الحالي:
          {" "}<span className="font-mono text-amber-200">${dailyAlertLimit.toFixed(2)}</span>.
        </p>
      </div>

      {overDailyLimit && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/[0.08] px-4 py-3 text-sm text-rose-300">
          تنبيه تكلفة: تكلفة آخر 24 ساعة وصلت إلى {fmt4(costToday)} وتجاوزت الحد المحدد. راجع نماذج ريا وعدد المحادثات فوراً.
        </div>
      )}

      {!overDailyLimit && (
        <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3 text-sm text-emerald-300">
          التكلفة اليومية ضمن الحد الحالي: {fmt4(costToday)} من {fmt2(dailyAlertLimit)}.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="تكلفة اليوم" value={fmt4(costToday)} />
        <MetricCard label="هذا الأسبوع" value={fmt2(costThisWeek)} />
        <MetricCard label="آخر 30 يوم" value={fmt2(totalCostUsd)} />
        <MetricCard label="متوسط المحادثة" value={fmt4(avgCostPerConv)} />
      </div>

      {daily.length > 0 && (
        <AreaChartCard
          label="التكلفة اليومية آخر 30 يوم"
          data={daily as unknown as Record<string, unknown>[]}
          dataKey="cost_usd"
          prefix="$"
        />
      )}

      {/* Model breakdown table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
        <div className="border-b border-white/[0.06] px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/60">تفصيل النماذج</h2>
        </div>
        {byModel.length === 0 ? (
          <p className="px-6 py-8 text-sm text-white/30">لا توجد بيانات نماذج حتى الآن.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">
                  <th className="px-6 py-3 text-right">النموذج</th>
                  <th className="px-6 py-3 text-right">الطلبات</th>
                  <th className="px-6 py-3 text-right">رموز داخلة</th>
                  <th className="px-6 py-3 text-right">رموز خارجة</th>
                  <th className="px-6 py-3 text-right">التكلفة</th>
                  <th className="px-6 py-3 text-right">% من الإجمالي</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {byModel.map((row) => {
                  const pct =
                    totalCostUsd > 0
                      ? ((row.cost_usd / totalCostUsd) * 100).toFixed(1)
                      : "0.0";
                  return (
                    <tr key={row.model} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-3 font-mono text-xs text-white/70">{row.model}</td>
                      <td className="px-6 py-3 text-right tabular-nums text-white/60">
                        {fmtComma(row.calls)}
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums text-white/60">
                        {fmtComma(row.tokens_in)}
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums text-white/60">
                        {fmtComma(row.tokens_out)}
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums font-medium text-emerald-400">
                        {fmt4(row.cost_usd)}
                      </td>
                      <td className="px-6 py-3 text-right tabular-nums text-white/40">
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
