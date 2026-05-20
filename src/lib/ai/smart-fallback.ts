import "server-only";
import type { ChatTurn, TravelIntelligence } from "./schemas/intelligence";
import type { TravelContext } from "./schemas/intent";
import { detectLifecycleFromText, mergeLifecycleStage } from "./trip-lifecycle";

type CityProfile = {
  code: string;
  name: string;
  region: string;
  stay: string[];
  transport: string[];
  avoid: string[];
  anchors: string[];
  timing: string;
  note: string;
};

const CITY_PROFILES: CityProfile[] = [
  { code: "HND", name: "Tokyo", region: "Japan", stay: ["Asakusa for calm value", "Ginza/Tokyo Station for easy transfers", "Shinjuku only if you want late energy"], transport: ["Haneda late arrival: official taxi or pre-booked transfer if kids and bags", "Suica/PASMO for local trains", "avoid complex late-night rail transfers with tired children"], avoid: ["last-train stress", "overloading day one", "assuming a lost bag will follow you without a written report"], anchors: ["Asakusa/Senso-ji", "Shibuya/Harajuku", "Ueno or teamLab depending on pace"], timing: "Start early, rest mid-afternoon, keep the arrival night purely operational.", note: "File the baggage report before leaving arrivals, photograph the reference number, then go straight to the hotel." },
  { code: "ICN", name: "Seoul", region: "South Korea", stay: ["Myeongdong for first-timers", "Hongdae for younger energy", "Insadong for culture"], transport: ["AREX or airport bus from ICN", "subway is excellent but has stairs in some stations", "taxis help in winter with kids"], avoid: ["too many cross-river transfers in one day", "unverified halal claims", "outdoor-heavy winter plans"], anchors: ["Gyeongbokgung", "Insadong/Bukchon", "Namsan or COEX"], timing: "In winter, cluster sights by neighborhood and build warm indoor breaks every 90 minutes.", note: "Use halal-friendly areas around Itaewon, but do not force every meal there; mix seafood/vegetarian options with clear translation cards." },
  { code: "SIN", name: "Singapore", region: "Singapore", stay: ["inside Changi for short layovers", "Marina Bay for skyline", "Bugis/City Hall for access"], transport: ["Jewel and terminals are enough for many layovers", "MRT is clean but immigration and return security eat time", "taxi/Grab is sensible with elderly parents"], avoid: ["leaving the airport with under 7 clear landside hours", "outdoor plans during heavy rain", "underestimating walking inside Changi"], anchors: ["Jewel waterfall", "Gardens by the Bay", "Marina Bay loop"], timing: "For a 9-hour layover, leave only if immigration queues are light and everyone is rested.", note: "With elderly parents and bags, Changi itself can be the premium plan, not the compromise." },
  { code: "DPS", name: "Bali", region: "Indonesia", stay: ["Ubud for culture", "Uluwatu for cliffs and sunset", "Sanur for calmer logistics"], transport: ["hire a driver by the day", "split hotels to avoid backtracking", "leave large buffer for traffic"], avoid: ["Ubud to Uluwatu day trips at peak traffic", "too many temples in one day", "scooters without experience"], anchors: ["Ubud rice terraces/temples", "Uluwatu sunset", "one beach club or spa block"], timing: "Use one base for Ubud and one for the south if you have 3+ nights.", note: "Bali rewards slow clusters; the mistake is treating the island like a compact city." },
  { code: "BKK", name: "Bangkok", region: "Thailand", stay: ["Riverside for comfort", "Sukhumvit for BTS access", "Siam for malls and families"], transport: ["Airport Rail Link plus taxi can work light", "Grab or official taxi from the airport with luggage", "BTS/river boat to dodge traffic"], avoid: ["drivers refusing meters", "gem/tour scams", "midday outdoor sightseeing with elderly parents"], anchors: ["Grand Palace early", "Wat Arun by river", "ICONSIAM or Siam malls for heat breaks"], timing: "Do outdoor sights early, rest 12:00-16:00, move again near sunset.", note: "Heat management is as important as itinerary design in Bangkok." },
  { code: "IST", name: "Istanbul", region: "Turkey", stay: ["Sirkeci/Sultanahmet for first history trip", "Galata/Karakoy for food and views", "Sisli/Nisantasi for calmer family comfort"], transport: ["IST airport official taxi, Havaist, or pre-booked transfer", "Istanbulkart for tram/metro/ferry", "use apps or official stands late at night"], avoid: ["unofficial drivers inside arrivals", "bar invitation scams around Taksim", "overpacking both Asian and European sides in one day"], anchors: ["Hagia Sophia/Blue Mosque", "Bosphorus ferry", "Galata/Karakoy food"], timing: "After midnight arrival, prioritize a safe transfer and sleep; start sightseeing late morning.", note: "Taksim is convenient but not the calmest late-night family base; stay on main lit streets." },
  { code: "DXB", name: "Dubai", region: "UAE", stay: ["Downtown for first visit", "Dubai Marina/JBR for beach evenings", "Deira for budget and old Dubai"], transport: ["metro works on main corridors", "taxi/Careem for heat or family legs", "avoid long outdoor walks in July"], avoid: ["midday outdoor sightseeing in summer", "stacking far-apart attractions", "overpaying for every observation deck"], anchors: ["Dubai Mall/Burj area indoors", "Museum of the Future or aquarium", "evening fountain/marina"], timing: "In July, plan indoor blocks by day and short outdoor moments after sunset.", note: "A good Dubai summer plan is about heat avoidance, not just attractions." },
  { code: "MLE", name: "Maldives", region: "Maldives", stay: ["resort island for privacy", "local island for budget/culture", "near Male for short stays"], transport: ["speedboat is simpler than seaplane for short trips", "check transfer times before flights", "confirm baggage limits"], avoid: ["hidden transfer and meal-plan costs", "assuming bikinis are allowed on all local beaches", "late arrival without overnight plan"], anchors: ["reef/snorkeling", "sandbank or sunset cruise", "spa/private dinner"], timing: "Match your international flight to transfer windows before choosing an island.", note: "The cheapest room can become expensive if transfers and meals are wrong." },
  { code: "CDG", name: "Paris", region: "France", stay: ["Saint-Germain for premium calm", "Opera for transport", "Le Marais for food and walking"], transport: ["taxis for low-walking days", "metro has stairs; buses can be gentler", "book timed entries"], avoid: ["overcrowded metro with valuables exposed", "restaurant touts near major sights", "too many monuments in one day"], anchors: ["Seine cruise", "Louvre/Orsay timed visit", "Eiffel/Trocadero photo stop"], timing: "Build one elegant low-walking loop, then rest before dinner.", note: "For parents, Paris feels best when you buy comfort strategically." },
  { code: "FCO", name: "Rome", region: "Italy", stay: ["Pantheon/Navona for walkability", "Prati for Vatican", "Monti for food and metro"], transport: ["pre-book airport transfer with kids", "taxis between hot midday gaps", "walk early/late only"], avoid: ["Colosseum/Vatican without timed tickets", "August midday ruins", "menus with photo boards beside landmarks"], anchors: ["Colosseum/Forum early", "Vatican another morning", "Trastevere or Monti dinner"], timing: "In August, sightsee 08:00-11:00, rest, then resume after 17:00.", note: "Rome is not hard if you treat heat and queues as the main enemy." },
  { code: "BCN", name: "Barcelona", region: "Spain", stay: ["Eixample for balance", "Gracia for calmer evenings", "Gothic only if you accept noise"], transport: ["metro is practical", "taxi late at night", "walk with anti-pickpocket habits"], avoid: ["beach/La Rambla distraction theft", "late empty alleys", "unlicensed club promoters"], anchors: ["Sagrada Familia timed", "Park Guell timed", "El Born/Eixample food"], timing: "Book Gaudi sights ahead and keep late nights simple.", note: "Solo safety is mostly about area choice, bag discipline, and not improvising late transport." },
  { code: "LHR", name: "London", region: "UK", stay: ["South Kensington for museums", "Paddington for Heathrow", "Bloomsbury for calm central access"], transport: ["Elizabeth line is usually best value", "Piccadilly line is cheapest but slower", "black cab/ride-hail only as disruption backup"], avoid: ["panic-buying expensive airport transfers", "changing lines with heavy bags in rush hour", "assuming all rail works are citywide"], anchors: ["museums", "Westminster walk", "Covent Garden/West End"], timing: "Check line status on landing, then choose Elizabeth line, Piccadilly, or coach/taxi backup.", note: "London rewards having a Plan B before you leave arrivals." },
  { code: "JFK", name: "New York", region: "USA", stay: ["Upper West Side for calmer first-timers", "Midtown for logistics", "Brooklyn Heights/Williamsburg for a slower feel"], transport: ["subway by day", "taxi/ride-hail late with tired travelers", "cluster boroughs"], avoid: ["staying inside Times Square if you hate chaos", "too many cross-town hops", "empty subway platforms late"], anchors: ["Central Park/museums", "Lower Manhattan ferry", "Brooklyn walk/food"], timing: "Do Times Square as a short pass-through, not your base.", note: "The best New York trip uses neighborhoods as chapters, not a checklist." },
  { code: "LAX", name: "Los Angeles", region: "USA", stay: ["Santa Monica/Venice for no-car beach days", "West Hollywood for food/nightlife", "Hollywood only for specific plans"], transport: ["rideshare between clusters", "Metro works for some routes but not all", "rent a car for Malibu/Griffith combinations"], avoid: ["crossing the city multiple times daily", "Hollywood Boulevard as a base expectation", "underestimating traffic"], anchors: ["Getty/Santa Monica", "Griffith/Hollywood", "Venice/Abbot Kinney"], timing: "Plan by west/central/east clusters; one major zone per day.", note: "LA without a car is possible only if your hotel location does heavy lifting." },
  { code: "YYZ", name: "Toronto", region: "Canada", stay: ["Downtown/Union for winter access", "Yorkville for comfort", "Harbourfront for views in better weather"], transport: ["PATH helps in winter", "TTC is stroller-friendly in some stations, not all", "Niagara is a long day"], avoid: ["outdoor-heavy stroller days in severe cold", "Niagara after a late start", "too many transfers"], anchors: ["Royal Ontario Museum", "CN Tower/aquarium", "St Lawrence Market"], timing: "Use indoor anchors and one outdoor moment per day.", note: "Winter Toronto works when you design around warmth, elevators, and short walking links." },
  { code: "YVR", name: "Vancouver", region: "Canada", stay: ["Downtown/Coal Harbour for access", "Yaletown for food", "Kitsilano for local feel"], transport: ["SkyTrain from airport", "SeaBus for views", "rent a car only for far nature days"], avoid: ["cotton clothing on rain days", "mountain plans without visibility checks", "leaving no dry backup"], anchors: ["Stanley Park seawall breaks", "Granville Island", "Capilano/Grouse if weather allows"], timing: "Treat rain as normal: layer well and keep flexible indoor backups.", note: "Vancouver nature trips succeed with waterproof shoes and plan B, not perfect weather." },
  { code: "SYD", name: "Sydney", region: "Australia", stay: ["Circular Quay/Rocks for icons", "Darling Harbour for families", "Bondi/Coogee for beach focus"], transport: ["ferries are part of the experience", "Opal/contactless for transit", "avoid long first-day hikes after Europe jet lag"], avoid: ["Blue Mountains too early after a brutal flight", "beach midday sun without protection", "stacking ferry and coastal walks in one tired day"], anchors: ["Harbour ferry", "Bondi-Coogee segment", "Blue Mountains if rested"], timing: "Put the easiest harbour day first, beach second, Blue Mountains last.", note: "Sydney is best when jet lag is respected rather than fought." },
  { code: "ZRH", name: "Zurich", region: "Switzerland", stay: ["Zurich HB area for rail", "Old Town for atmosphere", "Lucerne if alpine focus"], transport: ["Swiss rail point-to-point may beat passes for 3 days", "boats add value on lake days", "check mountain weather before buying tickets"], avoid: ["buying an expensive pass without route math", "mountain trips in poor visibility", "restaurant costs without supermarket backup"], anchors: ["Lucerne/Rigi or Pilatus", "Zurich Old Town", "lake boat day"], timing: "Decide each day by weather; alpine day should be the clearest day.", note: "In Switzerland, flexibility saves more money than squeezing in more sights." },
  { code: "OSL", name: "Oslo", region: "Norway", stay: ["Oslo Sentrum for first-timers", "Aker Brygge for comfort", "Tromso if northern lights are the real goal"], transport: ["Flytoget/local train from airport", "domestic flight north for aurora", "avoid complex winter road transfers"], avoid: ["expecting reliable northern lights from Oslo", "too many winter one-night hops", "underestimating early darkness"], anchors: ["Oslo museums/sauna", "fjordfront", "Tromso aurora chase if flying north"], timing: "With 5 nights, choose either Oslo plus comfort or 3 nights north plus 2 Oslo.", note: "Northern lights are a weather gamble; reduce transfer complexity to increase enjoyment." },
  { code: "KEF", name: "Reykjavik", region: "Iceland", stay: ["Reykjavik for winter base", "Vik only if weather supports south coast", "near airport for early flights"], transport: ["4x4 may help but does not cancel weather risk", "check road.is daily", "choose full insurance carefully"], avoid: ["full Ring Road in 5 March days", "F-roads in winter", "driving in wind alerts"], anchors: ["Golden Circle", "South Coast to Vik", "Blue Lagoon/Sky Lagoon"], timing: "In March, south coast plus Golden Circle is realistic; Ring Road is not.", note: "The safest Iceland itinerary has fewer kilometers and more weather buffers." },
  { code: "HAN", name: "Hanoi", region: "Vietnam", stay: ["Old Quarter for first-timers", "French Quarter for calmer comfort", "Hoi An Old Town/beach split later"], transport: ["use flights for north-central jumps", "private transfer for Ha Long", "avoid too many one-night moves"], avoid: ["Hanoi-Ha Long-Hoi An with no buffer", "same-day long transfers after late flights", "overpacking activities in heat"], anchors: ["Hanoi food/history", "Ha Long/Lan Ha cruise", "Hoi An slow evenings"], timing: "8 days works if you slow down: Hanoi 2, bay 1-2, Hoi An 3.", note: "Vietnam feels better when you stop trying to see the whole country at once." },
  { code: "ZNZ", name: "Zanzibar", region: "Tanzania", stay: ["Stone Town for culture", "Nungwi/Kendwa for swimming", "Paje/Jambiani for wind/kite vibe"], transport: ["private transfer between zones", "check tide patterns", "avoid random beach transport at night"], avoid: ["too many beach changes", "ignoring tides", "treating Stone Town as just an airport stop"], anchors: ["Stone Town guided walk", "spice farm", "north beach sunset"], timing: "Do Stone Town first or last, then settle at one beach base.", note: "For honeymoon, privacy and swimming conditions matter more than chasing every coast." },
  { code: "TIA", name: "Tirana", region: "Albania", stay: ["Tirana for arrival", "Berat/Gjirokaster for culture", "Himare/Sarande for coast"], transport: ["rent a car if confident", "avoid night mountain driving", "leave buffers for roads"], avoid: ["overpromising public transport", "long coastal drives after dark", "too much north-south in one week"], anchors: ["Tirana", "Berat/Gjirokaster", "Riviera beaches"], timing: "Shoulder season is best with flexible weather and conservative driving days.", note: "Albania is rewarding, but infrastructure pacing needs humility." },
  { code: "TBS", name: "Tbilisi", region: "Georgia", stay: ["Old Tbilisi for atmosphere", "Vera/Vake for calmer stays", "Kazbegi as weather-dependent side trip"], transport: ["hire experienced driver for Kazbegi", "watch road closures", "keep a Tbilisi backup day"], avoid: ["self-driving mountain roads in winter", "tight Kazbegi same-day plans", "no buffer before departure"], anchors: ["Old Tbilisi baths", "Mtskheta", "Kazbegi if road open"], timing: "Treat Kazbegi as a flexible window, not a fixed promise.", note: "Georgia winter planning should have a beautiful Plan B, not just a cancelled Plan A." },
  { code: "SJJ", name: "Sarajevo", region: "Bosnia", stay: ["Bascarsija for atmosphere", "central Sarajevo for access", "Mostar as one overnight if possible"], transport: ["guided context helps history land well", "train/driver to Mostar", "walk old centers slowly"], avoid: ["turning the trip into only war sites", "rushing Sarajevo-Mostar-return with teens", "heavy museum stacking"], anchors: ["Bascarsija", "Tunnel/Museum with context", "Mostar bridge"], timing: "Balance one heavy history block with food, crafts, and viewpoints.", note: "Respectful Bosnia travel means context, pacing, and room for ordinary beauty." },
];

