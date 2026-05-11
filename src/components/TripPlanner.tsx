"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Download, Loader2, MapPinned, Plane, Save, Sparkles, WalletCards } from "lucide-react";
import type { Locale } from "@/i18n/config";
import type { PlannerTripType, TripPlan } from "@/lib/trip-planner";

type FormState = {
  origin: string;
  destination: string;
  days: number;
  budget: number;
  travelers: number;
  tripType: PlannerTripType;
};

const DEFAULT_AR: FormState = {
  origin: "جدة",
  destination: "إسطنبول",
  days: 7,
  budget: 9000,
  travelers: 2,
  tripType: "balanced",
};

const DEFAULT_EN: FormState = {
  origin: "Riyadh",
  destination: "Dubai",
  days: 5,
  budget: 2500,
  travelers: 2,
  tripType: "balanced",
};

const TRIP_TYPES: PlannerTripType[] = [
  "balanced",
  "family",
  "honeymoon",
  "budget",
  "adventure",
  "business",
];

function typeLabel(type: PlannerTripType, isAr: boolean) {
  const labels = {
    balanced: isAr ? "متوازنة" : "Balanced",
    family: isAr ? "عائلية" : "Family",
    honeymoon: isAr ? "شهر عسل" : "Honeymoon",
    budget: isAr ? "اقتصادية" : "Budget",
    adventure: isAr ? "مغامرات" : "Adventure",
    business: isAr ? "عمل" : "Business",
  };
  return labels[type];
}

function budgetLabel(level: TripPlan["budgetLevel"], isAr: boolean) {
  if (level === "tight") return isAr ? "مشدودة" : "Tight";
  if (level === "comfortable") return isAr ? "مريحة" : "Comfortable";
  return isAr ? "متوازنة" : "Balanced";
}

