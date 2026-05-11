import { ExternalLink } from "lucide-react";
import { getAgentWorkflowStatuses } from "@/lib/openai/agent-workflows";

export const metadata = { title: "الإعدادات" };

function ConfigRow({ label, value }: { label: string; value: string }) {
  const isSet = Boolean(value) && value !== "غير مضبوط";
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
      <span className="text-sm text-white/60">{label}</span>
      <span className={`font-mono text-xs ${isSet ? "text-white/80" : "text-white/25 italic"}`}>
        {isSet ? value : "غير مضبوط"}
      </span>
    </div>
  );
}

function FlagRow({
  label,
  status,
  variant = "neutral",
}: {
  label: string;
  status: string;
  variant?: "ok" | "warn" | "neutral";
}) {
  const badgeClass =
    variant === "ok"
      ? "bg-emerald-500/15 text-emerald-400"
      : variant === "warn"
      ? "bg-amber-500/15 text-amber-400"
      : "bg-white/[0.07] text-white/50";

  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
      <span className="text-sm text-white/60">{label}</span>
      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badgeClass}`}>
        {status}
      </span>
    </div>
  );
}

function QuickLink({ label, href }: { label: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:bg-white/[0.05] hover:border-white/[0.10] group"
    >
      <span className="text-sm text-white/70 group-hover:text-white/90 transition-colors">{label}</span>
      <ExternalLink className="h-3.5 w-3.5 text-white/25 group-hover:text-white/50 transition-colors" />
    </a>
  );
}

export default function SettingsPage() {
  const primaryModel = process.env.AI_MODEL_PRIMARY ?? "";
  const liteModel = process.env.AI_MODEL_LITE ?? "";
  const riaPlusGating = process.env.RIA_PLUS_GATING_ENABLED ?? "";
  const tpWebhookSecret = process.env.TP_WEBHOOK_SECRET ?? "";
  const sentryDsn = process.env.SENTRY_DSN ?? "";
  const openaiApiKey = process.env.OPENAI_API_KEY ?? "";
  const agentWorkflows = getAgentWorkflowStatuses();

  return (
    <div className="space-y-8 p-6">
      {/* Page header */}
      <div>
        <h1 className="font-display text-xl font-semibold text-white">الإعدادات والتهيئة</h1>
        <p className="mt-1 text-xs text-white/35">عرض آمن للمتغيرات الحالية بدون كشف الأسرار</p>
      </div>

      {/* Section 1: AI Configuration */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
          إعدادات الذكاء الاصطناعي
        </p>
        <p className="mb-4 text-xs text-white/20">النماذج النشطة المقروءة من متغيرات البيئة</p>
        <ConfigRow
          label="النموذج الأساسي (AI_MODEL_PRIMARY)"
          value={primaryModel || "غير مضبوط"}
        />
        <ConfigRow
          label="النموذج الخفيف (AI_MODEL_LITE)"
          value={liteModel || "غير مضبوط"}
        />
        <ConfigRow
          label="تفعيل باقة ريا التجريبية (RIA_PLUS_GATING_ENABLED)"
          value={riaPlusGating || "غير مضبوط"}
        />
      </div>

      {/* Section 2: Feature Flags */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
          مفاتيح التشغيل
        </p>
        <p className="mb-4 text-xs text-white/20">حالة الميزات والأسرار دون عرض قيمها</p>

        <FlagRow
          label="RIA_PLUS_GATING_ENABLED"
          status={riaPlusGating === "true" ? "true" : "false"}
          variant={riaPlusGating === "true" ? "ok" : "neutral"}
        />
        <FlagRow
          label="TP_WEBHOOK_SECRET"
          status={tpWebhookSecret ? "موجود" : "غير مضبوط"}
          variant={tpWebhookSecret ? "ok" : "warn"}
        />
        <FlagRow
          label="SENTRY_DSN"
          status={sentryDsn ? "موجود" : "غير مهيأ"}
          variant={sentryDsn ? "ok" : "neutral"}
        />
        <FlagRow
          label="OPENAI_API_KEY"
          status={openaiApiKey ? "موجود" : "غير مضبوط"}
          variant={openaiApiKey ? "ok" : "warn"}
        />
      </div>

      {/* Section 3: OpenAI Agent Builder Workflows */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
          OpenAI Agent Builder
        </p>
        <p className="mb-4 text-xs text-white/20">فحص وجود معرفات الـ Workflow. القيم مخفية.</p>
        {agentWorkflows.map((workflow) => (
          <FlagRow
            key={workflow.key}
            label={workflow.envVar}
            status={workflow.configured ? "موجود" : "غير مضبوط"}
            variant={workflow.configured ? "ok" : "warn"}
          />
        ))}
      </div>

      {/* Section 4: Affiliate Configuration */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
          إعدادات الشراكات
        </p>
        <p className="mb-4 text-xs text-white/20">معرفات عامة للتتبع ونسب النقرات</p>

        <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
          <span className="text-sm text-white/60">NEXT_PUBLIC_TRAVELPAYOUTS_MARKER</span>
          <span className="font-mono text-xs text-white/80">522867</span>
        </div>

        <p className="mt-4 text-xs text-white/25 italic">
          مفاتيح API والأسرار لا تظهر هنا أبداً. إدارتها تكون من لوحة Vercel.
        </p>
      </div>

      {/* Section 5: Quick Links */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
          روابط سريعة
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <QuickLink label="لوحة Supabase" href="https://supabase.com/dashboard" />
          <QuickLink label="لوحة Vercel" href="https://vercel.com/dashboard" />
          <QuickLink label="منصة OpenAI" href="https://platform.openai.com" />
          <QuickLink label="لوحة Travelpayouts" href="https://www.travelpayouts.com/dashboard" />
        </div>
      </div>
    </div>
  );
}