const EXTRA_CITY_ALIASES: Record<string, string> = {
  amsterdam: "Amsterdam", lisbon: "Lisbon", marrakech: "Marrakech", cairo: "Cairo", doha: "Doha",
  "abu dhabi": "Abu Dhabi", "mexico city": "Mexico City", bogota: "Bogota", lima: "Lima",
  "buenos aires": "Buenos Aires", "cape town": "Cape Town", nairobi: "Nairobi", milan: "Milan",
  athens: "Athens", prague: "Prague", vienna: "Vienna", munich: "Munich", berlin: "Berlin",
  copenhagen: "Copenhagen", stockholm: "Stockholm", kyoto: "Kyoto", osaka: "Osaka",
  "hong kong": "Hong Kong", "kuala lumpur": "Kuala Lumpur", muscat: "Muscat",
};

const PROFILE_ALIASES: Record<string, string> = {
  haneda: "Tokyo",
  narita: "Tokyo",
  asakusa: "Tokyo",
  shinjuku: "Tokyo",
  shibuya: "Tokyo",
  myeongdong: "Seoul",
  changi: "Singapore",
  jewel: "Singapore",
  ubud: "Bali",
  uluwatu: "Bali",
  taksim: "Istanbul",
  heathrow: "London",
  "south kensington": "London",
  "lake como": "Milan",
  kazbegi: "Tbilisi",
  "ha long": "Hanoi",
  "hoi an": "Hanoi",
  cusco: "Lima",
  "machu picchu": "Lima",
  iceland: "Reykjavik",
  "ring road": "Reykjavik",
  albania: "Tirana",
};

