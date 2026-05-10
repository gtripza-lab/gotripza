import { getSupportRequests } from "@/lib/admin/data";
import type { SupportRow } from "@/lib/admin/data";
import { MetricCard } from "@/components/admin/MetricCard";

export const metadata = { title: "Support" };

function statusBadge(status: string | null) {
  const base = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";
  if (status === "open") return <span className={`${base} bg-amber-500/20 text-amber-400`}>Open</span>;
  if (status === "in_progress") return <span className={`${base} bg-sky-500/20 text-sky-400`}>In Progress</span>;
  if (status === "resolved") return <span className={`${base} bg-emerald-500/20 text-emerald-400`}>Resolved</span>;
  if (status === "closed") return <span className={`${base} bg-emerald-500/20 text-emerald-400`}>Closed</span>;
  return <span className={`${base} bg-white/30 text-white/60`}>New</span>;
}

function priorityBadge(priority: string | null) {
  const base = "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium";
  if (priority === "urgent") return <span className={`${base} bg-red-500/20 text-red-400`}>Urgent</span>;
  if (priority === "high") return <span className={`${base} bg-orange-500/20 text-orange-400`}>High</span>;
  if (priority === "low") return <span className={`${base} bg-white/[0.06] text-white/40`}>Low</span>;
  return <span className={`${base} bg-white/[0.08] text-white/55`}>Normal</span>;
}

function isThisWeek(dateStr: string): boolean {
  const d = new Date(dateStr);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86_400_000);
  return d >= weekAgo;
}

export default async function SupportPage() {
  const { rows, total } = await getSupportRequests();

  const open = rows.filter((r) => r.status === "open" || r.status == null).length;
  const closed = rows.filter((r) => r.status === "closed" || r.status === "resolved").length;
  const thisWeek = rows.filter((r) => isThisWeek(r.created_at)).length;

  return (
    <div className="min-h-screen bg-[#08080d] px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-semibold tracking-tight">Support Requests</h1>
        <p className="text-white/40 text-sm mt-1">Incoming user support messages</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard label="Total" value={total.toLocaleString()} />
        <MetricCard label="Open" value={open.toLocaleString()} color="yellow" />
        <MetricCard label="Closed" value={closed.toLocaleString()} color="green" />
        <MetricCard label="This Week" value={thisWeek.toLocaleString()} color="blue" />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] overflow-hidden">
        <div className="px-6 py-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/60">
            All Requests
          </h2>
        </div>

        {rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-white/30 text-sm">No support requests yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">
                    ID
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">
                    Request
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {rows.map((row: SupportRow) => (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3.5">
                      <code className="text-white/40 text-xs font-mono">
                        #{row.id}
                      </code>
                    </td>
                    <td className="px-6 py-3.5 text-white/70 whitespace-nowrap">
                      {row.contact_email ?? <span className="text-white/30 italic">Anonymous</span>}
                    </td>
                    <td className="px-6 py-3.5 max-w-xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-white/35">
                          {row.category}
                        </span>
                        {row.subject && (
                          <span className="text-xs font-medium text-white/70">{row.subject}</span>
                        )}
                      </div>
                      <p className="mt-1 whitespace-pre-wrap break-words text-white/50">
                        {(row.body ?? "").length > 180
                          ? `${(row.body ?? "").slice(0, 180)}…`
                          : row.body ?? <span className="text-white/25 italic">No message body</span>}
                      </p>
                    </td>
                    <td className="px-6 py-3.5">
                      {priorityBadge(row.priority)}
                    </td>
                    <td className="px-6 py-3.5">
                      {statusBadge(row.status)}
                    </td>
                    <td className="px-6 py-3.5 text-white/35 whitespace-nowrap text-xs">
                      {new Date(row.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
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
  );
}
