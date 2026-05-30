"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
  CalendarDays,
  Car,
  Check,
  CloudSun,
  Coffee,
  ExternalLink,
  RefreshCw,
  Scissors,
  Download,
  Hotel,
  Loader2,
  Lock,
  Link2,
  Mail,
  MapPinned,
  MessageCircle,
  Plane,
  Route,
  Save,
  Share2,
  ShieldCheck,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Unlock,
  WalletCards,
  CheckCircle2,
  LogIn,
} from "lucide-react";
import type { Locale } from "@/i18n/config";
import { PLAN_TIERS, type PlanTier, type PlanTierId } from "@/lib/checkout-links";
import { createSupabaseBrowser } from "@/lib/supabase/browser";
import { logEvent } from "@/lib/events";
import type { PlannerTripType, TripPlan, TripPlanDay } from "@/lib/trip-planner";
import { AuthModal } from "@/components/AuthModal";

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
      title:
        nextDay === 1
          ? day.title
          : `${isAr ? `يوم ${nextDay}: ` : `Day ${nextDay}: `}${title}`,
      ryaPrompt: day.ryaPrompt.replace(
        /يوم\s+\d+|day\s+\d+/i,
        isAr ? `يوم ${nextDay}` : `day ${nextDay}`,
      ),
    };
  });
  return { ...plan, days: daysPlan.length, daysPlan };
}

function alternativeForDay(plan: TripPlan, day: TripPlanDay, isAr: boolean): TripPlanDay {
  const code = plan.destinationCode;
  const cost = Math.max(0, Math.round(day.estimatedCost * 0.95));
  const common = { ...day, estimatedCost: cost };

  if (code === "IST") {
    return {
      ...common,
      title: isAr ? `يوم ${day.day}: كاديكوي والجانب الآسيوي` : `Day ${day.day}: Kadikoy and the Asian side`,
      focus: isAr ? "عبّارة + طعام محلي + مشي خفيف" : "Ferry + local food + easy walking",
      area: isAr ? "كاديكوي" : "Kadikoy",
      morning: isAr ? "خذ العبّارة إلى كاديكوي واستمتع بالمشهد بدلاً من الزحام." : "Take the ferry to Kadikoy and enjoy the view instead of traffic.",
      afternoon: isAr ? "غداء محلي ثم مشي في مودا أو شارع بغداد." : "Local lunch, then walk around Moda or Bagdat Street.",
      evening: isAr ? "ارجع بالعبّارة أو عشاء هادئ في كاراكوي." : "Return by ferry or a calm dinner in Karakoy.",
      transit: isAr ? "العبّارة جزء من التجربة، لا مجرد وسيلة." : "The ferry is part of the experience, not just transport.",
      tip: isAr ? "ممتاز لمن يريد إسطنبول أقل سياحية." : "Great for a less touristy Istanbul day.",
    };
  }

  if (code === "DXB") {
    return {
      ...common,
      title: isAr ? `يوم ${day.day}: متاحف وممشى حضري` : `Day ${day.day}: Museums and city walking`,
      focus: isAr ? "متحف المستقبل أو الفهيدي + مساء خفيف" : "Museum of the Future or Al Fahidi + easy evening",
      area: isAr ? "وسط دبي أو الفهيدي" : "Downtown Dubai or Al Fahidi",
      morning: isAr ? "ابدأ بمتحف المستقبل أو حي الفهيدي حسب ميزانيتك." : "Start with Museum of the Future or Al Fahidi depending on budget.",
      afternoon: isAr ? "غداء قريب ثم راحة قصيرة." : "Nearby lunch, then a short rest.",
      evening: isAr ? "ممشى سيتي ووك أو دبي مول." : "City Walk or Dubai Mall.",
      transit: isAr ? "المترو عملي إذا سكنك قريب من محطة." : "Metro works well if your stay is near a station.",
      tip: isAr ? "بديل جيد للأيام الحارة أو للعائلات." : "A strong alternative for hot days or families.",
    };
  }

  return {
    ...common,
    title: isAr ? `يوم ${day.day}: بديل أخف` : `Day ${day.day}: Lighter alternative`,
    focus: isAr ? "نشاط رئيسي واحد + مساحة راحة" : "One anchor activity + breathing room",
    morning: isAr ? `ابدأ في ${day.area} بنشاط واحد واضح.` : `Start in ${day.area} with one clear activity.`,
    afternoon: isAr ? "غداء قريب ثم راحة أو نشاط داخلي." : "Nearby lunch, then rest or an indoor stop.",
    evening: isAr ? "عشاء قريب من السكن." : "Dinner near your stay.",
    transit: isAr ? "قلل التنقلات واجعل اليوم داخل منطقة واحدة." : "Reduce transfers and keep the day in one area.",
    tip: isAr ? "ريا تستطيع تخصيص هذا البديل أكثر حسب الموسم." : "Rya can tune this alternative further by season.",
  };
}

