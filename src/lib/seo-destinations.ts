/**
 * GoTripza SEO Destination Intelligence
 * Master data powering all destination hub, comparison, budget, seasonal, visa, and hotel pages.
 */

export type Destination = {
  slug: string;
  nameEn: string;
  nameAr: string;
  country: string;
  countryAr: string;
  iata: string;
  flag: string;
  region: "middleeast" | "europe" | "asia" | "africa" | "americas" | "oceania";
  heroKeyword: string; // for Unsplash fetch
  taglineEn: string;
  taglineAr: string;
  descriptionEn: string;
  descriptionAr: string;
  // Budget
  budgetPerDay: { budget: number; mid: number; luxury: number }; // USD/day
  currency: string; // local currency code
  // Climate
  bestMonths: number[]; // 1-12
  climate: { en: string; ar: string };
  // Visa
  visaFree: string[]; // country codes that get visa-free
  visaOnArrival: string[]; // country codes that get VOA
  eVisa: boolean;
  visaNotes: { en: string; ar: string };
  // What to wear
  clothing: { en: string; ar: string };
  // Neighborhoods
  neighborhoods: Array<{ name: string; nameAr: string; type: string }>;
  // Activities
  activities: Array<{ en: string; ar: string; icon: string }>;
  // Hotel categories
  hotelCategories: Array<{ slug: string; en: string; ar: string }>;
  // Internal links
  comparePairs: string[]; // other destination slugs to compare with
  nearbySlug: string[]; // nearby destinations
  // Affiliate
  carRental: boolean;
  activities_partner: boolean;
};