function makeGenericProfile(name: string): CityProfile {
  return {
    code: name.slice(0, 3).toUpperCase(),
    name,
    region: "global",
    stay: ["central, well-reviewed area with easy transport", "quieter neighborhood if traveling with family", "airport-side only for very short stopovers"],
    transport: ["pre-plan airport transfer", "use official taxis or trusted ride-hailing", "cluster sights to reduce unnecessary crossings"],
    avoid: ["late improvised transfers", "tourist-trap restaurants beside major landmarks", "carrying passport/cash casually in crowded zones"],
    anchors: ["one signature sight", "one local food/culture block", "one rest or scenic block"],
    timing: "Build the day around energy, heat/weather, and transport friction rather than a long checklist.",
    note: "The safest premium plan is specific, paced, and leaves a buffer for the unexpected.",
  };
}

function detectLocale(text: string): "ar" | "en" {
  return /[\u0600-\u06FF]/.test(text) ? "ar" : "en";
}

function findProfile(query: string, context?: TravelContext): CityProfile {
  const lower = query.toLowerCase();
  for (const profile of CITY_PROFILES) {
    if (lower.includes(profile.name.toLowerCase())) return profile;
  }
  for (const [alias, name] of Object.entries(PROFILE_ALIASES)) {
    if (lower.includes(alias)) {
      const profile = CITY_PROFILES.find((candidate) => candidate.name === name);
      if (profile) return profile;
    }
  }
  for (const [alias, name] of Object.entries(EXTRA_CITY_ALIASES)) {
    if (lower.includes(alias)) return makeGenericProfile(name);
  }
  if (context?.destination) return makeGenericProfile(context.destination);
  return makeGenericProfile("this destination");
}

