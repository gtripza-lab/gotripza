import { CalendarDays, MapPin, Users, WalletCards } from "lucide-react";
import { getTripPlanAdminStats } from "@/lib/admin/data";
import { MetricCard } from "@/components/admin/MetricCard";

export const metadata = { title: "خطط الرحلات" };

function fmtDate(date: string) {
  return new Date(date).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function AdminTripsPage() {
  const stats = await getTripPlanAdminStats();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">خطط الرحلات المحفوظة</h1>
        <p className="mt-1 text-sm text-white/40">
          الخطط التي يحفظها المستخدمون من محرك خطط الرحلات وتجربة ريا.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="إجمالي الخطط" value={stats.total.toLocaleString()} icon={CalendarDays} color="blue" />
        <MetricCard label="خطط هذا الأسبوع" value={stats.createdWeek.toLocaleString()} icon={MapPin} color="green" />
        <MetricCard label="متوسط الأيام" value={stats.avgDays.toLocaleString()} icon={CalendarDays} color="default" />
        <MetricCard label="متوسط الميزانية" value={stats.avgBudget ? stats.avgBudget.toLocaleString() : "—"} icon={WalletCards} color="yellow" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/60">أكثر الوجهات حفظاً</h2>
          <div className="mt-4 space-y-2">
            {stats.topDestinations.length ? stats.topDestinations.map((item) => (
              <div key={item.destination} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2">
                <span className="font-mono text-sm text-white/65">{item.destination}</span>
                <span className="text-xs text-white/35">{item.count}</span>
              </div>
            )) : <p className="text-sm text-white/30">لا توجد وجهات محفوظة بعد</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/60">أنواع الرحلات</h2>
          <div className="mt-4 space-y-2">
            {stats.tripTypes.length ? stats.tripTypes.map((item) => (
              <div key={item.type} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2">
                <span className="text-sm capitalize text-white/65">{item.type.replace("_", " ")}</span>
                <span className="text-xs text-white/35">{item.count}</span>
              </div>
            )) : <p className="text-sm text-white/30">لا توجد بيانات لأنواع الرحلات بعد</p>}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03]">
        <div className="border-b border-white/[0.06] px-6 py-4">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/60">آخر الخطط</h2>
        </div>
        {stats.recent.length === 0 ? (
          <p className="px-6 py-8 text-sm text-white/30">لا توجد خطط محفوظة بعد.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">
                  <th className="px-6 py-3">الوجهة</th>
                  <th className="px-6 py-3">من</th>
                  <th className="px-6 py-3">التفاصيل</th>
                  <th className="px-6 py-3">المستخدم</th>
                  <th className="px-6 py-3">تاريخ الحفظ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {stats.recent.map((plan) => (
                  <tr key={plan.id} className="transition-colors hover:bg-white/[0.02]">
                    <td className="px-6 py-3.5">
                      <p className="font-medium text-white/80">{plan.title}</p>
                      <p className="text-xs text-white/30">{plan.destination}</p>
                    </td>
                    <td className="px-6 py-3.5 text-white/45">{plan.origin ?? "—"}</td>
                    <td className="px-6 py-3.5 text-white/55">
                      <span className="inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {plan.days}d</span>
                      <span className="mx-2 text-white/20">·</span>
                      <span className="inline-flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {plan.travelers}</span>
                      <span className="mx-2 text-white/20">·</span>
                      <span>{plan.budget ? `${Number(plan.budget).toLocaleString()} ${plan.currency}` : "—"}</span>
                    </td>
                    <td className="px-6 py-3.5 font-mono text-xs text-white/35">…{plan.user_id.slice(-10)}</td>
                    <td className="px-6 py-3.5 text-xs text-white/35">{fmtDate(plan.created_at)}</td>
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