export const DESTINATIONS: Destination[] = [
  {
    slug: "dubai",
    nameEn: "Dubai",
    nameAr: "دبي",
    country: "United Arab Emirates",
    countryAr: "الإمارات العربية المتحدة",
    iata: "DXB",
    flag: "🇦🇪",
    region: "middleeast",
    heroKeyword: "Dubai skyline Burj Khalifa",
    taglineEn: "Where desert meets the future",
    taglineAr: "حيث يلتقي الصحراء بالمستقبل",
    descriptionEn: "Dubai is the world's most ambitious city — a desert transformed into a global hub of luxury, innovation, and world records. From the world's tallest building to the largest mall, Dubai offers a once-in-a-lifetime experience for every traveller.",
    descriptionAr: "دبي هي أكثر مدن العالم طموحاً — صحراء تحولت إلى مركز عالمي للرفاهية والابتكار. من أطول مبنى في العالم إلى أكبر مول على وجه الأرض، تقدم دبي تجربة فريدة من نوعها لكل مسافر.",
    budgetPerDay: { budget: 80, mid: 200, luxury: 600 },
    currency: "AED",
    bestMonths: [10, 11, 12, 1, 2, 3],
    climate: {
      en: "Desert climate with hot summers (40°C+) and mild winters (20-25°C). Best visited October–March when temperatures are perfect.",
      ar: "مناخ صحراوي مع صيف حار جداً (40°م+) وشتاء معتدل (20-25°م). أفضل وقت للزيارة أكتوبر حتى مارس.",
    },
    visaFree: ["US", "UK", "EU", "AU", "CA", "NZ"],
    visaOnArrival: ["IN", "PK", "BD"],
    eVisa: true,
    visaNotes: {
      en: "GCC nationals enter visa-free. Most Western passports get 30-day visa on arrival or e-visa. 60-day e-visa available for many nationalities.",
      ar: "مواطنو دول الخليج يدخلون بدون تأشيرة. معظم الجنسيات تحصل على تأشيرة عند الوصول أو تأشيرة إلكترونية لمدة 30 أو 60 يوم.",
    },
    clothing: {
      en: "Lightweight, breathable clothing in summer. Light jacket for evenings Oct–Feb. Modest dress required at souks, mosques, and traditional areas.",
      ar: "ملابس خفيفة وقطنية في الصيف. جاكيت خفيف لأمسيات أكتوبر–فبراير. الملابس المحتشمة مطلوبة في الأسواق والمساجد.",
    },
    neighborhoods: [
      { name: "Downtown Dubai", nameAr: "وسط المدينة", type: "luxury" },
      { name: "Dubai Marina", nameAr: "مارينا دبي", type: "lifestyle" },
      { name: "Deira", nameAr: "ديرة", type: "heritage" },
      { name: "JBR Beach", nameAr: "شاطئ جميرا", type: "beach" },
      { name: "DIFC", nameAr: "مركز دبي المالي", type: "business" },
    ],
    activities: [
      { en: "Burj Khalifa observation deck", ar: "برج خليفة", icon: "🏙️" },
      { en: "Dubai Mall & fountain show", ar: "دبي مول وعروض النافورة", icon: "🛍️" },
      { en: "Desert safari & dune bashing", ar: "رحلات سفاري الصحراء", icon: "🏜️" },
      { en: "Dubai Frame", ar: "إطار دبي", icon: "🖼️" },
      { en: "Palm Jumeirah & Atlantis", ar: "نخلة جميرا وأتلانتيس", icon: "🌴" },
      { en: "Gold & Spice Souks", ar: "سوق الذهب والتوابل", icon: "✨" },
    ],
    hotelCategories: [
      { slug: "luxury", en: "Luxury 5-Star Hotels", ar: "فنادق فاخرة 5 نجوم" },
      { slug: "beach", en: "Beach & Resort Hotels", ar: "منتجعات الشاطئ" },
      { slug: "budget", en: "Budget-Friendly Hotels", ar: "فنادق اقتصادية" },
      { slug: "business", en: "Business Hotels", ar: "فنادق الأعمال" },
    ],
    comparePairs: ["abu-dhabi", "doha", "marrakech"],
    nearbySlug: ["abu-dhabi", "doha", "muscat"],
    carRental: true,
    activities_partner: true,
  },
  {
    slug: "istanbul",
    nameEn: "Istanbul",
    nameAr: "إسطنبول",
    country: "Turkey",
    countryAr: "تركيا",
    iata: "IST",
    flag: "🇹🇷",
    region: "europe",
    heroKeyword: "Istanbul Hagia Sophia Bosphorus",
    taglineEn: "Where East meets West across two continents",
    taglineAr: "حيث تلتقي قارتان في مدينة واحدة",
    descriptionEn: "Istanbul is the only city in the world straddling two continents. A city of 3,000 years of history, breathtaking Ottoman architecture, world-class cuisine, and a vibrant modern culture — Istanbul captivates every traveller who visits.",
    descriptionAr: "إسطنبول هي المدينة الوحيدة في العالم التي تمتد على قارتين. مدينة يمتد تاريخها 3000 عام، معمار عثماني خلاب، مطبخ عالمي، وثقافة حديثة نابضة — إسطنبول تأسر كل من يزورها.",
    budgetPerDay: { budget: 40, mid: 100, luxury: 280 },
    currency: "TRY",
    bestMonths: [4, 5, 9, 10, 11],
    climate: {
      en: "Temperate climate with warm summers (28°C) and cool winters (7°C). Spring (April–May) and autumn (Sept–Nov) are the sweet spots — mild weather, fewer crowds.",
      ar: "مناخ معتدل مع صيف دافئ (28°م) وشتاء بارد (7°م). الربيع (أبريل–مايو) والخريف (سبتمبر–نوفمبر) هما أفضل الأوقات.",
    },
    visaFree: ["EU", "UK"],
    visaOnArrival: [],
    eVisa: true,
    visaNotes: {
      en: "Most nationalities can get a Turkish e-Visa online in minutes. GCC residents and many others get 30–90 days. Apply at evisa.gov.tr.",
      ar: "معظم الجنسيات تحصل على تأشيرة تركيا الإلكترونية في دقائق عبر evisa.gov.tr. دول الخليج وكثير من الجنسيات: 30–90 يوماً.",
    },
    clothing: {
      en: "Layer up in spring/autumn. Light summer clothes June–Aug. Warm coat for winter. Scarf required when entering mosques.",
      ar: "ملابس طبقية في الربيع والخريف. ملابس صيفية خفيفة يونيو–أغسطس. معطف دافئ في الشتاء. غطاء رأس عند دخول المساجد.",
    },
    neighborhoods: [
      { name: "Sultanahmet", nameAr: "السلطانأحمد", type: "historic" },
      { name: "Taksim & Beyoglu", nameAr: "تقسيم وبيوغلو", type: "vibrant" },
      { name: "Kadikoy", nameAr: "كاديكوي", type: "local" },
      { name: "Besiktas", nameAr: "بيشكتاش", type: "trendy" },
      { name: "Eminonu & Grand Bazaar", nameAr: "أمينونو والبازار الكبير", type: "shopping" },
    ],
    activities: [
      { en: "Hagia Sophia & Blue Mosque", ar: "آيا صوفيا والمسجد الأزرق", icon: "🕌" },
      { en: "Grand Bazaar & Spice Market", ar: "البازار الكبير وسوق التوابل", icon: "🛍️" },
      { en: "Bosphorus cruise", ar: "جولة في مضيق البوسفور", icon: "⛴️" },
      { en: "Topkapi Palace", ar: "قصر طوب قابي", icon: "🏛️" },
      { en: "Turkish bath (hammam)", ar: "الحمام التركي", icon: "♨️" },
      { en: "Asian side food tour", ar: "جولة الطعام في الجانب الآسيوي", icon: "🍽️" },
    ],
    hotelCategories: [
      { slug: "historic", en: "Historic Sultanahmet Hotels", ar: "فنادق السلطانأحمد التاريخية" },
      { slug: "luxury", en: "Luxury Bosphorus Hotels", ar: "فنادق البوسفور الفاخرة" },
      { slug: "budget", en: "Budget Hotels & Hostels", ar: "فنادق اقتصادية وشقق مفروشة" },
      { slug: "boutique", en: "Boutique Hotels", ar: "الفنادق البوتيكية" },
    ],
    comparePairs: ["antalya", "dubai", "marrakech"],
    nearbySlug: ["antalya", "cappadocia"],
    carRental: true,
    activities_partner: true,
  },
  {
    slug: "antalya",
    nameEn: "Antalya",
    nameAr: "أنطاليا",
    country: "Turkey",
    countryAr: "تركيا",
    iata: "AYT",
    flag: "🇹🇷",
    region: "europe",
    heroKeyword: "Antalya Turkey Mediterranean beach",
    taglineEn: "The Turkish Riviera — sun, sea, and ancient ruins",
    taglineAr: "الريفيرا التركية — شمس وبحر وآثار تاريخية",
    descriptionEn: "Antalya is Turkey's premier beach destination, where turquoise Mediterranean waters meet ancient Roman ruins and the dramatic Taurus Mountains. Perfect for all-inclusive luxury resorts, cultural exploration, and family holidays.",
    descriptionAr: "أنطاليا هي الوجهة الشاطئية الأولى في تركيا، حيث يلتقي البحر المتوسط الفيروزي بالآثار الرومانية وجبال طوروس. مثالية للمنتجعات الفاخرة والعائلات والثقافة.",
    budgetPerDay: { budget: 35, mid: 80, luxury: 220 },
    currency: "TRY",
    bestMonths: [4, 5, 6, 9, 10],
    climate: {
      en: "Mediterranean climate — hot dry summers (35°C) and mild winters. Beach season runs April to October. July–August is peak season.",
      ar: "مناخ متوسطي — صيف حار وجاف (35°م) وشتاء معتدل. موسم الشاطئ من أبريل حتى أكتوبر.",
    },
    visaFree: ["EU", "UK"],
    visaOnArrival: [],
    eVisa: true,
    visaNotes: {
      en: "Same e-Visa as Istanbul. Apply at evisa.gov.tr. GCC nationals and most Arab passport holders get easy approval.",
      ar: "نفس تأشيرة إسطنبول الإلكترونية عبر evisa.gov.tr. دول الخليج ومعظم الجنسيات العربية تحصل على موافقة سهلة.",
    },
    clothing: {
      en: "Light beach wear April–October. Modest clothing for Old Town bazaars. Jacket for spring/autumn evenings.",
      ar: "ملابس شاطئ خفيفة أبريل–أكتوبر. ملابس محتشمة في أسواق المدينة القديمة. جاكيت لأمسيات الربيع والخريف.",
    },
    neighborhoods: [
      { name: "Kaleiçi (Old Town)", nameAr: "المدينة القديمة", type: "historic" },
      { name: "Lara Beach", nameAr: "شاطئ لارا", type: "resort" },
      { name: "Konyaaltı Beach", nameAr: "شاطئ كونيالتي", type: "beach" },
      { name: "Belek", nameAr: "بيليك", type: "luxury resort" },
    ],
    activities: [
      { en: "Lara & Konyaaltı beaches", ar: "شواطئ لارا وكونيالتي", icon: "🏖️" },
      { en: "Düden Waterfalls", ar: "شلالات دودن", icon: "💧" },
      { en: "Ancient ruins of Perge & Aspendos", ar: "آثار بيرجي وأسبندوس", icon: "🏛️" },
      { en: "Old Antalya Harbour", ar: "ميناء أنطاليا القديم", icon: "⛵" },
      { en: "All-inclusive resort experience", ar: "تجربة المنتجع الشامل", icon: "🌅" },
      { en: "Boat tours to hidden coves", ar: "رحلات بحرية إلى الخلجان", icon: "🚤" },
    ],
    hotelCategories: [
      { slug: "all-inclusive", en: "All-Inclusive Resorts", ar: "منتجعات شاملة" },
      { slug: "beach", en: "Beachfront Hotels", ar: "فنادق على الشاطئ" },
      { slug: "boutique", en: "Old Town Boutique Hotels", ar: "فنادق المدينة القديمة البوتيكية" },
      { slug: "budget", en: "Budget Hotels", ar: "فنادق اقتصادية" },
    ],
    comparePairs: ["istanbul", "dubai", "marrakech"],
    nearbySlug: ["istanbul", "bodrum"],
    carRental: true,
    activities_partner: true,
  },
  {
    slug: "bali",
    nameEn: "Bali",
    nameAr: "بالي",
    country: "Indonesia",
    countryAr: "إندونيسيا",
    iata: "DPS",
    flag: "🇮🇩",
    region: "asia",
    heroKeyword: "Bali rice terraces temples sunset",
    taglineEn: "The Island of the Gods — spirituality, surf, and serenity",
    taglineAr: "جزيرة الآلهة — روحانية وأمواج وهدوء",
    descriptionEn: "Bali is one of the world's most beloved travel destinations — a sacred island of emerald rice terraces, ancient temples, world-class surfing, and a wellness culture unlike anywhere else. Whether you seek adventure, romance, or spiritual renewal, Bali delivers.",
    descriptionAr: "بالي واحدة من أكثر الوجهات السياحية المحبوبة في العالم — جزيرة مقدسة تضم حقول أرز زمردية ومعابد عريقة وتصفح عالمي المستوى وثقافة عافية لا مثيل لها. سواء كنت تبحث عن المغامرة أو الرومانسية أو التجديد الروحي، بالي هي الإجابة.",
    budgetPerDay: { budget: 30, mid: 80, luxury: 250 },
    currency: "IDR",
    bestMonths: [4, 5, 6, 7, 8, 9],
    climate: {
      en: "Tropical climate with two seasons. Dry season (April–October) is ideal. Wet season (Nov–March) brings daily rain but fewer crowds and lower prices.",
      ar: "مناخ مداري بموسمين. الموسم الجاف (أبريل–أكتوبر) هو الأمثل. الموسم الممطر (نوفمبر–مارس) يحمل أمطاراً يومية وأسعاراً أقل.",
    },
    visaFree: ["MY", "SG", "PH", "TH", "BN"],
    visaOnArrival: ["US", "UK", "EU", "AU", "JP", "KR", "CN", "SA", "AE"],
    eVisa: true,
    visaNotes: {
      en: "Most nationalities get a 30-day Visa on Arrival for $35 USD, extendable once. E-Visa available online. GCC residents and Arab passport holders qualify for VOA.",
      ar: "معظم الجنسيات تحصل على تأشيرة عند الوصول لمدة 30 يوماً بـ35 دولاراً قابلة للتجديد مرة. دول الخليج والجوازات العربية مؤهلة.",
    },
    clothing: {
      en: "Light tropical wear year-round. Cover shoulders and knees when entering temples (sarongs available at entrance). Rain jacket for wet season.",
      ar: "ملابس استوائية خفيفة طوال العام. تغطية الأكتاف والركبتين عند دخول المعابد (سارونج متاح عند المدخل). معطف مطر في الموسم الممطر.",
    },
    neighborhoods: [
      { name: "Seminyak", nameAr: "سيمينياك", type: "trendy & beach" },
      { name: "Ubud", nameAr: "أوبود", type: "culture & wellness" },
      { name: "Kuta", nameAr: "كوتا", type: "surf & nightlife" },
      { name: "Canggu", nameAr: "كانغو", type: "digital nomad & surf" },
      { name: "Nusa Dua", nameAr: "نوسا دوا", type: "luxury resort" },
    ],
    activities: [
      { en: "Tanah Lot & Uluwatu temples", ar: "معابد تاناه لوت وأولواتو", icon: "🛕" },
      { en: "Tegallalang rice terraces", ar: "مدرجات الأرز في تيغالالانغ", icon: "🌾" },
      { en: "Surfing in Kuta & Canggu", ar: "التصفح في كوتا وكانغو", icon: "🏄" },
      { en: "Ubud Monkey Forest", ar: "غابة القرود في أوبود", icon: "🐒" },
      { en: "Sunrise hike on Mt. Batur", ar: "رحلة شروق الشمس على جبل باتور", icon: "🌋" },
      { en: "Traditional Balinese massage & spa", ar: "مساج وسبا بالينيزي تقليدي", icon: "💆" },
    ],
    hotelCategories: [
      { slug: "villa", en: "Private Pool Villas", ar: "فيلات مع مسبح خاص" },
      { slug: "resort", en: "Luxury Resorts", ar: "منتجعات فاخرة" },
      { slug: "wellness", en: "Wellness & Yoga Retreats", ar: "منتجعات صحة وعافية" },
      { slug: "budget", en: "Budget Guesthouses", ar: "بيوت الضيافة الاقتصادية" },
    ],
    comparePairs: ["phuket", "maldives", "singapore"],
    nearbySlug: ["singapore", "kuala-lumpur"],
    carRental: true,
    activities_partner: true,
  },
  {
    slug: "london",
    nameEn: "London",
    nameAr: "لندن",
    country: "United Kingdom",
    countryAr: "المملكة المتحدة",
    iata: "LHR",
    flag: "🇬🇧",
    region: "europe",
    heroKeyword: "London Tower Bridge Thames skyline",
    taglineEn: "The world's greatest city — history, culture, and infinite possibility",
    taglineAr: "أعظم مدن العالم — تاريخ وثقافة وإمكانات لا حدود لها",
    descriptionEn: "London is a city that needs no introduction — the cultural, financial, and creative capital of the world. From Buckingham Palace to the Tate Modern, from Michelin-starred restaurants to vibrant street markets, London is endlessly rewarding for every type of traveller.",
    descriptionAr: "لندن مدينة لا تحتاج إلى تعريف — العاصمة الثقافية والمالية والإبداعية للعالم. من قصر باكنغهام إلى متحف تيت الحديث، من المطاعم الحائزة على نجوم ميشلان إلى الأسواق النابضة — لندن لا تنضب لأي نوع من المسافرين.",
    budgetPerDay: { budget: 90, mid: 200, luxury: 500 },
    currency: "GBP",
    bestMonths: [5, 6, 7, 8, 9],
    climate: {
      en: "Temperate maritime climate — mild but unpredictable. Summer (June–Aug) is warm and long. Expect rain year-round. Pack layers always.",
      ar: "مناخ بحري معتدل — لطيف لكن غير متوقع. الصيف (يونيو–أغسطس) دافئ. المطر محتمل طوال العام. احرص على الطبقات دائماً.",
    },
    visaFree: ["US", "CA", "AU", "NZ", "JP", "SG", "MY", "KR"],
    visaOnArrival: [],
    eVisa: true,
    visaNotes: {
      en: "GCC nationals require a Standard Visitor Visa. UK ETA now required for many nationalities. Apply well in advance — processing takes 3–8 weeks.",
      ar: "مواطنو دول الخليج يحتاجون تأشيرة زائر قياسية. تأكد من التقديم قبل 8 أسابيع من السفر. يتوفر ETA الإلكتروني لبعض الجنسيات.",
    },
    clothing: {
      en: "Layers year-round. Waterproof jacket essential. Smart-casual for restaurants and West End shows. Comfortable walking shoes — you'll walk a lot.",
      ar: "ملابس طبقية طوال العام. معطف مقاوم للمطر ضروري. ملابس أنيقة غير رسمية للمطاعم وعروض ويست إند. حذاء مريح للمشي.",
    },
    neighborhoods: [
      { name: "Westminster", nameAr: "ويستمنستر", type: "iconic" },
      { name: "Shoreditch", nameAr: "شورديتش", type: "trendy" },
      { name: "Notting Hill", nameAr: "نوتنغ هيل", type: "charming" },
      { name: "South Bank", nameAr: "ساوث بانك", type: "cultural" },
      { name: "Mayfair", nameAr: "مايفير", type: "luxury" },
    ],
    activities: [
      { en: "Tower of London & Crown Jewels", ar: "برج لندن والجواهر الملكية", icon: "👑" },
      { en: "British Museum (free entry)", ar: "المتحف البريطاني (مجاني)", icon: "🏛️" },
      { en: "West End theatre shows", ar: "عروض مسرح ويست إند", icon: "🎭" },
      { en: "Borough Market food tour", ar: "جولة طعام في سوق بوروه", icon: "🧀" },
      { en: "Thames River cruise", ar: "رحلة نهرية على التيمز", icon: "🚤" },
      { en: "Hyde Park & Kensington", ar: "حديقة هايد بارك وكنسينغتون", icon: "🌳" },
    ],
    hotelCategories: [
      { slug: "luxury", en: "Mayfair & Knightsbridge Luxury", ar: "فنادق مايفير وايتبريدج الفاخرة" },
      { slug: "boutique", en: "Boutique & Design Hotels", ar: "الفنادق البوتيكية والتصميمية" },
      { slug: "central", en: "Central London Hotels", ar: "فنادق وسط لندن" },
      { slug: "budget", en: "Budget & Value Hotels", ar: "فنادق اقتصادية" },
    ],
    comparePairs: ["paris", "amsterdam", "istanbul"],
    nearbySlug: ["paris", "amsterdam", "dublin"],
    carRental: false,
    activities_partner: true,
  },
  {
    slug: "paris",
    nameEn: "Paris",
    nameAr: "باريس",
    country: "France",
    countryAr: "فرنسا",
    iata: "CDG",
    flag: "🇫🇷",
    region: "europe",
    heroKeyword: "Paris Eiffel Tower romantic sunset",
    taglineEn: "The City of Light — romance, art, and culinary perfection",
    taglineAr: "مدينة النور — رومانسية وفن وكمال ذوق",
    descriptionEn: "Paris is the most visited city on earth for good reason. The Eiffel Tower, the Louvre, Montmartre, the Seine — Paris is a masterpiece at every turn. For art lovers, romantics, and food enthusiasts, there is simply nowhere else like it.",
    descriptionAr: "باريس هي الأكثر زيارة في العالم لسبب وجيه. برج إيفل واللوفر ومونمارتر ونهر السين — باريس تحفة فنية في كل زاوية. لمحبي الفن والرومانسية والطعام، لا مكان مثلها.",
    budgetPerDay: { budget: 85, mid: 180, luxury: 450 },
    currency: "EUR",
    bestMonths: [4, 5, 6, 9, 10],
    climate: {
      en: "Temperate climate. Spring (April–June) is magical with blooming gardens. Summer is warm (25–30°C). Autumn is beautiful. Winter is cold and grey but the Christmas markets are worth it.",
      ar: "مناخ معتدل. الربيع (أبريل–يونيو) ساحر مع تفتح الحدائق. الصيف دافئ (25-30°م). الخريف رائع. الشتاء بارد وغائم.",
    },
    visaFree: ["US", "UK", "AU", "CA", "NZ", "JP"],
    visaOnArrival: [],
    eVisa: false,
    visaNotes: {
      en: "Schengen Visa required for GCC nationals and most non-Western passports. Apply 3+ months ahead. Must show hotel bookings, return flights, and bank statements.",
      ar: "تأشيرة شنغن مطلوبة لمواطني دول الخليج ومعظم جوازات السفر. التقدم قبل 3+ أشهر. يجب إثبات حجوزات الفندق والرحلات والكشوف البنكية.",
    },
    clothing: {
      en: "French style — smart casual always works. Pack layers for spring/autumn. Comfortable shoes for cobblestones. Avoid looking like a tourist for a better experience.",
      ar: "الأسلوب الفرنسي — الأناقة غير الرسمية دائماً تعمل. ملابس طبقية للربيع والخريف. حذاء مريح على أرضيات الحجارة.",
    },
    neighborhoods: [
      { name: "Le Marais", nameAr: "لو ماريه", type: "trendy & historic" },
      { name: "Montmartre", nameAr: "مونمارتر", type: "artistic" },
      { name: "Saint-Germain-des-Prés", nameAr: "سان جيرمان دي بري", type: "literary" },
      { name: "Champs-Élysées", nameAr: "الشانزليزيه", type: "iconic" },
      { name: "Latin Quarter", nameAr: "الحي اللاتيني", type: "student" },
    ],
    activities: [
      { en: "Eiffel Tower (book tickets online!)", ar: "برج إيفل (احجز مسبقاً!)", icon: "🗼" },
      { en: "The Louvre Museum", ar: "متحف اللوفر", icon: "🎨" },
      { en: "Seine River cruise", ar: "رحلة نهرية على السين", icon: "🚤" },
      { en: "Versailles Palace & Gardens", ar: "قصر فرساي وحدائقه", icon: "🏰" },
      { en: "Montmartre & Sacré-Cœur", ar: "مونمارتر وقدس الأقداس", icon: "⛪" },
      { en: "Parisian café culture", ar: "ثقافة المقاهي الباريسية", icon: "☕" },
    ],
    hotelCategories: [
      { slug: "palace", en: "Palace & Grand Hotels", ar: "فنادق القصر الكبرى" },
      { slug: "boutique", en: "Boutique Parisian Hotels", ar: "فنادق باريسية بوتيكية" },
      { slug: "central", en: "Hotels Near Eiffel Tower", ar: "فنادق قرب برج إيفل" },
      { slug: "budget", en: "Budget Hotels & Apartments", ar: "فنادق واقتصادية وشقق" },
    ],
    comparePairs: ["london", "rome", "amsterdam"],
    nearbySlug: ["london", "amsterdam", "brussels"],
    carRental: false,
    activities_partner: true,
  },
  {
    slug: "tokyo",
    nameEn: "Tokyo",
    nameAr: "طوكيو",
    country: "Japan",
    countryAr: "اليابان",
    iata: "NRT",
    flag: "🇯🇵",
    region: "asia",
    heroKeyword: "Tokyo skyline Mount Fuji cherry blossom",
    taglineEn: "The future-city that never forgot its past",
    taglineAr: "مدينة المستقبل التي لم تنسَ ماضيها",
    descriptionEn: "Tokyo is unlike any other city on earth — a place where ancient temples stand next to glittering skyscrapers, where the world's best cuisine hides in tiny basement restaurants, and where every neighbourhood tells a different story. The safest, cleanest, most punctual city in the world.",
    descriptionAr: "طوكيو مدينة لا تشبه أي مدينة أخرى على وجه الأرض — حيث تجاور المعابد القديمة ناطحات السحاب المتألقة، وأفضل مطبخ في العالم يختبئ في مطاعم صغيرة، وكل حي يحكي قصة مختلفة.",
    budgetPerDay: { budget: 70, mid: 160, luxury: 400 },
    currency: "JPY",
    bestMonths: [3, 4, 10, 11],
    climate: {
      en: "Four distinct seasons. Cherry blossom season (late March–April) is legendary. Autumn foliage (October–November) is spectacular. Summer is hot and humid. Winter is mild but cold.",
      ar: "أربعة فصول واضحة. موسم أزهار الكرز (أواخر مارس–أبريل) أسطوري. ألوان الخريف (أكتوبر–نوفمبر) رائعة. الصيف حار ورطب.",
    },
    visaFree: ["US", "UK", "EU", "AU", "CA", "SG", "KR", "MY"],
    visaOnArrival: [],
    eVisa: true,
    visaNotes: {
      en: "GCC nationals require a Japan visa — apply through Japanese embassy. Tourist visa valid 90 days. Requirements: invitation or hotel bookings, bank statements, return flights.",
      ar: "مواطنو دول الخليج يحتاجون تأشيرة اليابان — التقديم عبر السفارة اليابانية. التأشيرة السياحية صالحة 90 يوماً. المطلوب: حجوزات فندق وكشوف بنكية ورحلة عودة.",
    },
    clothing: {
      en: "Layered clothing for all seasons. Comfortable walking shoes — expect 15,000+ steps daily. Cherry blossom season: light layers. Summer: lightweight breathable. Winter: warm coat.",
      ar: "ملابس طبقية لجميع الفصول. حذاء مريح — توقع 15,000+ خطوة يومياً. موسم الكرز: طبقات خفيفة. الصيف: خفيف ومتنفس. الشتاء: معطف دافئ.",
    },
    neighborhoods: [
      { name: "Shinjuku", nameAr: "شينجوكو", type: "entertainment" },
      { name: "Shibuya", nameAr: "شيبويا", type: "shopping & youth" },
      { name: "Asakusa", nameAr: "أساكوسا", type: "traditional" },
      { name: "Akihabara", nameAr: "أكيهابارا", type: "tech & anime" },
      { name: "Ginza", nameAr: "غينزا", type: "luxury shopping" },
    ],
    activities: [
      { en: "Shibuya Crossing & surrounds", ar: "تقاطع شيبويا وما حوله", icon: "🚦" },
      { en: "Senso-ji Temple in Asakusa", ar: "معبد سينسوجي في أساكوسا", icon: "⛩️" },
      { en: "Tsukiji Outer Market food tour", ar: "جولة طعام في سوق تسوكيجي", icon: "🍣" },
      { en: "teamLab Borderless digital art", ar: "فن تيم لاب الرقمي", icon: "🎨" },
      { en: "Day trip to Mount Fuji & Hakone", ar: "رحلة يوم لجبل فوجي وهاكوني", icon: "🗻" },
      { en: "Tokyo Skytree observation deck", ar: "برج طوكيو السماوي", icon: "🗼" },
    ],
    hotelCategories: [
      { slug: "luxury", en: "Luxury Tokyo Hotels", ar: "فنادق طوكيو الفاخرة" },
      { slug: "capsule", en: "Capsule & Boutique Hotels", ar: "فنادق الكبسولة والبوتيكية" },
      { slug: "central", en: "Shinjuku & Shibuya Hotels", ar: "فنادق شينجوكو وشيبويا" },
      { slug: "budget", en: "Budget Hotels & Guesthouses", ar: "فنادق اقتصادية وبيوت الضيافة" },
    ],
    comparePairs: ["singapore", "seoul", "bangkok"],
    nearbySlug: ["osaka", "kyoto", "seoul"],
    carRental: false,
    activities_partner: true,
  },
  {
    slug: "maldives",
    nameEn: "Maldives",
    nameAr: "المالديف",
    country: "Maldives",
    countryAr: "جمهورية المالديف",
    iata: "MLE",
    flag: "🇲🇻",
    region: "asia",
    heroKeyword: "Maldives overwater bungalow crystal water",
    taglineEn: "Paradise on Earth — overwater villas and infinite ocean",
    taglineAr: "الفردوس على الأرض — فيلات فوق الماء وأفق لا ينتهي",
    descriptionEn: "The Maldives is the world's ultimate luxury escape — 1,200 coral islands scattered across the Indian Ocean, each offering crystalline waters, powder-white beaches, and the most exclusive overwater villas on the planet. A bucket-list destination that lives up to every photograph.",
    descriptionAr: "المالديف هي وجهة الرفاهية القصوى في العالم — 1200 جزيرة مرجانية متناثرة عبر المحيط الهندي، تقدم مياهاً كريستالية وشواطئ بيضاء ناصعة وأكثر الفيلات المائية تميزاً على وجه الأرض.",
    budgetPerDay: { budget: 150, mid: 400, luxury: 1200 },
    currency: "USD",
    bestMonths: [11, 12, 1, 2, 3, 4],
    climate: {
      en: "Tropical climate. Dry season (November–April) is peak — sunny, calm seas. Wet season (May–October) brings some rain but great diving conditions. Warm year-round (27–30°C).",
      ar: "مناخ مداري. الموسم الجاف (نوفمبر–أبريل) هو ذروة السياحة — مشمس وبحر هادئ. الموسم الممطر أسعار أقل وغوص ممتاز.",
    },
    visaFree: [],
    visaOnArrival: ["ALL"],
    eVisa: false,
    visaNotes: {
      en: "All nationalities get a free 30-day visa on arrival — simply show your resort booking and return flight. No pre-approval needed. Easy and hassle-free.",
      ar: "جميع الجنسيات تحصل على تأشيرة مجانية عند الوصول لمدة 30 يوماً — فقط أبرز حجز المنتجع وتذكرة العودة. بدون موافقة مسبقة.",
    },
    clothing: {
      en: "Light tropical wear. Swimwear at the resort. Modest dress in Malé and local inhabited islands. Reef shoes useful for snorkelling.",
      ar: "ملابس استوائية خفيفة. ملابس بحر في المنتجع. ملابس محتشمة في ماليه والجزر المأهولة. أحذية الشعاب المرجانية مفيدة.",
    },
    neighborhoods: [
      { name: "North Malé Atoll", nameAr: "أتول مالي الشمالي", type: "resorts" },
      { name: "South Malé Atoll", nameAr: "أتول مالي الجنوبي", type: "budget resorts" },
      { name: "Baa Atoll", nameAr: "أتول باا", type: "whale shark diving" },
      { name: "Malé City", nameAr: "مدينة ماليه", type: "budget base" },
    ],
    activities: [
      { en: "Overwater bungalow experience", ar: "تجربة الجناح المائي", icon: "🌊" },
      { en: "Snorkelling with manta rays", ar: "الغطس مع الأفاعي المرجانية", icon: "🐠" },
      { en: "Scuba diving in coral reefs", ar: "الغوص في الشعاب المرجانية", icon: "🤿" },
      { en: "Dolphin-watching sunset cruise", ar: "رحلة مشاهدة الدلافين عند الغروب", icon: "🐬" },
      { en: "Private beach dining", ar: "العشاء على الشاطئ الخاص", icon: "🍽️" },
      { en: "Seaplane transfers & views", ar: "نقل بالطائرة البحرية", icon: "✈️" },
    ],
    hotelCategories: [
      { slug: "overwater", en: "Overwater Villas", ar: "فيلات فوق الماء" },
      { slug: "luxury", en: "Luxury Resorts", ar: "منتجعات فاخرة" },
      { slug: "budget", en: "Guesthouses & Budget Resorts", ar: "بيوت ضيافة ومنتجعات اقتصادية" },
      { slug: "dive", en: "Dive Resort Packages", ar: "باقات منتجع الغوص" },
    ],
    comparePairs: ["bali", "seychelles", "mauritius"],
    nearbySlug: ["dubai", "singapore"],
    carRental: false,
    activities_partner: true,
  },
  {
    slug: "bangkok",
    nameEn: "Bangkok",
    nameAr: "بانكوك",
    country: "Thailand",
    countryAr: "تايلاند",
    iata: "BKK",
    flag: "🇹🇭",
    region: "asia",
    heroKeyword: "Bangkok temple Grand Palace Thailand",
    taglineEn: "City of Angels — temples, street food, and boundless energy",
    taglineAr: "مدينة الملائكة — معابد وأكل شعبي وطاقة لا حدود لها",
    descriptionEn: "Bangkok is Southeast Asia's most electrifying city — a nonstop assault of golden temples, floating markets, Michelin-starred street food, and rooftop bars. Chaotic, beautiful, and impossibly affordable, Bangkok draws travellers back again and again.",
    descriptionAr: "بانكوك هي أكثر مدن جنوب شرق آسيا إثارة — معابد ذهبية وأسواق عائمة وأكل شعبي حائز على نجوم ميشلان وحانات على الأسطح. فوضوية وجميلة وبأسعار لا تصدق.",
    budgetPerDay: { budget: 35, mid: 90, luxury: 250 },
    currency: "THB",
    bestMonths: [11, 12, 1, 2, 3],
    climate: {
      en: "Tropical monsoon climate. Cool season (November–February) is ideal — lower humidity, temperatures 25–30°C. Hot season (March–May) up to 40°C. Rainy season (June–October).",
      ar: "مناخ رطب استوائي. الموسم البارد (نوفمبر–فبراير) مثالي — رطوبة أقل، 25-30°م. موسم الحر (مارس–مايو) حتى 40°م.",
    },
    visaFree: ["US", "UK", "EU", "AU", "JP", "SG"],
    visaOnArrival: ["IN", "CN", "RU", "SA", "AE", "KW", "QA", "BH", "OM"],
    eVisa: true,
    visaNotes: {
      en: "GCC nationals get 30-day Visa on Arrival (no fee recently). Most Western passports get 30 days visa-free. Thailand E-Visa also available for longer stays.",
      ar: "مواطنو دول الخليج يحصلون على تأشيرة عند الوصول لمدة 30 يوماً. معظم الجوازات الغربية: 30 يوماً مجاناً. تأشيرة إلكترونية متاحة للإقامة الأطول.",
    },
    clothing: {
      en: "Very lightweight tropical clothes. Cover shoulders and knees for temple visits (sarongs available). Flip-flops essential. Sunscreen is a must.",
      ar: "ملابس استوائية خفيفة جداً. تغطية للمعابد (سارونج متاح). شبشب ضروري. واقي الشمس أساسي.",
    },
    neighborhoods: [
      { name: "Sukhumvit", nameAr: "سوكومفيت", type: "expat & nightlife" },
      { name: "Old City & Rattanakosin", nameAr: "المدينة القديمة", type: "temples" },
      { name: "Silom", nameAr: "سيلوم", type: "business & entertainment" },
      { name: "Chatuchak", nameAr: "تشاتوشاك", type: "weekend market" },
    ],
    activities: [
      { en: "Grand Palace & Wat Phra Kaew", ar: "القصر الكبير ومعبد بوذا الزمردي", icon: "🏛️" },
      { en: "Floating markets (Damnoen Saduak)", ar: "الأسواق العائمة", icon: "🛶" },
      { en: "Street food tour on Yaowarat", ar: "جولة أكل شعبي في يواورات", icon: "🍜" },
      { en: "Rooftop bar experience", ar: "تجربة البار على السطح", icon: "🌆" },
      { en: "Day trip to Ayutthaya temples", ar: "رحلة يوم إلى معابد أيوتايا", icon: "⛩️" },
      { en: "Muay Thai match", ar: "مباراة موي تاي", icon: "🥊" },
    ],
    hotelCategories: [
      { slug: "luxury", en: "5-Star Luxury Hotels", ar: "فنادق فاخرة 5 نجوم" },
      { slug: "boutique", en: "Boutique & Design Hotels", ar: "فنادق بوتيكية وتصميمية" },
      { slug: "budget", en: "Budget Hotels & Hostels", ar: "فنادق اقتصادية ونزل" },
      { slug: "serviced", en: "Serviced Apartments", ar: "شقق مفروشة" },
    ],
    comparePairs: ["singapore", "kuala-lumpur", "bali"],
    nearbySlug: ["bali", "singapore", "kuala-lumpur"],
    carRental: true,
    activities_partner: true,
  },
  {
    slug: "singapore",
    nameEn: "Singapore",
    nameAr: "سنغافورة",
    country: "Singapore",
    countryAr: "سنغافورة",
    iata: "SIN",
    flag: "🇸🇬",
    region: "asia",
    heroKeyword: "Singapore Marina Bay Sands Gardens by the Bay",
    taglineEn: "The city that works — impeccably clean, effortlessly modern",
    taglineAr: "المدينة التي تعمل — نظيفة بشكل لا يُصدق وحديثة بسهولة",
    descriptionEn: "Singapore punches far above its size. A tiny island that has built the world's best airport, some of its greatest hotels, and a food culture that rivals any capital city. The gateway to Southeast Asia and a destination worthy of its own trip.",
    descriptionAr: "سنغافورة تتجاوز حجمها بكثير. جزيرة صغيرة بنت أفضل مطار في العالم وبعضاً من أعظم فنادقه وثقافة طعام تنافس أي عاصمة في العالم.",
    budgetPerDay: { budget: 80, mid: 180, luxury: 500 },
    currency: "SGD",
    bestMonths: [2, 3, 4, 6, 7, 8],
    climate: {
      en: "Consistently warm and humid year-round (27–33°C). Brief afternoon showers are normal. No true dry season, but February–April tends to be drier.",
      ar: "دافئ ورطب طوال العام (27-33°م). أمطار قصيرة بعد الظهر طبيعية. فبراير–أبريل يكون الأجف نسبياً.",
    },
    visaFree: ["US", "UK", "EU", "AU", "CA", "NZ", "JP", "KR"],
    visaOnArrival: ["IN", "SA", "AE", "CN"],
    eVisa: false,
    visaNotes: {
      en: "GCC nationals and most Arab passport holders get 30-day visa on arrival — free of charge. Extremely easy entry.",
      ar: "مواطنو دول الخليج ومعظم حاملي الجوازات العربية يحصلون على تأشيرة عند الوصول مجاناً لمدة 30 يوماً. دخول سهل جداً.",
    },
    clothing: {
      en: "Lightweight breathable clothing at all times. Light jacket for air-conditioned malls and restaurants (they're extremely cold inside!). Comfortable walking shoes.",
      ar: "ملابس خفيفة ومتنفسة دائماً. جاكيت خفيف لمراكز التسوق والمطاعم (باردة جداً!). حذاء مريح للمشي.",
    },
    neighborhoods: [
      { name: "Marina Bay", nameAr: "مارينا باي", type: "iconic" },
      { name: "Orchard Road", nameAr: "شارع أورشارد", type: "shopping" },
      { name: "Chinatown", nameAr: "الحي الصيني", type: "cultural" },
      { name: "Little India", nameAr: "الهند الصغيرة", type: "cultural" },
      { name: "Sentosa Island", nameAr: "جزيرة سينتوزا", type: "resort & theme parks" },
    ],
    activities: [
      { en: "Marina Bay Sands & SkyPark", ar: "مارينا باي ساندز وحديقة السماء", icon: "🏙️" },
      { en: "Gardens by the Bay", ar: "حدائق خليج مارينا", icon: "🌿" },
      { en: "Hawker centre food tour", ar: "جولة مراكز الطعام الشعبية", icon: "🍢" },
      { en: "Universal Studios Singapore", ar: "يونيفرسال ستوديوز سنغافورة", icon: "🎢" },
      { en: "Night Safari", ar: "السفاري الليلي", icon: "🦁" },
      { en: "Clarke Quay & river cruise", ar: "كلارك كيه والرحلة النهرية", icon: "⛵" },
    ],
    hotelCategories: [
      { slug: "luxury", en: "Marina Bay Luxury Hotels", ar: "فنادق مارينا باي الفاخرة" },
      { slug: "boutique", en: "Boutique Heritage Hotels", ar: "فنادق التراث البوتيكية" },
      { slug: "central", en: "Orchard & Central Hotels", ar: "فنادق أورشارد والوسط" },
      { slug: "budget", en: "Budget Hotels & Hostels", ar: "فنادق اقتصادية ونزل" },
    ],
    comparePairs: ["kuala-lumpur", "bangkok", "hong-kong"],
    nearbySlug: ["kuala-lumpur", "bali", "bangkok"],
    carRental: false,
    activities_partner: true,
  },
  {
    slug: "marrakech",
    nameEn: "Marrakech",
    nameAr: "مراكش",
    country: "Morocco",
    countryAr: "المغرب",
    iata: "RAK",
    flag: "🇲🇦",
    region: "africa",
    heroKeyword: "Marrakech medina souks Morocco red city",
    taglineEn: "The Red City — ancient medinas, rooftop riads, and Saharan magic",
    taglineAr: "المدينة الحمراء — مدينة قديمة وريادات فوق الأسطح وسحر الصحراء",
    descriptionEn: "Marrakech is a feast for every sense — the world's most vibrant medina, labyrinthine souks filled with spices and crafts, stunning riad guesthouses, and the legendary Jemaa el-Fnaa square. The perfect gateway to North Africa and the Sahara.",
    descriptionAr: "مراكش مهرجان لكل الحواس — أكثر المدينات القديمة في العالم حيوية، وأسواق متعرجة مليئة بالتوابل والحرف اليدوية، وريادات خلابة، وساحة جامعة الفنا الأسطورية.",
    budgetPerDay: { budget: 40, mid: 100, luxury: 300 },
    currency: "MAD",
    bestMonths: [3, 4, 10, 11, 12],
    climate: {
      en: "Semi-arid climate. Spring (March–May) and Autumn (September–November) are ideal — 20–28°C. Summer gets extremely hot (40°C+). Winter is mild but cool at night.",
      ar: "مناخ شبه جاف. الربيع (مارس–مايو) والخريف (سبتمبر–نوفمبر) مثاليان — 20-28°م. الصيف حار جداً (40°م+).",
    },
    visaFree: ["US", "UK", "EU", "AU", "CA", "SG", "JP", "AE", "SA", "KW", "QA", "BH", "OM"],
    visaOnArrival: [],
    eVisa: false,
    visaNotes: {
      en: "GCC nationals and most Arab passport holders enter visa-free for 90 days. Western passports also mostly visa-free. One of the easiest destinations to access.",
      ar: "مواطنو دول الخليج ومعظم حاملي الجوازات العربية يدخلون بدون تأشيرة لمدة 90 يوماً. من أسهل الوجهات في العالم.",
    },
    clothing: {
      en: "Modest clothing recommended — covering shoulders and knees. Long, loose layers are comfortable and respectful. Light linen is perfect. Warm layer for evenings in winter.",
      ar: "ملابس محتشمة موصى بها — تغطية الأكتاف والركبتين. طبقات رفيعة وفضفاضة مريحة ومحترمة. كتان خفيف مثالي.",
    },
    neighborhoods: [
      { name: "Medina (Old City)", nameAr: "المدينة القديمة", type: "historic" },
      { name: "Djemaa el-Fnaa", nameAr: "جامعة الفنا", type: "iconic square" },
      { name: "Guéliz (New City)", nameAr: "غيليز", type: "modern" },
      { name: "Palmeraie", nameAr: "بالمريه", type: "luxury resort" },
    ],
    activities: [
      { en: "Jemaa el-Fnaa square at night", ar: "ساحة جامعة الفنا ليلاً", icon: "🎪" },
      { en: "Medina souks & souvenirs", ar: "أسواق المدينة والتذكارات", icon: "🧶" },
      { en: "Majorelle Garden", ar: "حديقة ماجوريل", icon: "🌺" },
      { en: "Sahara Desert day trip or overnight", ar: "رحلة الصحراء يوم أو ليلة", icon: "🐪" },
      { en: "Traditional hammam experience", ar: "تجربة الحمام التقليدي المغربي", icon: "♨️" },
      { en: "Bahia Palace & El Badi ruins", ar: "قصر الباهية وأطلال البديع", icon: "🏛️" },
    ],
    hotelCategories: [
      { slug: "riad", en: "Traditional Riads", ar: "الريادات التقليدية" },
      { slug: "luxury", en: "Luxury Palaces & Resorts", ar: "القصور والمنتجعات الفاخرة" },
      { slug: "medina", en: "Medina Boutique Hotels", ar: "فنادق المدينة البوتيكية" },
      { slug: "budget", en: "Budget Guesthouses", ar: "بيوت الضيافة الاقتصادية" },
    ],
    comparePairs: ["dubai", "istanbul", "casablanca"],
    nearbySlug: ["casablanca", "fez", "agadir"],
    carRental: true,
    activities_partner: true,
  },
  {
    slug: "doha",
    nameEn: "Doha",
    nameAr: "الدوحة",
    country: "Qatar",
    countryAr: "قطر",
    iata: "DOH",
    flag: "🇶🇦",
    region: "middleeast",
    heroKeyword: "Doha Qatar skyline corniche",
    taglineEn: "The Gulf's cultural capital — museums, souqs, and world-class hospitality",
    taglineAr: "العاصمة الثقافية للخليج — متاحف وأسواق وضيافة عالمية",
    descriptionEn: "Doha has transformed itself from a fishing village into a world-class city in a generation. Home to the National Museum of Qatar, the iconic Museum of Islamic Art, and Souq Waqif, Doha combines Arab authenticity with modern luxury.",
    descriptionAr: "الدوحة تحولت من قرية صيد إلى مدينة عالمية في جيل واحد. تضم المتحف الوطني لقطر ومتحف الفن الإسلامي الأيقوني وسوق واقف، تجمع الدوحة الأصالة العربية مع الرفاهية الحديثة.",
    budgetPerDay: { budget: 70, mid: 160, luxury: 450 },
    currency: "QAR",
    bestMonths: [10, 11, 12, 1, 2, 3],
    climate: {
      en: "Desert climate similar to Dubai. Very hot summers (42°C+). Perfect mild winters (18–25°C). Best visited October–April.",
      ar: "مناخ صحراوي مشابه لدبي. صيف شديد الحر (42°م+). شتاء معتدل مثالي (18-25°م). أفضل زيارة أكتوبر–أبريل.",
    },
    visaFree: ["US", "UK", "EU", "AU", "CA"],
    visaOnArrival: ["IN", "PH"],
    eVisa: true,
    visaNotes: {
      en: "GCC nationals enter visa-free. Most Western passports and many others get visa-free or e-Hayya e-Visa. Very easy entry for most nationalities.",
      ar: "مواطنو دول الخليج يدخلون بدون تأشيرة. معظم الجنسيات الغربية وكثير غيرها تحصل على دخول مجاني أو تأشيرة إلكترونية.",
    },
    clothing: {
      en: "Modest clothing recommended in public areas, souqs, and traditional areas. Beach resorts more relaxed. Lightweight fabrics essential.",
      ar: "ملابس محتشمة موصى بها في الأماكن العامة والأسواق. منتجعات الشاطئ أكثر مرونة. أقمشة خفيفة ضرورية.",
    },
    neighborhoods: [
      { name: "West Bay", nameAr: "الخليج الغربي", type: "business & luxury" },
      { name: "Souq Waqif", nameAr: "سوق واقف", type: "heritage" },
      { name: "The Pearl", nameAr: "اللؤلؤة", type: "lifestyle" },
      { name: "Lusail", nameAr: "لوسيل", type: "new city" },
    ],
    activities: [
      { en: "Museum of Islamic Art", ar: "متحف الفن الإسلامي", icon: "🏛️" },
      { en: "Souq Waqif & falconry", ar: "سوق واقف والصقارة", icon: "🦅" },
      { en: "The Pearl & Porto Arabia", ar: "اللؤلؤة وبورتو أرابيا", icon: "⚓" },
      { en: "Lusail Stadium visit", ar: "زيارة ملعب لوسيل", icon: "🏟️" },
      { en: "National Museum of Qatar", ar: "المتحف الوطني القطري", icon: "🎭" },
      { en: "Desert dunes & camel riding", ar: "الرمال والجمال", icon: "🐫" },
    ],
    hotelCategories: [
      { slug: "luxury", en: "Luxury 5-Star Hotels", ar: "فنادق فاخرة 5 نجوم" },
      { slug: "business", en: "Business Hotels", ar: "فنادق الأعمال" },
      { slug: "resort", en: "Beach & Resort Hotels", ar: "فنادق المنتجع والشاطئ" },
      { slug: "budget", en: "Mid-Range & Budget", ar: "فنادق متوسطة واقتصادية" },
    ],
    comparePairs: ["dubai", "abu-dhabi", "bahrain"],
    nearbySlug: ["dubai", "abu-dhabi", "bahrain"],
    carRental: true,
    activities_partner: false,
  },
  {
    slug: "tbilisi",
    nameEn: "Tbilisi",
    nameAr: "تبليسي",
    country: "Georgia",
    countryAr: "جورجيا",
    iata: "TBS",
    flag: "🇬🇪",
    region: "europe",
    heroKeyword: "Tbilisi Georgia old town church fortress",
    taglineEn: "Europe's best-kept secret — ancient churches, sulphur baths, and incredible wine",
    taglineAr: "أفضل سر في أوروبا — كنائس عريقة وحمامات كبريتية وخمور لا تُصدق",
    descriptionEn: "Tbilisi is the most underrated city in the world. Perched between the Caucasus mountains, this 1,500-year-old city offers breathtaking architecture, legendary hospitality, the world's oldest wine tradition, and one of the most walkable old towns anywhere — all at budget-friendly prices.",
    descriptionAr: "تبليسي هي أكثر مدن العالم التي لا تحظى بما تستحق. هذه المدينة التي يمتد عمرها 1500 عام بين جبال القوقاز تقدم معمار خلاب وضيافة أسطورية وتقاليد النبيذ الأقدم في العالم وواحدة من أجمل المدن القديمة للمشي — بأسعار اقتصادية.",
    budgetPerDay: { budget: 30, mid: 70, luxury: 180 },
    currency: "GEL",
    bestMonths: [4, 5, 6, 9, 10],
    climate: {
      en: "Continental climate. Spring (April–June) and Autumn (Sept–Oct) are ideal. Summers warm (30°C). Winters cold with occasional snow. Mountain areas much colder.",
      ar: "مناخ قاري. الربيع (أبريل–يونيو) والخريف (سبتمبر–أكتوبر) مثاليان. الصيف دافئ (30°م). الشتاء بارد مع ثلوج أحياناً.",
    },
    visaFree: ["US", "UK", "EU", "AU", "CA", "SA", "AE", "KW", "QA", "BH", "OM"],
    visaOnArrival: [],
    eVisa: true,
    visaNotes: {
      en: "GCC nationals and most Arab passport holders enter Georgia visa-free for 1 year. Incredible visa policy — one of the most welcoming countries in the world.",
      ar: "مواطنو دول الخليج ومعظم حاملي الجوازات العربية يدخلون جورجيا بدون تأشيرة لمدة سنة كاملة. سياسة تأشيرة استثنائية.",
    },
    clothing: {
      en: "Layered clothing for spring/autumn. Light summer wear June–August. Warm clothing for mountain excursions. Church visits require covered shoulders and knees.",
      ar: "ملابس طبقية للربيع والخريف. خفيفة في الصيف. دافئة لرحلات الجبل. تغطية الأكتاف والركبتين للكنائس.",
    },
    neighborhoods: [
      { name: "Old Town (Abanotubani)", nameAr: "المدينة القديمة", type: "historic" },
      { name: "Rustaveli Avenue", nameAr: "شارع روستافيلي", type: "main street" },
      { name: "Marjanishvili", nameAr: "مارجانيشفيلي", type: "local & trendy" },
      { name: "Fabrika", nameAr: "فابريكا", type: "creative hub" },
    ],
    activities: [
      { en: "Narikala Fortress & Old Town", ar: "قلعة ناريكالا والمدينة القديمة", icon: "🏰" },
      { en: "Sulphur baths experience", ar: "تجربة الحمامات الكبريتية", icon: "♨️" },
      { en: "Wine tasting & Kakheti day trip", ar: "تذوق النبيذ ورحلة يوم لكاخيتي", icon: "🍷" },
      { en: "Kazbegi mountain day trip", ar: "رحلة يوم إلى جبال كازبيغي", icon: "🏔️" },
      { en: "Shio-Mgvime monastery hike", ar: "رحلة مشي لدير شيو-مغفيمي", icon: "⛪" },
      { en: "Fabrika & Marjanishvili nightlife", ar: "حياة ليلية في فابريكا", icon: "🎶" },
    ],
    hotelCategories: [
      { slug: "boutique", en: "Old Town Boutique Hotels", ar: "فنادق المدينة القديمة البوتيكية" },
      { slug: "luxury", en: "Luxury Hotels & Spa", ar: "فنادق فاخرة وسبا" },
      { slug: "budget", en: "Budget Hotels & Hostels", ar: "فنادق اقتصادية ونزل" },
      { slug: "apartment", en: "Serviced Apartments", ar: "شقق مفروشة" },
    ],
    comparePairs: ["baku", "istanbul", "dubai"],
    nearbySlug: ["baku", "yerevan"],
    carRental: true,
    activities_partner: true,
  },
];

