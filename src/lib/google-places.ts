import "server-only";

const API_KEY = process.env.GOOGLE_PLACES_API_KEY ?? "";
const BASE    = "https://places.googleapis.com/v1";

export type PlaceResult = {
  name: string;
  types: string[];
  rating?: number;
  priceLevel?: number; // 1=inexpensive 2=moderate 3=expensive 4=very expensive
  editorial?: string;
};

type RawPlace = {
  displayName?: { text?: string };
  types?: string[];
  rating?: number;
  priceLevel?: string;
  editorialSummary?: { text?: string };
};

// ── Shared fetcher ─────────────────────────────────────────────────────────────
async function searchPlaces(
  textQuery: string,
  includedTypes: string[],
  maxResults = 5,
): Promise<PlaceResult[]> {
  if (!API_KEY) return [];

  try {
    const res = await fetch(`${BASE}/places:searchText`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask":
          "places.displayName,places.types,places.rating,places.priceLevel,places.editorialSummary",
      },
      body: JSON.stringify({
        textQuery,
        includedType: includedTypes[0],
        maxResultCount: maxResults,
        languageCode: "en",
      }),
      next: { revalidate: 60 * 60 * 24 }, // cache 24h — places don't change daily
    });

    if (!res.ok) {
      console.warn("[google-places] API error:", res.status, await res.text());
      return [];
    }

    const data = (await res.json()) as { places?: RawPlace[] };
    return (data.places ?? []).map((p) => ({
      name: p.displayName?.text ?? "",
      types: p.types ?? [],
      rating: p.rating,
      priceLevel: p.priceLevel
        ? { PRICE_LEVEL_INEXPENSIVE: 1, PRICE_LEVEL_MODERATE: 2, PRICE_LEVEL_EXPENSIVE: 3, PRICE_LEVEL_VERY_EXPENSIVE: 4 }[p.priceLevel] ?? undefined
        : undefined,
      editorial: p.editorialSummary?.text,
    })).filter((p) => p.name);
  } catch (err) {
    console.warn("[google-places] fetch failed:", err);
    return [];
  }
}

// ── Public helpers ─────────────────────────────────────────────────────────────

/** Top tourist attractions in a city */
export async function getAttractions(city: string): Promise<PlaceResult[]> {
  return searchPlaces(`top tourist attractions in ${city}`, ["tourist_attraction"], 8);
}

/** Top restaurants in a city (general) */
export async function getRestaurants(city: string): Promise<PlaceResult[]> {
  return searchPlaces(`best restaurants in ${city}`, ["restaurant"], 8);
}

/** Halal restaurants specifically */
export async function getHalalRestaurants(city: string): Promise<PlaceResult[]> {
  return searchPlaces(`halal restaurants in ${city}`, ["restaurant"], 5);
}

/** Best neighborhoods to stay */
export async function getNeighborhoods(city: string): Promise<PlaceResult[]> {
  return searchPlaces(`best neighborhoods to stay in ${city} for tourists`, ["neighborhood"], 4);
}

// ── Aggregate: fetch everything in parallel ────────────────────────────────────
export type CityPlacesContext = {
  attractions: PlaceResult[];
  restaurants: PlaceResult[];
  halalRestaurants: PlaceResult[];
  neighborhoods: PlaceResult[];
};

export async function getCityContext(
  city: string,
  includeHalal = true,
): Promise<CityPlacesContext> {
  if (!API_KEY) {
    return { attractions: [], restaurants: [], halalRestaurants: [], neighborhoods: [] };
  }

  const [attractions, restaurants, halalRestaurants, neighborhoods] = await Promise.all([
    getAttractions(city),
    getRestaurants(city),
    includeHalal ? getHalalRestaurants(city) : Promise.resolve([]),
    getNeighborhoods(city),
  ]);

  return { attractions, restaurants, halalRestaurants, neighborhoods };
}

// ── Format for GPT prompt injection ───────────────────────────────────────────
export function formatPlacesForPrompt(ctx: CityPlacesContext): string {
  const lines: string[] = [];

  if (ctx.attractions.length) {
    lines.push("=== REAL ATTRACTIONS (verified by Google) ===");
    ctx.attractions.forEach((p) => {
      const rating = p.rating ? ` ★${p.rating}` : "";
      lines.push(`- ${p.name}${rating}${p.editorial ? `: ${p.editorial}` : ""}`);
    });
  }

  if (ctx.restaurants.length) {
    lines.push("\n=== REAL RESTAURANTS (verified by Google) ===");
    ctx.restaurants.forEach((p) => {
      const rating = p.rating ? ` ★${p.rating}` : "";
      const price = p.priceLevel
        ? ` ${"$".repeat(p.priceLevel)}`
        : "";
      lines.push(`- ${p.name}${rating}${price}${p.editorial ? `: ${p.editorial}` : ""}`);
    });
  }

  if (ctx.halalRestaurants.length) {
    lines.push("\n=== HALAL RESTAURANTS ===");
    ctx.halalRestaurants.forEach((p) => {
      lines.push(`- ${p.name}${p.rating ? ` ★${p.rating}` : ""}`);
    });
  }

  if (ctx.neighborhoods.length) {
    lines.push("\n=== BEST STAY AREAS ===");
    ctx.neighborhoods.forEach((p) => {
      lines.push(`- ${p.name}`);
    });
  }

  return lines.join("\n");
}
