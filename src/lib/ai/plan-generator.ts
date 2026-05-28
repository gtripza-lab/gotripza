import "server-only";
import OpenAI from "openai";
import { HAS_OPENAI_KEY, MODEL_PRIMARY, AI_TIMEOUT_MS, AI_MAX_RETRIES } from "./config";
import type { TripPlan, TripPlanInput, PlannerTripType } from "../trip-planner";

let _client: OpenAI | null = null;
function getClient(): OpenAI {
  if (!HAS_OPENAI_KEY) throw new Error("[plan-gen] OPENAI_API_KEY not set");
  _client ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    timeout: AI_TIMEOUT_MS,
    maxRetries: AI_MAX_RETRIES,
  });
  return _client;
}

const TRIP_TYPE_LABELS: Record<"ar" | "en", Record<PlannerTripType, string>> = {
  ar: {
    balanced: "متوازنة",
    family: "عائلية",
    honeymoon: "شهر عسل",
    budget: "اقتصادية",
    adventure: "مغامرات",
    business: "عمل",
  },
  en: {
    balanced: "balanced",
    family: "family",
    honeymoon: "honeymoon",
    budget: "budget",
    adventure: "adventure",
    business: "business",
  },
};

const INTEREST_LABELS: Record<string, { ar: string; en: string }> = {
  nature: { ar: "طبيعة", en: "nature" },
  kids: { ar: "أطفال", en: "kids" },
  shopping: { ar: "تسوق", en: "shopping" },
  food: { ar: "مطاعم", en: "food" },
  culture: { ar: "ثقافة", en: "culture" },
  relax: { ar: "راحة", en: "relaxed pacing" },
};

function systemPrompt(isAr: boolean, month: string): string {
  if (isAr) {
    return `أنت مخطط سفر محترف من GoTripza. الشهر الحالي: ${month}.
مهمتك: إنشاء خطة سفر تفصيلية وعملية بصيغة JSON.

قواعد صارمة — لا استثناء:
1. كل يوم يذكر أماكن محددة بالاسم الصريح: (مثال: "سوق البازار الكبير"، "حي بيوغلو"، "تلة كاملكا") — ممنوع: "معلم سياحي" أو "مطعم محلي"
2. كل فقرة صباح/ظهر/مساء تذكر نشاطاً واحداً على الأقل باسم مكان حقيقي + التوقيت التقريبي (مثال: "9 صباحاً انطلق إلى...")
3. الميزانية محسوبة بدقة حسب الوجهة والموسم (شهر ${month}) والعدد
4. نصائح التأشيرة مخصصة للجنسية السعودية + الإقامة في السعودية بالتحديد
5. نصائح الطقس تعكس شهر ${month} في الوجهة المحددة، لا عام السنة
6. لا تذكر أسماء فنادق بعينها (التوفر غير مضمون)
7. حقل ryaPrompt: جملة سؤال طبيعية يكتبها المسافر لريا — مثال: "ريا، ما أفضل مطاعم كاديكوي لوجبة غداء لزوجين؟"
8. أجب باللغة العربية الفصحى دائماً
9. الإجابة JSON نقي فقط بدون أي نص خارجه`;
  }
  return `You are a professional travel planner at GoTripza. Current month: ${month}.
Generate a detailed, practical trip plan in JSON.

Strict rules — no exceptions:
1. Every day names real, specific places (e.g. "Sultanahmet Square", "Karaköy waterfront", "Kadıköy market") — NEVER "a tourist attraction" or "a local restaurant"
2. Every morning/afternoon/evening paragraph includes at least one named real place + approximate timing (e.g. "Head to... at 9am")
3. Budget is precisely calculated for the destination, season (month: ${month}), and number of travelers
4. Visa advice is specific to the traveler's nationality/passport
5. Weather tips must reflect ${month} at this specific destination, not generic year-round advice
6. Do not name specific hotels (availability not guaranteed)
7. ryaPrompt field: a natural question the traveler would type to Rya — e.g. "Rya, what are the best lunch spots in Kadıköy for a couple?"
8. Respond in English only
9. Return pure JSON with no text outside it`;
}

