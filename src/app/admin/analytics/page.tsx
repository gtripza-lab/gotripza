import { getAnalyticsStats } from "@/lib/admin/data";
import { AdminAutoRefresh } from "@/components/admin/AdminAutoRefresh";

export const metadata = { title: "Analytics" };

const fmt = new Intl.NumberFormat("en-US");
const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 2 });
const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-white/35">{sub}</p>}
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/50 mb-4">{title}</h2>
  );
}

export default async function AnalyticsPage() {
  const stats = await getAnalyticsStats();

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#08080d] flex items-center justify-center">
        <div className="text-center rounded-2xl bg-white/[0.03] border border-white/[0.06] p-10">
          <p className="text-red-400 text-lg font-semibold mb-2">Failed to load analytics</p>
          <p className="text-white/40 text-sm">Could not retrieve data. Please try again later.</p>
        </div>
      </div>
    );
  }

  const funnelSteps = [
    { label: "Conversations", value: stats.conversationsTotal, color: "bg-blue-500" },
    { label: "AI Searches", value: stats.searchesTotal, color: "bg-purple-500" },
    { label: "Affiliate Clicks", value: stats.clicksTotal, color: "bg-emerald-500" },
  ];
  const funnelMax = Math.max(...funnelSteps.map((s) => s.value), 1);

  return (
    <div className="min-h-screen bg-[#08080d] px-6 py-8 space-y-8">
      <AdminAutoRefresh intervalMs={60_000} />

      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-white/40 text-sm mt-1">Last 30 days · auto-refreshes every 60s</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Conversations" value={fmt.format(stats.conversationsTotal)} sub="Last 30 days" />
        <StatCard label="Affiliate Clicks" value={fmt.format(stats.clicksTotal)} sub="Flights + Hotels" />
        <StatCard label="Conversion Rate" value={pct(stats.conversionRate)} sub="Clicks ÷ Conversations" />
        <StatCard label="Est. Revenue" value={usd.format(stats.estRevTotal)} sub="30-day affiliate est." />
      </div>

      {/* Conversion Funnel */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
        <SectionHeader title="Conversion Funnel" />
        <div className="space-y-3">
          {funnelSteps.map((step) => (
            <div key={step.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-white/70">{step.label}</span>
                <span className="text-sm font-semibold text-white tabular-nums">{fmt.format(step.value)}</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full rounded-full ${step.color}`}
                  style={{ width: `${Math.round((step.value / funnelMax) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Revenue Split + Weekly Trend */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Revenue breakdown */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
          <SectionHeader title="Revenue by Channel" />
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-blue-500 inline-block" />
                <span className="text-sm text-white/70">Flights</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{usd.format(stats.estRevFlights)}</p>
                <p className="text-[11px] text-white/40">{fmt.format(stats.flightClicks)} clicks</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-500 inline-block" />
                <span className="text-sm text-white/70">Hotels</span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-white">{usd.format(stats.estRevHotels)}</p>
                <p className="text-[11px] text-white/40">{fmt.format(stats.hotelClicks)} clicks</p>
              </div>
            </div>
            <div className="border-t border-white/[0.06] pt-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-white/60">Total Est.</span>
              <span className="text-sm font-bold text-white">{usd.format(stats.estRevTotal)}</span>
            </div>
          </div>
        </div>

        {/* Weekly trend */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
          <SectionHeader title="Weekly Trend (8 weeks)" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-2 text-white/40 font-medium">Week of</th>
                  <th className="text-right py-2 text-white/40 font-medium">Convs</th>
                  <th className="text-right py-2 text-white/40 font-medium">Clicks</th>
                </tr>
              </thead>
              <tbody>
                {stats.weeklyConversations.map((w) => (
                  <tr key={w.week} className="border-b border-white/[0.03]">
                    <td className="py-1.5 text-white/60">{w.week}</td>
                    <td className="py-1.5 text-right text-white/70 tabular-nums">{fmt.format(w.conversations)}</td>
                    <td className="py-1.5 text-right text-white/70 tabular-nums">{fmt.format(w.clicks)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Top Destinations */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6">
        <SectionHeader title="Top Destinations (affiliate clicks, last 30d)" />
        {stats.topDestinations.length === 0 ? (
          <p className="text-white/40 text-sm">No click data yet — will populate once users start booking.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left py-2 pr-4 text-white/40 font-medium w-6">#</th>
                  <th className="text-left py-2 px-4 text-white/40 font-medium">Destination</th>
                  <th className="text-right py-2 px-4 text-white/40 font-medium">Clicks</th>
                  <th className="text-right py-2 text-white/40 font-medium">Est. Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats.topDestinations.map((d, i) => (
                  <tr key={d.destination} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="py-2 pr-4 text-white/30 tabular-nums">{i + 1}</td>
                    <td className="py-2 px-4 text-white/80 font-medium">{d.destination}</td>
                    <td className="py-2 px-4 text-right text-white/60 tabular-nums">{fmt.format(d.clicks)}</td>
                    <td className="py-2 text-right text-emerald-400 tabular-nums font-mono text-xs">
                      {usd.format(d.rev_est)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* External tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Google Analytics 4</p>
            <p className="text-xs text-white/40 mt-0.5">Session data, page views, device breakdown</p>
          </div>
          <a
            href="https://analytics.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Open GA4
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-6 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-white">Google Search Console</p>
            <p className="text-xs text-white/40 mt-0.5">Search impressions, CTR, Core Web Vitals</p>
          </div>
          <a
            href="https://search.google.com/search-console"
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            Open GSC
            <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
