import type { Locale } from "@/i18n/config";

export type WorldCupPageKind =
  | "city"
  | "stadium"
  | "airport"
  | "problem"
  | "audience";

export type WorldCupCity = {
  slug: string;
  name: string;
  nameAr: string;
  marketName: string;
  marketNameAr: string;
  stadium?: string;
  airport: string;
  airportAr: string;
  angle: string;
  angleAr: string;
  stayAreas: string[];
  stayAreasAr: string[];
  transport: string;
  transportAr: string;
  weather: string;
  weatherAr: string;
  note?: string;
  noteAr?: string;
};

export type WorldCupPage = {
  slug: string;
  kind: WorldCupPageKind;
  citySlug?: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  intent: string;
  intentAr: string;
  focus: string[];
  focusAr: string[];
  primaryCta: string;
  primaryCtaAr: string;
};

export const WORLD_CUP_EVENT = {
  name: "FIFA World Cup 2026",
  nameAr: "كأس العالم 2026",
  dates: "June 11 to July 19, 2026",
  datesAr: "من 11 يونيو إلى 19 يوليو 2026",
  region: "United States, Canada, and Mexico",
  regionAr: "الولايات المتحدة وكندا والمكسيك",
};

export const WORLD_CUP_CITIES: WorldCupCity[] = [
  {
    slug: "new-york-new-jersey",
    name: "New York / New Jersey",
    nameAr: "نيويورك / نيوجيرسي",
    marketName: "New York",
    marketNameAr: "نيويورك",
    stadium: "MetLife Stadium",
    airport: "JFK, Newark, or LaGuardia",
    airportAr: "JFK أو نيوارك أو لاغوارديا",
    angle: "Best for big-match energy, first-time USA visitors, and multi-city travel.",
    angleAr: "مناسبة للأجواء الكبيرة، أول زيارة لأمريكا، والرحلات متعددة المدن.",
    stayAreas: ["Manhattan", "Jersey City", "Hoboken", "Newark near transit"],
    stayAreasAr: ["مانهاتن", "جيرسي سيتي", "هوبوكن", "نيوارك قرب المواصلات"],
    transport: "Plan stadium movement early. Transit works well, but match-day crowds can stretch travel time.",
    transportAr: "خطط للملاعب مبكراً. المواصلات ممتازة، لكن زحام يوم المباراة قد يطيل الوقت.",
    weather: "June and July are warm and busy. Pack light layers and expect long walking days.",
    weatherAr: "يونيو ويوليو دافئان ومزدحمان. خذ ملابس خفيفة واستعد للمشي الطويل.",
  },
  {
    slug: "los-angeles",
    name: "Los Angeles",
    nameAr: "لوس أنجلوس",
    marketName: "Los Angeles",
    marketNameAr: "لوس أنجلوس",
    stadium: "SoFi Stadium",
    airport: "LAX",
    airportAr: "مطار لوس أنجلوس LAX",
    angle: "Best for beach days, entertainment, and fans who want a longer California trip.",
    angleAr: "مناسبة للشواطئ والترفيه ومن يريد رحلة كاليفورنيا أطول.",
    stayAreas: ["Santa Monica", "Culver City", "Hollywood", "Inglewood for stadium proximity"],
    stayAreasAr: ["سانتا مونيكا", "كلفر سيتي", "هوليوود", "إنجلوود للقرب من الملعب"],
    transport: "Distances are large. Use planned rides, transfers, or stay close to your main activities.",
    transportAr: "المسافات كبيرة. استخدم تنقلات مخططة أو اسكن قرب أهم أنشطتك.",
    weather: "Warm, dry, and sunny. Sunscreen, water, and realistic travel times matter.",
    weatherAr: "الجو دافئ وجاف ومشمس. واقي الشمس والماء وتقدير وقت التنقل مهم.",
  },
  {
    slug: "miami",
    name: "Miami",
    nameAr: "ميامي",
    marketName: "Miami",
    marketNameAr: "ميامي",
    stadium: "Hard Rock Stadium",
    airport: "Miami International Airport",
    airportAr: "مطار ميامي الدولي",
    angle: "Best for beach energy, Latin culture, and travelers who want a vacation around matches.",
    angleAr: "مناسبة لأجواء الشاطئ والثقافة اللاتينية ومن يريد إجازة حول المباريات.",
    stayAreas: ["Brickell", "Downtown Miami", "Miami Beach", "Aventura"],
    stayAreasAr: ["بريكل", "وسط ميامي", "ميامي بيتش", "أفنتورا"],
    transport: "Budget extra time to the stadium. Heat and traffic can make last-minute movement stressful.",
    transportAr: "ضع وقتاً إضافياً للملعب. الحرارة والزحام تجعل التنقل المتأخر مرهقاً.",
    weather: "Hot, humid, and rainy at times. Carry water and plan indoor breaks.",
    weatherAr: "حار ورطب وقد تمطر أحياناً. احمل ماء وخطط لاستراحات داخلية.",
  },
  {
    slug: "dallas",
    name: "Dallas",
    nameAr: "دالاس",
    marketName: "Dallas",
    marketNameAr: "دالاس",
    stadium: "AT&T Stadium",
    airport: "DFW or Dallas Love Field",
    airportAr: "DFW أو دالاس لاف فيلد",
    angle: "Best for stadium-first travelers, families, and fans looking for a lower-stress base.",
    angleAr: "مناسبة لمن يركز على الملعب، العائلات، ومن يريد قاعدة أقل توتراً.",
    stayAreas: ["Arlington", "Downtown Dallas", "Las Colinas", "Fort Worth"],
    stayAreasAr: ["أرلينغتون", "وسط دالاس", "لاس كوليناس", "فورت وورث"],
    transport: "The stadium is in Arlington, so pre-booked rides or a car plan help.",
    transportAr: "الملعب في أرلينغتون، لذلك الحجز المسبق للتنقل أو خطة سيارة مفيد.",
    weather: "Very hot in summer. Keep hydration and shaded breaks in the plan.",
    weatherAr: "حار جداً في الصيف. اجعل الماء والاستراحات المظللة جزءاً من الخطة.",
  },
  {
    slug: "houston",
    name: "Houston",
    nameAr: "هيوستن",
    marketName: "Houston",
    marketNameAr: "هيوستن",
    stadium: "NRG Stadium",
    airport: "IAH or Hobby",
    airportAr: "IAH أو هوبي",
    angle: "Best for GCC travelers, food, families, and easier southern-USA connections.",
    angleAr: "مناسبة للمسافرين من الخليج، الطعام، العائلات، وربط مدن الجنوب الأمريكي.",
    stayAreas: ["Medical Center", "Downtown", "Galleria", "Museum District"],
    stayAreasAr: ["ميديكال سنتر", "وسط المدينة", "غاليريا", "منطقة المتاحف"],
    transport: "NRG is easier if you stay near transit or arrange rides before match day.",
    transportAr: "الوصول إلى NRG أسهل إذا سكنت قرب المواصلات أو رتبت التنقل مسبقاً.",
    weather: "Hot and humid. Indoor pacing and flexible plans make the trip easier.",
    weatherAr: "حار ورطب. الجداول المرنة والاستراحات الداخلية تجعل الرحلة أسهل.",
  },
  {
    slug: "atlanta",
    name: "Atlanta",
    nameAr: "أتلانتا",
    marketName: "Atlanta",
    marketNameAr: "أتلانتا",
    stadium: "Mercedes-Benz Stadium",
    airport: "Hartsfield-Jackson Atlanta International Airport",
    airportAr: "مطار هارتسفيلد-جاكسون أتلانتا",
    angle: "Best for direct flights, efficient stadium access, and short World Cup stays.",
    angleAr: "مناسبة للرحلات المباشرة، سهولة الوصول للملعب، والإقامات القصيرة.",
    stayAreas: ["Downtown", "Midtown", "Buckhead", "Airport area for short stays"],
    stayAreasAr: ["وسط المدينة", "ميدتاون", "بكهيد", "منطقة المطار للإقامات القصيرة"],
    transport: "MARTA can help if your hotel is positioned well. Avoid improvising after the match.",
    transportAr: "مترو MARTA مفيد إذا كان الفندق بموقع جيد. تجنب الارتجال بعد المباراة.",
    weather: "Warm and humid with possible storms. Keep rain backup plans.",
    weatherAr: "دافئ ورطب مع احتمال عواصف. جهز خطة بديلة للمطر.",
  },
  {
    slug: "seattle",
    name: "Seattle",
    nameAr: "سياتل",
    marketName: "Seattle",
    marketNameAr: "سياتل",
    stadium: "Lumen Field",
    airport: "Seattle-Tacoma International Airport",
    airportAr: "مطار سياتل تاكوما",
    angle: "Best for cooler weather, scenic travel, and fans extending to Vancouver or the Pacific Northwest.",
    angleAr: "مناسبة للطقس الألطف والطبيعة ومن يريد تمديد الرحلة لفانكوفر أو شمال الغرب.",
    stayAreas: ["Downtown", "South Lake Union", "Capitol Hill", "Airport area for quick exits"],
    stayAreasAr: ["وسط المدينة", "ساوث ليك يونيون", "كابيتول هيل", "منطقة المطار للخروج السريع"],
    transport: "Light rail is useful from the airport and to central areas. Book stays near clear routes.",
    transportAr: "القطار الخفيف مفيد من المطار وللمناطق المركزية. اسكن قرب مسار واضح.",
    weather: "Milder than many host cities. Bring a light jacket for evenings.",
    weatherAr: "ألطف من مدن كثيرة. خذ جاكيت خفيف للمساء.",
  },
  {
    slug: "san-francisco-bay-area",
    name: "San Francisco Bay Area",
    nameAr: "منطقة خليج سان فرانسيسكو",
    marketName: "San Francisco",
    marketNameAr: "سان فرانسيسكو",
    stadium: "Levi's Stadium",
    airport: "SFO or San Jose",
    airportAr: "SFO أو سان خوسيه",
    angle: "Best for tech travelers, scenic side trips, and California multi-city plans.",
    angleAr: "مناسبة لمحبي التقنية والرحلات الطبيعية وخطط كاليفورنيا متعددة المدن.",
    stayAreas: ["San Jose", "Santa Clara", "Palo Alto", "San Francisco if sightseeing matters"],
    stayAreasAr: ["سان خوسيه", "سانتا كلارا", "بالو ألتو", "سان فرانسيسكو إذا كانت السياحة مهمة"],
    transport: "The stadium is in Santa Clara, not downtown San Francisco. Pick your base carefully.",
    transportAr: "الملعب في سانتا كلارا وليس وسط سان فرانسيسكو. اختر مكان السكن بعناية.",
    weather: "Mild with cooler evenings. Layering is safer than packing for heat only.",
    weatherAr: "معتدل مع أمسيات أبرد. الطبقات الخفيفة أفضل من ملابس الصيف فقط.",
  },
  {
    slug: "boston",
    name: "Boston",
    nameAr: "بوسطن",
    marketName: "Boston",
    marketNameAr: "بوسطن",
    stadium: "Gillette Stadium",
    airport: "Boston Logan International Airport",
    airportAr: "مطار بوسطن لوغان",
    angle: "Best for history, walkable city days, and fans adding New York or Philadelphia.",
    angleAr: "مناسبة للتاريخ والمشي داخل المدينة ومن يريد إضافة نيويورك أو فيلادلفيا.",
    stayAreas: ["Back Bay", "Downtown", "Seaport", "Foxborough for stadium proximity"],
    stayAreasAr: ["باك باي", "وسط المدينة", "سي بورت", "فوكسبره للقرب من الملعب"],
    transport: "Gillette Stadium is outside the city. Match-day transport needs planning.",
    transportAr: "ملعب جيليت خارج المدينة. يوم المباراة يحتاج خطة تنقل واضحة.",
    weather: "Warm and pleasant, but evenings can cool down.",
    weatherAr: "دافئ ومناسب، لكن المساء قد يكون أبرد.",
  },
  {
    slug: "kansas-city",
    name: "Kansas City",
    nameAr: "كانساس سيتي",
    marketName: "Kansas City",
    marketNameAr: "كانساس سيتي",
    stadium: "Arrowhead Stadium",
    airport: "Kansas City International Airport",
    airportAr: "مطار كانساس سيتي الدولي",
    angle: "Best for fans who want a focused match trip, lower complexity, and strong local atmosphere.",
    angleAr: "مناسبة لرحلة مباراة مركزة، تعقيد أقل، وأجواء محلية قوية.",
    stayAreas: ["Downtown", "Country Club Plaza", "Airport area", "Stadium area only with a ride plan"],
    stayAreasAr: ["وسط المدينة", "كونتري كلوب بلازا", "منطقة المطار", "قرب الملعب بشرط خطة تنقل"],
    transport: "A car or pre-arranged ride plan is important for match day.",
    transportAr: "السيارة أو التنقل المرتب مسبقاً مهم يوم المباراة.",
    weather: "Hot summer days are likely. Keep the schedule light around match times.",
    weatherAr: "غالباً أيام الصيف حارة. اجعل الجدول خفيفاً حول وقت المباراة.",
  },
  {
    slug: "philadelphia",
    name: "Philadelphia",
    nameAr: "فيلادلفيا",
    marketName: "Philadelphia",
    marketNameAr: "فيلادلفيا",
    stadium: "Lincoln Financial Field",
    airport: "Philadelphia International Airport",
    airportAr: "مطار فيلادلفيا الدولي",
    angle: "Best for East Coast travelers, history, and pairing with New York or Washington, DC.",
    angleAr: "مناسبة لمسافري الساحل الشرقي والتاريخ وربطها بنيويورك أو واشنطن.",
    stayAreas: ["Center City", "Old City", "University City", "Airport area for short trips"],
    stayAreasAr: ["سنتر سيتي", "أولد سيتي", "يونيفرسيتي سيتي", "منطقة المطار للرحلات القصيرة"],
    transport: "Stadium district access is manageable, but post-match rides can be crowded.",
    transportAr: "الوصول لمنطقة الملعب جيد، لكن التنقل بعد المباراة قد يكون مزدحماً.",
    weather: "Warm and humid. Plan indoor breaks around historic walking routes.",
    weatherAr: "دافئ ورطب. خطط لاستراحات داخلية حول مسارات المشي التاريخية.",
  },
  {
    slug: "las-vegas",
    name: "Las Vegas",
    nameAr: "لاس فيغاس",
    marketName: "Las Vegas",
    marketNameAr: "لاس فيغاس",
    airport: "Harry Reid International Airport",
    airportAr: "مطار هاري ريد الدولي",
    angle: "Not an official host city, but useful for side trips, stopovers, and travelers comparing USA routes.",
    angleAr: "ليست مدينة مستضيفة رسمياً، لكنها مفيدة كرحلة جانبية أو توقف أو مقارنة لمسارات أمريكا.",
    stayAreas: ["The Strip", "Downtown Las Vegas", "Summerlin", "Airport area for short stays"],
    stayAreasAr: ["ذا ستريب", "وسط لاس فيغاس", "سمرلين", "منطقة المطار للإقامات القصيرة"],
    transport: "Use Vegas as a side-trip base, not a stadium base. Connect by flight to host cities.",
    transportAr: "استخدم لاس فيغاس كرحلة جانبية لا كقاعدة للملاعب. اربطها بالطيران إلى المدن المستضيفة.",
    weather: "Extremely hot in summer. Avoid long outdoor walking during the afternoon.",
    weatherAr: "حارة جداً في الصيف. تجنب المشي الطويل خارجياً في فترة الظهر.",
    note: "Las Vegas is included for search demand and travel planning, not as a FIFA host stadium city.",
    noteAr: "أضفنا لاس فيغاس بسبب الطلب البحثي والتخطيط السياحي، وليست مدينة ملعب رسمية في كأس العالم.",
  },
];

