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

const CODE_TO_PROFILE: Record<string, string> = {
  HND: "Tokyo",
  NRT: "Tokyo",
  ICN: "Seoul",
  SIN: "Singapore",
  DPS: "Bali",
  BKK: "Bangkok",
  KUL: "Kuala Lumpur",
  IST: "Istanbul",
  DXB: "Dubai",
  AHB: "Abha",
  MLE: "Maldives",
  CDG: "Paris",
  FCO: "Rome",
  BCN: "Barcelona",
  LHR: "London",
  JFK: "New York",
  LAX: "Los Angeles",
  ZRH: "Zurich",
  TBS: "Tbilisi",
  HKT: "Phuket",
  KBV: "Krabi",
  HAN: "Hanoi",
  SGN: "Ho Chi Minh City",
  CGK: "Jakarta",
  MNL: "Manila",
  PVG: "Shanghai",
  PEK: "Beijing",
  SYD: "Sydney",
  MEL: "Melbourne",
  CPT: "Cape Town",
  ZNZ: "Zanzibar",
  NBO: "Nairobi",
  TNG: "Tangier",
  MCO: "Orlando",
  LAS: "Las Vegas",
  SFO: "San Francisco",
  YYZ: "Toronto",
  YVR: "Vancouver",
  MEX: "Mexico City",
  GIG: "Rio de Janeiro",
  LIS: "Lisbon",
  PRG: "Prague",
  VIE: "Vienna",
  MXP: "Milan",
  MUC: "Munich",
  BER: "Berlin",
  AMS: "Amsterdam",
  OSL: "Oslo",
  CPH: "Copenhagen",
  ARN: "Stockholm",
  HEL: "Helsinki",
  KEF: "Reykjavik",
  TIA: "Tirana",
  SJJ: "Sarajevo",
};

const AR_CITY_NAMES: Record<string, string> = {
  Tokyo: "طوكيو/اليابان",
  Seoul: "سيول",
  Singapore: "سنغافورة",
  Bali: "بالي",
  Bangkok: "بانكوك",
  Istanbul: "إسطنبول",
  Dubai: "دبي",
  Maldives: "المالديف",
  Paris: "باريس",
  Rome: "روما",
  Barcelona: "برشلونة",
  London: "لندن",
  "New York": "نيويورك",
  "Los Angeles": "لوس أنجلوس",
  Zurich: "زيورخ",
  Tbilisi: "تبليسي",
  Abha: "أبها",
  "Kuala Lumpur": "كوالالمبور",
  Phuket: "بوكيت",
  Krabi: "كرابي",
  Hanoi: "هانوي/فيتنام",
  "Ho Chi Minh City": "هوشي منه",
  Jakarta: "جاكرتا",
  Manila: "مانيلا",
  Shanghai: "شنغهاي",
  Beijing: "بكين",
  Sydney: "سيدني",
  Melbourne: "ملبورن",
  "Cape Town": "كيب تاون",
  Zanzibar: "زنجبار",
  Nairobi: "نيروبي",
  Tangier: "طنجة",
  Orlando: "أورلاندو",
  "Las Vegas": "لاس فيغاس",
  "San Francisco": "سان فرانسيسكو",
  Toronto: "تورنتو",
  Vancouver: "فانكوفر",
  "Mexico City": "مكسيكو سيتي",
  "Rio de Janeiro": "ريو دي جانيرو",
  Lisbon: "لشبونة",
  Prague: "براغ",
  Vienna: "فيينا",
  Milan: "ميلانو",
  Munich: "ميونخ",
  Berlin: "برلين",
  Amsterdam: "أمستردام",
  Oslo: "أوسلو",
  Copenhagen: "كوبنهاغن",
  Stockholm: "ستوكهولم",
  Helsinki: "هلسنكي",
  Reykjavik: "ريكيافيك",
  Tirana: "تيرانا",
  Sarajevo: "سراييفو",
};

