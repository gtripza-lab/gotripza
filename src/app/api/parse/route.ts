import { NextRequest, NextResponse } from "next/server";
import {
  getLiveTips,
  type TravelContext,
  type ChatTurn,
} from "@/lib/ai";
import { runRayaOrchestrator } from "@/lib/ai/orchestrator/pipeline";
import { buildSmartFallbackIntelligence } from "@/lib/ai/smart-fallback";
import { getCurrentUser } from "@/lib/auth/session";
import {
  heuristicParse,
  detectLocale,
  detectWants,
  findAnyCity,
} from "@/lib/mock-intent";
import { resolveIata } from "@/lib/iata";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { captureError } from "@/lib/observability/sentry";
import { createSupabaseService } from "@/lib/supabase/service";
import { detectLifecycleFromText, isPostBookingLifecycle, mergeLifecycleStage } from "@/lib/ai/trip-lifecycle";

// Supabase generated types do not include the newer support/memory tables yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable = any;

function genAnonSid(): string {
  // 22-char URL-safe random id
  const bytes = new Uint8Array(16);
  if (typeof crypto !== "undefined") crypto.getRandomValues(bytes);
  else for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Buffer.from(bytes).toString("base64url");
}

export const runtime = "nodejs";

const MAX_QUERY_LENGTH = 600;
// B2: Per-message history cap. Stops 50KB×12 token bombs at the door.
const MAX_HISTORY_MSG_LEN = 1000;
// B2: Reject oversized bodies before req.json() pays the parsing cost.
const MAX_BODY_BYTES = 64 * 1024;

const CITY_COORDS: Record<string, { ar: string; en: string; lat: number; lon: number }> = {
  JED: { ar: "جدة", en: "Jeddah", lat: 21.5433, lon: 39.1728 },
  RUH: { ar: "الرياض", en: "Riyadh", lat: 24.7136, lon: 46.6753 },
  DMM: { ar: "الدمام", en: "Dammam", lat: 26.4207, lon: 50.0888 },
  MED: { ar: "المدينة", en: "Medina", lat: 24.5247, lon: 39.5692 },
  TIF: { ar: "الطائف", en: "Taif", lat: 21.4373, lon: 40.5127 },
  AHB: { ar: "أبها", en: "Abha", lat: 18.2465, lon: 42.5117 },
  TUU: { ar: "تبوك", en: "Tabuk", lat: 28.3838, lon: 36.5662 },
  ELQ: { ar: "القصيم", en: "Qassim", lat: 26.2078, lon: 43.4837 },
  GIZ: { ar: "جازان", en: "Jazan", lat: 16.8892, lon: 42.5511 },
  DXB: { ar: "دبي", en: "Dubai", lat: 25.2048, lon: 55.2708 },
  AUH: { ar: "أبوظبي", en: "Abu Dhabi", lat: 24.4539, lon: 54.3773 },
  DOH: { ar: "الدوحة", en: "Doha", lat: 25.2854, lon: 51.5310 },
  KWI: { ar: "الكويت", en: "Kuwait City", lat: 29.3759, lon: 47.9774 },
  BAH: { ar: "البحرين", en: "Bahrain", lat: 26.0667, lon: 50.5577 },
  MCT: { ar: "مسقط", en: "Muscat", lat: 23.5880, lon: 58.3829 },
  AMM: { ar: "عمّان", en: "Amman", lat: 31.9539, lon: 35.9106 },
  CAI: { ar: "القاهرة", en: "Cairo", lat: 30.0444, lon: 31.2357 },
};

function isProviderError(message: string) {
  return /API_KEY_INVALID|API key not valid|PERMISSION_DENIED|UNAUTHENTICATED|RESOURCE_EXHAUSTED|quota|rate.?limit|429|404|fetch|network|json|zod|parse|invalid|openai/i.test(
    message,
  );
}

function distanceKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const earthKm = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return Math.round(earthKm * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h)));
}

function extractRouteQuestion(query: string): { origin: string; destination: string } | null {
  const cleaned = query.trim();
  const routeMatch =
    cleaned.match(/(?:من|from)\s+(.+?)\s+(?:إلى|الى|لـ|ل|to)\s+(.+?)(?:[؟?!.]|$)/i) ??
    cleaned.match(/between\s+(.+?)\s+and\s+(.+?)(?:[؟?!.]|$)/i) ??
    cleaned.match(/بين\s+(.+?)\s+و\s*(.+?)(?:[؟?!.]|$)/i);
  if (!routeMatch) return null;
  const origin = resolveIata(routeMatch[1]);
  const destination = resolveIata(routeMatch[2]);
  if (!origin || !destination || origin === destination) return null;
  if (!CITY_COORDS[origin] || !CITY_COORDS[destination]) return null;
  return { origin, destination };
}

function maybeDistanceAdvice(query: string) {
  const asksDistance =
    /كم\s+(?:تبعد|يبعد|المسافة)|المسافة\s+(?:بين|من)|كم\s+ساعة|كم\s+ساعه|how\s+far|distance\s+(?:between|from)|how\s+long/i.test(
      query,
    );
  if (!asksDistance) return null;
  const route = extractRouteQuestion(query);
  if (!route) return null;
  const locale = detectLocale(query);
  const isAr = locale === "ar";
  const from = CITY_COORDS[route.origin];
  const to = CITY_COORDS[route.destination];
  const airKm = distanceKm(from, to);
  const roadKm = Math.round(airKm * 1.12);
  const driveMin = Math.round((roadKm / 100) * 60);
  const driveHours = Math.max(1, Math.round(driveMin / 60));
  const driveRangeAr = `${driveHours.toLocaleString("ar-SA")}-${(driveHours + 1).toLocaleString("ar-SA")}`;
  const driveRangeEn = `${driveHours.toLocaleString("en-US")}-${(driveHours + 1).toLocaleString("en-US")}`;
  const flightMinutes = airKm > 700 ? "ساعة و40 دقيقة إلى ساعتين" : "ساعة تقريباً";
  const message = isAr
    ? `المسافة بين ${from.ar} و${to.ar} تقريباً ${roadKm.toLocaleString("ar-SA")} كم بالسيارة، وغالباً تستغرق حوالي ${driveRangeAr} ساعات حسب الطريق والتوقفات. بالطيران المسافة الجوية حوالي ${airKm.toLocaleString("ar-SA")} كم، والرحلة عادة ${flightMinutes}. 🚗✈️`
    : `The road distance from ${from.en} to ${to.en} is roughly ${roadKm.toLocaleString("en-US")} km, usually about ${driveRangeEn} hours by car depending on stops and traffic. The direct air distance is about ${airKm.toLocaleString("en-US")} km. 🚗✈️`;

  return NextResponse.json({
    intent: {
      origin: route.origin,
      destination: route.destination,
      departure_date: null,
      return_date: null,
      adults: 2,
      budget_usd: null,
      trip_type: null,
      cabin_class: null,
      notes: null,
    },
    context: {
      origin: route.origin,
      destination: route.destination,
      departure_date: null,
      return_date: null,
      adults: 2,
      budget_usd: null,
      trip_type: null,
      cabin_class: null,
    },
    locale,
    mode: "advice",
    message,
    wants: ["flights", "hotels"],
    followup: null,
    tips: null,
    budget_verdict: null,
    confidence: null,
    destination_intel: null,
    clarification_needed: false,
    clarification_question: null,
    mock: false,
  });
}

function normalizeSupportText(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 500);
}

function supportFingerprint(value: string) {
  const normalized = normalizeSupportText(value);
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash * 31 + normalized.charCodeAt(i)) >>> 0;
  }
  return hash.toString(36);
}

