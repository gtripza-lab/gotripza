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
    <section
      id="results"
      className="relative scroll-mt-24"
    >
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
        <AlertTriangle className="h-5 w-5" />
        <span className="truncate">{message}</span>
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
  const showFlights = data.wants.includes("flights");
  const showHotels = data.wants.includes("hotels");
  const sorted = sortFlights(data.flights, tab);
  const flight = sorted[0] ?? data.flights[0];
  const hotel = showHotels ? bestHotel(data.hotels) : undefined;
  const nights = computeNights(data.intent.departure_date, data.intent.return_date) ?? 4;
  const total =
    (showFlights && flight ? flight.price : 0) +
    (showHotels && hotel ? hotel.priceFrom : 0);
  const fmt = (n: number) => formatPrice(n, data.currency, data.locale);

  const headline = showFlights && showHotels
    ? (
        <>
          {dict.results.flights} <span className="text-white/40">+</span>{" "}
          {dict.results.hotels}
        </>
      )
    : showFlights
      ? dict.results.flights
      : dict.results.hotels;

  const yesLabel = data.locale === "ar" ? "نعم، اعرضها" : "Yes, show them";
  const noLabel = data.locale === "ar" ? "لا، شكراً" : "No, thanks";
  const missingSide: "flights" | "hotels" | null = !showHotels
    ? "hotels"
    : !showFlights
      ? "flights"
      : null;

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
        {(data.message || data.tips) && (
          <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md">
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

        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70 backdrop-blur-md">
              <Sparkles className="h-3 w-3 text-brand-mint" />
              {data.intent.origin ?? "—"} → {data.intent.destination}
              {data.intent.departure_date && (
                <span className="text-white/40">· {data.intent.departure_date}</span>
              )}
            </div>
            <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
              {headline}
            </h2>
          </div>
          {data.mock && (
            <span className="hidden rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-[11px] font-medium text-amber-300 sm:inline-flex">
              Demo data
            </span>
          )}
        </div>

        <div
          className={cn(
            "grid gap-6",
            showFlights && showHotels && "lg:grid-cols-[1.4fr_1fr]",
          )}
        >
          {showFlights ? (
            <TripCard
              dict={dict}
              tab={tab}
              setTab={setTab}
              flight={flight}
              hotel={hotel}
              nights={nights}
              total={total}
              fmt={fmt}
              showHotel={showHotels}
              locale={data.locale}
              destination={data.intent.destination}
            />
          ) : (
            <HotelFeatureCard
              hotel={hotel}
              nights={nights}
              fmt={fmt}
              dict={dict}
              locale={data.locale}
              destination={data.intent.destination}
            />
          )}
          {showFlights && showHotels && (
            <HotelsList hotels={data.hotels.slice(0, 4)} fmt={fmt} />
          )}
        </div>

        {showFlights && (
          <div className="mt-6">
            <FlightsList flights={sorted.slice(0, 5)} dict={dict} fmt={fmt} />
          </div>
        )}

        {!showFlights && showHotels && (
          <div className="mt-6">
            <MoreHotelsGrid hotels={data.hotels.slice(0, 6)} fmt={fmt} dict={dict} />
          </div>
        )}

        {data.followup && missingSide && (
          <FollowupCard
            question={data.followup}
            yesLabel={yesLabel}
            noLabel={noLabel}
            onYes={() => reveal(missingSide)}
            onNo={dismissFollowup}
          />
        )}
      </div>
    </motion.div>
  );
}

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
      className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-md sm:flex sm:items-center sm:justify-between sm:gap-6"
    >
      <p className="flex items-start gap-2 text-sm font-medium text-white/90">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-brand-mint" />
        <span>{question}</span>
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

function TrustBadge({ locale }: { locale: "ar" | "en" }) {
  const label =
    locale === "ar"
      ? "أرخص سعر مضمون بذكاء GoTripza"
      : "Best Price Guaranteed by GoTripza AI";
  return (
    <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/40 bg-gradient-to-r from-amber-100 to-amber-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-800 shadow-sm">
      <Sparkles className="h-3 w-3" />
      {label}
    </div>
  );
}

