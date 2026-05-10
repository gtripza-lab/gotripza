import { revalidatePath } from "next/cache";
import { updateSupportRequest, getSupportRequests } from "@/lib/admin/data";
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

function countBy(rows: SupportRow[], key: keyof SupportRow) {
  const map = new Map<string, number>();
  for (const row of rows) {
    const value = String(row[key] ?? "unknown");
    map.set(value, (map.get(value) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count);
}

async function updateTicketAction(formData: FormData) {
  "use server";
  const id = Number(formData.get("id"));
  const status = String(formData.get("status") ?? "");
  const priority = String(formData.get("priority") ?? "");
  const aiSummary = String(formData.get("ai_summary") ?? "").trim();

  if (!Number.isFinite(id) || id <= 0) return;
  await updateSupportRequest(id, {
    status: ["open", "in_progress", "resolved", "closed"].includes(status)
      ? (status as "open" | "in_progress" | "resolved" | "closed")
      : undefined,
    priority: ["low", "normal", "high", "urgent"].includes(priority)
      ? (priority as "low" | "normal" | "high" | "urgent")
      : undefined,
    ai_summary: aiSummary || null,
  });
  revalidatePath("/admin/support");
}

export default async function SupportPage() {
  const { rows, total } = await getSupportRequests();

  const open = rows.filter((r) => r.status === "open" || r.status == null).length;
  const inProgress = rows.filter((r) => r.status === "in_progress").length;
  const closed = rows.filter((r) => r.status === "closed" || r.status === "resolved").length;
  const thisWeek = rows.filter((r) => isThisWeek(r.created_at)).length;
  const byCategory = countBy(rows, "category").slice(0, 5);
  const byPriority = countBy(rows, "priority").slice(0, 4);

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
        <MetricCard label="In Progress" value={inProgress.toLocaleString()} color="blue" />
        <MetricCard label="Resolved" value={closed.toLocaleString()} color="green" />
        <MetricCard label="This Week" value={thisWeek.toLocaleString()} color="blue" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/60">
            Top Support Topics
          </h2>
          <div className="mt-4 space-y-3">
            {byCategory.length ? byCategory.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2">
                <span className="text-sm capitalize text-white/65">{item.label}</span>
                <span className="text-xs text-white/35">{item.count}</span>
              </div>
            )) : <p className="text-sm text-white/30">No categories yet</p>}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-white/60">
            Priority Mix
          </h2>
          <div className="mt-4 space-y-3">
            {byPriority.length ? byPriority.map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2">
                <span className="text-sm capitalize text-white/65">{item.label}</span>
                <span className="text-xs text-white/35">{item.count}</span>
              </div>
            )) : <p className="text-sm text-white/30">No priorities yet</p>}
          </div>
        </div>
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
                  <th className="px-6 py-3 text-left text-[11px] font-medium uppercase tracking-[0.15em] text-white/30">
                    Action
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
                      {row.ai_summary && (
                        <p className="mt-2 rounded-lg bg-sky-500/[0.08] px-2 py-1 text-xs text-sky-200/70">
                          {row.ai_summary}
                        </p>
                      )}
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
                    <td className="px-6 py-3.5">
                      <form action={updateTicketAction} className="flex min-w-[360px] items-center gap-2">
                        <input type="hidden" name="id" value={row.id} />
                        <select
                          name="status"
                          defaultValue={row.status ?? "open"}
                          className="h-9 rounded-lg border border-white/[0.10] bg-black/30 px-2 text-xs text-white/70 outline-none"
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                          <option value="closed">Closed</option>
                        </select>
                        <select
                          name="priority"
                          defaultValue={row.priority ?? "normal"}
                          className="h-9 rounded-lg border border-white/[0.10] bg-black/30 px-2 text-xs text-white/70 outline-none"
                        >
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                        <input
                          name="ai_summary"
                          defaultValue={row.ai_summary ?? ""}
                          placeholder="Internal note"
                          className="h-9 w-32 rounded-lg border border-white/[0.10] bg-black/30 px-2 text-xs text-white/70 outline-none placeholder:text-white/25"
                        />
                        <button
                          type="submit"
                          className="h-9 rounded-lg bg-white px-3 text-xs font-semibold text-black transition hover:bg-white/90"
                        >
                          Save
                        </button>
                      </form>
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
