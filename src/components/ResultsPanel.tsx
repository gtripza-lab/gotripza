"use client";
import { motion } from "framer-motion";
import { Plane, Hotel as HotelIcon, ExternalLink, Star } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { TripIntent } from "@/lib/gemini";
import type { FlightOffer, HotelOffer } from "@/lib/travelpayouts";
import { formatPrice, cn } from "@/lib/utils";

type Theme = "dark" | "light";

export function ResultsPanel({
  intent,
  flights,
  hotels,
  dict,
  theme = "dark",
}: {
  intent: TripIntent;
  flights: FlightOffer[];
  hotels: HotelOffer[];
  dict: Dictionary;
  theme?: Theme;
}) {
  const isLight = theme === "light";
  const card = isLight
    ? "glass-light rounded-2xl p-5"
    : "glass rounded-2xl p-5";
  const itemBg = isLight
    ? "border border-ink-950/5 bg-white/70 hover:bg-white"
    : "border border-white/5 bg-white/[0.03] hover:bg-white/[0.06]";
  const headingMute = isLight ? "text-ink-950/55" : "text-white/50";
  const subMute = isLight ? "text-ink-950/55" : "text-white/50";
  const titleColor = isLight ? "text-ink-950" : "text-white";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-8 grid gap-6 lg:grid-cols-2"
    >
      <section className={card}>
        <header className="mb-4 flex items-center gap-2">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl",
              isLight ? "bg-brand-primary/10 text-brand-deep" : "bg-brand-primary/15 text-brand-primary",
            )}
          >
            <Plane className="h-4 w-4" />
          </div>
          <h3 className={cn("font-semibold", titleColor)}>{dict.results.flights}</h3>
          <span className={cn("ms-auto text-xs", headingMute)}>
            {intent.origin ?? "—"} → {intent.destination}
          </span>
        </header>
        {flights.length === 0 ? (
          <EmptyState text="—" isLight={isLight} />
        ) : (
          <ul className="space-y-3">
            {flights.slice(0, 5).map((f, i) => (
              <li
                key={`${f.flight_number}-${i}`}
                className={cn(
                  "flex items-center justify-between rounded-xl p-3 transition",
                  itemBg,
                )}
              >
                <div className="min-w-0">
                  <div className={cn("flex items-center gap-2 text-sm", titleColor)}>
                    <span className="font-semibold">{f.airline || "—"}</span>
                    <span className={subMute}>·</span>
                    <span className={isLight ? "text-ink-950/70" : "text-white/70"}>
                      {f.flight_number}
                    </span>
                  </div>
                  <div className={cn("mt-1 text-xs", subMute)}>
                    {f.departure_at?.slice(0, 10)} · {f.origin} → {f.destination}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn("font-display text-lg font-bold", titleColor)}>
                    {formatPrice(f.price)}
                  </span>
                  <a
                    href={f.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand text-white"
                    aria-label={dict.results.bookNow}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className={card}>
        <header className="mb-4 flex items-center gap-2">
          <div
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-xl",
              isLight ? "bg-brand-mint/10 text-brand-mint" : "bg-brand-mint/15 text-brand-mint",
            )}
          >
            <HotelIcon className="h-4 w-4" />
          </div>
          <h3 className={cn("font-semibold", titleColor)}>{dict.results.hotels}</h3>
          <span className={cn("ms-auto text-xs", headingMute)}>{intent.destination}</span>
        </header>
        {hotels.length === 0 ? (
          <EmptyState text="—" isLight={isLight} />
        ) : (
          <ul className="space-y-3">
            {hotels.slice(0, 5).map((h) => (
              <li
                key={h.hotelId}
                className={cn(
                  "flex items-center justify-between rounded-xl p-3 transition",
                  itemBg,
                )}
              >
                <div className="min-w-0">
                  <div className={cn("truncate text-sm font-semibold", titleColor)}>
                    {h.hotelName}
                  </div>
                  <div className={cn("mt-1 flex items-center gap-2 text-xs", subMute)}>
                    {h.stars ? (
                      <span className="inline-flex items-center gap-0.5 text-amber-500">
                        <Star className="h-3 w-3 fill-current" />
                        {h.stars}
                      </span>
                    ) : null}
                    <span>{h.location.name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn("font-display text-lg font-bold", titleColor)}>
                    {formatPrice(h.priceFrom)}
                  </span>
                  <a
                    href={h.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-brand text-white"
                    aria-label={dict.results.bookNow}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </motion.div>
  );
}

function EmptyState({ text, isLight }: { text: string; isLight: boolean }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed p-6 text-center text-sm",
        isLight ? "border-ink-950/15 text-ink-950/40" : "border-white/10 text-white/40",
      )}
    >
      {text}
    </div>
  );
}
