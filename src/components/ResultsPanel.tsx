"use client";
import { motion } from "framer-motion";
import { Plane, Hotel as HotelIcon, ExternalLink, Star, Sparkles } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { TripIntent } from "@/lib/gemini";
import type { FlightOffer, HotelOffer } from "@/lib/travelpayouts";
import { formatPrice, cn, type Currency } from "@/lib/utils";

type Theme = "dark" | "light";

/** Payment methods shown per currency/locale */
function PaymentBadges({ currency, isLight }: { currency?: Currency; isLight: boolean }) {
  const isSAR = currency === "SAR";
  const methods = isSAR
    ? ["ØªÙØ§Ø±Ø§", "ØªØ§Ø¨Ù", "ÙØ¯Ù", "Apple Pay"]
    : ["Apple Pay", "PayPal", "Visa", "Mastercard"];

  return (
    <div className={cn("mt-4 flex flex-wrap items-center gap-2 border-t pt-3",
      isLight ? "border-ink-950/10" : "border-white/8")}>
      <span className={cn("text-xs", isLight ? "text-ink-950/40" : "text-white/40")}>
        {isSAR ? "Ø·Ø±Ù Ø§ÙØ¯ÙØ¹:" : "Pay with:"}
      </span>
      {methods.map((m) => (
        <span
          key={m}
          className={cn(
            "rounded-md px-2 py-0.5 text-xs font-medium",
            isLight
              ? "bg-ink-950/5 text-ink-950/60"
              : "bg-white/8 text-white/60",
          )}
        >
          {m}
        </span>
      ))}
    </div>
  );
}

export function ResultsPanel({
  intent,
  flights,
  hotels,
  dict,
  theme = "dark",
  currency,
}: {
  intent: TripIntent;
  flights: FlightOffer[];
  hotels: HotelOffer[];
  dict: Dictionary;
  theme?: Theme;
  currency?: Currency;
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
            {intent.origin ?? "â"} â {intent.destination}
          </span>
        </header>
        {flights.length === 0 ? (
          <MarketingEmpty
            isLight={isLight}
            icon={<Plane className="h-5 w-5" />}
            line1="Curating premium flight offersâ¦"
            line2="Live prices loading â results appear instantly."
          />
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
                    <span className="font-semibold">{f.airline || "â"}</span>
                    <span className={subMute}>Â·</span>
                    <span className={isLight ? "text-ink-950/70" : "text-white/70"}>
                      {f.flight_number}
                    </span>
                  </div>
                  <div className={cn("mt-1 text-xs", subMute)}>
                    {f.departure_at?.slice(0, 10)} Â· {f.origin} â {f.destination}
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
        <PaymentBadges currency={currency} isLight={isLight} />
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
          <MarketingEmpty
            isLight={isLight}
            icon={<HotelIcon className="h-5 w-5" />}
            line1="Sourcing top-rated hotel dealsâ¦"
            line2="Best price guarantee â powered by GoTripza AI."
          />
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
        <PaymentBadges currency={currency} isLight={isLight} />
      </section>
    </motion.div>
  );
}

function MarketingEmpty({
  isLight,
  icon,
  line1,
  line2,
}: {
  isLight: boolean;
  icon: React.ReactNode;
  line1: string;
  line2: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 rounded-xl border border-dashed p-6 text-center",
        isLight ? "border-ink-950/15" : "border-white/10",
      )}
    >
      <div
        className={cn(
          "flex h-10 w-10 items-center justify-center rounded-full",
          isLight ? "bg-brand-primary/10 text-brand-deep" : "bg-brand-primary/15 text-brand-primary",
        )}
      >
        {icon}
      </div>
      <div>
        <p className={cn("flex items-center justify-center gap-1 text-sm font-medium",
          isLight ? "text-ink-950/70" : "text-white/70")}>
          <Sparkles className="h-3.5 w-3.5" />
          {line1}
        </p>
        <p className={cn("mt-1 text-xs", isLight ? "text-ink-950/40" : "text-white/40")}>
          {line2}
        </p>
      </div>
    </div>
  );
}