const cityPages: WorldCupPage[] = WORLD_CUP_CITIES.map((city) => ({
  slug: `${city.slug}-travel-guide`,
  kind: "city",
  citySlug: city.slug,
  title: `${city.marketName} World Cup 2026 Travel Guide`,
  titleAr: `دليل السفر إلى ${city.marketNameAr} لكأس العالم 2026`,
  description: `Plan ${city.marketName} for World Cup 2026 with airports, stay areas, stadium movement, weather, safety, eSIM, insurance, and help from Rya.`,
  descriptionAr: `خطط رحلة ${city.marketNameAr} لكأس العالم 2026: المطار، مناطق السكن، التنقل، الطقس، الأمان، eSIM، التأمين، ومساعدة ريا.`,
  intent: "City travel planning",
  intentAr: "تخطيط مدينة",
  focus: [
    city.angle,
    `Main airport: ${city.airport}.`,
    `Stay areas to compare: ${city.stayAreas.join(", ")}.`,
    city.transport,
  ],
  focusAr: [
    city.angleAr,
    `المطار الرئيسي: ${city.airportAr}.`,
    `مناطق سكن للمقارنة: ${city.stayAreasAr.join("، ")}.`,
    city.transportAr,
  ],
  primaryCta: `Ask Rya to plan ${city.marketName}`,
  primaryCtaAr: `اطلب من ريا تخطيط ${city.marketNameAr}`,
}));