function inferFocus(query: string): string[] {
  const q = query.toLowerCase();
  const focus: string[] = [];
  if (/kid|children|family|stroller|teen|parent|elderly|mother|father|عائل|اطفال|أطفال|والد|والدة/.test(q)) focus.push("family pacing");
  if (/safe|safety|scam|pickpocket|robbery|danger|آمن|احتيال|نصب|خطر/.test(q)) focus.push("safety");
  if (/airport|layover|arrival|terminal|bag|luggage|transfer|مطار|ترانزيت|شنط/.test(q)) focus.push("arrival logistics");
  if (/budget|expensive|cost|money|limited|cheap|ميزانية|تكلفة|رخيص/.test(q)) focus.push("budget control");
  if (/winter|summer|rain|heat|july|august|march|weather|شتاء|صيف|مطر|حر/.test(q)) focus.push("weather strategy");
  if (/halal|muslim|prayer|modest|حلال|صلاة|مسلم|لباس/.test(q)) focus.push("cultural fit");
  if (/food|restaurant|allerg|menu|أكل|مطعم|حساسية/.test(q)) focus.push("food confidence");
  if (/road|drive|car|rental|insurance|قيادة|سيارة|تأمين/.test(q)) focus.push("driving and insurance");
  return focus.length ? focus : ["practical trip design"];
}