function userPrompt(input: TripPlanInput, isAr: boolean, month: string): string {
  const lang = isAr ? "ar" : "en";
  const currency = input.currency ?? (isAr ? "SAR" : "USD");
  const tripLabel = TRIP_TYPE_LABELS[lang][input.tripType];
  const interests = input.interests
    ?.map((i) => INTEREST_LABELS[i]?.[lang])
    .filter(Boolean)
    .join(isAr ? "، " : ", ") ?? (isAr ? "عام" : "general");

  if (isAr) {
    return `أنشئ خطة سفر كاملة ومحددة لهذه الرحلة:

بيانات الرحلة:
- من: ${input.origin} ← إلى: ${input.destination}
- المدة: ${input.days} ${input.days === 1 ? "يوم" : "أيام"} | المسافرون: ${input.travelers} ${input.travelers === 1 ? "شخص" : "أشخاص"}
- الميزانية الإجمالية: ${input.budget.toLocaleString()} ${currency}
- نوع الرحلة: ${tripLabel} | الاهتمامات: ${interests}
- شهر السفر: ${month}

مطلوب: كل يوم يبدأ بوصف الصباح من الساعة 9 صباحاً تقريباً مع ذكر المكان الأول بالاسم.

أرجع JSON بهذه البنية بالضبط (${input.days} ${input.days === 1 ? "يوم" : "أيام"} في daysPlan):
{
  "originName": "string — اسم المدينة الأصلية",
  "destinationName": "string — اسم الوجهة بالعربية",
  "budgetLevel": "tight|balanced|comfortable",
  "estimatedDailyBudget": number,
  "summary": "string — جملتان تصفان ما يميز هذه الخطة تحديداً لنوع الرحلة والاهتمامات المذكورة",
  "stayAdvice": "string — الأحياء الأنسب للسكن مع سبب مختصر لكل حي",
  "bestStayAreas": [
    "اسم الحي الأول: السبب",
    "اسم الحي الثاني: السبب",
    "اسم الحي الثالث: السبب"
  ],
  "flightAdvice": "string — متى يُحجز من ${input.origin} وأي شركات أو مواسم تناسب الميزانية",
  "visaAdvice": "string — متطلبات تأشيرة ${input.destination} لحاملي الجواز السعودي والمقيمين في السعودية بالتفصيل",
  "localTransportAdvice": "string — أفضل وسائل التنقل داخل ${input.destination} مع الأسعار التقريبية",
  "weatherAdvice": "string — طقس ${input.destination} في شهر ${month} تحديداً وما يناسب من ملابس وأنشطة",
  "serviceAdvice": [
    "string — خدمة مفيدة مثل شريحة eSIM أو تطبيق تنقل",
    "string — خدمة أخرى مثل تأمين سفر أو بطاقة دفع"
  ],
  "hotelDisclosure": "string — جملة قصيرة تشرح أننا لا نوصي بفندق بعينه",
  "packingAdvice": [
    "string — ضروري للموسم",
    "string — ضروري للوجهة",
    "string — للأنشطة المختارة",
    "string — نصيحة أخرى مخصصة"
  ],
  "costBreakdown": [
    {"label": "الإقامة (${input.days} ليالٍ)", "amount": number},
    {"label": "الأنشطة والمعالم", "amount": number},
    {"label": "الأكل (${input.travelers} أشخاص)", "amount": number},
    {"label": "المواصلات الداخلية", "amount": number},
    {"label": "احتياط وطوارئ", "amount": number}
  ],
  "daysPlan": [
    {
      "day": 1,
      "title": "يوم 1: [عنوان يصف الحي والنشاط الرئيسي]",
      "focus": "string — النشاط المحوري لهذا اليوم",
      "area": "string — اسم الحي أو المنطقة",
      "morning": "string — ابدأ بتوقيت (مثال: 9 صباحاً توجّه إلى...) مع اسم مكان حقيقي",
      "afternoon": "string — توقيت تقريبي + اسم مكان حقيقي + نشاط محدد",
      "evening": "string — توقيت تقريبي + اسم مكان أو حي + توصية عشاء بمنطقة",
      "transit": "string — كيفية التنقل لهذا اليوم تحديداً (مترو، تاكسي، سيراً)",
      "estimatedCost": number,
      "tip": "string — نصيحة خاصة بهذا اليوم وهذا الحي — ليست عامة",
      "ryaPrompt": "string — سؤال طبيعي يكتبه المسافر لريا عن هذا اليوم (مثال: ريا، ما أفضل مطاعم غداء في [الحي]؟)"
    }
  ],
  "nextSteps": [
    "string — أول خطوة عملية (مثال: احجز تذكرة الطيران من...)",
    "string — خطوة ثانية",
    "string — خطوة ثالثة",
    "string — خطوة رابعة"
  ]
}`;
  }

  return `Generate a complete, specific trip plan:

Trip details:
- From: ${input.origin} → To: ${input.destination}
- Duration: ${input.days} day${input.days !== 1 ? "s" : ""} | Travelers: ${input.travelers}
- Total budget: ${input.budget.toLocaleString()} ${currency}
- Trip type: ${tripLabel} | Interests: ${interests}
- Travel month: ${month}

Required: every day's morning section starts around 9am with the first named place.

Return JSON with this exact structure (${input.days} day${input.days !== 1 ? "s" : ""} in daysPlan):
{
  "originName": "string — origin city name",
  "destinationName": "string — destination city name",
  "budgetLevel": "tight|balanced|comfortable",
  "estimatedDailyBudget": number,
  "summary": "string — two sentences describing what makes this plan specific to the trip type and interests",
  "stayAdvice": "string — best neighborhoods to stay with a brief reason for each",
  "bestStayAreas": [
    "Neighborhood 1: reason",
    "Neighborhood 2: reason",
    "Neighborhood 3: reason"
  ],
  "flightAdvice": "string — when to book from ${input.origin} and which airlines or seasons suit the budget",
  "visaAdvice": "string — visa requirements for ${input.destination} for the traveler's passport/nationality",
  "localTransportAdvice": "string — best local transport inside ${input.destination} with approximate costs",
  "weatherAdvice": "string — weather in ${input.destination} during ${month} specifically, suitable clothing and activities",
  "serviceAdvice": [
    "string — useful service like eSIM or transport app",
    "string — another service like travel insurance or payment card"
  ],
  "hotelDisclosure": "string — short note explaining we don't recommend specific hotels",
  "packingAdvice": [
    "string — season essential",
    "string — destination essential",
    "string — for chosen activities",
    "string — another specific tip"
  ],
  "costBreakdown": [
    {"label": "Accommodation (${input.days} night${input.days !== 1 ? "s" : ""})", "amount": number},
    {"label": "Activities & attractions", "amount": number},
    {"label": "Food (${input.travelers} traveler${input.travelers !== 1 ? "s" : ""})", "amount": number},
    {"label": "Local transport", "amount": number},
    {"label": "Buffer & emergencies", "amount": number}
  ],
  "daysPlan": [
    {
      "day": 1,
      "title": "Day 1: [title describing the neighborhood and main activity]",
      "focus": "string — the anchor activity of this day",
      "area": "string — specific neighborhood or district name",
      "morning": "string — start with timing (e.g. Head to... at 9am) with a real named place",
      "afternoon": "string — approximate timing + real named place + specific activity",
      "evening": "string — approximate timing + area name + dinner recommendation by neighborhood",
      "transit": "string — how to get around this specific day (metro, taxi, walking)",
      "estimatedCost": number,
      "tip": "string — specific tip for this day and this neighborhood — not generic",
      "ryaPrompt": "string — a natural question the traveler would type to Rya about this day (e.g. Rya, what are the best lunch spots in [neighborhood]?)"
    }
  ],
  "nextSteps": [
    "string — first practical step (e.g. Book your flight from...)",
    "string — second step",
    "string — third step",
    "string — fourth step"
  ]
}`;
}

