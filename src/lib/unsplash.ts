import "server-only";

const KEY = process.env.UNSPLASH_ACCESS_KEY ?? "";

export type UnsplashPhoto = {
  id: string;
  url: string;
  thumb: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
  link: string;
  /** The download location URL — must be called when a user "uses" the photo */
  downloadLocation: string;
};

const PLACEHOLDER: UnsplashPhoto = {
  id: "",
  url: "",
  thumb: "",
  alt: "",
  photographer: "Unsplash",
  photographerUrl: "https://unsplash.com",
  link: "https://unsplash.com",
  downloadLocation: "",
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
        id: string;
        urls: { regular: string; small: string };
        alt_description?: string;
        description?: string;
        user: { name: string; links: { html: string } };
        links: { html: string; download_location: string };
      }>;
    };
    const r = json.results?.[0];
    if (!r) return PLACEHOLDER;
    return {
      id: r.id,
      url: r.urls.regular,
      thumb: r.urls.small,
      alt: r.alt_description ?? r.description ?? query,
      photographer: r.user.name,
      photographerUrl: `${r.user.links.html}?utm_source=gotripza&utm_medium=referral`,
      link: `${r.links.html}?utm_source=gotripza&utm_medium=referral`,
      downloadLocation: r.links.download_location,
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

/**
 * Triggers the Unsplash download event for a photo.
 * REQUIRED by Unsplash API guidelines whenever a user "uses" a photo.
 * Should be called server-side (e.g. from an API route).
 */
export async function triggerUnsplashDownload(downloadLocation: string): Promise<void> {
  if (!KEY || !downloadLocation) return;
  try {
    // Append client_id to the download_location URL
    const url = new URL(downloadLocation);
    url.searchParams.set("client_id", KEY);
    await fetch(url.toString(), {
      headers: { "Accept-Version": "v1" },
      // fire-and-forget — don't block on result
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Non-blocking — silently ignore errors
  }
}
