import "server-only";

const KEY = process.env.UNSPLASH_ACCESS_KEY ?? "";

export type UnsplashPhoto = {
  url: string;
  thumb: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
  link: string;
};

const PLACEHOLDER: UnsplashPhoto = {
  url: "",
  thumb: "",
  alt: "",
  photographer: "Unsplash",
  photographerUrl: "https://unsplash.com",
  link: "https://unsplash.com",
};

/**
 * Fetches a single high-quality landscape photo from Unsplash.
 * Returns a placeholder when the key is missing or the API errors.
 * Cached for 24h via Next's data cache.
 */
export async function fetchPhoto(
  query: string,
  orientation: "landscape" | "portrait" | "squarish" = "landscape",
): Promise<UnsplashPhoto> {
  if (!KEY || !query) return PLACEHOLDER;
  try {
    const u = new URL("https://api.unsplash.com/search/photos");
    u.searchParams.set("query", query);
    u.searchParams.set("orientation", orientation);
    u.searchParams.set("per_page", "1");
    u.searchParams.set("content_filter", "high");
    u.searchParams.set("client_id", KEY);
    const res = await fetch(u.toString(), {
      next: { revalidate: 86400 },
      headers: { "Accept-Version": "v1" },
    });
    if (!res.ok) return PLACEHOLDER;
    const json = (await res.json()) as {
      results?: Array<{
        urls: { regular: string; small: string };
        alt_description?: string;
        description?: string;
        user: { name: string; links: { html: string } };
        links: { html: string };
      }>;
    };
    const r = json.results?.[0];
    if (!r) return PLACEHOLDER;
    return {
      url: r.urls.regular,
      thumb: r.urls.small,
      alt: r.alt_description ?? r.description ?? query,
      photographer: r.user.name,
      photographerUrl: r.user.links.html,
      link: r.links.html,
    };
  } catch {
    return PLACEHOLDER;
  }
}

export async function fetchPhotos(
  queries: string[],
  orientation?: "landscape" | "portrait" | "squarish",
): Promise<UnsplashPhoto[]> {
  return Promise.all(queries.map((q) => fetchPhoto(q, orientation)));
}
