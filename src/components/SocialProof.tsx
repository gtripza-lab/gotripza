"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import type { Locale } from "@/i18n/config";

type TrustSignal = { textAr: string; textEn: string };

const TRUST_SIGNALS: TrustSignal[] = [
  {
    textAr: "ريا تحفظ سياق رحلتك داخل المحادثة ولا تعيد الأسئلة المعروفة.",
    textEn: "Rya keeps trip context in the conversation and avoids repeated questions.",
  },
  {
    textAr: "روابط الشركاء قد تمنح GoTripza عمولة بدون زيادة السعر عليك.",
    textEn: "Partner links may earn GoTripza a commission without increasing your price.",
  },
  {
    textAr: "اقتراحات التأمين و eSIM تظهر فقط عندما تخدم سياق الرحلة.",
    textEn: "Insurance and eSIM suggestions appear only when they fit the trip context.",
  },
  {
    textAr: "الفنادق حالياً تُعرض كإرشاد مناطق سكن إلى أن يكتمل ربط العروض.",
    textEn: "Hotels currently focus on stay-area guidance until direct offers are connected.",
  },
  {
    textAr: "تقييمات ريا تظهر في لوحة الأدمن حتى نعرف الردود التي تحتاج تحسين.",
    textEn: "Rya ratings surface in admin so weak replies can be improved.",
  },
];

export function SocialProof({ locale }: { locale: Locale }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % TRUST_SIGNALS.length), 5200);
    return () => clearInterval(id);
  }, []);

  const signal = TRUST_SIGNALS[i];
  const text = locale === "ar" ? signal.textAr : signal.textEn;

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
