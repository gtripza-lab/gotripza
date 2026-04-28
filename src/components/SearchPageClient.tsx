"use client";
import { useEffect, useRef, useState } from "react";
import { useSearch } from "./search/SearchContext";
import { AISearchBar } from "./AISearchBar";
import { SearchResults } from "./SearchResults";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { motion } from "framer-motion";
import {
  Sparkles,
  Plane,
  Hotel as HotelIcon,
  ArrowRight,
  CalendarDays,
  Users,
  MapPin,
  ExternalLink,
  Car,
  Compass,
} from "lucide-react";

const MARKER = "522867";
const WL_BASE = "https://search.gotripza.com";

/* ── Popular airports for quick picks ─────────────────────── */
const AIRPORTS_AR = [
  { code: "JED", label: "جدة" },
  { code: "RUH", label: "الرياض" },
  { code: "DXB", label: "دبي" },
  { code: "CAI", label: "القاهرة" },
  { code: "IST", label: "إسطنبول" },
  { code: "AMS", label: "أمستردام" },
];
const AIRPORTS_EN = [
  { code: "JED", label: "Jeddah" },
  { code: "RUH", label: "Riyadh" },
  { code: "DXB", label: "Dubai" },
  { code: "CAI", label: "Cairo" },
  { code: "IST", label: "Istanbul" },
  { code: "LHR", label: "London" },
];

export function SearchPageClient({
  initialQuery,
  dict,
  locale,
}: {
  initialQuery: string;
  dict: Dictionary;
  locale: Locale;
}) {
  const { search, status } = useSearch();
  const didAutoSearch = useRef(false);

  useEffect(() => {
    if (initialQuery && !didAutoSearch.current) {
      didAutoSearch.current = true;
      search(initialQuery);
    }
  }, [initialQuery, search]);

  const isAr = locale === "ar";

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6">

      {/* ── AI Search Bar ─────────────────────────────────────── */}
      <section className="mb-10 rounded-3xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-brand-mint" />
          <span className="text-sm font-medium text-white/70">
            {isAr
              ? "البحث الذكي — صف رحلتك بكلماتك"
              : "AI Search — describe your trip naturally"}
          </span>
        </div>
        <AISearchBar dict={dict} theme="dark" />
      </section>

      {/* ── AI Results ──────────────────────────────────────────── */}
      {(status === "loading" || status === "ready" || status === "error") && (
        <SearchResults dict={dict} />
      )}

      {/* ── Live Search Section ──────────────────────────────────── */}
      <section className="mt-12 space-y-8">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
          </span>
          <span className="text-sm font-semibold text-white/80">
            {isAr
              ? "بحث مباشر — أسعار لحظية من مئات الشركات"
              : "Live Search — real-time prices from 100s of providers"}
          </span>
          <span className="rounded-full bg-brand-primary/20 px-2 py-0.5 text-[10px] font-bold text-brand-primary">
            LIVE
          </span>
        </div>

        {/* Flights Search Form */}
        <FlightsSearchForm isAr={isAr} airports={isAr ? AIRPORTS_AR : AIRPORTS_EN} />

        {/* Hotels Search Form */}
        <HotelsSearchForm isAr={isAr} />

        {/* ── More Services Grid ──────────────────────────────── */}
        <MoreServicesGrid isAr={isAr} />

        {/* Affiliate disclosure */}
        <p className="text-center text-xs text-white/30">
          {isAr
            ? `GoTripza يحصل على عمولة من كل حجز (marker: ${MARKER}) — بدون تكلفة إضافية عليك`
            : `GoTripza earns a commission on bookings (marker: ${MARKER}) — at no extra cost to you`}
        </p>
      </section>
    </div>
  );
}