/** All slugs for static params generation */
export const DESTINATION_SLUGS = DESTINATIONS.map((d) => d.slug);

/** Look up a destination by slug */
export function getDestination(slug: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.slug === slug);
}

/** Get multiple destinations by slugs */
export function getDestinations(slugs: string[]): Destination[] {
  return slugs
    .map((s) => getDestination(s))
    .filter((d): d is Destination => d !== undefined);
}

/** Get all destinations in a region */
export function getByRegion(region: Destination["region"]): Destination[] {
  return DESTINATIONS.filter((d) => d.region === region);
}

/** Top destinations for homepage and sitemap */
export const TOP_DESTINATIONS = DESTINATIONS.slice(0, 10);

/** Season labels */
export const MONTH_NAMES_EN = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
export const MONTH_NAMES_AR = [
  "يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
  "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر",
];

/** Format best months for display */
export function formatBestMonths(months: number[], locale: "en" | "ar"): string {
  const names = locale === "ar" ? MONTH_NAMES_AR : MONTH_NAMES_EN;
  return months.map((m) => names[m - 1]).join(locale === "ar" ? "، " : ", ");
}

/** Comparison page data */
export type ComparisonPage = {
  slug: string;
  destA: string; // destination slug
  destB: string;
  intentEn: string;
  intentAr: string;
};

