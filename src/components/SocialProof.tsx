"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { Locale } from "@/i18n/config";

type Entry = { name: string; city: string; destination: string };

const AR_ENTRIES: Entry[] = [
  { name: "نورة", city: "الرياض", destination: "المالديف" },
  { name: "خالد", city: "جدة", destination: "أنطاليا" },
  { name: "سارة", city: "الدمام", destination: "دبي" },
  { name: "أحمد", city: "مكة", destination: "إسطنبول" },
  { name: "ريم", city: "أبوظبي", destination: "باريس" },
  { name: "فهد", city: "الكويت", destination: "لندن" },
  { name: "ليلى", city: "الدوحة", destination: "بالي" },
];

const EN_ENTRIES: Entry[] = [
  { name: "Sarah", city: "London", destination: "Maldives" },
  { name: "Daniel", city: "New York", destination: "Tokyo" },
  { name: "Emma", city: "Paris", destination: "Bali" },
  { name: "James", city: "Sydney", destination: "Santorini" },
  { name: "Sofia", city: "Madrid", destination: "Dubai" },
  { name: "Liam", city: "Toronto", destination: "Antalya" },
  { name: "Mia", city: "Berlin", destination: "Istanbul" },
];

export function SocialProof({ locale }: { locale: Locale }) {
  const list = locale === "ar" ? AR_ENTRIES : EN_ENTRIES;
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % list.length), 4200);
    return () => clearInterval(id);
  }, [list.length]);

  const e = list[i];
  const text =
    locale === "ar"
      ? `${e.name} من ${e.city} حجز رحلة إلى ${e.destination}`
      : `${e.name} from ${e.city} booked a trip to ${e.destination}`;

  return (
    <div className="pointer-events-none fixed bottom-5 start-5 z-40 hidden sm:block">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.45 }}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-ink-900/80 px-3.5 py-2 text-xs text-white/85 shadow-2xl backdrop-blur-xl"
        >
          <Sparkles className="h-3.5 w-3.5 text-brand-primary" strokeWidth={2} />
          <span className="font-medium">{text}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
