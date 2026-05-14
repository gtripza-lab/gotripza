import type { Locale } from "@/i18n/config";
import type { TravelContext } from "./schemas/intent";

export type TripLifecycleStage = NonNullable<TravelContext["booking_stage"]>;

const PROGRESSIVE_STAGES: TripLifecycleStage[] = [
  "browsing",
  "planning",
  "ready_to_book",
  "booked",
  "pre_trip",
  "in_trip",
  "post_trip",
];

const POST_BOOKING_STAGES = new Set<TripLifecycleStage>([
  "booked",
  "pre_trip",
  "in_trip",
  "post_trip",
]);

const STAGE_RANK = new Map<TripLifecycleStage, number>(
  PROGRESSIVE_STAGES.map((stage, index) => [stage, index + 1]),
);

function parseDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function daysBetween(a: Date, b: Date): number {
  return Math.floor((b.getTime() - a.getTime()) / 86_400_000);
}

export function isPostBookingLifecycle(stage: TravelContext["booking_stage"]): boolean {
  return stage ? POST_BOOKING_STAGES.has(stage) : false;
}

export function detectLifecycleFromText(text: string): TripLifecycleStage | null {
  const q = text.toLowerCase();

  if (/دعم|مشكلة|شكوى|support|refund|not working|لا يعمل|لم تصل/i.test(q)) return "support";
  if (/رجعت|انتهت الرحلة|بعد الرحلة|تقييم الرحلة|كيف كانت الرحلة|post[-\s]?trip|trip ended|back home/i.test(q)) {
    return "post_trip";
  }
  if (
    /وصلت|انا في|أنا في|داخل|في المطار|عند البوابة|تاكسي|منيو|لافتة|تذكرة|ترجم|ترجمة|ضعت|طوارئ|جوازي|جواز|شنطتي ضاعت|حلال|مطعم|فاتورة|صورة|محتاج مساعدة الآن|during the trip|arrived|i am in|i'm in|at the airport|gate|terminal|taxi|menu|sign|emergency|passport|lost bag|halal|restaurant|receipt|photo|image/i.test(q)
  ) {
    return "in_trip";
  }
  if (
    /قبل السفر|باقي|أجهز|اجهز|شنطة|الشنطة|ماذا أحضر|ماذا احضر|مطار|بوابة|تفعيل الشريحة|الشريحة قبل|الطقس قبل|تحويلات|أدوية|ادوية|pre[-\s]?trip|packing|before travel|before my trip|departure soon|what to pack/i.test(q)
  ) {
    return "pre_trip";
  }
  if (
    /حجزت|تم الحجز|عندي حجز|اشتريت التذكرة|اشتريت التذاكر|دفعت|تم الدفع|حملت ريا|ثبت التطبيق|فعلت ريا|فعّلت ريا|booked|i booked|paid|ticket is booked|installed rya/i.test(q)
  ) {
    return "booked";
  }
  if (/احجز|احجزلي|أرخص|سعر|عروض|تذاكر|book|booking|deal|price|ready/i.test(q)) return "ready_to_book";
  if (/خطة|خطط|برنامج|جدول|itinerary|plan|schedule|budget|ميزانية/i.test(q)) return "planning";
  if (/أفضل|هل|كيف|متى|قارن|compare|best|should|what|when|how|is it/i.test(q)) return "browsing";
  return null;
}

export function mergeLifecycleStage(
  current: TravelContext["booking_stage"],
  next: TravelContext["booking_stage"],
): TravelContext["booking_stage"] {
  if (!next) return current ?? null;
  if (next === "support") return next;
  if (!current || current === "support") return next;
  if (next === "browsing" && current !== "browsing") return current;

  const currentRank = STAGE_RANK.get(current) ?? 0;
  const nextRank = STAGE_RANK.get(next) ?? 0;
  return nextRank >= currentRank ? next : current;
}

