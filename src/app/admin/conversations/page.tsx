import Link from "next/link";
import { getConversations } from "@/lib/admin/data";
import type { ConversationRow } from "@/lib/admin/data";
import { labelTripLifecycle } from "@/lib/ai/trip-lifecycle";

export const metadata = { title: "المحادثات" };

function typeBadge(hasUser: boolean) {
  const base =
    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium";
  if (hasUser)
    return `${base} bg-emerald-500/20 text-emerald-400`;
  return `${base} bg-white/[0.08] text-white/50`;
}

function UserIcon() {
  return (
    <svg
      className="w-3 h-3"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5 6a5 5 0 0 1 10 0H3z" />
    </svg>
  );
}

function GhostIcon() {
  return (
    <svg
      className="w-3 h-3"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M8 1a6 6 0 0 0-6 6v6.5l1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5 1.5-1.5 1.5 1.5V7a6 6 0 0 0-6-6zM6 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm4 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
    </svg>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ar-SA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function truncate(text: string | null | undefined, max: number): string {
  if (!text) return "—";
  return text.length > max ? text.slice(0, max) + "…" : text;
}

function labelService(value: string): string {
  const labels: Record<string, string> = {
    insurance: "تأمين",
    esim: "شريحة",
    activities: "أنشطة",
    airport: "مطار",
    translation: "ترجمة",
    safety: "أمان",
    budget: "ميزانية",
  };
  return labels[value] ?? value;
}

function contextChips(row: ConversationRow): string[] {
  const context = row.context;
  const chips = [
    context?.destination ? `وجهة: ${context.destination}` : null,
    context?.booking_stage ? `مرحلة: ${labelTripLifecycle(context.booking_stage, "ar")}` : null,
    ...(context?.service_interests ?? []).slice(0, 3).map((item) => labelService(item)),
  ].filter(Boolean) as string[];
  return chips;
}

export default async function ConversationsPage() {
  const { rows, total } = await getConversations();

  const registeredCount = rows.filter((r) => r.user_id !== null).length;
  const anonymousCount = rows.filter((r) => r.user_id === null).length;

  const messageCounts = rows
    .map((r) => r.message_count)
    .filter((n): n is number => n !== null);
  const avgMessages =
    messageCounts.length > 0
      ? (
          messageCounts.reduce((a, b) => a + b, 0) / messageCounts.length
        ).toFixed(1)
      : "—";

  return (
    <div className="min-h-screen bg-[#08080d] px-6 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-white text-2xl font-semibold tracking-tight">
          المحادثات
        </h1>
        <p className="text-white/40 text-sm mt-1">
          {total.toLocaleString("ar-SA")} محادثة إجمالية
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "الإجمالي", value: total.toLocaleString("ar-SA") },
          { label: "مستخدمون مسجلون", value: registeredCount.toLocaleString("ar-SA") },
          { label: "زوار بدون حساب", value: anonymousCount.toLocaleString("ar-SA") },
          { label: "متوسط الرسائل", value: avgMessages },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-2xl bg-white/[0.03] border border-white/[0.06] px-5 py-4"
          >
            <p className="text-white/40 text-xs font-medium uppercase tracking-wide">
              {label}
            </p>
            <p className="text-white text-2xl font-semibold mt-1 tabular-nums">
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table-fixed w-full text-[13px]">
            <colgroup>
              <col className="w-28" />
              <col className="w-24" />
              <col className="w-20" />
              <col className="w-20" />
              <col className="w-44" />
              <col className="w-44" />
              <col className="w-60" />
              <col /> {/* Summary gets remaining space */}
            </colgroup>
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="text-left px-5 py-3 text-white/40 font-medium">
                  ID
                </th>
                <th className="text-left px-5 py-3 text-white/40 font-medium">
                  النوع
                </th>
                <th className="text-right px-5 py-3 text-white/40 font-medium">
                  الرسائل
                </th>
                <th className="text-left px-5 py-3 text-white/40 font-medium">
                  اللغة
                </th>
                <th className="text-left px-5 py-3 text-white/40 font-medium">
                  البداية
                </th>
                <th className="text-left px-5 py-3 text-white/40 font-medium">
                  آخر نشاط
                </th>
                <th className="text-left px-5 py-3 text-white/40 font-medium">
                  سياق ريا
                </th>
                <th className="text-left px-5 py-3 text-white/40 font-medium">
                  الملخص
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-10 text-center text-white/40"
                  >
                    لا توجد محادثات حتى الآن.
                  </td>
                </tr>
              ) : (
                rows.map((row: ConversationRow) => (
                  <tr
                    key={row.id}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/admin/conversations/${row.id}`}
                        className="font-mono text-white/60 hover:text-white transition-colors"
                      >
                        {row.id.slice(-8)}
                      </Link>
                    </td>
                    <td className="px-5 py-3">
                      <span className={typeBadge(row.user_id !== null)}>
                        {row.user_id !== null ? (
                          <>
                            <UserIcon />
                            مستخدم
                          </>
                        ) : (
                          <>
                            <GhostIcon />
                            زائر
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-white/60 tabular-nums">
                      {row.message_count ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-white/50">
                      {row.locale === "en" ? "EN" : "AR"}
                    </td>
                    <td className="px-5 py-3 text-white/50 whitespace-nowrap">
                      {formatDate(row.started_at)}
                    </td>
                    <td className="px-5 py-3 text-white/50 whitespace-nowrap">
                      {formatDate(row.last_at)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {contextChips(row).length === 0 ? (
                          <span className="text-white/25">—</span>
                        ) : (
                          contextChips(row).map((chip) => (
                            <span key={chip} className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[11px] text-white/55">
                              {chip}
                            </span>
                          ))
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-white/40 truncate">
                      {truncate(row.summary, 60)}
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