function buildEnglishAnswer(profile: CityProfile, query: string) {
  const focus = inferFocus(query);
  const hasArrival = focus.includes("arrival logistics");
  const hasSafety = focus.includes("safety");
  const hasBudget = focus.includes("budget control");
  const opening = `${profile.name}: here is the practical way I would handle it, based on ${focus.join(", ")}.`;
  const steps = [
    hasArrival
      ? `On arrival, solve airport admin before leaving: documents, baggage report if needed, restroom/water, then transport. Do not trade a written baggage reference or official taxi queue for speed.`
      : `Start by choosing a base that reduces friction: ${profile.stay.slice(0, 2).join(" or ")}.`,
    `Move around with this hierarchy: ${profile.transport.join("; ")}.`,
    hasBudget
      ? `Control cost by paying for comfort only where it prevents a bigger mistake: late transfers, bad weather, tired family members, or a once-per-day anchor sight.`
      : `Keep the day anchored around ${profile.anchors.slice(0, 3).join(", ")} instead of trying to cover every famous stop.`,
    hasSafety
      ? `Safety rule: ${profile.avoid.join("; ")}. Keep passport copies digital, split cards/cash, and use official transport at night.`
      : `Avoid the common trip-killers: ${profile.avoid.join("; ")}.`,
  ];
  const plan = `A good sequence is: first secure the base/transfer, second do one high-value anchor, third add food or a scenic block nearby, fourth stop before the group is exhausted. ${profile.timing}`;
  const close = `${profile.note} If you want the next level, send dates, hotel area, and traveler count; I can turn this into a timed route.`;
  return `${opening}\n\n1. ${steps[0]}\n2. ${steps[1]}\n3. ${steps[2]}\n4. ${steps[3]}\n\n${plan}\n\n${close}`;
}