export const COMPARISON_PAGES: ComparisonPage[] = [
  {
    slug: "istanbul-vs-antalya",
    destA: "istanbul",
    destB: "antalya",
    intentEn: "Istanbul vs Antalya — which is better for your trip?",
    intentAr: "إسطنبول أم أنطاليا — أيهما أفضل لرحلتك؟",
  },
  {
    slug: "dubai-vs-doha",
    destA: "dubai",
    destB: "doha",
    intentEn: "Dubai vs Doha — which Gulf city should you visit?",
    intentAr: "دبي أم الدوحة — أي مدينة خليجية تختار؟",
  },
  {
    slug: "bali-vs-maldives",
    destA: "bali",
    destB: "maldives",
    intentEn: "Bali vs Maldives — the ultimate beach holiday showdown",
    intentAr: "بالي أم المالديف — المعركة الكبرى لأفضل عطلة شاطئية",
  },
  {
    slug: "london-vs-paris",
    destA: "london",
    destB: "paris",
    intentEn: "London vs Paris — Europe's greatest rivalry",
    intentAr: "لندن أم باريس — أعظم تنافس في أوروبا",
  },
  {
    slug: "bangkok-vs-singapore",
    destA: "bangkok",
    destB: "singapore",
    intentEn: "Bangkok vs Singapore — Southeast Asia's top two",
    intentAr: "بانكوك أم سنغافورة — أفضل مدينتين في جنوب شرق آسيا",
  },
  {
    slug: "istanbul-vs-marrakech",
    destA: "istanbul",
    destB: "marrakech",
    intentEn: "Istanbul vs Marrakech — historic souks and culture face off",
    intentAr: "إسطنبول أم مراكش — تنافس التاريخ والثقافة والأسواق",
  },
  {
    slug: "dubai-vs-istanbul",
    destA: "dubai",
    destB: "istanbul",
    intentEn: "Dubai vs Istanbul — luxury modern vs historic splendour",
    intentAr: "دبي أم إسطنبول — الرفاهية الحديثة مقابل الروعة التاريخية",
  },
];

