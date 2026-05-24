import dynamic from "next/dynamic";
import {
  getCostStats,
  getDashboardStats,
  getRiaFeedbackStats,
  getRyaOperationalInsights,
  getSupportRequests,
  getTripPlanAdminStats,
} from "@/lib/admin/data";
import { MetricCard } from "@/components/admin/MetricCard";
import { AdminAutoRefresh } from "@/components/admin/AdminAutoRefresh";
import { labelTripLifecycle } from "@/lib/ai/trip-lifecycle";

const AreaChartCard = dynamic(
  () => import("@/components/admin/AdminCharts").then((m) => ({ default: m.AreaChartCard })),
  {},
);

export const metadata = { title: "لوحة التشغيل" };

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
  const [stats, support, trips, costs, feedback, insights] = await Promise.all([
    getDashboardStats(),
    getSupportRequests(),
    getTripPlanAdminStats(),
    getCostStats(),
    getRiaFeedbackStats(),
    getRyaOperationalInsights(),
  ]);

  if (!stats) {
    return (
      <div className="min-h-screen bg-[#08080d] flex items-center justify-center">
        <div className="text-center rounded-2xl bg-white/[0.03] border border-white/[0.06] p-10">
          <p className="text-red-400 text-lg font-semibold mb-2">تعذر تحميل لوحة التشغيل</p>
          <p className="text-white/40 text-sm">لم نتمكن من جلب الإحصائيات. حاول لاحقاً.</p>
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
  const openSupport = support.rows.filter((row) => row.status === "open" || row.status == null).length;
  const helpfulRate = `${Math.round(feedback.helpfulRate * 100)}%`;

  return (
    <div className="min-h-screen bg-[#08080d] px-6 py-8 space-y-8">
      {/* Auto-refresh every 60s without a page reload */}
      <AdminAutoRefresh intervalMs={60_000} />

      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-semibold tracking-tight">لوحة تشغيل GoTripza</h1>
        <p className="text-white/40 text-sm mt-1">مؤشرات التشغيل والنشاط · تحديث تلقائي كل 60 ثانية</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          label="محادثات 24 ساعة"
          value={stats.conversations24h.toLocaleString()}
        />
        <MetricCard
          label="محادثات 7 أيام"
          value={stats.conversationsWeek.toLocaleString()}
        />
        <MetricCard
          label="سجلات الذكاء"
          value={stats.aiTracesTotal.toLocaleString()}
        />
        <MetricCard
          label="نقرات 24 ساعة"
          value={stats.searchClicks24h.toLocaleString()}
        />
        <MetricCard
          label="إيراد تقديري 7 أيام"
          value={estRevFormatted}
        />
        <MetricCard
          label="متوسط السرعة"
          value={`${stats.avgLatencyMs.toLocaleString()} ms`}
          sub={`${errorRatePct}% معدل أخطاء`}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="طلبات دعم مفتوحة" value={openSupport.toLocaleString()} color={openSupport ? "yellow" : "green"} />
        <MetricCard label="خطط محفوظة" value={trips.total.toLocaleString()} color="blue" />
        <MetricCard label="رضا ريا" value={feedback.total ? helpfulRate : "—"} sub={`${feedback.total.toLocaleString()} تقييم`} color={feedback.unhelpful > feedback.helpful ? "yellow" : "green"} />
        <MetricCard label="تكلفة اليوم" value={costs ? `$${costs.costToday.toFixed(3)}` : "—"} color="default" />
      </div>

      <div className="grid gap-4 xl:grid-cols-4">
        <InsightCard
          title="أكثر الوجهات طلباً"
          empty="لا توجد وجهات كافية بعد."
          rows={insights.topDestinations.map((item) => ({ label: item.destination, value: item.count }))}
        />
        <InsightCard
          title="الخدمات المطلوبة"
          empty="لا توجد خدمات مسجلة بعد."
          rows={insights.topServices.map((item) => ({ label: serviceLabelAr(item.service), value: item.count }))}
        />
        <InsightCard
          title="تحويلات Rya Companion"
          empty="لا توجد أحداث تثبيت أو تسجيل بعد."
          rows={[
            { label: "تسجيل دخول", value: insights.signInFunnel.logins },
            { label: "تفعيل التجربة", value: insights.signInFunnel.companionTrials },
            { label: "تثبيت على الجوال", value: insights.signInFunnel.installs },
            { label: "فتح كتطبيق", value: insights.signInFunnel.standaloneOpens },
          ]}
        />
        <InsightCard
          title="إشارات ضعف ريا"
          empty="لا توجد إشارات ضعف واضحة."
          rows={[
            { label: "ردود تحتاج تحسين", value: feedback.unhelpful },
            { label: "ملخصات فاشلة/غامضة", value: insights.unansweredSignals },
            ...insights.weakResponses.slice(0, 2).map((item) => ({ label: item.excerpt, value: item.count })),
          ]}
        />
      </div>

      {/* Area Chart */}
      <AreaChartCard
        label="المحادثات اليومية (14 يوم)"
        data={stats.dailyConversations as unknown as Record<string, unknown>[]}
        dataKey="count"
      />

      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-white text-base font-medium">مراحل رحلات ريا</h2>
            <p className="mt-1 text-xs text-white/35">أين يقف المستخدمون الآن: تخطيط، حجز، قبل السفر، أثناء الرحلة، أو بعدها.</p>
          </div>
        </div>
        {stats.tripLifecycle.length === 0 ? (
          <p className="mt-5 text-sm text-white/35">لا توجد مراحل مسجلة بعد.</p>
        ) : (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.tripLifecycle.slice(0, 8).map((item) => (
              <div key={item.stage} className="rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3">
                <p className="text-xs text-white/38">{labelTripLifecycle(item.stage, "ar")}</p>
                <p className="mt-1 text-2xl font-semibold text-white/85">{item.count.toLocaleString("ar-SA")}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent AI Traces Table */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-white text-base font-medium">آخر سجلات ريا</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-right px-6 py-3 text-white/40 font-medium">الوقت</th>
                <th className="text-right px-6 py-3 text-white/40 font-medium">الوضع</th>
                <th className="text-right px-6 py-3 text-white/40 font-medium">الحالة</th>
                <th className="text-right px-6 py-3 text-white/40 font-medium">النموذج</th>
                <th className="text-left px-6 py-3 text-white/40 font-medium">السرعة</th>
                <th className="text-left px-6 py-3 text-white/40 font-medium">Tokens داخل / خارج</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentTraces.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-white/40">
                    لا توجد سجلات بعد.
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

function InsightCard({
  title,
  rows,
  empty,
}: {
  title: string;
  rows: { label: string; value: number }[];
  empty: string;
}) {
  const cleanRows = rows.filter((row) => row.value > 0);
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
      <h2 className="text-sm font-semibold text-white/85">{title}</h2>
      {cleanRows.length === 0 ? (
        <p className="mt-4 text-xs text-white/35">{empty}</p>
      ) : (
        <div className="mt-4 space-y-3">
          {cleanRows.slice(0, 6).map((row) => (
            <div key={row.label} className="flex items-center justify-between gap-3">
              <span className="line-clamp-1 text-xs text-white/48">{row.label}</span>
              <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-xs font-semibold text-white/70">
                {row.value.toLocaleString("ar-SA")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function serviceLabelAr(service: string) {
  const labels: Record<string, string> = {
    insurance: "التأمين",
    esim: "الشريحة eSIM",
    activities: "الجولات والأنشطة",
    cars: "تأجير السيارات",
    trains: "القطارات",
    compensation: "تعويض التأخير",
    airport_help: "مساعدة المطار",
    translation: "الترجمة",
    emergency: "الطوارئ",
    food: "الأكل والمطاعم",
  };
  return labels[service] ?? service;
}
