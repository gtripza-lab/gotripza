"use client";
import { motion } from "framer-motion";
import { ExternalLink, ArrowRight } from "lucide-react";
import { logEvent } from "@/lib/events";
import type { PartnerRec } from "@/lib/orchestration";
import type { PartnerCategory } from "@/lib/partners";
import { CATEGORY_META } from "@/lib/partners";

// Tailwind color mapping per partner accent
const ACCENT: Record<string, { border: string; bg: string; text: string; btn: string }> = {
  blue:   { border: "border-blue-500/20",   bg: "bg-blue-500/[0.07]",   text: "text-blue-400",   btn: "from-blue-600 to-blue-700"    },
  teal:   { border: "border-teal-500/20",   bg: "bg-teal-500/[0.07]",   text: "text-teal-400",   btn: "from-teal-600 to-cyan-700"    },
  sky:    { border: "border-sky-500/20",    bg: "bg-sky-500/[0.07]",    text: "text-sky-400",    btn: "from-sky-600 to-blue-700"     },
  emerald:{ border: "border-emerald-500/20",bg: "bg-emerald-500/[0.07]",text: "text-emerald-400",btn: "from-emerald-600 to-teal-700" },
  rose:   { border: "border-rose-500/20",   bg: "bg-rose-500/[0.07]",   text: "text-rose-400",   btn: "from-rose-600 to-pink-700"    },
  orange: { border: "border-orange-500/20", bg: "bg-orange-500/[0.07]", text: "text-orange-400", btn: "from-orange-500 to-red-600"   },
  violet: { border: "border-violet-500/20", bg: "bg-violet-500/[0.07]", text: "text-violet-400", btn: "from-violet-600 to-purple-700"},
  indigo: { border: "border-indigo-500/20", bg: "bg-indigo-500/[0.07]", text: "text-indigo-400", btn: "from-indigo-600 to-blue-700"  },
  cyan:   { border: "border-cyan-500/20",   bg: "bg-cyan-500/[0.07]",   text: "text-cyan-400",   btn: "from-cyan-600 to-teal-700"   },
  purple: { border: "border-purple-500/20", bg: "bg-purple-500/[0.07]", text: "text-purple-400", btn: "from-purple-600 to-violet-700"},
  amber:  { border: "border-amber-500/20",  bg: "bg-amber-500/[0.07]",  text: "text-amber-400",  btn: "from-amber-500 to-orange-600" },
  red:    { border: "border-red-500/20",    bg: "bg-red-500/[0.07]",    text: "text-red-400",    btn: "from-red-600 to-rose-700"     },
};

function accent(color: string) {
  return ACCENT[color] ?? ACCENT["blue"];
}

type Props = {
  recs: PartnerRec[];
  locale: "ar" | "en";
  destination?: string;
  /** compact = inline row (chat), full = grid (results page) */
  variant?: "compact" | "full";
};

export function PartnerRecommendations({ recs, locale, destination, variant = "full" }: Props) {
  if (!recs.length) return null;
  const isAr = locale === "ar";

  // Group by category for the full variant
  const byCategory = new Map<PartnerCategory, PartnerRec[]>();
  for (const rec of recs) {
    const cat = rec.partner.category;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat)!.push(rec);
  }

  if (variant === "compact") {
    return <CompactRow recs={recs} isAr={isAr} destination={destination} />;
  }

  return (
    <div className="mt-10 space-y-8">
      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-white/[0.06]" />
        <span className="text-xs font-semibold uppercase tracking-widest text-white/35">
          {isAr ? "خدمات مُوصى بها لرحلتك" : "Recommended for your trip"}
        </span>
        <div className="h-px flex-1 bg-white/[0.06]" />
      </div>

      {/* Cards by category */}
      {Array.from(byCategory.entries()).map(([cat, catRecs]) => (
        <div key={cat}>
          {/* Category label */}
          <p className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-widest text-white/35">
            <span>{CATEGORY_META[cat]?.icon}</span>
            {isAr ? CATEGORY_META[cat]?.label_ar : CATEGORY_META[cat]?.label_en}
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {catRecs.map((rec, i) => (
              <PartnerCard key={rec.partner.id} rec={rec} isAr={isAr} index={i} destination={destination} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Full Partner Card ─────────────────────────────────────────────────────────

function PartnerCard({
  rec,
  isAr,
  index,
  destination,
}: {
  rec: PartnerRec;
  isAr: boolean;
  index: number;
  destination?: string;
}) {
  const c = accent(rec.partner.accentColor);

  return (
    <motion.a
      href={rec.url}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.06 }}
      onClick={() =>
        logEvent("affiliate_upsell_clicked", {
          type: rec.partner.category,
          partner: rec.partner.id,
          destination: destination ?? "",
        })
      }
      className={`group flex flex-col gap-3 rounded-2xl border p-4 transition hover:shadow-sm ${c.border} ${c.bg}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xl" aria-hidden="true">{rec.partner.icon}</span>
          <div>
            <p className="text-sm font-semibold text-white/90">{rec.partner.name}</p>
            <p className="text-[11px] text-white/45">
              {isAr ? rec.partner.tagline_ar : rec.partner.tagline_en}
            </p>
          </div>
        </div>
        <ExternalLink className={`h-3.5 w-3.5 shrink-0 transition group-hover:translate-x-0.5 ${c.text}`} />
      </div>

      {/* Reason */}
      <p className="rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[11px] leading-relaxed text-white/65">
        {isAr ? rec.reason_ar : rec.reason_en}
      </p>

      {/* CTA */}
      <div className={`inline-flex items-center gap-1.5 self-start rounded-full bg-gradient-to-r px-3 py-1.5 text-xs font-semibold text-white transition group-hover:scale-[1.03] ${c.btn}`}>
        {isAr ? "استعرض الخيارات" : "View options"}
        <ArrowRight className="h-3 w-3 rtl:rotate-180" />
      </div>
    </motion.a>
  );
}

// ── Compact inline row (used in chat bubbles) ─────────────────────────────────

function CompactRow({
  recs,
  isAr,
  destination,
}: {
  recs: PartnerRec[];
  isAr: boolean;
  destination?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {recs.slice(0, 6).map((rec) => {
        const c = accent(rec.partner.accentColor);
        return (
          <a
            key={rec.partner.id}
            href={rec.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              logEvent("affiliate_upsell_clicked", {
                type: rec.partner.category,
                partner: rec.partner.id,
                destination: destination ?? "",
              })
            }
            className={`group flex items-center gap-2 rounded-xl border p-2.5 transition ${c.border} ${c.bg}`}
          >
            <span className="text-base shrink-0" aria-hidden="true">{rec.partner.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-white/80">{rec.partner.name}</p>
              <p className={`text-[10px] ${c.text}`}>
                {isAr
                  ? CATEGORY_META[rec.partner.category]?.label_ar
                  : CATEGORY_META[rec.partner.category]?.label_en}
              </p>
            </div>
            <ExternalLink className="h-3 w-3 shrink-0 text-white/20 transition group-hover:text-white/50" />
          </a>
        );
      })}
    </div>
  );
}
