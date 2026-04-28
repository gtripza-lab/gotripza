import type { Locale } from "@/i18n/config";
import { createSupabaseService } from "@/lib/supabase/service";
import { AdminCharts } from "./AdminCharts";

type ClickRow = {
  result_type: string;
  provider: string;
  destination: string;
  price: number | null;
  currency: string | null;
  clicked_at: string;
};

type ProviderStat = { provider: string; clicks: number; revenue_est: number };
type DailyStat    = { date: string; clicks: number };

async function fetchStats() {
  let db;
  try {
    db = createSupabaseService();
  } catch {
    return null;
  }

  const now        = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart  = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [allRes, todayRes, weekRes] = await Promise.all([
    db.from("booking_clicks").select("result_type,provider,destination,price,currency,clicked_at"),
    db.from("booking_clicks").select("id", { count: "exact", head: true }).gte("clicked_at", todayStart),
    db.from("booking_clicks").select("id", { count: "exact", head: true }).gte("clicked_at", weekStart),
  ]);

  const rows: ClickRow[] = (allRes.data as ClickRow[]) ?? [];

  // Provider stats
  const providerMap = new Map<string, ProviderStat>();
  for (const r of rows) {
    const key = r.provider ?? "unknown";
    const cur = providerMap.get(key) ?? { provider: key, clicks: 0, revenue_est: 0 };
    cur.clicks++;
    // Rough commission estimate: flights ~3%, hotels ~5%
    if (r.price) {
      cur.revenue_est += r.result_type === "hotel"
        ? r.price * 0.05
        : r.price * 0.03;
    }
    providerMap.set(key, cur);
  }
  const byProvider = Array.from(providerMap.values()).sort((a, b) => b.clicks - a.clicks).slice(0, 8);

  // Daily clicks (last 14 days)
  const dailyMap = new Map<string, number>();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dailyMap.set(d.toISOString().slice(0, 10), 0);
  }
  for (const r of rows) {
    const day = r.clicked_at.slice(0, 10);
    if (dailyMap.has(day)) dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
  }
  const daily: DailyStat[] = Array.from(dailyMap.entries()).map(([date, clicks]) => ({ date, clicks }));

  // Type split
  const flights = rows.filter((r) => r.result_type === "flight").length;
  const hotels  = rows.filter((r) => r.result_type === "hotel").length;

  const totalRevEst = byProvider.reduce((s, p) => s + p.revenue_est, 0);

  return {
    totalClicks:  rows.length,
    todayClicks:  todayRes.count ?? 0,
    weekClicks:   weekRes.count ?? 0,
    flights,
    hotels,
    totalRevEst,
    byProvider,
    daily,
  };
}

export async function AdminDashboard({ locale }: { locale: Locale }) {
  const stats = await fetchStats();
  const isAr  = locale === "ar";

  if (!stats) {
    return (
      <main className="mx-auto max-w-5xl px-6 py-20 text-white/50 text-sm">
        {isAr ? "تعذّر الاتصال بقاعدة البيانات." : "Could not connect to the database."}
      </main>
    );
  }

  const kpis = [
    {
      label: isAr ? "نقرات اليوم"  : "Clicks today",
      value: stats.todayClicks,
    },
    {
      label: isAr ? "نقرات الأسبوع" : "Clicks this week",
      value: stats.weekClicks,
    },
    {
      label: isAr ? "إجمالي النقرات" : "Total clicks",
      value: stats.totalClicks,
    },
    {
      label: isAr ? "عمولات مقدّرة (USD)" : "Est. revenue (USD)",
      value: `$${stats.totalRevEst.toFixed(0)}`,
    },
  ];

  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-brand-primary/70">
        {isAr ? "لوحة التحكم" : "Analytics"}
      </p>
      <h1 className="font-display text-3xl font-bold">{isAr ? "إحصائيات الحجوزات" : "Booking Analytics"}</h1>
      <p className="mt-1 text-sm text-white/40">
        {isAr ? "بيانات حية من Supabase" : "Live data from Supabase"}
      </p>

      {/* KPI cards */}
      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
            <p className="text-[11px] text-white/40 uppercase tracking-wide">{k.label}</p>
            <p className="mt-2 font-display text-3xl font-bold text-white">{k.value}</p>
          </div>
        ))}
      </div>

      {/* Type split */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
          <p className="text-[11px] text-white/40 uppercase tracking-wide">
            {isAr ? "نقرات طيران" : "Flight clicks"}
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-white">{stats.flights}</p>
        </div>
        <div className="rounded-2xl border border-white/5 bg-white/[0.03] p-5">
          <p className="text-[11px] text-white/40 uppercase tracking-wide">
            {isAr ? "نقرات فنادق" : "Hotel clicks"}
          </p>
          <p className="mt-2 font-display text-2xl font-bold text-white">{stats.hotels}</p>
        </div>
      </div>

      {/* Charts (client component) */}
      <AdminCharts daily={stats.daily} byProvider={stats.byProvider} isAr={isAr} />
    </main>
  );
}
