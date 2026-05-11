"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { CalendarDays, Headphones, Loader2, LogIn, MapPinned, Plane, WalletCards } from "lucide-react";
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
  setupRequired?: boolean;
};

type SupportTicket = {
  id: number;
  category: string;
  status: string | null;
  priority: string | null;
  subject: string | null;
  created_at: string;
  updated_at: string | null;
};

type SupportResponse = {
  tickets?: SupportTicket[];
};

export function AccountPlans({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const [plans, setPlans] = useState<SavedPlan[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [status, setStatus] = useState<"loading" | "auth" | "empty" | "ready" | "error">("loading");
  const [setupRequired, setSetupRequired] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPlans() {
      try {
        const [plansRes, ticketsRes] = await Promise.all([
          fetch("/api/trip-plans", { cache: "no-store" }),
          fetch("/api/support", { cache: "no-store" }),
        ]);
        if (!active) return;
        if (plansRes.status === 401) {
          setStatus("auth");
          return;
        }
        const json = (await plansRes.json()) as PlansResponse;
        if (!plansRes.ok || json.error) throw new Error(json.error ?? "load_failed");
        const supportJson = ticketsRes.ok ? ((await ticketsRes.json()) as SupportResponse) : { tickets: [] };
        const nextPlans = json.plans ?? [];
        setSetupRequired(Boolean(json.setupRequired));
        setTickets(supportJson.tickets ?? []);
        setPlans(nextPlans);
        setStatus(nextPlans.length || (supportJson.tickets?.length ?? 0) ? "ready" : "empty");
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
    <div className="space-y-8">
      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/45">
            {isAr ? "خطط الرحلات" : "Trip Plans"}
          </h2>
          <Link href={`/${locale}/plan`} className="text-xs font-semibold text-brand-primary hover:text-brand-mint">
            {isAr ? "إنشاء خطة" : "Create plan"}
          </Link>
        </div>
        {setupRequired ? (
          <InlineEmpty
            title={isAr ? "تفعيل حفظ الخطط مطلوب" : "Trip plan storage needs setup"}
            body={
              isAr
                ? "الكود جاهز، لكن جدول trip_plans غير موجود في Supabase الإنتاج. طبّق migration الجديد لتفعيل الحفظ في الحساب."
                : "The code is ready, but the trip_plans table is missing in production Supabase. Apply the new migration to enable account saves."
            }
          />
        ) : plans.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {plans.map((row) => (
              <article key={row.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{row.plan.destinationName}</h3>
                    <p className="mt-1 text-xs text-white/35">
                      {formatDate(row.created_at, isAr)}
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
        ) : (
          <InlineEmpty
            title={isAr ? "لا توجد خطط محفوظة بعد" : "No saved plans yet"}
            body={isAr ? "أنشئ خطة واحفظها لتظهر هنا." : "Create and save a plan to see it here."}
          />
        )}
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-white/45">
            {isAr ? "طلبات الدعم" : "Support Tickets"}
          </h2>
          <Link href={`/${locale}/contact`} className="text-xs font-semibold text-brand-primary hover:text-brand-mint">
            {isAr ? "طلب جديد" : "New request"}
          </Link>
        </div>
        {tickets.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {tickets.map((ticket) => (
              <article key={ticket.id} className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-primary/15 text-brand-primary">
                    <Headphones className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate text-sm font-semibold text-white">
                        {ticket.subject || (isAr ? "طلب دعم" : "Support request")}
                      </h3>
                      <TicketBadge value={ticket.status ?? "open"} />
                      <TicketBadge value={ticket.priority ?? "normal"} muted />
                    </div>
                    <p className="mt-2 text-xs text-white/35">
                      #{ticket.id} · {ticket.category} · {formatDate(ticket.created_at, isAr)}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <InlineEmpty
            title={isAr ? "لا توجد طلبات دعم" : "No support tickets"}
            body={isAr ? "عند إرسال رسالة للدعم أو تصعيد ريا لمشكلة ستظهر هنا." : "Support requests and Raya escalations will appear here."}
          />
        )}
      </section>
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

function TicketBadge({ value, muted = false }: { value: string; muted?: boolean }) {
  const colors: Record<string, string> = {
    open: "bg-amber-500/15 text-amber-300",
    in_progress: "bg-sky-500/15 text-sky-300",
    resolved: "bg-emerald-500/15 text-emerald-300",
    closed: "bg-emerald-500/15 text-emerald-300",
    urgent: "bg-rose-500/15 text-rose-300",
    high: "bg-orange-500/15 text-orange-300",
    normal: "bg-white/[0.08] text-white/45",
    low: "bg-white/[0.05] text-white/35",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${muted ? colors[value] ?? colors.normal : colors[value] ?? colors.open}`}>
      {value.replace("_", " ")}
    </span>
  );
}

function InlineEmpty({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5">
      <p className="text-sm font-semibold text-white/70">{title}</p>
      <p className="mt-1 text-sm text-white/35">{body}</p>
    </div>
  );
}

function formatDate(date: string, isAr: boolean) {
  return new Date(date).toLocaleDateString(isAr ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
