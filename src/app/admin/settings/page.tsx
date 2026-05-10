import { ExternalLink } from "lucide-react";
import { getAgentWorkflowStatuses } from "@/lib/openai/agent-workflows";

export const metadata = { title: "Settings" };

function ConfigRow({ label, value }: { label: string; value: string }) {
  const isSet = Boolean(value);
  return (
    <div className="flex items-center justify-between py-3 border-b border-white/[0.04] last:border-0">
      <span className="text-sm text-white/60">{label}</span>
      <span className={`font-mono text-xs ${isSet ? "text-white/80" : "text-white/25 italic"}`}>
        {isSet ? value : "not set"}
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
        <h1 className="font-display text-xl font-semibold text-white">Settings & Configuration</h1>
        <p className="mt-1 text-xs text-white/35">Read-only view of the current environment configuration</p>
      </div>

      {/* Section 1: AI Configuration */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
          AI Configuration
        </p>
        <p className="mb-4 text-xs text-white/20">Active model configuration read from environment variables</p>
        <ConfigRow
          label="Primary Model (AI_MODEL_PRIMARY)"
          value={primaryModel || "not set"}
        />
        <ConfigRow
          label="Lite Model (AI_MODEL_LITE)"
          value={liteModel || "not set"}
        />
        <ConfigRow
          label="Ria Plus Gating (RIA_PLUS_GATING_ENABLED)"
          value={riaPlusGating || "not set"}
        />
      </div>

      {/* Section 2: Feature Flags */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
          Feature Flags
        </p>
        <p className="mb-4 text-xs text-white/20">Runtime flags and secret presence checks</p>

        <FlagRow
          label="RIA_PLUS_GATING_ENABLED"
          status={riaPlusGating === "true" ? "true" : "false"}
          variant={riaPlusGating === "true" ? "ok" : "neutral"}
        />
        <FlagRow
          label="TP_WEBHOOK_SECRET"
          status={tpWebhookSecret ? "Set ✓" : "⚠ Not set"}
          variant={tpWebhookSecret ? "ok" : "warn"}
        />
        <FlagRow
          label="SENTRY_DSN"
          status={sentryDsn ? "Set ✓" : "Not configured"}
          variant={sentryDsn ? "ok" : "neutral"}
        />
        <FlagRow
          label="OPENAI_API_KEY"
          status={openaiApiKey ? "Set ✓" : "⚠ Not set"}
          variant={openaiApiKey ? "ok" : "warn"}
        />
      </div>

      {/* Section 3: OpenAI Agent Builder Workflows */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
          OpenAI Agent Builder
        </p>
        <p className="mb-4 text-xs text-white/20">Workflow ID presence checks. Values are hidden.</p>
        {agentWorkflows.map((workflow) => (
          <FlagRow
            key={workflow.key}
            label={workflow.envVar}
            status={workflow.configured ? "Set ✓" : "⚠ Not set"}
            variant={workflow.configured ? "ok" : "warn"}
          />
        ))}
      </div>

      {/* Section 4: Affiliate Configuration */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
        <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
          Affiliate Configuration
        </p>
        <p className="mb-4 text-xs text-white/20">Public affiliate identifiers used for tracking and attribution</p>

        <div className="flex items-center justify-between py-3 border-b border-white/[0.04]">
          <span className="text-sm text-white/60">NEXT_PUBLIC_TRAVELPAYOUTS_MARKER</span>
          <span className="font-mono text-xs text-white/80">522867</span>
        </div>

        <p className="mt-4 text-xs text-white/25 italic">
          API keys and secrets are never shown here. Manage them in Vercel dashboard.
        </p>
      </div>

      {/* Section 5: Quick Links */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
        <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
          Quick Links
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <QuickLink label="Supabase Dashboard" href="https://supabase.com/dashboard" />
          <QuickLink label="Vercel Dashboard" href="https://vercel.com/dashboard" />
          <QuickLink label="OpenAI Platform" href="https://platform.openai.com" />
          <QuickLink label="Travelpayouts Dashboard" href="https://www.travelpayouts.com/dashboard" />
        </div>
      </div>
    </div>
  );
}