const stadiumPages: WorldCupPage[] = WORLD_CUP_CITIES.filter((city) => city.stadium).map((city) => ({
  slug: `${city.slug}-stadium-guide`,
  kind: "stadium",
  citySlug: city.slug,
  title: `${city.stadium} World Cup 2026 Stadium Guide`,
  titleAr: `دليل ملعب ${city.stadium} في كأس العالم 2026`,
  description: `A match-day guide for ${city.stadium}: where to stay, when to leave, transport risk, arrival planning, and how Rya helps before and after the match.`,
  descriptionAr: `دليل يوم المباراة في ${city.stadium}: مناطق السكن، متى تتحرك، مخاطر التنقل، خطة الوصول، وكيف تساعدك ريا قبل وبعد المباراة.`,
  intent: "Stadium and match-day travel",
  intentAr: "الملعب ويوم المباراة",
  focus: [
    `Do not plan match-day movement at the last minute.`,
    `Compare staying near ${city.stadium} versus staying in ${city.marketName}.`,
    "Keep a post-match exit plan before entering the stadium.",
    "Use Rya to translate signs, check timing, and choose safer return options.",
  ],
  focusAr: [
    "لا تؤجل خطة التنقل ليوم المباراة.",
    `قارن بين السكن قرب ${city.stadium} والسكن في ${city.marketNameAr}.`,
    "جهز خطة الخروج بعد المباراة قبل دخول الملعب.",
    "استخدم ريا لترجمة اللوحات وفحص الوقت واختيار عودة أكثر أماناً.",
  ],
  primaryCta: `Plan match day with Rya`,
  primaryCtaAr: "خطط يوم المباراة مع ريا",
}));