function makeGenericProfile(name: string): CityProfile {
  const cleanName = name === "this destination" ? "your destination" : name;
  const lower = cleanName.toLowerCase();
  if (lower === "cape town") {
    return {
      code: "CPT",
      name: "Cape Town",
      region: "South Africa",
      stay: ["Waterfront/Sea Point for first-timers and safer logistics", "Camps Bay for views if budget allows", "City Bowl only with clear transport plans"],
      transport: ["pre-book airport transfer", "use trusted ride-hailing after dark", "cluster Table Mountain, Waterfront, and coastal drives separately"],
      avoid: ["walking with valuables after dark", "improvised township tours", "leaving car items visible"],
      anchors: ["Table Mountain if weather is clear", "V&A Waterfront", "Cape Peninsula day with a trusted driver"],
      timing: "Use daylight for movement, check wind before Table Mountain, and keep evening plans close to your base.",
      note: "Cape Town can be excellent for families when transport and area choice are planned carefully.",
    };
  }
  if (lower === "las vegas") {
    return {
      code: "LAS",
      name: "Las Vegas",
      region: "USA",
      stay: ["central Strip for easy movement", "Vdara/Aria area for calmer premium stays", "off-Strip only if you have a clear transport plan"],
      transport: ["walk only short Strip segments", "use ride-hailing late at night", "book shows/restaurants near the same zone"],
      avoid: ["casino-heavy wandering if it is not your style", "dark side streets behind resorts", "street promoters and unclear offers"],
      anchors: ["Bellagio fountains and conservatory", "premium dinner/show night", "Red Rock or Hoover Dam as a calm half-day"],
      timing: "Make the day slow: indoor afternoon, dinner reservation, one show or viewpoint, then return safely.",
      note: "Las Vegas can be a food, shows, and desert-scenery trip without gambling if the route is intentional.",
    };
  }
  if (lower === "phuket") {
    return {
      code: "HKT",
      name: "Phuket",
      region: "Thailand",
      stay: ["Kata/Karon for a calmer beach base", "Patong only if nightlife is wanted", "Mai Khao for resort quiet near the airport"],
      transport: ["pre-arrange airport transfer", "use trusted drivers for beach hopping", "avoid scooters without experience"],
      avoid: ["overpaying for random taxis", "rainy-season sea risk", "packing too many beaches in one day"],
      anchors: ["one beach morning", "old Phuket Town food walk", "sunset viewpoint or island trip if weather allows"],
      timing: "Keep island days loose and weather-aware; do not make every day a transfer day.",
      note: "Phuket is strongest when you choose the right beach base for your travel style.",
    };
  }
  return {
    code: cleanName.slice(0, 3).toUpperCase(),
    name: cleanName,
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
  if (context?.destination) {
    const destination = context.destination.toUpperCase();
    const profileName = CODE_TO_PROFILE[destination];
    const profile = CITY_PROFILES.find((candidate) => candidate.code === destination || candidate.name === profileName);
    if (profile) return profile;
    return makeGenericProfile(profileName ?? destination);
  }
  return makeGenericProfile("this destination");
}

function displayNameAr(profile: CityProfile) {
  if (profile.name === "your destination") return "وجهتك";
  return AR_CITY_NAMES[profile.name] ?? profile.name;
}

function isGenericDestination(profile: CityProfile) {
  return profile.name === "your destination";
}

function arPhrase(value: string) {
  const lower = value.toLowerCase();
  if (lower.includes("sultanahmet") || lower.includes("sirkeci")) return "سيركجي/السلطان أحمد للتاريخ وسهولة الوصول";
  if (lower.includes("karakoy") || lower.includes("galata")) return "غلطة/كاراكوي للمطاعم والإطلالات";
  if (lower.includes("hagia") || lower.includes("blue mosque")) return "آيا صوفيا/الجامع الأزرق";
  if (lower.includes("bosphorus")) return "جولة أو عبّارة البوسفور";
  if (lower.includes("asian and european")) return "لا تكدّس الطرف الأوروبي والآسيوي في يوم واحد";
  if (lower.includes("sisli") || lower.includes("nisantasi")) return "شيشلي/نيشانتاشي لراحة عائلية أهدأ";
  if (lower.includes("downtown")) return "وسط المدينة للزيارة الأولى";
  if (lower.includes("marina") || lower.includes("jbr")) return "دبي مارينا/JBR للمساء والبحر";
  if (lower.includes("deira")) return "ديرة للميزانية ودبي القديمة";
  if (lower.includes("asakusa")) return "أساكوسا للهدوء والقيمة";
  if (lower.includes("ginza") || lower.includes("tokyo station")) return "غينزا/محطة طوكيو لسهولة التنقل";
  if (lower.includes("shinjuku")) return "شينجوكو إذا تريد حيوية ليلية";
  if (lower.includes("myeongdong")) return "ميونغ دونغ للزيارة الأولى";
  if (lower.includes("hongdae")) return "هونغداي للأجواء الشبابية";
  if (lower.includes("insadong")) return "إنسادونغ للثقافة";
  if (lower.includes("riverside")) return "منطقة النهر للراحة";
  if (lower.includes("sukhumvit")) return "سوخومفيت للوصول بالقطار";
  if (lower.includes("siam")) return "سيام للمولات والعوائل";
  if (lower.includes("south kensington")) return "ساوث كنزنغتون للمتاحف والهدوء";
  if (lower.includes("paddington")) return "بادينغتون إذا كان الوصول من هيثرو مهم";
  if (lower.includes("bloomsbury")) return "بلومزبري لموقع مركزي أهدأ";
  if (lower.includes("elizabeth")) return "خط إليزابيث غالباً أفضل قيمة من هيثرو";
  if (lower.includes("piccadilly")) return "خط بيكاديللي أرخص لكنه أبطأ";
  if (lower.includes("black cab") || lower.includes("ride-hail")) return "تاكسي رسمي أو تطبيق نقل كخطة بديلة";
  if (lower.includes("rush hour")) return "تجنب تبديل الخطوط بحقائب وقت الذروة";
  if (lower.includes("rail works")) return "لا تفترض أن تعطل خط واحد يعني تعطل كل المدينة";
  if (lower.includes("museums")) return "المتاحف خيار ممتاز وهادئ للعوائل";
  if (lower.includes("westminster")) return "جولة وستمنستر قصيرة وواضحة";
  if (lower.includes("covent")) return "كوفنت غاردن/وست إند للمساء";
  if (lower.includes("central")) return "منطقة مركزية وآمنة وقريبة من الخدمات";
  if (lower.includes("quieter")) return "حي أهدأ إذا كانت الرحلة عائلية";
  if (lower.includes("airport")) return "قريب من المطار فقط للتوقفات القصيرة";
  if (lower.includes("official")) return "تاكسي رسمي أو نقل موثوق";
  if (lower.includes("taxi") || lower.includes("transfer")) return "نقل موثوق عند الوصول";
  if (lower.includes("metro") || lower.includes("train")) return "مترو/قطار عندما يكون مناسباً ومريحاً";
  if (lower.includes("cluster")) return "اجمع الأماكن القريبة في نفس اليوم";
  if (lower.includes("scam") || lower.includes("unofficial")) return "تجنب العروض غير الواضحة والاحتيال السياحي";
  if (lower.includes("late")) return "تجنب التنقلات المرتجلة في وقت متأخر";
  if (lower.includes("heat")) return "تجنب الأنشطة الخارجية وقت الحر";
  if (lower.includes("weather")) return "اترك مرونة حسب الطقس";
  if (lower.includes("waterfront") || lower.includes("sea point")) return "ووترفرونت/سي بوينت للزيارة الأولى وسهولة الحركة";
  if (lower.includes("camps bay")) return "كامبس باي للإطلالات إذا كانت الميزانية مناسبة";
  if (lower.includes("city bowl")) return "سيتي بول فقط مع خطة تنقل واضحة";
  if (lower.includes("trusted ride")) return "استخدم تطبيق نقل موثوق خصوصاً ليلاً";
  if (lower.includes("table mountain")) return "تيبل ماونتن إذا كان الطقس صافياً";
  if (lower.includes("v&a")) return "واجهة V&A Waterfront";
  if (lower.includes("cape peninsula")) return "جولة كيب بنينسولا مع سائق موثوق";
  if (lower.includes("valuables")) return "لا تمشِ بالأغراض الثمينة ظاهرة ليلاً";
  if (lower.includes("township")) return "تجنب الجولات العشوائية غير الموثوقة";
  if (lower.includes("car items")) return "لا تترك أغراضاً ظاهرة في السيارة";
  if (lower.includes("central strip")) return "منتصف الستريب لسهولة الحركة";
  if (lower.includes("vdara") || lower.includes("aria")) return "منطقة Vdara/Aria لإقامة أهدأ وفخمة";
  if (lower.includes("off-strip")) return "خارج الستريب فقط إذا لديك خطة تنقل واضحة";
  if (lower.includes("short strip")) return "امشِ فقط لمسافات قصيرة داخل الستريب";
  if (lower.includes("casino-heavy")) return "تجنب التجول العشوائي داخل الكازينوهات إذا لا يناسبك";
  if (lower.includes("side streets")) return "تجنب الشوارع الجانبية الهادئة ليلاً";
  if (lower.includes("promoters")) return "تجنب المروجين والعروض غير الواضحة";
  if (lower.includes("bellagio")) return "نوافير وحديقة Bellagio";
  if (lower.includes("dinner/show")) return "عشاء مميز مع عرض قريب";
  if (lower.includes("red rock") || lower.includes("hoover")) return "Red Rock أو Hoover Dam كنصف يوم هادئ";
  if (lower.includes("kata") || lower.includes("karon")) return "كاتا/كارون لقاعدة شاطئية أهدأ";
  if (lower.includes("patong")) return "باتونغ فقط إذا تريد أجواء ليلية";
  if (lower.includes("mai khao")) return "ماي خاو لهدوء المنتجعات وقرب المطار";
  if (lower.includes("beach hopping")) return "استخدم سائقاً موثوقاً للتنقل بين الشواطئ";
  if (lower.includes("scooters")) return "تجنب السكوتر إذا ليست لديك خبرة";
  if (lower.includes("random taxis")) return "لا تعتمد على تاكسي عشوائي بسعر غير واضح";
  if (lower.includes("sea risk")) return "انتبه لمخاطر البحر في موسم الأمطار";
  if (lower.includes("old phuket")) return "جولة طعام في مدينة بوكيت القديمة";
  if (lower.includes("sunset")) return "إطلالة غروب أو رحلة بحرية حسب الطقس";
  if (lower.includes("too many")) return "لا تكدّس أماكن كثيرة في يوم واحد";
  if (lower.includes("ignoring tides")) return "لا تتجاهل حركة المد والجزر";
  if (lower.includes("stone town")) return "ستون تاون للثقافة والمشي";
  if (lower.includes("nungwi") || lower.includes("kendwa")) return "نونغوي/كيندوا للسباحة والغروب";
  if (lower.includes("paje") || lower.includes("jambiani")) return "باجي/جامبياني لأجواء الشاطئ الهادئة";
  if (lower.includes("tide patterns")) return "افحص حركة المد والجزر قبل اختيار الشاطئ";
  if (lower.includes("random beach transport")) return "تجنب النقل العشوائي بين الشواطئ ليلاً";
  if (lower.includes("spice farm")) return "مزرعة توابل كتجربة محلية خفيفة";
  if (lower.includes("north beach")) return "شاطئ شمالي للغروب";
  if (lower.includes("circular quay") || lower.includes("rocks")) return "Circular Quay/Rocks للمعالم الأولى والميناء";
  if (lower.includes("darling harbour")) return "Darling Harbour للعوائل والمشي السهل";
  if (lower.includes("bondi") || lower.includes("coogee")) return "Bondi/Coogee إذا كانت الرحلة بحرية";
  if (lower.includes("ferries")) return "العبّارات جزء جميل من تجربة سيدني";
  if (lower.includes("opal") || lower.includes("contactless")) return "استخدم بطاقة/دفع تماسّي للتنقل";
  if (lower.includes("blue mountains")) return "الجبال الزرقاء عندما تكون مرتاحاً وليس بعد رحلة طويلة";
  if (lower.includes("harbour")) return "جولة الميناء والعبّارة";
  if (lower.includes("coastal walks")) return "لا تكدّس المشي الساحلي مع يوم وصول متعب";
  if (lower.includes("cotton clothing")) return "تجنب الملابس القطنية الثقيلة في المطر";
  if (lower.includes("mountain plans")) return "لا تثبّت خطط الجبال قبل فحص الرؤية والطقس";
  if (lower.includes("dry backup")) return "اجعل لديك بديل داخلي عند المطر";
  if (lower.includes("skytrain")) return "SkyTrain من المطار إذا يناسب الحقائب";
  if (lower.includes("seabus")) return "SeaBus كتجربة تنقل وإطلالة";
  if (lower.includes("kitsilano")) return "كيتسيلانو لأجواء محلية أهدأ";
  if (lower.includes("coal harbour")) return "وسط المدينة/Coal Harbour لسهولة الوصول";
  if (lower.includes("yaletown")) return "Yaletown للمطاعم";
  if (lower.includes("signature")) return "معلم رئيسي واحد";
  if (lower.includes("food")) return "تجربة طعام محلية موثوقة";
  if (lower.includes("rest") || lower.includes("scenic")) return "استراحة أو إطلالة هادئة";
  return value;
}

function arList(values: string[], limit = values.length) {
  return values.slice(0, limit).map(arPhrase).join("، ");
}

function inferFocus(query: string): string[] {
  const q = query.toLowerCase();
  const focus: string[] = [];
  if (/kid|children|family|stroller|teen|parent|elderly|mother|father|عائل|اطفال|أطفال|طفل|والد|والدة/.test(q)) focus.push("family pacing");
  if (/safe|safety|scam|pickpocket|robbery|danger|آمن|احتيال|نصب|خطر/.test(q)) focus.push("safety");
  if (/airport|layover|arrival|terminal|bag|luggage|transfer|مطار|ترانزيت|شنط/.test(q)) focus.push("arrival logistics");
  if (/budget|expensive|cost|money|limited|cheap|ميزانية|تكلفة|رخيص/.test(q)) focus.push("budget control");
  if (/winter|summer|rain|heat|july|august|march|weather|شتاء|صيف|مطر|حر/.test(q)) focus.push("weather strategy");
  if (/halal|muslim|prayer|modest|حلال|صلاة|مسلم|لباس/.test(q)) focus.push("cultural fit");
  if (/food|restaurant|allerg|menu|أكل|مطعم|حساسية/.test(q)) focus.push("food confidence");
  if (/road|drive|car|rental|insurance|قيادة|سيارة|تأمين/.test(q)) focus.push("driving and insurance");
  return focus.length ? focus : ["practical trip design"];
}

function focusLabelAr(focus: string) {
  const labels: Record<string, string> = {
    "family pacing": "راحة العائلة",
    safety: "الأمان وتجنب الاحتيال",
    "arrival logistics": "الوصول والمطار",
    "budget control": "ضبط الميزانية",
    "weather strategy": "التعامل مع الطقس",
    "cultural fit": "الملاءمة الثقافية",
    "food confidence": "الطعام بثقة",
    "driving and insurance": "القيادة والتأمين",
    "practical trip design": "تصميم رحلة عملي",
  };
  return labels[focus] ?? focus;
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

function dayDiff(start: string | null | undefined, end: string | null | undefined) {
  if (!start || !end) return null;
  const a = new Date(`${start}T12:00:00`);
  const b = new Date(`${end}T12:00:00`);
  const diff = Math.round((b.getTime() - a.getTime()) / 86_400_000);
  return Number.isFinite(diff) && diff > 0 ? diff : null;
}

function buildArabicAnswer(profile: CityProfile, query: string, context?: TravelContext) {
  const focus = inferFocus(query);
  const q = query.toLowerCase();
  const city = displayNameAr(profile);
  const compact = /(اختصر|للجوال|مختصر|خطوة واحدة|قرار واحد)/i.test(q);

  if (/(كم\s+مدة|كم\s+يوم|مدة\s+الرحلة|how\s+long|duration)/i.test(q)) {
    const days = dayDiff(context?.departure_date, context?.return_date);
    return days
      ? `نعم، فهمت التاريخ: البداية ${context?.departure_date} وليست 15 يونيو.\n\nمدة الرحلة من ${context?.departure_date} إلى ${context?.return_date} هي تقريباً ${days} أيام.\n\nالخطوة التالية: أبقي الخطة مبنية على هذا التاريخ، وأعدّل الميزانية أو الجدول فقط إذا طلبت ذلك.`
      : `سأفترض أنك تريد تثبيت مدة الرحلة بدقة.\n\nأرسل لي تاريخ الذهاب والعودة بصيغة واضحة مثل: 5 يونيو إلى 15 يونيو، وسأحسب المدة وأبني عليها الخطة.`;
  }

  if (/(شيشلي|كاديكوي)/i.test(q)) {
    return `سأفترض أنك تقارن بين شيشلي وكاديكوي للعائلة في إسطنبول، وليس بحث فنادق مباشر.\n\nالقرار المختصر:\n1. شيشلي/نيشانتاشي: أنسب للعائلة إذا تريد هدوءاً أكثر، مطاعم وخدمات، وسهولة تنقل بالمترو والتاكسي.\n2. كاديكوي: أجمل للأجواء المحلية والمطاعم والمشي، لكنها قد تضيف وقت تنقل إذا معظم خطتك في السلطان أحمد/الطرف الأوروبي.\n3. مع أطفال: شيشلي غالباً أريح كقاعدة أولى، وكاديكوي تصلح ليوم مخصص بالعبّارة والتجول.\n4. لا أعرض أسعار فنادق حية الآن إلى أن يكتمل ربط مزود الفنادق.\n\nقراري لك: اختر شيشلي كقاعدة عائلية هادئة، واجعل كاديكوي زيارة نهارية جميلة.`;
  }

  if (/(قارن|مقارنة|بانكوك|بالي)/i.test(q)) {
    return `سأفترض أن القرار بين وجهتين يجب أن يبنى على أسلوب الرحلة، لا الشهرة.\n\nالاختيار الأسرع:\n1. إذا تريد طبيعة وهدوء ومنتجعات: بالي أقوى.\n2. إذا تريد أكل، أسواق، تنقل أسهل، وتكلفة مرنة: بانكوك أقوى.\n3. للأكل الحلال: بانكوك أسهل غالباً، وبالي تحتاج اختيار مناطق ومطاعم بعناية.\n4. للميزانية المحدودة: بانكوك تعطيك خيارات أكثر بدون تنقلات طويلة.\n\nقراري لك: ابدأ ببانكوك إذا الميزانية محدودة، واختر بالي إذا الرحلة رومانسية أو طبيعية بطيئة.`;
  }

  if (/(غيّر|غير|غيّري|عدّل|عدلي|خفض|قلل|ميزانية|budget)/i.test(q) && /(ريال|درهم|دولار|usd|sar|aed|ميزانية|budget)/i.test(q)) {
    const budget = context?.budget_usd ? Math.round(context.budget_usd) : null;
    return `سأفترض أن المطلوب هو ضغط الخطة بدون إفساد الرحلة.\n\nالقرار العملي:\n1. ثبّت منطقة السكن أولاً حتى لا تزيد تكلفة التنقل.\n2. خفّض عدد الأنشطة المدفوعة، ولا تخفّض الأمان أو المواصلات المهمة.\n3. اجعل يومين في الرحلة خفيفين: مشي، أحياء جميلة، مطاعم مناسبة، وإطلالات مجانية.\n4. لا أعرض أسعار فنادق حية الآن إلى أن يكتمل ربط مزود الفنادق.\n\n${budget ? `سأبني الخطة على ميزانية تقريبية ${budget} دولار.` : "إذا أرسلت الميزانية بالعملة، أحولها لخطة أوضح."}\n\nالخطوة التالية: اختر واحداً فقط: أوفر أكثر في السكن، الأنشطة، أو التنقل؟`;
  }

  if (compact || /(أبدأ|ابدأ).*(الطيران|السكن|esim|شريحة)/i.test(q)) {
    const nearTrip = Boolean(context?.departure_date);
    const isFamily = context?.traveler_type === "family";
    const decision = nearTrip
      ? "ابدأ بالطيران"
      : isFamily
        ? "ابدأ بمنطقة السكن"
        : "ابدأ بمنطقة السكن";
    const reason = nearTrip
      ? "لأن التاريخ صار واضحاً وأي تأخير قد يرفع التكلفة أو يقلل الخيارات."
      : isFamily
        ? `لأن راحة العائلة في ${city} تعتمد على الحي والمواصلات قبل أي خدمة أخرى.`
      : `لأن اختيار المنطقة في ${city} يحدد تكلفة التنقل وجودة الرحلة كلها.`;
    return `سأفترض أنك تريد قراراً واحداً فقط.\n\nقراري لك الآن: ${decision}.\n\nالسبب: ${reason}\n\nبعدها مباشرة: ثبّت منطقة السكن، ثم أضف الشريحة أو التأمين إذا كانا يقللان مخاطرة حقيقية في رحلتك.`;
  }

  if (/(لو صار\s+(?:نصب|احتيال|سرقة|تأخير|مشكلة)|صار\s+(?:نصب|احتيال|سرقة)|تعرضت|وقعت|سرقة|سائق|نشاط سياحي|طوارئ|جواز|مرض|مشكلة حجز)/i.test(q)) {
    return `سأفترض أنك تحتاج تصرفاً هادئاً في موقف مزعج أثناء السفر.\n\nتصرف ريا معك هكذا:\n1. أوقف الدفع أو التفاوض فوراً ولا تدخل في جدال طويل.\n2. صوّر الفاتورة، المحادثة، رقم السيارة أو اسم النشاط.\n3. ارجع لمصدر الحجز أو الفندق أو الشرطة السياحية حسب الحالة.\n4. لا تسلم جوازك إلا لجهة رسمية واضحة.\n5. ريا تساعدك بصياغة رسالة قصيرة بلغة البلد وشرح الموقف بهدوء.\n\nالخطوة التالية: اكتب لي ماذا حدث بجملة واحدة، وسأعطيك نصاً جاهزاً للتواصل.`;
  }

  if (/(esim|e-sim|شريحة|شرائح|انترنت|إنترنت|تأمين|insurance)/i.test(q)) {
    return `سأفترض أنك تريد قراراً عملياً قبل السفر إلى ${city}.\n\nالأفضل:\n1. الشريحة: خذ eSIM قبل السفر إذا كانت وجهتك تعتمد على الخرائط والترجمة والتنقل. لا تنتظر المطار إلا إذا كنت مرتاحاً للمقارنة هناك.\n2. التأمين: مهم إذا الرحلة دولية، فيها أطفال/كبار سن، رحلات داخلية، أنشطة، أو حجوزات غير قابلة للاسترداد.\n3. السبب: ريا لا تقترح الخدمة كرابط فقط؛ تقترحها عندما تقلل ضياع الوقت أو المخاطرة.\n\nقرار واحد الآن: ابدأ بالشريحة إذا كانت أول مرة لك في الوجهة، وابدأ بالتأمين إذا الرحلة طويلة أو عائلية.`;
  }

  if (/(مطار|الساعة|بعد منتصف الليل|بوابة|شنطة|تأخير)/i.test(q) || (/(وصلت)/i.test(q) && !/(فندق|الفندق)/i.test(q))) {
    return `سأفترض أن وصولك إلى ${city} متأخر ومعك تعب أو حقائب.\n\nالخطة العملية:\n1. لا تخرج من صالة الوصول قبل إنهاء الحقائب والبلاغ إن وجدت مشكلة.\n2. استخدم تاكسي رسمي أو نقل موثوق فقط، خصوصاً بعد منتصف الليل.\n3. لا تبدأ أنشطة في أول ساعتين؛ ماء، دورة مياه، شريحة/إنترنت، ثم إلى السكن.\n4. إذا معك أطفال: اجعل أول صباح خفيفاً ولا تحجز جولة مبكرة.\n\nالخطوة التالية: أرسل لي اسم المطار أو منطقة السكن وأعطيك مسار الوصول الأكثر أماناً.`;
  }

  if (/(شيشلي|كاديكوي|منطقة|حي|أحياء|احياء|سكن|أسكن|اسكن)/i.test(q)) {
    return `سأفترض أنك تريد منطقة مناسبة، وليس مجرد اسم حي في ${city}.\n\nمقارنة سريعة:\n1. العائلة والهدوء: اختر منطقة مركزية هادئة وقريبة من المواصلات، وتجنب الشوارع الصاخبة ليلاً.\n2. الطعام والمشي: اختر منطقة فيها مطاعم وخدمات قريبة حتى لا تحتاج تنقل طويل كل يوم.\n3. الميزانية: لا تختار الأرخص إذا سيزيد عليك التاكسي والتعب.\n4. الفنادق: إلى أن يكتمل ربط مزود الفنادق، سأعطيك مناطق ونصائح اختيار فقط، وليس أسعاراً حية.\n\nالخطوة التالية: أعطني نمطك: هدوء، تسوق، مطاعم، أو قرب معالم.`;
  }

  if (/(جدول|خطة|برنامج|3 أيام|ثلاثة أيام)/i.test(q)) {
    return `سأفترض أنك تريد خطة قصيرة ومريحة في ${city} بدون فنادق أو أسعار حية.\n\nملخص الخطة:\n1. يوم الوصول: انتقال هادئ، تعارف على المنطقة، عشاء قريب.\n2. يوم التجربة الأساسية: أهم معلم أو طبيعة صباحاً، مطعم جيد، ثم وقت حر.\n3. يوم الإيقاع المحلي: سوق/حي مميز، نشاط خفيف، وتجهيز للمغادرة.\n\nمناطق السكن المناسبة: ${arList(profile.stay, 3)}.\nالتنقل: ${arList(profile.transport, 2)}.\nانتبه من: ${arList(profile.avoid, 2)}.\n\nالخطوة التالية: قل لي هل تفضل طبيعة، مطاعم، تسوق، أو أطفال، وأعدل الجدول.`;
  }

  const opening = `بالنسبة إلى ${city}: سأتعامل معها كخطة سفر عملية، لا كقائمة أماكن. محور السؤال هنا: ${focus.map(focusLabelAr).join("، ")}.`;
  if (isGenericDestination(profile)) {
    return `${opening}\n\n1. سأبدأ من أسلوب الرحلة: عائلة، فردي، شهر عسل، أو ميزانية محدودة.\n2. أختار لك منطقة سكن آمنة وقريبة من المواصلات قبل أي روابط أو حجوزات.\n3. أرتب الخدمات حسب الحاجة: طيران أولاً إذا التاريخ قريب، eSIM إذا تحتاج خرائط وترجمة، وتأمين إذا الرحلة دولية أو عائلية.\n4. لا أعرض فنادق أو أسعار كأنها مباشرة إلى أن يكتمل ربط مزود الفنادق.\n\nالخطوة التالية الوحيدة: اكتب اسم المدينة أو الدولة، وسأعطيك مناطق السكن، التنقل، التكلفة التقريبية، وما الذي يجب تجنبه.`;
  }
  return `${opening}\n\n1. ابدأ بتقليل الاحتكاك: اختر سكنًا في ${arList(profile.stay, 2)}.\n2. للمواصلات: ${arList(profile.transport)}.\n3. اجعل اليوم مبنيًا على ${arList(profile.anchors, 3)} بدل مطاردة كل المعالم.\n4. تجنب: ${arList(profile.avoid)}.\n\nالإيقاع الأفضل: خطط اليوم حسب الطاقة والطقس والمواصلات، وليس كقائمة طويلة.\n\nملاحظتي لك: اترك هامش راحة واضح، وإذا أعطيتني التواريخ ومكان السكن وعدد المسافرين أحولها لك إلى مسار بالساعة.`;
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
  const profile = findProfile(query, context);
  const stage = mergeLifecycleStage(context.booking_stage ?? null, detectLifecycleFromText(query));
  const message = locale === "ar" ? buildArabicAnswer(profile, query, context) : buildEnglishAnswer(profile, query);
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
      destination: context.destination ?? (isGenericDestination(profile) ? null : profile.code),
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
