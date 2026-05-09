import Link from "next/link";
import { getConversationDetail } from "@/lib/admin/data";
import type { ConversationDetail, MessageRow } from "@/lib/admin/data";

export const metadata = { title: "Conversation" };

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatTime(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("en-US", {
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
        User
      </span>
    );
  }
  return (
    <span className={`${base} bg-white/[0.08] text-white/50`}>
      <GhostIcon />
      Anon
    </span>
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

export default async function ConversationDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const conversation: ConversationDetail | null = await getConversationDetail(
    params.id
  );

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!conversation) {
    return (
      <div className="min-h-screen bg-[#08080d] px-6 py-8 flex flex-col items-center justify-center gap-4">
        <p className="text-white/60 text-lg">Conversation not found.</p>
        <Link
          href="/admin/conversations"
          className="inline-flex items-center gap-1.5 text-sm text-white/40 hover:text-white transition-colors"
        >
          <BackArrowIcon />
          Back to Conversations
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
          Conversations
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
            Started{" "}
            <span className="text-white/60">
              {formatDate(conversation.started_at)}
            </span>
          </span>
          <span>
            Messages{" "}
            <span className="text-white/60 tabular-nums">
              {conversation.message_count ?? conversation.messages.length}
            </span>
          </span>
          {conversation.last_message_at != null && (
            <span>
              Last active{" "}
              <span className="text-white/60">
                {formatDate(conversation.last_message_at)}
              </span>
            </span>
          )}
        </div>

        {/* Summary box */}
        {conversation.summary != null && conversation.summary !== "" && (
          <div className="rounded-xl bg-sky-500/[0.08] border border-sky-500/[0.15] px-4 py-3 text-sm text-sky-200/70 leading-relaxed">
            <span className="text-sky-400/70 font-medium mr-2">Summary</span>
            {conversation.summary}
          </div>
        )}
      </div>

      {/* ── Chat replay ── */}
      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] px-6 py-6">
        {conversation.messages.length === 0 ? (
          <p className="text-center text-white/30 py-10 text-sm">
            No messages in this conversation.
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
