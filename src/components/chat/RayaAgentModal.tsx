"use client";

import Script from "next/script";
import { useMemo, useState } from "react";
import { ChatKit, useChatKit } from "@openai/chatkit-react";
import { Bot, Headphones, Loader2, Search, X } from "lucide-react";
import type { Locale } from "@/i18n/config";

type AgentKey = "travel_research" | "support_draft";

const AGENTS: Array<{
  key: AgentKey;
  ar: string;
  en: string;
  icon: "search" | "support";
}> = [
  { key: "travel_research", ar: "وكيل بحث السفر", en: "Travel research agent", icon: "search" },
  { key: "support_draft", ar: "وكيل الدعم", en: "Support agent", icon: "support" },
];

export function RayaAgentModal({
  locale,
  open,
  onClose,
}: {
  locale: Locale;
  open: boolean;
  onClose: () => void;
}) {
  const isAr = locale === "ar";
  const [agentKey, setAgentKey] = useState<AgentKey>("travel_research");
  const [error, setError] = useState("");
  const options = useMemo(
    () => ({
      api: {
        async getClientSecret(existing?: string | null) {
          if (existing) return existing;
          setError("");
          const res = await fetch("/api/raya/agent-session", {
            method: "POST",
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ key: agentKey }),
          });
          const json = (await res.json()) as {
            client_secret?: string;
            error?: string;
            detail?: string;
            envVar?: string;
          };
          if (!res.ok || !json.client_secret) {
            const message =
              json.error === "workflow_id_missing" && json.envVar
                ? `${json.envVar} ${isAr ? "غير مضاف في Vercel" : "is missing in Vercel"}`
                : json.detail ?? json.error ?? "agent_session_failed";
            setError(message);
            throw new Error(message);
          }
          return json.client_secret;
        },
      },
      theme: {
        colorScheme: "dark" as const,
      },
    }),
    [agentKey, isAr],
  );
  const { control } = useChatKit(options);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 px-3 py-4 backdrop-blur-sm" dir={isAr ? "rtl" : "ltr"}>
      <Script src="https://cdn.platform.openai.com/deployments/chatkit/chatkit.js" strategy="afterInteractive" />
      <div className="mx-auto flex h-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-white/[0.10] bg-[#071524] shadow-2xl">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/[0.08] px-4 py-3">
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-sm font-semibold text-white">
              <Bot className="h-4 w-4 text-brand-primary" />
              {isAr ? "ريا عبر Agent Builder" : "Rya via Agent Builder"}
            </p>
            <p className="mt-1 text-xs text-white/40">
              {isAr
                ? "وكلاء متخصصون من OpenAI للبحث والدعم، بجانب ريا الأساسية."
                : "Specialized OpenAI agents for research and support alongside core Rya."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-white/60 hover:bg-white/[0.08]"
            aria-label={isAr ? "إغلاق" : "Close"}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex shrink-0 gap-2 overflow-x-auto border-b border-white/[0.06] px-4 py-3">
          {AGENTS.map((agent) => {
            const Icon = agent.icon === "support" ? Headphones : Search;
            return (
              <button
                key={agent.key}
                type="button"
                onClick={() => {
                  setAgentKey(agent.key);
                  setError("");
                }}
                className={`inline-flex h-9 shrink-0 items-center gap-2 rounded-full px-3 text-xs font-semibold transition ${
                  agentKey === agent.key
                    ? "bg-white text-black"
                    : "border border-white/[0.10] bg-white/[0.04] text-white/50 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {isAr ? agent.ar : agent.en}
              </button>
            );
          })}
        </div>

        {error && (
          <div className="mx-4 mt-3 rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200">
            {error}
          </div>
        )}

        <div className="min-h-0 flex-1 p-3">
          <ChatKit
            key={agentKey}
            control={control}
            className="block h-full min-h-[520px] w-full overflow-hidden rounded-xl border border-white/[0.08]"
          />
          {!control && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-brand-primary" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
