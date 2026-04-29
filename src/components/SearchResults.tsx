"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  Hotel as HotelIcon,
  Star,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Clock,
  ExternalLink,
  TrendingDown,
  Award,
  Zap,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  MapPin,
  Thermometer,
  Stamp,
  Shirt,
  Calendar,
  DollarSign,
  TrendingUp,
  MessageCircleQuestion,
  Car,
  Compass,
} from "lucide-react";
import { useSearch } from "./search/SearchContext";
import { logEvent } from "@/lib/events";
import { trackClick } from "@/lib/trackClick";
import { OffersJsonLd } from "./JsonLd";
import { SearchSkeleton } from "./SearchSkeleton";
import { formatPrice } from "@/lib/utils";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { FlightOffer, HotelOffer } from "@/lib/travelpayouts";
import type { BudgetVerdict, ConfidenceScore, DestinationIntel } from "@/lib/gemini";

export function SearchResults({ dict }: { dict: Dictionary }) {
  const { status, data, error } = useSearch();

  return (
    <section id="results" className="relative scroll-mt-24">
      <AnimatePresence mode="wait">
        {status === "loading" && <SearchSkeleton key="l" />}
        {status === "error" && <ErrorState key="e" message={error ?? dict.errors.parse} />}
        {status === "ready" && data && (
          <ReadyState key="r" dict={dict} data={data} />
        )}
      </AnimatePresence>
    </section>
  );
}


function ErrorState({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-6xl px-6 pb-20"
    >
      <div className="glass flex items-center gap-3 rounded-3xl p-6 text-sm text-rose-300">
        <AlertTriangle className="h-5 w-5 shrink-0" />
        <span>{message}</span>
      </div>
    </motion.div>
  );
}

