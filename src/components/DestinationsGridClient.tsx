"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { Mountain, Plane, Building2, Compass, type LucideIcon } from "lucide-react";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { UnsplashPhoto } from "@/lib/unsplash";

type ItemKey = "story" | "fly" | "stay" | "explore";

type Item = {
  key: ItemKey;
  gradient: string;
  icon: LucideIcon;
  /** Reliable fallback Unsplash photo — shown when the API key is absent */
  fallbackUrl: string;
  fallbackAlt: string;
};

const ITEMS: Item[] = [
  {
    key: "story",
    icon: Mountain,
    gradient: "from-slate-700 via-indigo-900 to-purple-900",
    fallbackUrl:
      "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=85&fm=webp&fit=crop&crop=entropy",
    fallbackAlt: "Mountain lake landscape",
  },
  {
    key: "fly",
    icon: Plane,
    gradient: "from-orange-700 via-rose-800 to-indigo-900",
    fallbackUrl:
      "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=85&fm=webp&fit=crop&crop=entropy",
    fallbackAlt: "Airplane wing at sunset",
  },
  {
    key: "stay",
    icon: Building2,
    gradient: "from-teal-800 via-emerald-900 to-slate-900",
    fallbackUrl:
      "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=600&q=85&fm=webp&fit=crop&crop=entropy",
    fallbackAlt: "Overwater villa Maldives luxury",
  },
  {
    key: "explore",
    icon: Compass,
    gradient: "from-cyan-700 via-teal-700 to-emerald-800",
    fallbackUrl:
      "https://images.unsplash.com/photo-1559494007-9f5847c49d94?w=600&q=85&fm=webp&fit=crop&crop=entropy",
    fallbackAlt: "Tropical island aerial turquoise",
  },
];

export function DestinationsGridClient({
  dict,
  photos,
}: {
  dict: Dictionary;
  photos: Record<string, UnsplashPhoto>;
}) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-20">
      <div className="mb-10">
        <h2 className="font-display text-3xl font-bold sm:text-4xl">
          {dict.destinations.title}
        </h2>
        <p className="mt-2 text-white/60">{dict.destinations.subtitle}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map(({ key, icon: Icon, fallbackUrl, fallbackAlt }, i) => {
          const photo = photos[key];
          // Use API photo if available, otherwise use the hardcoded fallback
          const imgUrl = photo?.url || fallbackUrl;
          const imgAlt = photo?.alt || fallbackAlt || dict.destinations.items[key];
          const photographer = photo?.url ? photo.photographer : null;
          const photoLink = photo?.url ? photo.link : null;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group relative aspect-[3/4] overflow-hidden rounded-3xl border border-white/10"
            >
              {/* Real photo — always shown (API or hardcoded fallback) */}
              <Image
                src={imgUrl}
                alt={imgAlt}
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />

              {/* Subtle highlight */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.10),transparent_50%)]" />
              {/* Dark gradient so text stays readable */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

              <div className="absolute end-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-black/30 backdrop-blur-md transition group-hover:bg-white/20">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </div>

              <div className="absolute inset-x-5 bottom-5">
                <h3 className="font-display text-lg font-bold leading-tight text-white">
                  {dict.destinations.items[key]}
                </h3>
                {photographer && photoLink && (
                  <a
                    href={photoLink}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-1 inline-block text-[10px] uppercase tracking-wider text-white/50 hover:text-white/80"
                  >
                    © {photographer} / Unsplash
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
