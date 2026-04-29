"use client";

import { useRouter } from "next/navigation";
import { Sparkles, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface BlogSearchCTAProps {
  locale: "ar" | "en";
  destination?: string;
}

export function BlogSearchCTA({ locale, destination }: BlogSearchCTAProps) {
  const router = useRouter();
  const isAr = locale === "ar";

  const displayDestination = isAr
    ? (destination ?? "وجهتك")
    : (destination ?? "your destination");

  const heading = isAr
    ? `ابحث الآن عن أفضل أسعار الطيران والفنادق إلى ${displayDestination} — مجاناً بلا رسوم`
    : `Find the best flights and hotels to ${displayDestination} — free, no fees`;

  const buttonLabel = isAr ? "ابحث مجاناً" : "Search Free";

  const searchQuery = destination
    ? `flights and hotels to ${destination}`
    : "best trip deals";

  const href = `/${locale}/search?q=${encodeURIComponent(searchQuery)}`;

  function handleClick() {
    router.push(href);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-brand-primary/30 bg-white/10 backdrop-blur-md p-8 flex flex-col items-center gap-5 text-center shadow-lg"
      dir={isAr ? "rtl" : "ltr"}
    >
      <Sparkles className="w-8 h-8 text-brand-primary" aria-hidden="true" />

      <p className="text-lg font-semibold leading-relaxed text-foreground max-w-xl">
        {heading}
      </p>

      <button
        onClick={handleClick}
        className="inline-flex items-center gap-2 rounded-2xl bg-brand-primary px-6 py-3 text-sm font-bold text-white shadow-md transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
        aria-label={buttonLabel}
      >
        {buttonLabel}
        <ArrowRight
          className={`w-4 h-4 ${isAr ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
    </motion.div>
  );
}