function ReadyState({
  dict,
  data,
}: {
  dict: Dictionary;
  data: {
    intent: import("@/lib/gemini").TripIntent;
    flights: FlightOffer[];
    hotels: HotelOffer[];
    mock: boolean;
    locale: "ar" | "en";
    message: string;
    tips: string | null;
    wants: ("flights" | "hotels")[];
    followup: string | null;
    currency: import("@/lib/utils").Currency;
    flightSearchUrl: string;
    hotelSearchUrl: string;
    budget_verdict: BudgetVerdict | null;
    confidence: ConfidenceScore | null;
    destination_intel: DestinationIntel | null;
    clarification_needed: boolean;
    clarification_question: string | null;
  };
}) {
  const { reveal, dismissFollowup } = useSearch();
  const flightSearchUrl = data.flightSearchUrl;
  const hotelSearchUrl = data.hotelSearchUrl;

  const isAr = data.locale === "ar";
  const showFlights = data.wants.includes("flights");
  const showHotels = data.wants.includes("hotels");

  const nights =
    computeNights(data.intent.departure_date, data.intent.return_date) ?? 4;
  const fmt = (n: number) => formatPrice(n, data.currency, data.locale);

  const missingSide: "flights" | "hotels" | null = !showHotels
    ? "hotels"
    : !showFlights
    ? "flights"
    : null;

  const followupQuestion =
    data.followup ??
    (missingSide === "hotels"
      ? isAr
        ? `هل تريد فندقاً بسعر مميز في ${data.intent.destination}؟`
        : `Want a great hotel deal in ${data.intent.destination}?`
      : missingSide === "flights"
      ? isAr
        ? `هل تريد استعراض رحلات الطيران المتاحة؟`
        : `Want to see available flights?`
      : null);

  const noLabel = isAr ? "لا، شكراً" : "No thanks";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative"
    >
      <OffersJsonLd
        flights={data.flights}
        hotels={data.hotels}
        currency={data.currency}
      />
      <div className="mx-auto max-w-6xl px-6 pb-24 pt-4">

        {/* Route chip */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70 backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-brand-mint" />
            {data.intent.origin ?? "—"} → {data.intent.destination}
            {data.intent.departure_date && (
              <span className="text-white/40">· {data.intent.departure_date}</span>
            )}
          </div>
        </div>

        {/* ── CLARIFICATION CARD ─────────────────────────────── */}
        {data.clarification_needed && data.clarification_question && (
          <ClarificationCard
            question={data.clarification_question}
            isAr={isAr}
          />
        )}

        {/* AI message + tips */}
        {(data.message || data.tips) && (
          <div className="mb-5 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
            {data.message && (
              <p className="text-sm font-medium text-white/90">{data.message}</p>
            )}
            {data.tips && (
              <p className="mt-2 flex items-start gap-2 text-xs text-white/60">
                <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-mint" />
                <span>{data.tips}</span>
              </p>
            )}
          </div>
        )}

        {/* ── INTELLIGENCE ROW: Confidence + Budget Verdict ───── */}
        {(data.confidence || data.budget_verdict) && (
          <div className="mb-6 grid gap-4 sm:grid-cols-2">
            {data.confidence && (
              <ConfidenceWidget confidence={data.confidence} isAr={isAr} />
            )}
            {data.budget_verdict && (
              <BudgetVerdictBanner verdict={data.budget_verdict} isAr={isAr} />
            )}
          </div>
        )}

        {/* ── DESTINATION INTEL PANEL ─────────────────────────── */}
        {data.destination_intel && (
          <DestinationIntelPanel intel={data.destination_intel} isAr={isAr} destination={data.intent.destination} />
        )}

        {/* ── FLIGHTS SECTION ─────────────────────────────────── */}
        {showFlights && (
          <div className="mb-10">
            <SectionHeader
              icon={<Plane className="h-4 w-4 text-brand-primary" />}
              title={isAr ? "رحلات الطيران" : "Flights"}
              count={data.flights.length}
              countLabel={isAr ? "نتيجة" : "results"}
              accentClass="bg-brand-primary/15"
            />

            {data.flights.length === 0 ? (
              <SearchCTA
                isAr={isAr}
                icon={<Plane className="h-5 w-5 text-brand-primary" />}
                title={isAr ? "ابحث عن رحلتك مباشرة" : "Search Flights Directly"}
                desc={isAr
                  ? `نقارن مئات شركات الطيران للوصول إلى أفضل سعر لـ ${data.intent.destination}`
                  : `We compare hundreds of airlines for the best price to ${data.intent.destination}`}
                url={flightSearchUrl}
                btnLabel={isAr ? "ابحث عن رحلات الطيران" : "Search Flights"}
              />
            ) : (
              <ThreeOptionFlights
                flights={data.flights}
                fmt={fmt}
                dict={dict}
                locale={data.locale}
                destination={data.intent.destination}
                currency={data.currency}
                searchUrl={flightSearchUrl}
              />
            )}
          </div>
        )}

        {/* ── FOLLOWUP (after flights, before hotels) ─────────── */}
        {followupQuestion && missingSide === "hotels" && !showHotels && (
          <FollowupCard
            question={followupQuestion}
            yesLabel={isAr ? "نعم، أرني الفنادق" : "Yes, show hotels"}
            noLabel={noLabel}
            onYes={() => reveal("hotels")}
            onNo={dismissFollowup}
            icon={<HotelIcon className="h-4 w-4 text-brand-primary" />}
          />
        )}

        {/* ── HOTELS SECTION ──────────────────────────────────── */}
        {showHotels && (
          <div className={showFlights ? "mt-10" : ""}>
            <SectionHeader
              icon={<HotelIcon className="h-4 w-4 text-brand-mint" />}
              title={isAr ? "الفنادق" : "Hotels"}
              count={data.hotels.length}
              countLabel={isAr ? "فندق" : "hotels"}
              accentClass="bg-brand-mint/15"
            />

            {data.hotels.length === 0 ? (
              <SearchCTA
                isAr={isAr}
                icon={<HotelIcon className="h-5 w-5 text-brand-mint" />}
                title={isAr ? "ابحث عن فندقك مباشرة" : "Search Hotels Directly"}
                desc={isAr
                  ? `نعرض لك آلاف الفنادق في ${data.intent.destination} بأفضل الأسعار المضمونة`
                  : `Browse thousands of hotels in ${data.intent.destination} with best price guarantee`}
                url={hotelSearchUrl}
                btnLabel={isAr ? "ابحث عن فنادق" : "Search Hotels"}
                accent="mint"
              />
            ) : (
              <ThreeOptionHotels
                hotels={data.hotels}
                nights={nights}
                fmt={fmt}
                dict={dict}
                locale={data.locale}
                destination={data.intent.destination}
                currency={data.currency}
                searchUrl={hotelSearchUrl}
              />
            )}
          </div>
        )}

        {/* ── FOLLOWUP for flights ─────────────────────────────── */}
        {followupQuestion && missingSide === "flights" && (
          <FollowupCard
            question={followupQuestion}
            yesLabel={isAr ? "نعم، أرني الرحلات" : "Yes, show flights"}
            noLabel={noLabel}
            onYes={() => reveal("flights")}
            onNo={dismissFollowup}
            icon={<Plane className="h-4 w-4 text-brand-primary" />}
          />
        )}

        {/* ── AFFILIATE UPSELL ROW: Car Rentals + Activities ──── */}
        <AffiliateUpsellRow
          destination={data.intent.destination}
          isAr={isAr}
        />
      </div>
    </motion.div>
  );
}

