import "server-only";

const MARKER = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER ?? "";
const TOKEN = process.env.TRAVELPAYOUTS_TOKEN ?? "";

export type FlightOffer = {
  origin: string;
  destination: string;
  departure_at: string;
  return_at?: string;
  price: number;
  airline: string;
  flight_number: string;
  duration?: number;
  link: string;
};

export type HotelOffer = {
  hotelId: number;
  hotelName: string;
  stars?: number;
  priceFrom: number;
  location: { name: string; country: string };
  link: string;
};

const BASE = "https://api.travelpayouts.com";

function affiliateLink(path: string) {
  const url = new URL(path, "https://www.aviasales.com");
  url.searchParams.set("marker", MARKER);
  return url.toString();
}

export async function searchFlights(params: {
  origin: string;
  destination: string;
  departure_date?: string | null;
  return_date?: string | null;
  currency?: string;
}): Promise<FlightOffer[]> {
  const u = new URL(`${BASE}/aviasales/v3/prices_for_dates`);
  u.searchParams.set("origin", params.origin);
  u.searchParams.set("destination", params.destination);
  if (params.departure_date) u.searchParams.set("departure_at", params.departure_date);
  if (params.return_date) u.searchParams.set("return_at", params.return_date);
  u.searchParams.set("currency", params.currency ?? "usd");
  u.searchParams.set("sorting", "price");
  u.searchParams.set("limit", "10");
  u.searchParams.set("token", TOKEN);

  const res = await fetch(u.toString(), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Flights API ${res.status}`);
  const json = (await res.json()) as { data?: Array<Record<string, unknown>> };

  return (json.data ?? []).map((d): FlightOffer => ({
    origin: String(d.origin ?? params.origin),
    destination: String(d.destination ?? params.destination),
    departure_at: String(d.departure_at ?? ""),
    return_at: d.return_at ? String(d.return_at) : undefined,
    price: Number(d.price ?? 0),
    airline: String(d.airline ?? ""),
    flight_number: String(d.flight_number ?? ""),
    duration: d.duration ? Number(d.duration) : undefined,
    link: affiliateLink(String(d.link ?? "/")),
  }));
}

export async function searchHotels(params: {
  location: string;
  checkIn?: string | null;
  checkOut?: string | null;
  adults?: number;
  currency?: string;
}): Promise<HotelOffer[]> {
  const u = new URL("https://engine.hotellook.com/api/v2/cache.json");
  u.searchParams.set("location", params.location);
  if (params.checkIn) u.searchParams.set("checkIn", params.checkIn);
  if (params.checkOut) u.searchParams.set("checkOut", params.checkOut);
  u.searchParams.set("adults", String(params.adults ?? 1));
  u.searchParams.set("limit", "10");
  u.searchParams.set("currency", params.currency ?? "usd");
  u.searchParams.set("token", TOKEN);

  const res = await fetch(u.toString(), { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`Hotels API ${res.status}`);
  const json = (await res.json()) as Array<Record<string, unknown>>;

  return (Array.isArray(json) ? json : []).map((h): HotelOffer => ({
    hotelId: Number(h.hotelId ?? 0),
    hotelName: String(h.hotelName ?? ""),
    stars: h.stars ? Number(h.stars) : undefined,
    priceFrom: Number(h.priceFrom ?? 0),
    location: {
      name: String((h.location as { name?: string })?.name ?? params.location),
      country: String((h.location as { country?: string })?.country ?? ""),
    },
    link: hotelDeepLink(Number(h.hotelId ?? 0), params.location),
  }));
}

function hotelDeepLink(hotelId: number, location: string) {
  const u = new URL("https://search.hotellook.com/hotels");
  u.searchParams.set("marker", MARKER);
  u.searchParams.set("hotelId", String(hotelId));
  u.searchParams.set("destination", location);
  return u.toString();
}