const airportPages: WorldCupPage[] = WORLD_CUP_CITIES.map((city) => ({
  slug: `${city.slug}-airport-guide`,
  kind: "airport",
  citySlug: city.slug,
  title: `${city.airport} World Cup 2026 Arrival Guide`,
  titleAr: `دليل الوصول عبر ${city.airportAr} لكأس العالم 2026`,
  description: `Arrive smarter for World Cup 2026: airport transfer choices, SIM/eSIM timing, hotel area decisions, scams to avoid, and first-hour help from Rya.`,
  descriptionAr: `وصول أذكى لكأس العالم 2026: خيارات النقل من المطار، توقيت eSIM، اختيار منطقة السكن، تجنب الاحتيال، ومساعدة ريا في أول ساعة.`,
  intent: "Airport arrival and transfer",
  intentAr: "الوصول من المطار والتنقل",
  focus: [
    "Install eSIM or confirm roaming before leaving the airport.",
    "Save your hotel address offline in English.",
    "Avoid unlicensed rides and unclear cash offers.",
    city.transport,
  ],
  focusAr: [
    "فعّل eSIM أو تأكد من التجوال قبل مغادرة المطار.",
    "احفظ عنوان الفندق بالإنجليزية بدون إنترنت.",
    "تجنب المواصلات غير الرسمية والعروض النقدية غير الواضحة.",
    city.transportAr,
  ],
  primaryCta: `Ask Rya before landing`,
  primaryCtaAr: "اسأل ريا قبل الهبوط",
}));