function buildArabicAnswer(profile: CityProfile, query: string) {
  const focus = inferFocus(query);
  const opening = `بالنسبة إلى ${profile.name}: سأتعامل معها كخطة سفر عملية، لا كقائمة أماكن. محور السؤال هنا: ${focus.join("، ")}.`;
  return `${opening}\n\n1. ابدأ بتقليل الاحتكاك: اختر سكنًا في ${profile.stay.slice(0, 2).join(" أو ")}.\n2. للمواصلات: ${profile.transport.join("؛ ")}.\n3. اجعل اليوم مبنيًا على ${profile.anchors.slice(0, 3).join("، ")} بدل مطاردة كل المعالم.\n4. تجنب: ${profile.avoid.join("؛ ")}.\n\nالإيقاع الأفضل: ${profile.timing}\n\nملاحظتي لك: ${profile.note} إذا أعطيتني التواريخ ومكان السكن وعدد المسافرين أحولها لك إلى مسار بالساعة.`;
}

function confidenceFor(profile: CityProfile, query: string): TravelIntelligence["confidence"] {
  const focus = inferFocus(query);
  const negatives = focus.includes("safety") || focus.includes("arrival logistics") || focus.includes("weather strategy");
  return {
    score: negatives ? 7 : 8,
    label_ar: negatives ? "جيد مع احتياطات" : "قوي",
    label_en: negatives ? "Good with precautions" : "Strong",
    factors: [
      { factor_ar: "الخطة تراعي الإيقاع والمواصلات", factor_en: "Plan respects pacing and transport", impact: "positive" },
      { factor_ar: "توجد مخاطر قابلة للإدارة", factor_en: "Risks are manageable with buffers", impact: negatives ? "neutral" : "positive" },
    ],
  };
}

