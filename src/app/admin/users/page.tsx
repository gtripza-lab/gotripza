import { getUserStats } from "@/lib/admin/data";
import { MetricCard } from "@/components/admin/MetricCard";
import { Users, UserCheck, UserPlus, Activity } from "lucide-react";

export const metadata = { title: "Users" };

type UserStat = {
  totalRegistered: number;
  totalAnon: number;
  newThisWeek: number;
  activeThisWeek: number;
  topUsers: { user_id: string; conv_count: number; last_active: string }[];
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

export default async function UsersPage() {
  const stats: UserStat | null = await getUserStats();

  const totalRegistered = stats?.totalRegistered ?? 0;
  const totalAnon = stats?.totalAnon ?? 0;
  const newThisWeek = stats?.newThisWeek ?? 0;
  const activeThisWeek = stats?.activeThisWeek ?? 0;
  const topUsers = stats?.topUsers ?? [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Users</h1>
        <p className="mt-1 text-sm text-white/40">Overview of registered and anonymous user activity.</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Registered Users"
          value={totalRegistered.toLocaleString()}
          icon={Users}
          color="blue"
        />
        <MetricCard
          label="Anonymous Sessions (7d)"
          value={totalAnon.toLocaleString()}
          icon={UserCheck}
          color="default"
        />
        <MetricCard
          label="New Users (7d)"
          value={newThisWeek.toLocaleString()}
          icon={UserPlus}
          color="green"
        />
        <MetricCard
          label="Active Users (7d)"
          value={activeThisWeek.toLocaleString()}
          icon={Activity}
          color="yellow"
        />
      </div>

      {/* Top Users Table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03]">
        <div className="border-b border-white/[0.06] px-6 py-4">
          <h2 className="text-sm font-semibold text-white/70">Top Users by Conversations</h2>
        </div>

        {topUsers.length === 0 ? (
          <p className="px-6 py-8 text-sm text-white/30">No user data available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-left text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">
                  <th className="px-6 py-3">Rank</th>
                  <th className="px-6 py-3">User ID</th>
                  <th className="px-6 py-3">Conversations</th>
                  <th className="px-6 py-3">Last Active</th>
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
                    <td className="px-6 py-3.5 font-mono text-white/60">
                      …{user.user_id.slice(-12)}
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
        User IDs are UUIDs from Supabase Auth. Full PII is only visible in the Supabase dashboard.
      </p>
    </div>
  );
}