const problemPages: WorldCupPage[] = [
  {
    slug: "usa-visa-for-world-cup-2026",
    kind: "problem",
    title: "USA Visa for World Cup 2026 Travelers",
    titleAr: "تأشيرة أمريكا لمسافري كأس العالم 2026",
    description: "A practical visa planning guide for World Cup travelers, especially GCC and Arabic-speaking fans visiting the USA for the first time.",
    descriptionAr: "دليل عملي للتأشيرة لمسافري كأس العالم، خصوصاً مسافري الخليج والعرب الذين يزورون أمريكا لأول مرة.",
    intent: "Visa planning",
    intentAr: "تخطيط التأشيرة",
    focus: ["Start early because appointment availability can change.", "Keep match plans flexible until your visa is confirmed.", "Use Rya to build a document checklist and travel timeline."],
    focusAr: ["ابدأ مبكراً لأن المواعيد قد تتغير.", "اجعل خطة المباريات مرنة حتى تتأكد التأشيرة.", "استخدم ريا لبناء قائمة وثائق وجدول زمني للسفر."],
    primaryCta: "Build my visa travel timeline",
    primaryCtaAr: "ابني جدول التأشيرة والسفر",
  },
  {
    slug: "world-cup-2026-travel-budget",
    kind: "problem",
    title: "World Cup 2026 USA Travel Budget Guide",
    titleAr: "ميزانية السفر إلى أمريكا لكأس العالم 2026",
    description: "Estimate the real trip budget: flights, stay areas, food, transport, eSIM, insurance, match-day movement, and emergency buffer.",
    descriptionAr: "قدّر ميزانية الرحلة الواقعية: الطيران، السكن، الطعام، التنقل، eSIM، التأمين، يوم المباراة، وهامش الطوارئ.",
    intent: "Budget planning",
    intentAr: "تخطيط الميزانية",
    focus: ["Separate match tickets from travel costs.", "Budget city-to-city flights if attending multiple matches.", "Rya can turn your budget into a daily spending plan."],
    focusAr: ["افصل تذاكر المباريات عن تكلفة السفر.", "احسب طيران المدن إذا ستحضر أكثر من مباراة.", "ريا تستطيع تحويل ميزانيتك إلى خطة صرف يومية."],
    primaryCta: "Calculate my World Cup budget",
    primaryCtaAr: "احسب ميزانية كأس العالم",
  },
  {
    slug: "best-esim-for-world-cup-2026-usa",
    kind: "problem",
    title: "Best eSIM for World Cup 2026 in the USA",
    titleAr: "أفضل eSIM لكأس العالم 2026 في أمريكا",
    description: "How to choose mobile data for maps, translation, rides, stadium movement, and multi-city travel during the tournament.",
    descriptionAr: "كيف تختار بيانات الجوال للخرائط والترجمة والتنقل والملاعب والرحلات متعددة المدن أثناء البطولة.",
    intent: "eSIM and connectivity",
    intentAr: "eSIM والاتصال",
    focus: ["Choose more data if you use maps and live translation often.", "Install before travel when possible.", "Rya can recommend data size based on trip length and cities."],
    focusAr: ["اختر بيانات أكثر إذا تستخدم الخرائط والترجمة كثيراً.", "ثبت الشريحة قبل السفر إن أمكن.", "ريا تقترح حجم البيانات حسب مدة الرحلة والمدن."],
    primaryCta: "Choose my eSIM with Rya",
    primaryCtaAr: "اختَر eSIM مع ريا",
  },
  {
    slug: "world-cup-2026-travel-insurance",
    kind: "problem",
    title: "World Cup 2026 Travel Insurance Guide",
    titleAr: "دليل تأمين السفر لكأس العالم 2026",
    description: "When World Cup travelers should consider insurance for medical issues, missed flights, family travel, luggage, and expensive multi-city plans.",
    descriptionAr: "متى يحتاج مسافر كأس العالم التأمين: الحالات الطبية، فوات الرحلات، سفر العائلة، الأمتعة، وخطط المدن المكلفة.",
    intent: "Insurance decision",
    intentAr: "قرار التأمين",
    focus: ["Long trips and family trips have higher downside risk.", "Compare coverage, not only price.", "Rya can explain insurance terms in simple language."],
    focusAr: ["الرحلات الطويلة والعائلية أعلى خطراً.", "قارن التغطية وليس السعر فقط.", "ريا تشرح شروط التأمين بلغة بسيطة."],
    primaryCta: "Check if I need insurance",
    primaryCtaAr: "افحص هل أحتاج تأمين",
  },
  {
    slug: "world-cup-2026-safety-scams",
    kind: "problem",
    title: "World Cup 2026 Safety and Scam Avoidance Guide",
    titleAr: "دليل الأمان وتجنب الاحتيال في كأس العالم 2026",
    description: "Practical safety guidance for airports, rides, street offers, fake tickets, payment, crowded areas, and late-night travel.",
    descriptionAr: "نصائح أمان عملية للمطارات، المواصلات، عروض الشارع، التذاكر المزيفة، الدفع، الزحام، والتنقل ليلاً.",
    intent: "Safety and scams",
    intentAr: "الأمان والاحتيال",
    focus: ["Do not buy unofficial tickets or accept unclear offers.", "Use licensed transport and verified booking channels.", "Ask Rya to sanity-check suspicious situations while traveling."],
    focusAr: ["لا تشترِ تذاكر غير رسمية ولا تقبل عروضاً غامضة.", "استخدم تنقلاً مرخصاً وقنوات حجز موثوقة.", "اسأل ريا عندما تشك في موقف أثناء السفر."],
    primaryCta: "Get safety help from Rya",
    primaryCtaAr: "احصل على مساعدة أمان من ريا",
  },
  {
    slug: "world-cup-2026-family-travel",
    kind: "audience",
    title: "World Cup 2026 Family Travel Guide",
    titleAr: "دليل سفر العائلة لكأس العالم 2026",
    description: "Family-first planning for World Cup trips: safer stay areas, realistic schedules, kids, heat, transport, food, and emergency planning.",
    descriptionAr: "تخطيط عائلي لكأس العالم: مناطق سكن أهدأ، جدول واقعي، الأطفال، الحرارة، التنقل، الطعام، والطوارئ.",
    intent: "Family travel",
    intentAr: "سفر العائلة",
    focus: ["Keep one major activity per day around match days.", "Choose stay areas for safety and transit more than nightlife.", "Rya can simplify plans when children or older travelers are included."],
    focusAr: ["اكتفِ بنشاط رئيسي واحد حول أيام المباريات.", "اختر السكن للأمان والتنقل أكثر من السهر.", "ريا تخفف الجداول عند وجود أطفال أو كبار سن."],
    primaryCta: "Plan a family World Cup trip",
    primaryCtaAr: "خطط رحلة عائلية لكأس العالم",
  },
  {
    slug: "world-cup-2026-saudi-travelers",
    kind: "audience",
    title: "World Cup 2026 Guide for Saudi Travelers",
    titleAr: "دليل كأس العالم 2026 للمسافرين من السعودية",
    description: "A Saudi-focused guide to USA World Cup travel: flights, visas, budget, prayer-friendly planning, family travel, Arabic help, and Rya support.",
    descriptionAr: "دليل للمسافرين من السعودية إلى كأس العالم في أمريكا: الطيران، التأشيرة، الميزانية، الصلاة، العائلة، المساعدة العربية، ودعم ريا.",
    intent: "Saudi traveler planning",
    intentAr: "تخطيط المسافر السعودي",
    focus: ["Start visa planning early.", "Expect long flights and possible domestic connections.", "Rya can answer in Arabic and keep your trip context across cities."],
    focusAr: ["ابدأ التأشيرة مبكراً.", "توقع رحلات طويلة وربما تنقلات داخلية.", "ريا تجيب بالعربية وتحفظ سياق رحلتك بين المدن."],
    primaryCta: "Plan my trip from Saudi Arabia",
    primaryCtaAr: "خطط رحلتي من السعودية",
  },
  {
    slug: "world-cup-2026-gcc-travelers",
    kind: "audience",
    title: "World Cup 2026 Guide for GCC Travelers",
    titleAr: "دليل كأس العالم 2026 لمسافري الخليج",
    description: "A practical USA World Cup planning guide for GCC fans: visas, long-haul flights, family safety, budgets, eSIM, insurance, and airport help.",
    descriptionAr: "دليل عملي لمسافري الخليج إلى كأس العالم في أمريكا: التأشيرات، الرحلات الطويلة، أمان العائلة، الميزانية، eSIM، التأمين، والمطارات.",
    intent: "GCC traveler planning",
    intentAr: "تخطيط مسافري الخليج",
    focus: ["Compare gateway cities before booking domestic segments.", "Protect the trip with clear insurance if the plan is expensive.", "Rya can help in Arabic or English during confusing travel moments."],
    focusAr: ["قارن مدن الوصول قبل حجز الرحلات الداخلية.", "احمِ الرحلة بتأمين واضح إذا كانت الخطة مكلفة.", "ريا تساعد بالعربية أو الإنجليزية في المواقف المربكة."],
    primaryCta: "Build my GCC World Cup plan",
    primaryCtaAr: "ابنِ خطة كأس العالم من الخليج",
  },
  {
    slug: "world-cup-2026-first-time-usa",
    kind: "audience",
    title: "First-Time USA Travel Guide for World Cup 2026",
    titleAr: "دليل أول زيارة لأمريكا في كأس العالم 2026",
    description: "What first-time USA visitors need to know: airports, tipping, transport, hotel areas, safety, payment, mobile data, and travel etiquette.",
    descriptionAr: "ما يحتاجه من يزور أمريكا لأول مرة: المطارات، البقشيش، التنقل، مناطق السكن، الأمان، الدفع، البيانات، وآداب السفر.",
    intent: "First-time USA travel",
    intentAr: "أول زيارة لأمريكا",
    focus: ["Understand tipping and payment expectations.", "Avoid overbooking days because US cities are spread out.", "Rya can explain unfamiliar travel moments in simple language."],
    focusAr: ["افهم نظام البقشيش والدفع.", "لا تملأ الأيام لأن المدن الأمريكية واسعة.", "ريا تشرح المواقف الجديدة بلغة بسيطة."],
    primaryCta: "Prepare me for the USA",
    primaryCtaAr: "جهزني لأول زيارة لأمريكا",
  },
  {
    slug: "world-cup-2026-multi-city-itinerary",
    kind: "problem",
    title: "World Cup 2026 Multi-City Itinerary Guide",
    titleAr: "دليل خطة المدن المتعددة لكأس العالم 2026",
    description: "How to plan a multi-city World Cup route across the USA without exhausting yourself or losing money on bad connections.",
    descriptionAr: "كيف تخطط مسار مدن متعددة في أمريكا لكأس العالم بدون إرهاق أو خسائر في تنقلات سيئة.",
    intent: "Multi-city planning",
    intentAr: "خطة مدن متعددة",
    focus: ["Cluster cities by region when possible.", "Leave recovery time after long flights and intense match days.", "Rya can compare routes by cost, fatigue, and risk."],
    focusAr: ["اجمع المدن حسب المنطقة عندما يمكن.", "اترك وقت راحة بعد الرحلات الطويلة وأيام المباريات.", "ريا تقارن المسارات حسب التكلفة والإرهاق والمخاطر."],
    primaryCta: "Optimize my multi-city route",
    primaryCtaAr: "حسّن مسار المدن",
  },
  {
    slug: "world-cup-2026-match-day-transport",
    kind: "problem",
    title: "World Cup 2026 Match-Day Transport Guide",
    titleAr: "دليل التنقل يوم المباراة في كأس العالم 2026",
    description: "A practical guide to leaving early, reaching stadiums, avoiding post-match chaos, and choosing safer transport options.",
    descriptionAr: "دليل عملي للخروج مبكراً، الوصول للملاعب، تجنب فوضى ما بعد المباراة، واختيار تنقل أكثر أماناً.",
    intent: "Match-day movement",
    intentAr: "تنقل يوم المباراة",
    focus: ["Leave earlier than normal tourist timing.", "Save a return plan before the match starts.", "Use Rya to choose the calmest return option based on your location."],
    focusAr: ["تحرك أبكر من توقيت السياحة العادي.", "احفظ خطة العودة قبل بداية المباراة.", "استخدم ريا لاختيار أهدأ عودة حسب موقعك."],
    primaryCta: "Plan my match-day route",
    primaryCtaAr: "خطط مسار يوم المباراة",
  },
  {
    slug: "world-cup-2026-packing-guide",
    kind: "problem",
    title: "World Cup 2026 USA Packing Guide",
    titleAr: "قائمة تجهيز السفر لأمريكا في كأس العالم 2026",
    description: "What to pack for summer World Cup travel in the USA: documents, power, data, weather, stadium days, family needs, and backup plans.",
    descriptionAr: "ماذا تجهز لصيف كأس العالم في أمريكا: الوثائق، الشواحن، البيانات، الطقس، أيام الملعب، احتياجات العائلة، والخطط البديلة.",
    intent: "Packing",
    intentAr: "التجهيز",
    focus: ["Keep documents and hotel confirmations offline.", "Carry power banks and data backup.", "Pack for heat, rain, long walking, and stadium rules."],
    focusAr: ["احفظ الوثائق وحجوزات الفندق بدون إنترنت.", "خذ باور بنك وبديل للبيانات.", "جهز للحرارة والمطر والمشي الطويل وقواعد الملاعب."],
    primaryCta: "Create my packing list",
    primaryCtaAr: "أنشئ قائمة التجهيز",
  },
  {
    slug: "world-cup-2026-translation-help",
    kind: "problem",
    title: "World Cup 2026 Translation Help for Travelers",
    titleAr: "مساعدة الترجمة للمسافرين في كأس العالم 2026",
    description: "How Rya helps with menus, signs, airport instructions, ride messages, hotel communication, and stressful travel moments.",
    descriptionAr: "كيف تساعد ريا في ترجمة القوائم واللوحات وتعليمات المطار ورسائل السائق والفندق والمواقف المربكة.",
    intent: "Translation help",
    intentAr: "مساعدة الترجمة",
    focus: ["Use translation for practical decisions, not only words.", "Take screenshots of confusing instructions.", "Rya can turn unclear travel language into a clear next step."],
    focusAr: ["استخدم الترجمة لاتخاذ قرار، وليس ترجمة كلمات فقط.", "صوّر التعليمات المربكة.", "ريا تحول اللغة غير الواضحة إلى خطوة مفهومة."],
    primaryCta: "Get travel translation help",
    primaryCtaAr: "احصل على مساعدة ترجمة",
  },
];

