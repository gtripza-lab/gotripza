import type { Metadata } from "next";
import Link from "next/link";
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
  title: "مركز تحكم الذكاء الاصطناعي",
};

export const dynamic = "force-dynamic";

export default async function AiControlCenterPage() {
  const stats = await getAiStats();
  const agentWorkflows = getAgentWorkflowStatuses();

  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-sm text-white/30">تعذر تحميل بيانات الذكاء الاصطناعي. راجع سجلات الخادم.</p>
      </div>
    );
  }

  const totalCost = stats.byModel.reduce((sum, m) => sum + m.cost_usd, 0);
  const errorCount = stats.byStatus.find((s) => s.status === "error")?.count ?? 0;
  const feedback = stats.feedback;
  const errorAlertLimit = Number(process.env.RAYA_ERROR_ALERT_LIMIT_7D ?? "5");
  const weeklyCostAlertLimit = Number(process.env.OPENAI_WEEKLY_COST_ALERT_USD ?? "20");
  const feedbackAlertLimit = Number(process.env.RAYA_UNHELPFUL_ALERT_LIMIT_30D ?? "5");
  const hasErrorAlert = errorCount >= errorAlertLimit;
  const hasCostAlert = totalCost >= weeklyCostAlertLimit;
  const hasFeedbackAlert = feedback.unhelpful >= feedbackAlertLimit || (feedback.total >= 5 && feedback.helpfulRate < 0.65);

  return (
    <div className="space-y-8 p-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-xl font-semibold text-white">مركز تحكم الذكاء الاصطناعي</h1>
        <p className="mt-1 text-xs text-white/35">آخر 7 أيام · جميع النماذج · جميع أنماط ريا</p>
      </div>

      <AgentWorkflowPanel workflows={agentWorkflows} />

      {hasErrorAlert && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/[0.08] px-4 py-3 text-sm text-rose-300">
          تنبيه أخطاء ريا: يوجد {errorCount.toLocaleString("ar-SA")} أخطاء خلال 7 أيام. راجع “المحادثات الفاشلة” في أسفل الصفحة.
        </div>
      )}

      {hasCostAlert && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/[0.08] px-4 py-3 text-sm text-amber-300">
          تنبيه تكلفة OpenAI: تكلفة آخر 7 أيام وصلت إلى ${totalCost.toFixed(2)} والحد الحالي ${weeklyCostAlertLimit.toFixed(2)}.
        </div>
      )}

      {hasFeedbackAlert && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/[0.08] px-4 py-3 text-sm text-amber-300">
          تنبيه جودة ريا: يوجد {feedback.unhelpful.toLocaleString("ar-SA")} تقييم غير مفيد خلال 30 يوم. راجع قائمة “الردود التي تحتاج تحسين”.
        </div>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MetricCard
          label="عمليات الذكاء 7 أيام"
          value={stats.totalTraces.toLocaleString()}
          icon={Activity}
          color="blue"
        />
        <MetricCard
          label="متوسط الاستجابة"
          value={`${stats.avgLatency.toLocaleString()} ms`}
          icon={Clock}
          color="default"
        />
        <MetricCard
          label="زمن P95"
          value={`${stats.p95Latency.toLocaleString()} ms`}
          icon={Cpu}
          color={stats.p95Latency > 5000 ? "red" : stats.p95Latency > 2000 ? "yellow" : "default"}
        />
        <MetricCard
          label="إجمالي التكلفة"
          value={`$${totalCost.toFixed(4)}`}
          icon={DollarSign}
          color="green"
        />
        <MetricCard
          label="أخطاء 7 أيام"
          value={errorCount.toLocaleString()}
          icon={AlertTriangle}
          color={errorCount > 0 ? "red" : "default"}
        />
        <MetricCard
          label="رضا المستخدم عن ريا"
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
          label="توزيع أنماط ريا"
        />
        <BarChartCard
          data={stats.hourlyVolume as unknown as Record<string, unknown>[]}
          dataKey="count"
          nameKey="hour"
          label="حجم الطلبات خلال 24 ساعة"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
            تقييمات ريا آخر 30 يوم
          </p>
          <div className="mt-5 grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-white/[0.03] p-3">
              <p className="text-xs text-white/35">الإجمالي</p>
              <p className="mt-1 text-xl font-semibold text-white">{feedback.total}</p>
            </div>
            <div className="rounded-xl bg-emerald-500/[0.08] p-3">
              <p className="text-xs text-emerald-300/70">مفيد</p>
              <p className="mt-1 text-xl font-semibold text-emerald-300">{feedback.helpful}</p>
            </div>
            <div className="rounded-xl bg-rose-500/[0.08] p-3">
              <p className="text-xs text-rose-300/70">غير مفيد</p>
              <p className="mt-1 text-xl font-semibold text-rose-300">{feedback.unhelpful}</p>
            </div>
          </div>
          <div className="mt-5 space-y-2">
            {feedback.byMode.length ? feedback.byMode.map((row) => (
              <div key={row.mode} className="flex items-center justify-between rounded-xl bg-black/20 px-3 py-2 text-xs">
                <span className="text-white/60">{row.mode}</span>
                <span className="text-white/35">
                  {row.helpful} مفيد · {row.unhelpful} غير مفيد
                </span>
              </div>
            )) : (
              <p className="py-4 text-center text-xs text-white/20">لا توجد تقييمات بعد</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
            آخر تقييمات ريا
          </p>
          {feedback.recent.length === 0 ? (
            <p className="py-6 text-center text-xs text-white/20">لا توجد تقييمات بعد</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="pb-2 text-right font-medium text-white/35">التقييم</th>
                    <th className="pb-2 text-right font-medium text-white/35">النمط</th>
                    <th className="pb-2 text-right font-medium text-white/35">الوجهة</th>
                    <th className="pb-2 text-right font-medium text-white/35">مقتطف الرد</th>
                    <th className="pb-2 text-right font-medium text-white/35">المسار</th>
                    <th className="pb-2 text-right font-medium text-white/35">الوقت</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {feedback.recent.map((row) => (
                    <tr key={String(row.id)} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 pr-4">
                        <span className={`rounded-md px-1.5 py-0.5 ${row.value === "up" ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                          {row.value === "up" ? "مفيد" : "غير مفيد"}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 text-white/50">{row.mode}</td>
                      <td className="py-2.5 pr-4 text-white/40">{row.destination ?? "—"}</td>
                      <td className="max-w-xs py-2.5 pr-4 text-white/45" title={row.messageExcerpt ?? undefined}>
                        {row.messageExcerpt
                          ? row.messageExcerpt.length > 90
                            ? `${row.messageExcerpt.slice(0, 90)}…`
                            : row.messageExcerpt
                          : "—"}
                      </td>
                      <td className="py-2.5 pr-4 text-white/35">{row.path ?? "—"}</td>
                      <td className="py-2.5 text-white/35">
                        {new Date(row.created_at).toLocaleString("ar-SA", {
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

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
          الردود التي تحتاج تحسين
        </p>
        {feedback.topUnhelpful.length === 0 ? (
          <p className="py-6 text-center text-xs text-white/20">لا توجد ردود ضعيفة كافية للتحليل بعد</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            {feedback.topUnhelpful.map((row) => (
              <div key={`${row.mode}-${row.excerpt}`} className="rounded-xl border border-white/[0.06] bg-black/20 p-4">
                <div className="mb-2 flex items-center justify-between gap-3 text-[11px] text-white/35">
                  <span>{row.mode}</span>
                  <span>{row.count.toLocaleString("ar-SA")} مرة</span>
                </div>
                <p className="text-sm leading-6 text-white/62">{row.excerpt}</p>
                <p className="mt-2 text-xs text-white/28">الوجهة: {row.destination ?? "غير محددة"}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Model breakdown table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
          تفصيل النماذج
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="pb-2 text-right font-medium text-white/35">النموذج</th>
                <th className="pb-2 text-right font-medium text-white/35">الطلبات</th>
                <th className="pb-2 text-right font-medium text-white/35">رموز داخلة</th>
                <th className="pb-2 text-right font-medium text-white/35">رموز خارجة</th>
                <th className="pb-2 text-right font-medium text-white/35">التكلفة بالدولار</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {stats.byModel.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-white/20">
                    لا توجد بيانات
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
          المحادثات الفاشلة التي تحتاج مراجعة
        </p>
        {stats.recentErrors.length === 0 ? (
          <p className="py-6 text-center text-xs text-white/20">لا توجد محادثات فاشلة خلال آخر 7 أيام</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="pb-2 text-right font-medium text-white/35">الوقت</th>
                  <th className="pb-2 text-right font-medium text-white/35">النموذج</th>
                  <th className="pb-2 text-right font-medium text-white/35">نوع الخطأ</th>
                  <th className="pb-2 text-right font-medium text-white/35">الرسالة</th>
                  <th className="pb-2 text-right font-medium text-white/35">المحادثة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {stats.recentErrors.map((err) => {
                  const msg = err.error_message ?? "—";
                  const truncatedMsg = msg.length > 80 ? msg.slice(0, 80) + "…" : msg;
                  const convIdSuffix = err.conversation_id
                    ? err.conversation_id.slice(-8)
                    : "—";
                  const time = new Date(err.created_at).toLocaleString("ar-SA", {
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
                        {err.conversation_id ? (
                          <Link href={`/admin/conversations/${err.conversation_id}`} className="text-brand-mint hover:text-white">
                            {convIdSuffix}
                          </Link>
                        ) : convIdSuffix}
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
