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

      {/* Rya global-tech overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(6,10,19,0.72) 0%, rgba(11,16,32,0.82) 45%, rgba(6,10,19,0.96) 100%)",
        }}
      />

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:56px_56px] opacity-55" />

      {/* Brand glow center */}
      <div
        className="absolute top-1/3 start-1/2 h-[320px] w-[320px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(59,130,246,0.25) 0%, rgba(0,212,179,0.11) 46%, transparent 70%)",
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
