"use client";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type DailyStat    = { date: string; clicks: number };
type ProviderStat = { provider: string; clicks: number; revenue_est: number };

const BRAND = "#7c3aed";
const MUTED = "rgba(255,255,255,0.06)";

function TooltipStyle({ active, payload, label }: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-[#0d0d12] px-3 py-2 text-xs text-white/80">
      <p className="mb-0.5 text-white/40">{label}</p>
      <p className="font-semibold">{payload[0].value}</p>
    </div>
  );
}

export function AdminCharts({
  daily,
  byProvider,
  isAr,
}: {
  daily: DailyStat[];
  byProvider: ProviderStat[];
  isAr: boolean;
}) {
  const dailyShort = daily.map((d) => ({ ...d, date: d.date.slice(5) }));

  return (
    <div className="mt-8 grid gap-6 lg:grid-cols-2">
      {/* Daily clicks chart */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <p className="mb-4 text-sm font-semibold text-white/70">
          {isAr ? "النقرات اليومية (١٤ يوم)" : "Daily clicks (14 days)"}
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={dailyShort} barSize={14}>
            <CartesianGrid vertical={false} stroke={MUTED} />
            <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} width={30} />
            <Tooltip content={<TooltipStyle />} cursor={{ fill: MUTED }} />
            <Bar dataKey="clicks" fill={BRAND} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Top providers chart */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
        <p className="mb-4 text-sm font-semibold text-white/70">
          {isAr ? "أفضل مزودين" : "Top providers"}
        </p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byProvider} layout="vertical" barSize={12}>
            <CartesianGrid horizontal={false} stroke={MUTED} />
            <XAxis type="number" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis dataKey="provider" type="category" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} axisLine={false} tickLine={false} width={90} />
            <Tooltip content={<TooltipStyle />} cursor={{ fill: MUTED }} />
            <Bar dataKey="clicks" fill={BRAND} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Revenue estimate table */}
      <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 lg:col-span-2">
        <p className="mb-4 text-sm font-semibold text-white/70">
          {isAr ? "تقدير العمولات لكل مزود" : "Estimated commission per provider"}
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-wide text-white/30">
                <th className="pb-3 pr-6">{isAr ? "المزود" : "Provider"}</th>
                <th className="pb-3 pr-6">{isAr ? "النقرات" : "Clicks"}</th>
                <th className="pb-3">{isAr ? "عمولة مقدّرة (USD)" : "Est. commission (USD)"}</th>
              </tr>
            </thead>
            <tbody>
              {byProvider.map((p) => (
                <tr key={p.provider} className="border-b border-white/[0.03]">
                  <td className="py-2.5 pr-6 font-mono text-white/80">{p.provider}</td>
                  <td className="py-2.5 pr-6 text-white/60">{p.clicks}</td>
                  <td className="py-2.5 text-brand-primary font-semibold">${p.revenue_est.toFixed(2)}</td>
                </tr>
              ))}
              {byProvider.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-6 text-center text-white/30">
                    {isAr ? "لا توجد نقرات بعد" : "No clicks yet"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