// ---------- Paywall overlay component ----------
function PaywallBanner({ isAr, gumroadUrl, price }: { isAr: boolean; gumroadUrl: string; price: number }) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-brand-primary/30 bg-gradient-to-b from-brand-primary/10 to-brand-primary/5 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-primary/20">
        <Lock className="h-6 w-6 text-brand-primary" />
      </div>
      <div>
        <h3 className="font-display text-lg font-bold text-white">
          {isAr ? "باقي الخطة محجوب" : "Rest of the plan is locked"}
        </h3>
        <p className="mt-2 max-w-sm text-sm leading-6 text-white/55">
          {isAr
            ? "اشتر الخطة الكاملة المولّدة بالذكاء الاصطناعي لأي مدينة في العالم — تشمل كل الأيام، التأشيرة، التعبئة، والخطوات التالية."
            : "Get your full AI-generated plan for any city — all days, visa notes, packing tips, and next steps."}
        </p>
      </div>
      <a
        href={gumroadUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.02] hover:shadow-brand-primary/30"
        onClick={() =>
          logEvent("plan_paywall_purchase_clicked", { source: "paywall_banner", price })
        }
      >
        <Sparkles className="h-4 w-4" />
        {isAr ? `احصل على الخطة الكاملة — $${price}` : `Get full plan — $${price}`}
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}

