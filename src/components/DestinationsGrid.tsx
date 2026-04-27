import { fetchPhotos, type UnsplashPhoto } from "@/lib/unsplash";
import type { Dictionary } from "@/i18n/get-dictionary";
import { DestinationsGridClient } from "./DestinationsGridClient";

const QUERIES: Record<string, string> = {
  story: "mountain lake landscape cinematic",
  fly: "airplane wing sunset clouds",
  stay: "overwater villa maldives luxury",
  explore: "tropical island aerial turquoise",
};

export async function DestinationsGrid({ dict }: { dict: Dictionary }) {
  const keys = ["story", "fly", "stay", "explore"] as const;
  const photos = await fetchPhotos(keys.map((k) => QUERIES[k]));
  const photoMap: Record<string, UnsplashPhoto> = {};
  keys.forEach((k, i) => {
    photoMap[k] = photos[i];
  });
  return <DestinationsGridClient dict={dict} photos={photoMap} />;
}