export function TripPlanner({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const [form, setForm] = useState<FormState>(isAr ? DEFAULT_AR : DEFAULT_EN);
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const currency = isAr ? "SAR" : "USD";

  const canSubmit = useMemo(
    () => form.origin.trim().length > 1 && form.destination.trim().length > 1,
    [form.origin, form.destination],
  );

  async function generatePlan() {
    if (!canSubmit || loading) return;
    setLoading(true);
    setSaved(false);
    setSaveMessage("");
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, locale, currency }),
      });
      const json = (await res.json()) as { plan?: TripPlan; error?: string };
      if (!res.ok || !json.plan) throw new Error(json.error ?? "plan_failed");
      setPlan(json.plan);
    } finally {
      setLoading(false);
    }
  }

  async function savePlan() {
    if (!plan) return;
    localStorage.setItem("gotripza_saved_trip_plan", JSON.stringify(plan));
    setSaveMessage("");
    try {
      const res = await fetch("/api/trip-plans", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      if (res.status === 401) {
        setSaved(true);
        setSaveMessage(isAr ? "حفظناها على هذا الجهاز. سجّل الدخول لحفظها في حسابك." : "Saved on this device. Sign in to save it to your account.");
        return;
      }
      if (!res.ok) throw new Error("save_failed");
      setSaved(true);
      setSaveMessage(isAr ? "تم حفظ الخطة في حسابك." : "Saved to your account.");
    } catch {
      setSaved(true);
      setSaveMessage(isAr ? "حفظناها على هذا الجهاز فقط مؤقتاً." : "Saved on this device only for now.");
    }
  }

  function printPlan() {
    window.print();
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[420px_minmax(0,1fr)]">
      <section className="h-fit rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
        <div className="mb-5">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/[0.08] px-3 py-1 text-xs font-semibold text-brand-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {isAr ? "محرك خطط رحلتي" : "Trip Planner Engine"}
          </p>
          <h1 className="mt-3 font-display text-2xl font-bold text-white">
            {isAr ? "ابن خطتك في دقيقة" : "Build your plan in a minute"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/45">
            {isAr
              ? "أدخل أساسيات الرحلة، وGoTripza يعطيك مسار يومي وميزانية تقريبية وخطوات تالية."
              : "Enter the basics and GoTripza creates a daily route, rough budget, and next steps."}
          </p>
        </div>

        <div className="space-y-4">
          <Field label={isAr ? "من أين؟" : "From"} icon={<Plane className="h-4 w-4" />}>
            <input
              value={form.origin}
              onChange={(e) => setForm((prev) => ({ ...prev, origin: e.target.value }))}
              className="planner-input"
              placeholder={isAr ? "جدة" : "Riyadh"}
            />
          </Field>
          <Field label={isAr ? "إلى أين؟" : "To"} icon={<MapPinned className="h-4 w-4" />}>
            <input
              value={form.destination}
              onChange={(e) => setForm((prev) => ({ ...prev, destination: e.target.value }))}
              className="planner-input"
              placeholder={isAr ? "إسطنبول" : "Dubai"}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label={isAr ? "الأيام" : "Days"} icon={<CalendarDays className="h-4 w-4" />}>
              <input
                type="number"
                min={1}
                max={21}
                value={form.days}
                onChange={(e) => setForm((prev) => ({ ...prev, days: Number(e.target.value) }))}
                className="planner-input"
              />
            </Field>
            <Field label={isAr ? "المسافرون" : "Travelers"} icon={<Sparkles className="h-4 w-4" />}>
              <input
                type="number"
                min={1}
                max={12}
                value={form.travelers}
                onChange={(e) => setForm((prev) => ({ ...prev, travelers: Number(e.target.value) }))}
                className="planner-input"
              />
            </Field>
          </div>

          <Field label={isAr ? `الميزانية (${currency})` : `Budget (${currency})`} icon={<WalletCards className="h-4 w-4" />}>
            <input
              type="number"
              min={0}
              value={form.budget}
              onChange={(e) => setForm((prev) => ({ ...prev, budget: Number(e.target.value) }))}
              className="planner-input"
            />
          </Field>

          <div>
            <p className="mb-2 text-xs font-medium text-white/45">
              {isAr ? "نوع الرحلة" : "Trip type"}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {TRIP_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, tripType: type }))}
                  className={`rounded-xl border px-3 py-2 text-xs transition ${
                    form.tripType === type
                      ? "border-brand-primary/60 bg-brand-primary/20 text-white"
                      : "border-white/[0.08] bg-white/[0.04] text-white/50 hover:text-white"
                  }`}
                >
                  {typeLabel(type, isAr)}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={generatePlan}
            disabled={!canSubmit || loading}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-violet-600 text-sm font-semibold text-white transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {isAr ? "ولّد الخطة" : "Generate plan"}
          </button>
        </div>
      </section>

      <section className="min-w-0 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 print:border-0 print:bg-white print:text-black">
        {!plan ? (
          <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
            <Sparkles className="h-10 w-10 text-brand-primary/70" />
            <p className="mt-4 max-w-md text-sm leading-6 text-white/45">
              {isAr
                ? "ستظهر هنا الخطة اليومية، توزيع الميزانية، نصائح التأشيرة، ونصائح التجهيز."
                : "Your daily plan, budget split, visa notes, and packing tips will appear here."}
            </p>
          </div>
        ) : (
          <div id="trip-plan-print" className="space-y-6">
            <div className="grid gap-3 border-b border-white/[0.08] pb-5 print:border-black/10 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
                  GoTripza
                </p>
                <h2 className="mt-2 font-display text-2xl font-bold text-white print:text-black">
                  {plan.destinationName}
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/55 print:text-black/65">
                  {plan.summary}
                </p>
              </div>
              <div className="flex gap-2 print:hidden">
                <button
                  type="button"
                  onClick={savePlan}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/[0.10] px-3 text-xs text-white/65 hover:bg-white/[0.06]"
                >
                  <Save className="h-3.5 w-3.5" />
                  {saved ? (isAr ? "تم الحفظ" : "Saved") : (isAr ? "حفظ" : "Save")}
                </button>
                <button
                  type="button"
                  onClick={printPlan}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-black"
                >
                  <Download className="h-3.5 w-3.5" />
                  PDF
                </button>
              </div>
              {saveMessage && (
                <p className="text-xs text-brand-mint print:hidden sm:col-span-2 sm:text-end">
                  {saveMessage}
                </p>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <PlanMetric label={isAr ? "الميزانية اليومية" : "Daily budget"} value={`${plan.estimatedDailyBudget.toLocaleString()} ${plan.currency}`} />
              <PlanMetric label={isAr ? "تقييم الميزانية" : "Budget fit"} value={budgetLabel(plan.budgetLevel, isAr)} />
              <PlanMetric label={isAr ? "نوع الرحلة" : "Trip type"} value={typeLabel(plan.tripType, isAr)} />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <InfoBlock title={isAr ? "السكن" : "Stay"} body={plan.stayAdvice} />
              <InfoBlock title={isAr ? "الطيران" : "Flights"} body={plan.flightAdvice} />
              <InfoBlock title={isAr ? "التأشيرة" : "Visa"} body={plan.visaAdvice} />
              <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 print:border-black/10 print:bg-white">
                <h3 className="text-sm font-semibold text-white/80 print:text-black">
                  {isAr ? "توزيع الميزانية" : "Budget split"}
                </h3>
                <div className="mt-3 space-y-2">
                  {plan.costBreakdown.map((item) => (
                    <div key={item.label} className="flex justify-between text-sm">
                      <span className="text-white/45 print:text-black/55">{item.label}</span>
                      <span className="font-medium text-white/75 print:text-black">{item.amount.toLocaleString()} {plan.currency}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-3 text-sm font-semibold text-white/80 print:text-black">
                {isAr ? "الجدول اليومي" : "Daily itinerary"}
              </h3>
              <div className="space-y-3">
                {plan.daysPlan.map((day) => (
                  <div key={day.day} className="rounded-xl border border-white/[0.06] bg-black/20 p-4 print:border-black/10 print:bg-white">
                    <p className="text-sm font-semibold text-white/85 print:text-black">
                      {day.title}
                    </p>
                    <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                      <PlanStep label={isAr ? "الصباح" : "Morning"} value={day.morning} />
                      <PlanStep label={isAr ? "العصر" : "Afternoon"} value={day.afternoon} />
                      <PlanStep label={isAr ? "المساء" : "Evening"} value={day.evening} />
                    </div>
                    <p className="mt-3 rounded-lg bg-brand-primary/[0.08] px-3 py-2 text-xs text-white/50 print:bg-black/5 print:text-black/65">
                      {day.tip}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <ListBlock title={isAr ? "تجهيزات مهمة" : "Packing notes"} items={plan.packingAdvice} />
              <ListBlock title={isAr ? "الخطوات التالية" : "Next steps"} items={plan.nextSteps} />
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function Field({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-medium text-white/45">
        {icon}
        {label}
      </span>
      {children}
    </label>
  );
}

function PlanMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 print:border-black/10 print:bg-white">
      <p className="text-xs text-white/35 print:text-black/45">{label}</p>
      <p className="mt-1 font-semibold text-white print:text-black">{value}</p>
    </div>
  );
}

function InfoBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 print:border-black/10 print:bg-white">
      <h3 className="text-sm font-semibold text-white/80 print:text-black">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-white/50 print:text-black/65">{body}</p>
    </div>
  );
}

function PlanStep({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold text-brand-primary">{label}</p>
      <p className="mt-1 leading-6 text-white/55 print:text-black/65">{value}</p>
    </div>
  );
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 print:border-black/10 print:bg-white">
      <h3 className="text-sm font-semibold text-white/80 print:text-black">{title}</h3>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="text-sm leading-6 text-white/50 print:text-black/65">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