export const WORLD_CUP_PAGES: WorldCupPage[] = [
  ...cityPages,
  ...stadiumPages,
  ...airportPages,
  ...problemPages,
];

export function getWorldCupCity(slug: string) {
  return WORLD_CUP_CITIES.find((city) => city.slug === slug);
}

export function getWorldCupPage(slug: string) {
  return WORLD_CUP_PAGES.find((page) => page.slug === slug);
}

export function localizedWorldCupPage(page: WorldCupPage, locale: Locale) {
  const isAr = locale === "ar";
  return {
    title: isAr ? page.titleAr : page.title,
    description: isAr ? page.descriptionAr : page.description,
    intent: isAr ? page.intentAr : page.intent,
    focus: isAr ? page.focusAr : page.focus,
    primaryCta: isAr ? page.primaryCtaAr : page.primaryCta,
  };
}

export function localizedWorldCupCity(city: WorldCupCity, locale: Locale) {
  const isAr = locale === "ar";
  return {
    name: isAr ? city.nameAr : city.name,
    marketName: isAr ? city.marketNameAr : city.marketName,
    airport: isAr ? city.airportAr : city.airport,
    angle: isAr ? city.angleAr : city.angle,
    stayAreas: isAr ? city.stayAreasAr : city.stayAreas,
    transport: isAr ? city.transportAr : city.transport,
    weather: isAr ? city.weatherAr : city.weather,
    note: isAr ? city.noteAr : city.note,
  };
}

