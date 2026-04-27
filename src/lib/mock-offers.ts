import "server-only";
import type { FlightOffer, HotelOffer } from "./travelpayouts";
import type { TripIntent } from "./gemini";
import type { Currency } from "./utils";

const MARKER = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER ?? "";
const SAR_PER_USD = 3.75;

function fx(usd: number, currency: Currency) {
  return currency === "SAR" ? Math.round(usd * SAR_PER_USD) : Math.round(usd);
}

const AIRLINES = [
  { code: "EK", name: "Emirates" },
  { code: "QR", name: "Qatar Airways" },
  { code: "SV", name: "Saudia" },
  { code: "TK", name: "Turkish Airlines" },
  { code: "FZ", name: "flydubai" },
];

const HOTELS = [
  { name: "Modern Downtown Hotel", stars: 5, base: 420 },
  { name: "Skyline Boutique Suites", stars: 4, base: 280 },
  { name: "Marina Pearl Resort", stars: 5, base: 510 },
  { name: "Old Town Heritage", stars: 4, base: 220 },
  { name: "Azure Bay Residence", stars: 5, base: 460 },
];

function affiliate(path: string) {
  const u = new URL(path, "https://www.aviasales.com");
  if (MARKER) u.searchParams.set("marker", MARKER);
  return u.toString();
}

function hotelLink(name: string, location: string) {
  const u = new URL("https://search.hotellook.com/hotels");
  if (MARKER) u.searchParams.set("marker", MARKER);
  u.searchParams.set("destination", location);
  u.searchParams.set("hotel", name);
  return u.toString();
}

function defaultDates(intent: TripIntent) {
  const today = new Date();
  const dep = intent.departure_date
    ? new Date(intent.departure_date)
    : new Date(today.getTime() + 21 * 86400_000);
  const ret = intent.return_date
    ? new Date(intent.return_date)
    : new Date(dep.getTime() + 5 * 86400_000);
  return { dep, ret };
}

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function mockFlights(
  intent: TripIntent,
  currency: Currency = "USD",
): FlightOffer[] {
  const { dep } = defaultDates(intent);
  const origin = intent.origin ?? "DXB";
  return AIRLINES.map((a, i) => {
    const usd = 280 + i * 65 + (intent.notes === "cheap" ? -40 : 0);
    return {
      origin,
      destination: intent.destination,
      departure_at: `${iso(dep)}T${10 + i}:30:00`,
      return_at: intent.return_date ?? undefined,
      price: fx(usd, currency),
      airline: a.name,
      flight_number: `${a.code}${100 + i * 7}`,
      duration: 230 + i * 25,
      link: affiliate(
        `/search/${origin}${iso(dep).replace(/-/g, "").slice(2)}${intent.destination}1`,
      ),
    };
  });
}

export function mockHotels(
  intent: TripIntent,
  currency: Currency = "USD",
): HotelOffer[] {
  return HOTELS.map((h, i) => ({
    hotelId: 90000 + i,
    hotelName: h.name,
    stars: h.stars,
    priceFrom: fx(h.base + (intent.notes === "cheap" ? -40 : 0), currency),
    location: { name: intent.destination, country: "" },
    link: hotelLink(h.name, intent.destination),
  }));
}
