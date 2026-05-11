"use client";

import { useState } from "react";
import { Bot, CheckCircle2, Copy, Loader2, Play, XCircle } from "lucide-react";

type WorkflowStatus = {
  key: string;
  name: string;
  description: string;
  envVar: string;
  configured: boolean;
};

type TestState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ok"; message: string; clientSecret: string }
  | { status: "error"; message: string };

export function AgentWorkflowPanel({ workflows }: { workflows: WorkflowStatus[] }) {
  const [states, setStates] = useState<Record<string, TestState>>({});

  async function testWorkflow(key: string) {
    setStates((prev) => ({ ...prev, [key]: { status: "loading" } }));
    try {
      const res = await fetch("/api/admin/agents/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ key }),
      });
      const json = (await res.json()) as {
        ok?: boolean;
        client_secret?: string;
        error?: string;
        detail?: string;
        envVar?: string;
      };
      if (!res.ok || !json.ok || !json.client_secret) {
        const message =
          json.error === "workflow_id_missing" && json.envVar
            ? `المتغير ${json.envVar} غير موجود في Vercel.`
            : json.detail ?? json.error ?? "فشل اختبار الجلسة.";
        setStates((prev) => ({ ...prev, [key]: { status: "error", message } }));
        return;
      }
      setStates((prev) => ({
        ...prev,
        [key]: {
          status: "ok",
          message: "تم إنشاء جلسة ChatKit. معرف الـ Workflow صحيح.",
          clientSecret: json.client_secret!,
        },
      }));
    } catch (err) {
      setStates((prev) => ({
        ...prev,
        [key]: {
          status: "error",
          message: err instanceof Error ? err.message : "خطأ في الاتصال.",
        },
      }));
    }
  }

  async function copyEnvNames() {
    const text = workflows.map((workflow) => `${workflow.envVar}=`).join("\n");
    await navigator.clipboard.writeText(text);
  }

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/35">
            مسارات Agent Builder
          </p>
          <h2 className="mt-2 font-display text-lg font-semibold text-white">
            وكلاء منصة OpenAI
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-white/35">
            أضف معرفات الـ Workflow من OpenAI Agent Builder إلى Vercel، ثم اختبر كل وكيل
            من هنا بإنشاء جلسة ChatKit حقيقية.
          </p>
        </div>
        <button
          type="button"
          onClick={copyEnvNames}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-xs font-medium text-white/60 transition hover:bg-white/[0.08] hover:text-white"
        >
          <Copy className="h-3.5 w-3.5" />
          نسخ أسماء المتغيرات
        </button>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        {workflows.map((workflow) => {
          const state = states[workflow.key] ?? { status: "idle" };
          const isLoading = state.status === "loading";
          return (
            <div
              key={workflow.key}
              className="rounded-xl border border-white/[0.06] bg-black/20 p-4"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-primary/15 text-brand-primary">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-white/85">{workflow.name}</h3>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                        workflow.configured
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-amber-500/15 text-amber-400"
                      }`}
                    >
                      {workflow.configured ? "مربوط" : "المعرف ناقص"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs leading-relaxed text-white/35">
                    {workflow.description}
                  </p>
                  <p className="mt-2 font-mono text-[11px] text-white/25">{workflow.envVar}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={() => testWorkflow(workflow.key)}
                  disabled={isLoading}
                  className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                  اختبار الجلسة
                </button>
                {state.status === "ok" && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {state.message}
                  </span>
                )}
                {state.status === "error" && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-rose-400">
                    <XCircle className="h-3.5 w-3.5 shrink-0" />
                    {state.message}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