export function worldCupFaq(locale: Locale, page?: WorldCupPage) {
  const isAr = locale === "ar";
  const subject = page ? localizedWorldCupPage(page, locale).title : isAr ? "كأس العالم 2026" : "World Cup 2026";

  return [
    {
      q: isAr ? "هل Rya تبيع تذاكر كأس العالم؟" : "Does Rya sell World Cup tickets?",
      a: isAr
        ? "لا. Rya ليست بائع تذاكر. دورها مساعدتك في التخطيط للسفر والتنقل والميزانية والأمان والخدمات العملية حول الرحلة."
        : "No. Rya is not a ticket reseller. She helps with travel planning, transport, budget, safety, and practical services around the trip.",
    },
    {
      q: isAr ? `كيف تساعدني Rya في ${subject}؟` : `How can Rya help with ${subject}?`,
      a: isAr
        ? "ريا تفهم وجهتك وميزانيتك ومن يسافر معك، ثم تقترح خطة عملية وخدمات مثل eSIM أو التأمين أو التنقل عندما تكون مناسبة."
        : "Rya understands your destination, budget, and companions, then suggests a practical plan and services like eSIM, insurance, or transport only when relevant.",
    },
    {
      q: isAr ? "هل أحتاج eSIM في أمريكا؟" : "Do I need an eSIM in the USA?",
      a: isAr
        ? "غالباً نعم إذا كنت تحتاج خرائط وترجمة وتنقلات فورية. ريا تساعدك في اختيار حجم البيانات حسب مدة الرحلة والمدن."
        : "Usually yes if you need maps, translation, and real-time transport. Rya helps choose the right data size for your trip length and cities.",
    },
    {
      q: isAr ? "ما أهم نصيحة ليوم المباراة؟" : "What is the most important match-day tip?",
      a: isAr
        ? "لا تتحرك في آخر لحظة. جهز خطة الوصول والعودة، واحفظ العنوان، واترك وقتاً للزحام والفحص والدخول."
        : "Do not move at the last minute. Prepare arrival and return plans, save addresses, and leave time for crowds, screening, and entry.",
    },
  ];
}