function intelFor(profile: CityProfile): TravelIntelligence["destination_intel"] {
  return {
    best_months_ar: "حسب الموسم والطقس المحلي",
    best_months_en: "Depends on local season and weather",
    weather_now_ar: "تحقق من الطقس قبل تثبيت الخطة اليومية",
    weather_now_en: "Check weather before locking the daily route",
    visa_required_for_saudis: null,
    visa_note_ar: "تحقق من المصدر الرسمي قبل الدفع النهائي.",
    visa_note_en: "Verify official sources before final payment.",
    safety_level: "good",
    safety_note_ar: profile.avoid.join("؛ "),
    top_neighborhoods_ar: profile.stay,
    top_neighborhoods_en: profile.stay,
    top_activities_ar: profile.anchors,
    top_activities_en: profile.anchors,
    clothing_tip_ar: "اختر ملابس مناسبة للطقس والمشي.",
    clothing_tip_en: "Dress for weather and walking comfort.",
    local_currency: null,
    time_zone: null,
  };
}

export function buildSmartFallbackIntelligence(
  query: string,
  history: ChatTurn[],
  context: TravelContext,
  notice: string,
): TravelIntelligence & { notice: string; mock: true } {
  const locale = detectLocale(query);
  const profile = findProfile(`${history.map((h) => h.text).join(" ")} ${query}`, context);
  const stage = mergeLifecycleStage(context.booking_stage ?? null, detectLifecycleFromText(query));
  const message = locale === "ar" ? buildArabicAnswer(profile, query) : buildEnglishAnswer(profile, query);
  return {
    locale,
    mode: "advice",
    message,
    wants: ["flights", "hotels"],
    followup: locale === "ar"
      ? "أرسل التواريخ ومكان السكن لأحوّلها إلى خطة بالساعة."
      : "Send dates and hotel area and I’ll turn it into a timed route.",
    clarification_needed: false,
    clarification_question: null,
    intent: {
      origin: context.origin ?? null,
      destination: context.destination ?? profile.code,
      departure_date: context.departure_date ?? null,
      return_date: context.return_date ?? null,
      adults: context.adults ?? 2,
      budget_usd: context.budget_usd ?? null,
      trip_type: context.trip_type ?? null,
      cabin_class: context.cabin_class ?? null,
      notes: `smart_fallback:${profile.name}:${stage ?? "planning"}`,
    },
    budget_verdict: null,
    confidence: confidenceFor(profile, query),
    destination_intel: intelFor(profile),
    notice,
    mock: true,
  };
}