/** Budget pages */
export type BudgetPage = {
  slug: string;
  destination: string; // slug
  budgetUsd: number;
  durationDays: number;
};

export const BUDGET_PAGES: BudgetPage[] = [
  { slug: "dubai-1000-usd-5-days", destination: "dubai", budgetUsd: 1000, durationDays: 5 },
  { slug: "istanbul-700-usd-7-days", destination: "istanbul", budgetUsd: 700, durationDays: 7 },
  { slug: "bali-800-usd-10-days", destination: "bali", budgetUsd: 800, durationDays: 10 },
  { slug: "bangkok-500-usd-7-days", destination: "bangkok", budgetUsd: 500, durationDays: 7 },
  { slug: "london-1500-usd-5-days", destination: "london", budgetUsd: 1500, durationDays: 5 },
  { slug: "paris-1200-usd-5-days", destination: "paris", budgetUsd: 1200, durationDays: 5 },
  { slug: "tokyo-2000-usd-7-days", destination: "tokyo", budgetUsd: 2000, durationDays: 7 },
  { slug: "maldives-3000-usd-5-days", destination: "maldives", budgetUsd: 3000, durationDays: 5 },
  { slug: "antalya-600-usd-7-days", destination: "antalya", budgetUsd: 600, durationDays: 7 },
  { slug: "marrakech-600-usd-5-days", destination: "marrakech", budgetUsd: 600, durationDays: 5 },
  { slug: "singapore-1000-usd-5-days", destination: "singapore", budgetUsd: 1000, durationDays: 5 },
  { slug: "tbilisi-400-usd-7-days", destination: "tbilisi", budgetUsd: 400, durationDays: 7 },
];