/* ── Flights Search Form ─────────────────────────────────────── */
function FlightsSearchForm({
  isAr,
  airports,
}: {
  isAr: boolean;
  airports: { code: string; label: string }[];
}) {
  const today = new Date().toISOString().slice(0, 10);
  const nextMonth = new Date(Date.now() + 30 * 86400_000).toISOString().slice(0, 10);

  const [origin, setOrigin] = useState("JED");
  const [destination, setDestination] = useState("");
  const [depart, setDepart] = useState(nextMonth);
  const [returnDate, setReturnDate] = useState("");
  const [adults, setAdults] = useState(1);
  const [oneWay, setOneWay] = useState(false);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (origin) params.set("origin", origin);
    if (destination) params.set("destination", destination);
    if (depart) params.set("depart_date", depart);
    if (!oneWay && returnDate) params.set("return_date", returnDate);
    params.set("adults", String(adults));
    params.set("marker", MARKER);
    window.open(`${WL_BASE}/?${params.toString()}`, "_blank", "noopener");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-6 py-4">
        <div className="flex items-center gap-2">
          <Plane className="h-4 w-4 text-brand-primary" />
          <span className="text-sm font-semibold text-white/90">
            {isAr ? "✈️ رحلات الطيران — أسعار مباشرة" : "✈️ Flights — live prices"}
          </span>
        </div>
        <a
          href={`${WL_BASE}/?marker=${MARKER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-brand-mint hover:underline"
        >
          {isAr ? "فتح محرك البحث الكامل" : "Open full search"}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Form */}
      <form onSubmit={handleSearch} className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Origin */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-white/60">
              <MapPin className="h-3 w-3" />
              {isAr ? "من" : "From"}
            </label>
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30"
            >
              {airports.map((a) => (
                <option key={a.code} value={a.code} className="bg-ink-950">
                  {a.label} ({a.code})
                </option>
              ))}
              <option value="" className="bg-ink-950">
                {isAr ? "أخرى…" : "Other…"}
              </option>
            </select>
          </div>

          {/* Destination */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-white/60">
              <MapPin className="h-3 w-3" />
              {isAr ? "إلى" : "To"}
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value.toUpperCase())}
              placeholder={isAr ? "DXB، IST، PAR…" : "DXB, IST, PAR…"}
              maxLength={3}
              className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30"
            />
          </div>

          {/* Depart date */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-white/60">
              <CalendarDays className="h-3 w-3" />
              {isAr ? "تاريخ السفر" : "Depart"}
            </label>
            <input
              type="date"
              value={depart}
              min={today}
              onChange={(e) => setDepart(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30"
            />
          </div>

          {/* Return date / Adults */}
          <div className="flex flex-col gap-1.5">
            {oneWay ? (
              <>
                <label className="flex items-center gap-1.5 text-xs font-medium text-white/60">
                  <Users className="h-3 w-3" />
                  {isAr ? "المسافرون" : "Travellers"}
                </label>
                <input
                  type="number"
                  value={adults}
                  min={1}
                  max={9}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30"
                />
              </>
            ) : (
              <>
                <label className="flex items-center gap-1.5 text-xs font-medium text-white/60">
                  <CalendarDays className="h-3 w-3" />
                  {isAr ? "تاريخ العودة" : "Return"}
                </label>
                <input
                  type="date"
                  value={returnDate}
                  min={depart || today}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white outline-none focus:border-brand-primary/50 focus:ring-1 focus:ring-brand-primary/30"
                />
              </>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs text-white/60">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={oneWay}
                onChange={(e) => setOneWay(e.target.checked)}
                className="h-3.5 w-3.5 accent-brand-primary"
              />
              {isAr ? "ذهاب فقط" : "One way"}
            </label>
            {!oneWay && (
              <div className="flex items-center gap-2">
                <Users className="h-3.5 w-3.5" />
                <input
                  type="number"
                  value={adults}
                  min={1}
                  max={9}
                  onChange={(e) => setAdults(Number(e.target.value))}
                  className="w-14 rounded-lg border border-white/10 bg-white/[0.06] px-2 py-1 text-sm text-white outline-none"
                />
                <span>{isAr ? "مسافر" : "adult(s)"}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-primary to-brand-deep px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]"
          >
            {isAr ? "ابحث عن أرخص تذكرة" : "Find Cheapest Ticket"}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>
      </form>

      {/* Quick destination chips */}
      <div className="border-t border-white/5 px-6 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-white/40">
            {isAr ? "وجهات شائعة:" : "Popular:"}
          </span>
          {(isAr
            ? [
                { dest: "DXB", label: "دبي" },
                { dest: "IST", label: "إسطنبول" },
                { dest: "CAI", label: "القاهرة" },
                { dest: "BKK", label: "بانكوك" },
                { dest: "LHR", label: "لندن" },
                { dest: "PAR", label: "باريس" },
              ]
            : [
                { dest: "DXB", label: "Dubai" },
                { dest: "IST", label: "Istanbul" },
                { dest: "BKK", label: "Bangkok" },
                { dest: "LHR", label: "London" },
                { dest: "PAR", label: "Paris" },
                { dest: "NYC", label: "New York" },
              ]
          ).map((d) => (
            <button
              key={d.dest}
              type="button"
              onClick={() => {
                setDestination(d.dest);
              }}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70 transition hover:border-brand-primary/40 hover:bg-brand-primary/10 hover:text-white"
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── Hotels Search Form ──────────────────────────────────────── */
function HotelsSearchForm({ isAr }: { isAr: boolean }) {
  const today = new Date().toISOString().slice(0, 10);
  const nextMonth = new Date(Date.now() + 30 * 86400_000).toISOString().slice(0, 10);
  const returnDefault = new Date(Date.now() + 37 * 86400_000).toISOString().slice(0, 10);

  const [destination, setDestination] = useState("");
  const [checkIn, setCheckIn] = useState(nextMonth);
  const [checkOut, setCheckOut] = useState(returnDefault);
  const [adults, setAdults] = useState(2);
  const [rooms, setRooms] = useState(1);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set("tab", "hotels");
    if (destination) params.set("destination", destination);
    if (checkIn) params.set("check_in", checkIn);
    if (checkOut) params.set("check_out", checkOut);
    params.set("adults", String(adults));
    params.set("rooms", String(rooms));
    params.set("marker", MARKER);
    window.open(`${WL_BASE}/?${params.toString()}`, "_blank", "noopener");
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25 }}
      className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 bg-white/[0.04] px-6 py-4">
        <div className="flex items-center gap-2">
          <HotelIcon className="h-4 w-4 text-brand-mint" />
          <span className="text-sm font-semibold text-white/90">
            {isAr ? "🏨 الفنادق — أسعار مباشرة" : "🏨 Hotels — live prices"}
          </span>
        </div>
        <a
          href={`https://hotellook.com/?marker=${MARKER}&locale=${isAr ? "ar" : "en"}&currency=${isAr ? "SAR" : "USD"}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-brand-mint hover:underline"
        >
          {isAr ? "فتح محرك البحث الكامل" : "Open full search"}
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Form */}
      <form onSubmit={handleSearch} className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Destination */}
          <div className="flex flex-col gap-1.5 lg:col-span-2">
            <label className="flex items-center gap-1.5 text-xs font-medium text-white/60">
              <MapPin className="h-3 w-3" />
              {isAr ? "الوجهة أو الفندق" : "Destination or hotel"}
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder={isAr ? "دبي، إسطنبول، الرياض…" : "Dubai, Istanbul, Riyadh…"}
              className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-brand-mint/50 focus:ring-1 focus:ring-brand-mint/30"
            />
          </div>

          {/* Check-in */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-white/60">
              <CalendarDays className="h-3 w-3" />
              {isAr ? "تاريخ الوصول" : "Check-in"}
            </label>
            <input
              type="date"
              value={checkIn}
              min={today}
              onChange={(e) => setCheckIn(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white outline-none focus:border-brand-mint/50 focus:ring-1 focus:ring-brand-mint/30"
            />
          </div>

          {/* Check-out */}
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-1.5 text-xs font-medium text-white/60">
              <CalendarDays className="h-3 w-3" />
              {isAr ? "تاريخ المغادرة" : "Check-out"}
            </label>
            <input
              type="date"
              value={checkOut}
              min={checkIn || today}
              onChange={(e) => setCheckOut(e.target.value)}
              className="rounded-xl border border-white/10 bg-white/[0.06] px-3 py-2.5 text-sm text-white outline-none focus:border-brand-mint/50 focus:ring-1 focus:ring-brand-mint/30"
            />
          </div>
        </div>

        {/* Bottom row */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-xs text-white/60">
            <div className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5" />
              <input
                type="number"
                value={adults}
                min={1}
                max={10}
                onChange={(e) => setAdults(Number(e.target.value))}
                className="w-14 rounded-lg border border-white/10 bg-white/[0.06] px-2 py-1 text-sm text-white outline-none"
              />
              <span>{isAr ? "بالغ" : "adult(s)"}</span>
            </div>
            <div className="flex items-center gap-2">
              <HotelIcon className="h-3.5 w-3.5" />
              <input
                type="number"
                value={rooms}
                min={1}
                max={5}
                onChange={(e) => setRooms(Number(e.target.value))}
                className="w-14 rounded-lg border border-white/10 bg-white/[0.06] px-2 py-1 text-sm text-white outline-none"
              />
              <span>{isAr ? "غرفة" : "room(s)"}</span>
            </div>
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-mint to-brand-deep px-6 py-2.5 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]"
          >
            {isAr ? "ابحث عن أرخص فندق" : "Find Best Hotel Rate"}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </button>
        </div>
      </form>

      {/* Popular hotel destinations */}
      <div className="border-t border-white/5 px-6 py-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-white/40">
            {isAr ? "وجهات شائعة:" : "Popular:"}
          </span>
          {(isAr
            ? ["دبي", "إسطنبول", "القاهرة", "بانكوك", "لندن", "باريس", "المالديف"]
            : ["Dubai", "Istanbul", "Bangkok", "London", "Paris", "Maldives", "Bali"]
          ).map((dest) => (
            <button
              key={dest}
              type="button"
              onClick={() => setDestination(dest)}
              className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70 transition hover:border-brand-mint/40 hover:bg-brand-mint/10 hover:text-white"
            >
              {dest}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

/* ── More Services Grid ──────────────────────────────────────── */
const PARTNER_SERVICES_AR = [
  { icon: "🚗", title: "تأجير السيارات", desc: "أسعار من DiscoverCars بدون رسوم خفية", url: `https://tp.media/r?marker=522867&trs=&p=5978&u=https%3A%2F%2Fwww.discovercars.com%2F&locale=ar&curr=SAR`, border: "border-blue-500/20", color: "from-blue-500/10 to-blue-600/5" },
  { icon: "🗺️", title: "الجولات والأنشطة", desc: "آلاف التجارب السياحية من GetYourGuide", url: `https://tp.media/r?marker=522867&trs=&p=4724&u=https%3A%2F%2Fwww.getyourguide.com%2F&locale=ar&curr=SAR`, border: "border-emerald-500/20", color: "from-emerald-500/10 to-emerald-600/5" },
  { icon: "🚌", title: "التحويلات والنقل", desc: "نقل مطار آمن مع Kiwitaxi", url: `https://tp.media/r?marker=522867&trs=&p=5814&u=https%3A%2F%2Fkiwitaxi.com%2F&locale=ar&curr=SAR`, border: "border-amber-500/20", color: "from-amber-500/10 to-amber-600/5" },
  { icon: "🛳️", title: "الباص والقطار", desc: "احجز تذاكر الحافلات والقطارات مع Omio", url: `https://tp.media/r?marker=522867&trs=&p=5949&u=https%3A%2F%2Fwww.omio.com%2F&locale=ar&curr=SAR`, border: "border-cyan-500/20", color: "from-cyan-500/10 to-cyan-600/5" },
  { icon: "📱", title: "شرائح الاتصال", desc: "إنترنت أينما ذهبت مع Airalo بدون تجوال", url: `https://www.airalo.com/`, border: "border-purple-500/20", color: "from-purple-500/10 to-purple-600/5" },
  { icon: "🎫", title: "تذاكر المعالم", desc: "تذاكر مسبقة لأشهر المعالم مع Klook", url: `https://www.klook.com/`, border: "border-rose-500/20", color: "from-rose-500/10 to-rose-600/5" },
];
const PARTNER_SERVICES_EN = [
  { icon: "🚗", title: "Car Rentals", desc: "Best rates from DiscoverCars — no hidden fees", url: `https://tp.media/r?marker=522867&trs=&p=5978&u=https%3A%2F%2Fwww.discovercars.com%2F&locale=en&curr=USD`, border: "border-blue-500/20", color: "from-blue-500/10 to-blue-600/5" },
  { icon: "🗺️", title: "Tours & Activities", desc: "Thousands of experiences on GetYourGuide", url: `https://tp.media/r?marker=522867&trs=&p=4724&u=https%3A%2F%2Fwww.getyourguide.com%2F&locale=en&curr=USD`, border: "border-emerald-500/20", color: "from-emerald-500/10 to-emerald-600/5" },
  { icon: "🚌", title: "Airport Transfers", desc: "Safe airport pickup with Kiwitaxi", url: `https://tp.media/r?marker=522867&trs=&p=5814&u=https%3A%2F%2Fkiwitaxi.com%2F&locale=en&curr=USD`, border: "border-amber-500/20", color: "from-amber-500/10 to-amber-600/5" },
  { icon: "🛳️", title: "Bus & Train", desc: "Book intercity transport with Omio", url: `https://tp.media/r?marker=522867&trs=&p=5949&u=https%3A%2F%2Fwww.omio.com%2F&locale=en&curr=USD`, border: "border-cyan-500/20", color: "from-cyan-500/10 to-cyan-600/5" },
  { icon: "📱", title: "eSIM & Mobile Data", desc: "Stay connected worldwide with Airalo eSIM", url: `https://www.airalo.com/`, border: "border-purple-500/20", color: "from-purple-500/10 to-purple-600/5" },
  { icon: "🎫", title: "Attraction Tickets", desc: "Skip-the-line tickets for top attractions via Klook", url: `https://www.klook.com/`, border: "border-rose-500/20", color: "from-rose-500/10 to-rose-600/5" },
];

function MoreServicesGrid({ isAr }: { isAr: boolean }) {
  const services = isAr ? PARTNER_SERVICES_AR : PARTNER_SERVICES_EN;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
          <Compass className="h-4 w-4 text-white/70" />
        </div>
        <h2 className="font-display text-xl font-bold text-white">
          {isAr ? "خدمات سفر إضافية" : "More Travel Services"}
        </h2>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <a key={s.title} href={s.url} target="_blank" rel="noopener noreferrer"
            className={`group flex flex-col gap-3 overflow-hidden rounded-2xl border bg-gradient-to-br p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${s.border} ${s.color}`}
          >
            <div className="text-2xl">{s.icon}</div>
            <div>
              <div className="font-display text-base font-bold text-white">{s.title}</div>
              <div className="mt-1 text-xs leading-relaxed text-white/60">{s.desc}</div>
            </div>
            <div className="mt-auto flex items-center gap-1 text-xs font-semibold text-white/70 transition group-hover:text-white">
              {isAr ? "احجز الآن" : "Book Now"}
              <ArrowRight className="h-3 w-3 rtl:rotate-180" />
            </div>
          </a>
        ))}
      </div>
    </motion.div>
  );
}