/* ─── Affiliate Upsell Row (Car Rentals + Activities) ───────────────── */
function AffiliateUpsellRow({
  destination,
  isAr,
}: {
  destination: string;
  isAr: boolean;
}) {
  const MARKER = "522867";
  const carUrl = `https://www.discovercars.com/?a_aid=${MARKER}&a_bid=cars&destination=${encodeURIComponent(destination)}`;
  const activitiesUrl = `https://www.getyourguide.com/s/?q=${encodeURIComponent(destination)}&partner_id=${MARKER}`;

  return (
    <div className="mt-12 grid gap-4 sm:grid-cols-2">
      {/* Car Rentals */}
      <motion.a
        href={carUrl}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        onClick={() =>
          logEvent("affiliate_upsell_clicked", { type: "car_rental", destination })
        }
        className="group flex items-center gap-4 rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 to-sky-600/5 p-5 transition hover:border-sky-400/40 hover:from-sky-500/15"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-500/15">
          <Car className="h-5 w-5 text-sky-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white/90">
            {isAr ? "تأجير سيارات في " + destination : "Car Rentals in " + destination}
          </p>
          <p className="mt-0.5 text-xs text-white/50">
            {isAr
              ? "قارن أسعار أكثر من ٩٠٠ شركة تأجير حول العالم"
              : "Compare 900+ car rental companies worldwide"}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-sky-400 transition group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
      </motion.a>

      {/* Activities */}
      <motion.a
        href={activitiesUrl}
        target="_blank"
        rel="noopener noreferrer"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.08 }}
        onClick={() =>
          logEvent("affiliate_upsell_clicked", { type: "activities", destination })
        }
        className="group flex items-center gap-4 rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 p-5 transition hover:border-emerald-400/40 hover:from-emerald-500/15"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15">
          <Compass className="h-5 w-5 text-emerald-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-white/90">
            {isAr ? "أنشطة وجولات في " + destination : "Activities & Tours in " + destination}
          </p>
          <p className="mt-0.5 text-xs text-white/50">
            {isAr
              ? "آلاف الأنشطة والجولات الموثوقة من GetYourGuide"
              : "Thousands of verified experiences via GetYourGuide"}
          </p>
        </div>
        <ArrowRight className="h-4 w-4 shrink-0 text-emerald-400 transition group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
      </motion.a>
    </div>
  );
}

/* ─── Clarification Card ─────────────────────────────────────────────── */
function ClarificationCard({ question, isAr }: { question: string; isAr: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-5 flex items-start gap-3 rounded-2xl border border-amber-400/25 bg-amber-400/[0.07] p-5 backdrop-blur-md"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-400/15">
        <MessageCircleQuestion className="h-4 w-4 text-amber-300" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-300/80">
          {isAr ? "توضيح مطلوب" : "Clarification Needed"}
        </p>
        <p className="mt-1 text-sm text-white/80">{question}</p>
        <p className="mt-2 text-xs text-white/40">
          {isAr
            ? "النتائج أدناه تعتمد على أفضل تفسير متاح. أعد صياغة بحثك لنتائج أدق."
            : "Results below use the most likely interpretation. Refine your query for better accuracy."}
        </p>
      </div>
    </motion.div>
  );
}

