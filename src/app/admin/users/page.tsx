import { getUserStats } from "@/lib/admin/data";
import { MetricCard } from "@/components/admin/MetricCard";
import { Activity, Download, Mail, Smartphone, Sparkles, UserCheck, UserPlus, Users } from "lucide-react";

export const metadata = { title: "المستخدمون" };

type UserStat = {
  totalRegistered: number;
  totalAnon: number;
  newThisWeek: number;
  activeThisWeek: number;
  appInstalled: number;
  trialStarted: number;
  standaloneOpens: number;
  recentAppUsers: {
    event: string;
    user_id: string | null;
    user_name: string | null;
    user_email: string | null;
    session_id: string | null;
    created_at: string;
    locale: string | null;
  }[];
  topUsers: { user_id: string; user_name: string | null; user_email: string | null; conv_count: number; last_active: string }[];
  customers: {
    user_id: string;
    name: string | null;
    email: string | null;
    created_at: string | null;
    updated_at: string | null;
    conv_count: number;
    last_active: string | null;
  }[];
};

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

function displayName(name: string | null, email: string | null, userId: string | null) {
  if (name) return name;
  if (email) return email.split("@")[0];
  return userId ? `عميل …${userId.slice(-8)}` : "زائر غير مسجل";
}

export default async function UsersPage() {
  const stats: UserStat | null = await getUserStats();

  const totalRegistered = stats?.totalRegistered ?? 0;
  const totalAnon = stats?.totalAnon ?? 0;
  const newThisWeek = stats?.newThisWeek ?? 0;
  const activeThisWeek = stats?.activeThisWeek ?? 0;
  const appInstalled = stats?.appInstalled ?? 0;
  const trialStarted = stats?.trialStarted ?? 0;
  const standaloneOpens = stats?.standaloneOpens ?? 0;
  const recentAppUsers = stats?.recentAppUsers ?? [];
  const topUsers = stats?.topUsers ?? [];
  const customers = stats?.customers ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">المستخدمون</h1>
        <p className="mt-1 text-sm text-white/40">نظرة على نشاط المستخدمين المسجلين والجلسات المجهولة.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="المستخدمون المسجلون"
          value={totalRegistered.toLocaleString()}
          icon={Users}
          color="blue"
        />
        <MetricCard
          label="جلسات مجهولة (7 أيام)"
          value={totalAnon.toLocaleString()}
          icon={UserCheck}
          color="default"
        />
        <MetricCard
          label="مستخدمون جدد (7 أيام)"
          value={newThisWeek.toLocaleString()}
          icon={UserPlus}
          color="green"
        />
        <MetricCard
          label="نشطون (7 أيام)"
          value={activeThisWeek.toLocaleString()}
          icon={Activity}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <MetricCard
          label="حمّلوا ريا كتطبيق"
          value={appInstalled.toLocaleString()}
          icon={Download}
          color="green"
        />
        <MetricCard
          label="بدأوا تجربة Companion"
          value={trialStarted.toLocaleString()}
          icon={Sparkles}
          color="blue"
        />
        <MetricCard
          label="فتحوا ريا من الجوال"
          value={standaloneOpens.toLocaleString()}
          icon={Smartphone}
          color="yellow"
        />
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03]">
        <div className="border-b border-white/[0.06] px-6 py-4">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-brand-mint" />
            <h2 className="text-sm font-semibold text-white/70">بيانات العملاء المسجلين</h2>
          </div>
          <p className="mt-1 text-xs text-white/35">الاسم والإيميل من حساب Supabase Auth، مع عدد محادثات ريا وآخر نشاط.</p>
        </div>

        {customers.length === 0 ? (
          <p className="px-6 py-8 text-sm text-white/30">لا يوجد عملاء مسجلون حتى الآن.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">
                  <th className="px-6 py-3">الاسم</th>
                  <th className="px-6 py-3">الإيميل</th>
                  <th className="px-6 py-3">المحادثات</th>
                  <th className="px-6 py-3">آخر نشاط</th>
                  <th className="px-6 py-3">تاريخ التسجيل</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.user_id} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-6 py-3.5 text-white/75">
                      {displayName(customer.name, customer.email, customer.user_id)}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-white/60">
                      {customer.email ?? <span className="font-sans text-white/30">بدون إيميل</span>}
                    </td>
                    <td className="px-6 py-3.5 text-white">
                      {customer.conv_count.toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 text-white/40">
                      {customer.last_active ? formatDate(customer.last_active) : "—"}
                    </td>
                    <td className="px-6 py-3.5 text-white/40">
                      {customer.created_at ? formatDate(customer.created_at) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03]">
        <div className="border-b border-white/[0.06] px-6 py-4">
          <h2 className="text-sm font-semibold text-white/70">آخر مستخدمي تطبيق ريا</h2>
          <p className="mt-1 text-xs text-white/35">يعرض من ثبّت التطبيق، بدأ التجربة، أو فتح ريا كوضع تطبيق.</p>
        </div>

        {recentAppUsers.length === 0 ? (
          <p className="px-6 py-8 text-sm text-white/30">لا توجد أحداث تثبيت أو تجربة حتى الآن.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">
                  <th className="px-6 py-3">الحدث</th>
                  <th className="px-6 py-3">الاسم</th>
                  <th className="px-6 py-3">الإيميل</th>
                  <th className="px-6 py-3">الجلسة</th>
                  <th className="px-6 py-3">اللغة</th>
                  <th className="px-6 py-3">الوقت</th>
                </tr>
              </thead>
              <tbody>
                {recentAppUsers.map((row, index) => (
                  <tr key={`${row.event}-${row.created_at}-${index}`} className="border-b border-white/[0.04] last:border-0 hover:bg-white/[0.02]">
                    <td className="px-6 py-3.5 text-white/70">{eventLabel(row.event)}</td>
                    <td className="px-6 py-3.5 text-white/65">
                      {displayName(row.user_name, row.user_email, row.user_id)}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-white/55">
                      {row.user_email ?? <span className="font-sans text-white/30">غير مسجل</span>}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-white/35">
                      {row.session_id ? `…${row.session_id.slice(-10)}` : "—"}
                    </td>
                    <td className="px-6 py-3.5 text-white/35">{row.locale ?? "—"}</td>
                    <td className="px-6 py-3.5 text-white/40">{formatDate(row.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Top Users Table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03]">
        <div className="border-b border-white/[0.06] px-6 py-4">
          <h2 className="text-sm font-semibold text-white/70">أكثر المستخدمين حسب المحادثات</h2>
        </div>

        {topUsers.length === 0 ? (
          <p className="px-6 py-8 text-sm text-white/30">لا توجد بيانات مستخدمين بعد.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">
                  <th className="px-6 py-3">الترتيب</th>
                  <th className="px-6 py-3">الاسم</th>
                  <th className="px-6 py-3">الإيميل</th>
                  <th className="px-6 py-3">المحادثات</th>
                  <th className="px-6 py-3">آخر نشاط</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map((user, index) => (
                  <tr
                    key={user.user_id}
                    className="border-b border-white/[0.04] transition-colors last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="px-6 py-3.5 text-white/30">
                      #{index + 1}
                    </td>
                    <td className="px-6 py-3.5 text-white/65">
                      {displayName(user.user_name, user.user_email, user.user_id)}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-white/55">
                      {user.user_email ?? <span className="font-sans text-white/30">بدون إيميل</span>}
                    </td>
                    <td className="px-6 py-3.5 text-white">
                      {user.conv_count.toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 text-white/40">
                      {formatDate(user.last_active)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PII Note */}
      <p className="text-[11px] leading-relaxed text-white/25">
        بيانات العملاء مأخوذة من جدول profiles الذي يتم إنشاؤه عند تسجيل دخول العميل. إذا كان الدخول بالبريد فقط، يظهر الاسم من الجزء الأول من الإيميل.
      </p>
    </div>
  );
}

function eventLabel(event: string): string {
  if (event === "pwa_app_installed") return "تثبيت التطبيق";
  if (event === "pwa_standalone_opened") return "فتح كتطبيق";
  if (event === "companion_trial_started") return "بدأ التجربة";
  if (event === "pwa_install_cta_clicked") return "ضغط التثبيت";
  return event;
}