export function deriveTripLifecycle(context: TravelContext): TripLifecycleStage {
  const explicit = context.booking_stage;
  if (explicit === "support") return "support";

  const departure = parseDate(context.departure_date);
  const today = new Date();
  if (departure) {
    const returnDate = parseDate(context.return_date);
    const untilDeparture = daysBetween(today, departure);
    const afterReturn = returnDate ? daysBetween(returnDate, today) : null;
    if (returnDate && today >= departure && today <= returnDate) return "in_trip";
    if (afterReturn !== null && afterReturn > 0) return "post_trip";
    if (untilDeparture >= 0 && untilDeparture <= 10 && (explicit === "booked" || explicit === "pre_trip")) {
      return "pre_trip";
    }
  }

  return explicit ?? (context.destination ? "planning" : "browsing");
}

export function labelTripLifecycle(stage: TravelContext["booking_stage"], locale: Locale): string {
  const isAr = locale === "ar";
  const value = stage ?? "browsing";
  const ar: Record<TripLifecycleStage, string> = {
    browsing: "استكشاف",
    planning: "تخطيط",
    ready_to_book: "جاهز للحجز",
    booked: "تم الحجز",
    pre_trip: "قبل السفر",
    in_trip: "أثناء الرحلة",
    post_trip: "بعد الرحلة",
    support: "دعم",
  };
  const en: Record<TripLifecycleStage, string> = {
    browsing: "Browsing",
    planning: "Planning",
    ready_to_book: "Ready to book",
    booked: "Booked",
    pre_trip: "Pre-trip",
    in_trip: "In trip",
    post_trip: "Post-trip",
    support: "Support",
  };
  return isAr ? ar[value] : en[value];
}

export function lifecycleSummary(stage: TripLifecycleStage, locale: Locale): string {
  const isAr = locale === "ar";
  if (stage === "booked") {
    return isAr ? "نترك الحجز الآن ونركز على تجهيز الرحلة." : "Booking is done; focus shifts to trip preparation.";
  }
  if (stage === "pre_trip") {
    return isAr ? "جهزي/جهز الوصول، الشريحة، التأمين، والشنطة بهدوء." : "Prepare arrival, data, insurance, and packing calmly.";
  }
  if (stage === "in_trip") {
    return isAr
      ? "ريا معك للمواقف اليومية: ترجمة، صور، مطار، أمان، أكل، طوارئ، وميزانية."
      : "Rya helps with live moments: translation, images, airport, safety, food, emergencies, and budget.";
  }
  if (stage === "post_trip") {
    return isAr ? "نراجع التجربة ونحفظ ما تعلمناه للرحلة القادمة." : "Review the trip and keep what we learned for next time.";
  }
  if (stage === "ready_to_book") {
    return isAr ? "عندما تقول إنك جاهز، تظهر الخيارات المناسبة فقط." : "When you are ready, relevant booking options appear.";
  }
  return isAr ? "ريا تجمع الصورة قبل أي توصية أو حجز." : "Rya builds context before recommending or booking.";
}

export type LifecycleAction = {
  id: string;
  label: string;
  prompt: string;
  kind:
    | "plan"
    | "airport"
    | "translate"
    | "image"
    | "safety"
    | "budget"
    | "data"
    | "packing"
    | "transport"
    | "emergency"
    | "food"
    | "family"
    | "romance"
    | "review"
    | "booking"
    | "support";
};