/* ─── Confidence Score Widget ────────────────────────────────────────── */
function ConfidenceWidget({ confidence, isAr }: { confidence: ConfidenceScore; isAr: boolean }) {
  const score = confidence.score;

  const colorConfig =
    score >= 8
      ? { ring: "border-emerald-500/30", bg: "from-emerald-500/15 to-emerald-600/5", scoreColor: "text-emerald-400", barColor: "bg-emerald-500" }
      : score >= 6
      ? { ring: "border-sky-500/30", bg: "from-sky-500/15 to-sky-600/5", scoreColor: "text-sky-400", barColor: "bg-sky-500" }
      : score >= 4
      ? { ring: "border-amber-500/30", bg: "from-amber-500/15 to-amber-600/5", scoreColor: "text-amber-400", barColor: "bg-amber-500" }
      : { ring: "border-rose-500/30", bg: "from-rose-500/15 to-rose-600/5", scoreColor: "text-rose-400", barColor: "bg-rose-500" };

  const impactIcon = (impact: "positive" | "neutral" | "negative") =>
    impact === "positive" ? "+" : impact === "negative" ? "−" : "·";

  const impactColor = (impact: "positive" | "neutral" | "negative") =>
    impact === "positive"
      ? "text-emerald-400"
      : impact === "negative"
      ? "text-rose-400"
      : "text-white/40";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border bg-gradient-to-br p-5 ${colorConfig.ring} ${colorConfig.bg}`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-white/60" />
          <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
            {isAr ? "مؤشر الثقة" : "Confidence Score"}
          </span>
        </div>
        <div className={`font-display text-2xl font-bold ${colorConfig.scoreColor}`}>
          {score.toFixed(1)}
          <span className="text-sm text-white/30">/10</span>
        </div>
      </div>

      {/* Bar */}
      <div className="mb-3 h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(score / 10) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`h-full rounded-full ${colorConfig.barColor}`}
        />
      </div>

      <p className="mb-3 text-xs font-medium text-white/70">
        {isAr ? confidence.label_ar : confidence.label_en}
      </p>

      {confidence.factors.length > 0 && (
        <ul className="space-y-1">
          {confidence.factors.slice(0, 4).map((f, i) => (
            <li key={i} className="flex items-start gap-1.5 text-[11px] text-white/50">
              <span className={`mt-px font-bold ${impactColor(f.impact)}`}>{impactIcon(f.impact)}</span>
              <span>{isAr ? f.factor_ar : f.factor_en}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}

/* ─── Budget Verdict Banner ──────────────────────────────────────────── */
function BudgetVerdictBanner({ verdict, isAr }: { verdict: BudgetVerdict; isAr: boolean }) {
  const v = verdict.verdict;
  const colorConfig =
    v === "generous"
      ? { ring: "border-emerald-500/30", bg: "from-emerald-500/15 to-emerald-600/5", icon: "text-emerald-400", badge: "bg-emerald-500/15 text-emerald-300" }
      : v === "realistic"
      ? { ring: "border-sky-500/30", bg: "from-sky-500/15 to-sky-600/5", icon: "text-sky-400", badge: "bg-sky-500/15 text-sky-300" }
      : v === "tight"
      ? { ring: "border-amber-500/30", bg: "from-amber-500/15 to-amber-600/5", icon: "text-amber-400", badge: "bg-amber-500/15 text-amber-300" }
      : { ring: "border-rose-500/30", bg: "from-rose-500/15 to-rose-600/5", icon: "text-rose-400", badge: "bg-rose-500/15 text-rose-300" };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border bg-gradient-to-br p-5 ${colorConfig.ring} ${colorConfig.bg}`}
    >
      <div className="mb-3 flex items-center gap-2">
        <DollarSign className={`h-4 w-4 ${colorConfig.icon}`} />
        <span className="text-xs font-semibold uppercase tracking-wide text-white/60">
          {isAr ? "تقييم الميزانية" : "Budget Assessment"}
        </span>
        <span className={`ml-auto rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${colorConfig.badge}`}>
          {isAr ? verdict.label_ar : verdict.label_en}
        </span>
      </div>

      <p className="text-xs leading-relaxed text-white/70">
        {isAr ? verdict.explanation_ar : verdict.explanation_en}
      </p>

      {verdict.suggested_budget_usd && (v === "tight" || v === "insufficient") && (
        <p className="mt-2 flex items-center gap-1.5 text-[11px] text-white/50">
          <TrendingUp className="h-3 w-3" />
          {isAr
            ? `الميزانية الموصى بها: $${verdict.suggested_budget_usd.toLocaleString()}`
            : `Recommended budget: $${verdict.suggested_budget_usd.toLocaleString()}`}
        </p>
      )}

      {verdict.alternative_destinations.length > 0 && (v === "tight" || v === "insufficient") && (
        <div className="mt-3">
          <p className="mb-1.5 text-[11px] text-white/40">
            {isAr ? "وجهات بديلة مناسبة لميزانيتك:" : "Budget-friendly alternatives:"}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {verdict.alternative_destinations.map((dest) => (
              <span
                key={dest}
                className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-[11px] text-white/60"
              >
                {dest}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Destination Intel Panel ────────────────────────────────────────── */
function DestinationIntelPanel({
  intel,
  isAr,
  destination,
}: {
  intel: DestinationIntel;
  isAr: boolean;
  destination: string;
}) {
  const [expanded, setExpanded] = useState(false);

  const safetyColor =
    intel.safety_level === "excellent"
      ? "text-emerald-400 bg-emerald-500/15"
      : intel.safety_level === "good"
      ? "text-sky-400 bg-sky-500/15"
      : intel.safety_level === "moderate"
      ? "text-amber-400 bg-amber-500/15"
      : "text-rose-400 bg-rose-500/15";

  const safetyLabel = {
    excellent: isAr ? "ممتاز" : "Excellent",
    good: isAr ? "جيد" : "Good",
    moderate: isAr ? "متوسط" : "Moderate",
    caution: isAr ? "تنبيه" : "Caution",
  }[intel.safety_level];

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md"
    >
      {/* Header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-center justify-between gap-3 p-5 transition hover:bg-white/[0.02]"
      >
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-brand-mint" />
          <span className="text-sm font-semibold text-white/90">
            {isAr ? `دليل الوجهة · ${destination}` : `Destination Guide · ${destination}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${safetyColor}`}>
            {isAr ? "الأمان:" : "Safety:"} {safetyLabel}
          </span>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-white/40" />
          ) : (
            <ChevronDown className="h-4 w-4 text-white/40" />
          )}
        </div>
      </button>

      {/* Expandable body */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2 lg:grid-cols-3">

              {/* Weather & Best Months */}
              <IntelCard
                icon={<Thermometer className="h-4 w-4 text-sky-400" />}
                title={isAr ? "الطقس والموسم" : "Weather & Season"}
              >
                <p className="text-xs leading-relaxed text-white/65">
                  {isAr ? intel.weather_now_ar : intel.weather_now_en}
                </p>
                <p className="mt-1.5 flex items-start gap-1.5 text-[11px] text-white/40">
                  <Calendar className="mt-0.5 h-3 w-3 shrink-0" />
                  {isAr ? intel.best_months_ar : intel.best_months_en}
                </p>
              </IntelCard>

              {/* Visa */}
              {(intel.visa_note_ar || intel.visa_note_en || intel.visa_required_for_saudis !== null) && (
                <IntelCard
                  icon={<Stamp className="h-4 w-4 text-purple-400" />}
                  title={isAr ? "التأشيرة (السعوديون)" : "Visa (Saudis)"}
                >
                  {intel.visa_required_for_saudis !== null && (
                    <span className={`mb-1.5 inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${intel.visa_required_for_saudis ? "bg-amber-500/15 text-amber-300" : "bg-emerald-500/15 text-emerald-300"}`}>
                      {intel.visa_required_for_saudis
                        ? (isAr ? "تأشيرة مطلوبة" : "Visa required")
                        : (isAr ? "بدون تأشيرة" : "Visa-free")}
                    </span>
                  )}
                  {(isAr ? intel.visa_note_ar : intel.visa_note_en) && (
                    <p className="text-xs leading-relaxed text-white/60">
                      {isAr ? intel.visa_note_ar : intel.visa_note_en}
                    </p>
                  )}
                </IntelCard>
              )}

              {/* Clothing tip */}
              {(intel.clothing_tip_ar || intel.clothing_tip_en) && (
                <IntelCard
                  icon={<Shirt className="h-4 w-4 text-rose-300" />}
                  title={isAr ? "نصيحة اللباس" : "Clothing Tip"}
                >
                  <p className="text-xs leading-relaxed text-white/65">
                    {isAr ? intel.clothing_tip_ar : intel.clothing_tip_en}
                  </p>
                  {intel.local_currency && (
                    <p className="mt-1.5 text-[11px] text-white/40">
                      {isAr ? "العملة المحلية:" : "Local currency:"} {intel.local_currency}
                      {intel.time_zone && ` · ${intel.time_zone}`}
                    </p>
                  )}
                </IntelCard>
              )}

              {/* Neighborhoods */}
              {((isAr ? intel.top_neighborhoods_ar : intel.top_neighborhoods_en).length > 0) && (
                <IntelCard
                  icon={<MapPin className="h-4 w-4 text-brand-mint" />}
                  title={isAr ? "أفضل المناطق للإقامة" : "Best Neighborhoods"}
                >
                  <ul className="space-y-1">
                    {(isAr ? intel.top_neighborhoods_ar : intel.top_neighborhoods_en).map((n) => (
                      <li key={n} className="flex items-center gap-1.5 text-xs text-white/65">
                        <span className="h-1.5 w-1.5 rounded-full bg-brand-mint/60" />
                        {n}
                      </li>
                    ))}
                  </ul>
                </IntelCard>
              )}

              {/* Activities */}
              {((isAr ? intel.top_activities_ar : intel.top_activities_en).length > 0) && (
                <IntelCard
                  icon={<Zap className="h-4 w-4 text-amber-400" />}
                  title={isAr ? "أبرز الأنشطة" : "Top Activities"}
                >
                  <ul className="space-y-1">
                    {(isAr ? intel.top_activities_ar : intel.top_activities_en).map((a) => (
                      <li key={a} className="flex items-center gap-1.5 text-xs text-white/65">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400/60" />
                        {a}
                      </li>
                    ))}
                  </ul>
                </IntelCard>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function IntelCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-4">
      <div className="mb-2.5 flex items-center gap-2">
        {icon}
        <span className="text-[11px] font-semibold uppercase tracking-wide text-white/50">{title}</span>
      </div>
      {children}
    </div>
  );
}

/* ─── Section Header ──────────────────────────────────────────────────── */
function SectionHeader({
  icon,
  title,
  count,
  countLabel,
  accentClass,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  countLabel: string;
  accentClass: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accentClass}`}>
        {icon}
      </div>
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      {count > 0 && (
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs text-white/60">
          {count} {countLabel}
        </span>
      )}
    </div>
  );
}

/* ─── Three Option Flights ────────────────────────────────────────────── */
function ThreeOptionFlights({
  flights,
  fmt,
  dict,
  locale,
  destination,
  currency,
  searchUrl,
}: {
  flights: FlightOffer[];
  fmt: (n: number) => string;
  dict: Dictionary;
  locale: "ar" | "en";
  destination: string;
  currency: string;
  searchUrl: string;
}) {
  const isAr = locale === "ar";
  const options = pickThreeFlights(flights);

  const labels = {
    value: {
      badge: isAr ? "أفضل قيمة" : "Best Value",
      sub: isAr ? "سعر + وقت مثاليان" : "Price & time balanced",
      icon: <Award className="h-4 w-4" />,
      gradient: "from-amber-500/20 to-amber-600/10",
      border: "border-amber-500/25",
      badgeClass: "bg-amber-500/15 text-amber-300",
      btnGrad: "from-amber-500 to-orange-600",
    },
    cheapest: {
      badge: isAr ? "الأرخص" : "Cheapest",
      sub: isAr ? "أقل سعر متاح" : "Lowest available price",
      icon: <TrendingDown className="h-4 w-4" />,
      gradient: "from-emerald-500/20 to-emerald-600/10",
      border: "border-emerald-500/25",
      badgeClass: "bg-emerald-500/15 text-emerald-300",
      btnGrad: "from-emerald-500 to-teal-600",
    },
    comfortable: {
      badge: isAr ? "الأريح" : "Most Comfortable",
      sub: isAr ? "أقصر وقت طيران" : "Shortest flight time",
      icon: <Zap className="h-4 w-4" />,
      gradient: "from-sky-500/20 to-sky-600/10",
      border: "border-sky-500/25",
      badgeClass: "bg-sky-500/15 text-sky-300",
      btnGrad: "from-sky-500 to-blue-600",
    },
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {options.map(({ type, flight }) => {
          const l = labels[type];
          return (
            <motion.div
              key={`${type}-${flight.flight_number}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`relative flex flex-col overflow-hidden rounded-2xl border bg-gradient-to-br p-5 ${l.border} ${l.gradient}`}
            >
              {/* Badge */}
              <div className={`mb-4 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${l.badgeClass}`}>
                {l.icon}
                {l.badge}
              </div>

              {/* Airline + route */}
              <div className="mb-1 flex items-center gap-2">
                <Plane className="h-3.5 w-3.5 text-white/50" />
                <span className="text-sm font-semibold text-white/90">
                  {flight.airline || "—"}
                </span>
                <span className="text-xs text-white/40">{flight.flight_number}</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-white/55">
                <span className="font-mono font-bold">{flight.origin}</span>
                <ArrowRight className="h-3 w-3 rtl:rotate-180" />
                <span className="font-mono font-bold">{flight.destination}</span>
                {flight.duration && (
                  <>
                    <span>·</span>
                    <Clock className="h-3 w-3" />
                    <span>{durationLabel(flight.duration)}</span>
                  </>
                )}
              </div>

              {flight.departure_at && (
                <div className="mt-1 text-xs text-white/35">
                  {flight.departure_at.slice(0, 10)}
                  {" · "}
                  {flight.departure_at.slice(11, 16)}
                </div>
              )}

              {/* Price + CTA */}
              <div className="mt-auto pt-4">
                <div className="mb-3">
                  <div className="text-[10px] uppercase tracking-wide text-white/40">
                    {dict.results.from}
                  </div>
                  <div className="font-display text-2xl font-bold text-white">
                    {fmt(flight.price)}
                  </div>
                  <div className="text-[11px] text-white/40">{l.sub}</div>
                </div>
                <a
                  href={flight.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    logEvent("book_clicked", { kind: "flight", option_type: type, destination, origin: flight.origin, airline: flight.airline, price: flight.price });
                    void trackClick({ resultType: "flight", provider: flight.airline ?? "travelpayouts", origin: flight.origin, destination, price: flight.price, currency, affiliateUrl: flight.link, locale });
                  }}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] hover:shadow-lg ${l.btnGrad}`}
                >
                  {dict.results.bookNow}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* See all results link */}
      <div className="flex justify-center">
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-white/40 transition hover:text-white/70"
        >
          {isAr ? "عرض جميع الرحلات المتاحة" : "View all available flights"}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

/* ─── Three Option Hotels ─────────────────────────────────────────────── */
function ThreeOptionHotels({
  hotels,
  nights,
  fmt,
  dict,
  locale,
  destination,
  currency,
  searchUrl,
}: {
  hotels: HotelOffer[];
  nights: number;
  fmt: (n: number) => string;
  dict: Dictionary;
  locale: "ar" | "en";
  destination: string;
  currency: string;
  searchUrl: string;
}) {
  const isAr = locale === "ar";
  const options = pickThreeHotels(hotels);

  const labels = {
    value: {
      badge: isAr ? "أفضل قيمة" : "Best Value",
      sub: isAr ? "نجوم مرتفعة بسعر معقول" : "High stars, great price",
      icon: <Award className="h-4 w-4" />,
      gradient: "from-amber-500/20 to-amber-600/10",
      border: "border-amber-500/25",
      badgeClass: "bg-amber-500/15 text-amber-300",
      btnGrad: "from-amber-500 to-orange-600",
    },
    cheapest: {
      badge: isAr ? "الأرخص" : "Cheapest",
      sub: isAr ? "أقل سعر للإقامة" : "Lowest rate available",
      icon: <TrendingDown className="h-4 w-4" />,
      gradient: "from-emerald-500/20 to-emerald-600/10",
      border: "border-emerald-500/25",
      badgeClass: "bg-emerald-500/15 text-emerald-300",
      btnGrad: "from-emerald-500 to-teal-600",
    },
    comfortable: {
      badge: isAr ? "الأفخم" : "Most Luxurious",
      sub: isAr ? "أعلى تصنيف بالنجوم" : "Highest star rating",
      icon: <Star className="h-4 w-4" />,
      gradient: "from-purple-500/20 to-purple-600/10",
      border: "border-purple-500/25",
      badgeClass: "bg-purple-500/15 text-purple-300",
      btnGrad: "from-purple-500 to-violet-600",
    },
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-3">
        {options.map(({ type, hotel }) => {
          const l = labels[type];
          return (
            <motion.div
              key={`${type}-${hotel.hotelId}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className={`relative flex flex-col overflow-hidden rounded-2xl border bg-gradient-to-br p-5 ${l.border} ${l.gradient}`}
            >
              {/* Badge */}
              <div className={`mb-4 inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${l.badgeClass}`}>
                {l.icon}
                {l.badge}
              </div>

              {/* Hotel info */}
              <div className="mb-1 flex items-start justify-between gap-2">
                <div className="truncate text-sm font-semibold text-white/90 leading-snug">
                  {hotel.hotelName}
                </div>
                {hotel.stars && (
                  <span className="inline-flex shrink-0 items-center gap-0.5 text-xs text-amber-300">
                    <Star className="h-3 w-3 fill-current" />
                    {hotel.stars}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-white/50">
                <HotelIcon className="h-3 w-3" />
                <span className="truncate">{hotel.location.name}</span>
              </div>

              {/* Price + CTA */}
              <div className="mt-auto pt-4">
                <div className="mb-3">
                  <div className="text-[10px] uppercase tracking-wide text-white/40">
                    {dict.results.from}
                  </div>
                  <div className="font-display text-2xl font-bold text-white">
                    {fmt(hotel.priceFrom)}
                  </div>
                  <div className="text-[11px] text-white/40">
                    {nights} {dict.results.nights} · {l.sub}
                  </div>
                </div>
                <a
                  href={hotel.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    logEvent("book_clicked", { kind: "hotel", option_type: type, hotel: hotel.hotelName, destination, price: hotel.priceFrom });
                    void trackClick({ resultType: "hotel", provider: "hotellook", destination, price: hotel.priceFrom, currency, affiliateUrl: hotel.link, locale });
                  }}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r py-2.5 text-sm font-semibold text-white transition hover:scale-[1.02] hover:shadow-lg ${l.btnGrad}`}
                >
                  {dict.results.bookNow}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </a>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* See all results link */}
      <div className="flex justify-center">
        <a
          href={searchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-white/40 transition hover:text-white/70"
        >
          {isAr ? "عرض جميع الفنادق المتاحة" : "View all available hotels"}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

/* ─── Followup Card ──────────────────────────────────────────────────── */
function FollowupCard({
  question,
  yesLabel,
  noLabel,
  onYes,
  onNo,
  icon,
}: {
  question: string;
  yesLabel: string;
  noLabel: string;
  onYes: () => void;
  onNo: () => void;
  icon: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6 rounded-2xl border border-brand-primary/20 bg-gradient-to-r from-brand-primary/10 to-brand-deep/10 p-5 backdrop-blur-md sm:flex sm:items-center sm:justify-between sm:gap-6"
    >
      <p className="flex items-start gap-3 text-sm font-medium text-white/90">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary/20">
          {icon}
        </span>
        <span className="pt-1">{question}</span>
      </p>
      <div className="mt-4 flex items-center gap-2 sm:mt-0 sm:shrink-0">
        <button
          type="button"
          onClick={onYes}
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-deep px-5 py-2 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]"
        >
          {yesLabel}
          <ArrowRight className="h-4 w-4 rtl:rotate-180" />
        </button>
        <button
          type="button"
          onClick={onNo}
          className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-sm font-medium text-white/70 transition hover:bg-white/[0.08]"
        >
          {noLabel}
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Search CTA (empty state) ───────────────────────────────────────── */
function SearchCTA({
  isAr,
  icon,
  title,
  desc,
  url,
  btnLabel,
  accent = "primary",
}: {
  isAr: boolean;
  icon: React.ReactNode;
  title: string;
  desc: string;
  url: string;
  btnLabel: string;
  accent?: "primary" | "mint";
}) {
  const grad =
    accent === "mint"
      ? "from-brand-mint to-brand-deep"
      : "from-brand-primary to-brand-deep";
  const border =
    accent === "mint" ? "border-brand-mint/20" : "border-brand-primary/20";
  const bg =
    accent === "mint"
      ? "from-brand-mint/5 to-brand-deep/5"
      : "from-brand-primary/5 to-brand-deep/5";
  return (
    <div
      className={`flex flex-col items-center gap-5 rounded-2xl border bg-gradient-to-br p-8 text-center ${border} ${bg}`}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.06]">
        {icon}
      </div>
      <div className="max-w-xs">
        <p className="text-base font-semibold text-white/90">{title}</p>
        <p className="mt-1.5 text-xs leading-relaxed text-white/50">{desc}</p>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02] ${grad}`}
      >
        {btnLabel}
        <ExternalLink className="h-3.5 w-3.5 rtl:rotate-180" />
      </a>
      <p className="text-[11px] text-white/30">
        {isAr ? "مدعوم بـ GoTripza · بدون تكلفة إضافية" : "Powered by GoTripza · no extra cost"}
      </p>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────── */

/** Pick up to 3 distinct flight options: Best Value, Cheapest, Most Comfortable */
function pickThreeFlights(
  flights: FlightOffer[],
): Array<{ type: "value" | "cheapest" | "comfortable"; flight: FlightOffer }> {
  if (!flights.length) return [];

  const key = (f: FlightOffer) => `${f.flight_number}|${f.departure_at?.slice(0, 16) ?? ""}`;

  const byValue = [...flights].sort(
    (a, b) =>
      a.price + (a.duration ?? 0) / 4 - (b.price + (b.duration ?? 0) / 4),
  );
  const byPrice = [...flights].sort((a, b) => a.price - b.price);
  const byDuration = [...flights].sort(
    (a, b) => (a.duration ?? 9999) - (b.duration ?? 9999),
  );

  const seen = new Set<string>();
  const result: Array<{ type: "value" | "cheapest" | "comfortable"; flight: FlightOffer }> = [];

  const tryAdd = (
    type: "value" | "cheapest" | "comfortable",
    sorted: FlightOffer[],
  ) => {
    for (const f of sorted) {
      if (!seen.has(key(f))) {
        seen.add(key(f));
        result.push({ type, flight: f });
        return;
      }
    }
  };

  tryAdd("value", byValue);
  tryAdd("cheapest", byPrice);
  tryAdd("comfortable", byDuration);

  return result;
}

/** Pick up to 3 distinct hotel options: Best Value, Cheapest, Most Luxurious */
function pickThreeHotels(
  hotels: HotelOffer[],
): Array<{ type: "value" | "cheapest" | "comfortable"; hotel: HotelOffer }> {
  if (!hotels.length) return [];

  // Best value: high stars / price ratio
  const byValue = [...hotels].sort(
    (a, b) =>
      (b.stars ?? 0) / (b.priceFrom || 1) -
      (a.stars ?? 0) / (a.priceFrom || 1),
  );
  const byPrice = [...hotels].sort((a, b) => a.priceFrom - b.priceFrom);
  const byStars = [...hotels].sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0));

  const seen = new Set<number>();
  const result: Array<{ type: "value" | "cheapest" | "comfortable"; hotel: HotelOffer }> = [];

  const tryAdd = (
    type: "value" | "cheapest" | "comfortable",
    sorted: HotelOffer[],
  ) => {
    for (const h of sorted) {
      if (!seen.has(h.hotelId)) {
        seen.add(h.hotelId);
        result.push({ type, hotel: h });
        return;
      }
    }
  };

  tryAdd("value", byValue);
  tryAdd("cheapest", byPrice);
  tryAdd("comfortable", byStars);

  return result;
}

function computeNights(checkIn?: string | null, checkOut?: string | null): number | null {
  if (!checkIn || !checkOut) return null;
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const diff = Math.round((b.getTime() - a.getTime()) / 86_400_000);
  return diff > 0 ? diff : null;
}

function durationLabel(d?: number): string {
  if (!d) return "—";
  const h = Math.floor(d / 60);
  const m = d % 60;
  return `${h}h ${m}m`;
}
