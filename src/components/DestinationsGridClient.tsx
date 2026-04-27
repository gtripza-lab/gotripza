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
};

const ITEMS: Item[] = [
  { key: "story", icon: Mountain, gradient: "from-slate-700 via-indigo-900 to-purple-900" },
  { key: "fly", icon: Plane, gradient: "from-orange-700 via-rose-800 to-indigo-900" },
  { key: "stay", icon: Building2, gradient: "from-teal-800 via-emerald-900 to-slate-900" },
  { key: "explore", icon: Compass, gradient: "from-cyan-700 via-teal-700 to-emerald-800" },
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
        {ITEMS.map(({ key, icon: Icon, gradient }, i) => {
          const photo = photos[key];
          const hasPhoto = Boolean(photo?.url);
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.06 }}
              className="group relative aspect-[3/4] overflow-hidden rounded-3xl border border-white/10"
            >
              {hasPhoto ? (
                <Image
                  src={photo.url}
                  alt={photo.alt || dict.destinations.items[key]}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
              ) : (
                <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
              )}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
              <div className="absolute inset-0 grid-noise opacity-20 mix-blend-overlay" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />

              <div className="absolute end-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10 backdrop-blur-md transition group-hover:bg-white/20">
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </div>

              <div className="absolute inset-x-5 bottom-5">
                <h3 className="font-display text-lg font-bold leading-tight text-white">
                  {dict.destinations.items[key]}
                </h3>
                {hasPhoto && photo.photographer && (
                  <a
                    href={photo.link}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="mt-1 inline-block text-[10px] uppercase tracking-wider text-white/50 hover:text-white/80"
                  >
                    © {photo.photographer} / Unsplash
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