export function getLifecycleActions(context: TravelContext, locale: Locale): LifecycleAction[] {
  const isAr = locale === "ar";
  const stage = deriveTripLifecycle(context);
  const destination = context.destination ?? (isAr ? "وجهتي" : "my destination");

  if (stage === "booked" || stage === "pre_trip") {
    return [
      {
        id: "arrival-plan",
        kind: "airport",
        label: isAr ? "خطة الوصول" : "Arrival plan",
        prompt: isAr
          ? `رتب لي خطة الوصول إلى ${destination}: المطار، التنقل، وقت الوصول، وأول ساعتين بعد الوصول. لا تعرض حجوزات جديدة إلا إذا طلبت.`
          : `Build my arrival plan for ${destination}: airport, transport, arrival timing, and first two hours. Do not show new bookings unless I ask.`,
      },
      {
        id: "pre-trip-checklist",
        kind: "plan",
        label: isAr ? "قائمة التجهيز" : "Trip checklist",
        prompt: isAr
          ? `جهز لي قائمة قبل السفر إلى ${destination}: وثائق، شريحة، تأمين، طقس، شنطة، وتنبيهات مهمة.`
          : `Create my pre-trip checklist for ${destination}: documents, data, insurance, weather, packing, and key alerts.`,
      },
      {
        id: "data-roaming",
        kind: "data",
        label: isAr ? "الإنترنت" : "Mobile data",
        prompt: isAr
          ? `ساعدني أقرر كيف أجهز الإنترنت في ${destination}: eSIM أو رومينغ أو واي فاي، مع نصيحة عملية.`
          : `Help me choose mobile data for ${destination}: eSIM, roaming, or Wi-Fi, with practical advice.`,
      },
      {
        id: "weather-packing",
        kind: "packing",
        label: isAr ? "الطقس والشنطة" : "Weather & bag",
        prompt: isAr
          ? `راجع لي الطقس المتوقع في ${destination} وما الذي أضعه في الشنطة بدون مبالغة.`
          : `Review likely weather in ${destination} and what to pack without overpacking.`,
      },
      {
        id: "airport-transfer",
        kind: "transport",
        label: isAr ? "تنقل المطار" : "Airport transfer",
        prompt: isAr
          ? `ساعدني أختار أفضل تنقل من مطار ${destination} إلى السكن: تاكسي رسمي، تطبيق، مترو، أو باص، مع السعر الطبيعي وما أتجنبه.`
          : `Help me choose the best airport transfer in ${destination}: official taxi, app, metro, or bus, with normal price ranges and what to avoid.`,
      },
      {
        id: "emergency-ready",
        kind: "emergency",
        label: isAr ? "طوارئ السفر" : "Emergency help",
        prompt: isAr
          ? `جهز لي خطة طوارئ مختصرة لرحلتي إلى ${destination}: جواز، شنطة ضائعة، مرض، تأخير رحلة، وأرقام/خطوات أبدأ بها.`
          : `Prepare a short emergency plan for my trip to ${destination}: passport, lost bag, illness, flight delay, and first steps.`,
      },
    ];
  }

  if (stage === "in_trip") {
    return [
      {
        id: "translate-live",
        kind: "translate",
        label: isAr ? "ترجمة الآن" : "Translate now",
        prompt: isAr
          ? `أنا أثناء الرحلة في ${destination}. ساعدني بترجمة موقف أو عبارة، واسألني فقط عن النص أو الصورة.`
          : `I am in ${destination}. Help me translate a live situation or phrase, and only ask for the text or image.`,
      },
      {
        id: "image-reader",
        kind: "image",
        label: isAr ? "افهم صورة" : "Read image",
        prompt: isAr
          ? `أريد فهم صورة أثناء الرحلة في ${destination}: قائمة طعام أو لوحة أو تذكرة أو فاتورة. اطلب مني رفع الصورة ثم اشرحها بالعربية مع ما أفعل الآن.`
          : `I need help understanding a travel image in ${destination}: menu, sign, ticket, or receipt. Ask me to upload it, then explain what it means and what to do now.`,
      },
      {
        id: "nearby-help",
        kind: "plan",
        label: isAr ? "ماذا أفعل الآن؟" : "What now?",
        prompt: isAr
          ? `أنا الآن في ${destination}. اقترح لي خطوة مناسبة قريبة حسب الوقت والجهد، بدون بطاقات حجز مزعجة.`
          : `I am in ${destination} now. Suggest a nearby next step based on time and energy, without noisy booking cards.`,
      },
      {
        id: "safety-now",
        kind: "safety",
        label: isAr ? "أمان واحتيال" : "Safety",
        prompt: isAr
          ? `أعطني تنبيهات أمان واحتيال عملية في ${destination} أثناء الرحلة، مختصرة وهادئة.`
          : `Give me calm, practical safety and scam guidance in ${destination} during the trip.`,
      },
      {
        id: "daily-budget",
        kind: "budget",
        label: isAr ? "ميزانية اليوم" : "Daily budget",
        prompt: isAr
          ? `ساعدني أضبط ميزانية اليوم في ${destination}: أكل، تنقل، أنشطة، ومبلغ احتياطي.`
          : `Help me manage today's budget in ${destination}: food, transport, activities, and a buffer.`,
      },
      {
        id: "food-halal",
        kind: "food",
        label: isAr ? "أكل وحلال" : "Food help",
        prompt: isAr
          ? `ساعدني أختار أكل مناسب في ${destination}: مطاعم حلال أو خيارات آمنة، أطباق محلية، وما أسأل عنه قبل الطلب.`
          : `Help me choose food in ${destination}: halal or safe options, local dishes, and what to ask before ordering.`,
      },
      {
        id: "emergency-now",
        kind: "emergency",
        label: isAr ? "مشكلة الآن" : "Urgent help",
        prompt: isAr
          ? `أنا في موقف سفر مزعج الآن في ${destination}. ساعدني بخطوات قصيرة: ماذا أفعل أولاً، ماذا أقول، ومتى أطلب مساعدة رسمية؟`
          : `I am in a stressful travel situation now in ${destination}. Give me short steps: what to do first, what to say, and when to ask for official help.`,
      },
    ];
  }

  if (stage === "post_trip") {
    return [
      {
        id: "trip-review",
        kind: "review",
        label: isAr ? "راجع الرحلة" : "Review trip",
        prompt: isAr
          ? `راجع معي الرحلة إلى ${destination}: ما الذي كان ممتازاً، ما الذي نحسنه، وما التفضيلات التي تحفظها ريا للرحلة القادمة؟`
          : `Review my trip to ${destination}: what worked, what to improve, and what Rya should remember for next time.`,
      },
      {
        id: "compensation-check",
        kind: "support",
        label: isAr ? "تعويض الرحلة" : "Compensation",
        prompt: isAr
          ? `افحص معي هل يوجد تأخير أو إلغاء رحلة يستحق تعويضاً، واسألني عن التفاصيل المطلوبة فقط.`
          : `Help me check whether a delay or cancellation may qualify for compensation, asking only for the needed details.`,
      },
    ];
  }

  return [
    {
      id: "build-plan",
      kind: "plan",
      label: isAr ? "ابني الخطة" : "Build plan",
      prompt: isAr
        ? `ابني لي خطة سفر إلى ${destination}. اسأل سؤالاً واحداً فقط عن أهم معلومة ناقصة ثم ابدأ بخطة عملية.`
        : `Build my trip plan for ${destination}. Ask only one key missing question, then start a practical plan.`,
    },
    {
      id: "budget-fit",
      kind: "budget",
      label: isAr ? "هل تناسب ميزانيتي؟" : "Budget fit",
      prompt: isAr
        ? `هل ${destination} تناسب ميزانيتي؟ أعطني تقديراً واضحاً ونصائح تخفيض التكلفة.`
        : `Does ${destination} fit my budget? Give me a clear estimate and cost-saving advice.`,
    },
    {
      id: "family-fit",
      kind: "family",
      label: isAr ? "مناسب للعائلة؟" : "Family fit",
      prompt: isAr
        ? `هل ${destination} مناسبة لعائلة؟ قيّمها من ناحية السكن، التنقل، الأطفال، الأمان، والجدول اليومي.`
        : `Is ${destination} good for a family trip? Evaluate stay areas, transport, kids, safety, and daily pacing.`,
    },
    {
      id: "honeymoon-fit",
      kind: "romance",
      label: isAr ? "شهر عسل؟" : "Honeymoon fit",
      prompt: isAr
        ? `هل ${destination} مناسبة لشهر عسل؟ اقترح أسلوب رحلة رومانسي وهادئ مع مناطق وتجارب مناسبة.`
        : `Is ${destination} good for a honeymoon? Suggest a calm romantic trip style with stay areas and experiences.`,
    },
    {
      id: "ready-book",
      kind: "booking",
      label: isAr ? "أنا جاهز للحجز" : "Ready to book",
      prompt: isAr
        ? `أنا جاهز للحجز. اعرض لي فقط الخيارات المناسبة لسياق رحلتي، بدون تكرار أو ازدحام.`
        : `I am ready to book. Show only options that match my trip context, without repetition or clutter.`,
    },
  ];
}