function HotelFeatureCard({
  hotel,
  nights,
  fmt,
  dict,
  locale,
  destination,
}: {
  hotel?: HotelOffer;
  nights: number;
  fmt: (n: number) => string;
  dict: Dictionary;
  locale: "ar" | "en";
  destination: string;
}) {
  if (!hotel) return null;
  return (
    <div className="relative overflow-hidden rounded-3xl bg-paper p-6 text-ink-950 shadow-card">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-indigo-50/60" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <HotelIcon className="h-4 w-4 text-brand-mint" />
            {dict.results.hotels}
          </div>
          <TrustBadge locale={locale} />
        </div>
        <div className="mt-3 font-display text-2xl font-bold">{hotel.hotelName}</div>
        <div className="mt-2 flex items-center gap-2 text-xs text-ink-950/55">
          {hotel.stars && (
            <span className="inline-flex items-center gap-0.5 text-amber-500">
              <Star className="h-3 w-3 fill-current" />
              {hotel.stars}
            </span>
          )}
          <span>·</span>
          <span>{hotel.location.name}</span>
          <span>·</span>
          <span>
            {nights} {dict.results.nights}
          </span>
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-ink-950/5 pt-5">
          <div>
            <div className="text-xs text-ink-950/55">{dict.results.from}</div>
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

function MoreHotelsGrid({
  hotels,
  fmt,
  dict,
}: {
  hotels: HotelOffer[];
  fmt: (n: number) => string;
  dict: Dictionary;
}) {
  if (!hotels.length) return null;
  return (
    <div className="glass rounded-3xl p-6">
      <h3 className="font-display text-lg font-bold">{dict.results.hotels}</h3>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {hotels.map((h) => (
          <li
            key={h.hotelId}
            className="flex flex-col rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition hover:border-white/10 hover:bg-white/[0.06]"
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <HotelIcon className="h-4 w-4 text-brand-mint" />
              {h.hotelName}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-white/55">
              {h.stars && (
                <span className="inline-flex items-center gap-0.5 text-amber-300">
                  <Star className="h-3 w-3 fill-current" />
                  {h.stars}
                </span>
              )}
              <span>·</span>
              <span>{h.location.name}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-display text-xl font-bold">{fmt(h.priceFrom)}</span>
              <a
                href={h.link}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-gradient-to-r from-brand-primary to-brand-deep px-3 py-1.5 text-[11px] font-semibold text-white"
              >
                {dict.results.bookNow}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TripCard({
  dict,
  tab,
  setTab,
  flight,
  hotel,
  nights,
  total,
  fmt,
  showHotel,
  locale,
  destination,
}: {
  dict: Dictionary;
  tab: Tab;
  setTab: (t: Tab) => void;
  flight?: FlightOffer;
  hotel?: HotelOffer;
  nights: number;
  total: number;
  fmt: (n: number) => string;
  showHotel: boolean;
  locale: "ar" | "en";
  destination: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-paper p-6 text-ink-950 shadow-card">
      <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-indigo-50/60" />
      <div className="relative">
        <div className="flex items-center justify-between gap-3">
          <h3 className="font-display text-xl font-bold">
            {dict.mockups.screens.trip.title.replace("Tripza", "Dubai").replace("دبي", "وجهتك")}
          </h3>
          <TrustBadge locale={locale} />
        </div>

        <div className="mt-5 inline-flex rounded-full bg-ink-950/5 p-1 text-sm">
          {(["best", "fastest", "cheapest"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={cn(
                "rounded-full px-4 py-1.5 transition",
                tab === t
                  ? "bg-white font-semibold shadow-sm"
                  : "text-ink-950/55 hover:text-ink-950/80",
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

        {flight && (
          <div className="mt-5 rounded-2xl border border-ink-950/5 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-sm font-semibold">
                <Plane className="h-4 w-4 text-brand-deep" />
                {dict.results.flights}
              </span>
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                Best
              </span>
            </div>
            <div className="mt-4 flex items-center gap-3">
              <span className="font-display text-lg font-bold">
                {flight.departure_at?.slice(11, 16) || "10:30"}
              </span>
              <span className="font-mono text-sm text-ink-950/50">{flight.origin}</span>
              <span className="flex-1 border-t border-dashed border-ink-950/20" />
              <Plane className="h-3.5 w-3.5 -rotate-45 text-ink-950/40" />
              <span className="flex-1 border-t border-dashed border-ink-950/20" />
              <span className="font-mono text-sm text-ink-950/50">{flight.destination}</span>
              <span className="font-display text-lg font-bold">
                {addHours(flight.departure_at, durationToHours(flight.duration))}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-ink-950/55">
              <span>
                {flight.airline} · {flight.flight_number} ·{" "}
                {durationLabel(flight.duration)}
              </span>
              <span className="font-display text-2xl font-bold text-ink-950">
                {fmt(flight.price)}
              </span>
            </div>
          </div>
        )}

        {showHotel && hotel && (
          <div className="mt-3 rounded-2xl border border-ink-950/5 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <HotelIcon className="h-4 w-4 text-brand-mint" />
              {dict.results.hotels}
            </div>
            <div className="mt-2 flex items-center justify-between">
              <div>
                <div className="font-display text-base font-bold">{hotel.hotelName}</div>
                <div className="mt-1 flex items-center gap-2 text-xs text-ink-950/55">
                  <span className="inline-flex items-center gap-0.5 text-amber-500">
                    <Star className="h-3 w-3 fill-current" />
                    {hotel.stars ?? 4.8} {hotel.stars ? "" : "(1,330)"}
                  </span>
                  <span>·</span>
                  <span>
                    {nights} {dict.results.nights}
                  </span>
                </div>
              </div>
              <span className="font-display text-2xl font-bold">
                {fmt(hotel.priceFrom)}
              </span>
            </div>
          </div>
        )}

        <div className="mt-6 flex items-center justify-between border-t border-ink-950/5 pt-5">
          <div>
            <div className="text-xs text-ink-950/55">
              {dict.results.bestValue} · {dict.results.from}{" "}
              {showHotel
                ? `${dict.results.flights.toLowerCase()} + ${dict.results.hotels.toLowerCase()}`
                : dict.results.flights.toLowerCase()}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-xs text-ink-950/55">Total</span>
              <span className="font-display text-3xl font-bold">
                {fmt(total)}
              </span>
            </div>
          </div>
          <a
            href={flight?.link ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              logEvent("book_clicked", {
                kind: showHotel ? "trip" : "flight",
                destination,
                origin: flight?.origin,
                airline: flight?.airline,
                price: total,
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

function HotelsList({
  hotels,
  fmt,
}: {
  hotels: HotelOffer[];
  fmt: (n: number) => string;
}) {
  if (!hotels.length) return null;
  return (
    <div className="glass relative h-full overflow-hidden rounded-3xl p-5">
      <h3 className="font-display text-lg font-bold">More stays</h3>
      <ul className="mt-4 space-y-3">
        {hotels.map((h) => (
          <li
            key={h.hotelId}
            className="group flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.03] p-3 transition hover:border-white/10 hover:bg-white/[0.06]"
          >
            <div className="min-w-0">
              <div className="truncate text-sm font-semibold">{h.hotelName}</div>
              <div className="mt-1 flex items-center gap-1.5 text-xs text-white/55">
                {h.stars && (
                  <span className="inline-flex items-center gap-0.5 text-amber-300">
                    <Star className="h-3 w-3 fill-current" />
                    {h.stars}
                  </span>
                )}
                <span>·</span>
                <span>{h.location.name}</span>
              </div>
            </div>
            <div className="text-end">
              <div className="font-display text-base font-bold">
                {fmt(h.priceFrom)}
              </div>
              <a
                href={h.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-brand-mint hover:underline"
              >
                View
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FlightsList({
  flights,
  dict,
  fmt,
}: {
  flights: FlightOffer[];
  dict: Dictionary;
  fmt: (n: number) => string;
}) {
  if (!flights.length) return null;
  return (
    <div className="glass rounded-3xl p-6">
      <h3 className="font-display text-lg font-bold">More flights</h3>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {flights.map((f, i) => (
          <li
            key={`${f.flight_number}-${i}`}
            className="flex flex-col rounded-2xl border border-white/5 bg-white/[0.03] p-4 transition hover:border-white/10 hover:bg-white/[0.06]"
          >
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Plane className="h-4 w-4 text-brand-primary" />
              {f.airline}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-white/55">
              <span className="font-mono">{f.origin}</span>
              <ArrowRight className="h-3 w-3 rtl:rotate-180" />
              <span className="font-mono">{f.destination}</span>
              <span className="ms-auto">{durationLabel(f.duration)}</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="font-display text-xl font-bold">
                {fmt(f.price)}
              </span>
              <a
                href={f.link}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-gradient-to-r from-brand-primary to-brand-deep px-3 py-1.5 text-[11px] font-semibold text-white"
              >
                {dict.results.bookNow}
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

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
