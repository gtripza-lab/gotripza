"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  Car,
  CloudSun,
  Coffee,
  ExternalLink,
  RefreshCw,
  Scissors,
  Download,
  Hotel,
  Loader2,
  MapPinned,
  MessageCircle,
  Plane,
  Route,
  Save,
  ShieldCheck,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  WalletCards,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
import { CHECKOUT_LINKS } from "@/lib/checkout-links";
import { logEvent } from "@/lib/events";
import type { PlannerTripType, TripPlan, TripPlanDay } from "@/lib/trip-planner";

type FormState = {
  origin: string;
  destination: string;
  days: number;
  budget: number;
  travelers: number;
  tripType: PlannerTripType;
  interests: PlannerInterest[];
};

type PlannerInterest = "nature" | "kids" | "shopping" | "food" | "culture" | "relax";

const DEFAULT_AR: FormState = {
  origin: "جدة",
  destination: "إسطنبول",
  days: 7,
  budget: 9000,
  travelers: 2,
  tripType: "balanced",
  interests: ["culture", "food"],
};

const DEFAULT_EN: FormState = {
  origin: "Riyadh",
  destination: "Dubai",
  days: 5,
  budget: 2500,
  travelers: 2,
  tripType: "balanced",
  interests: ["nature", "food"],
};

const TRIP_TYPES: PlannerTripType[] = [
  "balanced",
  "family",
  "honeymoon",
  "budget",
  "adventure",
  "business",
];

const INTERESTS: PlannerInterest[] = ["nature", "kids", "shopping", "food", "culture", "relax"];

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

function interestLabel(interest: PlannerInterest, isAr: boolean) {
  const labels: Record<PlannerInterest, string> = {
    nature: isAr ? "طبيعة" : "Nature",
    kids: isAr ? "أطفال" : "Kids",
    shopping: isAr ? "تسوق" : "Shopping",
    food: isAr ? "مطاعم" : "Food",
    culture: isAr ? "ثقافة" : "Culture",
    relax: isAr ? "راحة" : "Relax",
  };
  return labels[interest];
}

function renumberDays(plan: TripPlan, isAr: boolean): TripPlan {
  const daysPlan = plan.daysPlan.map((day, index) => {
    const nextDay = index + 1;
    const title = day.title.replace(/^(يوم\s+\d+\s*:\s*|Day\s+\d+\s*:\s*)/i, "");
    return {
      ...day,
      day: nextDay,
      title: nextDay === 1
        ? day.title
        : `${isAr ? `يوم ${nextDay}: ` : `Day ${nextDay}: `}${title}`,
      ryaPrompt: day.ryaPrompt.replace(/يوم\s+\d+|day\s+\d+/i, isAr ? `يوم ${nextDay}` : `day ${nextDay}`),
    };
  });
  return {
    ...plan,
    days: daysPlan.length,
    daysPlan,
  };
}