export async function generateAITripPlan(input: TripPlanInput): Promise<TripPlan> {
  const isAr = input.locale === "ar";
  const currency = input.currency ?? (isAr ? "SAR" : "USD");

  // Pass the current month so AI gives seasonally-accurate tips
  const month = new Date().toLocaleString(isAr ? "ar-SA" : "en-US", { month: "long" });

  const res = await getClient().chat.completions.create({
    model: MODEL_PRIMARY,
    temperature: 0.65,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt(isAr, month) },
      { role: "user", content: userPrompt(input, isAr, month) },
    ],
  });

  const text = res.choices[0]?.message?.content?.trim() ?? "";
  if (!text) throw new Error("[plan-gen] empty response from OpenAI");

  const raw = JSON.parse(text) as Record<string, unknown>;

  const rawDays = Array.isArray(raw.daysPlan)
    ? (raw.daysPlan as Record<string, unknown>[])
    : [];

  const rawBreakdown = Array.isArray(raw.costBreakdown)
    ? (raw.costBreakdown as { label: string; amount: number }[])
    : [];

  return {
    originCode: null,
    destinationCode: null,
    originName: String(raw.originName ?? input.origin),
    destinationName: String(raw.destinationName ?? input.destination),
    days: input.days,
    travelers: input.travelers,
    tripType: input.tripType,
    budget: input.budget,
    currency,
    budgetLevel: (["tight", "balanced", "comfortable"].includes(String(raw.budgetLevel))
      ? (raw.budgetLevel as "tight" | "balanced" | "comfortable")
      : "balanced"),
    estimatedDailyBudget:
      Number(raw.estimatedDailyBudget) || Math.round(input.budget / Math.max(1, input.days)),
    summary: String(raw.summary ?? ""),
    stayAdvice: String(raw.stayAdvice ?? ""),
    bestStayAreas: Array.isArray(raw.bestStayAreas)
      ? (raw.bestStayAreas as string[]).slice(0, 3)
      : [],
    flightAdvice: String(raw.flightAdvice ?? ""),
    visaAdvice: String(raw.visaAdvice ?? ""),
    localTransportAdvice: String(raw.localTransportAdvice ?? ""),
    weatherAdvice: String(raw.weatherAdvice ?? ""),
    serviceAdvice: Array.isArray(raw.serviceAdvice) ? (raw.serviceAdvice as string[]) : [],
    hotelDisclosure: String(raw.hotelDisclosure ?? ""),
    packingAdvice: Array.isArray(raw.packingAdvice)
      ? (raw.packingAdvice as string[]).slice(0, 5)
      : [],
    costBreakdown: rawBreakdown,
    daysPlan: rawDays.map((day, i) => ({
      day: i + 1,
      title: String(day.title ?? (isAr ? `يوم ${i + 1}` : `Day ${i + 1}`)),
      focus: String(day.focus ?? ""),
      area: String(day.area ?? ""),
      morning: String(day.morning ?? ""),
      afternoon: String(day.afternoon ?? ""),
      evening: String(day.evening ?? ""),
      transit: String(day.transit ?? ""),
      estimatedCost: Number(day.estimatedCost) || 0,
      tip: String(day.tip ?? ""),
      ryaPrompt: String(day.ryaPrompt ?? ""),
    })),
    nextSteps: Array.isArray(raw.nextSteps) ? (raw.nextSteps as string[]) : [],
  };
}