// ---------- Unlock form component ----------
function UnlockForm({
  isAr,
  form,
  prefillEmail,
  onUnlock,
}: {
  isAr: boolean;
  form: FormState;
  prefillEmail?: string;
  onUnlock: (email: string) => Promise<void>;
}) {
  const [email, setEmail] = useState(prefillEmail ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const isSessionEmail = Boolean(prefillEmail);

  // Sync if the session email loads after mount
  useEffect(() => {
    if (prefillEmail && !email) setEmail(prefillEmail);
  }, [prefillEmail, email]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.includes("@")) {
      setError(isAr ? "أدخل بريدًا إلكترونيًا صحيحًا" : "Enter a valid email address");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await onUnlock(email);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "";
      if (msg === "purchase_not_found") {
        setError(
          isAr
            ? "لم نجد عملية شراء بهذا البريد. تأكد من البريد المستخدم في Gumroad."
            : "No purchase found for this email. Make sure it matches your Gumroad receipt.",
        );
      } else if (msg === "limit_reached") {
        setError(
          isAr
            ? "استنفدت خططك الـ3 المدفوعة. اشترِ الباقة مجدداً للحصول على 3 خطط إضافية."
            : "You've used all 3 plans in your package. Purchase again to get 3 more.",
        );
      } else {
        setError(isAr ? "حدث خطأ. حاول مرة أخرى." : "Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-brand-mint/20 bg-brand-mint/[0.04] p-6">
      <div className="flex items-center gap-3">
        <Unlock className="h-5 w-5 text-brand-mint" />
        <h3 className="font-semibold text-white">
          {isAr ? "فتح الخطة الكاملة" : "Unlock your full plan"}
        </h3>
      </div>
      {isSessionEmail ? (
        <p className="mt-2 text-sm leading-6 text-white/50">
          {isAr
            ? `سنتحقق من شرائك للخطة باستخدام بريد حسابك: ${prefillEmail}`
            : `We'll verify your purchase using your account email: ${prefillEmail}`}
        </p>
      ) : (
        <p className="mt-2 text-sm leading-6 text-white/50">
          {isAr
            ? "أدخل البريد الإلكتروني الذي استخدمته في Gumroad لفتح خطتك."
            : "Enter the email you used on Gumroad to unlock your AI-generated plan."}
        </p>
      )}
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3 sm:flex-row">
        {!isSessionEmail && (
          <div className="relative flex-1">
            <Mail className="absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isAr ? "بريدك الإلكتروني في Gumroad" : "Your Gumroad email"}
              className="planner-input ps-9"
              disabled={loading}
            />
          </div>
        )}
        <button
          type="submit"
          disabled={loading || !email}
          className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-mint/20 px-5 text-sm font-semibold text-brand-mint transition hover:bg-brand-mint/30 disabled:cursor-not-allowed disabled:opacity-50 ${isSessionEmail ? "w-full" : ""}`}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Unlock className="h-4 w-4" />}
          {isAr ? "فتح الخطة" : "Unlock plan"}
        </button>
      </form>
      {error && (
        <p className="mt-3 text-xs text-rose-300">{error}</p>
      )}
    </div>
  );
}

const PLAN_FORM_KEY = "gtripza_plan_form";

export function TripPlanner({ locale }: { locale: Locale }) {
  const isAr = locale === "ar";
  const searchParams = useSearchParams();
  const isPurchased  = searchParams?.get("purchased") === "1";
  const emailParam   = searchParams?.get("email") ?? "";

  const [form, setForm] = useState<FormState>(isAr ? DEFAULT_AR : DEFAULT_EN);
  const [plan, setPlan] = useState<TripPlan | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);
  const [unlockLoading, setUnlockLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [selectedTier, setSelectedTier] = useState<PlanTierId>("standard");
  const [plansRemaining, setPlansRemaining] = useState<number | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [sessionEmail, setSessionEmail] = useState(emailParam);
  const unlockRef = useRef<HTMLDivElement>(null);
  const currency = isAr ? "SAR" : "USD";

  const currentTier = PLAN_TIERS.find((t) => t.id === selectedTier) ?? PLAN_TIERS[1];

  const canSubmit = useMemo(
    () => form.origin.trim().length > 1 && form.destination.trim().length > 1,
    [form.origin, form.destination],
  );

  // Restore saved form + scroll to unlock section when returning from Gumroad
  useEffect(() => {
    if (!isPurchased) return;
    try {
      const saved = sessionStorage.getItem(PLAN_FORM_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<FormState>;
        setForm((prev) => ({ ...prev, ...parsed }));
        sessionStorage.removeItem(PLAN_FORM_KEY);
      }
    } catch { /* ignore */ }
    // Give React time to render the plan preview, then scroll to unlock
    const t = setTimeout(() => {
      unlockRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 600);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPurchased]);

  // Load session and listen for auth state changes (handles OAuth redirect return)
  useEffect(() => {
    const supabase = createSupabaseBrowser();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.email) setSessionEmail(data.session.user.email);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSessionEmail(session?.user?.email ?? "");
      if (event === "SIGNED_IN" && session?.user?.email) {
        const pending = sessionStorage.getItem("gotripza_plan_pending_url");
        if (pending) {
          sessionStorage.removeItem("gotripza_plan_pending_url");
          window.open(pending, "_blank");
        }
        setShowAuthModal(false);
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  async function handlePurchaseClick(tier: PlanTier) {
    logEvent("plan_paywall_purchase_clicked", { tier: tier.id, price: tier.price, source: "tier_card" });
    // Save form so we can restore it when the user returns from Gumroad
    try { sessionStorage.setItem(PLAN_FORM_KEY, JSON.stringify(form)); } catch { /* ignore */ }
    const supabase = createSupabaseBrowser();
    const { data } = await supabase.auth.getSession();
    if (data.session) {
      window.open(tier.gumroadUrl, "_blank");
    } else {
      sessionStorage.setItem("gotripza_plan_pending_url", tier.gumroadUrl);
      setShowAuthModal(true);
    }
  }

  async function generatePlan() {
    if (!canSubmit || loading) return;
    setLoading(true);
    setSaved(false);
    setFeedback(null);
    setSaveMessage("");
    setPlan(null);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, locale, currency }),
      });
      const json = (await res.json()) as { plan?: TripPlan; isPreview?: boolean; error?: string };
      if (!res.ok || !json.plan) throw new Error(json.error ?? "plan_failed");
      setPlan(json.plan);
      setIsPreview(json.isPreview ?? false);
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

  async function unlockPlan(email: string) {
    setUnlockLoading(true);
    try {
      const res = await fetch("/api/plan/unlock", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, locale, currency, email }),
      });
      const json = (await res.json()) as {
        plan?: TripPlan;
        error?: string;
        remaining?: number;
        used?: number;
        limit?: number;
      };
      if (!res.ok || !json.plan) {
        throw new Error(json.error ?? "unlock_failed");
      }
      setPlan(json.plan);
      setIsPreview(false);
      if (typeof json.remaining === "number") setPlansRemaining(json.remaining);
      logEvent("trip_plan_unlocked", {
        destination: form.destination,
        days: form.days,
        tripType: form.tripType,
        remaining: json.remaining,
      });
    } finally {
      setUnlockLoading(false);
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
    const next = renumberDays(
      {
        ...plan,
        daysPlan: plan.daysPlan.filter((day) => day.day !== dayNumber),
        summary: isAr
          ? `${plan.summary} تم تخفيفها بحذف يوم من الجدول.`
          : `${plan.summary} Adjusted by removing one itinerary day.`,
      },
      isAr,
    );
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
            ? "اجعل العصر اختيارياً: غداء قريب ثم راحة أو نشاط قصير."
            : "Make the afternoon optional: nearby lunch, then rest or a short stop.",
          evening: isAr
            ? "اختم بعشاء قريب من السكن."
            : "End with dinner near your stay.",
          transit: isAr
            ? "تم تخفيف اليوم: تنقل واحد رئيسي فقط."
            : "Lightened day: one main transfer only.",
          estimatedCost: Math.max(0, Math.round(day.estimatedCost * 0.82)),
          tip: isAr
            ? "هذا النسق مناسب للعائلات أو بعد يوم طويل."
            : "This pace works well for families or after a long day.",
        };
      }),
    };
    setPlan(nextPlan);
    setSaved(false);
    logEvent("trip_plan_day_lightened", { destination: plan.destinationName, day: dayNumber });
  }

  function swapDay(dayNumber: number) {
    if (!plan) return;
    const nextPlan = {
      ...plan,
      daysPlan: plan.daysPlan.map((day) =>
        day.day === dayNumber ? alternativeForDay(plan, day, isAr) : day,
      ),
    };
    setPlan(nextPlan);
    setSaved(false);
    logEvent("trip_plan_day_swapped", { destination: plan.destinationName, day: dayNumber });
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
        setSaveMessage(
          isAr
            ? "حفظناها على هذا الجهاز. سجّل الدخول لحفظها في حسابك."
            : "Saved on this device. Sign in to save it to your account.",
        );
        return;
      }
      if (!res.ok) throw new Error("save_failed");
      setSaved(true);
      setSaveMessage(isAr ? "تم حفظ الخطة في حسابك." : "Saved to your account.");
    } catch {
      setSaved(true);
      setSaveMessage(
        isAr ? "حفظناها على هذا الجهاز مؤقتاً." : "Saved on this device only for now.",
      );
    }
  }

  async function downloadPDF() {
    if (!plan) return;
    try {
      // Dynamic import — keeps bundle small (PDF lib is large)
      const [{ pdf }, { TripPlanDocument }] = await Promise.all([
        import("@react-pdf/renderer"),
        import("@/components/TripPlanPDF"),
      ]);
      const blob = await pdf(<TripPlanDocument plan={plan} isAr={isAr} />).toBlob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `gotripza-${plan.destinationName.replace(/\s+/g, "-").toLowerCase()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      logEvent("trip_plan_pdf_downloaded", { destination: plan.destinationName, days: plan.days });
    } catch (err) {
      console.error("[PDF] generation failed:", err);
      // Fallback to print dialog
      window.print();
    }
  }

  function printPlan() {
    downloadPDF();
  }

  function buildShareData(currentPlan: TripPlan) {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";
    const pageUrl = `${appUrl}/${locale}/plan`;
    const text = isAr
      ? `خطة رحلتي إلى ${currentPlan.destinationName} لـ ${currentPlan.days} أيام ✈️\nمولّدة بالذكاء الاصطناعي من ريا — GoTripza`
      : `My ${currentPlan.days}-day trip plan to ${currentPlan.destinationName} ✈️\nAI-generated by Rya — GoTripza`;
    return { pageUrl, text };
  }

  async function copyLink() {
    if (!plan) return;
    const { pageUrl } = buildShareData(plan);
    try {
      await navigator.clipboard.writeText(pageUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  async function nativeShare() {
    if (!plan) return;
    const { pageUrl, text } = buildShareData(plan);
    try {
      await navigator.share({ title: `Rya — ${plan.destinationName}`, text, url: pageUrl });
    } catch {
      /* user cancelled or not supported */
    }
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 lg:grid-cols-[420px_minmax(0,1fr)]">
      {/* ── Form panel ── */}
      <section className="h-fit rounded-2xl border border-white/[0.08] bg-white/[0.04] p-5">
        <div className="mb-5">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-primary/20 bg-brand-primary/[0.08] px-3 py-1 text-xs font-semibold text-brand-primary">
            <Sparkles className="h-3.5 w-3.5" />
            {isAr ? "خطة مدعومة بالذكاء الاصطناعي" : "AI-Powered Trip Plan"}
          </p>
          <h1 className="mt-3 font-display text-2xl font-bold text-white">
            {isAr ? "ابن خطتك في دقيقة" : "Build your plan in a minute"}
          </h1>
          <p className="mt-2 text-sm leading-6 text-white/45">
            {isAr
              ? "معاينة مجانية ليوم واحد — الخطة الكاملة بكل المدن والأيام مقابل $9.99."
              : "Free one-day preview — unlock the full AI plan for any city for $9.99."}
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
            <Field
              label={isAr ? `الأيام (1–14)` : `Days (1–14)`}
              icon={<CalendarDays className="h-4 w-4" />}
            >
              <input
                type="number"
                min={1}
                max={14}
                value={form.days}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    days: Math.min(14, Math.max(1, Number(e.target.value))),
                  }))
                }
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

          <Field
            label={isAr ? `الميزانية (${currency})` : `Budget (${currency})`}
            icon={<WalletCards className="h-4 w-4" />}
          >
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
            {isAr ? "عاين اليوم الأول مجاناً" : "Preview day 1 for free"}
          </button>

          {/* ── 3 plans package ── */}
          <div className="rounded-xl border border-brand-primary/20 bg-brand-primary/[0.06] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-white">
                  {isAr ? "باقة 3 خطط — $9.99" : "3-plan package — $9.99"}
                </p>
                <p className="mt-1 text-xs leading-5 text-white/50">
                  {isAr
                    ? "اشتر مرة واحدة واحصل على 3 خطط كاملة — أي وجهة، أي مدة، باختيارك."
                    : "Buy once and get 3 full plans — any destination, any duration, your choice."}
                </p>
              </div>
              <span className="flex-shrink-0 rounded-full border border-brand-mint/30 bg-brand-mint/10 px-2.5 py-1 text-xs font-bold text-brand-mint">
                $9.99
              </span>
            </div>

            {/* 3 dots — visual */}
            <div className="mt-3 flex items-center gap-2">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="flex h-8 flex-1 items-center justify-center rounded-lg border border-brand-primary/25 bg-brand-primary/10 text-xs font-semibold text-brand-primary"
                >
                  {isAr ? `خطة ${n}` : `Plan ${n}`}
                </div>
              ))}
            </div>

            <ul className="mt-3 space-y-1.5">
              {(isAr
                ? [
                    "أي وجهة في العالم",
                    "أي عدد أيام تختاره",
                    "جدول يومي بأماكن حقيقية",
                    "تأشيرة، سكن، تجهيزات، وخطوات تالية",
                  ]
                : [
                    "Any destination worldwide",
                    "Any number of days you choose",
                    "Daily schedule with real named places",
                    "Visa, stay, packing & next steps",
                  ]
              ).map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-white/55">
                  <CheckCircle2 className="h-3 w-3 flex-shrink-0 text-brand-mint/70" />
                  {f}
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => void handlePurchaseClick(currentTier)}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-primary to-violet-600 text-sm font-semibold text-white shadow-lg transition hover:scale-[1.01]"
            >
              {sessionEmail ? (
                <>
                  <WalletCards className="h-4 w-4" />
                  {isAr ? "احصل على الباقة — $9.99" : "Get the package — $9.99"}
                  <ExternalLink className="h-3.5 w-3.5" />
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  {isAr ? "سجّل الدخول واشترِ — $9.99" : "Sign in & buy — $9.99"}
                </>
              )}
            </button>
          </div>

          <p className="text-center text-[11px] leading-5 text-white/35">
            {isAr
              ? "بعد الشراء في Gumroad، أدخل بريدك أدناه لفتح الخطة فوراً."
              : "After purchasing on Gumroad, enter your email below to unlock instantly."}
          </p>
        </div>
      </section>

      {/* ── Results panel ── */}
      <section className="min-w-0 rounded-2xl border border-white/[0.08] bg-white/[0.03] p-5 print:border-0 print:bg-white print:text-black">
        {!plan ? (
          <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
            <Sparkles className="h-10 w-10 text-brand-primary/70" />
            <p className="mt-4 max-w-md text-sm leading-6 text-white/45">
              {isAr
                ? "ستظهر هنا معاينة اليوم الأول مع ملخص الميزانية. الخطة الكاملة تتطلب الفتح."
                : "Day 1 preview and budget summary will appear here. Full plan requires unlock."}
            </p>
          </div>
        ) : (
          <div id="trip-plan-print" className="space-y-6">
            {/* ── Print-only branded header ── */}
            <div className="hidden print:flex print:items-center print:justify-between print:border-b print:border-black/10 print:pb-6 print:mb-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/rya/rya-logo-horizontal-light.png"
                alt="Rya by GoTripza"
                className="h-10 object-contain"
              />
              <div className="text-end">
                <p className="text-xs font-semibold text-[#060A13]">
                  {isAr ? "خطة رحلتك الشخصية" : "Your personalized trip plan"}
                </p>
                <p className="text-xs text-black/40">gotripza.com/plan</p>
              </div>
            </div>

            {/* Header */}
            <div className="grid gap-3 border-b border-white/[0.08] pb-5 print:border-black/10 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-primary">
                    GoTripza
                  </p>
                  {isPreview && (
                    <span className="rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-0.5 text-[10px] font-semibold text-amber-300">
                      {isAr ? "معاينة" : "Preview"}
                    </span>
                  )}
                </div>
                <h2 className="mt-2 font-display text-2xl font-bold text-white print:text-black">
                  {plan.destinationName}
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/55 print:text-black/65">
                  {plan.summary}
                </p>
              </div>
              {!isPreview && (
                <div className="flex gap-2 print:hidden">
                  <button
                    type="button"
                    onClick={savePlan}
                    className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/[0.10] px-3 text-xs text-white/65 hover:bg-white/[0.06]"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {saved ? (isAr ? "تم الحفظ" : "Saved") : isAr ? "حفظ" : "Save"}
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
              )}
              {saveMessage && (
                <p className="text-xs text-brand-mint print:hidden sm:col-span-2 sm:text-end">
                  {saveMessage}
                </p>
              )}
            </div>

            {/* Budget metrics — always visible */}
            <div className="grid gap-3 sm:grid-cols-3">
              <PlanMetric
                label={isAr ? "الميزانية اليومية" : "Daily budget"}
                value={`${plan.estimatedDailyBudget.toLocaleString()} ${plan.currency}`}
              />
              <PlanMetric
                label={isAr ? "تقييم الميزانية" : "Budget fit"}
                value={budgetLabel(plan.budgetLevel, isAr)}
              />
              <PlanMetric
                label={isAr ? "نوع الرحلة" : "Trip type"}
                value={typeLabel(plan.tripType, isAr)}
              />
            </div>

            {/* Best stay areas — always visible */}
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

            {/* Budget breakdown — always visible */}
            <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 print:border-black/10 print:bg-white">
              <h3 className="text-sm font-semibold text-white/80 print:text-black">
                {isAr ? "توزيع الميزانية" : "Budget split"}
              </h3>
              <div className="mt-3 space-y-2">
                {plan.costBreakdown.map((item) => (
                  <div key={item.label} className="flex justify-between text-sm">
                    <span className="text-white/45 print:text-black/55">{item.label}</span>
                    <span className="font-medium text-white/75 print:text-black">
                      {item.amount.toLocaleString()} {plan.currency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Day 1 — always visible */}
            <div>
              <h3 className="mb-3 text-sm font-semibold text-white/80 print:text-black">
                {isAr ? "الجدول اليومي" : "Daily itinerary"}
              </h3>
              <div className="space-y-3">
                {plan.daysPlan.map((day) => (
                  <DayCard
                    key={day.day}
                    day={day}
                    plan={plan}
                    isAr={isAr}
                    onSwap={swapDay}
                    onLighten={lightenDay}
                    onRemove={removeDay}
                    canRemove={plan.daysPlan.length > 1}
                    ryaUrl={ryaUrl}
                  />
                ))}
              </div>
            </div>

            {/* ── Share bar ── */}
            <ShareBar
              plan={plan}
              isAr={isAr}
              locale={locale}
              copied={copied}
              onCopy={copyLink}
              onNativeShare={nativeShare}
            />

            {/* ── PAYWALL GATE ── */}
            {isPreview && (
              <div className="space-y-4 print:hidden">
                {/* Locked days teaser */}
                {plan.days > 1 && (
                  <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-black/20">
                    <div className="pointer-events-none select-none p-4 blur-sm">
                      <p className="text-sm font-semibold text-white/85">
                        {isAr ? `يوم 2: ...` : `Day 2: ...`}
                      </p>
                      <p className="mt-1 text-xs text-white/40">
                        {isAr ? "منطقة محددة · نشاط محدد" : "Specific area · Specific activity"}
                      </p>
                      <div className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
                        <div><p className="text-xs font-semibold text-brand-primary">{isAr ? "الصباح" : "Morning"}</p><p className="mt-1 text-xs text-white/55">━━━━━━━━━━━━</p></div>
                        <div><p className="text-xs font-semibold text-brand-primary">{isAr ? "العصر" : "Afternoon"}</p><p className="mt-1 text-xs text-white/55">━━━━━━━━━━━━</p></div>
                        <div><p className="text-xs font-semibold text-brand-primary">{isAr ? "المساء" : "Evening"}</p><p className="mt-1 text-xs text-white/55">━━━━━━━━━━━━</p></div>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs text-white/70">
                        <Lock className="h-3.5 w-3.5" />
                        {isAr
                          ? `${plan.days - 1} أيام إضافية مقفلة`
                          : `${plan.days - 1} more days locked`}
                      </div>
                    </div>
                  </div>
                )}

                {/* Locked extras teaser */}
                <div className="relative overflow-hidden rounded-xl border border-white/[0.06] bg-black/20">
                  <div className="pointer-events-none grid select-none gap-4 p-4 blur-sm lg:grid-cols-2">
                    <div><p className="text-sm font-semibold text-white/80">{isAr ? "التأشيرة" : "Visa"}</p><p className="mt-1 text-xs text-white/40">━━━━━━━━━━━━━━━━━━━━━━</p></div>
                    <div><p className="text-sm font-semibold text-white/80">{isAr ? "التنقل المحلي" : "Local transport"}</p><p className="mt-1 text-xs text-white/40">━━━━━━━━━━━━━━━━━━━━━━</p></div>
                    <div><p className="text-sm font-semibold text-white/80">{isAr ? "تجهيزات مهمة" : "Packing notes"}</p><p className="mt-1 text-xs text-white/40">━━━━━━━━━━━━━━━━━━━━━━</p></div>
                    <div><p className="text-sm font-semibold text-white/80">{isAr ? "الخطوات التالية" : "Next steps"}</p><p className="mt-1 text-xs text-white/40">━━━━━━━━━━━━━━━━━━━━━━</p></div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs text-white/70">
                      <Lock className="h-3.5 w-3.5" />
                      {isAr ? "مقفل — يتطلب الشراء" : "Locked — requires purchase"}
                    </div>
                  </div>
                </div>

                {/* Purchase banner */}
                <PaywallBanner isAr={isAr} gumroadUrl={currentTier.gumroadUrl} price={currentTier.price} />

                {/* ── Post-purchase success banner (shown when returning from Gumroad) ── */}
                {isPurchased && (
                  <div
                    className="flex items-start gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3"
                    dir={isAr ? "rtl" : "ltr"}
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                    <p className="text-sm leading-relaxed text-emerald-300/90">
                      {isAr
                        ? "تم الشراء بنجاح ✅ — أدخل بريدك الإلكتروني أدناه لاستلام خطتك فوراً."
                        : "Purchase confirmed ✅ — enter your email below to unlock your plan instantly."}
                    </p>
                  </div>
                )}

                {/* Unlock form */}
                <div ref={unlockRef}>
                  <UnlockForm
                    isAr={isAr}
                    form={form}
                    prefillEmail={sessionEmail || undefined}
                    onUnlock={unlockPlan}
                  />
                </div>

                {unlockLoading && (
                  <div className="flex items-center justify-center gap-2 py-4 text-sm text-white/50">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isAr ? "جارٍ توليد خطتك بالذكاء الاصطناعي..." : "Generating your AI plan..."}
                  </div>
                )}
              </div>
            )}

            {/* ── Remaining plans badge (shown after unlock) ── */}
            {!isPreview && plansRemaining !== null && (
              <div className="flex items-center justify-between rounded-xl border border-brand-mint/20 bg-brand-mint/[0.05] px-4 py-3 print:hidden">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`h-2.5 w-2.5 rounded-full ${
                          i < plansRemaining ? "bg-brand-mint" : "bg-white/10"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-semibold text-brand-mint">
                    {isAr
                      ? `تبقى لك ${plansRemaining} ${plansRemaining === 1 ? "خطة" : plansRemaining === 2 ? "خطتان" : "خطط"} من باقتك`
                      : `${plansRemaining} plan${plansRemaining !== 1 ? "s" : ""} remaining in your package`}
                  </p>
                </div>
                {plansRemaining > 0 && (
                  <button
                    type="button"
                    onClick={() => { setPlan(null); setIsPreview(false); setSaved(false); }}
                    className="text-xs font-semibold text-brand-primary hover:underline"
                  >
                    {isAr ? "ولّد خطة جديدة ←" : "← New plan"}
                  </button>
                )}
              </div>
            )}

            {/* ── FULL PLAN (unlocked) ── */}
            {!isPreview && (
              <div className="space-y-6 print:space-y-4">
                {/* All days extra info */}
                <div className="grid gap-4 lg:grid-cols-2">
                  <InfoBlock icon={<Hotel className="h-4 w-4" />} title={isAr ? "السكن" : "Stay"} body={plan.stayAdvice} />
                  <InfoBlock icon={<Plane className="h-4 w-4" />} title={isAr ? "الطيران" : "Flights"} body={plan.flightAdvice} />
                  <InfoBlock icon={<ShieldCheck className="h-4 w-4" />} title={isAr ? "التأشيرة" : "Visa"} body={plan.visaAdvice} />
                  <InfoBlock icon={<Car className="h-4 w-4" />} title={isAr ? "التنقل داخل الوجهة" : "Local transport"} body={plan.localTransportAdvice} />
                  <InfoBlock icon={<CloudSun className="h-4 w-4" />} title={isAr ? "الطقس وتوقيت الأنشطة" : "Weather timing"} body={plan.weatherAdvice} />
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  <ListBlock title={isAr ? "خدمات مناسبة لهذه الرحلة" : "Useful services for this trip"} items={plan.serviceAdvice} />
                  <ListBlock title={isAr ? "تجهيزات مهمة" : "Packing notes"} items={plan.packingAdvice} />
                  <ListBlock title={isAr ? "الخطوات التالية" : "Next steps"} items={plan.nextSteps} />

                  {/* Feedback */}
                  <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 print:hidden">
                    <h3 className="text-sm font-semibold text-white/80">
                      {isAr ? "هل الخطة مفيدة؟" : "Was this plan useful?"}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-white/45">
                      {isAr
                        ? "تقييمك يساعدنا نحسّن جودة الخطط."
                        : "Your feedback helps us improve plan quality."}
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
          </div>
        )}
      </section>
      {/* ── Auth modal (shown when user clicks buy without being signed in) ── */}
      <AuthModal
        open={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        locale={locale}
        nextPath={`/${locale}/plan`}
        title={isAr ? "سجّل الدخول للمتابعة" : "Sign in to continue"}
        description={
          isAr
            ? "سجّل الدخول لشراء خطتك — ستُعاد إلى هذه الصفحة تلقائياً بعد الدفع."
            : "Sign in to purchase your plan — you'll be redirected back here after payment."
        }
      />
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function DayCard({
  day,
  plan,
  isAr,
  onSwap,
  onLighten,
  onRemove,
  canRemove,
  ryaUrl,
}: {
  day: TripPlanDay;
  plan: TripPlan;
  isAr: boolean;
  onSwap: (n: number) => void;
  onLighten: (n: number) => void;
  onRemove: (n: number) => void;
  canRemove: boolean;
  ryaUrl: (prompt: string) => string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4 print:border-black/10 print:bg-white">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-white/85 print:text-black">{day.title}</p>
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
          onClick={() => onSwap(day.day)}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] px-3 text-xs text-white/55 transition hover:bg-white/[0.06] hover:text-white"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          {isAr ? "بدّل النشاط" : "Swap activity"}
        </button>
        <button
          type="button"
          onClick={() => onLighten(day.day)}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/[0.08] px-3 text-xs text-white/55 transition hover:bg-white/[0.06] hover:text-white"
        >
          <Coffee className="h-3.5 w-3.5" />
          {isAr ? "خفف اليوم" : "Make lighter"}
        </button>
        <button
          type="button"
          onClick={() => onRemove(day.day)}
          disabled={!canRemove}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-rose-400/20 px-3 text-xs text-rose-200/75 transition hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Scissors className="h-3.5 w-3.5" />
          {isAr ? "احذف اليوم" : "Remove day"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
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

function InfoBlock({
  title,
  body,
  icon,
}: {
  title: string;
  body: string;
  icon?: React.ReactNode;
}) {
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
      <p className="mt-1 text-sm leading-6 text-white/55 print:text-black/65">{value}</p>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
      <path d="M12 0C5.374 0 0 5.373 0 12c0 2.117.549 4.107 1.508 5.845L.057 23.032a.75.75 0 0 0 .921.921l5.188-1.451A11.938 11.938 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.75 9.75 0 0 1-4.965-1.357l-.356-.211-3.68 1.029 1.028-3.68-.211-.356A9.75 9.75 0 1 1 12 21.75z"/>
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.912-5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  );
}

function ShareBar({
  plan,
  isAr,
  locale,
  copied,
  onCopy,
  onNativeShare,
}: {
  plan: TripPlan;
  isAr: boolean;
  locale: string;
  copied: boolean;
  onCopy: () => void;
  onNativeShare: () => void;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";
  const pageUrl = `${appUrl}/${locale}/plan`;
  const text = isAr
    ? `خطة رحلتي إلى ${plan.destinationName} لـ ${plan.days} أيام ✈️\nمولّدة بالذكاء الاصطناعي من ريا — GoTripza`
    : `My ${plan.days}-day trip plan to ${plan.destinationName} ✈️\nAI-generated by Rya — GoTripza`;
  const encoded = encodeURIComponent(`${text}\n${pageUrl}`);
  const urlEncoded = encodeURIComponent(pageUrl);
  const textEncoded = encodeURIComponent(text);

  const hasNativeShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-xl border border-white/[0.06] bg-black/20 p-4 print:hidden">
      <div className="flex items-center gap-1.5 me-1">
        <Share2 className="h-3.5 w-3.5 text-white/35" />
        <p className="text-xs font-semibold text-white/45">
          {isAr ? "شارك الخطة" : "Share plan"}
        </p>
      </div>

      {/* WhatsApp */}
      <a
        href={`https://wa.me/?text=${encoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-xs text-[#25D366] transition hover:bg-[#25D366]/10 hover:border-[#25D366]/30"
        onClick={() => logEvent("trip_plan_feedback", { action: "share_whatsapp", destination: plan.destinationName })}
      >
        <WhatsAppIcon />
        WhatsApp
      </a>

      {/* X / Twitter */}
      <a
        href={`https://twitter.com/intent/tweet?text=${textEncoded}&url=${urlEncoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-xs text-white/70 transition hover:bg-white/[0.08] hover:text-white"
        onClick={() => logEvent("trip_plan_feedback", { action: "share_x", destination: plan.destinationName })}
      >
        <XIcon />X
      </a>

      {/* Telegram */}
      <a
        href={`https://t.me/share/url?url=${urlEncoded}&text=${textEncoded}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-xs text-[#2AABEE] transition hover:bg-[#2AABEE]/10 hover:border-[#2AABEE]/30"
        onClick={() => logEvent("trip_plan_feedback", { action: "share_telegram", destination: plan.destinationName })}
      >
        <TelegramIcon />
        Telegram
      </a>

      {/* Native share (mobile) */}
      {hasNativeShare && (
        <button
          type="button"
          onClick={onNativeShare}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 text-xs text-white/60 transition hover:bg-white/[0.08]"
        >
          <Share2 className="h-3.5 w-3.5" />
          {isAr ? "مشاركة" : "More"}
        </button>
      )}

      {/* Copy link */}
      <button
        type="button"
        onClick={onCopy}
        className={`inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs transition ${
          copied
            ? "border-brand-mint/40 bg-brand-mint/10 text-brand-mint"
            : "border-white/[0.08] bg-white/[0.04] text-white/55 hover:bg-white/[0.08]"
        }`}
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied
          ? isAr ? "تم النسخ ✓" : "Copied ✓"
          : isAr ? "نسخ الرابط" : "Copy link"}
      </button>
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