function alternativeForDay(plan: TripPlan, day: TripPlanDay, isAr: boolean): TripPlanDay {
  const code = plan.destinationCode;
  const cost = Math.max(0, Math.round(day.estimatedCost * 0.95));
  const common = {
    ...day,
    estimatedCost: cost,
  };

  if (code === "AHB") {
    return {
      ...common,
      title: isAr ? `يوم ${day.day}: بديل هادئ في أبها` : `Day ${day.day}: A calmer Abha alternative`,
      focus: isAr ? "الجبل الأخضر + ممشى الضباب" : "Green Mountain + Fog Walkway",
      area: isAr ? "وسط أبها" : "Central Abha",
      morning: isAr ? "ابدأ بإفطار متأخر ثم جولة قصيرة في وسط أبها أو سوق قريب." : "Start with a late breakfast, then a short central Abha or nearby market walk.",
      afternoon: isAr ? "زر الجبل الأخضر قبل الغروب للصور والإطلالة بدون طريق طويل." : "Visit Green Mountain before sunset for views without a long drive.",
      evening: isAr ? "اختم بممشى الضباب أو شارع الفن حسب الطقس." : "End with Fog Walkway or Art Street depending on weather.",
      transit: isAr ? "تنقلات قصيرة داخل المدينة، مناسبة إذا تريد يوم أخف." : "Short city transfers, good when you want an easier day.",
      tip: isAr ? "هذا البديل مناسب بعد يوم السودة أو رجال ألمع." : "This alternative works well after Al Soudah or Rijal Almaa.",
    };
  }

  if (code === "IST") {
    return {
      ...common,
      title: isAr ? `يوم ${day.day}: كاديكوي والجانب الآسيوي` : `Day ${day.day}: Kadikoy and the Asian side`,
      focus: isAr ? "عبّارة + طعام محلي + مشي خفيف" : "Ferry + local food + easy walking",
      area: isAr ? "كاديكوي" : "Kadikoy",
      morning: isAr ? "خذ العبّارة إلى كاديكوي واستمتع بالمشهد بدلاً من الزحام." : "Take the ferry to Kadikoy and enjoy the view instead of traffic.",
      afternoon: isAr ? "غداء محلي ثم مشي في مودا أو شارع بغداد حسب وقتك." : "Local lunch, then walk around Moda or Bagdat Street depending on time.",
      evening: isAr ? "ارجع بالعبّارة قبل التأخر، أو عشاء هادئ في كاراكوي." : "Return by ferry before it gets too late, or dinner in Karakoy.",
      transit: isAr ? "العبّارة أفضل جزء في اليوم، واجعلها ضمن الخطة لا مجرد وسيلة." : "The ferry is part of the experience, not just transport.",
      tip: isAr ? "ممتاز لمن يريد إسطنبول أقل سياحية وأكثر محلية." : "Great for a less touristy, more local Istanbul day.",
    };
  }

  if (code === "DXB") {
    return {
      ...common,
      title: isAr ? `يوم ${day.day}: متاحف وممشى حضري` : `Day ${day.day}: Museums and city walking`,
      focus: isAr ? "متحف المستقبل أو الفهيدي + مساء خفيف" : "Museum of the Future or Al Fahidi + easy evening",
      area: isAr ? "وسط دبي أو الفهيدي" : "Downtown Dubai or Al Fahidi",
      morning: isAr ? "ابدأ بمتحف المستقبل أو حي الفهيدي حسب ميزانيتك." : "Start with Museum of the Future or Al Fahidi depending on budget.",
      afternoon: isAr ? "غداء قريب ثم راحة قصيرة لتجنب حرارة الظهر." : "Nearby lunch, then a short rest to avoid midday heat.",
      evening: isAr ? "ممشى سيتي ووك أو دبي مول بدون برنامج مزدحم." : "City Walk or Dubai Mall without a packed schedule.",
      transit: isAr ? "المترو عملي إذا سكنك قريب من محطة." : "Metro works well if your stay is near a station.",
      tip: isAr ? "هذا بديل جيد للأيام الحارة أو للعائلات." : "A strong alternative for hot days or family trips.",
    };
  }

  return {
    ...common,
    title: isAr ? `يوم ${day.day}: بديل أخف` : `Day ${day.day}: Lighter alternative`,
    focus: isAr ? "نشاط رئيسي واحد + مساحة راحة" : "One anchor activity + breathing room",
    morning: isAr ? `ابدأ في ${day.area} بنشاط واحد واضح بدل أكثر من توقف.` : `Start in ${day.area} with one clear activity instead of multiple stops.`,
    afternoon: isAr ? "غداء قريب ثم راحة أو نشاط داخلي حسب الطقس." : "Nearby lunch, then rest or an indoor stop depending on weather.",
    evening: isAr ? "اختم بعشاء قريب من السكن لتقليل التنقل." : "End with dinner near your stay to reduce transfers.",
    transit: isAr ? "قلل التنقلات واجعل اليوم داخل منطقة واحدة." : "Reduce transfers and keep the day in one area.",
    tip: isAr ? "ريا تستطيع تخصيص هذا البديل أكثر حسب الموسم." : "Rya can tune this alternative further by season.",
  };
}

