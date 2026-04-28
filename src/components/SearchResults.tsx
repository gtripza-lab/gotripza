"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plane,
  Hotel as HotelIcon,
  Star,
  Loader2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useSearch } from "./search/SearchContext";
import { logEvent } from "@/lib/events";
import { OffersJsonLd } from "./JsonLd";
import { formatPrice, cn } from "@/lib/utils";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { FlightOffer, HotelOffer } from "@/lib/travelpayouts";

type Tab = "best" | "fastest" | "cheapest";

export function SearchResults({ dict }: { dict: Dictionary }) {
  const { status, data, error } = useSearch();

  return (
    <section id="results" className="relative scroll-mt-24">
      <AnimatePresence mode="wait">
        {status === "loading" && <LoadingState key="l" dict={dict} />}
        {status === "error" && <ErrorState key="e" message={error ?? dict.errors.parse} />}
        {status === "ready" && data && (
          <ReadyState key="r" dict={dict} data={data} />
        )}
      </AnimatePresence>
    </section>
  );
}

function LoadingState({ dict }: { dict: Dictionary }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="mx-auto max-w-6xl px-6 pb-20"
    >
      <div className="glass rounded-3xl p-8 text-center">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-brand-mint" />
        <p className="mt-3 text-sm text-white/80">{dict.results.loading}</p>
      </div>
    </motion.div>
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
  };
}) {
  const { reveal, dismissFollowup } = useSearch();
  const [tab, setTab] = useState<Tab>("best");

  const isAr = data.locale === "ar";
  const showFlights = data.wants.includes("flights");
  const showHotels = data.wants.includes("hotels");

  const sorted = sortFlights(data.flights, tab);
  const bestFlight = sorted[0] ?? data.flights[0];
  const bestHotelItem = data.hotels.length > 0 ? bestHotel(data.hotels) : undefined;
  const nights =
    computeNights(data.intent.departure_date, data.intent.return_date) ?? 4;
  const fmt = (n: number) => formatPrice(n, data.currency, data.locale);

  const missingSide: "flights" | "hotels" | null = !showHotels
    ? "hotels"
    : !showFlights
    ? "flights"
    : null;

  // Followup labels — more enticing than the generic Gemini text
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

  const yesLabel = isAr ? "نعم، أرني الفنادق" : "Yes, show hotels";
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

        {/* Route chip + AI message */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70 backdrop-blur-md">
            <Sparkles className="h-3 w-3 text-brand-mint" />
            {data.intent.origin ?? "—"} → {data.intent.destination}
            {data.intent.departure_date && (
              <span className="text-white/40">· {data.intent.departure_date}</span>
            )}
          </div>
        </div>

        {/* AI contextual message */}
        {(data.message || data.tips) && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
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

        {/* ── FLIGHTS SECTION ─────────────────────────────────── */}
        {showFlights && (
          <div className="mb-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-primary/15">
                <Plane className="h-4 w-4 text-brand-primary" />
              </div>
              <h2 className="font-display text-2xl font-bold">
                {isAr ? "رحلات الطيران" : "Flights"}
              </h2>
              {data.flights.length > 0 && (
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs text-white/60">
                  {data.flights.length} {isAr ? "نتيجة" : "results"}
                </span>
              )}
            </div>

            {/* Sort tabs */}
            {data.flights.length > 1 && (
              <div className="mb-4 inline-flex rounded-full bg-white/[0.05] p-1 text-sm">
                {(["best", "fastest", "cheapest"] as Tab[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={cn(
                      "rounded-full px-4 py-1.5 transition",
                      tab === t
                        ? "bg-white/10 font-semibold text-white"
                        : "text-white/50 hover:text-white/80",
                    )}
                  >
                    {t === "best"
                      ? dict.results.bestValue
                      : t === "fastest"
                      ? dict.results.fastest
                      : dict.results.cheapest}
                  </button>
                ))}
              </div>
            )}

            {data.flights.length === 0 ? (
              <EmptyState
                icon={<Plane className="h-5 w-5" />}
                line1={isAr ? "جارٍ تحميل أفضل أسعار الطيران…" : "Loading best flight prices…"}
                line2={isAr ? "نقارن مئات الخيارات لك" : "Comparing hundreds of options for you"}
              />
            ) : (
              <div className="space-y-3">
                {/* Best flight — featured card */}
                {bestFlight && (
                  <FeaturedFlightCard
                    flight={bestFlight}
                    fmt={fmt}
                    dict={dict}
                    locale={data.locale}
                    destination={data.intent.destination}
                  />
                )}
                {/* Additional flights grid */}
                {sorted.length > 1 && (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {sorted.slice(1, 6).map((f, i) => (
                      <FlightCard
                        key={`${f.flight_number}-${i}`}
                        flight={f}
                        fmt={fmt}
                        dict={dict}
                        destination={data.intent.destination}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── FOLLOWUP CARD (after flights, before hotels) ────── */}
        {followupQuestion && missingSide && !showHotels && (
          <FollowupCard
            question={followupQuestion}
            yesLabel={yesLabel}
            noLabel={noLabel}
            onYes={() => reveal(missingSide as "flights" | "hotels")}
            onNo={dismissFollowup}
          />
        )}

        {/* ── HOTELS SECTION ──────────────────────────────────── */}
        {showHotels && (
          <div className={showFlights ? "mt-10" : ""}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-mint/15">
                <HotelIcon className="h-4 w-4 text-brand-mint" />
              </div>
              <h2 className="font-display text-2xl font-bold">
                {isAr ? "الفنادق" : "Hotels"}
              </h2>
              {data.hotels.length > 0 && (
                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 text-xs text-white/60">
                  {data.hotels.length} {isAr ? "فندق" : "hotels"}
                </span>
              )}
            </div>

            {data.hotels.length === 0 ? (
              <EmptyState
                icon={<HotelIcon className="h-5 w-5" />}
                line1={isAr ? "جارٍ البحث عن أفضل العروض الفندقية…" : "Searching for the best hotel deals…"}
                line2={isAr ? "ضمان أفضل سعر بذكاء GoTripza" : "Best price guarantee by GoTripza AI"}
              />
            ) : (
              <div className="space-y-3">
                {/* Best hotel — featured card */}
                {bestHotelItem && (
                  <FeaturedHotelCard
                    hotel={bestHotelItem}
                    nights={nights}
                    fmt={fmt}
                    dict={dict}
                    locale={data.locale}
                    destination={data.intent.destination}
                  />
                )}
                {/* Additional hotels grid */}
                {data.hotels.length > 1 && (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {data.hotels.slice(1, 7).map((h) => (
                      <HotelCard
                        key={h.hotelId}
                        hotel={h}
                        nights={nights}
                        fmt={fmt}
                        dict={dict}
                        destination={data.intent.destination}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── FOLLOWUP for flights (when only hotels shown) ───── */}
        {followupQuestion && missingSide === "flights" && (
          <FollowupCard
            question={followupQuestion}
            yesLabel={isAr ? "نعم، أرني الرحلات" : "Yes, show flights"}
            noLabel={noLabel}
            onYes={() => reveal("flights")}
            onNo={dismissFollowup}
          />
        )}
      </div>
    </motion.div>
  );
}

/* ─── Featured Flight Card ───────────────────────────────────────────── */
function FeaturedFlightCard({
  flight,
  fmt,
  dict,
  locale,
  destination,
}: {
  flight: FlightOffer;
  fmt: (n: number) => string;
  dict: Dictionary;
  locale: "ar" | "en";
  destination: string;
}) {
  const isAr = locale === "ar";
  return (
    <div className="relative overflow-hidden rounded-3xl bg-paper p-6 text-ink-950 shadow-card">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-indigo-50/60" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-gradient-to-r from-amber-100 to-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-800 shadow-sm">
            <Sparkles className="h-3 w-3" />
            {isAr ? "أفضل قيمة" : "Best Value"}
          </div>
          <span className="rounded-full bg-ink-950/5 px-3 py-0.5 text-xs font-medium text-ink-950/60">
            {flight.airline} · {flight.flight_number}
          </span>
        </div>

        {/* Route visual */}
        <div className="mt-6 flex items-center gap-4">
          <div className="text-center">
            <div className="font-mono text-2xl font-bold">{flight.origin}</div>
            <div className="mt-1 text-xs text-ink-950/50">
              {flight.departure_at?.slice(11, 16) || "—"}
            </div>
          </div>
          <div className="flex flex-1 items-center gap-2">
            <div className="flex-1 border-t border-dashed border-ink-950/20" />
            <div className="flex flex-col items-center">
              <Plane className="h-4 w-4 text-brand-deep" />
              {flight.duration && (
                <span className="mt-0.5 text-[10px] text-ink-950/40">
                  {durationLabel(flight.duration)}
                </span>
              )}
            </div>
            <div className="flex-1 border-t border-dashed border-ink-950/20" />
          </div>
          <div className="text-center">
            <div className="font-mono text-2xl font-bold">{flight.destination}</div>
            <div className="mt-1 text-xs text-ink-950/50">
              {addHours(flight.departure_at, durationToHours(flight.duration))}
            </div>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-ink-950/8 pt-5">
          <div>
            <div className="text-xs text-ink-950/50">{dict.results.from}</div>
            <div className="font-display text-3xl font-bold">{fmt(flight.price)}</div>
          </div>
          <a
            href={flight.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              logEvent("book_clicked", {
                kind: "flight",
                destination,
                origin: flight.origin,
                airline: flight.airline,
                price: flight.price,
              })
            }
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-deep px-6 py-3 font-semibold text-white shadow-glow transition hover:scale-[1.02]"
          >
            {dict.results.bookNow}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Flight Card (list item) ───────────────────────────────────────── */
function FlightCard({
  flight,
  fmt,
  dict,
  destination,
}: {
  flight: FlightOffer;
  fmt: (n: number) => string;
  dict: Dictionary;
  destination: string;
}) {
  return (
    <div className="glass flex flex-col rounded-2xl p-4 transition hover:bg-white/[0.06]">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Plane className="h-4 w-4 text-brand-primary" />
        {flight.airline || "—"}
      </div>
      <div className="mt-2 flex items-center gap-2 text-xs text-white/55">
        <span className="font-mono">{flight.origin}</span>
        <ArrowRight className="h-3 w-3 rtl:rotate-180" />
        <span className="font-mono">{flight.destination}</span>
        {flight.duration && (
          <>
            <span>·</span>
            <Clock className="h-3 w-3" />
            <span>{durationLabel(flight.duration)}</span>
          </>
        )}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-display text-xl font-bold">{fmt(flight.price)}</span>
        <a
          href={flight.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            logEvent("book_clicked", {
              kind: "flight",
              destination,
              origin: flight.origin,
              airline: flight.airline,
              price: flight.price,
            })
          }
          className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-primary to-brand-deep px-3 py-1.5 text-[11px] font-semibold text-white"
        >
          {dict.results.bookNow}
          <ChevronRight className="h-3 w-3 rtl:rotate-180" />
        </a>
      </div>
    </div>
  );
}

/* ─── Featured Hotel Card ────────────────────────────────────────────── */
function FeaturedHotelCard({
  hotel,
  nights,
  fmt,
  dict,
  locale,
  destination,
}: {
  hotel: HotelOffer;
  nights: number;
  fmt: (n: number) => string;
  dict: Dictionary;
  locale: "ar" | "en";
  destination: string;
}) {
  const isAr = locale === "ar";
  return (
    <div className="relative overflow-hidden rounded-3xl bg-paper p-6 text-ink-950 shadow-card">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-emerald-50/60" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-300/40 bg-gradient-to-r from-amber-100 to-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-800 shadow-sm">
            <Sparkles className="h-3 w-3" />
            {isAr ? "أرخص سعر مضمون" : "Best Price Guaranteed"}
          </div>
          {hotel.stars && (
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-500">
              <Star className="h-4 w-4 fill-current" />
              {hotel.stars}
            </span>
          )}
        </div>

        <div className="mt-4">
          <div className="font-display text-2xl font-bold">{hotel.hotelName}</div>
          <div className="mt-1 flex items-center gap-2 text-xs text-ink-950/50">
            <HotelIcon className="h-3.5 w-3.5" />
            <span>{hotel.location.name}</span>
            <span>·</span>
            <span>{nights} {dict.results.nights}</span>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between border-t border-ink-950/8 pt-5">
          <div>
            <div className="text-xs text-ink-950/50">{dict.results.from}</div>
            <div className="font-display text-3xl font-bold">{fmt(hotel.priceFrom)}</div>
          </div>
          <a
            href={hotel.link}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              logEvent("book_clicked", {
                kind: "hotel",
                hotel: hotel.hotelName,
                destination,
                price: hotel.priceFrom,
              })
            }
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-deep px-6 py-3 font-semibold text-white shadow-glow transition hover:scale-[1.02]"
          >
            {dict.results.bookNow}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Hotel Card (list item) ─────────────────────────────────────────── */
function HotelCard({
  hotel,
  nights,
  fmt,
  dict,
  destination,
}: {
  hotel: HotelOffer;
  nights: number;
  fmt: (n: number) => string;
  dict: Dictionary;
  destination: string;
}) {
  return (
    <div className="glass flex flex-col rounded-2xl p-4 transition hover:bg-white/[0.06]">
      <div className="flex items-center justify-between gap-2">
        <div className="truncate text-sm font-semibold">{hotel.hotelName}</div>
        {hotel.stars && (
          <span className="inline-flex shrink-0 items-center gap-0.5 text-xs text-amber-300">
            <Star className="h-3 w-3 fill-current" />
            {hotel.stars}
          </span>
        )}
      </div>
      <div className="mt-1 flex items-center gap-2 text-xs text-white/55">
        <HotelIcon className="h-3 w-3" />
        <span className="truncate">{hotel.location.name}</span>
        <span>·</span>
        <span>{nights} {dict.results.nights}</span>
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-display text-xl font-bold">{fmt(hotel.priceFrom)}</span>
        <a
          href={hotel.link}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            logEvent("book_clicked", {
              kind: "hotel",
              hotel: hotel.hotelName,
              destination,
              price: hotel.priceFrom,
            })
          }
          className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-brand-primary to-brand-deep px-3 py-1.5 text-[11px] font-semibold text-white"
        >
          {dict.results.bookNow}
          <ChevronRight className="h-3 w-3 rtl:rotate-180" />
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
}: {
  question: string;
  yesLabel: string;
  noLabel: string;
  onYes: () => void;
  onNo: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="my-6 rounded-2xl border border-brand-primary/20 bg-gradient-to-r from-brand-primary/10 to-brand-deep/10 p-5 backdrop-blur-md sm:flex sm:items-center sm:justify-between sm:gap-6"
    >
      <p className="flex items-start gap-3 text-sm font-medium text-white/90">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-primary/20">
          <HotelIcon className="h-4 w-4 text-brand-primary" />
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

/* ─── Empty State ────────────────────────────────────────────────────── */
function EmptyState({
  icon,
  line1,
  line2,
}: {
  icon: React.ReactNode;
  line1: string;
  line2: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 p-8 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-primary/15 text-brand-primary">
        {icon}
      </div>
      <div>
        <p className="flex items-center justify-center gap-1 text-sm font-medium text-white/70">
          <Sparkles className="h-3.5 w-3.5 text-brand-mint" />
          {line1}
        </p>
        <p className="mt-1 text-xs text-white/40">{line2}</p>
      </div>
    </div>
  );
}

/* ─── Helpers ────────────────────────────────────────────────────────── */
function sortFlights(flights: FlightOffer[], tab: Tab): FlightOffer[] {
  const arr = [...flights];
  if (tab === "cheapest") arr.sort((a, b) => a.price - b.price);
  if (tab === "fastest") arr.sort((a, b) => (a.duration ?? 0) - (b.duration ?? 0));
  if (tab === "best") {
    arr.sort((a, b) => a.price + (a.duration ?? 0) / 4 - (b.price + (b.duration ?? 0) / 4));
  }
  return arr;
}

function bestHotel(hotels: HotelOffer[]): HotelOffer | undefined {
  if (!hotels.length) return undefined;
  return [...hotels].sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0))[0];
}

function computeNights(checkIn?: string | null, checkOut?: string | null): number | null {
  if (!checkIn || !checkOut) return null;
  const a = new Date(checkIn);
  const b = new Date(checkOut);
  const diff = Math.round((b.getTime() - a.getTime()) / 86400_000);
  return diff > 0 ? diff : null;
}

function durationToHours(d?: number): number {
  if (!d) return 4;
  return Math.max(1, Math.round(d / 60));
}

function durationLabel(d?: number): string {
  if (!d) return "—";
  const h = Math.floor(d / 60);
  const m = d % 60;
  return `${h}h ${m}m`;
}

function addHours(iso?: string, hours = 4): string {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    d.setHours(d.getHours() + hours);
    return d.toTimeString().slice(0, 5);
  } catch {
    return "—";
  }
}
