import Link from "next/link";
import { getConversationDetail } from "@/lib/admin/data";
import type { ConversationDetail, MessageRow } from "@/lib/admin/data";

export const metadata = { title: "تفاصيل المحادثة" };

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("ar-SA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("ar-SA", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function BackArrowIcon() {
  return (
    <svg
      className="w-4 h-4"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 12L6 8l4-4" />
    </svg>
  );
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

function TypeBadge({ hasUser }: { hasUser: boolean }) {
  const base =
    "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium";
  if (hasUser) {
    return (
      <span className={`${base} bg-emerald-500/20 text-emerald-400`}>
        <UserIcon />
        مستخدم
      </span>
    );
  }
  return (
    <span className={`${base} bg-white/[0.08] text-white/50`}>
      <GhostIcon />
      زائر
    </span>
  );
}

function labelService(value: string): string {
  const labels: Record<string, string> = {
    insurance: "تأمين السفر",
    esim: "شريحة eSIM",
    activities: "أنشطة وجولات",
    airport: "مساعدة المطار",
    translation: "ترجمة",
    safety: "إرشادات أمان",
    budget: "ميزانية",
  };
  return labels[value] ?? value;
}

function ContextPanel({ conversation }: { conversation: ConversationDetail }) {
  const context = conversation.context ?? {};
  const intent = conversation.last_intent ?? {};
  const items = [
    { label: "الوجهة", value: context.destination ?? intent.destination },
    { label: "من", value: context.origin ?? intent.origin },
    { label: "المسافر", value: context.traveler_type },
    { label: "نوع الرحلة", value: context.trip_type ?? intent.trip_type },
    { label: "الميزانية", value: context.budget_usd ? `$${context.budget_usd}` : null },
    { label: "مرحلة الحجز", value: context.booking_stage },
  ].filter((item) => item.value != null && item.value !== "");
  const services = (context.service_interests ?? []).map(labelService);
  const concerns = context.concerns ?? [];

  if (items.length === 0 && services.length === 0 && concerns.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] px-5 py-4 space-y-4">
      <div>
        <h2 className="text-white text-sm font-semibold">سياق ريا لهذه المحادثة</h2>
        <p className="text-white/35 text-xs mt-1">هذا يساعدك تعرف ماذا فهمت ريا عن المستخدم.</p>
      </div>
      {items.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {items.map((item) => (
            <div key={item.label} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2">
              <p className="text-[11px] text-white/35">{item.label}</p>
              <p className="mt-1 text-sm text-white/75 break-words">{String(item.value)}</p>
            </div>
          ))}
        </div>
      )}
      {(services.length > 0 || concerns.length > 0) && (
        <div className="flex flex-wrap gap-2">
          {[...services, ...concerns].map((chip) => (
            <span key={chip} className="rounded-full border border-brand-primary/20 bg-brand-primary/10 px-3 py-1 text-xs text-brand-mint">
              {chip}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function MessageBubble({ msg }: { msg: MessageRow }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex flex-col gap-1 ${isUser ? "items-end" : "items-start"}`}>
      {/* Bubble */}
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? "bg-brand-primary/20 text-white rounded-br-sm"
            : "bg-white/[0.05] text-white/80 rounded-bl-sm"
        }`}
      >
        {msg.content ?? ""}
      </div>

      {/* Metadata row */}
      <div
        className={`flex items-center gap-3 text-[11px] text-white/30 px-1 ${
          isUser ? "flex-row-reverse" : "flex-row"
        }`}
      >
        <span>{formatTime(msg.created_at)}</span>

        {/* Assistant-only metadata */}
        {!isUser && (
          <>
            {msg.mode != null && msg.mode !== "" && (
              <span>{msg.mode}</span>
            )}
            {msg.latency_ms != null && (
              <span>{msg.latency_ms.toLocaleString()} ms</span>
            )}
            {msg.provider != null && msg.provider !== "" && (
              <span className="font-mono">{msg.provider}</span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function ConversationDetailPage(
  props: {
    params: Promise<{ id: string }>;
  }
) {
  const params = await props.params;
  const conversation: ConversationDetail | null = await getConversationDetail(
    params.id
  );

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!conversation) {
    return (
      <div className="min-h-screen bg-[#08080d] px-6 py-8 flex flex-col items-center justify-center gap-4">
        <p className="text-white/60 text-lg">المحادثة غير موجودة.</p>
        <Link
          href="/admin/conversations"
          className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
        >
          <BackArrowIcon />
          العودة إلى المحادثات
        </Link>
      </div>
    );
  }

  const hasUser = conversation.user_id != null;

  // ── Main view ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#08080d] px-6 py-8 space-y-8">

      {/* ── Header ── */}
      <div className="space-y-4">
        {/* Back link */}
        <Link
          href="/admin/conversations"
          className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
        >
          <BackArrowIcon />
          المحادثات
        </Link>

        {/* Title row */}
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-mono text-white text-xl font-semibold tracking-tight break-all">
            {conversation.id}
          </h1>
          <TypeBadge hasUser={hasUser} />
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-white/40">
          <span>
            بدأت{" "}
            <span className="text-white/60">
              {formatDate(conversation.started_at)}
            </span>
          </span>
          <span>
            الرسائل{" "}
            <span className="text-white/60 tabular-nums">
              {conversation.message_count ?? conversation.messages.length}
            </span>
          </span>
          {conversation.last_at != null && (
            <span>
              آخر نشاط{" "}
              <span className="text-white/60">
                {formatDate(conversation.last_at)}
              </span>
            </span>
          )}
          <span>
            اللغة{" "}
            <span className="text-white/60">
              {conversation.locale === "en" ? "English" : "العربية"}
            </span>
          </span>
        </div>

        {/* Summary box */}
        {conversation.summary != null && conversation.summary !== "" && (
          <div className="rounded-xl bg-sky-500/[0.08] border border-sky-500/[0.15] px-4 py-3 text-sm text-sky-200/70 leading-relaxed">
            <span className="text-sky-400/70 font-medium mr-2">الملخص</span>
            {conversation.summary}
          </div>
        )}
      </div>

      <ContextPanel conversation={conversation} />

      {/* ── Chat replay ── */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] px-6 py-6">
        {conversation.messages.length === 0 ? (
          <p className="text-center text-white/30 py-10 text-sm">
            لا توجد رسائل في هذه المحادثة.
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            {conversation.messages.map((msg) => (
              <MessageBubble key={msg.id} msg={msg} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
