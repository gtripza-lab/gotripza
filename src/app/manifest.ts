import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Rya Companion — GoTripza",
    short_name: "Rya",
    description:
      "Install Rya, GoTripza's mobile travel companion for planning, translation, safety, airports, and trip help.",
    start_url: "/ar/search?source=pwa",
    scope: "/",
    display: "standalone",
    background_color: "#0a0a14",
    theme_color: "#5a6cff",
    orientation: "portrait-primary",
    categories: ["travel", "lifestyle"],
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    screenshots: [
      {
        src: "/og-image.png",
        sizes: "1200x630",
        type: "image/png",
      },
    ],
  };
}