/** Budget verdict for a trip */
export function budgetVerdict(dest: Destination, budgetUsd: number, days: number): {
  verdict: "generous" | "comfortable" | "tight" | "impossible";
  dailyBudget: number;
  recommended: "budget" | "mid" | "luxury";
  message: { en: string; ar: string };
} {
  const daily = budgetUsd / days;
  const { budget: b, mid: m, luxury: l } = dest.budgetPerDay;

  if (daily >= l) return {
    verdict: "generous",
    dailyBudget: daily,
    recommended: "luxury",
    message: {
      en: `$${Math.round(daily)}/day is very generous for ${dest.nameEn}. You can comfortably afford luxury hotels and fine dining.`,
      ar: `${Math.round(daily)} دولار/يوم ميزانية ممتازة لـ${dest.nameAr}. يمكنك الاستمتاع بالفنادق الفاخرة والمطاعم الراقية.`,
    },
  };
  if (daily >= m) return {
    verdict: "comfortable",
    dailyBudget: daily,
    recommended: "mid",
    message: {
      en: `$${Math.round(daily)}/day is comfortable for ${dest.nameEn}. You'll enjoy good hotels and great local food.`,
      ar: `${Math.round(daily)} دولار/يوم مريح لـ${dest.nameAr}. ستستمتع بفنادق جيدة وطعام محلي رائع.`,
    },
  };
  if (daily >= b) return {
    verdict: "tight",
    dailyBudget: daily,
    recommended: "budget",
    message: {
      en: `$${Math.round(daily)}/day is tight but doable in ${dest.nameEn}. Stick to budget hotels and street food.`,
      ar: `${Math.round(daily)} دولار/يوم ضيق لكن ممكن في ${dest.nameAr}. التزم بالفنادق الاقتصادية والأكل الشعبي.`,
    },
  };
  return {
    verdict: "impossible",
    dailyBudget: daily,
    recommended: "budget",
    message: {
      en: `$${Math.round(daily)}/day is insufficient for ${dest.nameEn}. Consider extending your budget or choosing a cheaper destination.`,
      ar: `${Math.round(daily)} دولار/يوم غير كافٍ لـ${dest.nameAr}. فكر في زيادة الميزانية أو اختيار وجهة أرخص.`,
    },
  };
}
