"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { CalendarDays, Loader2, LogIn, MapPinned, Plane, WalletCards } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { TripPlan } from "@/lib/trip-planner";

type SavedPlan = {
  id: string;
  days: number;
  plan: TripPlan;
  created_at: string;
};

type PlansResponse = {
  plans?: SavedPlan[];
  error?: string;
};

export function AccountPlans({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [status, setStatus] = useState<"loading" | "auth" | "empty" | "ready" | "error">("loading");

  useEffect(() => {
    let active = true;

    async function loadPlans() {
      try {
        const res = await fetch("/api/trip-plans", { cache: "no-store" });
        if (!active) return;
        if (res.status === 401) {
          setStatus("auth");
          return;
        }
        const json = (await res.json()) as PlansResponse;
        if (!res.ok || json.error) throw new Error(json.error ?? "load_failed");
        const nextPlans = json.plans ?? [];
        setPlans(nextPlans);
        setStatus(nextPlans.length ? "ready" : "empty");
      } catch {
        if (active) setStatus("error");
      }
    }

    loadPlans();
    return () => {
      active = false;
    };
  }, []);

  if (status === "loading") {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 text-center">
        <Loader2 className="mx-auto h-9 w-9 animate-spin text-brand-primary" />
        <p className="mt-4 text-sm text-white/45">
          {isAr ? "جاري تحميل خططك..." : "Loading your plans..."}
        </p>
      </div>
    );
  }

  if (status === "auth") {
    return (
      <EmptyState
        icon={<LogIn className="h-10 w-10" />}
        title={isAr ? "سجل دخولك لحفظ خططك" : "Sign in to save your plans"}
        body={
          isAr
            ? "استخدم زر الدخول في أعلى الصفحة، ثم احفظ أي خطة من صفحة خطط رحلتي."
            : "Use the sign-in button in the top navigation, then save any plan from the trip planner."
        }
        href={`/${locale}/plan`}
        action={isAr ? "افتح خطط رحلتي" : "Open Trip Planner"}
        secondary
      />
    );
  }

  if (status === "empty") {
    return (
      <EmptyState
        icon={<CalendarDays className="h-10 w-10" />}
        title={isAr ? "لا توجد خطط محفوظة بعد" : "No saved plans yet"}
        body={
          isAr
            ? "أنشئ خطة من محرك خطط رحلتي واضغط حفظ، وستظهر هنا."
            : "Create a plan in the trip planner and tap save. It will appear here."
        }
        href={`/${locale}/plan`}
        action={isAr ? "أنشئ خطة" : "Create a plan"}
      />
    );
  }

  if (status === "error") {
    return (
      <EmptyState
        icon={<CalendarDays className="h-10 w-10" />}
        title={isAr ? "تعذر تحميل الخطط" : "Could not load plans"}
        body={
          isAr
            ? "حاول تحديث الصفحة. إذا استمرت المشكلة قد يحتاج جدول الخطط للتفعيل في Supabase."
            : "Try refreshing the page. If this continues, the trip plans table may need to be enabled in Supabase."
        }
        href={`/${locale}/plan`}
        action={isAr ? "العودة إلى خطط رحلتي" : "Back to Trip Planner"}
        secondary
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {plans.map((row) => (
        <article key={row.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">{row.plan.destinationName}</h2>
              <p className="mt-1 text-xs text-white/35">
                {new Date(row.created_at).toLocaleDateString(isAr ? "ar-SA" : "en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            </div>
            <span className="rounded-full bg-brand-primary/15 px-2 py-1 text-xs text-brand-primary">
              {row.days} {isAr ? "أيام" : "days"}
            </span>
          </div>
          <p className="mt-4 line-clamp-3 text-sm leading-6 text-white/50">
            {row.plan.summary}
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2 text-xs text-white/45">
            <PlanMini icon={<Plane className="h-3.5 w-3.5" />} label={row.plan.originName} />
            <PlanMini icon={<MapPinned className="h-3.5 w-3.5" />} label={row.plan.destinationName} />
            <PlanMini icon={<CalendarDays className="h-3.5 w-3.5" />} label={`${row.plan.travelers} ${isAr ? "مسافرين" : "travelers"}`} />
            <PlanMini icon={<WalletCards className="h-3.5 w-3.5" />} label={`${row.plan.budget.toLocaleString()} ${row.plan.currency}`} />
          </div>
        </article>
      ))}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  body,
  href,
  action,
  secondary = false,
}: {
  icon: ReactNode;
  title: string;
  body: string;
  href: string;
  action: string;
  secondary?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center text-brand-primary">{icon}</div>
      <h2 className="mt-4 text-xl font-semibold text-white">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/45">{body}</p>
      <Link
        href={href}
        className={
          secondary
            ? "mt-5 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black"
            : "mt-5 inline-flex rounded-xl bg-gradient-to-r from-brand-primary to-violet-600 px-4 py-2 text-sm font-semibold text-white"
        }
      >
        {action}
      </Link>
    </div>
  );
}

function PlanMini({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-black/20 px-2 py-2">
      <span className="text-brand-primary">{icon}</span>
      <span className="truncate">{label}</span>
    </div>
  );
}
