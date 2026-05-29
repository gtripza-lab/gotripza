"use client";

import { ExternalLink } from "lucide-react";
import { logEvent } from "@/lib/events";
import type { ServiceCard } from "@/lib/services/chat-recommendations";

interface ServiceCardsProps {
  cards: ServiceCard[];
  locale: "ar" | "en";
}

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; icon: string }> = {
  blue:    { bg: "rgba(59,130,246,0.12)",   border: "rgba(59,130,246,0.25)",   text: "#60a5fa",  icon: "#3b82f6" },
  violet:  { bg: "rgba(139,92,246,0.12)",   border: "rgba(139,92,246,0.25)",   text: "#a78bfa",  icon: "#8b5cf6" },
  emerald: { bg: "rgba(16,185,129,0.12)",   border: "rgba(16,185,129,0.25)",   text: "#34d399",  icon: "#10b981" },
  amber:   { bg: "rgba(245,158,11,0.12)",   border: "rgba(245,158,11,0.25)",   text: "#fbbf24",  icon: "#f59e0b" },
  orange:  { bg: "rgba(249,115,22,0.12)",   border: "rgba(249,115,22,0.25)",   text: "#fb923c",  icon: "#f97316" },
};

export function ServiceCards({ cards, locale }: ServiceCardsProps) {
  const isAr = locale === "ar";

  if (!cards.length) return null;

  return (
    <div
      className="mt-3 flex gap-2.5"
      dir={isAr ? "rtl" : "ltr"}
      style={{ flexDirection: isAr ? "row-reverse" : "row" }}
    >
      {cards.map((card) => {
        const colors = COLOR_MAP[card.color] ?? COLOR_MAP.blue;
        const title = isAr ? card.titleAr : card.titleEn;
        const desc = isAr ? card.descAr : card.descEn;

        return (
          <a
            key={card.id}
            href={card.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => logEvent("service_card_clicked", { cardId: card.id, url: card.url })}
            className="flex flex-1 min-w-0 flex-col gap-1.5 rounded-xl border px-3 py-2.5 transition-all active:scale-[0.97]"
            style={{
              background: colors.bg,
              borderColor: colors.border,
              textDecoration: "none",
            }}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-base leading-none">{card.icon}</span>
              <ExternalLink
                size={11}
                style={{ color: colors.icon, opacity: 0.7, flexShrink: 0 }}
              />
            </div>
            <p
              className="truncate text-[12px] font-semibold leading-snug"
              style={{ color: colors.text }}
            >
              {title}
            </p>
            <p className="line-clamp-2 text-[10.5px] leading-snug text-white/50">
              {desc}
            </p>
          </a>
        );
      })}
    </div>
  );
}
