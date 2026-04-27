"use client";
import Image from "next/image";

export function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      {/* Real Santorini sunset photo */}
      <Image
        src="https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1920&q=85&fm=webp&fit=crop"
        alt="Santorini sunset"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
        style={{ objectPosition: "50% 40%" }}
      />

      {/* Soft purple-pink overlay to match the photo's mood and keep text readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(180,140,220,0.25) 0%, rgba(120,100,200,0.15) 40%, rgba(20,10,40,0.55) 100%)",
        }}
      />

      {/* Brand glow center — subtle */}
      <div
        className="absolute top-1/3 start-1/2 h-[320px] w-[320px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(180, 140, 255, 0.20) 0%, transparent 65%)",
        }}
      />

      {/* Bottom fade to dark — smooth transition into the rest of the page */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-ink-950" />
    </div>
  );
}
