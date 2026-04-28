"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { Locale } from "@/i18n/config";

type Entry = { name: string; city: string; destination: string; price: string };

const AR_ENTRIES: Entry[] = [
  { name: "نورة", city: "الرياض", destination: "المالديف", price: "٣,٨٠٠ ريال" },
  { name: "خالد", city: "جدة", destination: "أنطاليا", price: "١,١٥٠ ريال" },
  { name: "سارة", city: "الدمام", destination: "دبي", price: "٧٨٠ ريال" },
  { name: "أحمد", city: "الرياض", destination: "إسطنبول", price: "١,٤٥٠ ريال" },
  { name: "ريم", city: "أبوظبي", destination: "باريس", price: "٢,٩٥٠ ريال" },
  { name: "فهد", city: "الكويت", destination: "لندن", price: "٢,٢٠٠ ريال" },
  { name: "ليلى", city: "الدوحة", destination: "بالي", price: "٣,٣٠٠ ريال" },
];

const EN_ENTRIES: Entry[] = [
  { name: "Sarah", city: "London", destination: "Maldives", price: "$890" },
  { name: "Daniel", city: "New York", destination: "Tokyo", price: "$760" },
  { name: "Emma", city: "Paris", destination: "Bali", price: "$640" },
  { name: "James", city: "Sydney", destination: "Santorini", price: "$720" },
  { name: "Sofia", city: "Madrid", destination: "Dubai", price: "$310" },
  { name: "Liam", city: "Toronto", destination: "Antalya", price: "$420" },
  { name: "Mia", city: "Berlin", destination: "Istanbul", price: "$280" },
];

export function SocialProof({ locale }: { locale: Locale }) {
  const list = locale === "ar" ? AR_ENTRIES : EN_ENTRIES;
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % list.length), 4500);
    return () => clearInterval(id);
  }, [list.length]);

  const e = list[i];
  const text =
    locale === "ar"
      ? `${e.name} من ${e.city} حجز ${e.destination} بـ ${e.price}`
      : `${e.name} from ${e.city} booked ${e.destination} for ${e.price}`;

  return (
    <div className="pointer-events-none fixed bottom-5 start-5 z-40 hidden sm:block">
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 14, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-2.5 rounded-2xl border border-white/10 bg-ink-900/85 px-4 py-2.5 text-xs text-white/85 shadow-2xl backdrop-blur-xl"
        >
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" strokeWidth={2} />
          <span>{text}</span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
