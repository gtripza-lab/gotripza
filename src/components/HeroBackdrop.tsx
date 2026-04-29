"use client";
import Image from "next/image";

// Santorini sunset — hotlinked directly from Unsplash as required by their guidelines
const HERO_PHOTO = {
  url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1920&q=85&fm=webp&fit=crop",
  photographer: "Yoann Boyer",
  photographerUrl: "https://unsplash.com/@yoannboyer?utm_source=gotripza&utm_medium=referral",
  link: "https://unsplash.com/photos/photo-1570077188670-e3a8d69ac5ff?utm_source=gotripza&utm_medium=referral",
};

export function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Santorini sunset — hotlinked from Unsplash */}
      <Image
        src={HERO_PHOTO.url}
        alt="Santorini sunset"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
        style={{ objectPosition: "50% 40%" }}
      />

      {/* Soft purple-pink overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(180,140,220,0.25) 0%, rgba(120,100,200,0.15) 40%, rgba(20,10,40,0.55) 100%)",
        }}
      />

      {/* Brand glow center */}
      <div
        className="absolute top-1/3 start-1/2 h-[320px] w-[320px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(180, 140, 255, 0.20) 0%, transparent 65%)",
        }}
      />

      {/* Bottom fade to dark */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-ink-950" />

      {/* Unsplash attribution — required by API guidelines */}
      <div className="pointer-events-auto absolute bottom-52 end-3 z-10">
        <span dir="ltr" className="inline-flex items-center gap-1 rounded-full bg-black/30 px-2.5 py-1 text-[10px] text-white/50 backdrop-blur-sm">
          Photo by{" "}
          <a
            href={HERO_PHOTO.photographerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-white/80 transition"
          >
            {HERO_PHOTO.photographer}
          </a>
          {" "}on{" "}
          <a
            href="https://unsplash.com?utm_source=gotripza&utm_medium=referral"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-white/80 transition"
          >
            Unsplash
          </a>
        </span>
      </div>
    </div>
  );
}