async function findRecentDuplicateSupportTicket(db: AnyTable, query: string) {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const normalized = normalizeSupportText(query);
  const { data, error } = await db
    .from("support_requests")
    .select("id,body,metadata,created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: false })
    .limit(30);

  if (error) return null;
  const fingerprint = supportFingerprint(query);
  return ((data ?? []) as Array<{ id?: number; body?: string | null; metadata?: { fingerprint?: string; source?: string } | null }>)
    .find((row) => {
      const fromRia = row.metadata?.source === "ria_chat";
      const sameFingerprint = row.metadata?.fingerprint === fingerprint;
      const sameBody = normalizeSupportText(row.body ?? "") === normalized;
      return fromRia && (sameFingerprint || sameBody);
    }) ?? null;
}

function detectSupportIntent(query: string) {
  const q = query.toLowerCase();
  const explicitEscalation =
    /افتح(?:وا)?\s*(?:تذكرة|طلب)|ارفع(?:ها)?\s*(?:للدعم|للمشرف|للادارة|للإدارة)|تواصل(?:وا)?\s*معي|كلم(?:وا)?ني|أبغى\s*دعم|ابغى\s*دعم|أريد\s*دعم|احتاج\s*دعم|احتاج\s*مساعدة|شكوى|استرجاع|استرداد|open\s+(?:a\s+)?ticket|support\s+ticket|contact\s+support|escalate|complaint|refund/i.test(q);
  const platformIssue =
    /(?:تسجيل\s*الدخول|الدخول|حساب|قوقل|جوجل|google|نموذج\s*الدعم|الدعم|الأدمن|الادمن|الرسايل|الرسائل|login|sign\s*in|support\s*form|admin|messages?).{0,60}(?:لا\s*يعمل|ما\s*يشتغل|مشكلة|خطأ|خلل|ما\s*توصل|لم\s*تصل|not\s*working|issue|bug)|(?:لا\s*يعمل|ما\s*يشتغل|مشكلة|خطأ|خلل|ما\s*توصل|لم\s*تصل|not\s*working|issue|bug).{0,60}(?:تسجيل\s*الدخول|الدخول|حساب|قوقل|جوجل|google|نموذج\s*الدعم|الدعم|الأدمن|الادمن|الرسايل|الرسائل|login|sign\s*in|support\s*form|admin|messages?)/i.test(q);
  const isSupport = explicitEscalation || platformIssue;
  if (!isSupport) return null;

  const category =
    /استرجاع|استرداد|refund|cancel|إلغاء|الغاء/i.test(q)
      ? "refund"
      : /حجز|booking|reservation/i.test(q)
        ? "booking"
        : /خطأ|خلل|لا يعمل|ما يشتغل|bug|not working|technical/i.test(q)
          ? "technical"
          : /شكوى|complaint/i.test(q)
            ? "complaint"
            : "question";

  const priority =
    /عاجل|ضروري|urgent|emergency|مهم جدا|مهم جداً/i.test(q)
      ? "urgent"
      : /لا يعمل|ما يشتغل|not working|خطأ|خلل|bug/i.test(q)
        ? "high"
        : "normal";

  return { category, priority, reason: explicitEscalation ? "explicit_escalation" : "platform_issue" };
}

async function maybeCreateSupportTicket(req: NextRequest, query: string) {
  const support = detectSupportIntent(query);
  if (!support) return null;

  const locale = detectLocale(query);
  const isAr = locale === "ar";
  try {
    const user = await getCurrentUser();
    const sessionId = req.cookies.get("gtz_sid")?.value ?? null;
    const db = createSupabaseService() as AnyTable;
    const duplicate = await findRecentDuplicateSupportTicket(db, query);
    if (duplicate?.id) {
      return NextResponse.json({
        intent: {
          origin: null,
          destination: null,
          departure_date: null,
          return_date: null,
          adults: 2,
          budget_usd: null,
          trip_type: null,
          cabin_class: null,
          notes: null,
        },
        context: {
          origin: null,
          destination: null,
          departure_date: null,
          return_date: null,
          adults: 2,
          budget_usd: null,
          trip_type: null,
          cabin_class: null,
        },
        locale,
        mode: "advice",
        message: isAr
          ? `التذكرة موجودة بالفعل رقم #${duplicate.id}. لن أكررها، لكن أقدر أساعدك هنا بخطوات سريعة إلى أن يراجعها فريق GoTripza.`
          : `Ticket #${duplicate.id} already exists. I will not duplicate it, but I can still help you here with quick steps while the GoTripza team reviews it.`,
        wants: ["flights", "hotels"],
        followup: null,
        tips: null,
        budget_verdict: null,
        confidence: null,
        destination_intel: null,
        clarification_needed: false,
        clarification_question: null,
        mock: false,
      });
    }
    const { data, error } = await db
      .from("support_requests")
      .insert({
        user_id: user?.id ?? null,
        contact_email: user?.email ?? null,
        category: support.category,
        priority: support.priority,
        subject: isAr ? "طلب دعم من محادثة ريا" : "Support request from Raya chat",
        body: query,
        ai_summary: isAr
          ? "تم إنشاء التذكرة تلقائياً من محادثة ريا."
          : "Automatically created from Raya chat.",
        metadata: {
          source: "ria_chat",
          session_id: sessionId,
          fingerprint: supportFingerprint(query),
          reason: support.reason,
        },
      })
      .select("id")
      .single();

    if (error) throw error;
    const ticketId = (data as { id?: number } | null)?.id;
    return NextResponse.json({
      intent: {
        origin: null,
        destination: null,
        departure_date: null,
        return_date: null,
        adults: 2,
        budget_usd: null,
        trip_type: null,
        cabin_class: null,
        notes: null,
      },
      context: {
        origin: null,
        destination: null,
        departure_date: null,
        return_date: null,
        adults: 2,
        budget_usd: null,
        trip_type: null,
        cabin_class: null,
      },
      locale,
      mode: "advice",
      message: isAr
        ? `وصلتني المشكلة وفتحت لك تذكرة دعم${ticketId ? ` رقم #${ticketId}` : ""}. فريق GoTripza يقدر يشوفها الآن من لوحة الدعم. لو تبغى نتابع معك بدقة، أرسل بريدك أو رقم الحجز في رسالة منفصلة.`
        : `I created a support ticket${ticketId ? ` #${ticketId}` : ""}. The GoTripza team can now see it in the support dashboard. Send your email or booking reference in a separate message if you want precise follow-up.`,
      wants: ["flights", "hotels"],
      followup: null,
      tips: null,
      budget_verdict: null,
      confidence: null,
      destination_intel: null,
      clarification_needed: false,
      clarification_question: null,
      mock: false,
    });
  } catch (err) {
    void captureError(err, { route: "parse", phase: "support_escalation" });
    return null;
  }
}

// NOTE: The legacy enforceConversationalMode override has been replaced by
// the Ria orchestrator's post-process step (see src/lib/ai/orchestrator/).

// Destination name lookup for heuristic fallback responses
const IATA_TO_NAME_AR: Record<string, string> = {
  MLE: "المالديف", DXB: "دبي", IST: "إسطنبول", AYT: "أنطاليا",
  DPS: "بالي", LHR: "لندن", CDG: "باريس", NRT: "طوكيو",
  BKK: "بانكوك", SIN: "سنغافورة", RUH: "الرياض", JED: "جدة",
  DOH: "الدوحة", AUH: "أبوظبي", CAI: "القاهرة", AMM: "عمّان",
  FCO: "روما", BCN: "برشلونة", ATH: "أثينا", VIE: "فيينا",
  RAK: "مراكش", TBS: "تبليسي", GYD: "باكو", JFK: "نيويورك",
  CMB: "سريلانكا", DEL: "دلهي", ICN: "سيول", MCT: "مسقط",
};
const IATA_TO_NAME_EN: Record<string, string> = {
  MLE: "the Maldives", DXB: "Dubai", IST: "Istanbul", AYT: "Antalya",
  DPS: "Bali", LHR: "London", CDG: "Paris", NRT: "Tokyo",
  BKK: "Bangkok", SIN: "Singapore", RUH: "Riyadh", JED: "Jeddah",
  DOH: "Doha", AUH: "Abu Dhabi", CAI: "Cairo", AMM: "Amman",
  FCO: "Rome", BCN: "Barcelona", ATH: "Athens", VIE: "Vienna",
  RAK: "Marrakech", TBS: "Tbilisi", GYD: "Baku", JFK: "New York",
  CMB: "Sri Lanka", DEL: "Delhi", ICN: "Seoul", MCT: "Muscat",
};

function displayDestinationName(destination: string | null, locale: "ar" | "en"): string | null {
  if (!destination) return null;
  const normalized = destination.toUpperCase();
  if (locale === "ar") return IATA_TO_NAME_AR[normalized] ?? destination;
  return IATA_TO_NAME_EN[normalized] ?? destination;
}

/**
 * Build a unified context string from full conversation history + current query.
 * This lets the heuristic parser extract destination/dates/origin even when the
 * current message alone is just "June" or "from Riyadh".
 */
function buildHistoryContext(query: string, history: ChatTurn[]): string {
  // Only include USER messages — assistant messages often contain generic
  // words like "مدينة" (city) that falsely match city names in the parser.
  const allTexts = [
    ...history
      .filter((t) => t.role === "user")
      .map((t) => t.text ?? ("content" in t ? String(t.content ?? "") : ""))
      .filter(Boolean),
    query,
  ];
  return allTexts.join(" \n ");
}

/**
 * Determine if this is the first user turn or a follow-up.
 * Used to pick warmer "first impression" messages vs. progressive ones.
 */
function isFirstUserTurn(history: ChatTurn[]): boolean {
  return !history.some((t) => t.role === "user");
}

/**
 * Context-aware heuristic fallback when OpenAI is unavailable.
 * Now reads the full conversation history so context accumulates across turns:
 *   Turn 1 user "London"  →  Raya: "When?"
 *   Turn 2 user "June"    →  Raya extracts London+June from full context, asks origin
 *   Turn 3 user "Riyadh"  →  Raya has all three → search-ready
 */
function filterNulls(ctx: TravelContext): Partial<TravelContext> {
  return Object.fromEntries(
    Object.entries(ctx).filter(([, v]) => v !== null && v !== undefined)
  ) as Partial<TravelContext>;
}

/** Detect whether the query is an advice/question (not a booking request). */
function isAdviceQuery(query: string): boolean {
  return /هل\s|كيف\s|ما\s+أفضل|متى\s+أفضل|أيها\s+أفضل|ايهما|أيهما|مقارنة|قارن|الفرق\s+بين|أفضل\s+وقت|تأشيرة|فيزا|آمن|امن\s|الطقس|الجو\s+في|ماذا\s+ألبس|ماذا\s+نلبس|هل\s+يحتاج|هل\s+تحتاج|نصائح|توصي|اقترح|ماذا\s+أفعل|ما\s+رأيك|تنصحني\s+بـ|is\s+it\s+safe|is\s+\w+\s+safe|how\s+|what\s+is\s+|when\s+is\s+best|best\s+time|compare\s+|which\s+is\s+better|visa\s+|do\s+i\s+need\s+|tips\s+for|should\s+i\s+|weather\s+in|what\s+should\s+i/i.test(query);
}

type ServiceInterest = NonNullable<TravelContext["service_interests"]>[number];

function mergeServiceInterests(
  current: TravelContext["service_interests"],
  add: ServiceInterest[],
): NonNullable<TravelContext["service_interests"]> {
  return Array.from(new Set([...(current ?? []), ...add])) as NonNullable<TravelContext["service_interests"]>;
}

function serviceInterestsFromQuery(query: string): ServiceInterest[] {
  const interests: ServiceInterest[] = [];
  if (/تأمين|insurance|medical cover|coverage|شنغن|schengen/i.test(query)) interests.push("insurance");
  if (/esim|e-sim|شريحة|شرائح|انترنت|إنترنت|roaming|data/i.test(query)) interests.push("esim");
  if (/أنشطة|نشاط|جولات|تذاكر|activities|tours|tickets|klook|getyourguide/i.test(query)) interests.push("activities");
  if (/صورة|صور|افهم|فاتورة|منيو|لافتة|تذكرة|photo|image|receipt|menu|sign|ticket/i.test(query)) interests.push("image_help");
  if (/ترجم|ترجمة|لغة|translate|translation|phrase/i.test(query)) interests.push("translation");
  if (/مطار|ترانزيت|بوابة|airport|terminal|gate|layover|connection/i.test(query)) interests.push("airport_help");
  if (/طوارئ|جواز|شنطة ضاعت|مريض|مرض|شرطة|سفارة|emergency|passport|lost bag|police|embassy|illness/i.test(query)) interests.push("emergency");
  if (/أكل|اكل|مطعم|حلال|food|restaurant|halal|dietary/i.test(query)) interests.push("food");
  if (/شنطة|الشنطة|ماذا أحضر|ماذا احضر|packing|pack|luggage|bag/i.test(query)) interests.push("packing");
  if (/تنقل|مواصلات|تاكسي|مترو|باص|transfer|transport|taxi|metro|bus|uber/i.test(query)) interests.push("transport");
  return interests;
}

function heuristicFallback(query: string, notice: string, history: ChatTurn[], context?: TravelContext) {
  // Detect locale from the most recent user input (most reliable)
  const locale = detectLocale(query);
  const isAr = locale === "ar";
  const lower = query.toLowerCase();
  const conversationText = `${history.map((turn) => turn.text).join(" ")} ${query}`;
  const hasIstanbul = /اسطنبول|إسطنبول|istanbul/i.test(conversationText);
  const hasFamily = /عائل|family|kids|أطفال|اطفال/i.test(conversationText);
  const hasTaksim = /تقسيم|taksim/i.test(conversationText);
  const normalizeDigits = (value: string) =>
    value.replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)))
      .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)));
  const normalizedQuery = normalizeDigits(query);
  const moneyMatch = normalizedQuery.match(/(\d{2,6})\s*(?:\$|دولار|usd|ريال|sar)?/i);
  const daysMatch = normalizedQuery.match(/(\d{1,2})\s*(?:أيام|ايام|يوم|ليال|ليالي|ليلة|days|day|nights|night)/i);
  const parsedQuery = heuristicParse(query);
  const detectedStage = detectLifecycleFromText(query);
  const baseContext: TravelContext = {
    destination: context?.destination ?? parsedQuery.destination ?? (hasIstanbul ? "IST" : null),
    origin: context?.origin ?? parsedQuery.origin ?? null,
    departure_date: context?.departure_date ?? parsedQuery.departure_date ?? null,
    return_date: context?.return_date ?? parsedQuery.return_date ?? null,
    adults: context?.adults ?? parsedQuery.adults ?? 2,
    budget_usd: context?.budget_usd ?? parsedQuery.budget_usd ?? null,
    trip_type: context?.trip_type ?? parsedQuery.trip_type ?? null,
    cabin_class: context?.cabin_class ?? parsedQuery.cabin_class ?? null,
    traveler_type: context?.traveler_type ?? (hasFamily ? "family" : null),
    hotel_preferences: context?.hotel_preferences ?? [],
    service_interests: context?.service_interests ?? [],
    booking_stage: mergeLifecycleStage(context?.booking_stage ?? null, detectedStage),
    concerns: context?.concerns ?? [],
  };

  if (/صورة|صور|افهم|فاتورة|منيو|لافتة|تذكرة|photo|image|receipt|menu|sign|ticket/i.test(query)) {
    const nextContext: TravelContext = {
      ...baseContext,
      service_interests: mergeServiceInterests(baseContext.service_interests, ["image_help", "translation"]),
      booking_stage: baseContext.booking_stage ?? "in_trip",
      concerns: Array.from(new Set([...(baseContext.concerns ?? []), "image-help"])).slice(0, 8),
    };
    return NextResponse.json({
      intent: { origin: nextContext.origin, destination: nextContext.destination, departure_date: nextContext.departure_date, return_date: nextContext.return_date, adults: nextContext.adults, budget_usd: nextContext.budget_usd, trip_type: nextContext.trip_type, cabin_class: nextContext.cabin_class, notes: "image_help" },
      locale,
      mode: "advice",
      message: isAr
        ? "ارفع الصورة هنا وسأقرأها لك كمرافقة سفر: أشرح المعنى، أنبهك لأي مبلغ/شرط/تحذير، وأقول لك ماذا تقول أو تفعل بعدها. ينفع هذا للقوائم، اللوحات، التذاكر، الفواتير، ورسائل الفندق."
        : "Upload the image here and I’ll read it like a travel companion: what it means, any price/condition/warning to notice, and exactly what to say or do next. This works for menus, signs, tickets, receipts, and hotel messages.",
      context: nextContext,
      wants: ["flights", "hotels"],
      followup: isAr ? "ارفع الصورة الآن." : "Upload the image now.",
      tips: null,
      budget_verdict: null,
      confidence: null,
      destination_intel: null,
      clarification_needed: false,
      clarification_question: null,
      mock: true,
      notice,
    });
  }

  if (/ترجم|ترجمة|translate|translation|phrase|عبارة|لغة/i.test(query)) {
    const phrase = query
      .replace(/^(?:ترجم(?:\s+لي)?|ترجمة|translate(?:\s+for\s+me)?)[\s:：-]*/i, "")
      .replace(/^["'“”]+|["'“”]+$/g, "")
      .trim();
    const hasPhrase = phrase.length > 3 && phrase !== query.trim();
    const translatedTaxiPhrase = /سيارة\s+الأجرة\s+الرسمية|التاكسي\s+الرسمي|official\s+taxi/i.test(phrase);
    const directTranslation = isAr
      ? translatedTaxiPhrase && hasIstanbul
        ? "بالتركية قل: Resmi taksiyi nerede bulabilirim? معناها: أين أجد سيارة الأجرة الرسمية؟ وإذا تريد صيغة ألطف: Lütfen resmi taksi durağı nerede? انتبه فقط لا تركب مع أي شخص يعرض عليك سيارة داخل الصالة؛ اتبع لوحات Taxi الرسمية."
        : hasPhrase
          ? `أقدر أساعدك. العبارة التي تريد ترجمتها هي: “${phrase}”. قل لي اللغة المطلوبة، أو اكتب لي السياق: مطار، فندق، مطعم، أو تاكسي، وأصيغها لك بشكل طبيعي.`
          : "أكيد. أرسل لي العبارة أو صوّر اللوحة/القائمة، وأنا أعطيك ترجمة طبيعية وما تقول بالضبط في الموقف. لو هي محادثة مع فندق أو مطار أو مطعم، قل لي السياق عشان أصيغها بأدب وبأسلوب محلي."
      : translatedTaxiPhrase && hasIstanbul
        ? "In Turkish, say: Resmi taksiyi nerede bulabilirim? It means: Where can I find the official taxi? A softer version is: Lütfen resmi taksi durağı nerede? Avoid anyone offering a car inside the arrivals hall; follow official Taxi signs."
        : hasPhrase
          ? `I can help. The phrase is: “${phrase}”. Tell me the target language or context, like airport, hotel, restaurant, or taxi, and I’ll phrase it naturally.`
          : "Absolutely. Send me the phrase or upload a photo of the sign/menu, and I’ll give you a natural translation plus exactly what to say. If it’s for a hotel, airport, or restaurant, tell me the situation so I can phrase it politely.";

    return NextResponse.json({
      intent: { origin: null, destination: null, departure_date: null, return_date: null, adults: 2, budget_usd: null, trip_type: null, cabin_class: null, notes: null },
      locale,
      mode: "advice",
      message: directTranslation,
      context: {
        ...baseContext,
        service_interests: mergeServiceInterests(baseContext.service_interests, ["translation"]),
        booking_stage: baseContext.booking_stage ?? "planning",
      },
      wants: ["flights", "hotels"],
      followup: hasPhrase ? null : isAr ? "أرسل العبارة هنا." : "Send the phrase here.",
      tips: null,
      budget_verdict: null,
      confidence: null,
      destination_intel: null,
      clarification_needed: false,
      clarification_question: null,
      mock: true,
      notice,
    });
  }

  if (/طوارئ|جواز|شنطة ضاعت|مريض|مرض|شرطة|سفارة|ضعت|مساعدة الآن|emergency|passport|lost bag|police|embassy|illness|urgent/i.test(query)) {
    const nextContext: TravelContext = {
      ...baseContext,
      service_interests: mergeServiceInterests(baseContext.service_interests, ["emergency", "insurance"]),
      booking_stage: baseContext.booking_stage ?? "in_trip",
      concerns: Array.from(new Set([...(baseContext.concerns ?? []), "emergency"])).slice(0, 8),
    };
    return NextResponse.json({
      intent: { origin: nextContext.origin, destination: nextContext.destination, departure_date: nextContext.departure_date, return_date: nextContext.return_date, adults: nextContext.adults, budget_usd: nextContext.budget_usd, trip_type: nextContext.trip_type, cabin_class: nextContext.cabin_class, notes: "emergency" },
      locale,
      mode: "advice",
      message: isAr
        ? "أنا معك. أولاً: ابتعد لمكان مضاء/رسمي إذا كنت غير مرتاح، واحتفظ بالجوال والوثائق معك. بعدها قل لي نوع المشكلة: جواز، شنطة، مرض، شرطة، تأخير رحلة، أو ضياع طريق. سأعطيك خطوات قصيرة وما تقوله بالضبط. إذا يوجد خطر مباشر اتصل بالطوارئ المحلية فوراً."
        : "I’m with you. First: move to a bright/official place if you feel unsafe, and keep your phone and documents with you. Then tell me the issue: passport, bag, illness, police, flight delay, or getting lost. I’ll give short steps and exact wording. If there is immediate danger, call local emergency services now.",
      context: nextContext,
      wants: ["flights", "hotels"],
      followup: isAr ? "ما نوع المشكلة الآن؟" : "What is happening right now?",
      tips: null,
      budget_verdict: null,
      confidence: null,
      destination_intel: null,
      clarification_needed: false,
      clarification_question: null,
      mock: true,
      notice,
    });
  }

  if (/أكل|اكل|مطعم|حلال|منيو|حساسية|food|restaurant|halal|menu|allergy|dietary/i.test(query)) {
    const nextContext: TravelContext = {
      ...baseContext,
      service_interests: mergeServiceInterests(baseContext.service_interests, ["food", "translation"]),
      booking_stage: baseContext.booking_stage ?? "in_trip",
      concerns: Array.from(new Set([...(baseContext.concerns ?? []), "food"])).slice(0, 8),
    };
    return NextResponse.json({
      intent: { origin: nextContext.origin, destination: nextContext.destination, departure_date: nextContext.departure_date, return_date: nextContext.return_date, adults: nextContext.adults, budget_usd: nextContext.budget_usd, trip_type: nextContext.trip_type, cabin_class: nextContext.cabin_class, notes: "food" },
      locale,
      mode: "advice",
      message: isAr
        ? "أساعدك تختار أكل بثقة. إذا أرسلت صورة المنيو أشرح لك الأطباق والأسعار وما يناسبك. للحلال قل لهم: هل اللحم حلال؟ وهل يوجد كحول أو خنزير في الطبق؟ وإذا عندك حساسية اكتبها لي وأصيغ لك عبارة محلية واضحة."
        : "I’ll help you choose food confidently. Send a menu photo and I’ll explain dishes, prices, and what fits you. For halal, ask: Is the meat halal? Does this include alcohol or pork? If you have an allergy, tell me and I’ll phrase it clearly in the local language.",
      context: nextContext,
      wants: ["flights", "hotels"],
      followup: isAr ? "هل تريد ترشيح طبق، مطعم، أو قراءة منيو؟" : "Do you want a dish suggestion, restaurant help, or menu reading?",
      tips: null,
      budget_verdict: null,
      confidence: null,
      destination_intel: null,
      clarification_needed: false,
      clarification_question: null,
      mock: true,
      notice,
    });
  }

  if (/شنطة|الشنطة|ماذا أحضر|ماذا احضر|ألبس|البس|packing|pack|luggage|bag|what to wear/i.test(query)) {
    const nextContext: TravelContext = {
      ...baseContext,
      service_interests: mergeServiceInterests(baseContext.service_interests, ["packing"]),
      booking_stage: baseContext.booking_stage ?? "pre_trip",
      concerns: Array.from(new Set([...(baseContext.concerns ?? []), "packing"])).slice(0, 8),
    };
    return NextResponse.json({
      intent: { origin: nextContext.origin, destination: nextContext.destination, departure_date: nextContext.departure_date, return_date: nextContext.return_date, adults: nextContext.adults, budget_usd: nextContext.budget_usd, trip_type: nextContext.trip_type, cabin_class: nextContext.cabin_class, notes: "packing" },
      locale,
      mode: "advice",
      message: isAr
        ? "خلّنا نجهز شنطة ذكية بدون مبالغة: وثائق وجواز/تأشيرة، شواحن وباوربانك، أدوية أساسية، لبس حسب الطقس، حذاء مشي مريح، وقطعة رسمية خفيفة لو احتجتها. أعطني الوجهة وعدد الأيام وأحوّلها لقائمة دقيقة حسب الجو والنشاطات."
        : "Let’s pack smart without overpacking: passport/visa documents, chargers and power bank, basic medicine, clothes by weather, comfortable walking shoes, and one nicer outfit if needed. Tell me destination and days and I’ll make it precise by weather and activities.",
      context: nextContext,
      wants: ["flights", "hotels"],
      followup: nextContext.destination ? null : isAr ? "ما الوجهة وعدد الأيام؟" : "What destination and how many days?",
      tips: null,
      budget_verdict: null,
      confidence: null,
      destination_intel: null,
      clarification_needed: false,
      clarification_question: null,
      mock: true,
      notice,
    });
  }

  if (/تنقل|مواصلات|تاكسي|مترو|باص|transfer|transport|taxi|metro|bus|uber/i.test(query)) {
    const nextContext: TravelContext = {
      ...baseContext,
      service_interests: mergeServiceInterests(baseContext.service_interests, ["transport"]),
      booking_stage: baseContext.booking_stage ?? "in_trip",
      concerns: Array.from(new Set([...(baseContext.concerns ?? []), "transport"])).slice(0, 8),
    };
    return NextResponse.json({
      intent: { origin: nextContext.origin, destination: nextContext.destination, departure_date: nextContext.departure_date, return_date: nextContext.return_date, adults: nextContext.adults, budget_usd: nextContext.budget_usd, trip_type: nextContext.trip_type, cabin_class: nextContext.cabin_class, notes: "transport" },
      locale,
      mode: "advice",
      message: isAr
        ? "أقارن لك التنقل كمسافر: التاكسي الرسمي أفضل مع شنط كثيرة أو وصول متأخر، التطبيقات أوضح بالسعر، المترو أرخص وأسرع داخل المدن، والباص مناسب إذا عندك وقت. قل لي من أين إلى أين، وهل معك شنط/أطفال، وأعطيك الخيار الأفضل والسعر الطبيعي وما تتجنبه."
        : "I’ll compare transport like a traveler: official taxi is best with luggage or late arrival, ride-hailing is clearer on price, metro is usually fastest and cheapest in cities, and buses work when you have time. Tell me from where to where, and whether you have luggage/kids, and I’ll pick the best option with normal price ranges and what to avoid.",
      context: nextContext,
      wants: ["flights", "hotels"],
      followup: isAr ? "من أين إلى أين تريد التنقل؟" : "From where to where?",
      tips: null,
      budget_verdict: null,
      confidence: null,
      destination_intel: null,
      clarification_needed: false,
      clarification_question: null,
      mock: true,
      notice,
    });
  }

  if (/مطار|airport|boarding|gate|terminal|ترانزيت|transit|layover/i.test(query)) {
    const airportMessage = isAr
      ? hasIstanbul
        ? `تمام، بعد الجوازات في مطار إسطنبول اتبع لوحات Baggage Claim أولاً لاستلام الشنط، ثم Customs/Exit. ${hasFamily ? "بما أنك مع عائلتك، خذوا 5 دقائق قبل الخروج لتجميع الشنط والمياه والحمام." : "بعدها خذ لحظة قبل الخروج لتتأكد من الشنط والوثائق."} للمواصلات: اتبع لوحات Taxi الرسمية أو Havaist/Metro، ولا تقبل عروض السائقين داخل الصالة. إذا أرسلت صورة الشاشة أو رقم بوابة الخروج أقول لك المسار الأدق.`
        : "خلّيني أمشي معك خطوة بخطوة. بعد الجوازات اتبع Baggage Claim للشنط، ثم Customs/Exit، وبعد الخروج لا تركب إلا من موقف رسمي أو تطبيق موثوق. أرسل لي اسم المطار أو صورة الشاشة/التذكرة وأقول لك الخطوة التالية بدقة."
      : hasIstanbul
        ? `After immigration at Istanbul Airport, follow Baggage Claim first, then Customs/Exit. ${hasFamily ? "Since you’re with family, pause before exiting to regroup, use restrooms, and check bags." : "Before exiting, pause and check your bags and documents."} For transport, follow official Taxi, Havaist, or Metro signs; avoid drivers approaching you inside the hall. Send a photo of the screen or exit sign and I’ll guide you exactly.`
        : "I’ll guide you step by step. After immigration, follow Baggage Claim, then Customs/Exit. Outside, use only official taxi stands or trusted apps. Send the airport name or a photo of the screen/ticket and I’ll tell you the exact next move.";

    return NextResponse.json({
      intent: { origin: null, destination: null, departure_date: null, return_date: null, adults: 2, budget_usd: null, trip_type: null, cabin_class: null, notes: null },
      locale,
      mode: "advice",
      message: airportMessage,
      context: {
        ...baseContext,
        service_interests: mergeServiceInterests(baseContext.service_interests, ["airport_help", "esim", "insurance", "transport"]),
        booking_stage: baseContext.booking_stage ?? "planning",
        concerns: Array.from(new Set([...(baseContext.concerns ?? []), "airport"])).slice(0, 8),
      },
      wants: ["flights", "hotels"],
      followup: isAr ? "ما اسم المطار أو أرسل صورة الشاشة." : "What airport are you in, or send a photo of the screen.",
      tips: null,
      budget_verdict: null,
      confidence: null,
      destination_intel: null,
      clarification_needed: false,
      clarification_question: null,
      mock: true,
      notice,
    });
  }

  if (/آمن|أمان|safe|safety|scam|نصب|احتيال|خطر|danger/i.test(query)) {
    const safetyMessage = isAr
      ? hasTaksim
        ? `تقسيم مناسبة ومزدحمة غالباً، لكنها ليست منطقة “هادئة” للعائلة ليلاً. امشوا في الشوارع الرئيسية المضيئة، تجنبوا الأزقة المتأخرة، ولا تتعاملوا مع من يدعوكم لمقهى/بار أو يعرض مساعدة بشكل مبالغ. للمواصلات ليلاً استخدموا تطبيق موثوق أو تاكسي رسمي من نقطة واضحة. إذا كان معكم أطفال، الأفضل السكن قريب من المترو أو اختيار شيشلي/نشان تاشي لهدوء أكثر.`
        : "أقدر أساعدك بهدوء بدون تهويل. أعطني الوجهة أو الحي، وسأعطيك: المناطق الأفضل، المواصلات الآمنة، أشهر أساليب الاحتيال، وماذا تتجنب ليلاً. كقاعدة عامة: لا تستخدم تاكسي عشوائي، لا تسلّم الجواز إلا لجهة رسمية، واحتفظ بنسخة رقمية من وثائقك."
      : hasTaksim
        ? "Taksim is usually busy and convenient, but it is not the calmest family area late at night. Stay on bright main streets, avoid late side alleys, and ignore people inviting you to bars/cafes or offering unusual help. At night use a trusted app or official taxi point. With kids, staying near metro access or in Sisli/Nisantasi can feel calmer."
        : "I can help calmly without exaggerating. Tell me the destination or neighborhood and I’ll cover safe areas, transport, common scams, and what to avoid at night. General rule: avoid random taxis, never hand over your passport except to official staff, and keep digital copies of documents.";

    return NextResponse.json({
      intent: { origin: null, destination: null, departure_date: null, return_date: null, adults: 2, budget_usd: null, trip_type: null, cabin_class: null, notes: null },
      locale,
      mode: "advice",
      message: safetyMessage,
      context: {
        ...baseContext,
        service_interests: mergeServiceInterests(baseContext.service_interests, ["insurance"]),
        booking_stage: baseContext.booking_stage ?? "planning",
        concerns: Array.from(new Set([...(baseContext.concerns ?? []), "safety"])).slice(0, 8),
      },
      wants: ["flights", "hotels"],
      followup: hasTaksim ? null : isAr ? "ما الوجهة أو الحي؟" : "Which destination or neighborhood?",
      tips: null,
      budget_verdict: null,
      confidence: null,
      destination_intel: null,
      clarification_needed: false,
      clarification_question: null,
      mock: true,
      notice,
    });
  }

  if (/ميزاني|ميزانية|budget|تكلفة|cost|وفر|أوفر|cheap|رخيص/i.test(lower)) {
    const budgetAmount = moneyMatch?.[1] ?? null;
    const days = daysMatch?.[1] ?? null;
    const knownDestination = baseContext.destination ?? (hasIstanbul ? "Istanbul" : null);
    const destinationLabel = displayDestinationName(knownDestination, locale);
    const knownDays = days ?? null;
    const hasBudgetContext = !!knownDestination || !!baseContext.departure_date || !!baseContext.traveler_type;
    const budgetMessage = isAr
      ? budgetAmount && days && hasIstanbul
        ? `${budgetAmount} دولار لمدة ${days} أيام في إسطنبول ممكنة إذا كان السفر اقتصادي إلى متوسط. التقسيم الأقرب: سكن بسيط 45-80 دولار لليلة، أكل 20-35 دولار يومياً للشخص، مواصلات 5-12 دولار يومياً، وأنشطة 15-40 دولار يومياً حسب الاختيارات. وفر أكثر بالسكن قرب المترو، استخدام Istanbulkart، وتقليل التاكسي. إذا عدد المسافرين أكثر من شخص قل لي العدد وأحسبها بدقة.`
        : hasBudgetContext
          ? `أحسبها لك على أساس ${destinationLabel ?? "رحلتك"} بدون ما نعيد البداية: نحتاج فقط رقم الميزانية أو عدد الأيام لأقسمها بدقة. كبداية، خل الميزانية موزعة على السكن، الأكل، المواصلات، الأنشطة، شريحة الإنترنت، واحتياط بسيط للطوارئ.`
          : "أحسبها لك كمسافر، مو كجدول جامد. أعطني الوجهة، عدد الأيام، وعدد الأشخاص، وسأقسمها إلى: سكن، أكل، مواصلات، أنشطة، إنترنت/شريحة، واحتياط. إذا عندك رقم ميزانية قل لي إياه وأقول لك هل يكفي وأين نوفر."
      : budgetAmount && days && hasIstanbul
        ? `$${budgetAmount} for ${days} days in Istanbul can work on an economy to mid-range style. Rough split: simple stay $45-80/night, food $20-35/day per person, transport $5-12/day, activities $15-40/day. Save by staying near metro, using Istanbulkart, and limiting taxis. Tell me traveler count and I’ll calculate it tighter.`
        : hasBudgetContext
          ? `I’ll calculate this around ${destinationLabel ?? "your trip"} without restarting the intake. I only need your budget number or trip length to make it precise. A useful first split is stay, food, transport, activities, data/eSIM, and a small safety buffer.`
          : "I’ll calculate it like a traveler, not a spreadsheet. Tell me destination, days, and travelers, and I’ll split it into stay, food, transport, activities, data/eSIM, and buffer. If you have a budget number, send it and I’ll tell you if it works and where to save.";

    return NextResponse.json({
      intent: { origin: baseContext.origin, destination: knownDestination, departure_date: baseContext.departure_date, return_date: baseContext.return_date, adults: baseContext.adults, budget_usd: budgetAmount ? Number(budgetAmount) : baseContext.budget_usd, trip_type: baseContext.trip_type, cabin_class: baseContext.cabin_class, notes: "budget" },
      locale,
      mode: "advice",
      message: budgetMessage,
      context: {
        ...baseContext,
        destination: knownDestination,
        budget_usd: budgetAmount ? Number(budgetAmount) : baseContext.budget_usd,
        service_interests: mergeServiceInterests(baseContext.service_interests, ["esim"]),
        booking_stage: baseContext.booking_stage ?? "planning",
        concerns: Array.from(new Set([...(baseContext.concerns ?? []), "budget"])).slice(0, 8),
      },
      wants: ["flights", "hotels"],
      followup: budgetAmount && knownDays ? null : isAr ? "كم ميزانيتك أو كم يوم مدة الرحلة؟" : "What is your budget or trip length?",
      tips: null,
      budget_verdict: null,
      confidence: null,
      destination_intel: null,
      clarification_needed: false,
      clarification_question: null,
      mock: true,
      notice,
    });
  }

  if (/تأمين|insurance|medical cover|coverage|شنغن|schengen/i.test(query)) {
    const nextContext: TravelContext = {
      ...baseContext,
      service_interests: mergeServiceInterests(baseContext.service_interests, serviceInterestsFromQuery(query)),
      booking_stage: baseContext.booking_stage ?? "planning",
      concerns: Array.from(new Set([...(baseContext.concerns ?? []), "insurance"])).slice(0, 8),
    };
    return NextResponse.json({
      intent: { origin: nextContext.origin, destination: nextContext.destination, departure_date: nextContext.departure_date, return_date: nextContext.return_date, adults: nextContext.adults, budget_usd: nextContext.budget_usd, trip_type: nextContext.trip_type, cabin_class: nextContext.cabin_class, notes: "insurance" },
      context: nextContext,
      locale,
      mode: "advice",
      message: isAr
        ? "التأمين يفيد أكثر إذا رحلتك دولية، فيها عائلة، فيزا، رحلات طويلة، أو حجوزات غير قابلة للاسترداد. راجع 4 أشياء قبل الشراء: التغطية الطبية، إلغاء/تأخير الرحلة، الأمتعة، والاستثناءات. إذا أعطيتني الوجهة ومدة السفر أقول لك هل هو ضروري أو اختياري."
        : "Travel insurance matters most for international trips, families, visa requirements, long trips, or non-refundable bookings. Check four things before buying: medical coverage, cancellation/delay, baggage, and exclusions. Tell me destination and duration and I’ll say if it is essential or optional.",
      wants: ["flights", "hotels"],
      followup: nextContext.destination ? null : isAr ? "ما الوجهة ومدة السفر؟" : "What destination and trip length?",
      tips: null,
      budget_verdict: null,
      confidence: null,
      destination_intel: null,
      clarification_needed: false,
      clarification_question: null,
      mock: true,
      notice,
    });
  }

  if (/esim|e-sim|شريحة|شرائح|انترنت|إنترنت|roaming|data/i.test(query)) {
    const nextContext: TravelContext = {
      ...baseContext,
      service_interests: mergeServiceInterests(baseContext.service_interests, serviceInterestsFromQuery(query)),
      booking_stage: baseContext.booking_stage ?? "planning",
    };
    return NextResponse.json({
      intent: { origin: nextContext.origin, destination: nextContext.destination, departure_date: nextContext.departure_date, return_date: nextContext.return_date, adults: nextContext.adults, budget_usd: nextContext.budget_usd, trip_type: nextContext.trip_type, cabin_class: nextContext.cabin_class, notes: "esim" },
      context: nextContext,
      locale,
      mode: "advice",
      message: isAr
        ? "الشريحة الإلكترونية ممتازة إذا تريد تصل والإنترنت جاهز بدون تجوال. الأفضل تشتريها قبل السفر، تتأكد أن جوالك يدعم eSIM، وتختار باقة حسب الأيام واستخدام الخرائط. إذا الوجهة فيها إنترنت عام ضعيف أو تنقل كثير، خذ باقة أكبر قليلاً."
        : "An eSIM is useful when you want data ready on arrival without roaming. Buy it before travel, confirm your phone supports eSIM, and choose data by trip length and map usage. If public Wi-Fi is weak or you move around a lot, choose a slightly larger plan.",
      wants: ["flights", "hotels"],
      followup: nextContext.destination ? null : isAr ? "ما الوجهة ومدة السفر؟" : "What destination and trip length?",
      tips: null,
      budget_verdict: null,
      confidence: null,
      destination_intel: null,
      clarification_needed: false,
      clarification_question: null,
      mock: true,
      notice,
    });
  }

  if (/أنشطة|نشاط|جولات|تذاكر|activities|tours|tickets|klook|getyourguide/i.test(query)) {
    const nextContext: TravelContext = {
      ...baseContext,
      service_interests: mergeServiceInterests(baseContext.service_interests, serviceInterestsFromQuery(query)),
      booking_stage: baseContext.booking_stage ?? "planning",
    };
    return NextResponse.json({
      intent: { origin: nextContext.origin, destination: nextContext.destination, departure_date: nextContext.departure_date, return_date: nextContext.return_date, adults: nextContext.adults, budget_usd: nextContext.budget_usd, trip_type: nextContext.trip_type, cabin_class: nextContext.cabin_class, notes: "activities" },
      context: nextContext,
      locale,
      mode: "advice",
      message: isAr
        ? "أفضل الأنشطة تعتمد على أسلوب الرحلة: عائلية، ثقافية، مغامرة، أو هادئة. لا أنصح بحجز كل شيء دفعة واحدة؛ اختر نشاطاً رئيسياً كل يوم واترك مساحة للراحة. أعطني الوجهة وعدد الأيام وأرتب لك ترشيحات خفيفة."
        : "The best activities depend on travel style: family, culture, adventure, or calm. Don’t book everything at once; choose one anchor activity per day and leave breathing room. Tell me destination and days and I’ll suggest a light plan.",
      wants: ["flights", "hotels"],
      followup: nextContext.destination ? null : isAr ? "ما الوجهة وعدد الأيام؟" : "What destination and how many days?",
      tips: null,
      budget_verdict: null,
      confidence: null,
      destination_intel: null,
      clarification_needed: false,
      clarification_question: null,
      mock: true,
      notice,
    });
  }

  if (isPostBookingLifecycle(baseContext.booking_stage)) {
    const destinationLabel = displayDestinationName(baseContext.destination, locale) ?? (isAr ? "رحلتك" : "your trip");
    const message =
      baseContext.booking_stage === "in_trip"
        ? isAr
          ? `أنا معك الآن أثناء الرحلة في ${destinationLabel}. لن أرجع أعرض عليك حجوزات؛ سأساعدك في الموقف الحالي مباشرة: ترجمة، مطار، تاكسي، أمان، أو ميزانية اليوم. قل لي أين أنت الآن أو أرسل صورة/عبارة وسأعطيك خطوة واضحة.`
          : `I’m with you during the trip in ${destinationLabel}. I will not keep showing bookings; I’ll help with the live moment: translation, airport, taxi, safety, or today’s budget. Tell me where you are now or send the phrase/photo.`
        : isAr
          ? `تمام، بما أنك وصلت لمرحلة ما بعد الحجز لرحلة ${destinationLabel}، تركيزي الآن على تجهيز الرحلة لا تكرار عروض الحجز: خطة الوصول، الشريحة، التأمين، الطقس، والشنطة. ابدأ بخطة الوصول أو قل لي أكثر شيء مقلقك قبل السفر.`
          : `Got it. Since ${destinationLabel} is now post-booking, I’ll focus on trip preparation instead of repeating booking offers: arrival plan, data, insurance, weather, and packing. Start with arrival or tell me your biggest concern.`;

    return NextResponse.json({
      intent: {
        origin: baseContext.origin,
        destination: baseContext.destination,
        departure_date: baseContext.departure_date,
        return_date: baseContext.return_date,
        adults: baseContext.adults,
        budget_usd: baseContext.budget_usd,
        trip_type: baseContext.trip_type,
        cabin_class: baseContext.cabin_class,
        notes: baseContext.booking_stage,
      },
      locale,
      mode: "advice",
      message,
      context: baseContext,
      wants: ["flights", "hotels"],
      followup: null,
      tips: null,
      budget_verdict: null,
      confidence: null,
      destination_intel: null,
      clarification_needed: false,
      clarification_question: null,
      mock: true,
      notice,
    });
  }

  // Advice questions (visa, safety, weather, tips) → answer briefly and offer to plan
  if (isAdviceQuery(query)) {
    return NextResponse.json({
      intent: { origin: baseContext.origin, destination: baseContext.destination, departure_date: baseContext.departure_date, return_date: baseContext.return_date, adults: baseContext.adults, budget_usd: baseContext.budget_usd, trip_type: baseContext.trip_type, cabin_class: baseContext.cabin_class, notes: null },
      locale,
      mode: "advice",
      message: isAr
        ? "سؤال ممتاز. أقدر أساعدك بإجابة عملية الآن: أعطني الوجهة أو الحي أو الموقف، وسأعطيك خلاصة هادئة مع خطوة تالية واحدة بدون تكرار أسئلة."
        : "Good question. I can still help with a practical answer now: give me the destination, neighborhood, or situation and I’ll give you a calm summary with one next step.",
      context: baseContext,
      wants: ["flights", "hotels"],
      followup: null,
      tips: null,
      budget_verdict: null,
      confidence: null,
      destination_intel: null,
      clarification_needed: false,
      clarification_question: null,
      mock: true,
      notice,
    });
  }

  // Parse intent from FULL conversation context, not just current message
  const fullContext = buildHistoryContext(query, history);
  const intent = { ...heuristicParse(fullContext), ...(context ? filterNulls(context) : {}) };
  const wants = detectWants(fullContext);

  const destIata = intent.destination;
  const destNameAr = (destIata && IATA_TO_NAME_AR[destIata]) || null;
  const destNameEn = (destIata && IATA_TO_NAME_EN[destIata]) || null;
  const isHoneymoon = intent.trip_type === "honeymoon";
  const isFamily = intent.trip_type === "family";
  const hasDate = !!intent.departure_date;
  let hasOrigin = !!intent.origin;
  const isFirst = isFirstUserTurn(history);

  // ── Standalone origin detection ──────────────────────────────────────────
  // When destination + date are known but origin is missing, the current user
  // message might simply BE the origin city (answering "from where?").
  // Check the CURRENT query only — not the full history context.
  if (!hasOrigin && hasDate && (destNameAr || destNameEn)) {
    const cityFromQuery = findAnyCity(query, destIata || null);
    if (cityFromQuery) {
      intent.origin = cityFromQuery;
      hasOrigin = true;
    }
  }

  let message: string;
  let mode: "clarify" | "search" = "clarify";

  // Decision tree based on what's still missing:
  //   ① destination unknown      → ask where
  //   ② destination known, no date → ask when
  //   ③ destination + date, no origin (and wants flights) → ask from where
  //   ④ all present → search
  if (isAr) {
    if (!destNameAr) {
      message = isFirst
        ? "أهلاً! 👋 أنا ريا. إلى أين تفكر تسافر؟ سواء وجهة معينة أو حتى فكرة عامة (شاطئ، تسوق، طبيعة) أساعدك."
        : "ممكن تخبرني الوجهة اللي تفكر فيها؟ حتى لو فكرة عامة (شاطئ، أوروبا، آسيا) تكفي.";
    } else if (!hasDate) {
      const opener = isHoneymoon
        ? `شهر عسل في ${destNameAr} — حلم حقيقي! 🌴`
        : isFamily
          ? `رحلة عائلية إلى ${destNameAr} — خيار ممتاز! 🌍`
          : `${destNameAr} — اختيار رائع! ✨`;
      message = `${opener} متى تفكر تسافر؟ حتى لو مجرد شهر تقريبي يكفي.`;
    } else if (wants.includes("flights") && !hasOrigin) {
      message = `ممتاز! 🛫 من أي مدينة ستنطلق رحلتك إلى ${destNameAr}؟`;
    } else {
      // All key context present — let the client search
      mode = "search";
      message = `ممتاز! ✨ ${destNameAr}${hasOrigin ? ` من ${IATA_TO_NAME_AR[intent.origin!] ?? intent.origin}` : ""} — جاري البحث عن أفضل العروض لك...`;
    }
  } else {
    if (!destNameEn) {
      message = isFirst
        ? "Hi! 👋 I'm Raya. Where are you thinking of going? Could be a specific city or just an idea (beach, mountains, Europe) — I'll help."
        : "Tell me the destination you have in mind — even a general idea (beach, Asia, Europe) works.";
    } else if (!hasDate) {
      const opener = isHoneymoon
        ? `${destNameEn} honeymoon — what a dream! 🌴`
        : isFamily
          ? `A family trip to ${destNameEn} — great choice! 🌍`
          : `${destNameEn} — excellent pick! ✨`;
      message = `${opener} When are you thinking of going? Even a rough month helps me find the best deals.`;
    } else if (wants.includes("flights") && !hasOrigin) {
      message = `Great! 🛫 Which city will you be flying from? (to ${destNameEn})`;
    } else {
      mode = "search";
      message = `Perfect! ✨ ${destNameEn}${hasOrigin ? ` from ${IATA_TO_NAME_EN[intent.origin!] ?? intent.origin}` : ""} — searching the best deals for you now...`;
    }
  }

  return NextResponse.json({
    intent,
    locale,
    mode,
    message,
    wants,
    followup: null,
    tips: null,
    budget_verdict: null,
    confidence: null,
    destination_intel: null,
    clarification_needed: mode === "clarify",
    clarification_question: null,
    mock: true,
    notice,
  });
}

export async function POST(req: NextRequest) {
  // B2: Reject oversized payloads before parsing.
  const cl = Number(req.headers.get("content-length") ?? "0");
  if (cl > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  // B1: Production rate limit — Supabase-backed sliding window, composite key
  const rl = await rateLimit(req, "parse", {
    limit: 20,
    windowSec: 60,
    burstLimit: 5,
    burstWindowSec: 10,
    failOpen: false,
  });
  if (!rl.allowed) {
    return rateLimitResponse(rl);
  }

  let query = "";
  let history: ChatTurn[] = [];
  let context: TravelContext | undefined;
  let clientMemory:
    | {
        summary?: string | null;
        knownFacts?: string[];
        askedSlots?: string[];
        turnCount?: number;
        lastUserIntent?: string | null;
      }
    | undefined;
  try {
    type IncomingTurn = { role?: string; text?: string; mode?: string };
    const body = (await req.json()) as {
      query?: string;
      history?: IncomingTurn[];
      context?: TravelContext;
      clientMemory?: typeof clientMemory;
    };
    query = body.query?.trim() ?? "";
    history = Array.isArray(body.history)
      ? body.history.slice(-12).flatMap((t): ChatTurn[] => {
          if (typeof t?.text !== "string") return [];
          const role: ChatTurn["role"] =
            t.role === "user" ? "user" : "assistant";
          const mode =
            t.mode === "clarify" || t.mode === "search" || t.mode === "advice"
              ? (t.mode as ChatTurn["mode"])
              : undefined;
          // B2: clamp every history message length
          return [{ role, text: t.text.slice(0, MAX_HISTORY_MSG_LEN), mode }];
        })
      : [];
    context = body.context;
    clientMemory = body.clientMemory;
    if (!query || query.length < 2) {
      return NextResponse.json({ error: "Empty query" }, { status: 400 });
    }
    if (query.length > MAX_QUERY_LENGTH) {
      query = query.slice(0, MAX_QUERY_LENGTH);
    }
    // B2: strip control / zero-width / direction-override chars
    query = query.replace(/[​-‏‪-‮\x00-\x1f]/g, "");
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  try {
    const supportTicket = await maybeCreateSupportTicket(req, query);
    if (supportTicket) return supportTicket;

    const distanceAdvice = maybeDistanceAdvice(query);
    if (distanceAdvice) return distanceAdvice;

    // Default to empty context if client didn't send one (older client builds).
    const ctx: TravelContext = context ?? {
      destination: null,
      origin: null,
      departure_date: null,
      return_date: null,
      adults: 2,
      budget_usd: null,
      trip_type: null,
      cabin_class: null,
      traveler_type: null,
      hotel_preferences: [],
      service_interests: [],
      booking_stage: detectLifecycleFromText(query),
      concerns: [],
    };

    // Identity: signed-in user (for memory) + anon session id (for cross-turn
    // tracking when not signed in). `gtz_sid` cookie is set on the response if
    // a new one was minted.
    const user = await getCurrentUser();
    let anonSid = req.cookies.get("gtz_sid")?.value ?? null;
    let mintedSid: string | null = null;
    if (!user && !anonSid) {
      mintedSid = genAnonSid();
      anonSid = mintedSid;
    }

    // Ria orchestrator: pre-filter + LLM + post-process (Phase 3 + 4).
    // Replaces the legacy enforceConversationalMode override layer.
    const { conversationId, intelligence: intel, mergedContext, telemetry } =
      await runRayaOrchestrator(query, history, ctx, {
        userId: user?.id ?? null,
        sessionId: anonSid,
        clientMemory,
      });

    console.log(
      `[parse] orch mode=${telemetry.finalMode} prefilter=${telemetry.preFilterExtracted.join(",") || "none"} ms=${telemetry.durationMs}`,
    );

    // Live tips: fire-and-forget with a 2s timeout so they never block the response (M1).
    // Client will receive tips: null immediately; a future streaming endpoint can push them.
    const tipsPromise =
      intel.mode === "search" && intel.intent.destination
        ? Promise.race([
            getLiveTips(intel.intent.destination, intel.locale).catch(() => null),
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
          ])
        : Promise.resolve(null);
    const tips = await tipsPromise;

    const response = NextResponse.json({
      conversation_id: conversationId,
      intent: intel.intent,
      // Echo back the merged context so the client can update its store
      // from the server's authoritative view (instead of merging client-side).
      context: mergedContext,
      locale: intel.locale,
      mode: intel.mode,
      message: intel.message,
      wants: intel.wants,
      followup: intel.followup,
      tips,
      budget_verdict: intel.budget_verdict ?? null,
      confidence: intel.confidence ?? null,
      destination_intel: intel.destination_intel ?? null,
      clarification_needed: intel.clarification_needed ?? false,
      clarification_question: intel.clarification_question ?? null,
      mock: false,
    });

    if (mintedSid) {
      // M8: sameSite=lax preserves SEO cross-site landings (Google → gotripza.com),
      // and our middleware-level Origin allowlist provides CSRF defence (B7).
      response.cookies.set("gtz_sid", mintedSid, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: "/",
      });
    }

    return response;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(
      "[parse] AI engine error, falling back to smart local intelligence:",
      message,
    );
    void captureError(err, { route: "parse", phase: "orchestrator" });
    const providerNotice = isProviderError(message)
      ? "ai_error_using_smart_fallback"
      : "unknown_error_using_smart_fallback";

    // For deep travel questions, the old keyword fallback was too shallow and
    // often asked for facts already present in the message. Use a richer local
    // travel fallback first; keep the legacy fallback only as a hard safety net.
    try {
      const parsedConversation = heuristicParse(buildHistoryContext(query, history));
      const previousConversation = heuristicParse(buildHistoryContext("", history));
      const parsedCurrent = heuristicParse(query);
      const currentText = query.toLowerCase();
      const currentHasDestination = !!parsedCurrent.destination;
      const isNewExplicitDestination = currentHasDestination
        && !!(context?.destination ?? previousConversation.destination)
        && parsedCurrent.destination !== (context?.destination ?? previousConversation.destination);
      const currentHasDate = !!parsedCurrent.departure_date || /(بكرة|غداً|غدا|بعد\s+العيد|نهاية\s+الشهر|يناير|فبراير|مارس|أبريل|ابريل|مايو|يونيو|يوليو|أغسطس|اغسطس|سبتمبر|أكتوبر|اكتوبر|نوفمبر|ديسمبر|january|february|march|april|may|june|july|august|september|october|november|december)/i.test(currentText);
      const currentHasReturnDate = /(إلى|الى|حتى|لغاية|to|through|-)|\d{1,2}\s*(?:أيام|ايام|يوم|ليال|ليالي|ليلة|days?|nights?)/i.test(currentText);
      const currentHasBudget = parsedCurrent.budget_usd !== null || /(ميزانية|ريال|درهم|دولار|يورو|budget|sar|aed|usd|eur|\$)/i.test(currentText);
      const currentHasTraveler = /(?:لوحدي|وحدي|منفرد|مع\s+أمي|مع\s+امي|مع\s+أبوي|مع\s+ابوي|والدتي|والدي|زوج|زوجتي|زوجي|زوجة|طفلين|طفلان|أطفال|اطفال|عائل|family|kids|children|solo|alone|wife|husband|spouse|partner|\d+\s*(?:شخص|أشخاص|اشخاص|طفل|أطفال|اطفال|traveler|people|adult|passenger))/i.test(currentText);
      const scopedConversation = isNewExplicitDestination ? parsedCurrent : parsedConversation;
      const carryPreviousTrip = !isNewExplicitDestination;
      const inferredTravelerType: TravelContext["traveler_type"] =
        /(?:عائل|طفل|أطفال|اطفال|مع\s+أمي|مع\s+امي|مع\s+أبوي|مع\s+ابوي|والدتي|والدي|family|kids|children)/i.test(currentText) ? "family" :
        /(?:لوحدي|وحدي|منفرد|solo|alone)/i.test(currentText) ? "solo" :
        /(?:زوج|زوجتي|زوجي|زوجة|couple|wife|husband|spouse|partner)/i.test(currentText) ? "couple" :
        /(?:^|[\s،,.؟?])(عمل|دوام|مؤتمر)(?=$|[\s،,.؟?])|business|conference/i.test(currentText) ? "business" :
        carryPreviousTrip ? (context?.traveler_type ?? null) : null;
      const baseFallbackContext: TravelContext = {
        destination: null,
        origin: null,
        departure_date: null,
        return_date: null,
        adults: 2,
        budget_usd: null,
        trip_type: null,
        cabin_class: null,
        traveler_type: null,
        hotel_preferences: [],
        service_interests: [],
        booking_stage: detectLifecycleFromText(query),
        concerns: [],
      };
      const fallbackContext: TravelContext = {
        ...baseFallbackContext,
        ...(context ?? {}),
        destination: parsedCurrent.destination ?? (carryPreviousTrip ? (context?.destination ?? scopedConversation.destination) : null) ?? null,
        origin: parsedCurrent.origin ?? (carryPreviousTrip ? (context?.origin ?? scopedConversation.origin) : null) ?? null,
        departure_date: currentHasDate
          ? parsedCurrent.departure_date
          : (carryPreviousTrip ? (context?.departure_date ?? scopedConversation.departure_date ?? null) : null),
        return_date: currentHasDate && currentHasReturnDate
          ? parsedCurrent.return_date
          : (carryPreviousTrip ? (context?.return_date ?? previousConversation.return_date ?? scopedConversation.return_date ?? null) : null),
        adults: currentHasTraveler && (parsedCurrent.adults !== 2 || isNewExplicitDestination)
          ? parsedCurrent.adults
          : (carryPreviousTrip
              ? (context?.adults ?? (scopedConversation.adults !== 2 ? scopedConversation.adults : 2))
              : 2),
        budget_usd: currentHasBudget
          ? parsedCurrent.budget_usd
          : (carryPreviousTrip ? (context?.budget_usd ?? scopedConversation.budget_usd ?? null) : null),
        trip_type: currentHasTraveler || isNewExplicitDestination
          ? parsedCurrent.trip_type
          : (carryPreviousTrip ? (context?.trip_type ?? scopedConversation.trip_type ?? null) : null),
        cabin_class: parsedCurrent.cabin_class ?? (carryPreviousTrip ? (context?.cabin_class ?? scopedConversation.cabin_class ?? null) : null),
        traveler_type: inferredTravelerType,
        booking_stage: mergeLifecycleStage(context?.booking_stage ?? null, detectLifecycleFromText(query)),
      };
      const intel = buildSmartFallbackIntelligence(query, history, fallbackContext, providerNotice);

      return NextResponse.json({
        intent: intel.intent,
        context: {
          ...fallbackContext,
          destination: intel.intent.destination,
          origin: intel.intent.origin,
          departure_date: intel.intent.departure_date,
          return_date: intel.intent.return_date,
          adults: intel.intent.adults,
          budget_usd: intel.intent.budget_usd,
          trip_type: intel.intent.trip_type,
          cabin_class: intel.intent.cabin_class,
          booking_stage: mergeLifecycleStage(context?.booking_stage ?? null, detectLifecycleFromText(query)),
        },
        locale: intel.locale,
        mode: intel.mode,
        message: intel.message,
        wants: intel.wants,
        followup: intel.followup,
        tips: null,
        budget_verdict: intel.budget_verdict,
        confidence: intel.confidence,
        destination_intel: intel.destination_intel,
        clarification_needed: intel.clarification_needed,
        clarification_question: intel.clarification_question,
        mock: true,
        notice: intel.notice,
      });
    } catch (fallbackErr) {
      void captureError(fallbackErr, { route: "parse", phase: "smart_fallback" });
    }

    return heuristicFallback(
      query,
      providerNotice,
      history,
      context,
    );
  }
}
