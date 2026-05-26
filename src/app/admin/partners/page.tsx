import { BadgeDollarSign, BarChart3, Handshake, MousePointerClick, ShieldAlert, Trophy, UserCheck, Users } from "lucide-react";
import { AdminPartnersClient } from "@/components/admin/AdminPartnersClient";
import { MetricCard } from "@/components/admin/MetricCard";
import { getAdminPartnerOverview } from "@/lib/partner-program";

export const dynamic = "force-dynamic";
export const metadata = { title: "شركاء ريا" };

export default async function AdminPartnersPage() {
  const overview = await getAdminPartnerOverview();
  const stats = overview.stats;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">شركاء ريا</h1>
        <p className="mt-1 text-sm text-white/40">
          نظام إدارة الشركاء، روابط الإحالة، العمولات، ومؤشرات النمو لصناع المحتوى.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="إجمالي الشركاء" value={stats.totalPartners.toLocaleString()} icon={Handshake} color="blue" />
        <MetricCard label="شركاء فعالون" value={stats.activePartners.toLocaleString()} icon={UserCheck} color="green" />
        <MetricCard label="طلبات معلقة" value={stats.pendingPartners.toLocaleString()} icon={Users} color="yellow" />
        <MetricCard label="تنبيهات احتيال" value={stats.fraudFlags.toLocaleString()} icon={ShieldAlert} color={stats.fraudFlags ? "red" : "green"} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="النقرات" value={stats.totalClicks.toLocaleString()} icon={MousePointerClick} />
        <MetricCard label="التحويلات" value={stats.totalConversions.toLocaleString()} icon={BarChart3} color="blue" />
        <MetricCard label="الإيراد" value={`$${stats.totalRevenueUsd.toFixed(2)}`} icon={Trophy} color="green" />
        <MetricCard label="العمولات" value={`$${stats.totalCommissionsUsd.toFixed(2)}`} icon={BadgeDollarSign} color="yellow" />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/30">أفضل منصة</p>
          <p className="mt-2 text-2xl font-bold text-white">{stats.bestPlatform}</p>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <p className="text-[11px] uppercase tracking-[0.2em] text-white/30">أفضل دولة</p>
          <p className="mt-2 text-2xl font-bold text-white">{stats.bestCountry}</p>
        </div>
      </div>

      <AdminPartnersClient overview={overview} />
    </div>
  );
}