export function TripPlanner({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const [form, setForm] = useState<FormState>(isAr ? DEFAULT_AR : DEFAULT_EN);
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const currency = isAr ? "SAR" : "USD";

  const canSubmit = useMemo(
    () => form.origin.trim().length > 1 && form.destination.trim().length > 1,
    [form.origin, form.destination],
  );

  async function generatePlan() {
    if (!canSubmit || loading) return;
    setLoading(true);
    setSaved(false);
    setFeedback(null);
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
      logEvent("trip_plan_generated", {
        origin: form.origin,
        destination: form.destination,
        days: form.days,
        travelers: form.travelers,
        tripType: form.tripType,
        budget: form.budget,
      });
    } finally {
      setLoading(false);
    }
  }

  function sendFeedback(value: "up" | "down") {
    if (!plan) return;
    setFeedback(value);
    logEvent("trip_plan_feedback", {
      value,
      destination: plan.destinationName,
      days: plan.days,
      tripType: plan.tripType,
      budgetLevel: plan.budgetLevel,
    });
  }

  function toggleInterest(interest: PlannerInterest) {
    setForm((prev) => {
      const has = prev.interests.includes(interest);
      return {
        ...prev,
        interests: has
          ? prev.interests.filter((item) => item !== interest)
          : [...prev.interests, interest].slice(0, 4),
      };
    });
  }

  function removeDay(dayNumber: number) {
    if (!plan || plan.daysPlan.length <= 1) return;
    const next = renumberDays({
      ...plan,
      daysPlan: plan.daysPlan.filter((day) => day.day !== dayNumber),
      summary: isAr
        ? `${plan.summary} تم تخفيفها بحذف يوم من الجدول داخل الصفحة.`
        : `${plan.summary} Adjusted in-page by removing one itinerary day.`,
    }, isAr);
    setPlan(next);
    setSaved(false);
    logEvent("trip_plan_day_removed", {
      destination: plan.destinationName,
      removedDay: dayNumber,
      remainingDays: next.days,
    });
  }

  function lightenDay(dayNumber: number) {
    if (!plan) return;
    const nextPlan = {
      ...plan,
      daysPlan: plan.daysPlan.map((day) => {
        if (day.day !== dayNumber) return day;
        return {
          ...day,
          focus: isAr ? `${day.focus} بوتيرة أخف` : `${day.focus} at a lighter pace`,
          afternoon: isAr
            ? "اجعل العصر اختيارياً: غداء قريب ثم راحة أو نشاط قصير حسب الطاقة والطقس."
            : "Make the afternoon optional: nearby lunch, then rest or a short stop depending on energy and weather.",
          evening: isAr
            ? "اختم بعشاء قريب من السكن بدون تنقل طويل."
            : "End with dinner near your stay without a long transfer.",
          transit: isAr
            ? "تم تخفيف اليوم: تنقل واحد رئيسي فقط وهامش راحة واضح."
            : "Lightened day: one main transfer and a clear rest buffer.",
          estimatedCost: Math.max(0, Math.round(day.estimatedCost * 0.82)),
          tip: isAr
            ? "هذا النسق مناسب للعائلات أو بعد يوم طويل."
            : "This pace works well for families or after a long day.",
        };
      }),
    };
    setPlan(nextPlan);
    setSaved(false);
    logEvent("trip_plan_day_lightened", {
      destination: plan.destinationName,
      day: dayNumber,
    });
  }

  function swapDay(dayNumber: number) {
    if (!plan) return;
    const nextPlan = {
      ...plan,
      daysPlan: plan.daysPlan.map((day) => (
        day.day === dayNumber ? alternativeForDay(plan, day, isAr) : day
      )),
    };
    setPlan(nextPlan);
    setSaved(false);
    logEvent("trip_plan_day_swapped", {
      destination: plan.destinationName,
      day: dayNumber,
    });
  }

  function ryaUrl(prompt: string) {
    return `/${locale}/search?q=${encodeURIComponent(prompt)}`;
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

          <div>
            <p className="mb-2 text-xs font-medium text-white/45">
              {isAr ? "اهتمامات الرحلة" : "Trip interests"}
            </p>
            <div className="flex flex-wrap gap-2">
              {INTERESTS.map((interest) => {
                const selected = form.interests.includes(interest);
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`rounded-full border px-3 py-1.5 text-xs transition ${
                      selected
                        ? "border-brand-mint/50 bg-brand-mint/10 text-brand-mint"
                        : "border-white/[0.08] bg-white/[0.03] text-white/45 hover:text-white"
                    }`}
                  >
                    {interestLabel(interest, isAr)}
                  </button>
                );
              })}
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
          <a
            href={CHECKOUT_LINKS.planMyTrip}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              logEvent("plan_my_trip_checkout_clicked", {
                locale,
                source: "trip_planner_form",
                provider: "gumroad",
                price: 9.99,
                destination: form.destination,
                origin: form.origin,
              })
            }
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-brand-mint/25 bg-brand-mint/[0.08] px-3 text-center text-xs font-semibold text-brand-mint transition hover:bg-brand-mint/[0.14]"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {isAr ? "اطلب خطة سفر مخصصة بـ $9.99" : "Get a custom trip plan for $9.99"}
          </a>
          <p className="text-center text-[11px] leading-5 text-white/35">
            {isAr
              ? "للمسافر الذي يريد خطة أعمق ومراجعة مخصصة بعد الخطة الذكية."
              : "For travelers who want a deeper custom review after the smart plan."}
          </p>
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

            {plan.bestStayAreas.length > 0 && (
              <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 print:border-black/10 print:bg-white">
                <div className="flex items-center gap-2">
                  <Hotel className="h-4 w-4 text-brand-primary" />
                  <h3 className="text-sm font-semibold text-white/80 print:text-black">
                    {isAr ? "أفضل مناطق السكن لهذه الخطة" : "Best stay areas for this plan"}
                  </h3>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  {plan.bestStayAreas.map((area) => (
                    <p
                      key={area}
                      className="rounded-lg border border-white/[0.06] bg-white/[0.04] px-3 py-2 text-xs leading-5 text-white/60 print:border-black/10 print:bg-black/5 print:text-black/65"
                    >
                      {area}
                    </p>
                  ))}
                </div>
                <p className="mt-3 rounded-lg bg-brand-primary/[0.08] px-3 py-2 text-xs leading-5 text-white/55 print:bg-black/5 print:text-black/65">
                  {plan.hotelDisclosure}
                </p>
              </div>
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              <InfoBlock icon={<Hotel className="h-4 w-4" />} title={isAr ? "السكن" : "Stay"} body={plan.stayAdvice} />
              <InfoBlock icon={<Plane className="h-4 w-4" />} title={isAr ? "الطيران" : "Flights"} body={plan.flightAdvice} />
              <InfoBlock icon={<ShieldCheck className="h-4 w-4" />} title={isAr ? "التأشيرة" : "Visa"} body={plan.visaAdvice} />
              <InfoBlock icon={<Car className="h-4 w-4" />} title={isAr ? "التنقل داخل الوجهة" : "Local transport"} body={plan.localTransportAdvice} />
              <InfoBlock icon={<CloudSun className="h-4 w-4" />} title={isAr ? "الطقس وتوقيت الأنشطة" : "Weather timing"} body={plan.weatherAdvice} />
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
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white/85 print:text-black">
                          {day.title}
                        </p>
                        <p className="mt-1 text-xs leading-5 text-white/40 print:text-black/55">
                          {day.area} · {day.focus}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-white/55 print:bg-black/5 print:text-black/60">
                          <WalletCards className="h-3.5 w-3.5" />
                          {day.estimatedCost.toLocaleString()} {plan.currency}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-white/[0.05] px-2.5 py-1 text-xs text-white/55 print:bg-black/5 print:text-black/60">
                          <Route className="h-3.5 w-3.5" />
                          {day.area}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                      <PlanStep label={isAr ? "الصباح" : "Morning"} value={day.morning} />
                      <PlanStep label={isAr ? "العصر" : "Afternoon"} value={day.afternoon} />
                      <PlanStep label={isAr ? "المساء" : "Evening"} value={day.evening} />
                    </div>
                    <div className="mt-3 grid gap-2 text-xs sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                      <div className="space-y-2">
                        <p className="rounded-lg bg-white/[0.04] px-3 py-2 leading-5 text-white/50 print:bg-black/5 print:text-black/65">
                          {day.transit}
                        </p>
                        <p className="rounded-lg bg-brand-primary/[0.08] px-3 py-2 leading-5 text-white/55 print:bg-black/5 print:text-black/65">
                          {day.tip}
                        </p>
                      </div>
                      <a
                        href={ryaUrl(day.ryaPrompt)}
                        onClick={() => logEvent("trip_plan_rya_followup_clicked", { destination: plan.destinationName, day: day.day })}
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-brand-primary/30 px-3 font-semibold text-brand-primary transition hover:bg-brand-primary/[0.10] print:hidden"
                      >
                        <MessageCircle className="h-4 w-4" />
                        {isAr ? "عدّليه مع ريا" : "Tune with Rya"}
                      </a>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2 print:hidden">
                      <button
                        type="button"
                        onClick={() => swapDay(day.day)}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] px-3 text-xs text-white/55 transition hover:bg-white/[0.06] hover:text-white"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        {isAr ? "بدّل النشاط" : "Swap activity"}
                      </button>
                      <button
                        type="button"
                        onClick={() => lightenDay(day.day)}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] px-3 text-xs text-white/55 transition hover:bg-white/[0.06] hover:text-white"
                      >
                        <Coffee className="h-3.5 w-3.5" />
                        {isAr ? "خفف اليوم" : "Make lighter"}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeDay(day.day)}
                        disabled={plan.daysPlan.length <= 1}
                        className="inline-flex h-9 items-center gap-2 rounded-lg border border-rose-400/20 px-3 text-xs text-rose-200/75 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Scissors className="h-3.5 w-3.5" />
                        {isAr ? "احذف اليوم" : "Remove day"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <ListBlock title={isAr ? "خدمات مناسبة لهذه الرحلة" : "Useful services for this trip"} items={plan.serviceAdvice} />
              <ListBlock title={isAr ? "تجهيزات مهمة" : "Packing notes"} items={plan.packingAdvice} />
              <ListBlock title={isAr ? "الخطوات التالية" : "Next steps"} items={plan.nextSteps} />
              <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 print:hidden">
                <h3 className="text-sm font-semibold text-white/80">
                  {isAr ? "هل الخطة مفيدة؟" : "Was this plan useful?"}
                </h3>
                <p className="mt-2 text-sm leading-6 text-white/45">
                  {isAr
                    ? "تقييمك يساعدنا نعرف هل الخطة أصبحت عملية أم ما زالت عامة."
                    : "Your feedback tells us whether the plan feels practical or still too generic."}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => sendFeedback("up")}
                    className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs ${feedback === "up" ? "border-brand-mint/50 bg-brand-mint/10 text-brand-mint" : "border-white/[0.10] text-white/60 hover:bg-white/[0.06]"}`}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" />
                    {isAr ? "مفيدة" : "Useful"}
                  </button>
                  <button
                    type="button"
                    onClick={() => sendFeedback("down")}
                    className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs ${feedback === "down" ? "border-amber-300/50 bg-amber-300/10 text-amber-200" : "border-white/[0.10] text-white/60 hover:bg-white/[0.06]"}`}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" />
                    {isAr ? "تحتاج تحسين" : "Needs work"}
                  </button>
                </div>
              </div>
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

function InfoBlock({ title, body, icon }: { title: string; body: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 print:border-black/10 print:bg-white">
      <div className="flex items-center gap-2">
        {icon ? <span className="text-brand-primary print:text-black/55">{icon}</span> : null}
        <h3 className="text-sm font-semibold text-white/80 print:text-black">{title}</h3>
      </div>
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
