/**
 * GoTripza Comprehensive Destination Knowledge Base
 * ═══════════════════════════════════════════════════
 * Raya's brain: 50+ destinations with expert travel intel
 * Covers: climate, visa, safety, activities, costs, seasons, culture, tips
 */

export type DestinationProfile = {
  iata: string;
  nameAr: string;
  nameEn: string;
  country_ar: string;
  country_en: string;
  description_ar: string;
  description_en: string;

  // SEASON & CLIMATE
  best_months_ar: string;
  best_months_en: string;
  worst_months_ar: string;
  worst_months_en: string;
  current_season_ar: string;
  current_season_en: string;
  weather_temp_range: string; // "15-25°C"
  weather_description_ar: string;
  weather_description_en: string;

  // VISA & DOCS
  visa_required_for_saudis: boolean;
  visa_type_ar: string; // "فيزا إلكترونية", "تأشيرة سياحية"
  visa_type_en: string; // "E-visa", "Tourist Visa"
  visa_processing_days: number;
  visa_cost_usd: number | null;
  visa_note_ar: string;
  visa_note_en: string;

  // SAFETY & CULTURE
  safety_level: "excellent" | "very good" | "good" | "moderate" | "caution";
  safety_note_ar: string;
  safety_note_en: string;
  cultural_tips_ar: string[];
  cultural_tips_en: string[];

  // MONEY
  currency: string; // "THB"
  currency_name_ar: string; // "الباط التايلاندي"
  currency_name_en: string; // "Thai Baht"
  usd_exchange_rate: number;
  cost_level: "budget" | "moderate" | "expensive";
  budget_per_day_usd: {
    budget: number;
    moderate: number;
    luxury: number;
  };

  // ACTIVITIES
  top_activities_ar: string[];
  top_activities_en: string[];

  // TIPS
  packing_tips_ar: string[];
  packing_tips_en: string[];
  local_tips_ar: string[];
  local_tips_en: string[];

  // PRACTICAL
  timezone: string; // "GMT+7"
  languages: string[];
  best_time_for: {
    honeymoon_ar: string;
    honeymoon_en: string;
    family_ar: string;
    family_en: string;
    adventure_ar: string;
    adventure_en: string;
    budget_ar: string;
    budget_en: string;
  };
};

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLE EAST & GULF
// ═══════════════════════════════════════════════════════════════════════════

export const DESTINATIONS: Record<string, DestinationProfile> = {
  // ──────────── MALDIVES ────────────
  MLE: {
    iata: "MLE",
    nameAr: "المالديف",
    nameEn: "Maldives",
    country_ar: "جمهورية جزر المالديف",
    country_en: "Republic of Maldives",
    description_ar: "جنة استوائية بمياه فيروزية وشعاب مرجانية خلابة وفيلات فوق الماء فاخرة",
    description_en: "Tropical paradise with turquoise waters, stunning coral reefs, and luxury overwater villas",

    best_months_ar: "نوفمبر إلى أبريل — موسم جاف مثالي",
    best_months_en: "November to April — perfect dry season",
    worst_months_ar: "مايو إلى أكتوبر — موسم أمطار ثقيل",
    worst_months_en: "May to October — heavy monsoon",
    current_season_ar: "الآن موسم جاف ممتاز 🌞",
    current_season_en: "Currently excellent dry season 🌞",
    weather_temp_range: "24-32°C",
    weather_description_ar: "مشمس ودافئ مع رياح خفيفة",
    weather_description_en: "Sunny and warm with gentle breeze",

    visa_required_for_saudis: false,
    visa_type_ar: "تأشيرة سياحية عند الوصول",
    visa_type_en: "Tourist Visa on Arrival",
    visa_processing_days: 0,
    visa_cost_usd: null,
    visa_note_ar: "السعوديون يحصلون على التأشيرة مباشرة عند الوصول — لا حاجة للتقديم مسبقاً",
    visa_note_en: "Saudis get visa on arrival instantly — no pre-approval needed",

    safety_level: "excellent",
    safety_note_ar: "آمنة جداً — معدل جرائم منخفض جداً وقوات أمن قوية",
    safety_note_en: "Very safe — extremely low crime rate and strong security",
    cultural_tips_ar: [
      "الملابس: البكيني والملابس الشاطئية مقبولة في الفنادق وليس في الجزر المحلية",
      "الكحول: ممنوع قانوناً لكن متوفر في الفنادق السياحية",
      "احترم الدين الإسلامي — صلاة الجمعة يوم عطلة رسمي",
      "المال: الدولار الأمريكي مقبول في كل مكان"
    ],
    cultural_tips_en: [
      "Dress: Bikinis and beach wear OK at resorts, not in local islands",
      "Alcohol: Officially prohibited but available at tourist resorts",
      "Respect Islam — Friday is public holiday for prayers",
      "USD widely accepted everywhere"
    ],

    currency: "MVR",
    currency_name_ar: "روفية المالديفية",
    currency_name_en: "Maldivian Rufiyaa",
    usd_exchange_rate: 15.5,
    cost_level: "expensive",
    budget_per_day_usd: {
      budget: 150,
      moderate: 300,
      luxury: 1000,
    },

    top_activities_ar: [
      "الغوص والسنوركلينج — أفضل الشعاب المرجانية في العالم",
      "صيد السمك الليلي بالشراع التقليدي",
      "جلسات السبا والمساج بجانب البحر",
      "رحلات اليخت والشروق والغروب",
      "استكشاف جزر محلية وحياة السكان المحلية"
    ],
    top_activities_en: [
      "Diving & snorkeling — world's best coral reefs",
      "Night fishing with traditional dhoni boats",
      "Beachside spa and massage sessions",
      "Yacht trips and sunset cruises",
      "Local island tours and village visits"
    ],

    packing_tips_ar: [
      "واقي الشمس (SPF 50+) — الشمس حارة جداً",
      "ملابس خفيفة وفضفاضة",
      "حقيبة مقاومة للماء للهاتف والمال",
      "أحذية غوص والكثير من الملابس الشاطئية",
      "أدوية للإسهال والدوار — رحلات القارب طويلة"
    ],
    packing_tips_en: [
      "Sunscreen SPF 50+ — intense sun",
      "Light, loose clothing",
      "Waterproof phone/cash pouch",
      "Diving shoes and lots of swimwear",
      "Diarrhea & motion sickness meds — long boat rides"
    ],

    local_tips_ar: [
      "نصيحة ذهب: احجز منتجعاً يتضمن جميع الوجبات (All-Inclusive) — الطعام غالي جداً خارج الفندق",
      "أفضل أنشطة الغوص في جنوب آري أتول",
      "الأسماك السامة: لا تلمس أي شيء غريب اللون تحت الماء",
      "التعرّض للأمواج الكبيرة: تجنب موسم المونسون حتى لو رخيص",
      "التكاليف المخفية: احذر من رسوم النقل والمشروبات والأنشطة الإضافية"
    ],
    local_tips_en: [
      "Gold tip: Book all-inclusive resort — food outside is very expensive",
      "Best diving in South Ari Atoll",
      "Venomous fish: Don't touch anything weird-colored underwater",
      "Strong waves: Avoid monsoon season even if cheap",
      "Hidden costs: Transport, drinks, activities add up fast"
    ],

    timezone: "GMT+5",
    languages: ["ދިވެހި (Dhivehi)", "English"],
    best_time_for: {
      honeymoon_ar: "نوفمبر–فبراير — مثالي 100% لشهر العسل (مياه صافية، طقس جميل)",
      honeymoon_en: "November–February — perfect for honeymoon (clear water, beautiful weather)",
      family_ar: "ديسمبر–يناير — إجازات المدارس مع أفضل طقس",
      family_en: "December–January — school holidays + best weather",
      adventure_ar: "مارس–أبريل — أفضل موسم للرياح وركوب الأمواج والتصفح",
      adventure_en: "March–April — best season for windsurfing and activities",
      budget_ar: "مايو–سبتمبر — أرخص الأسعار (موسم الأمطار لكن الشمس موجودة)",
      budget_en: "May–September — cheapest rates (rainy season but sun abundant)"
    }
  },

  // ──────────── DUBAI ────────────
  DXB: {
    iata: "DXB",
    nameAr: "دبي",
    nameEn: "Dubai",
    country_ar: "الإمارات العربية المتحدة",
    country_en: "United Arab Emirates",
    description_ar: "حاضرة عصرية بناطحات سحاب مذهلة وتسوق عالمي وشواطئ ذهبية وحياة ليلية راقية",
    description_en: "Modern metropolis with stunning skyscrapers, world-class shopping, golden beaches, upscale nightlife",

    best_months_ar: "نوفمبر إلى مارس — طقس معتدل مثالي",
    best_months_en: "November to March — perfect mild weather",
    worst_months_ar: "يونيو إلى أغسطس — حرارة خانقة (50°C+)",
    worst_months_en: "June to August — scorching heat (50°C+)",
    current_season_ar: "الآن موسم مثالي للتجول والتسوق 🌞",
    current_season_en: "Currently ideal for shopping and sightseeing 🌞",
    weather_temp_range: "15-40°C",
    weather_description_ar: "صافٍ ومشمس مع رياح خفيفة من البحر",
    weather_description_en: "Clear and sunny with gentle sea breeze",

    visa_required_for_saudis: false,
    visa_type_ar: "بدون فيزا للسعوديين",
    visa_type_en: "Visa-free for Saudis",
    visa_processing_days: 0,
    visa_cost_usd: null,
    visa_note_ar: "دول مجلس التعاون لا تحتاج فيزا — قط فقط الهوية الوطنية",
    visa_note_en: "GCC nationals don't need visa — national ID only",

    safety_level: "excellent",
    safety_note_ar: "آمنة جداً — أحد أأمن المدن في العالم مع قوات شرطة قوية",
    safety_note_en: "Extremely safe — one of world's safest cities with strong police",
    cultural_tips_ar: [
      "احترم العادات الإسلامية: ملابس محتشمة في الأماكن العامة والمراكز التجارية",
      "شهر رمضان: الطعام والشراب الشراني محدود في الأماكن العامة أثناء النهار",
      "التحايات: حيّ الناس بـ 'مرحبا' أو 'السلام عليكم'",
      "الكحول: متوفر لكن في أماكن محددة (الحانات والفنادق)"
    ],
    cultural_tips_en: [
      "Respect Islamic customs: modest dress in public and malls",
      "Ramadan: Limited dining during daytime in public areas",
      "Greetings: Say 'hello' or 'assalamu alaikum'",
      "Alcohol: Available but only in bars and hotels"
    ],

    currency: "AED",
    currency_name_ar: "الدرهم الإماراتي",
    currency_name_en: "UAE Dirham",
    usd_exchange_rate: 3.67,
    cost_level: "expensive",
    budget_per_day_usd: {
      budget: 80,
      moderate: 200,
      luxury: 500,
    },

    top_activities_ar: [
      "برج خليفة — أطول بناء في العالم (828 متر) مع مناظر حتى الأفق",
      "مول دبي — أضخم مول في العالم بـ 1200+ متجر",
      "الصحراء: رحلات جيب، ركوب جمال، وديان",
      "دبي مول والنافورة الراقصة",
      "شاطئ جميرا والرياضات المائية"
    ],
    top_activities_en: [
      "Burj Khalifa — world's tallest building (828m) with 360° views",
      "Dubai Mall — world's largest mall with 1200+ stores",
      "Desert: jeep safaris, camel riding, dune bashing",
      "Dubai Fountain and Museum",
      "Jumeirah Beach and water sports"
    ],

    packing_tips_ar: [
      "واقي شمس قوي جداً — الشمس تحرق",
      "نظارات شمسية وقبعة",
      "ملابس خفيفة وفضفاضة (قطن)",
      "ملابس محتشمة للأماكن العامة والمراكز التجارية",
      "حذاء مريح للمشي الطويل في المول"
    ],
    packing_tips_en: [
      "Intense sunscreen — sun burns quickly",
      "Sunglasses and hat",
      "Light cotton clothing",
      "Modest clothes for public areas",
      "Comfortable walking shoes for mall time"
    ],

    local_tips_ar: [
      "نصيحة ذهب: السوق الشرقي (سوق التوابل والعطور) أرخص من المولات بـ 50%+",
      "المواصلات: استخدم مترو دبي أو اوبر — أرخص وأسرع من سيارات الأجرة",
      "التسوق: معارض الذهب والعطور والإلكترونيات أرخص 30-40% من الدول العربية",
      "الحرارة: تجنب الساحات الخارجية في الظهيرة (1-4 ظهراً)",
      "المال: قيمة الدرهم قريبة من الدولار — حسابات سهلة"
    ],
    local_tips_en: [
      "Gold tip: Gold Souk and Spice Souk 50%+ cheaper than malls",
      "Transport: Use Dubai Metro or Uber — faster and cheaper than taxis",
      "Shopping: Gold, perfume, electronics 30-40% cheaper than Arab countries",
      "Heat: Avoid outdoor areas during noon hours (1-4pm)",
      "Money: Dirham nearly 1:1 with USD — easy math"
    ],

    timezone: "GMT+4",
    languages: ["العربية (Arabic)", "English"],
    best_time_for: {
      honeymoon_ar: "نوفمبر–فبراير — طقس جميل وتسوق وحياة ليلية رومانسية",
      honeymoon_en: "November–February — beautiful weather, shopping, romantic nightlife",
      family_ar: "ديسمبر–يناير — أنشطة عائلية وشواطئ آمنة",
      family_en: "December–January — family activities and safe beaches",
      adventure_ar: "سبتمبر–أكتوبر — رياضات مائية وركوب جمال في الصحراء",
      adventure_en: "September–October — water sports and desert adventures",
      budget_ar: "يونيو–أغسطس — أرخص بـ 50% لكن حار جداً",
      budget_en: "June–August — 50% cheaper but extremely hot"
    }
  },

  // ──────────── ISTANBUL ────────────
  IST: {
    iata: "IST",
    nameAr: "إسطنبول",
    nameEn: "Istanbul",
    country_ar: "تركيا",
    country_en: "Turkey",
    description_ar: "عاصمة سحرية تجمع بين آسيا وأوروبا — مساجد ذهبية وأسواق عتيقة وحياة ثقافية غنية",
    description_en: "Magical capital bridging Europe and Asia — golden mosques, ancient bazaars, rich culture",

    best_months_ar: "أبريل إلى مايو وسبتمبر إلى أكتوبر — طقس مثالي",
    best_months_en: "April–May and September–October — perfect weather",
    worst_months_ar: "يناير وفبراير — بارد وممطر",
    worst_months_en: "January–February — cold and rainy",
    current_season_ar: "الآن ربيع جميل مثالي للمشي والاستكشاف 🌸",
    current_season_en: "Currently perfect spring for walking and exploring 🌸",
    weather_temp_range: "10-28°C",
    weather_description_ar: "ربيع لطيف مع إمكانية أمطار خفيفة",
    weather_description_en: "Pleasant spring with occasional light rain",

    visa_required_for_saudis: false,
    visa_type_ar: "فيزا إلكترونية (e-Visa)",
    visa_type_en: "e-Visa (online)",
    visa_processing_days: 0,
    visa_cost_usd: 15,
    visa_note_ar: "السعوديون يستطيعون الحصول على فيزا إلكترونية في 10 دقائق أون لاين — لا حاجة للسفارة",
    visa_note_en: "Saudis can get e-Visa in 10 minutes online — no embassy needed",

    safety_level: "good",
    safety_note_ar: "آمنة بشكل عام لكن احذر من النشل في الأسواق المزدحمة والمناطق السياحية",
    safety_note_en: "Generally safe but watch for pickpockets in crowded markets and tourist areas",
    cultural_tips_ar: [
      "المزارات الدينية: احترم المسلمين أثناء أوقات الصلاة",
      "الملابس: حرة لكن احترم الأماكن الدينية (اخلع الحذاء عند الدخول)",
      "الطعام: طعام تركي لذيذ وسعر معقول جداً",
      "المفاوضة: متوقع في الأسواق العتيقة والدكاكين — ممتع!"
    ],
    cultural_tips_en: [
      "Religious sites: Respect Muslim prayer times",
      "Dress: Casual but respect religious sites (remove shoes)",
      "Food: Delicious Turkish cuisine, very affordable",
      "Bargaining: Expected in bazaars — fun and engaging!"
    ],

    currency: "TRY",
    currency_name_ar: "الليرة التركية",
    currency_name_en: "Turkish Lira",
    usd_exchange_rate: 31,
    cost_level: "moderate",
    budget_per_day_usd: {
      budget: 40,
      moderate: 100,
      luxury: 250,
    },

    top_activities_ar: [
      "آيا صوفيا — مسجد تاريخي خلاب وشرقي",
      "الجامع الأزرق — عمارة عثمانية كلاسيكية",
      "الباعة القدامى والسوق المغطى (Grand Bazaar)",
      "رحلات بحرية في مضيق البوسفور",
      "منطقة غالاتا وبرج غالاتا (إطلالات مذهلة)"
    ],
    top_activities_en: [
      "Hagia Sophia — historic mosque and Byzantine masterpiece",
      "Blue Mosque — classical Ottoman architecture",
      "Grand Bazaar — ancient covered market",
      "Bosphorus cruises at sunset",
      "Galata Tower with stunning 360° views"
    ],

    packing_tips_ar: [
      "ملابس طبقات — الطقس متغير من الصباح إلى المساء",
      "حذاء مريح للمشي الطويل في الشوارع المرصوفة",
      "حقيبة صغيرة للقيم — النشل موجود في الأسواق",
      "كاميرا جيدة — مناظر فوتوغرافية خلابة في كل زاوية",
      "برنامج ترجمة في هاتفك — اللغة التركية تختلف عن العربية"
    ],
    packing_tips_en: [
      "Layered clothing — weather changes morning to evening",
      "Comfortable walking shoes — lots of cobblestone streets",
      "Small bag for valuables — pickpockets in markets",
      "Good camera — stunning photo ops everywhere",
      "Translation app — Turkish is very different from Arabic"
    ],

    local_tips_ar: [
      "نصيحة ذهب: تناول الكاي والشاي والقهوة التركية مع السكان المحليين في المقاهي الصغيرة",
      "المواصلات: استخدم بطاقة Istanbulkart — أرخص من تذاكر فردية",
      "الطعام: جرّب الكباب والشاورما التركية (أفضل من الشام!)",
      "الأسعار: تفاوض في السوق — السعر الأول ليس النهائي",
      "الوقت: أكثر من 2-3 أيام للاستمتاع الحقيقي"
    ],
    local_tips_en: [
      "Gold tip: Have tea and coffee at local cafes with Turks",
      "Transport: Buy Istanbulkart card — cheaper than single tickets",
      "Food: Try Turkish kebabs and lahmacun (amazing!)",
      "Prices: Bargain in bazaar — first price is never final",
      "Time: Spend 2-3+ days to truly enjoy the city"
    ],

    timezone: "GMT+3",
    languages: ["Türkçe (Turkish)", "English"],
    best_time_for: {
      honeymoon_ar: "أبريل–مايو أو سبتمبر–أكتوبر — طقس جميل ورومانسية القصور العثمانية",
      honeymoon_en: "April–May or September–October — perfect weather and Ottoman romance",
      family_ar: "يونيو–أغسطس — إجازات طويلة وأنشطة عائلية وشواطئ قريبة",
      family_en: "June–August — long summer break and family activities",
      adventure_ar: "مايو–يونيو — تسلق جبال القوقاز والرياضات المائية",
      adventure_en: "May–June — mountain trekking and water sports",
      budget_ar: "نوفمبر–مارس — أرخص بـ 40% وأقل ازدحاماً",
      budget_en: "November–March — 40% cheaper and less crowded"
    }
  },

  // ──────────── BALI ────────────
  DPS: {
    iata: "DPS",
    nameAr: "بالي",
    nameEn: "Bali",
    country_ar: "إندونيسيا",
    country_en: "Indonesia",
    description_ar: "جزيرة فردوسية بمعابد هندوسية جميلة وشواطئ بكر وطبيعة خضراء وثقافة فريدة",
    description_en: "Paradisiacal island with stunning Hindu temples, pristine beaches, lush nature, and unique culture",

    best_months_ar: "أبريل إلى يونيو وسبتمبر إلى أكتوبر — جاف وشمسي",
    best_months_en: "April–June and September–October — dry and sunny",
    worst_months_ar: "نوفمبر إلى مارس — موسم أمطار ثقيل",
    worst_months_en: "November–March — heavy rain season",
    current_season_ar: "الآن موسم جاف مثالي للشواطئ والمعابد 🌞",
    current_season_en: "Currently perfect dry season for beaches and temples 🌞",
    weather_temp_range: "24-32°C",
    weather_description_ar: "دافئ وشمسي مع رياح خفيفة من البحر",
    weather_description_en: "Warm and sunny with sea breeze",

    visa_required_for_saudis: false,
    visa_type_ar: "فيزا سياحية عند الوصول (Visa on Arrival)",
    visa_type_en: "Visa on Arrival (VOA)",
    visa_processing_days: 0,
    visa_cost_usd: 35,
    visa_note_ar: "السعوديون يحصلون على الفيزا مباشرة عند الوصول — بسيط وسريع",
    visa_note_en: "Saudis get visa instantly on arrival — simple and quick",

    safety_level: "good",
    safety_note_ar: "آمنة بشكل عام للسياح لكن احذر من سرقات الدراجات النارية والنشل في الحفلات",
    safety_note_en: "Generally safe for tourists but watch for bike theft and pickpockets at parties",
    cultural_tips_ar: [
      "احترم الدين الهندوسي — لا تشير إلى التماثيل بقدمك",
      "الملابس: ملابس محتشمة عند دخول المعابد",
      "السلام: قل 'سلامت' (Selamat) مع الإيماءة",
      "الطعام: جرّب الطعام الإندونيسي الحار واللذيذ"
    ],
    cultural_tips_en: [
      "Respect Hindu religion — don't point at statues with feet",
      "Dress: Modest when entering temples",
      "Greetings: Say 'Selamat' with hand gesture",
      "Food: Try spicy and delicious Indonesian cuisine"
    ],

    currency: "IDR",
    currency_name_ar: "روبية إندونيسية",
    currency_name_en: "Indonesian Rupiah",
    usd_exchange_rate: 15200,
    cost_level: "budget",
    budget_per_day_usd: {
      budget: 30,
      moderate: 80,
      luxury: 200,
    },

    top_activities_ar: [
      "معبد أولوواتو المعلق فوق منحدرات عالية (Uluwatu Temple)",
      "حقول الأرز الخضراء والقرى التقليدية",
      "الشواطئ: سيمينياك (حفلات)، كوتا (موجات)، نوسا دوا (فاخر)",
      "رحلات البحث عن القرود في غابات أوبود",
      "معبد تاناه لوط على الصخور"
    ],
    top_activities_en: [
      "Uluwatu Temple perched on high cliffs (sunset views)",
      "Green rice fields and traditional villages",
      "Beaches: Seminyak (nightlife), Kuta (surfing), Nusa Dua (luxury)",
      "Monkey forest treks in Ubud",
      "Tanah Lot Temple on rocks"
    ],

    packing_tips_ar: [
      "واقي شمس قوي — الشمس الاستوائية قاسية",
      "ملابس خفيفة وفضفاضة لأجواء رطبة",
      "حذاء مائي للشواطئ الصخرية",
      "أدوية الإسهال والحمى (الطعام المختلف يسبب مشاكل)",
      "ملابس محتشمة لزيارة المعابد"
    ],
    packing_tips_en: [
      "Strong sunscreen — tropical sun is intense",
      "Light and breathable clothing for humidity",
      "Water shoes for rocky beaches",
      "Diarrhea and fever meds (different food can upset stomach)",
      "Modest clothes for temple visits"
    ],

    local_tips_ar: [
      "نصيحة ذهب: ادفع نقداً (IDR) — بطاقات الائتمان رسوم عالية",
      "المواصلات: استأجر دراجة نارية أو سيارة — أرخص من التاكسي",
      "المطاعم: تناول الطعام المحلي وليس الفنادق — لذيذ وأرخص 10 مرات",
      "الأسعار: جميع شيء رخيص جداً — توقع أن تنفق أقل من توقعاتك",
      "الحياة الليلية: حفلات جنونية في سيمينياك — آمنة وممتعة"
    ],
    local_tips_en: [
      "Gold tip: Pay cash (IDR) — credit cards have high fees",
      "Transport: Rent a scooter or car — cheaper than taxi",
      "Food: Eat local food not hotels — 10x cheaper and tastier",
      "Prices: Everything is super cheap — you'll spend less than expected",
      "Nightlife: Crazy parties in Seminyak — safe and fun"
    ],

    timezone: "GMT+8",
    languages: ["Bahasa Indonesia", "English"],
    best_time_for: {
      honeymoon_ar: "أبريل–يونيو أو سبتمبر–أكتوبر — شواطئ هادئة وطقس جميل",
      honeymoon_en: "April–June or September–October — calm beaches and perfect weather",
      family_ar: "يوليو–أغسطس — إجازات المدارس وأنشطة آمنة",
      family_en: "July–August — school holidays and family-friendly activities",
      adventure_ar: "مايو–يونيو — ركوب الأمواج والغوص والتسلق",
      adventure_en: "May–June — surfing, diving, and trekking",
      budget_ar: "نوفمبر–مارس — أرخص 50% لكن ممطر",
      budget_en: "November–March — 50% cheaper but rainy"
    }
  },

  // ──────────── LONDON ────────────
  LHR: {
    iata: "LHR",
    nameAr: "لندن",
    nameEn: "London",
    country_ar: "المملكة المتحدة",
    country_en: "United Kingdom",
    description_ar: "عاصمة ملكية عريقة بمتاحف عالمية وعمارة تاريخية وحياة فنية ثقافية ممتعة",
    description_en: "Historic royal capital with world-class museums, iconic architecture, and vibrant arts culture",

    best_months_ar: "مايو إلى سبتمبر — صافٍ وطقس معتدل",
    best_months_en: "May to September — clear and pleasant weather",
    worst_months_ar: "نوفمبر إلى فبراير — بارد وممطر وأيام قصيرة",
    worst_months_en: "November to February — cold, rainy, short days",
    current_season_ar: "الآن ربيع جميل مع أيام طويلة وشمس 🌞",
    current_season_en: "Currently beautiful spring with long days and sunshine 🌞",
    weather_temp_range: "8-20°C",
    weather_description_ar: "معتدل مع احتمال أمطار خفيفة",
    weather_description_en: "Mild with occasional light rain",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة سياحية (السفارة البريطانية)",
    visa_type_en: "Tourist Visa (British Embassy)",
    visa_processing_days: 15,
    visa_cost_usd: 120,
    visa_note_ar: "السعوديون يحتاجون تأشيرة من السفارة — احجز موعد قبل شهر على الأقل",
    visa_note_en: "Saudis need embassy visa — book appointment 1+ month ahead",

    safety_level: "very good",
    safety_note_ar: "آمنة جداً لكن احذر من النشل في المحطات والنقل العام",
    safety_note_en: "Very safe but watch for pickpockets on public transport",
    cultural_tips_ar: [
      "الحفاظ على الهدوء — لندنيون يقدرون الآداب والاحترام",
      "الطعام: جرّب الفطور البريطاني والشاي بقرقعة",
      "المشي: لندن أفضل تستكشفها سيراً على الأقدام",
      "الأسعار: غالية لكن الجودة ممتازة"
    ],
    cultural_tips_en: [
      "Be quiet and respectful — Londoners value politeness",
      "Food: Try full English breakfast and proper afternoon tea",
      "Walking: London is best explored on foot",
      "Prices: Expensive but high quality"
    ],

    currency: "GBP",
    currency_name_ar: "الجنيه الإسترليني",
    currency_name_en: "British Pound",
    usd_exchange_rate: 1.27,
    cost_level: "expensive",
    budget_per_day_usd: {
      budget: 100,
      moderate: 250,
      luxury: 600,
    },

    top_activities_ar: [
      "برج بيج بن والبرلمان — أيقونة بريطانية",
      "متحف البريطاني — كنز فني عالمي",
      "قصر باكنغهام وحرس الملكة",
      "جسر لندن التاريخي",
      "متحف الشمع مدام توسو"
    ],
    top_activities_en: [
      "Big Ben and Parliament — British icons",
      "British Museum — world-class art treasures",
      "Buckingham Palace and royal guards",
      "Tower Bridge with views",
      "Madame Tussauds Wax Museum"
    ],

    packing_tips_ar: [
      "ملابس طبقات — الطقس غير متنبأ به",
      "معطف مقاوم للماء — الأمطار متكررة",
      "حذاء مريح للمشي — ستمشي كثيراً",
      "ملابس رسمية إن كنت تذهب للمسارح والمطاعم الفاخرة",
      "مظلة صغيرة"
    ],
    packing_tips_en: [
      "Layered clothing — unpredictable weather",
      "Waterproof jacket — frequent rain",
      "Comfortable walking shoes — lots of walking",
      "Formal attire for theaters and fine dining",
      "Small umbrella"
    ],

    local_tips_ar: [
      "نصيحة ذهب: اشتر Oyster Card — أرخص بـ 50% من تذاكر الفردية",
      "الطعام: Pubs غالية وليست جودة عالية — ابحث عن مطاعم محلية آسيوية",
      "المتاحف: معظمها مجاني (British Museum, National Gallery, V&A)!",
      "الأسعار: لندن غالية جداً — الفنادق أرخص في الضواحي (30 دقيقة بالمترو)",
      "الوقت: 3-4 أيام كافية لرؤية المعالم الرئيسية"
    ],
    local_tips_en: [
      "Gold tip: Buy Oyster Card — 50% cheaper than single tickets",
      "Food: Pubs are overpriced — try local Asian restaurants",
      "Museums: Most are free (British Museum, National Gallery, V&A)!",
      "Prices: London is expensive — stay in suburbs (30min by tube)",
      "Time: 3-4 days enough to see major sights"
    ],

    timezone: "GMT+0/+1",
    languages: ["English"],
    best_time_for: {
      honeymoon_ar: "يونيو–يوليو — أيام طويلة وأسواق الزهور والحدائق جميلة",
      honeymoon_en: "June–July — long days and blooming gardens",
      family_ar: "يوليو–أغسطس — عطل المدارس وأنشطة عائلية",
      family_en: "July–August — school holidays and family activities",
      adventure_ar: "مايو–سبتمبر — ركوب الدراجات والمشي لمسافات طويلة",
      adventure_en: "May–September — cycling and long-distance walking",
      budget_ar: "نوفمبر–مارس — أرخص 40% لكن بارد وممطر",
      budget_en: "November–March — 40% cheaper but cold and wet"
    }
  },

  // ──────────── PARIS ────────────
  CDG: {
    iata: "CDG",
    nameAr: "باريس",
    nameEn: "Paris",
    country_ar: "فرنسا",
    country_en: "France",
    description_ar: "عاصمة الحب والفن — برج إيفل وآثار تاريخية وعمارة خلابة وطعام عالمي",
    description_en: "City of Light and Love — Eiffel Tower, historic monuments, stunning architecture, world-class cuisine",

    best_months_ar: "أبريل إلى مايو وسبتمبر إلى أكتوبر — ربيع وخريف مثاليان",
    best_months_en: "April–May and September–October — perfect spring and autumn",
    worst_months_ar: "يناير وفبراير — بارد جداً وممطر",
    worst_months_en: "January–February — very cold and rainy",
    current_season_ar: "الآن ربيع جميل مع إطلالات رومانسية 🌸",
    current_season_en: "Currently beautiful spring with romantic views 🌸",
    weather_temp_range: "5-20°C",
    weather_description_ar: "معتدل مع احتمال أمطار",
    weather_description_en: "Mild with occasional rain",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة شينغن (Schengen)",
    visa_type_en: "Schengen Visa",
    visa_processing_days: 15,
    visa_cost_usd: 80,
    visa_note_ar: "تأشيرة موحدة لكل أوروبا — احجز موعد قنصلية قبل شهر",
    visa_note_en: "Unified visa for all Europe — book consulate appointment 1 month ahead",

    safety_level: "very good",
    safety_note_ar: "آمنة جداً لكن احذر من النشل في المترو والمناطق السياحية المزدحمة",
    safety_note_en: "Very safe but watch for pickpockets on metro and tourist areas",
    cultural_tips_ar: [
      "احترم الثقافة الفرنسية — لا تتكلم إنجليزي فقط، تعلم كلمات فرنسية أساسية",
      "الطعام: الفطور خفيف، الغداء الوجبة الرئيسية، العشاء منخفض",
      "المقاهي: اجلس وتمتع — الزمن بطيء وممتع",
      "الملابس: أنيقة لكن بسيطة — تجنب الملابس الرياضية"
    ],
    cultural_tips_en: [
      "Respect French culture — learn basic French phrases",
      "Food: Light breakfast, main meal at lunch, dinner lighter",
      "Cafes: Sit and enjoy — time moves slowly",
      "Dress: Elegant but simple — avoid sportswear"
    ],

    currency: "EUR",
    currency_name_ar: "يورو",
    currency_name_en: "Euro",
    usd_exchange_rate: 0.92,
    cost_level: "expensive",
    budget_per_day_usd: {
      budget: 80,
      moderate: 200,
      luxury: 500,
    },

    top_activities_ar: [
      "برج إيفل — الرمز الأيقوني لباريس مع إطلالات 360 درجة",
      "متحف اللوفر — أكبر متاحف العالم (الموناليزا!)",
      "نوتر دام والقسطنطينية — عمارة قوطية خلابة",
      "شارع شانز إليزيه والتسوق الفاخر",
      "جولات بالقارب في نهر السين عند الغروب"
    ],
    top_activities_en: [
      "Eiffel Tower — iconic symbol with 360° views",
      "Louvre Museum — world's largest museum (Mona Lisa!)",
      "Notre-Dame and Sainte-Chapelle — stunning Gothic architecture",
      "Champs-Élysées shopping and luxury brands",
      "Seine river cruises at sunset"
    ],

    packing_tips_ar: [
      "ملابس طبقات — الطقس متقلب",
      "حذاء مريح للمشي الكثير — المدينة كبيرة",
      "معطف مقاوم للماء",
      "حقيبة صغيرة للمتحف والمقاهي",
      "نظارات شمسية"
    ],
    packing_tips_en: [
      "Layered clothing — unpredictable weather",
      "Comfortable walking shoes — lots of walking",
      "Waterproof coat",
      "Small museum bag",
      "Sunglasses"
    ],

    local_tips_ar: [
      "نصيحة ذهب: اشتر Museum Pass — دخول مجاني لـ 60+ متحف",
      "المترو: أرخص وأسرع من التاكسي والأوبر",
      "الطعام: المقاهي والبسترية أرخص من المطاعم",
      "الأسعار: باريس غالية لكن الثقافة تستحق",
      "التوقيت: أقل 3-4 أيام"
    ],
    local_tips_en: [
      "Gold tip: Buy Museum Pass — free entry to 60+ museums",
      "Metro: Fastest and cheapest transport",
      "Food: Cafes and bakeries cheaper than restaurants",
      "Prices: Expensive but worth the culture",
      "Time: 3-4 days minimum"
    ],

    timezone: "GMT+1/+2",
    languages: ["Français (French)", "English"],
    best_time_for: {
      honeymoon_ar: "أبريل–مايو أو سبتمبر–أكتوبر — رومانسي مثالي",
      honeymoon_en: "April–May or September–October — perfectly romantic",
      family_ar: "يونيو–يوليو — أيام طويلة وحدائق جميلة",
      family_en: "June–July — long days and beautiful parks",
      adventure_ar: "مايو–سبتمبر — مشي طويل على نهر السين",
      adventure_en: "May–September — long walks along Seine",
      budget_ar: "نوفمبر–مارس — أرخص 50% لكن بارد",
      budget_en: "November–March — 50% cheaper but cold"
    }
  },

  // ──────────── TOKYO ────────────
  NRT: {
    iata: "NRT",
    nameAr: "طوكيو",
    nameEn: "Tokyo",
    country_ar: "اليابان",
    country_en: "Japan",
    description_ar: "عاصمة حديثة فاخرة بتكنولوجيا متقدمة وثقافة تقليدية وطعام عالمي وحياة ليلية ذكية",
    description_en: "Ultra-modern metropolis blending cutting-edge tech with ancient tradition, world-class food, vibrant nightlife",

    best_months_ar: "مارس إلى مايو وسبتمبر إلى نوفمبر — ربيع وخريف مثاليان",
    best_months_en: "March–May and September–November — perfect spring and autumn",
    worst_months_ar: "يونيو إلى أغسطس — حار جداً ورطب (موسم الأمطار)",
    worst_months_en: "June–August — hot, humid, rainy season",
    current_season_ar: "الآن ربيع جميل مع أزهار الكرز 🌸",
    current_season_en: "Currently beautiful spring with cherry blossoms 🌸",
    weather_temp_range: "5-25°C",
    weather_description_ar: "معتدل مع احتمال أمطار خفيفة",
    weather_description_en: "Mild with occasional light rain",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة سياحية (سفارة اليابان)",
    visa_type_en: "Tourist Visa (Japanese Embassy)",
    visa_processing_days: 10,
    visa_cost_usd: 0,
    visa_note_ar: "السعوديون يمكنهم الدخول بدون تأشيرة لمدة 90 يوم",
    visa_note_en: "Saudis get visa-free entry for 90 days",

    safety_level: "excellent",
    safety_note_ar: "آمنة جداً جداً — تقريباً صفر جرائم وسلوك احترام عالي",
    safety_note_en: "Extremely safe — virtually no crime and high respect culture",
    cultural_tips_ar: [
      "احترم الآداب: انزع الحذاء قبل الدخول، اجلس بصراحة",
      "الطعام: استخدم العصا (الشوك التقليدي) أو اطلب الملعقة",
      "الصمت: الهدوء في المترو والأماكن العامة",
      "عدم الحديث في الهاتف: ممنوع في المترو والحافلات"
    ],
    cultural_tips_en: [
      "Etiquette: Remove shoes before entering, sit upright",
      "Food: Use chopsticks or ask for fork",
      "Silence: Quiet on metro and public spaces",
      "No phone calls: Forbidden on trains and buses"
    ],

    currency: "JPY",
    currency_name_ar: "الين الياباني",
    currency_name_en: "Japanese Yen",
    usd_exchange_rate: 149,
    cost_level: "expensive",
    budget_per_day_usd: {
      budget: 60,
      moderate: 150,
      luxury: 400,
    },

    top_activities_ar: [
      "معبد فوشيمي إناري — 10,000 بوابة حمراء تقليدية",
      "حي شيبويا — أكثر تقاطعات العالم ازدحاماً وإثارة",
      "حديقة أوينو — أكبر حديقة في طوكيو",
      "برج طوكيو — إطلالات 360 درجة على المدينة",
      "حي آكيهابارا — تكنولوجيا والعاب وأنمي"
    ],
    top_activities_en: [
      "Fushimi Inari Shrine — 10,000 red torii gates",
      "Shibuya Crossing — world's busiest pedestrian crossing",
      "Ueno Park — Tokyo's largest park",
      "Tokyo Tower — 360° city views",
      "Akihabara — tech, gaming, and anime hub"
    ],

    packing_tips_ar: [
      "حذاء مريح جداً — المدينة تتطلب مشي كثير",
      "معطف أو سترة — الطقس متقلب",
      "جوارب نظيفة — تنزع الحذاء كثيراً",
      "بطاقة Suica أو Pasmo — للمترو والحافلات والمحلات",
      "كاميرا جيدة للتصوير"
    ],
    packing_tips_en: [
      "Very comfortable shoes — lots of walking",
      "Jacket or sweater — unpredictable weather",
      "Clean socks — remove shoes frequently",
      "Suica or Pasmo card — metro, buses, shops",
      "Good camera for photography"
    ],

    local_tips_ar: [
      "نصيحة ذهب: استخدم Google Maps + Translate App — أساسي في طوكيو",
      "المترو: بطاقة Suica تعمل في كل مكان، أرخص من التذاكر الفردية",
      "الطعام: الراتيه والنودلز والسوشي رخيص جداً (300-500 ين)",
      "التوقيت: تجاوز متأخر الليل — الحياة الليلية مذهلة",
      "أسبوع كامل نموذجي للاستمتاع"
    ],
    local_tips_en: [
      "Gold tip: Google Maps + Translate app — essential in Tokyo",
      "Metro: Suica card works everywhere, cheaper than singles",
      "Food: Ramen, noodles, sushi very cheap (300-500 yen)",
      "Stay late — incredible nightlife",
      "Full week ideal for proper enjoyment"
    ],

    timezone: "GMT+9",
    languages: ["日本語 (Japanese)", "English limited"],
    best_time_for: {
      honeymoon_ar: "مارس–أبريل (أزهار الكرز) أو أكتوبر–نوفمبر (الخريف الجميل)",
      honeymoon_en: "March–April (cherry blossoms) or October–November (fall colors)",
      family_ar: "يوليو–أغسطس — إجازات طويلة وأنشطة عائلية",
      family_en: "July–August — long summer and family activities",
      adventure_ar: "مايو–يونيو — ركوب الدراجات والتسلق",
      adventure_en: "May–June — biking and mountain climbing",
      budget_ar: "ديسمبر–فبراير — أرخص لكن بارد",
      budget_en: "December–February — cheaper but cold"
    }
  },

  // ──────────── BANGKOK ────────────
  BKK: {
    iata: "BKK",
    nameAr: "بانكوك",
    nameEn: "Bangkok",
    country_ar: "تايلاند",
    country_en: "Thailand",
    description_ar: "عاصمة ديناميكية بمعابد ذهبية وأسواق عائمة وحياة ليلية مجنونة وطعام شارع ممتاز",
    description_en: "Dynamic capital with golden temples, floating markets, crazy nightlife, amazing street food",

    best_months_ar: "نوفمبر إلى فبراير — جاف وبارد نسبياً",
    best_months_en: "November to February — dry and cool",
    worst_months_ar: "مارس إلى مايو — حار جداً ورطب",
    worst_months_en: "March to May — extremely hot and humid",
    current_season_ar: "الآن موسم مثالي — طقس جميل وأسعار معقولة 🌞",
    current_season_en: "Currently ideal season — perfect weather and good prices 🌞",
    weather_temp_range: "22-35°C",
    weather_description_ar: "دافئ وجاف مع احتمال أمطار قليلة",
    weather_description_en: "Warm and dry with little rain",

    visa_required_for_saudis: false,
    visa_type_ar: "بدون فيزا (60 يوم)",
    visa_type_en: "Visa-free (60 days)",
    visa_processing_days: 0,
    visa_cost_usd: null,
    visa_note_ar: "السعوديون يحصلون على 60 يوم مجاناً عند الوصول",
    visa_note_en: "Saudis get 60 days visa-free on arrival",

    safety_level: "good",
    safety_note_ar: "آمنة للسياح لكن احذر من خداع السياح والنشل في الأسواق المزدحمة",
    safety_note_en: "Safe for tourists but watch for scams and pickpockets in crowded markets",
    cultural_tips_ar: [
      "احترم الملك — لا تنتقد الملك أو الأسرة الملكية",
      "المعابد: ملابس محتشمة، انزع الحذاء",
      "التحايات: قل 'ساواديكا' مع الانحناء الطفيف",
      "الطعام: جرّب الطعام الحار والشارع"
    ],
    cultural_tips_en: [
      "Respect the King — don't criticize royalty",
      "Temples: Modest dress, remove shoes",
      "Greetings: Say 'Sawasdee' with slight bow",
      "Food: Try spicy street food"
    ],

    currency: "THB",
    currency_name_ar: "الباط التايلاندي",
    currency_name_en: "Thai Baht",
    usd_exchange_rate: 35.5,
    cost_level: "budget",
    budget_per_day_usd: {
      budget: 25,
      moderate: 60,
      luxury: 150,
    },

    top_activities_ar: [
      "الأسواق العائمة (دامنوين سادواك) — تجربة فريدة تايلاندية",
      "معبد الزمرد (Wat Phra Kaew) — أقدس معبد بوذي",
      "قصر الملك الكبير — عمارة ملكية رائعة",
      "حي خاو سان — حياة ليلية مجنونة وحانات وملاهي",
      "حديقة لومبيني — أكبر حديقة في بانكوك"
    ],
    top_activities_en: [
      "Floating Markets (Damnoen Saduak) — unique Thai experience",
      "Wat Phra Kaew (Emerald Temple) — holiest Buddhist temple",
      "Grand Palace — stunning royal architecture",
      "Khao San Road — crazy nightlife and bars",
      "Lumphini Park — largest Bangkok park"
    ],

    packing_tips_ar: [
      "ملابس خفيفة جداً — الحرارة والرطوبة عالية",
      "واقي شمس قوي",
      "حذاء مائي للأسواق العائمة",
      "ملابس محتشمة للمعابد",
      "أدوية للإسهال — الطعام الحار قد يسبب مشاكل"
    ],
    packing_tips_en: [
      "Very light clothing — heat and humidity",
      "Strong sunscreen",
      "Water shoes for floating markets",
      "Modest clothes for temples",
      "Diarrhea meds — spicy food might upset stomach"
    ],

    local_tips_ar: [
      "نصيحة ذهب: تناول الطعام في الشارع — أرخص وألذ من المطاعم (20-50 باط)",
      "المواصلات: البي تي إس والمترو — أرخص من التاكسي",
      "الأسواق: ساحة جاتوجاك (JJ Market) — تسوق وملابس وحرف يدوية",
      "الحياة الليلية: خاو سان وسيليوم نايت بازار — مجنون وممتع",
      "احذر من خداع السياح في المعابد"
    ],
    local_tips_en: [
      "Gold tip: Eat street food — cheapest and tastiest (20-50 baht)",
      "Transport: BTS and metro — cheaper than taxi",
      "Markets: Chatuchak Market (JJ) — huge weekend market",
      "Nightlife: Khao San and Silom — crazy and fun",
      "Beware tourist scams at temples"
    ],

    timezone: "GMT+7",
    languages: ["ไทย (Thai)", "English limited"],
    best_time_for: {
      honeymoon_ar: "نوفمبر–ديسمبر — طقس مثالي وحياة ليلية رومانسية",
      honeymoon_en: "November–December — perfect weather and romantic nightlife",
      family_ar: "ديسمبر–يناير — طقس معتدل وأنشطة عائلية آمنة",
      family_en: "December–January — moderate weather and safe activities",
      adventure_ar: "ديسمبر–فبراير — ركوب الدراجات والطعام وكشافات الدراجات النارية",
      adventure_en: "December–February — biking, food tours, motorcycle adventures",
      budget_ar: "يونيو–سبتمبر — أرخص 50% لكن موسم أمطار",
      budget_en: "June–September — 50% cheaper but rainy season"
    }
  },

  // ──────────── SINGAPORE ────────────
  SIN: {
    iata: "SIN",
    nameAr: "سنغافورة",
    nameEn: "Singapore",
    country_ar: "سنغافورة",
    country_en: "Singapore",
    description_ar: "مدينة دولة حديثة بحياة آمنة منظمة وحدائق خضراء وأبراج ناطحات سحاب فاخرة وطعام عالمي",
    description_en: "City-state with ultra-modern life, perfect safety, green gardens, luxury skyscrapers, world cuisine",

    best_months_ar: "فبراير إلى أبريل وأغسطس إلى أكتوبر — أقل أمطاراً",
    best_months_en: "February to April and August to October — least rainy",
    worst_months_ar: "نوفمبر وديسمبر — موسم أمطار ثقيل",
    worst_months_en: "November to December — heavy rain season",
    current_season_ar: "الآن موسم مثالي — طقس جميل وأسعار معقولة 🌞",
    current_season_en: "Currently ideal — pleasant weather and reasonable prices 🌞",
    weather_temp_range: "24-32°C",
    weather_description_ar: "دافئ وشمسي مع احتمال أمطار قصيرة",
    weather_description_en: "Warm and sunny with occasional short showers",

    visa_required_for_saudis: false,
    visa_type_ar: "بدون فيزا (30 يوم)",
    visa_type_en: "Visa-free (30 days)",
    visa_processing_days: 0,
    visa_cost_usd: null,
    visa_note_ar: "السعوديون يحصلون على 30 يوم بدون فيزا — جواز سفر فقط",
    visa_note_en: "Saudis get 30 days visa-free — passport only",

    safety_level: "excellent",
    safety_note_ar: "آمنة جداً جداً — معدل جرائم شبه معدوم وشرطة قوية",
    safety_note_en: "Extremely safe — virtually no crime and strong police presence",
    cultural_tips_ar: [
      "احترم التنوع — مسلمون وهندوس وبوذيون وصينيون يعيشون معاً",
      "الملابس: حرة لكن احترم الأماكن الدينية",
      "النظافة: ممنوع رمي القاذورات (غرامة عالية!)",
      "الطعام: طعام متعدد الثقافات وشهي جداً"
    ],
    cultural_tips_en: [
      "Respect diversity — Muslims, Hindus, Buddhists, Chinese coexist",
      "Dress: Free but respect religious places",
      "Cleanliness: Don't litter (high fines!)",
      "Food: Multicultural and delicious"
    ],

    currency: "SGD",
    currency_name_ar: "دولار سنغافوري",
    currency_name_en: "Singapore Dollar",
    usd_exchange_rate: 1.35,
    cost_level: "expensive",
    budget_per_day_usd: {
      budget: 50,
      moderate: 120,
      luxury: 300,
    },

    top_activities_ar: [
      "حدائق ماريناماريناء الحديقة — حدائق ذكية بأشجار عملاقة",
      "ميرليون — رمز سنغافورة (أسد وسمكة)",
      "حي تشايناتاون — ثقافة صينية أصلية",
      "حي الهندي (ليتل إنديا) — أسواق وألوان وطعام",
      "جزيرة سينتوسا — شواطئ وملاهي ترفيهية"
    ],
    top_activities_en: [
      "Marina Bay Gardens — smart gardens with giant trees",
      "Merlion — Singapore's iconic symbol (lion-fish)",
      "Chinatown — authentic Chinese culture",
      "Little India — markets, colors, food",
      "Sentosa Island — beaches and theme parks"
    ],

    packing_tips_ar: [
      "ملابس خفيفة جداً والرطوبة عالية",
      "واقي شمس قوي",
      "حذاء مريح للمشي",
      "مظلة — قد تهطل أمطار مفاجئة",
      "بطاقة الائتمان — كل شيء متطور"
    ],
    packing_tips_en: [
      "Very light clothing for humidity",
      "Strong sunscreen",
      "Comfortable walking shoes",
      "Umbrella — sudden showers possible",
      "Credit card — everything is modern"
    ],

    local_tips_ar: [
      "نصيحة ذهب: استخدم الآله (EZ-Link) — رخيصة وتعمل في كل مكان",
      "المترو: نظيف وآمن وفعال جداً",
      "الطعام: هوكر ستالز (مراكز طعام شعبية) — لذيذ ورخيص",
      "الأسعار: سنغافورة غالية لكن النوعية ممتازة",
      "يومين أو ثلاثة كافية للاستمتاع"
    ],
    local_tips_en: [
      "Gold tip: Use EZ-Link card — works everywhere",
      "Metro: Clean, safe, and efficient",
      "Food: Hawker stalls — delicious and cheap",
      "Prices: Expensive but excellent quality",
      "2-3 days enough to enjoy"
    ],

    timezone: "GMT+8",
    languages: ["English", "Mandarin", "Malay", "Tamil"],
    best_time_for: {
      honeymoon_ar: "فبراير–أبريل — طقس جميل وحدائق خضراء وحياة ليلية",
      honeymoon_en: "February–April — pleasant weather and green gardens",
      family_ar: "يونيو–يوليو — إجازات مدرسية وأنشطة عائلية",
      family_en: "June–July — school holidays and family activities",
      adventure_ar: "أغسطس–سبتمبر — رياضات مائية وركوب دراجات",
      adventure_en: "August–September — water sports and biking",
      budget_ar: "نوفمبر–يناير — أرخص قليلاً لكن موسم أمطار",
      budget_en: "November–January — slightly cheaper but rainy"
    }
  },

  // ──────────── ROME ────────────
  FCO: {
    iata: "FCO",
    nameAr: "روما",
    nameEn: "Rome",
    country_ar: "إيطاليا",
    country_en: "Italy",
    description_ar: "العاصمة الأبدية — آثار رومانية عريقة وكنيسة سيستين وفن تاريخي وطعم حياة إيطالية أصيلة",
    description_en: "Eternal City — ancient Roman ruins, Sistine Chapel, historic art, authentic Italian life",

    best_months_ar: "أبريل إلى مايو وسبتمبر إلى أكتوبر — ربيع وخريف مثاليان",
    best_months_en: "April–May and September–October — perfect spring and autumn",
    worst_months_ar: "يناير وفبراير — بارد وممطر",
    worst_months_en: "January–February — cold and rainy",
    current_season_ar: "الآن ربيع جميل مع الأيام الطويلة 🌸",
    current_season_en: "Currently beautiful spring with long days 🌸",
    weather_temp_range: "5-25°C",
    weather_description_ar: "معتدل مع احتمال أمطار خفيفة",
    weather_description_en: "Mild with occasional light rain",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة شينغن (Schengen)",
    visa_type_en: "Schengen Visa",
    visa_processing_days: 15,
    visa_cost_usd: 80,
    visa_note_ar: "تأشيرة موحدة لأوروبا — احجز موعد قنصلية قبل شهر",
    visa_note_en: "Unified Schengen visa — book consulate 1 month ahead",

    safety_level: "very good",
    safety_note_ar: "آمنة جداً لكن احذر من النشل في المناطق السياحية والمترو",
    safety_note_en: "Very safe but watch for pickpockets in tourist areas and metro",
    cultural_tips_ar: [
      "احترم الفن والتاريخ — روما متحف حي",
      "الطعام: عجينة وبيتزا بسيطة لذيذة جداً",
      "المقاهي: اجلس وتمتع بقهوة الإسبريسو",
      "الملابس: أنيقة وبسيطة"
    ],
    cultural_tips_en: [
      "Respect art and history — Rome is a living museum",
      "Food: Simple pasta and pizza are delicious",
      "Cafes: Sit and enjoy espresso",
      "Dress: Elegant but casual"
    ],

    currency: "EUR",
    currency_name_ar: "يورو",
    currency_name_en: "Euro",
    usd_exchange_rate: 0.92,
    cost_level: "expensive",
    budget_per_day_usd: {
      budget: 70,
      moderate: 180,
      luxury: 450,
    },

    top_activities_ar: [
      "الكولوسيوم — أيقونة رومانية عريقة",
      "الفاتيكان والكنيسة — كنيسة سيستين وسقفها الشهير",
      "المنتدى الروماني — أطلال المدينة القديمة",
      "نافورة تريفي — أيقونة سينمائية جميلة",
      "جسر فيشيو والنهر — إطلالات رومانسية"
    ],
    top_activities_en: [
      "Colosseum — iconic Roman amphitheater",
      "Vatican and Sistine Chapel — stunning ceiling frescoes",
      "Roman Forum — ruins of ancient city",
      "Trevi Fountain — beautiful cinematic landmark",
      "Ponte Vecchio — romantic riverside views"
    ],

    packing_tips_ar: [
      "ملابس طبقات — الطقس متقلب",
      "حذاء مريح جداً للمشي الكثير",
      "معطف مقاوم للماء",
      "كاميرا جيدة — كل زاوية خلابة",
      "حقيبة صغيرة آمنة"
    ],
    packing_tips_en: [
      "Layered clothing — unpredictable weather",
      "Very comfortable walking shoes",
      "Waterproof coat",
      "Good camera — every corner is beautiful",
      "Secure small bag"
    ],

    local_tips_ar: [
      "نصيحة ذهب: اشتر Roma Pass — دخول مجاني للمواقع الأثرية",
      "المترو والحافلات: أرخص وأسهل من التاكسي",
      "الطعام: تناول الطعام مثل الرومان — عجينة بسيطة لذيذة",
      "التوقيت: 3 أيام على الأقل",
      "الأسعار: روما أرخص من باريس ولندن"
    ],
    local_tips_en: [
      "Gold tip: Buy Roma Pass — free entry to archeological sites",
      "Metro and buses: Cheaper and easier than taxi",
      "Food: Eat like Romans — simple pasta tastes amazing",
      "Time: 3+ days minimum",
      "Prices: Cheaper than Paris and London"
    ],

    timezone: "GMT+1/+2",
    languages: ["Italiano (Italian)", "English"],
    best_time_for: {
      honeymoon_ar: "أبريل–مايو أو سبتمبر–أكتوبر — رومانسي مثالي",
      honeymoon_en: "April–May or September–October — perfectly romantic",
      family_ar: "يونيو–يوليو — أيام طويلة وحدائق جميلة",
      family_en: "June–July — long days and beautiful parks",
      adventure_ar: "مايو–سبتمبر — ركوب الدراجات واستكشاف الآثار",
      adventure_en: "May–September — cycling and exploring ruins",
      budget_ar: "نوفمبر–مارس — أرخص 40% لكن بارد",
      budget_en: "November–March — 40% cheaper but cold"
    }
  },

  // ──────────── BARCELONA ────────────
  BCN: {
    iata: "BCN",
    nameAr: "برشلونة",
    nameEn: "Barcelona",
    country_ar: "إسبانيا",
    country_en: "Spain",
    description_ar: "عاصمة كتالونيا بعمارة غاودي فريدة وشواطئ جميلة وثقافة حية وحياة ليلية ممتعة",
    description_en: "Catalan capital with unique Gaudí architecture, beautiful beaches, vibrant culture, fun nightlife",

    best_months_ar: "أبريل إلى مايو وسبتمبر إلى أكتوبر — ربيع وخريف مثاليان",
    best_months_en: "April–May and September–October — perfect spring and autumn",
    worst_months_ar: "يناير وفبراير — بارد وممطر",
    worst_months_en: "January–February — cold and rainy",
    current_season_ar: "الآن ربيع جميل مع شواطئ دافئة 🌞",
    current_season_en: "Currently beautiful spring with warm beaches 🌞",
    weather_temp_range: "8-22°C",
    weather_description_ar: "معتدل مع احتمال أمطار خفيفة",
    weather_description_en: "Mild with occasional light rain",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة شينغن (Schengen)",
    visa_type_en: "Schengen Visa",
    visa_processing_days: 15,
    visa_cost_usd: 80,
    visa_note_ar: "تأشيرة موحدة لأوروبا — احجز موعد قبل شهر",
    visa_note_en: "Unified Schengen visa — book appointment 1 month ahead",

    safety_level: "good",
    safety_note_ar: "آمنة جداً لكن احذر من النشل في المناطق السياحية والشواطئ",
    safety_note_en: "Safe but watch for pickpockets in tourist areas and beaches",
    cultural_tips_ar: [
      "احترم الهوية الكتالونية — كاتالونيا مختلفة عن إسبانيا",
      "الطعام: باييا (أرز إسباني) وسيفيشي (أطباق بحرية)",
      "الشواطئ: استمتع بثقافة الشاطئ والسباحة",
      "الحياة الليلية: استمتع بالحفلات والمقاهي"
    ],
    cultural_tips_en: [
      "Respect Catalan identity — Catalonia is distinct from Spain",
      "Food: Paella and seafood plates",
      "Beaches: Enjoy beach culture and swimming",
      "Nightlife: Enjoy parties and cafes"
    ],

    currency: "EUR",
    currency_name_ar: "يورو",
    currency_name_en: "Euro",
    usd_exchange_rate: 0.92,
    cost_level: "expensive",
    budget_per_day_usd: {
      budget: 60,
      moderate: 150,
      luxury: 400,
    },

    top_activities_ar: [
      "ساجرادا فاميليا (Sagrada Familia) — كنيسة غاودي الفريدة",
      "بارك غويل — حديقة ملونة بعمارة فنية",
      "كاتالونيا بلازا — ساحة تاريخية مزدحمة",
      "شاطئ برشلونة — سباحة وحياة ليلية",
      "حي القوطي (Gothic Quarter) — أزقة قديمة خلابة"
    ],
    top_activities_en: [
      "Sagrada Familia — Gaudí's unique basilica",
      "Park Güell — colorful artistic garden",
      "Plaça Reial — historic crowded square",
      "Barcelona Beach — swimming and nightlife",
      "Gothic Quarter — charming old narrow streets"
    ],

    packing_tips_ar: [
      "ملابس طبقات — الطقس متقلب",
      "حذاء مريح للمشي",
      "ملابس سباحة — الشواطئ جميلة",
      "معطف خفيف",
      "كاميرا للتصوير"
    ],
    packing_tips_en: [
      "Layered clothing — unpredictable weather",
      "Comfortable walking shoes",
      "Swimwear — beautiful beaches",
      "Light jacket",
      "Camera for photos"
    ],

    local_tips_ar: [
      "نصيحة ذهب: اشتر Barcelona Card — مواصلات وحجوزات ومتاحف مجاني",
      "المترو: سهل وسريع وأرخص",
      "الطعام: تناول الطعام المحلي الإسباني في الحانات الصغيرة",
      "التوقيت: 2-3 أيام كافية",
      "الأسعار: أرخص من باريس وروما"
    ],
    local_tips_en: [
      "Gold tip: Buy Barcelona Card — transport, bookings, museums included",
      "Metro: Easy, fast, and cheap",
      "Food: Try local Spanish food in small bars",
      "Time: 2-3 days enough",
      "Prices: Cheaper than Paris and Rome"
    ],

    timezone: "GMT+1/+2",
    languages: ["Catalan", "Español (Spanish)", "English"],
    best_time_for: {
      honeymoon_ar: "أبريل–مايو أو سبتمبر–أكتوبر — طقس جميل وشواطئ دافئة",
      honeymoon_en: "April–May or September–October — nice weather and warm beaches",
      family_ar: "يونيو–يوليو — شواطئ وأنشطة عائلية",
      family_en: "June–July — beaches and family activities",
      adventure_ar: "مايو–سبتمبر — ركوب الأمواج والرياضات المائية",
      adventure_en: "May–September — surfing and water sports",
      budget_ar: "نوفمبر–مارس — أرخص 40% لكن بارد",
      budget_en: "November–March — 40% cheaper but cold"
    }
  },

  // ──────────── CAIRO ────────────
  CAI: {
    iata: "CAI",
    nameAr: "القاهرة",
    nameEn: "Cairo",
    country_ar: "مصر",
    country_en: "Egypt",
    description_ar: "عاصمة الحضارة بالأهرامات والآثار الفرعونية وحياة مصرية أصيلة وطعم شرقي جميل",
    description_en: "Civilization's capital with pyramids, pharaonic treasures, authentic Egyptian life, beautiful Oriental flavor",

    best_months_ar: "أكتوبر إلى أبريل — طقس معتدل مثالي",
    best_months_en: "October to April — perfect mild weather",
    worst_months_ar: "يونيو إلى أغسطس — حرارة شديدة جداً",
    worst_months_en: "June to August — extremely hot",
    current_season_ar: "الآن طقس مثالي للسياحة والاستكشاف 🌞",
    current_season_en: "Currently perfect weather for tourism and exploring 🌞",
    weather_temp_range: "10-30°C",
    weather_description_ar: "معتدل ومشمس مع هواء صحراوي",
    weather_description_en: "Mild and sunny with desert air",

    visa_required_for_saudis: false,
    visa_type_ar: "بدون فيزا للسعوديين",
    visa_type_en: "Visa-free for Saudis",
    visa_processing_days: 0,
    visa_cost_usd: null,
    visa_note_ar: "دول عربية — لا تحتاج فيزا، جواز السفر فقط",
    visa_note_en: "Arab country — no visa needed, passport only",

    safety_level: "moderate",
    safety_note_ar: "آمنة بشكل عام للسياح في المناطق السياحية، احذر من الازدحام والنشل",
    safety_note_en: "Generally safe for tourists in tourist areas, watch for crowds and pickpockets",
    cultural_tips_ar: [
      "احترم الإسلام — لا تشرب الكحول في الشارع",
      "الملابس: محتشمة في الشارع لكن حرة في الفنادق والحانات",
      "الطعام: جرّب الكشري والفطائر والحلويات المصرية",
      "المفاوضة: متوقع في الأسواق والدكاكين"
    ],
    cultural_tips_en: [
      "Respect Islam — don't drink alcohol in public",
      "Dress: Modest on street but free in hotels and bars",
      "Food: Try koshari, pastries, and Egyptian sweets",
      "Bargaining: Expected in souks and shops"
    ],

    currency: "EGP",
    currency_name_ar: "الجنيه المصري",
    currency_name_en: "Egyptian Pound",
    usd_exchange_rate: 49,
    cost_level: "budget",
    budget_per_day_usd: {
      budget: 30,
      moderate: 80,
      luxury: 200,
    },

    top_activities_ar: [
      "أهرامات الجيزة وأبو الهول — عجائب العالم القديم",
      "المتحف المصري — كنوز فرعونية ومومياوات",
      "قلعة صلاح الدين — تاريخ إسلامي عريق",
      "خان الخليلي — سوق عتيق بحرف يدوية وعطور",
      "نهر النيل — رحلات بحرية رومانسية"
    ],
    top_activities_en: [
      "Giza Pyramids and Great Sphinx — ancient wonders",
      "Egyptian Museum — pharaonic treasures and mummies",
      "Citadel of Saladin — Islamic historic fortifications",
      "Khan El-Khalili — ancient bazaar with handicrafts",
      "Nile River — romantic boat cruises"
    ],

    packing_tips_ar: [
      "ملابس خفيفة — الحرارة عالية",
      "واقي شمس قوي جداً",
      "نظارات شمسية وقبعة",
      "ملابس محتشمة للمناطق الشعبية",
      "حذاء مريح للمشي الكثير"
    ],
    packing_tips_en: [
      "Light clothing — hot temperatures",
      "Very strong sunscreen",
      "Sunglasses and hat",
      "Modest clothes for local areas",
      "Comfortable walking shoes"
    ],

    local_tips_ar: [
      "نصيحة ذهب: خذ جولة منظمة للأهرامات — الزحام كبير والنشل موجود",
      "المترو: رخيص جداً وسريع لكن مزدحم",
      "الطعام: الكشري والفتة والكبدة — لذيذ وأرخص من المطاعم",
      "التسوق: خان الخليلي — افاوض على كل شيء",
      "احذر من التسعيرة المزدوجة للسياح"
    ],
    local_tips_en: [
      "Gold tip: Take organized pyramid tour — crowds and pickpockets",
      "Metro: Very cheap and fast but crowded",
      "Food: Koshari and local street food — delicious and cheap",
      "Shopping: Khan El-Khalili — bargain everything",
      "Beware of double pricing for tourists"
    ],

    timezone: "GMT+2",
    languages: ["العربية (Arabic)", "English"],
    best_time_for: {
      honeymoon_ar: "أكتوبر–نوفمبر أو فبراير–مارس — طقس جميل ورومانسية",
      honeymoon_en: "October–November or February–March — perfect weather and romance",
      family_ar: "ديسمبر–يناير — إجازات المدارس وطقس معتدل",
      family_en: "December–January — school holidays and mild weather",
      adventure_ar: "أكتوبر–أبريل — استكشاف الآثار والصحراء",
      adventure_en: "October–April — exploring monuments and desert",
      budget_ar: "مايو–سبتمبر — أرخص 50% لكن حار جداً",
      budget_en: "May–September — 50% cheaper but very hot"
    }
  },

  // ──────────── AMMAN ────────────
  AMM: {
    iata: "AMM",
    nameAr: "عمّان",
    nameEn: "Amman",
    country_ar: "الأردن",
    country_en: "Jordan",
    description_ar: "عاصمة حديثة بحضارة قديمة — البتراء الوردية والبحر الميت والصحراء الحمراء وضيافة أردنية دافئة",
    description_en: "Modern capital with ancient civilization — Rose City of Petra, Dead Sea, red deserts, warm hospitality",

    best_months_ar: "أكتوبر إلى أبريل — طقس معتدل مثالي",
    best_months_en: "October to April — perfect mild weather",
    worst_months_ar: "يونيو إلى أغسطس — حرارة شديدة جداً",
    worst_months_en: "June to August — extremely hot",
    current_season_ar: "الآن طقس مثالي للاستكشاف والصحراء 🌞",
    current_season_en: "Currently perfect for desert exploration 🌞",
    weather_temp_range: "5-30°C",
    weather_description_ar: "معتدل ومشمس مع ليالي باردة",
    weather_description_en: "Mild and sunny with cool nights",

    visa_required_for_saudis: false,
    visa_type_ar: "بدون فيزا للسعوديين",
    visa_type_en: "Visa-free for Saudis",
    visa_processing_days: 0,
    visa_cost_usd: null,
    visa_note_ar: "دول عربية — لا تحتاج فيزا، جواز السفر فقط",
    visa_note_en: "Arab country — no visa needed, passport only",

    safety_level: "very good",
    safety_note_ar: "آمنة جداً — من أآمن الدول العربية",
    safety_note_en: "Very safe — one of safest Arab countries",
    cultural_tips_ar: [
      "احترم الضيافة الأردنية — الناس يستقبلون السياح بدفء",
      "الطعام: المنسف الأردني والمازة والخبز العربي",
      "الملابس: حرة لكن محتشمة في الأماكن الدينية",
      "القهوة: جرّب القهوة البدوية مع العائلات"
    ],
    cultural_tips_en: [
      "Respect Jordanian hospitality — people welcome tourists warmly",
      "Food: Mansaf (Jordanian lamb stew) and mezze",
      "Dress: Free but modest in religious places",
      "Coffee: Try Bedouin coffee with families"
    ],

    currency: "JOD",
    currency_name_ar: "الدينار الأردني",
    currency_name_en: "Jordanian Dinar",
    usd_exchange_rate: 0.71,
    cost_level: "budget",
    budget_per_day_usd: {
      budget: 40,
      moderate: 100,
      luxury: 250,
    },

    top_activities_ar: [
      "البتراء — العاصمة النبطية الوردية (عجيبة عالمية)",
      "البحر الميت — أخفض نقطة على الأرض، سباحة عائمة",
      "وادي رم — صحراء حمراء خلابة برحلات جمال",
      "عمّان القديمة — حضارة أموية وآثار رومانية",
      "جرش — أطلال رومانية كاملة محفوظة"
    ],
    top_activities_en: [
      "Petra — pink Nabataean capital (world wonder)",
      "Dead Sea — lowest point on Earth, floating swims",
      "Wadi Rum — stunning red desert with camel rides",
      "Downtown Amman — Umayyad and Roman ruins",
      "Jerash — well-preserved Roman ruins"
    ],

    packing_tips_ar: [
      "ملابس طبقات — الصحراء حارة نهاراً وباردة ليلاً",
      "واقي شمس قوي جداً",
      "حذاء مشي قوي للصحراء",
      "معطف دافئ للليل",
      "ملابس سباحة للبحر الميت"
    ],
    packing_tips_en: [
      "Layered clothing — desert hot days, cold nights",
      "Very strong sunscreen",
      "Sturdy hiking shoes for desert",
      "Warm jacket for nights",
      "Swimwear for Dead Sea"
    ],

    local_tips_ar: [
      "نصيحة ذهب: خذ رحلة صحراء في وادي رم — لا تفوت!",
      "البتراء: حجز جولة منظمة أسهل من المشي وحدك",
      "البحر الميت: تعويم طبيعي — خبرة فريدة!",
      "الطعام: المنسف الأصلي لذيذ جداً",
      "المسافات: كل شيء قريب نسبياً من عمّان"
    ],
    local_tips_en: [
      "Gold tip: Take Wadi Rum desert tour — don't miss!",
      "Petra: Organized tour easier than hiking alone",
      "Dead Sea: Natural floating — unique experience!",
      "Food: Authentic mansaf is delicious",
      "Distances: Everything relatively close to Amman"
    ],

    timezone: "GMT+2/+3",
    languages: ["العربية (Arabic)", "English"],
    best_time_for: {
      honeymoon_ar: "أكتوبر–نوفمبر أو فبراير–مارس — طقس رومانسي وصحراء جميلة",
      honeymoon_en: "October–November or February–March — romantic weather and beautiful desert",
      family_ar: "ديسمبر–يناير — رحلات عائلية آمنة",
      family_en: "December–January — safe family trips",
      adventure_ar: "أكتوبر–أبريل — ركوب جمال واستكشاف صحراوي",
      adventure_en: "October–April — camel riding and desert exploration",
      budget_ar: "مايو–سبتمبر — أرخص 50% لكن حار",
      budget_en: "May–September — 50% cheaper but very hot"
    }
  },

  // ──────────── ABU DHABI ────────────
  AUH: {
    iata: "AUH",
    nameAr: "أبوظبي",
    nameEn: "Abu Dhabi",
    country_ar: "الإمارات العربية المتحدة",
    country_en: "United Arab Emirates",
    description_ar: "عاصمة إمارات الذهب — حضارة عربية حديثة مع مساجد ذهبية وحياة فاخرة وتراث عريق",
    description_en: "Capital of Emirates with modern Arab civilization, golden mosques, luxury lifestyle, rich heritage",

    best_months_ar: "نوفمبر إلى مارس — طقس معتدل مثالي",
    best_months_en: "November to March — perfect mild weather",
    worst_months_ar: "يونيو إلى أغسطس — حرارة خانقة جداً",
    worst_months_en: "June to August — scorching heat",
    current_season_ar: "الآن موسم مثالي للسياحة والحياة الخارجية 🌞",
    current_season_en: "Currently perfect for tourism and outdoor life 🌞",
    weather_temp_range: "15-40°C",
    weather_description_ar: "معتدل ومشمس مع رياح خفيفة",
    weather_description_en: "Mild and sunny with gentle winds",

    visa_required_for_saudis: false,
    visa_type_ar: "بدون فيزا للسعوديين",
    visa_type_en: "Visa-free for Saudis",
    visa_processing_days: 0,
    visa_cost_usd: null,
    visa_note_ar: "دول مجلس التعاون — لا تحتاج فيزا",
    visa_note_en: "GCC country — no visa needed",

    safety_level: "excellent",
    safety_note_ar: "آمنة جداً جداً — من أآمن المدن في العالم",
    safety_note_en: "Extremely safe — one of world's safest cities",
    cultural_tips_ar: [
      "احترم الثقافة الإماراتية — الناس متدينون لكن منفتحون",
      "الملابس: محتشمة في الأماكن العامة",
      "المسجد الكبير: يستقبل السياح لكن باحترام",
      "الطعام: تراثي خليجي لذيذ"
    ],
    cultural_tips_en: [
      "Respect Emirati culture — religious but open-minded",
      "Dress: Modest in public areas",
      "Sheikh Zayed Grand Mosque: Welcomes tourists with respect",
      "Food: Delicious traditional Gulf cuisine"
    ],

    currency: "AED",
    currency_name_ar: "الدرهم الإماراتي",
    currency_name_en: "UAE Dirham",
    usd_exchange_rate: 3.67,
    cost_level: "expensive",
    budget_per_day_usd: {
      budget: 100,
      moderate: 250,
      luxury: 600,
    },

    top_activities_ar: [
      "مسجد الشيخ زايد الكبير — عمارة ذهبية حضارية فاخرة",
      "قصر الإمارات — متحف فني وقصر ملكي",
      "جزيرة ياس — ملاهي وشواطئ وسباقات",
      "سوق واقف — حياة تراثية أصيلة",
      "منطقة الكورنيش — شواطئ وحدائق جميلة"
    ],
    top_activities_en: [
      "Sheikh Zayed Grand Mosque — stunning golden architecture",
      "Emirates Palace — luxury royal palace museum",
      "Yas Island — theme parks and beaches",
      "Wahat Souk — authentic traditional heritage",
      "Corniche — beautiful beaches and gardens"
    ],

    packing_tips_ar: [
      "ملابس خفيفة جداً — الحرارة عالية",
      "واقي شمس قوي جداً",
      "نظارات شمسية وقبعة",
      "ملابس محتشمة للمسجد الكبير",
      "حذاء مريح للتسوق والمشي"
    ],
    packing_tips_en: [
      "Very light clothing — hot temperatures",
      "Very strong sunscreen",
      "Sunglasses and hat",
      "Modest clothes for Grand Mosque",
      "Comfortable shoes for shopping"
    ],

    local_tips_ar: [
      "نصيحة ذهب: زيارة المسجد الكبير عند الغروب — إضاءة ذهبية خلابة",
      "المواصلات: استئجر سيارة — أرخص من التاكسي والأوبر",
      "الطعام: تجربة المطاعم الإماراتية التقليدية",
      "الأسعار: أغلى من دبي لكن أكثر حضارة",
      "التوقيت: يومين أو ثلاثة كافية"
    ],
    local_tips_en: [
      "Gold tip: Visit Grand Mosque at sunset — stunning golden lighting",
      "Transport: Rent a car — cheaper than taxi/Uber",
      "Food: Try traditional Emirati restaurants",
      "Prices: More expensive than Dubai but more cultural",
      "Time: 2-3 days enough"
    ],

    timezone: "GMT+4",
    languages: ["العربية (Arabic)", "English"],
    best_time_for: {
      honeymoon_ar: "نوفمبر–ديسمبر أو يناير–فبراير — طقس رومانسي وحياة فاخرة",
      honeymoon_en: "November–December or January–February — romantic weather and luxury",
      family_ar: "ديسمبر–يناير — إجازات مدرسية وأنشطة عائلية",
      family_en: "December–January — school holidays and family activities",
      adventure_ar: "سبتمبر–أكتوبر — ركوب جمال وسفاري صحراوي",
      adventure_en: "September–October — camel riding and desert safari",
      budget_ar: "يونيو–أغسطس — أرخص 50% لكن حار جداً",
      budget_en: "June–August — 50% cheaper but extremely hot"
    }
  },

  // ──────────── DOHA ────────────
  DOH: {
    iata: "DOH",
    nameAr: "الدوحة",
    nameEn: "Doha",
    country_ar: "قطر",
    country_en: "Qatar",
    description_ar: "عاصمة قطرية حديثة بمتاحف عالمية وحياة فاخرة وتراث بدوي وتنمية عمرانية سريعة",
    description_en: "Modern Qatari capital with world-class museums, luxury lifestyle, Bedouin heritage, rapid development",

    best_months_ar: "نوفمبر إلى مارس — طقس معتدل مثالي",
    best_months_en: "November to March — perfect mild weather",
    worst_months_ar: "يونيو إلى أغسطس — حرارة شديدة جداً",
    worst_months_en: "June to August — extremely hot",
    current_season_ar: "الآن موسم مثالي للسياحة والتجول 🌞",
    current_season_en: "Currently perfect season for tourism and sightseeing 🌞",
    weather_temp_range: "15-40°C",
    weather_description_ar: "معتدل ومشمس",
    weather_description_en: "Mild and sunny",

    visa_required_for_saudis: false,
    visa_type_ar: "بدون فيزا للسعوديين",
    visa_type_en: "Visa-free for Saudis",
    visa_processing_days: 0,
    visa_cost_usd: null,
    visa_note_ar: "دول مجلس التعاون — لا تحتاج فيزا",
    visa_note_en: "GCC country — no visa needed",

    safety_level: "excellent",
    safety_note_ar: "آمنة جداً جداً — معدل جرائم منخفض جداً",
    safety_note_en: "Extremely safe — very low crime rate",
    cultural_tips_ar: [
      "احترم الدين الإسلامي — قطر محافظة دينياً",
      "الملابس: محتشمة في الأماكن العامة والشارع",
      "الخمور: ممنوعة في الشارع، متوفرة في الفنادق فقط",
      "الطعام: طعام خليجي أصلي لذيذ"
    ],
    cultural_tips_en: [
      "Respect Islam — Qatar is religiously conservative",
      "Dress: Modest in public and streets",
      "Alcohol: Forbidden in public, only in hotels",
      "Food: Authentic Gulf cuisine"
    ],

    currency: "QAR",
    currency_name_ar: "الريال القطري",
    currency_name_en: "Qatari Riyal",
    usd_exchange_rate: 3.64,
    cost_level: "expensive",
    budget_per_day_usd: {
      budget: 100,
      moderate: 250,
      luxury: 600,
    },

    top_activities_ar: [
      "متحف الفن الإسلامي — مجموعة فنية عالمية",
      "كورنيش الدوحة — مساحات خضراء وإطلالات بحرية",
      "حي الدوحة القديم — حياة تقليدية وسوق عتيق",
      "جزيرة النخلة — شواطئ وملاهي",
      "قرية كاتارا — فن وثقافة وتراث"
    ],
    top_activities_en: [
      "Museum of Islamic Art — world-class collection",
      "Doha Corniche — green spaces and waterfront",
      "Old Doha — traditional life and ancient souk",
      "Pearl Island — beaches and amusement parks",
      "Katara Village — art, culture, and heritage"
    ],

    packing_tips_ar: [
      "ملابس خفيفة — الحرارة عالية",
      "واقي شمس قوي",
      "نظارات شمسية",
      "ملابس محتشمة للأماكن العامة",
      "حذاء مريح"
    ],
    packing_tips_en: [
      "Light clothing — hot temperatures",
      "Strong sunscreen",
      "Sunglasses",
      "Modest clothes for public areas",
      "Comfortable shoes"
    ],

    local_tips_ar: [
      "نصيحة ذهب: متحف الفن الإسلامي مجاني — أفضل متاحف العالم",
      "المواصلات: مترو الدوحة الجديد سهل وسريع",
      "الطعام: المطاعم الخليجية التقليدية لذيذة",
      "الأسعار: مشابهة لأبوظبي والإمارات",
      "يومين أو ثلاثة كافية"
    ],
    local_tips_en: [
      "Gold tip: Islamic Art Museum is free — world-class!",
      "Transport: New Doha metro is easy and efficient",
      "Food: Traditional Gulf restaurants are delicious",
      "Prices: Similar to Abu Dhabi and UAE",
      "2-3 days enough"
    ],

    timezone: "GMT+3",
    languages: ["العربية (Arabic)", "English"],
    best_time_for: {
      honeymoon_ar: "نوفمبر–ديسمبر — طقس رومانسي وفاخرة",
      honeymoon_en: "November–December — romantic weather and luxury",
      family_ar: "ديسمبر–يناير — إجازات مدرسية وأنشطة عائلية",
      family_en: "December–January — school holidays and family activities",
      adventure_ar: "أكتوبر–أبريل — رياضات مائية وصيد",
      adventure_en: "October–April — water sports and fishing",
      budget_ar: "يونيو–أغسطس — أرخص 30% لكن حار جداً",
      budget_en: "June–August — 30% cheaper but very hot"
    }
  },

  // ──────────── RIYADH ────────────
  RUH: {
    iata: "RUH",
    nameAr: "الرياض",
    nameEn: "Riyadh",
    country_ar: "المملكة العربية السعودية",
    country_en: "Saudi Arabia",
    description_ar: "عاصمة سعودية عملاقة بتطور عمراني سريع وحضارة إسلامية عريقة وحياة حديثة فاخرة",
    description_en: "Massive Saudi capital with rapid urban development, Islamic heritage, modern luxury lifestyle",

    best_months_ar: "أكتوبر إلى أبريل — طقس معتدل مثالي",
    best_months_en: "October to April — perfect mild weather",
    worst_months_ar: "يونيو إلى أغسطس — حرارة شديدة جداً",
    worst_months_en: "June to August — extremely hot",
    current_season_ar: "الآن موسم مثالي للسياحة الداخلية 🌞",
    current_season_en: "Currently perfect season for domestic tourism 🌞",
    weather_temp_range: "10-40°C",
    weather_description_ar: "معتدل مع احتمال رياح رملية",
    weather_description_en: "Mild with occasional sandstorms",

    visa_required_for_saudis: false,
    visa_type_ar: "لا تحتاج فيزا — سعودي",
    visa_type_en: "No visa needed — Saudi resident",
    visa_processing_days: 0,
    visa_cost_usd: null,
    visa_note_ar: "وطنك — لا تحتاج فيزا!",
    visa_note_en: "Your home country — no visa!",

    safety_level: "excellent",
    safety_note_ar: "آمنة جداً جداً — مدينة منظمة جداً",
    safety_note_en: "Extremely safe — highly organized city",
    cultural_tips_ar: [
      "احترم الدين الإسلامي — مركز الإسلام في العالم",
      "الملابس: محتشمة جداً في الشارع",
      "الخمور: ممنوعة تماماً",
      "الطعام: طعام خليجي وعالمي"
    ],
    cultural_tips_en: [
      "Respect Islam — center of Islam",
      "Dress: Very modest in public",
      "Alcohol: Completely forbidden",
      "Food: Gulf and international cuisine"
    ],

    currency: "SAR",
    currency_name_ar: "الريال السعودي",
    currency_name_en: "Saudi Riyal",
    usd_exchange_rate: 3.75,
    cost_level: "expensive",
    budget_per_day_usd: {
      budget: 80,
      moderate: 200,
      luxury: 500,
    },

    top_activities_ar: [
      "برج المملكة — إطلالات 360 درجة على الرياض",
      "متحف الآثار — تاريخ عربي وإسلامي",
      "حي الديرة القديم — حياة تاريخية تقليدية",
      "منتزهات الملك عبدالله — حدائق خضراء وترفيه",
      "مول الرياض الجديد (Mall of Saudi Arabia)"
    ],
    top_activities_en: [
      "Kingdom Tower — 360° views of Riyadh",
      "Riyadh Museum — Arab and Islamic history",
      "Old Diriyah — traditional historic heritage",
      "King Abdullah Park — green spaces and recreation",
      "Mall of Saudi Arabia"
    ],

    packing_tips_ar: [
      "ملابس محتشمة جداً — قوانين صارمة",
      "ملابس طبقات — الطقس متقلب",
      "واقي شمس",
      "حذاء مريح للتسوق والتجول",
      "معطف للهواء البارد في الداخل"
    ],
    packing_tips_en: [
      "Very modest clothing — strict dress code",
      "Layered clothes — unpredictable weather",
      "Sunscreen",
      "Comfortable shoes for shopping",
      "Jacket for cold AC indoors"
    ],

    local_tips_ar: [
      "نصيحة ذهب: استكشف أحياء جديدة مثل الحمراء والعليا",
      "التسوق: مولات عملاقة بأسعار معقولة",
      "الطعام: مطاعم خليجية وعالمية ممتازة",
      "المواصلات: أوبر والتاكسي موثوق",
      "تجربة سعودية أصلية"
    ],
    local_tips_en: [
      "Gold tip: Explore new neighborhoods like Hittin and Al-'Ulya",
      "Shopping: Massive malls with reasonable prices",
      "Food: Excellent Gulf and international restaurants",
      "Transport: Reliable Uber and taxis",
      "Authentic Saudi experience"
    ],

    timezone: "GMT+3",
    languages: ["العربية (Arabic)", "English"],
    best_time_for: {
      honeymoon_ar: "أكتوبر–نوفمبر — طقس رومانسي وفاخرة",
      honeymoon_en: "October–November — romantic weather and luxury",
      family_ar: "ديسمبر–يناير — إجازات مدرسية وأنشطة عائلية",
      family_en: "December–January — school holidays and family activities",
      adventure_ar: "نوفمبر–مارس — رحلات صحراوية وكشافات",
      adventure_en: "November–March — desert trips and explorations",
      budget_ar: "يونيو–أغسطس — أرخص لكن حار جداً",
      budget_en: "June–August — cheaper but extremely hot"
    }
  },

  // ──────────── SEOUL ────────────
  ICN: {
    iata: "ICN",
    nameAr: "سيول",
    nameEn: "Seoul",
    country_ar: "كوريا الجنوبية",
    country_en: "South Korea",
    description_ar: "عاصمة كورية حديثة بتكنولوجيا ذكية وثقافة بوب وطعام عالمي وحياة ليلية مجنونة",
    description_en: "Modern Korean capital with cutting-edge tech, K-pop culture, amazing food, crazy nightlife",

    best_months_ar: "أبريل إلى مايو وسبتمبر إلى أكتوبر — طقس مثالي",
    best_months_en: "April–May and September–October — perfect weather",
    worst_months_ar: "يناير وفبراير — بارد جداً",
    worst_months_en: "January–February — very cold",
    current_season_ar: "الآن ربيع جميل مع أزهار الكرز 🌸",
    current_season_en: "Currently beautiful spring with cherry blossoms 🌸",
    weather_temp_range: "0-25°C",
    weather_description_ar: "معتدل مع احتمال أمطار",
    weather_description_en: "Mild with occasional rain",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة سياحية (سفارة كوريا)",
    visa_type_en: "Tourist Visa (Korean Embassy)",
    visa_processing_days: 5,
    visa_cost_usd: 60,
    visa_note_ar: "تأشيرة سياحية سهلة — معالجة سريعة",
    visa_note_en: "Easy tourist visa — quick processing",

    safety_level: "excellent",
    safety_note_ar: "آمنة جداً جداً — معدل جرائم منخفض جداً",
    safety_note_en: "Extremely safe — very low crime rate",
    cultural_tips_ar: [
      "احترم الآداب الكورية — الناس لطيفون ومهذبون",
      "الطعام: جرّب الكيمتشي والبيبيمباب والكباب الكوري",
      "الملابس: حرة لكن بسيطة",
      "K-pop والثقافة الكورية في كل مكان"
    ],
    cultural_tips_en: [
      "Respect Korean etiquette — people are polite",
      "Food: Try kimchi, bibimbap, Korean BBQ",
      "Dress: Free but casual",
      "K-pop culture everywhere"
    ],

    currency: "KRW",
    currency_name_ar: "الوون الكوري",
    currency_name_en: "Korean Won",
    usd_exchange_rate: 1300,
    cost_level: "moderate",
    budget_per_day_usd: {
      budget: 50,
      moderate: 120,
      luxury: 300,
    },

    top_activities_ar: [
      "معبد بوكغوكسا — معبد بوذي جميل",
      "نيسيل سيدار وحي جانغماي — ثقافة K-pop",
      "قصر ديوكسوجونج الملكي — عمارة ملكية",
      "مدينة إنسادونج — فن وحرف يدوية",
      "حي هونداي والتسوق الحديث"
    ],
    top_activities_en: [
      "Bukchon Hanok Village — traditional Korean houses",
      "Gangnam District — K-pop culture center",
      "Deoksugung Palace — royal architecture",
      "Insadong — art and traditional crafts",
      "Myeongdong — modern shopping"
    ],

    packing_tips_ar: [
      "ملابس طبقات — الطقس متقلب",
      "حذاء مريح للمشي الكثير",
      "معطف دافئ",
      "حقيبة صغيرة",
      "نظارات شمسية"
    ],
    packing_tips_en: [
      "Layered clothing — unpredictable weather",
      "Comfortable walking shoes",
      "Warm jacket",
      "Small bag",
      "Sunglasses"
    ],

    local_tips_ar: [
      "نصيحة ذهب: بطاقة T-money — تعمل في مترو والحافلات والمتاجر",
      "الطعام: المطاعم الصغيرة أرخص من الكبيرة",
      "التسوق: ميونج دونج والمولات رخيصة",
      "K-pop: زيارة استوديوهات التدريب",
      "الحياة الليلية: مجنونة وممتعة"
    ],
    local_tips_en: [
      "Gold tip: T-money card — metro, buses, shops",
      "Food: Small restaurants cheaper than big ones",
      "Shopping: Myeongdong prices are affordable",
      "K-pop: Visit training studios",
      "Nightlife: Crazy and fun"
    ],

    timezone: "GMT+9",
    languages: ["한국어 (Korean)", "English limited"],
    best_time_for: {
      honeymoon_ar: "مارس–أبريل أو أكتوبر–نوفمبر — طقس رومانسي",
      honeymoon_en: "March–April or October–November — romantic weather",
      family_ar: "يوليو–أغسطس — إجازات مدرسية",
      family_en: "July–August — school holidays",
      adventure_ar: "مايو–سبتمبر — ركوب الدراجات والمشي",
      adventure_en: "May–September — biking and hiking",
      budget_ar: "ديسمبر–فبراير — أرخص لكن بارد",
      budget_en: "December–February — cheaper but cold"
    }
  },

  // ──────────── KUALA LUMPUR ────────────
  KUL: {
    iata: "KUL",
    nameAr: "كوالالمبور",
    nameEn: "Kuala Lumpur",
    country_ar: "ماليزيا",
    country_en: "Malaysia",
    description_ar: "عاصمة ماليزية حديثة بأبراج توأم طويلة وحياة متعددة الثقافات وطعام شارع ممتاز وأسعار رخيصة",
    description_en: "Modern Malaysian capital with iconic Twin Towers, multicultural life, amazing street food, cheap prices",

    best_months_ar: "فبراير إلى أبريل وأغسطس إلى أكتوبر — أقل أمطاراً",
    best_months_en: "February to April and August to October — least rainy",
    worst_months_ar: "مايو إلى يوليو ونوفمبر إلى يناير — موسم أمطار ثقيل",
    worst_months_en: "May to July and November to January — heavy rain",
    current_season_ar: "الآن موسم مثالي — طقس جميل وأسعار معقولة 🌞",
    current_season_en: "Currently ideal — pleasant weather and good prices 🌞",
    weather_temp_range: "22-32°C",
    weather_description_ar: "دافئ ورطب مع احتمال أمطار قصيرة",
    weather_description_en: "Warm and humid with occasional short showers",

    visa_required_for_saudis: false,
    visa_type_ar: "بدون فيزا (30 يوم)",
    visa_type_en: "Visa-free (30 days)",
    visa_processing_days: 0,
    visa_cost_usd: null,
    visa_note_ar: "السعوديون يحصلون على 30 يوم بدون فيزا",
    visa_note_en: "Saudis get 30 days visa-free",

    safety_level: "good",
    safety_note_ar: "آمنة للسياح لكن احذر من النشل في الأسواق والمترو",
    safety_note_en: "Safe for tourists but watch for pickpockets in markets and metro",
    cultural_tips_ar: [
      "احترم التنوع الديني — مسلمون وهندوس وصينيون وبوذيون",
      "الملابس: حرة في وسط المدينة، محتشمة في المساجد",
      "الطعام: متعدد الثقافات وعالمي جداً",
      "النقل: اترجم باللغة الملايو"
    ],
    cultural_tips_en: [
      "Respect religious diversity — Muslims, Hindus, Chinese, Buddhists",
      "Dress: Free downtown, modest at mosques",
      "Food: Multicultural and diverse",
      "Transport: Learn basic Malay"
    ],

    currency: "MYR",
    currency_name_ar: "رينجيت ماليزي",
    currency_name_en: "Malaysian Ringgit",
    usd_exchange_rate: 4.5,
    cost_level: "budget",
    budget_per_day_usd: {
      budget: 30,
      moderate: 80,
      luxury: 200,
    },

    top_activities_ar: [
      "أبراج بتروناس التوأم — أيقونة كوالالمبور",
      "معبد ثيان ماي — معبد صيني رائع",
      "سوق بتالينج — أسواق عتيقة وحرف يدوية",
      "حديقة بيردبارك — طيور وحياة برية",
      "برج كوالالمبور — إطلالات 360 درجة"
    ],
    top_activities_en: [
      "Petronas Twin Towers — iconic Kuala Lumpur skyline",
      "Thean Hou Temple — beautiful Chinese temple",
      "Petaling Street Market — ancient souks and crafts",
      "Bird Park — birds and wildlife",
      "KL Tower — 360° views"
    ],

    packing_tips_ar: [
      "ملابس خفيفة جداً — الرطوبة عالية",
      "واقي شمس قوي",
      "مظلة أو معطف مقاوم للماء — أمطار متوقعة",
      "حذاء مائي",
      "حقيبة صغيرة آمنة"
    ],
    packing_tips_en: [
      "Very light clothing — high humidity",
      "Strong sunscreen",
      "Umbrella or rain jacket — expect showers",
      "Water shoes",
      "Secure small bag"
    ],

    local_tips_ar: [
      "نصيحة ذهب: تناول طعام الشارع — أرخص ولذيذ جداً (5-10 رينجيت)",
      "المترو: سهل وسريع وأرخص من التاكسي",
      "الطعام: تجربة الراتيه والنودلز والساتيه",
      "الأسعار: الأرخص في جنوب شرق آسيا",
      "التوقيت: يومين كافية"
    ],
    local_tips_en: [
      "Gold tip: Eat street food — cheapest and tastiest (5-10 ringgit)",
      "Metro: Easy, fast, cheaper than taxi",
      "Food: Laksa, noodles, satay are must-tries",
      "Prices: Cheapest in Southeast Asia",
      "Time: 2 days enough"
    ],

    timezone: "GMT+8",
    languages: ["Bahasa Malaysia (Malay)", "English"],
    best_time_for: {
      honeymoon_ar: "فبراير–أبريل — طقس رومانسي وأسعار معقولة",
      honeymoon_en: "February–April — romantic weather and good prices",
      family_ar: "يونيو–يوليو — إجازات مدرسية وأنشطة عائلية",
      family_en: "June–July — school holidays and family activities",
      adventure_ar: "أغسطس–أكتوبر — رياضات مائية والغابات",
      adventure_en: "August–October — water sports and jungles",
      budget_ar: "نوفمبر–يناير — أرخص 30% لكن ممطر",
      budget_en: "November–January — 30% cheaper but rainy"
    }
  },

  // ──────────── ANTALYA ────────────
  AYT: {
    iata: "AYT",
    nameAr: "أنطاليا",
    nameEn: "Antalya",
    country_ar: "تركيا",
    country_en: "Turkey",
    description_ar: "منتجع ساحلي تركي جميل بشواطئ بيضاء وأطلال قديمة وحياة ليلية وآثار رومانية",
    description_en: "Beautiful Turkish coastal resort with white beaches, ancient ruins, vibrant nightlife, Roman treasures",

    best_months_ar: "أبريل إلى يونيو وسبتمبر إلى أكتوبر — طقس مثالي",
    best_months_en: "April–June and September–October — perfect weather",
    worst_months_ar: "يناير وفبراير — بارد وممطر",
    worst_months_en: "January–February — cold and rainy",
    current_season_ar: "الآن ربيع جميل مع شواطئ دافئة 🌞",
    current_season_en: "Currently beautiful spring with warm beaches 🌞",
    weather_temp_range: "10-30°C",
    weather_description_ar: "معتدل مع احتمال أمطار خفيفة",
    weather_description_en: "Mild with occasional light rain",

    visa_required_for_saudis: false,
    visa_type_ar: "فيزا إلكترونية (e-Visa)",
    visa_type_en: "e-Visa (online)",
    visa_processing_days: 0,
    visa_cost_usd: 15,
    visa_note_ar: "فيزا إلكترونية سهلة — 10 دقائق أون لاين",
    visa_note_en: "Easy e-Visa — 10 minutes online",

    safety_level: "very good",
    safety_note_ar: "آمنة جداً — من أآمن المناطق السياحية في تركيا",
    safety_note_en: "Very safe — one of safest tourism areas in Turkey",
    cultural_tips_ar: [
      "احترم الثقافة التركية — الناس لطيفون مع السياح",
      "الملابس: حرة على الشاطئ، محتشمة في المناطق الشعبية",
      "الطعام: طعام تركي لذيذ رخيص",
      "المفاوضة: متوقعة في الأسواق"
    ],
    cultural_tips_en: [
      "Respect Turkish culture — people are hospitable",
      "Dress: Free on beach, modest in local areas",
      "Food: Delicious Turkish food, affordable",
      "Bargaining: Expected in souks"
    ],

    currency: "TRY",
    currency_name_ar: "الليرة التركية",
    currency_name_en: "Turkish Lira",
    usd_exchange_rate: 31,
    cost_level: "moderate",
    budget_per_day_usd: {
      budget: 35,
      moderate: 90,
      luxury: 200,
    },

    top_activities_ar: [
      "شاطئ كليوباترا — شاطئ جميل برمل أبيض",
      "مدينة آسبندوس الرومانية — أطلال رومانية محفوظة",
      "تلفريك الجبل — إطلالات بحرية رائعة",
      "الغطس والشواطئ — رياضات مائية",
      "حي كاليتشي القديم — أزقة عتيقة وحانات"
    ],
    top_activities_en: [
      "Cleopatra Beach — beautiful white sand beach",
      "Aspendos Ancient City — well-preserved Roman ruins",
      "Mountain Gondola — stunning sea views",
      "Diving and Beaches — water sports",
      "Kaleici Old Town — charming old streets"
    ],

    packing_tips_ar: [
      "ملابس سباحة — الشواطئ الأساسية",
      "واقي شمس قوي",
      "ملابس خفيفة وفضفاضة",
      "حذاء مريح للمشي",
      "معطف خفيف للمساء"
    ],
    packing_tips_en: [
      "Swimwear — beaches are key",
      "Strong sunscreen",
      "Light and loose clothing",
      "Comfortable walking shoes",
      "Light jacket for evenings"
    ],

    local_tips_ar: [
      "نصيحة ذهب: ابق في كاليتشي — فندق فقط وشاطئ قريب",
      "المواصلات: أوبر والتاكسي موثوق",
      "الطعام: مطاعم الشاطئ جيدة لكن أغلى",
      "الرياضات المائية: غوص وغطس رخيص",
      "التوقيت: 3-4 أيام كافية"
    ],
    local_tips_en: [
      "Gold tip: Stay in Kaleici — old town with beach access",
      "Transport: Uber and taxis reliable",
      "Food: Beach restaurants good but pricier",
      "Water sports: Diving and snorkeling affordable",
      "Time: 3-4 days enough"
    ],

    timezone: "GMT+3",
    languages: ["Türkçe (Turkish)", "English"],
    best_time_for: {
      honeymoon_ar: "أبريل–مايو أو سبتمبر–أكتوبر — طقس رومانسي وشواطئ جميلة",
      honeymoon_en: "April–May or September–October — romantic weather and beautiful beaches",
      family_ar: "يونيو–أغسطس — شواطئ آمنة وأنشطة عائلية",
      family_en: "June–August — safe beaches and family activities",
      adventure_ar: "مايو–يونيو — غطس وركوب أمواج",
      adventure_en: "May–June — diving and windsurfing",
      budget_ar: "نوفمبر–مارس — أرخص 50% لكن بارد",
      budget_en: "November–March — 50% cheaper but cold"
    }
  },

  // ──────────── NEW YORK ────────────
  JFK: {
    iata: "JFK",
    nameAr: "نيويورك",
    nameEn: "New York",
    country_ar: "الولايات المتحدة الأمريكية",
    country_en: "United States",
    description_ar: "مدينة عملاقة تتنام أبداً — ناطحات سحاب، ثقافة، فنون، مطاعم عالمية، حياة ليلية مجنونة",
    description_en: "Massive city that never sleeps — skyscrapers, culture, arts, world cuisine, crazy nightlife",

    best_months_ar: "أبريل إلى مايو وسبتمبر إلى أكتوبر — ربيع وخريف مثاليان",
    best_months_en: "April–May and September–October — perfect spring and fall",
    worst_months_ar: "يناير وفبراير — بارد جداً وثلج",
    worst_months_en: "January–February — very cold and snowy",
    current_season_ar: "الآن ربيع جميل مع أيام طويلة 🌸",
    current_season_en: "Currently beautiful spring with long days 🌸",
    weather_temp_range: "0-25°C",
    weather_description_ar: "معتدل مع احتمال أمطار",
    weather_description_en: "Mild with occasional rain",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة أمريكية (سفارة أمريكية)",
    visa_type_en: "US Visa (US Embassy)",
    visa_processing_days: 30,
    visa_cost_usd: 160,
    visa_note_ar: "تأشيرة أمريكية — معالجة طويلة، احجز موعد مبكراً",
    visa_note_en: "US visa — lengthy process, book appointment early",

    safety_level: "good",
    safety_note_ar: "آمنة بشكل عام في وسط المدينة والسياحية، احذر من الأحياء الشعبية ليلاً",
    safety_note_en: "Generally safe in downtown and tourist areas, avoid poor neighborhoods at night",
    cultural_tips_ar: [
      "احترم التنوع الثقافي — مدينة متعددة الثقافات",
      "الملابس: حرة تماماً",
      "الطعام: مطاعم عالمية من كل دول العالم",
      "الحياة الليلية: مجنونة وممتعة"
    ],
    cultural_tips_en: [
      "Respect cultural diversity — melting pot city",
      "Dress: Complete freedom",
      "Food: World cuisines from every nation",
      "Nightlife: Crazy and fun"
    ],

    currency: "USD",
    currency_name_ar: "دولار أمريكي",
    currency_name_en: "US Dollar",
    usd_exchange_rate: 1,
    cost_level: "expensive",
    budget_per_day_usd: {
      budget: 100,
      moderate: 250,
      luxury: 600,
    },

    top_activities_ar: [
      "تايم سكوير — ساحة مزدحمة بضوء والإعلانات",
      "إمبير ستيت بيلدينج — برج تاريخي بإطلالات",
      "متحف الفن الحديث (MoMA) — فن عالمي",
      "سنترال بارك — حديقة عملاقة وسط المدينة",
      "ستاتيو أوف ليبرتي — رمز أمريكي"
    ],
    top_activities_en: [
      "Times Square — bustling square with lights and ads",
      "Empire State Building — historic tower with views",
      "MoMA — world-class modern art",
      "Central Park — giant park in city center",
      "Statue of Liberty — American icon"
    ],

    packing_tips_ar: [
      "ملابس طبقات — الطقس متقلب",
      "حذاء مريح جداً — المدينة تتطلب مشي كثير",
      "معطف دافئ",
      "حقيبة صغيرة آمنة",
      "بطاقة الائتمان — كل شيء بطاقة"
    ],
    packing_tips_en: [
      "Layered clothing — unpredictable weather",
      "Very comfortable shoes — lots of walking",
      "Warm jacket",
      "Secure small bag",
      "Credit card — everything is card-based"
    ],

    local_tips_ar: [
      "نصيحة ذهب: اشتر MetroCard — مترو رخيص وسريع",
      "الطعام: تناول من الشارع (Hot dogs, pretzels) رخيص",
      "المطاعم: نيويورك لديها أفضل مطاعم عالمية",
      "الأسعار: غالية لكن جودة عالية",
      "التوقيت: أسبوع كامل للاستمتاع"
    ],
    local_tips_en: [
      "Gold tip: Buy MetroCard — cheap and fast metro",
      "Food: Street food (hot dogs, pretzels) cheap",
      "Restaurants: NYC has world's best cuisines",
      "Prices: Expensive but high quality",
      "Time: Full week ideal"
    ],

    timezone: "GMT-5/-4",
    languages: ["English", "Spanish", "Many others"],
    best_time_for: {
      honeymoon_ar: "أبريل–مايو أو سبتمبر–أكتوبر — رومانسي مثالي",
      honeymoon_en: "April–May or September–October — perfectly romantic",
      family_ar: "يونيو–أغسطس — إجازات مدرسية وأنشطة عائلية",
      family_en: "June–August — school holidays and family activities",
      adventure_ar: "مايو–سبتمبر — المشي في المدينة واستكشاف",
      adventure_en: "May–September — walking and exploring",
      budget_ar: "ديسمبر–مارس — أرخص قليلاً لكن بارد",
      budget_en: "December–March — slightly cheaper but cold"
    }
  },

  // ──────────── MARRAKECH ────────────
  RAK: {
    iata: "RAK",
    nameAr: "مراكش",
    nameEn: "Marrakech",
    country_ar: "المغرب",
    country_en: "Morocco",
    description_ar: "مدينة مغربية ساحرة بأسواق عتيقة، قصور، حدائق، وحياة تقليدية أصيلة وصحراء قريبة",
    description_en: "Enchanting Moroccan city with ancient souks, palaces, gardens, authentic traditional life, nearby desert",

    best_months_ar: "أكتوبر إلى أبريل — طقس معتدل مثالي",
    best_months_en: "October to April — perfect mild weather",
    worst_months_ar: "يونيو إلى أغسطس — حرارة شديدة جداً",
    worst_months_en: "June to August — extremely hot",
    current_season_ar: "الآن موسم مثالي للاستكشاف والسفاري 🌞",
    current_season_en: "Currently perfect for exploration and desert safari 🌞",
    weather_temp_range: "5-30°C",
    weather_description_ar: "معتدل مع احتمال أمطار خفيفة",
    weather_description_en: "Mild with occasional light rain",

    visa_required_for_saudis: false,
    visa_type_ar: "بدون فيزا للسعوديين",
    visa_type_en: "Visa-free for Saudis",
    visa_processing_days: 0,
    visa_cost_usd: null,
    visa_note_ar: "دول عربية — لا تحتاج فيزا",
    visa_note_en: "Arab country — no visa needed",

    safety_level: "good",
    safety_note_ar: "آمنة بشكل عام للسياح، احذر من خداع السياح والنشل في الأسواق",
    safety_note_en: "Generally safe for tourists, watch for scams and pickpockets in souks",
    cultural_tips_ar: [
      "احترم الثقافة المغربية — الناس محترمون وودودون",
      "الملابس: محتشمة في الشارع والأسواق",
      "الطعام: الطاجين والكسكس والحلويات المغربية",
      "المفاوضة: متوقعة وممتعة في الأسواق"
    ],
    cultural_tips_en: [
      "Respect Moroccan culture — people are respectful",
      "Dress: Modest in streets and souks",
      "Food: Tagine, couscous, Moroccan pastries",
      "Bargaining: Expected and fun in souks"
    ],

    currency: "MAD",
    currency_name_ar: "الدرهم المغربي",
    currency_name_en: "Moroccan Dirham",
    usd_exchange_rate: 10,
    cost_level: "budget",
    budget_per_day_usd: {
      budget: 40,
      moderate: 100,
      luxury: 250,
    },

    top_activities_ar: [
      "جامع القرويين — أقدم جامعة في العالم",
      "قصر البادي — قصر ملكي تاريخي",
      "حديقة ماجورelle — حدائق زرقاء خلابة",
      "سوق جماع الفنا — سوق عتيق مزدحم",
      "رحلات صحراوية إلى الصحراء الحمراء"
    ],
    top_activities_en: [
      "Karaouine Mosque — world's oldest university",
      "Bahia Palace — historic royal palace",
      "Majorelle Garden — stunning blue gardens",
      "Jemaa el-Fnaa Market — bustling ancient souk",
      "Desert trips to Sahara"
    ],

    packing_tips_ar: [
      "ملابس طبقات — الطقس متقلب",
      "ملابس محتشمة للأسواق والشارع",
      "حذاء مريح للمشي الكثير",
      "واقي شمس قوي",
      "حقيبة صغيرة آمنة"
    ],
    packing_tips_en: [
      "Layered clothing — unpredictable weather",
      "Modest clothes for souks and streets",
      "Comfortable walking shoes",
      "Strong sunscreen",
      "Secure small bag"
    ],

    local_tips_ar: [
      "نصيحة ذهب: خذ جولة صحراوية في وادي درعة",
      "الأسواق: افاوض على كل شيء — السعر الأول ليس النهائي",
      "الطعام: تناول الطاجين والكسكس من المطاعم الشعبية",
      "الأسعار: مراكش أرخص من الدار البيضاء",
      "التوقيت: 3-4 أيام كافية"
    ],
    local_tips_en: [
      "Gold tip: Take Dades Valley desert tour",
      "Souks: Bargain everything — first price never final",
      "Food: Eat tagine and couscous at local spots",
      "Prices: Cheaper than Casablanca",
      "Time: 3-4 days enough"
    ],

    timezone: "GMT+0/+1",
    languages: ["Darija (Moroccan Arabic)", "Français (French)", "English"],
    best_time_for: {
      honeymoon_ar: "أكتوبر–نوفمبر أو فبراير–مارس — رومانسي مثالي",
      honeymoon_en: "October–November or February–March — perfectly romantic",
      family_ar: "ديسمبر–يناير — إجازات مدرسية وأنشطة عائلية",
      family_en: "December–January — school holidays and family activities",
      adventure_ar: "أكتوبر–أبريل — صحراء وركوب جمال",
      adventure_en: "October–April — desert and camel trekking",
      budget_ar: "مايو–سبتمبر — أرخص 40% لكن حار",
      budget_en: "May–September — 40% cheaper but very hot"
    }
  },

  // Continue with more destinations...
  // MADRID
  MAD: {
    iata: "MAD",
    nameAr: "مدريد",
    nameEn: "Madrid",
    country_ar: "إسبانيا",
    country_en: "Spain",
    description_ar: "عاصمة إسبانية ديناميكية بمتاحف عالمية وحياة ليلية مجنونة وطعام إسباني أصلي وثقافة حية",
    description_en: "Dynamic Spanish capital with world-class museums, vibrant nightlife, authentic cuisine, lively culture",

    best_months_ar: "أبريل إلى مايو وسبتمبر إلى أكتوبر — ربيع وخريف مثاليان",
    best_months_en: "April–May and September–October — perfect spring and fall",
    worst_months_ar: "يونيو إلى أغسطس — حرارة شديدة جداً",
    worst_months_en: "June to August — extremely hot",
    current_season_ar: "الآن ربيع جميل مع إطلالات رومانسية 🌸",
    current_season_en: "Currently beautiful spring with romantic views 🌸",
    weather_temp_range: "5-28°C",
    weather_description_ar: "معتدل مع احتمال أمطار",
    weather_description_en: "Mild with occasional rain",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة شينغن (Schengen)",
    visa_type_en: "Schengen Visa",
    visa_processing_days: 15,
    visa_cost_usd: 80,
    visa_note_ar: "تأشيرة موحدة لأوروبا",
    visa_note_en: "Unified Schengen visa",

    safety_level: "very good",
    safety_note_ar: "آمنة جداً — احذر من النشل في المناطق السياحية",
    safety_note_en: "Very safe — watch for pickpockets in tourist areas",
    cultural_tips_ar: [
      "احترم الحياة الليلية الإسبانية — تبدأ متأخرة",
      "الطعام: طابا وبايا وتاباس إسبانية",
      "الملابس: أنيقة وبسيطة",
      "الحفلات: تستمر حتى الفجر"
    ],
    cultural_tips_en: [
      "Respect Spanish nightlife — starts late",
      "Food: Tapas and paella",
      "Dress: Elegant but casual",
      "Parties: Go until sunrise"
    ],

    currency: "EUR",
    currency_name_ar: "يورو",
    currency_name_en: "Euro",
    usd_exchange_rate: 0.92,
    cost_level: "expensive",
    budget_per_day_usd: {
      budget: 60,
      moderate: 150,
      luxury: 400,
    },

    top_activities_ar: [
      "متحف برادو — أعظم متاحف الفن الأوروبي",
      "قصر الملكي — قصر ملكي كبير",
      "ساحة مايور — ساحة تاريخية مزدحمة",
      "متنزه ريتيرو — حديقة جميلة وسط المدينة",
      "حي الحجازات (La Latina) — أزقة قديمة خلابة"
    ],
    top_activities_en: [
      "Prado Museum — one of Europe's greatest art museums",
      "Royal Palace — grand royal palace",
      "Plaza Mayor — historic crowded square",
      "Retiro Park — beautiful central park",
      "La Latina — charming old streets"
    ],

    packing_tips_ar: [
      "ملابس طبقات",
      "حذاء مريح جداً",
      "معطف خفيف",
      "حقيبة صغيرة آمنة",
      "نظارات شمسية"
    ],
    packing_tips_en: [
      "Layered clothing",
      "Very comfortable shoes",
      "Light jacket",
      "Secure small bag",
      "Sunglasses"
    ],

    local_tips_ar: [
      "نصيحة ذهب: اشتر Madrid Card — مترو ومتاحف مجاني",
      "الطعام: تناول التاباس في الحانات الصغيرة",
      "الحياة الليلية: تبدأ الحفلات بعد منتصف الليل",
      "الأسعار: أرخص من باريس وروما",
      "التوقيت: 3-4 أيام كافية"
    ],
    local_tips_en: [
      "Gold tip: Buy Madrid Card — metro and museums included",
      "Food: Tapas at small bars",
      "Nightlife: Parties start after midnight",
      "Prices: Cheaper than Paris and Rome",
      "Time: 3-4 days enough"
    ],

    timezone: "GMT+1/+2",
    languages: ["Español (Spanish)", "English"],
    best_time_for: {
      honeymoon_ar: "أبريل–مايو أو سبتمبر–أكتوبر",
      honeymoon_en: "April–May or September–October",
      family_ar: "يونيو–يوليو — إجازات مدرسية",
      family_en: "June–July — school holidays",
      adventure_ar: "مايو–سبتمبر — مشي واستكشاف",
      adventure_en: "May–September — walking and exploring",
      budget_ar: "نوفمبر–مارس — أرخص",
      budget_en: "November–March — cheaper"
    }
  },

  // AMSTERDAM
  AMS: {
    iata: "AMS",
    nameAr: "أمستردام",
    nameEn: "Amsterdam",
    country_ar: "هولندا",
    country_en: "Netherlands",
    description_ar: "مدينة قنوات هولندية جميلة بفنون، متاحف، دراجات، وحياة حرة منفتحة",
    description_en: "Beautiful Dutch city of canals, museums, bikes, and open-minded culture",

    best_months_ar: "أبريل إلى مايو وسبتمبر إلى أكتوبر",
    best_months_en: "April–May and September–October",
    worst_months_ar: "نوفمبر إلى فبراير — بارد وممطر",
    worst_months_en: "November to February — cold and rainy",
    current_season_ar: "الآن ربيع جميل مع ترفل الدراجات 🌸",
    current_season_en: "Currently beautiful spring with bikes everywhere 🌸",
    weather_temp_range: "2-20°C",
    weather_description_ar: "معتدل مع احتمال أمطار",
    weather_description_en: "Mild with occasional rain",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة شينغن",
    visa_type_en: "Schengen Visa",
    visa_processing_days: 15,
    visa_cost_usd: 80,
    visa_note_ar: "تأشيرة موحدة لأوروبا",
    visa_note_en: "Unified Schengen visa",

    safety_level: "excellent",
    safety_note_ar: "آمنة جداً — مدينة منظمة وآمنة",
    safety_note_en: "Extremely safe — well-organized city",
    cultural_tips_ar: [
      "احترم الانفتاح الهولندي — الناس صريحون",
      "الدراجات: احذر من حركة المرور على الدراجات",
      "الطعام: جبن وفرقان وتولالي",
      "استئجر دراجة — أفضل طريقة للتنقل"
    ],
    cultural_tips_en: [
      "Respect Dutch openness — direct people",
      "Bikes: Watch bike traffic",
      "Food: Cheese and stroopwafels",
      "Rent a bike — best transport"
    ],

    currency: "EUR",
    currency_name_ar: "يورو",
    currency_name_en: "Euro",
    usd_exchange_rate: 0.92,
    cost_level: "expensive",
    budget_per_day_usd: {
      budget: 70,
      moderate: 180,
      luxury: 450,
    },

    top_activities_ar: [
      "متحف فان غوخ — أعظم لوحات الفنان",
      "متحف آن فرانك — تاريخ الحرب العالمية",
      "جولات بالقارب في القنوات",
      "أسواق الزهور العائمة",
      "محلات الدراجات والدراجات"
    ],
    top_activities_en: [
      "Van Gogh Museum — greatest paintings",
      "Anne Frank House — WWII history",
      "Canal boat tours",
      "Floating flower markets",
      "Bike shops and cycling"
    ],

    packing_tips_ar: [
      "ملابس طبقات",
      "حذاء مريح للدراجة",
      "معطف مقاوم للماء",
      "حقيبة صغيرة آمنة",
      "نظارات شمسية"
    ],
    packing_tips_en: [
      "Layered clothing",
      "Comfortable biking shoes",
      "Waterproof jacket",
      "Secure small bag",
      "Sunglasses"
    ],

    local_tips_ar: [
      "نصيحة ذهب: استأجر دراجة — أرخص من التاكسي",
      "المتاحف: معظمها مجاني يوم واحد في الشهر",
      "الطعام: تناول الفرقان والجبن من الأسواق",
      "القنوات: جميلة جداً خاصة بالليل",
      "التوقيت: يومين أو ثلاثة كافية"
    ],
    local_tips_en: [
      "Gold tip: Rent a bike — cheaper than taxi",
      "Museums: Free entrance one day per month",
      "Food: Stroopwafels and cheese from markets",
      "Canals: Beautiful especially at night",
      "Time: 2-3 days enough"
    ],

    timezone: "GMT+1/+2",
    languages: ["Nederlands (Dutch)", "English"],
    best_time_for: {
      honeymoon_ar: "أبريل–مايو — رومانسي مثالي",
      honeymoon_en: "April–May — perfectly romantic",
      family_ar: "يونيو–يوليو — عطل مدرسية",
      family_en: "June–July — school holidays",
      adventure_ar: "مايو–سبتمبر — ركوب دراجات",
      adventure_en: "May–September — cycling",
      budget_ar: "نوفمبر–مارس — أرخص",
      budget_en: "November–March — cheaper"
    }
  },

  // DELHI
  DEL: {
    iata: "DEL",
    nameAr: "دلهي",
    nameEn: "Delhi",
    country_ar: "الهند",
    country_en: "India",
    description_ar: "عاصمة هندية كاوسية بتاريخ عريق، معابد، أسواق مزدحمة، وحياة شارع جنونية",
    description_en: "Chaotic Indian capital with rich history, temples, crowded markets, and crazy street life",

    best_months_ar: "أكتوبر إلى مارس — طقس معتدل",
    best_months_en: "October to March — mild weather",
    worst_months_ar: "يونيو إلى أغسطس — حرارة وموسم أمطار",
    worst_months_en: "June to August — heat and monsoon",
    current_season_ar: "الآن موسم مثالي — طقس جميل 🌞",
    current_season_en: "Currently perfect season — nice weather 🌞",
    weather_temp_range: "5-40°C",
    weather_description_ar: "معتدل مع احتمال أمطار",
    weather_description_en: "Mild with occasional rain",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة هندية — سفارة",
    visa_type_en: "Indian Visa — Embassy",
    visa_processing_days: 10,
    visa_cost_usd: 100,
    visa_note_ar: "تأشيرة هندية — معالجة سريعة",
    visa_note_en: "Indian visa — quick processing",

    safety_level: "moderate",
    safety_note_ar: "آمنة نسبياً في المناطق السياحية، احذر من الازدحام والنشل",
    safety_note_en: "Relatively safe in tourist areas, watch for crowds and pickpockets",
    cultural_tips_ar: [
      "احترم الهندوسية — المعابد مقدسة",
      "الملابس: محتشمة خاصة للنساء",
      "الطعام: جرّب الكاري والبريياني والخبز الهندي",
      "النقل: فوضوي لكن مثير"
    ],
    cultural_tips_en: [
      "Respect Hinduism — temples are sacred",
      "Dress: Modest, especially for women",
      "Food: Try curry, biryani, Indian bread",
      "Transport: Chaotic but exciting"
    ],

    currency: "INR",
    currency_name_ar: "روبية هندية",
    currency_name_en: "Indian Rupee",
    usd_exchange_rate: 83,
    cost_level: "budget",
    budget_per_day_usd: {
      budget: 20,
      moderate: 60,
      luxury: 150,
    },

    top_activities_ar: [
      "تاج محل في أغرا — قبة حب عالمية",
      "قلعة الحمراء — حصن تاريخي",
      "معبد اللوتس — معبد جميل",
      "سوق الشارقة — سوق عتيق مزدحم",
      "ضريح همايون — عمارة مغولية جميلة"
    ],
    top_activities_en: [
      "Taj Mahal in Agra — world's love monument",
      "Red Fort — historic fortress",
      "Lotus Temple — beautiful temple",
      "Chandni Chowk — bustling ancient market",
      "Humayun's Tomb — beautiful Mughal architecture"
    ],

    packing_tips_ar: [
      "ملابس محتشمة وخفيفة",
      "واقي شمس قوي",
      "أدوية للإسهال — الطعام مختلف",
      "حذاء مريح",
      "حقيبة صغيرة آمنة"
    ],
    packing_tips_en: [
      "Modest and light clothing",
      "Strong sunscreen",
      "Diarrhea meds — different food",
      "Comfortable shoes",
      "Secure small bag"
    ],

    local_tips_ar: [
      "نصيحة ذهب: خذ رحلة منظمة إلى تاج محل",
      "المترو: رخيص وسريع وأسهل من سيارات الأجرة",
      "الطعام: الطعام الشارعي لذيذ جداً لكن احذر",
      "الأسعار: الأرخص في آسيا",
      "التوقيت: أسبوع كامل للاستمتاع"
    ],
    local_tips_en: [
      "Gold tip: Take organized Taj Mahal tour",
      "Metro: Cheap, fast, easier than taxis",
      "Food: Street food delicious but be careful",
      "Prices: Cheapest in Asia",
      "Time: Full week ideal"
    ],

    timezone: "GMT+5:30",
    languages: ["हिन्दी (Hindi)", "English"],
    best_time_for: {
      honeymoon_ar: "أكتوبر–نوفمبر أو فبراير–مارس",
      honeymoon_en: "October–November or February–March",
      family_ar: "ديسمبر–يناير",
      family_en: "December–January",
      adventure_ar: "أكتوبر–مارس — تسلق ودراجات",
      adventure_en: "October–March — trekking and biking",
      budget_ar: "يونيو–سبتمبر — أرخص 50%",
      budget_en: "June–September — 50% cheaper"
    }
  },

  // LISBON
  LIS: {
    iata: "LIS",
    nameAr: "لشبونة",
    nameEn: "Lisbon",
    country_ar: "البرتغال",
    country_en: "Portugal",
    description_ar: "عاصمة برتغالية جميلة بتراس شاطئية، حارات ضيقة، وحياة ساحلية هادئة وممتعة",
    description_en: "Beautiful Portuguese capital with waterfront terraces, narrow streets, relaxed coastal lifestyle",

    best_months_ar: "أبريل إلى مايو وسبتمبر إلى أكتوبر",
    best_months_en: "April–May and September–October",
    worst_months_ar: "نوفمبر إلى فبراير — بارد وممطر",
    worst_months_en: "November to February — cold and rainy",
    current_season_ar: "الآن ربيع جميل مع شواطئ دافئة 🌞",
    current_season_en: "Currently beautiful spring with warm beaches 🌞",
    weather_temp_range: "8-25°C",
    weather_description_ar: "معتدل مع احتمال أمطار",
    weather_description_en: "Mild with occasional rain",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة شينغن",
    visa_type_en: "Schengen Visa",
    visa_processing_days: 15,
    visa_cost_usd: 80,
    visa_note_ar: "تأشيرة موحدة",
    visa_note_en: "Unified Schengen",

    safety_level: "very good",
    safety_note_ar: "آمنة جداً — احذر من النشل الخفيف",
    safety_note_en: "Very safe — watch for minor pickpockets",
    cultural_tips_ar: [
      "احترم الثقافة البرتغالية — الناس لطيفون",
      "الطعام: سمك وفاي جياس وبسطرم",
      "الملابس: حرة وبسيطة",
      "الحياة: بطيئة ومرتاحة"
    ],
    cultural_tips_en: [
      "Respect Portuguese culture — friendly people",
      "Food: Fish and pastéis de nata",
      "Dress: Free and casual",
      "Life: Slow and relaxed"
    ],

    currency: "EUR",
    currency_name_ar: "يورو",
    currency_name_en: "Euro",
    usd_exchange_rate: 0.92,
    cost_level: "moderate",
    budget_per_day_usd: {
      budget: 50,
      moderate: 120,
      luxury: 300,
    },

    top_activities_ar: [
      "برج بيليم — برج تاريخي على النهر",
      "دير جيرونيموس — عمارة قوطية جميلة",
      "تراميفي 28 — سيارة كهربائية تاريخية",
      "شواطئ كاكايس — شواطئ قريبة جميلة",
      "حي ألفاما — أزقة عتيقة خلابة"
    ],
    top_activities_en: [
      "Belém Tower — historic riverside tower",
      "Jerónimos Monastery — beautiful Gothic architecture",
      "Tram 28 — iconic historic streetcar",
      "Cascais Beaches — beautiful nearby beaches",
      "Alfama — charming old streets"
    ],

    packing_tips_ar: [
      "ملابس طبقات",
      "حذاء مريح",
      "معطف خفيف",
      "حقيبة صغيرة",
      "نظارات شمسية"
    ],
    packing_tips_en: [
      "Layered clothing",
      "Comfortable shoes",
      "Light jacket",
      "Small bag",
      "Sunglasses"
    ],

    local_tips_ar: [
      "نصيحة ذهب: استخدم التراميفي والحافلات — رخيصة",
      "الطعام: أرخص من بقية أوروبا",
      "البواخر: جولات نهرية جميلة",
      "الأسعار: أرخص من بقية الغرب",
      "يومين أو ثلاثة كافية"
    ],
    local_tips_en: [
      "Gold tip: Use trams and buses — cheap",
      "Food: Cheaper than rest of Europe",
      "River: Beautiful ferry rides",
      "Prices: Cheaper than Western Europe",
      "2-3 days enough"
    ],

    timezone: "GMT+0/+1",
    languages: ["Português (Portuguese)", "English"],
    best_time_for: {
      honeymoon_ar: "أبريل–مايو أو سبتمبر–أكتوبر",
      honeymoon_en: "April–May or September–October",
      family_ar: "يونيو–يوليو",
      family_en: "June–July",
      adventure_ar: "مايو–سبتمبر — شواطئ",
      adventure_en: "May–September — beaches",
      budget_ar: "نوفمبر–مارس — أرخص",
      budget_en: "November–March — cheaper"
    }
  },

  // BERLIN
  BER: {
    iata: "BER",
    nameAr: "برلين",
    nameEn: "Berlin",
    country_ar: "ألمانيا",
    country_en: "Germany",
    description_ar: "عاصمة ألمانية حديثة بتاريخ عميق وحياة فنية وثقافية غنية وحياة ليلية مجنونة",
    description_en: "Modern German capital with deep history, rich arts culture, vibrant nightlife, edgy vibe",

    best_months_ar: "أبريل إلى مايو وسبتمبر إلى أكتوبر",
    best_months_en: "April–May and September–October",
    worst_months_ar: "نوفمبر إلى فبراير — بارد جداً",
    worst_months_en: "November to February — very cold",
    current_season_ar: "الآن ربيع جميل مع فنون 🌸",
    current_season_en: "Currently beautiful spring with arts 🌸",
    weather_temp_range: "0-22°C",
    weather_description_ar: "معتدل مع احتمال أمطار",
    weather_description_en: "Mild with occasional rain",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة شينغن",
    visa_type_en: "Schengen Visa",
    visa_processing_days: 15,
    visa_cost_usd: 80,
    visa_note_ar: "تأشيرة موحدة",
    visa_note_en: "Unified Schengen",

    safety_level: "very good",
    safety_note_ar: "آمنة جداً — مدينة منظمة جداً",
    safety_note_en: "Very safe — highly organized city",
    cultural_tips_ar: [
      "احترم التاريخ — برلين مركز تاريخي",
      "الطعام: نقانق وبيرة ألمانية",
      "الملابس: حرة وعصرية",
      "الفن: في كل زاوية"
    ],
    cultural_tips_en: [
      "Respect history — Berlin is historical center",
      "Food: Sausages and German beer",
      "Dress: Free and trendy",
      "Art: Everywhere"
    ],

    currency: "EUR",
    currency_name_ar: "يورو",
    currency_name_en: "Euro",
    usd_exchange_rate: 0.92,
    cost_level: "moderate",
    budget_per_day_usd: {
      budget: 60,
      moderate: 150,
      luxury: 400,
    },

    top_activities_ar: [
      "بوابة براندنبورغ — رمز برلين",
      "جدار برلين — تاريخ الحرب الباردة",
      "جزيرة المتاحف — 5 متاحف عالمية",
      "نصب ضحايا المحرقة — ذكرى مهمة",
      "حي كراوسبيرغ — حياة فنية وحفلات"
    ],
    top_activities_en: [
      "Brandenburg Gate — Berlin's symbol",
      "Berlin Wall — Cold War history",
      "Museum Island — 5 world-class museums",
      "Holocaust Memorial — important tribute",
      "Kreuzberg — arts and nightlife"
    ],

    packing_tips_ar: [
      "ملابس طبقات — الطقس متقلب",
      "حذاء مريح",
      "معطف دافئ",
      "حقيبة صغيرة",
      "نظارات شمسية"
    ],
    packing_tips_en: [
      "Layered clothing — unpredictable weather",
      "Comfortable shoes",
      "Warm jacket",
      "Small bag",
      "Sunglasses"
    ],

    local_tips_ar: [
      "نصيحة ذهب: اشتر Berlin WelcomeCard — مواصلات ومتاحف",
      "المترو: سهل وسريع جداً",
      "الطعام: نقانق وبيرة من الحانات الصغيرة",
      "الحياة الليلية: أفضل في أوروبا",
      "التوقيت: 3-4 أيام كافية"
    ],
    local_tips_en: [
      "Gold tip: Buy Berlin WelcomeCard — transport and museums",
      "Metro: Easy and very efficient",
      "Food: Sausages and beer from small bars",
      "Nightlife: Best in Europe",
      "Time: 3-4 days enough"
    ],

    timezone: "GMT+1/+2",
    languages: ["Deutsch (German)", "English"],
    best_time_for: {
      honeymoon_ar: "أبريل–مايو أو سبتمبر–أكتوبر",
      honeymoon_en: "April–May or September–October",
      family_ar: "يونيو–يوليو",
      family_en: "June–July",
      adventure_ar: "مايو–سبتمبر — دراجات وفن",
      adventure_en: "May–September — biking and arts",
      budget_ar: "نوفمبر–مارس — أرخص لكن بارد",
      budget_en: "November–March — cheaper but cold"
    }
  },

  // JEDDAH
  JED: {
    iata: "JED",
    nameAr: "جدة",
    nameEn: "Jeddah",
    country_ar: "المملكة العربية السعودية",
    country_en: "Saudi Arabia",
    description_ar: "مدينة ساحلية سعودية حديثة بشواطئ جميلة وحياة سياحية وآثار تاريخية وتطور سريع",
    description_en: "Modern Saudi coastal city with beautiful beaches, tourism development, historic sites, rapid progress",

    best_months_ar: "أكتوبر إلى مايو — طقس معتدل",
    best_months_en: "October to May — mild weather",
    worst_months_ar: "يونيو إلى أغسطس — حرارة شديدة جداً",
    worst_months_en: "June to August — extremely hot",
    current_season_ar: "الآن موسم مثالي للشواطئ 🌞",
    current_season_en: "Currently perfect for beaches 🌞",
    weather_temp_range: "15-38°C",
    weather_description_ar: "معتدل مع احتمال رياح",
    weather_description_en: "Mild with occasional wind",

    visa_required_for_saudis: false,
    visa_type_ar: "لا تحتاج فيزا — سعودي",
    visa_type_en: "No visa — Saudi",
    visa_processing_days: 0,
    visa_cost_usd: null,
    visa_note_ar: "وطنك!",
    visa_note_en: "Your home!",

    safety_level: "excellent",
    safety_note_ar: "آمنة جداً — مدينة حديثة ومنظمة",
    safety_note_en: "Extremely safe — modern organized city",
    cultural_tips_ar: [
      "احترم الدين الإسلامي",
      "الملابس: محتشمة خاصة خارج الفنادق",
      "الطعام: سعودي وآسيوي وعالمي",
      "الشواطئ: حياة بحرية رائعة"
    ],
    cultural_tips_en: [
      "Respect Islam",
      "Dress: Modest outside hotels",
      "Food: Saudi, Asian, international",
      "Beaches: Great water activities"
    ],

    currency: "SAR",
    currency_name_ar: "الريال السعودي",
    currency_name_en: "Saudi Riyal",
    usd_exchange_rate: 3.75,
    cost_level: "expensive",
    budget_per_day_usd: {
      budget: 100,
      moderate: 250,
      luxury: 600,
    },

    top_activities_ar: [
      "فنتاسيا جدة — عرض فني فريد",
      "حي البلد القديم — حياة تراثية",
      "الواجهة البحرية — شواطئ وحدائق",
      "الغوص والرياضات المائية",
      "أسواق تقليدية ودكاكين"
    ],
    top_activities_en: [
      "Jeddah Fantasy — unique art show",
      "Old Town (Al-Balad) — heritage life",
      "Waterfront — beaches and parks",
      "Diving and water sports",
      "Traditional souks"
    ],

    packing_tips_ar: [
      "ملابس محتشمة وخفيفة",
      "واقي شمس قوي",
      "ملابس سباحة",
      "حذاء مريح",
      "نظارات شمسية"
    ],
    packing_tips_en: [
      "Modest and light clothing",
      "Strong sunscreen",
      "Swimwear",
      "Comfortable shoes",
      "Sunglasses"
    ],

    local_tips_ar: [
      "نصيحة ذهب: استكشف حي البلد القديم",
      "الشواطئ: جميلة جداً خاصة في المساء",
      "الطعام: مطاعم ساحلية عالمية",
      "الرياضات المائية: رخيصة وممتعة",
      "مدينة عائلية آمنة جميلة"
    ],
    local_tips_en: [
      "Gold tip: Explore historic Old Town",
      "Beaches: Beautiful especially evenings",
      "Food: International waterfront restaurants",
      "Water sports: Affordable and fun",
      "Beautiful and safe family city"
    ],

    timezone: "GMT+3",
    languages: ["العربية (Arabic)", "English"],
    best_time_for: {
      honeymoon_ar: "أكتوبر–نوفمبر أو أبريل–مايو",
      honeymoon_en: "October–November or April–May",
      family_ar: "ديسمبر–يناير — إجازات مدرسية",
      family_en: "December–January — school holidays",
      adventure_ar: "أكتوبر–مايو — رياضات مائية",
      adventure_en: "October–May — water sports",
      budget_ar: "يونيو–أغسطس — أرخص لكن حار",
      budget_en: "June–August — cheaper but very hot"
    }
  },

  // MUSCAT
  MCT: {
    iata: "MCT",
    nameAr: "مسقط",
    nameEn: "Muscat",
    country_ar: "سلطنة عمان",
    country_en: "Sultanate of Oman",
    description_ar: "عاصمة عمانية جميلة بجبال ساحرة وشواطئ خلابة وثقافة بدوية وهدوء وسلام",
    description_en: "Beautiful Omani capital with magical mountains, stunning beaches, Bedouin culture, peace and tranquility",

    best_months_ar: "أكتوبر إلى أبريل — طقس معتدل مثالي",
    best_months_en: "October to April — perfect mild weather",
    worst_months_ar: "يونيو إلى أغسطس — حرارة شديدة جداً",
    worst_months_en: "June to August — extremely hot",
    current_season_ar: "الآن موسم مثالي للاستكشاف الساحلي 🌞",
    current_season_en: "Currently perfect for coastal exploration 🌞",
    weather_temp_range: "15-35°C",
    weather_description_ar: "معتدل مع احتمال رياح",
    weather_description_en: "Mild with occasional breeze",

    visa_required_for_saudis: false,
    visa_type_ar: "بدون فيزا للسعوديين",
    visa_type_en: "Visa-free for Saudis",
    visa_processing_days: 0,
    visa_cost_usd: null,
    visa_note_ar: "دول خليجية — لا تحتاج فيزا",
    visa_note_en: "GCC country — no visa needed",

    safety_level: "excellent",
    safety_note_ar: "آمنة جداً جداً — من أآمن المدن في العالم",
    safety_note_en: "Extremely safe — one of world's safest cities",
    cultural_tips_ar: [
      "احترم الثقافة العمانية — الناس لطيفون جداً",
      "الملابس: محتشمة في الشارع",
      "الطعام: طعم خليجي أصلي",
      "الهدوء: استمتع بالسلام"
    ],
    cultural_tips_en: [
      "Respect Omani culture — very friendly people",
      "Dress: Modest in public",
      "Food: Authentic Gulf cuisine",
      "Peace: Enjoy the tranquility"
    ],

    currency: "OMR",
    currency_name_ar: "الريال العماني",
    currency_name_en: "Omani Rial",
    usd_exchange_rate: 0.38,
    cost_level: "expensive",
    budget_per_day_usd: {
      budget: 80,
      moderate: 200,
      luxury: 500,
    },

    top_activities_ar: [
      "مسقط القديمة — قصور وحضارة عريقة",
      "جبل أخضر — منتزه جبلي جميل",
      "شواطئ خنيور — شواطئ بيضاء نظيفة",
      "وادي شاب — طبيعة جبلية خلابة",
      "موسم السلاحف (صيفاً) — سلاحف بحرية"
    ],
    top_activities_en: [
      "Old Muscat — palaces and heritage",
      "Jabal Akdar — beautiful mountain resort",
      "Khaniyra Beaches — white sandy beaches",
      "Wadi Shab — stunning mountain wadis",
      "Turtle season (summer) — sea turtles"
    ],

    packing_tips_ar: [
      "ملابس خفيفة وطبقات",
      "واقي شمس قوي",
      "حذاء مشي قوي للجبال",
      "ملابس سباحة",
      "حقيبة صغيرة"
    ],
    packing_tips_en: [
      "Light and layered clothing",
      "Strong sunscreen",
      "Sturdy hiking shoes",
      "Swimwear",
      "Small bag"
    ],

    local_tips_ar: [
      "نصيحة ذهب: استأجر سيارة — الطرق جميلة جداً",
      "جبل أخضر: برد جميل وحدائق خضراء",
      "الغوص: تجربة رائعة في الخليج",
      "الأسعار: معقولة نسبياً",
      "يومين أو ثلاثة كافية — أو أسبوع كامل"
    ],
    local_tips_en: [
      "Gold tip: Rent a car — beautiful roads",
      "Green Mountain: Cool temps and gardens",
      "Diving: Amazing experience in gulf",
      "Prices: Reasonably priced",
      "2-3 days enough — or a full week"
    ],

    timezone: "GMT+4",
    languages: ["العربية (Arabic)", "English"],
    best_time_for: {
      honeymoon_ar: "أكتوبر–نوفمبر — هادئ ورومانسي",
      honeymoon_en: "October–November — quiet and romantic",
      family_ar: "ديسمبر–يناير — إجازات مدرسية",
      family_en: "December–January — school holidays",
      adventure_ar: "أكتوبر–أبريل — جبال وشواطئ",
      adventure_en: "October–April — mountains and beaches",
      budget_ar: "يونيو–أغسطس — أرخص لكن حار جداً",
      budget_en: "June–August — cheaper but extremely hot"
    }
  },

  // VIENNA
  VIE: {
    iata: "VIE",
    nameAr: "فيينا",
    nameEn: "Vienna",
    country_ar: "النمسا",
    country_en: "Austria",
    description_ar: "عاصمة نمساوية فريدة بقصور ملكية جميلة وموسيقى كلاسيكية وحضارة أوروبية عريقة",
    description_en: "Unique Austrian capital with beautiful royal palaces, classical music, rich European heritage",

    best_months_ar: "أبريل إلى مايو وسبتمبر إلى أكتوبر",
    best_months_en: "April–May and September–October",
    worst_months_ar: "ديسمبر إلى فبراير — بارد وثلج",
    worst_months_en: "December to February — cold and snowy",
    current_season_ar: "الآن ربيع جميل مع قصور ملكية 🌸",
    current_season_en: "Currently beautiful spring with palaces 🌸",
    weather_temp_range: "0-22°C",
    weather_description_ar: "معتدل",
    weather_description_en: "Mild",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة شينغن",
    visa_type_en: "Schengen Visa",
    visa_processing_days: 15,
    visa_cost_usd: 80,
    visa_note_ar: "تأشيرة موحدة",
    visa_note_en: "Unified Schengen",

    safety_level: "excellent",
    safety_note_ar: "آمنة جداً جداً",
    safety_note_en: "Extremely safe",
    cultural_tips_ar: [
      "احترم الموسيقى الكلاسيكية",
      "الطعام: شنيتزل وسترودل",
      "القصور: تاريخ عريق",
      "القهوة: ثقافة فيينية"
    ],
    cultural_tips_en: [
      "Respect classical music culture",
      "Food: Schnitzel and strudel",
      "Palaces: Rich history",
      "Coffee: Viennese culture"
    ],

    currency: "EUR",
    currency_name_ar: "يورو",
    currency_name_en: "Euro",
    usd_exchange_rate: 0.92,
    cost_level: "expensive",
    budget_per_day_usd: {
      budget: 70,
      moderate: 180,
      luxury: 450,
    },

    top_activities_ar: [
      "قصر شونبرون — قصر ملكي عملاق",
      "قصر هوفبورغ — سقياط الإمبراطورة",
      "كاتدرائية سانت ستيفان — عمارة قوطية",
      "الأوبرا الفيينية — عرض موسيقي",
      "متحف الفن التاريخي"
    ],
    top_activities_en: [
      "Schönbrunn Palace — huge imperial palace",
      "Hofburg Palace — Emperor's residence",
      "St. Stephen's Cathedral — Gothic architecture",
      "Vienna Opera House — musical performances",
      "Museum of Art History"
    ],

    packing_tips_ar: [
      "ملابس طبقات",
      "حذاء مريح",
      "معطف دافئ",
      "حقيبة صغيرة",
      "نظارات شمسية"
    ],
    packing_tips_en: [
      "Layered clothing",
      "Comfortable shoes",
      "Warm jacket",
      "Small bag",
      "Sunglasses"
    ],

    local_tips_ar: [
      "نصيحة ذهب: اشتر Vienna Card — مترو ومتاحف",
      "الموسيقى: حضر حفل موسيقي كلاسيكي",
      "القهوة: استمتع بقهوة فيينية تقليدية",
      "الأسعار: غالية لكن جودة عالية",
      "3-4 أيام كافية"
    ],
    local_tips_en: [
      "Gold tip: Buy Vienna Card — metro and museums",
      "Music: Attend classical concert",
      "Coffee: Enjoy traditional Viennese coffee",
      "Prices: Expensive but high quality",
      "3-4 days enough"
    ],

    timezone: "GMT+1/+2",
    languages: ["Deutsch (German)", "English"],
    best_time_for: {
      honeymoon_ar: "أبريل–مايو — رومانسي مثالي",
      honeymoon_en: "April–May — perfectly romantic",
      family_ar: "يونيو–يوليو",
      family_en: "June–July",
      adventure_ar: "مايو–سبتمبر",
      adventure_en: "May–September",
      budget_ar: "نوفمبر–مارس — أرخص لكن بارد",
      budget_en: "November–March — cheaper but cold"
    }
  },

  // PRAGUE
  PRG: {
    iata: "PRG",
    nameAr: "براغ",
    nameEn: "Prague",
    country_ar: "التشيك",
    country_en: "Czech Republic",
    description_ar: "عاصمة تشيكية أوروبية جميلة بعمارة قوطية وساحات تاريخية وجسور قديمة وحياة ليلية",
    description_en: "Beautiful European Czech capital with Gothic architecture, historic squares, old bridges, vibrant nightlife",

    best_months_ar: "أبريل إلى مايو وسبتمبر إلى أكتوبر",
    best_months_en: "April–May and September–October",
    worst_months_ar: "ديسمبر إلى فبراير — بارد جداً",
    worst_months_en: "December to February — very cold",
    current_season_ar: "الآن ربيع جميل 🌸",
    current_season_en: "Currently beautiful spring 🌸",
    weather_temp_range: "-2-20°C",
    weather_description_ar: "معتدل",
    weather_description_en: "Mild",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة شينغن",
    visa_type_en: "Schengen Visa",
    visa_processing_days: 15,
    visa_cost_usd: 80,
    visa_note_ar: "تأشيرة موحدة",
    visa_note_en: "Unified Schengen",

    safety_level: "very good",
    safety_note_ar: "آمنة جداً",
    safety_note_en: "Very safe",
    cultural_tips_ar: [
      "احترم التاريخ",
      "الطعام: بيرة تشيكية وحساء",
      "الملابس: حرة",
      "الحياة: مرتاحة"
    ],
    cultural_tips_en: [
      "Respect history",
      "Food: Czech beer and goulash",
      "Dress: Free",
      "Life: Relaxed"
    ],

    currency: "CZK",
    currency_name_ar: "كورونة تشيكية",
    currency_name_en: "Czech Koruna",
    usd_exchange_rate: 23,
    cost_level: "moderate",
    budget_per_day_usd: {
      budget: 40,
      moderate: 100,
      luxury: 250,
    },

    top_activities_ar: [
      "قلعة براغ — قلعة تاريخية عملاقة",
      "جسر تشارلز — جسر قديم معروف",
      "ساحة البيت البلدي — ساحة مركزية",
      "حي الحي اليهودي — تاريخ عميق",
      "نهر فلتافا — جولات نهرية"
    ],
    top_activities_en: [
      "Prague Castle — huge historic castle",
      "Charles Bridge — famous old bridge",
      "Old Town Square — central square",
      "Jewish Quarter — deep history",
      "Vltava River — river cruises"
    ],

    packing_tips_ar: [
      "ملابس طبقات",
      "حذاء مريح",
      "معطف دافئ",
      "حقيبة صغيرة",
      "نظارات شمسية"
    ],
    packing_tips_en: [
      "Layered clothing",
      "Comfortable shoes",
      "Warm jacket",
      "Small bag",
      "Sunglasses"
    ],

    local_tips_ar: [
      "نصيحة ذهب: تناول البيرة التشيكية الأصلية",
      "المترو: سهل وفعال",
      "الطعام: غولاش وتريديلنيك",
      "الأسعار: أرخص من أوروبا الغربية",
      "2-3 أيام كافية"
    ],
    local_tips_en: [
      "Gold tip: Try authentic Czech beer",
      "Metro: Easy and efficient",
      "Food: Goulash and trdelník",
      "Prices: Cheaper than Western Europe",
      "2-3 days enough"
    ],

    timezone: "GMT+1/+2",
    languages: ["Čeština (Czech)", "English"],
    best_time_for: {
      honeymoon_ar: "أبريل–مايو",
      honeymoon_en: "April–May",
      family_ar: "يونيو–يوليو",
      family_en: "June–July",
      adventure_ar: "مايو–سبتمبر",
      adventure_en: "May–September",
      budget_ar: "نوفمبر–مارس — أرخص",
      budget_en: "November–March — cheaper"
    }
  },

  // ATHENS
  ATH: {
    iata: "ATH",
    nameAr: "أثينا",
    nameEn: "Athens",
    country_ar: "اليونان",
    country_en: "Greece",
    description_ar: "عاصمة يونانية قديمة بآثار إغريقية وجزر جميلة وحياة بحرية ومطاعم سمك ممتازة",
    description_en: "Ancient Greek capital with iconic ruins, beautiful islands, seaside lifestyle, excellent seafood",

    best_months_ar: "أبريل إلى مايو وسبتمبر إلى أكتوبر",
    best_months_en: "April–May and September–October",
    worst_months_ar: "يوليو إلى أغسطس — حرارة شديدة وازدحام",
    worst_months_en: "July to August — extreme heat and crowds",
    current_season_ar: "الآن ربيع جميل مع آثار 🌞",
    current_season_en: "Currently beautiful spring with ruins 🌞",
    weather_temp_range: "10-28°C",
    weather_description_ar: "معتدل مشمس",
    weather_description_en: "Mild and sunny",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة شينغن",
    visa_type_en: "Schengen Visa",
    visa_processing_days: 15,
    visa_cost_usd: 80,
    visa_note_ar: "تأشيرة موحدة",
    visa_note_en: "Unified Schengen",

    safety_level: "good",
    safety_note_ar: "آمنة بشكل عام — احذر من النشل",
    safety_note_en: "Generally safe — watch for pickpockets",
    cultural_tips_ar: [
      "احترم التاريخ الإغريقي",
      "الطعام: سمك وزيتون وفيتا",
      "الملابس: حرة في المدينة",
      "الجزر: حياة بحرية هادئة"
    ],
    cultural_tips_en: [
      "Respect Greek history",
      "Food: Fish, olives, feta",
      "Dress: Free in city",
      "Islands: Peaceful island life"
    ],

    currency: "EUR",
    currency_name_ar: "يورو",
    currency_name_en: "Euro",
    usd_exchange_rate: 0.92,
    cost_level: "moderate",
    budget_per_day_usd: {
      budget: 50,
      moderate: 120,
      luxury: 300,
    },

    top_activities_ar: [
      "الأكروبوليس — أطلال إغريقية",
      "البارثينون — معبد يوناني شهير",
      "الأجورا اليونانية — آثار قديمة",
      "جزر سانتوريني وميكونوس — جزر جميلة",
      "متحف الآثار الوطني"
    ],
    top_activities_en: [
      "Acropolis — iconic Greek ruins",
      "Parthenon — famous Greek temple",
      "Ancient Agora — ancient marketplace ruins",
      "Santorini and Mykonos islands — beautiful islands",
      "National Archaeological Museum"
    ],

    packing_tips_ar: [
      "ملابس خفيفة",
      "واقي شمس قوي",
      "حذاء مريح",
      "ملابس سباحة",
      "نظارات شمسية"
    ],
    packing_tips_en: [
      "Light clothing",
      "Strong sunscreen",
      "Comfortable shoes",
      "Swimwear",
      "Sunglasses"
    ],

    local_tips_ar: [
      "نصيحة ذهب: خذ رحلة إلى جزيرة",
      "الطعام: سمك طازج من المطاعم الساحلية",
      "الأكروبوليس: حضرت في الصباح الباكر لتجنب الحرارة",
      "الأسعار: أرخص من باريس وروما",
      "أسبوع كامل للاستمتاع"
    ],
    local_tips_en: [
      "Gold tip: Take day trip to island",
      "Food: Fresh fish from seaside restaurants",
      "Acropolis: Visit early morning to avoid heat",
      "Prices: Cheaper than Paris and Rome",
      "Full week ideal"
    ],

    timezone: "GMT+2/+3",
    languages: ["Ελληνικά (Greek)", "English"],
    best_time_for: {
      honeymoon_ar: "أبريل–مايو أو سبتمبر–أكتوبر",
      honeymoon_en: "April–May or September–October",
      family_ar: "يونيو–يوليو — جزر وشواطئ",
      family_en: "June–July — islands and beaches",
      adventure_ar: "مايو–سبتمبر — جزر وغطس",
      adventure_en: "May–September — islands and diving",
      budget_ar: "نوفمبر–مارس — أرخص",
      budget_en: "November–March — cheaper"
    }
  },

  // HANOI
  HAN: {
    iata: "HAN",
    nameAr: "هانوي",
    nameEn: "Hanoi",
    country_ar: "فيتنام",
    country_en: "Vietnam",
    description_ar: "عاصمة فيتنامية قديمة بشوارع ضيقة وحياة شارع مزدحمة وطعام رخيص لذيذ جداً",
    description_en: "Ancient Vietnamese capital with narrow streets, bustling street life, cheap delicious food",

    best_months_ar: "أكتوبر إلى مارس — طقس معتدل",
    best_months_en: "October to March — mild weather",
    worst_months_ar: "أبريل إلى يونيو — حرارة ورطوبة عالية",
    worst_months_en: "April to June — extreme heat and humidity",
    current_season_ar: "الآن موسم مثالي — طقس جميل 🌞",
    current_season_en: "Currently perfect season — nice weather 🌞",
    weather_temp_range: "10-30°C",
    weather_description_ar: "معتدل مع احتمال أمطار",
    weather_description_en: "Mild with occasional rain",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة فيتنامية",
    visa_type_en: "Vietnamese Visa",
    visa_processing_days: 5,
    visa_cost_usd: 25,
    visa_note_ar: "تأشيرة سياحية سهلة",
    visa_note_en: "Easy tourist visa",

    safety_level: "good",
    safety_note_ar: "آمنة بشكل عام — احذر من سرقة الدراجات النارية",
    safety_note_en: "Generally safe — watch for bike theft",
    cultural_tips_ar: [
      "احترم التاريخ الفيتنامي",
      "الطعام: فو وحساء وسمسم",
      "الملابس: حرة وخفيفة",
      "الدراجات النارية: في كل مكان"
    ],
    cultural_tips_en: [
      "Respect Vietnamese history",
      "Food: Pho and noodles",
      "Dress: Free and light",
      "Motorbikes: Everywhere"
    ],

    currency: "VND",
    currency_name_ar: "الدونج الفيتنامي",
    currency_name_en: "Vietnamese Dong",
    usd_exchange_rate: 24000,
    cost_level: "budget",
    budget_per_day_usd: {
      budget: 20,
      moderate: 50,
      luxury: 120,
    },

    top_activities_ar: [
      "بحيرة هوان كيم — بحيرة جميلة وسط المدينة",
      "معبد أدعية الأدب — معبد تاريخي",
      "السجن الفرنسي القديم — متحف تاريخي",
      "الحي القديم (36 شارع) — حياة تقليدية",
      "خليج هالونج (قريبة) — طبيعة جميلة"
    ],
    top_activities_en: [
      "Hoan Kiem Lake — beautiful lake in city",
      "Temple of Literature — historic temple",
      "Hanoi Hilton Prison — history museum",
      "Old Quarter (36 Streets) — traditional life",
      "Halong Bay (nearby) — stunning nature"
    ],

    packing_tips_ar: [
      "ملابس خفيفة جداً",
      "واقي شمس",
      "حذاء مريح للشوارع الضيقة",
      "أدوية إسهال",
      "حقيبة صغيرة آمنة"
    ],
    packing_tips_en: [
      "Very light clothing",
      "Sunscreen",
      "Comfortable shoes for narrow streets",
      "Diarrhea meds",
      "Secure small bag"
    ],

    local_tips_ar: [
      "نصيحة ذهب: تناول الطعام من الشارع — أرخص وألذ",
      "الدراجات النارية: احذر من حركة المرور الكاوسية",
      "خليج هالونج: أجمل طبيعة في فيتنام",
      "الأسعار: الأرخص في آسيا تقريباً",
      "3-4 أيام كافية"
    ],
    local_tips_en: [
      "Gold tip: Eat street food — cheapest and tastiest",
      "Motorbikes: Chaotic traffic",
      "Halong Bay: Most beautiful nature",
      "Prices: Cheapest in Asia almost",
      "3-4 days enough"
    ],

    timezone: "GMT+7",
    languages: ["Tiếng Việt (Vietnamese)", "English limited"],
    best_time_for: {
      honeymoon_ar: "أكتوبر–نوفمبر",
      honeymoon_en: "October–November",
      family_ar: "ديسمبر–يناير",
      family_en: "December–January",
      adventure_ar: "أكتوبر–مارس — تسلق وركوب دراجات",
      adventure_en: "October–March — trekking and biking",
      budget_ar: "مايو–سبتمبر — أرخص",
      budget_en: "May–September — cheaper"
    }
  },

  // COLOMBO
  CMB: {
    iata: "CMB",
    nameAr: "كولومبو",
    nameEn: "Colombo",
    country_ar: "سريلانكا",
    country_en: "Sri Lanka",
    description_ar: "عاصمة سريلانكية ساحلية بشواطئ جميلة وحدائق جميلة وطعام حار ممتاز وأسعار رخيصة",
    description_en: "Coastal Sri Lankan capital with beautiful beaches, stunning gardens, great spicy food, cheap prices",

    best_months_ar: "ديسمبر إلى مارس — جاف وشمسي",
    best_months_en: "December to March — dry and sunny",
    worst_months_ar: "يونيو إلى سبتمبر — موسم أمطار ثقيل",
    worst_months_en: "June to September — heavy rain",
    current_season_ar: "الآن موسم مثالي — طقس جميل وشواطئ 🌞",
    current_season_en: "Currently ideal season — nice weather and beaches 🌞",
    weather_temp_range: "20-32°C",
    weather_description_ar: "دافئ وشمسي مع رياح خفيفة",
    weather_description_en: "Warm and sunny with gentle breeze",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة إلكترونية (e-Visa)",
    visa_type_en: "e-Visa (online)",
    visa_processing_days: 0,
    visa_cost_usd: 40,
    visa_note_ar: "فيزا إلكترونية سهلة وسريعة — أون لاين",
    visa_note_en: "Easy e-Visa — quick online",

    safety_level: "good",
    safety_note_ar: "آمنة بشكل عام للسياح",
    safety_note_en: "Generally safe for tourists",
    cultural_tips_ar: [
      "احترم البوذية — معابد مقدسة",
      "الطعام: كاري حار جداً وممتاز",
      "الملابس: محتشمة في المعابد",
      "الشواطئ: حياة بحرية هادئة"
    ],
    cultural_tips_en: [
      "Respect Buddhism — sacred temples",
      "Food: Very spicy delicious curry",
      "Dress: Modest at temples",
      "Beaches: Peaceful beach life"
    ],

    currency: "LKR",
    currency_name_ar: "روبية سريلانكية",
    currency_name_en: "Sri Lankan Rupee",
    usd_exchange_rate: 330,
    cost_level: "budget",
    budget_per_day_usd: {
      budget: 30,
      moderate: 80,
      luxury: 200,
    },

    top_activities_ar: [
      "معبد كيلانيا رجيا — معبد بوذي جميل",
      "حديقة فيهارا ماها ديفي — حديقة جميلة",
      "شواطئ نيغومبو وميريسا — شواطئ جميلة",
      "الريف والتلال الخضراء — طبيعة خلابة",
      "سوق الأسماك والسلاحف البحرية"
    ],
    top_activities_en: [
      "Kelaniya Temple — beautiful Buddhist temple",
      "Viharmahadevi Park — beautiful park",
      "Negombo and Mirissa Beaches — beautiful beaches",
      "Countryside and green hills — stunning nature",
      "Fish markets and sea turtles"
    ],

    packing_tips_ar: [
      "ملابس خفيفة جداً",
      "واقي شمس قوي",
      "ملابس سباحة",
      "حذاء مريح",
      "حقيبة صغيرة آمنة"
    ],
    packing_tips_en: [
      "Very light clothing",
      "Strong sunscreen",
      "Swimwear",
      "Comfortable shoes",
      "Secure small bag"
    ],

    local_tips_ar: [
      "نصيحة ذهب: أستأجر دراجة نارية واستكشف الريف",
      "الطعام: الكاري السريلانكي لذيذ جداً",
      "الشواطئ: سباحة وغوص رخيصة",
      "المعابد: زيارة معابد بوذية جميلة",
      "أسبوع كامل للاستمتاع"
    ],
    local_tips_en: [
      "Gold tip: Rent motorbike and explore countryside",
      "Food: Sri Lankan curry is amazing",
      "Beaches: Swimming and diving cheap",
      "Temples: Beautiful Buddhist temples",
      "Full week ideal"
    ],

    timezone: "GMT+5:30",
    languages: ["Sinhala", "Tamil", "English"],
    best_time_for: {
      honeymoon_ar: "ديسمبر–يناير — رومانسي وشواطئ",
      honeymoon_en: "December–January — romantic and beaches",
      family_ar: "ديسمبر–فبراير — إجازات مدرسية",
      family_en: "December–February — school holidays",
      adventure_ar: "ديسمبر–مارس — شواطئ وغطس وتسلق",
      adventure_en: "December–March — beaches, diving, trekking",
      budget_ar: "أبريل–يونيو — أرخص 50%",
      budget_en: "April–June — 50% cheaper"
    }
  },

  // BANGKOK (additional entry for more coverage) — adding more major cities
  // LOS ANGELES
  LAX: {
    iata: "LAX",
    nameAr: "لوس أنجلوس",
    nameEn: "Los Angeles",
    country_ar: "الولايات المتحدة الأمريكية",
    country_en: "United States",
    description_ar: "مدينة أمريكية ساحرة بشواطئ جميلة وهوليوود وحياة كاليفورنية مريحة ومشمسة",
    description_en: "Enchanting American city with beautiful beaches, Hollywood, laid-back California lifestyle, sunny weather",

    best_months_ar: "أبريل إلى يونيو وسبتمبر إلى نوفمبر — طقس معتدل",
    best_months_en: "April–June and September–November — mild weather",
    worst_months_ar: "يناير — أمطار نادرة لكن ممكنة",
    worst_months_en: "January — occasional rain possible",
    current_season_ar: "الآن ربيع جميل مع شواطئ دافئة 🌞",
    current_season_en: "Currently beautiful spring with warm beaches 🌞",
    weather_temp_range: "10-28°C",
    weather_description_ar: "معتدل مشمس معظم السنة",
    weather_description_en: "Mild and sunny most of year",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة أمريكية",
    visa_type_en: "US Visa",
    visa_processing_days: 30,
    visa_cost_usd: 160,
    visa_note_ar: "تأشيرة أمريكية — معالجة طويلة",
    visa_note_en: "US visa — lengthy process",

    safety_level: "good",
    safety_note_ar: "آمنة بشكل عام في المناطق السياحية",
    safety_note_en: "Generally safe in tourist areas",
    cultural_tips_ar: [
      "احترم الثقافة الكاليفورنية",
      "الطعام: مطاعم عالمية وشارع فود",
      "الملابس: حرة تماماً",
      "الشواطئ: حياة ساحلية"
    ],
    cultural_tips_en: [
      "Respect California culture",
      "Food: World cuisines and street food",
      "Dress: Completely free",
      "Beaches: Beach lifestyle"
    ],

    currency: "USD",
    currency_name_ar: "دولار أمريكي",
    currency_name_en: "US Dollar",
    usd_exchange_rate: 1,
    cost_level: "expensive",
    budget_per_day_usd: {
      budget: 100,
      moderate: 250,
      luxury: 600,
    },

    top_activities_ar: [
      "هوليوود واللافتة الشهيرة",
      "شاطئ سانتا مونيكا — شاطئ جميل",
      "جسر الشهرة (Walk of Fame)",
      "جريفيث أوبزرفتوري — إطلالات جميلة",
      "مولات التسوق الضخمة"
    ],
    top_activities_en: [
      "Hollywood and famous sign",
      "Santa Monica Beach — beautiful beach",
      "Hollywood Walk of Fame",
      "Griffith Observatory — stunning views",
      "Huge shopping malls"
    ],

    packing_tips_ar: [
      "ملابس خفيفة",
      "واقي شمس",
      "ملابس سباحة",
      "حذاء مريح",
      "نظارات شمسية"
    ],
    packing_tips_en: [
      "Light clothing",
      "Sunscreen",
      "Swimwear",
      "Comfortable shoes",
      "Sunglasses"
    ],

    local_tips_ar: [
      "نصيحة ذهب: استأجر سيارة — المسافات كبيرة",
      "المواصلات: أوبر والتاكسي مكلف",
      "الطعام: مطاعم عالمية رائعة",
      "الشواطئ: جميلة وآمنة",
      "أسبوع كامل للاستمتاع"
    ],
    local_tips_en: [
      "Gold tip: Rent a car — distances are big",
      "Transport: Uber and taxis expensive",
      "Food: Amazing world cuisines",
      "Beaches: Beautiful and safe",
      "Full week ideal"
    ],

    timezone: "GMT-8/-7",
    languages: ["English", "Spanish", "Many others"],
    best_time_for: {
      honeymoon_ar: "أبريل–مايو أو سبتمبر–أكتوبر",
      honeymoon_en: "April–May or September–October",
      family_ar: "يونيو–يوليو — إجازات مدرسية",
      family_en: "June–July — school holidays",
      adventure_ar: "مايو–سبتمبر — شواطئ وطبيعة",
      adventure_en: "May–September — beaches and nature",
      budget_ar: "ديسمبر–مارس — أرخص قليلاً",
      budget_en: "December–March — slightly cheaper"
    }
  },

  // MIAMI
  MIA: {
    iata: "MIA",
    nameAr: "ميامي",
    nameEn: "Miami",
    country_ar: "الولايات المتحدة الأمريكية",
    country_en: "United States",
    description_ar: "مدينة ساحلية أمريكية جميلة بشواطئ رملية بيضاء وحياة ليلية مجنونة وحرارة استوائية",
    description_en: "Beautiful American coastal city with white sandy beaches, crazy nightlife, tropical heat",

    best_months_ar: "ديسمبر إلى أبريل — طقس معتدل مثالي",
    best_months_en: "December to April — perfect mild weather",
    worst_months_ar: "يونيو إلى سبتمبر — حرارة وموسم أعاصير",
    worst_months_en: "June to September — heat and hurricane season",
    current_season_ar: "الآن موسم مثالي للشواطئ 🌞",
    current_season_en: "Currently perfect season for beaches 🌞",
    weather_temp_range: "20-32°C",
    weather_description_ar: "دافئ وشمسي مع احتمال أمطار قصيرة",
    weather_description_en: "Warm and sunny with occasional short showers",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة أمريكية",
    visa_type_en: "US Visa",
    visa_processing_days: 30,
    visa_cost_usd: 160,
    visa_note_ar: "تأشيرة أمريكية",
    visa_note_en: "US visa",

    safety_level: "good",
    safety_note_ar: "آمنة في المناطق السياحية والشواطئ",
    safety_note_en: "Safe in tourist areas and beaches",
    cultural_tips_ar: [
      "احترم الثقافة الأمريكية اللاتينية",
      "الطعام: كوبي وأمريكي لاتيني",
      "الملابس: حرة وخفيفة",
      "الحياة الليلية: مجنونة وممتعة"
    ],
    cultural_tips_en: [
      "Respect Latin American culture",
      "Food: Cuban and Latin American",
      "Dress: Free and light",
      "Nightlife: Crazy and fun"
    ],

    currency: "USD",
    currency_name_ar: "دولار أمريكي",
    currency_name_en: "US Dollar",
    usd_exchange_rate: 1,
    cost_level: "expensive",
    budget_per_day_usd: {
      budget: 100,
      moderate: 250,
      luxury: 600,
    },

    top_activities_ar: [
      "ميامي بيتش — شاطئ شهير",
      "فن ديكو (Art Deco) — عمارة جميلة",
      "حي ويند وود — فن وجداريات",
      "مفاقس البحرية — شواطئ قريبة",
      "حياة ليلية في الساحل"
    ],
    top_activities_en: [
      "Miami Beach — famous beach",
      "Art Deco District — beautiful architecture",
      "Wynwood — art and murals",
      "nearby Keys — beautiful islands",
      "Nightlife on the coast"
    ],

    packing_tips_ar: [
      "ملابس خفيفة جداً",
      "واقي شمس قوي جداً",
      "ملابس سباحة",
      "معطف خفيف للمساء",
      "نظارات شمسية"
    ],
    packing_tips_en: [
      "Very light clothing",
      "Very strong sunscreen",
      "Swimwear",
      "Light jacket for evenings",
      "Sunglasses"
    ],

    local_tips_ar: [
      "نصيحة ذهب: استأجر سيارة",
      "المواصلات: أوبر والتاكسي مكلف",
      "الطعام: كوبي وأمريكي لاتيني ممتاز",
      "الشواطئ: آمنة وجميلة",
      "أسبوع كامل"
    ],
    local_tips_en: [
      "Gold tip: Rent a car",
      "Transport: Uber and taxis expensive",
      "Food: Excellent Cuban and Latin food",
      "Beaches: Safe and beautiful",
      "Full week ideal"
    ],

    timezone: "GMT-5/-4",
    languages: ["English", "Spanish"],
    best_time_for: {
      honeymoon_ar: "ديسمبر–يناير أو مارس–أبريل",
      honeymoon_en: "December–January or March–April",
      family_ar: "ديسمبر–يناير",
      family_en: "December–January",
      adventure_ar: "نوفمبر–أبريل — شواطئ وغطس",
      adventure_en: "November–April — beaches and diving",
      budget_ar: "يونيو–سبتمبر — أرخص 50% لكن حار",
      budget_en: "June–September — 50% cheaper but hot"
    }
  },

  // RIO DE JANEIRO
  GIG: {
    iata: "GIG",
    nameAr: "ريو دي جانيرو",
    nameEn: "Rio de Janeiro",
    country_ar: "البرازيل",
    country_en: "Brazil",
    description_ar: "مدينة برازيلية جميلة بشواطئ رملية ذهبية وتمثال المسيح العملاق وحياة ليلية حماسية",
    description_en: "Beautiful Brazilian city with golden sandy beaches, giant Christ statue, vibrant nightlife",

    best_months_ar: "ديسمبر إلى مارس — صيف برازيلي دافئ",
    best_months_en: "December to March — warm Brazilian summer",
    worst_months_ar: "يونيو إلى أغسطس — بارد وممطر",
    worst_months_en: "June to August — cold and rainy",
    current_season_ar: "الآن موسم مثالي — طقس جميل وشواطئ 🌞",
    current_season_en: "Currently perfect season — nice weather and beaches 🌞",
    weather_temp_range: "20-32°C",
    weather_description_ar: "دافئ وشمسي",
    weather_description_en: "Warm and sunny",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة برازيلية",
    visa_type_en: "Brazilian Visa",
    visa_processing_days: 10,
    visa_cost_usd: 100,
    visa_note_ar: "تأشيرة برازيلية سهلة",
    visa_note_en: "Easy Brazilian visa",

    safety_level: "moderate",
    safety_note_ar: "آمنة في الشواطئ والمناطق السياحية، احذر من الأحياء الشعبية",
    safety_note_en: "Safe at beaches and tourist areas, avoid poor neighborhoods",
    cultural_tips_ar: [
      "احترم الثقافة البرازيلية",
      "الطعام: فيجويدا وبراشيل",
      "الملابس: حرة على الشواطئ",
      "الموسيقى: سامبا والرقص"
    ],
    cultural_tips_en: [
      "Respect Brazilian culture",
      "Food: Feijoada and Brazilian BBQ",
      "Dress: Free at beaches",
      "Music: Samba and dancing"
    ],

    currency: "BRL",
    currency_name_ar: "الريال البرازيلي",
    currency_name_en: "Brazilian Real",
    usd_exchange_rate: 5,
    cost_level: "moderate",
    budget_per_day_usd: {
      budget: 60,
      moderate: 150,
      luxury: 400,
    },

    top_activities_ar: [
      "تمثال المسيح العملاق — رمز ريو",
      "شاطئ كوبا كابانا وإيبانيما — شواطئ مشهورة",
      "سوكر دي ساكررا — رحلات جبلية",
      "مدينة السمبا القديمة",
      "حفلات الكرنفال البرازيلي"
    ],
    top_activities_en: [
      "Christ the Redeemer — Rio's symbol",
      "Copacabana and Ipanema Beaches — famous",
      "Sugarloaf Mountain — cable car rides",
      "Historic Samba city",
      "Brazilian Carnival parties"
    ],

    packing_tips_ar: [
      "ملابس خفيفة جداً",
      "واقي شمس قوي جداً",
      "ملابس سباحة",
      "حذاء مريح",
      "حقيبة صغيرة آمنة"
    ],
    packing_tips_en: [
      "Very light clothing",
      "Very strong sunscreen",
      "Swimwear",
      "Comfortable shoes",
      "Secure small bag"
    ],

    local_tips_ar: [
      "نصيحة ذهب: خذ تلفريك إلى تمثال المسيح",
      "الشواطئ: جميلة لكن احذر من السرقات",
      "الطعام: برازيلي وممتاز",
      "الموسيقى والرقص: في كل مكان",
      "أسبوع كامل للاستمتاع"
    ],
    local_tips_en: [
      "Gold tip: Take cable car to Christ statue",
      "Beaches: Beautiful but watch for theft",
      "Food: Brazilian and excellent",
      "Music and dancing: Everywhere",
      "Full week ideal"
    ],

    timezone: "GMT-3/-2",
    languages: ["Português (Portuguese)", "English"],
    best_time_for: {
      honeymoon_ar: "ديسمبر–يناير — رومانسي وشواطئ",
      honeymoon_en: "December–January — romantic and beaches",
      family_ar: "ديسمبر–مارس — شواطئ وأنشطة",
      family_en: "December–March — beaches and activities",
      adventure_ar: "يناير–أبريل — رياضات مائية وطبيعة",
      adventure_en: "January–April — water sports and nature",
      budget_ar: "مايو–أغسطس — أرخص 50%",
      budget_en: "May–August — 50% cheaper"
    }
  },

  // MEXICO CITY
  MEX: {
    iata: "MEX",
    nameAr: "مكسيكو سيتي",
    nameEn: "Mexico City",
    country_ar: "المكسيك",
    country_en: "Mexico",
    description_ar: "عاصمة مكسيكية عريقة بآثار أزتيكية وثقافة غنية وطعام تقليدي لذيذ وأسعار معقولة",
    description_en: "Ancient Mexican capital with Aztec ruins, rich culture, delicious traditional food, reasonable prices",

    best_months_ar: "نوفمبر إلى أبريل — طقس معتدل مثالي",
    best_months_en: "November to April — perfect mild weather",
    worst_months_ar: "يونيو إلى سبتمبر — موسم أمطار ثقيل",
    worst_months_en: "June to September — heavy rain season",
    current_season_ar: "الآن موسم مثالي للاستكشاف الثقافي 🌞",
    current_season_en: "Currently perfect for cultural exploration 🌞",
    weather_temp_range: "5-28°C",
    weather_description_ar: "معتدل مع احتمال أمطار",
    weather_description_en: "Mild with occasional rain",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة مكسيكية",
    visa_type_en: "Mexican Visa",
    visa_processing_days: 5,
    visa_cost_usd: 50,
    visa_note_ar: "تأشيرة مكسيكية سهلة",
    visa_note_en: "Easy Mexican visa",

    safety_level: "moderate",
    safety_note_ar: "آمنة في وسط المدينة والمناطق السياحية",
    safety_note_en: "Safe in downtown and tourist areas",
    cultural_tips_ar: [
      "احترم الثقافة المكسيكية الغنية",
      "الطعام: تاكو وينة وجواكامولي",
      "الملابس: حرة",
      "الفنون: في كل زاوية"
    ],
    cultural_tips_en: [
      "Respect rich Mexican culture",
      "Food: Tacos, enchiladas, guacamole",
      "Dress: Free",
      "Arts: Everywhere"
    ],

    currency: "MXN",
    currency_name_ar: "البيزو المكسيكي",
    currency_name_en: "Mexican Peso",
    usd_exchange_rate: 17,
    cost_level: "budget",
    budget_per_day_usd: {
      budget: 40,
      moderate: 100,
      luxury: 250,
    },

    top_activities_ar: [
      "تمبلو مايور — أطلال أزتيكية",
      "متحف الأنثروبولوجيا — أعظم متاحف أمريكا اللاتينية",
      "حي كويوآكان — فن وثقافة",
      "تشابولتيبيك — قصر وحديقة",
      "ميرت القاهرة أو سويث بيتشت"
    ],
    top_activities_en: [
      "Templo Mayor — Aztec ruins",
      "National Museum of Anthropology — greatest museum",
      "Coyoacán — art and culture district",
      "Chapultepec — palace and park",
      "Frida Kahlo Museum"
    ],

    packing_tips_ar: [
      "ملابس طبقات — الطقس متقلب",
      "حذاء مريح جداً",
      "معطف خفيف",
      "واقي شمس",
      "حقيبة صغيرة آمنة"
    ],
    packing_tips_en: [
      "Layered clothing — unpredictable",
      "Very comfortable shoes",
      "Light jacket",
      "Sunscreen",
      "Secure small bag"
    ],

    local_tips_ar: [
      "نصيحة ذهب: تناول الطعام من الشارع",
      "المترو: رخيص وسريع جداً",
      "الآثار: زيارة معابد أزتيكية",
      "الأسعار: أرخص من أمريكا الشمالية",
      "أسبوع كامل"
    ],
    local_tips_en: [
      "Gold tip: Eat street food",
      "Metro: Cheap and very fast",
      "Ruins: Visit Aztec temples",
      "Prices: Cheaper than North America",
      "Full week ideal"
    ],

    timezone: "GMT-6/-5",
    languages: ["Español (Spanish)", "English"],
    best_time_for: {
      honeymoon_ar: "نوفمبر–ديسمبر أو مارس–أبريل",
      honeymoon_en: "November–December or March–April",
      family_ar: "ديسمبر–يناير",
      family_en: "December–January",
      adventure_ar: "نوفمبر–أبريل — استكشاف ثقافي",
      adventure_en: "November–April — cultural exploration",
      budget_ar: "مايو–أكتوبر — أرخص",
      budget_en: "May–October — cheaper"
    }
  },

  // ZURICH
  ZRH: {
    iata: "ZRH",
    nameAr: "زيوريخ",
    nameEn: "Zurich",
    country_ar: "سويسرا",
    country_en: "Switzerland",
    description_ar: "مدينة سويسرية فاخرة بجبال جميلة وبحيرات نظيفة وحياة منظمة وأسعار عالية جداً",
    description_en: "Luxury Swiss city with beautiful mountains, pristine lakes, organized life, very high prices",

    best_months_ar: "يونيو إلى سبتمبر — صيف جميل وطقس معتدل",
    best_months_en: "June to September — beautiful summer with mild weather",
    worst_months_ar: "نوفمبر إلى فبراير — بارد وثلج",
    worst_months_en: "November to February — cold and snowy",
    current_season_ar: "الآن ربيع جميل مع جبال خضراء 🌸",
    current_season_en: "Currently beautiful spring with green mountains 🌸",
    weather_temp_range: "-2-22°C",
    weather_description_ar: "معتدل مع احتمال ثلج",
    weather_description_en: "Mild with occasional snow",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة شينغن",
    visa_type_en: "Schengen Visa",
    visa_processing_days: 15,
    visa_cost_usd: 80,
    visa_note_ar: "تأشيرة موحدة",
    visa_note_en: "Unified Schengen",

    safety_level: "excellent",
    safety_note_ar: "آمنة جداً جداً — من أآمن دول العالم",
    safety_note_en: "Extremely safe — one of world's safest",
    cultural_tips_ar: [
      "احترم الدقة السويسرية",
      "الطعام: جبن وشوكولاتة وفوندو",
      "الملابس: أنيقة ومنظمة",
      "الطبيعة: جبال جميلة جداً"
    ],
    cultural_tips_en: [
      "Respect Swiss precision",
      "Food: Cheese, chocolate, fondue",
      "Dress: Elegant and organized",
      "Nature: Beautiful mountains"
    ],

    currency: "CHF",
    currency_name_ar: "الفرنك السويسري",
    currency_name_en: "Swiss Franc",
    usd_exchange_rate: 0.88,
    cost_level: "expensive",
    budget_per_day_usd: {
      budget: 150,
      moderate: 350,
      luxury: 800,
    },

    top_activities_ar: [
      "بحيرة زيوريخ — بحيرة جميلة",
      "مادو دي نيمان — قطار جبلي",
      "جبال إنجلترا — طبيعة جميلة",
      "متاحف زيوريخ — فن وتاريخ",
      "رياضات شتوية في الجبال"
    ],
    top_activities_en: [
      "Lake Zurich — beautiful lake",
      "Mount Jungfrau — mountain scenery",
      "English mountains — stunning nature",
      "Zurich museums — art and history",
      "Winter sports in mountains"
    ],

    packing_tips_ar: [
      "ملابس طبقات دافئة جداً",
      "حذاء مشي قوي",
      "معطف ثقيل",
      "قبعة وقفازات",
      "نظارات شمسية"
    ],
    packing_tips_en: [
      "Very warm layered clothing",
      "Sturdy hiking boots",
      "Heavy jacket",
      "Hat and gloves",
      "Sunglasses"
    ],

    local_tips_ar: [
      "نصيحة ذهب: استأجر بطاقة سويس ترافل",
      "المواصلات: قطارات دقيقة وفعالة",
      "الطعام: جبن وشوكولاتة غالية",
      "الأسعار: سويسرا من أغلى دول العالم",
      "3-4 أيام كافية"
    ],
    local_tips_en: [
      "Gold tip: Buy Swiss Travel Card",
      "Transport: Precise and efficient trains",
      "Food: Expensive cheese and chocolate",
      "Prices: One of world's most expensive",
      "3-4 days enough"
    ],

    timezone: "GMT+1/+2",
    languages: ["Deutsch (German)", "Français (French)", "English"],
    best_time_for: {
      honeymoon_ar: "يونيو–أغسطس — رومانسي مثالي",
      honeymoon_en: "June–August — perfectly romantic",
      family_ar: "يوليو–أغسطس — إجازات مدرسية",
      family_en: "July–August — school holidays",
      adventure_ar: "يونيو–سبتمبر — تسلق جبال ومشي",
      adventure_en: "June–September — mountain trekking",
      budget_ar: "ديسمبر–فبراير — أرخص قليلاً لكن بارد",
      budget_en: "December–February — slightly cheaper but cold"
    }
  },

  // CASABLANCA
  CMN: {
    iata: "CMN",
    nameAr: "الدار البيضاء",
    nameEn: "Casablanca",
    country_ar: "المغرب",
    country_en: "Morocco",
    description_ar: "مدينة مغربية ساحلية حديثة بحياة حضرية وشواطئ وثقافة إسلامية عريقة وميناء تاريخي",
    description_en: "Modern coastal Moroccan city with urban life, beaches, Islamic heritage, historic port",

    best_months_ar: "أكتوبر إلى أبريل — طقس معتدل",
    best_months_en: "October to April — mild weather",
    worst_months_ar: "يونيو إلى أغسطس — حرارة شديدة",
    worst_months_en: "June to August — extreme heat",
    current_season_ar: "الآن موسم مثالي — طقس جميل 🌞",
    current_season_en: "Currently perfect season — nice weather 🌞",
    weather_temp_range: "10-28°C",
    weather_description_ar: "معتدل مع احتمال أمطار",
    weather_description_en: "Mild with occasional rain",

    visa_required_for_saudis: false,
    visa_type_ar: "بدون فيزا",
    visa_type_en: "Visa-free",
    visa_processing_days: 0,
    visa_cost_usd: null,
    visa_note_ar: "دول عربية — لا تحتاج فيزا",
    visa_note_en: "Arab country — no visa",

    safety_level: "good",
    safety_note_ar: "آمنة بشكل عام — احذر من النشل",
    safety_note_en: "Generally safe — watch for pickpockets",
    cultural_tips_ar: [
      "احترم الثقافة المغربية",
      "الطعام: بحري وحساء وتاجين",
      "الملابس: محتشمة",
      "الشواطئ: جميلة للسباحة"
    ],
    cultural_tips_en: [
      "Respect Moroccan culture",
      "Food: Seafood and traditional dishes",
      "Dress: Modest",
      "Beaches: Good for swimming"
    ],

    currency: "MAD",
    currency_name_ar: "الدرهم المغربي",
    currency_name_en: "Moroccan Dirham",
    usd_exchange_rate: 10,
    cost_level: "budget",
    budget_per_day_usd: {
      budget: 40,
      moderate: 100,
      luxury: 250,
    },

    top_activities_ar: [
      "مسجد الحسن الثاني — مسجد فريد بناء",
      "حي الميناء القديم — حياة تراثية",
      "شواطئ البيضاء — شواطئ جميلة",
      "سوق السمك — أسواق تقليدية",
      "الحمامات التقليدية"
    ],
    top_activities_en: [
      "Hassan II Mosque — unique architecture",
      "Old Medina — heritage life",
      "Casablanca Beaches — beautiful beaches",
      "Fish Markets — traditional souks",
      "Traditional hammams"
    ],

    packing_tips_ar: [
      "ملابس خفيفة وطبقات",
      "حذاء مريح",
      "واقي شمس",
      "حقيبة صغيرة آمنة",
      "نظارات شمسية"
    ],
    packing_tips_en: [
      "Light and layered clothing",
      "Comfortable shoes",
      "Sunscreen",
      "Secure small bag",
      "Sunglasses"
    ],

    local_tips_ar: [
      "نصيحة ذهب: زيارة مسجد الحسن الثاني الفريد",
      "الشواطئ: جميلة للسباحة والاسترخاء",
      "الطعام: سمك بحري طازج",
      "الأسعار: أرخص من مراكش",
      "يومين أو ثلاثة كافية"
    ],
    local_tips_en: [
      "Gold tip: Visit unique Hassan II Mosque",
      "Beaches: Beautiful for swimming",
      "Food: Fresh seafood",
      "Prices: Cheaper than Marrakech",
      "2-3 days enough"
    ],

    timezone: "GMT+0/+1",
    languages: ["Darija (Moroccan Arabic)", "Français", "English"],
    best_time_for: {
      honeymoon_ar: "أكتوبر–نوفمبر أو مارس–أبريل",
      honeymoon_en: "October–November or March–April",
      family_ar: "ديسمبر–يناير",
      family_en: "December–January",
      adventure_ar: "أكتوبر–أبريل — شواطئ وثقافة",
      adventure_en: "October–April — beaches and culture",
      budget_ar: "مايو–سبتمبر — أرخص 40%",
      budget_en: "May–September — 40% cheaper"
    }
  },

  // CAPE TOWN
  CPT: {
    iata: "CPT",
    nameAr: "كيب تاون",
    nameEn: "Cape Town",
    country_ar: "جنوب أفريقيا",
    country_en: "South Africa",
    description_ar: "مدينة أفريقية جميلة بجبل الطاولة الشهير وشواطئ خلابة وحياة برية وثقافة متنوعة",
    description_en: "Beautiful African city with iconic Table Mountain, stunning beaches, wildlife, diverse culture",

    best_months_ar: "ديسمبر إلى فبراير — صيف جميل",
    best_months_en: "December to February — beautiful summer",
    worst_months_ar: "يونيو إلى أغسطس — بارد وممطر",
    worst_months_en: "June to August — cold and rainy",
    current_season_ar: "الآن موسم مثالي — طقس جميل وشواطئ 🌞",
    current_season_en: "Currently perfect season — nice weather and beaches 🌞",
    weather_temp_range: "10-26°C",
    weather_description_ar: "معتدل مع احتمال أمطار",
    weather_description_en: "Mild with occasional rain",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة جنوب أفريقية",
    visa_type_en: "South African Visa",
    visa_processing_days: 5,
    visa_cost_usd: 100,
    visa_note_ar: "تأشيرة جنوب أفريقية سهلة",
    visa_note_en: "Easy South African visa",

    safety_level: "good",
    safety_note_ar: "آمنة في المناطق السياحية والشواطئ",
    safety_note_en: "Safe in tourist areas and beaches",
    cultural_tips_ar: [
      "احترم التنوع الثقافي الأفريقي",
      "الطعام: لحم وخضروات وبيرة",
      "الملابس: حرة",
      "الطبيعة: أسود وحمار وحشي"
    ],
    cultural_tips_en: [
      "Respect African cultural diversity",
      "Food: Meat, vegetables, beer",
      "Dress: Free",
      "Nature: Lions, zebras, wildlife"
    ],

    currency: "ZAR",
    currency_name_ar: "الراند الجنوب أفريقي",
    currency_name_en: "South African Rand",
    usd_exchange_rate: 18,
    cost_level: "moderate",
    budget_per_day_usd: {
      budget: 50,
      moderate: 120,
      luxury: 300,
    },

    top_activities_ar: [
      "جبل الطاولة — رمز كيب تاون",
      "جزيرة روبن — سجن تاريخي",
      "شاطئ بولديرز — شواطئ جميلة",
      "حديقة كروجر الوطنية — طبيعة برية",
      "جولات للنبيذ"
    ],
    top_activities_en: [
      "Table Mountain — iconic symbol",
      "Robben Island — historic prison",
      "Boulders Beach — beautiful beaches",
      "Kruger National Park — wildlife",
      "Wine tours"
    ],

    packing_tips_ar: [
      "ملابس طبقات",
      "حذاء مشي قوي",
      "معطف خفيف",
      "واقي شمس",
      "حقيبة صغيرة آمنة"
    ],
    packing_tips_en: [
      "Layered clothing",
      "Sturdy hiking boots",
      "Light jacket",
      "Sunscreen",
      "Secure small bag"
    ],

    local_tips_ar: [
      "نصيحة ذهب: خذ تلفريك إلى جبل الطاولة",
      "حديقة كروجر: رحلات سفاري رائعة",
      "النبيذ: مناطق نبيذ جميلة",
      "الأسعار: معقولة نسبياً",
      "أسبوع كامل للاستمتاع"
    ],
    local_tips_en: [
      "Gold tip: Take cable car up Table Mountain",
      "Kruger Park: Amazing safari trips",
      "Wine: Beautiful wine regions",
      "Prices: Reasonably priced",
      "Full week ideal"
    ],

    timezone: "GMT+2",
    languages: ["English", "Afrikaans", "Xhosa"],
    best_time_for: {
      honeymoon_ar: "ديسمبر–يناير أو مارس–أبريل",
      honeymoon_en: "December–January or March–April",
      family_ar: "ديسمبر–فبراير — شواطئ آمنة",
      family_en: "December–February — safe beaches",
      adventure_ar: "سبتمبر–نوفمبر — سفاري وطبيعة",
      adventure_en: "September–November — safari and nature",
      budget_ar: "يونيو–أغسطس — أرخص 30%",
      budget_en: "June–August — 30% cheaper"
    }
  },

  // GENEVA
  GVA: {
    iata: "GVA",
    nameAr: "جنيف",
    nameEn: "Geneva",
    country_ar: "سويسرا",
    country_en: "Switzerland",
    description_ar: "مدينة سويسرية دولية جميلة بجنة بحيرة جميلة وجبال جميلة وحياة منظمة وأسعار عالية",
    description_en: "Beautiful international Swiss city with scenic lake views, mountains, organized life, high prices",

    best_months_ar: "يونيو إلى سبتمبر",
    best_months_en: "June to September",
    worst_months_ar: "نوفمبر إلى فبراير — بارد",
    worst_months_en: "November to February — cold",
    current_season_ar: "الآن ربيع جميل 🌸",
    current_season_en: "Currently beautiful spring 🌸",
    weather_temp_range: "0-22°C",
    weather_description_ar: "معتدل",
    weather_description_en: "Mild",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة شينغن",
    visa_type_en: "Schengen Visa",
    visa_processing_days: 15,
    visa_cost_usd: 80,
    visa_note_ar: "تأشيرة موحدة",
    visa_note_en: "Unified Schengen",

    safety_level: "excellent",
    safety_note_ar: "آمنة جداً جداً",
    safety_note_en: "Extremely safe",
    cultural_tips_ar: [
      "احترم الدولية السويسرية",
      "الطعام: راكليت وفوندو",
      "الملابس: أنيقة",
      "البحيرة: جميلة للمشي"
    ],
    cultural_tips_en: [
      "Respect Swiss internationalism",
      "Food: Raclette and fondue",
      "Dress: Elegant",
      "Lake: Beautiful for walks"
    ],

    currency: "CHF",
    currency_name_ar: "الفرنك السويسري",
    currency_name_en: "Swiss Franc",
    usd_exchange_rate: 0.88,
    cost_level: "expensive",
    budget_per_day_usd: {
      budget: 150,
      moderate: 350,
      luxury: 800,
    },

    top_activities_ar: [
      "بحيرة جنيف — بحيرة جميلة",
      "نافورة جيه — نافورة مشهورة",
      "متاحف جنيف — فن وعلوم",
      "الجبال القريبة — طبيعة",
      "الحدائق الجميلة"
    ],
    top_activities_en: [
      "Lake Geneva — beautiful lake",
      "Jet d'Eau — famous fountain",
      "Geneva museums — art and science",
      "Nearby mountains — nature",
      "Beautiful gardens"
    ],

    packing_tips_ar: [
      "ملابس طبقات دافئة",
      "حذاء مريح",
      "معطف",
      "واقي شمس",
      "نظارات شمسية"
    ],
    packing_tips_en: [
      "Warm layered clothing",
      "Comfortable shoes",
      "Jacket",
      "Sunscreen",
      "Sunglasses"
    ],

    local_tips_ar: [
      "نصيحة ذهب: جولة بحيرة جميلة",
      "المواصلات: قطارات دقيقة",
      "الطعام: فوندو تقليدي",
      "الأسعار: غالية جداً",
      "2-3 أيام كافية"
    ],
    local_tips_en: [
      "Gold tip: Lake boat tour",
      "Transport: Precise trains",
      "Food: Traditional fondue",
      "Prices: Very expensive",
      "2-3 days enough"
    ],

    timezone: "GMT+1/+2",
    languages: ["Français (French)", "English"],
    best_time_for: {
      honeymoon_ar: "يونيو–يوليو — رومانسي",
      honeymoon_en: "June–July — romantic",
      family_ar: "يونيو–أغسطس",
      family_en: "June–August",
      adventure_ar: "مايو–سبتمبر",
      adventure_en: "May–September",
      budget_ar: "ديسمبر–فبراير — أرخص قليلاً",
      budget_en: "December–February — slightly cheaper"
    }
  },

  // MUMBAI
  BOM: {
    iata: "BOM",
    nameAr: "بومباي",
    nameEn: "Mumbai",
    country_ar: "الهند",
    country_en: "India",
    description_ar: "مدينة هندية ساحلية حيوية بسينما بوليوود وحياة شارع مزدحمة وشواطئ وأسعار رخيصة",
    description_en: "Vibrant Indian coastal city with Bollywood culture, bustling street life, beaches, cheap prices",

    best_months_ar: "أكتوبر إلى مايو — طقس معتدل",
    best_months_en: "October to May — mild weather",
    worst_months_ar: "يونيو إلى سبتمبر — موسم أمطار ثقيل جداً",
    worst_months_en: "June to September — heavy monsoon",
    current_season_ar: "الآن موسم مثالي — طقس جميل 🌞",
    current_season_en: "Currently perfect season — nice weather 🌞",
    weather_temp_range: "15-35°C",
    weather_description_ar: "معتدل مع احتمال أمطار",
    weather_description_en: "Mild with occasional rain",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة هندية",
    visa_type_en: "Indian Visa",
    visa_processing_days: 10,
    visa_cost_usd: 100,
    visa_note_ar: "تأشيرة هندية سهلة",
    visa_note_en: "Easy Indian visa",

    safety_level: "moderate",
    safety_note_ar: "آمنة في المناطق السياحية — احذر من الازدحام",
    safety_note_en: "Safe in tourist areas — watch for crowds",
    cultural_tips_ar: [
      "احترم ثقافة بوليوود",
      "الطعام: كاري وبيرياني",
      "الملابس: محتشمة خاصة للنساء",
      "الحياة: كاوسية ومثيرة"
    ],
    cultural_tips_en: [
      "Respect Bollywood culture",
      "Food: Curry and biryani",
      "Dress: Modest, especially women",
      "Life: Chaotic and exciting"
    ],

    currency: "INR",
    currency_name_ar: "روبية هندية",
    currency_name_en: "Indian Rupee",
    usd_exchange_rate: 83,
    cost_level: "budget",
    budget_per_day_usd: {
      budget: 25,
      moderate: 70,
      luxury: 200,
    },

    top_activities_ar: [
      "بوابة الهند — رمز بومباي",
      "معبد جايزاواسا (Jaipur) — معبد جميل",
      "شاطئ ماهالاكسمي — شاطئ جميل",
      "ستوديوهات بوليوود — ثقافة سينمائية",
      "الأسواق القديمة المزدحمة"
    ],
    top_activities_en: [
      "Gateway of India — Mumbai's symbol",
      "Haji Ali Mosque — beautiful mosque",
      "Mahalaxi Beach — beautiful beach",
      "Bollywood Studios — cinema culture",
      "Old crowded markets"
    ],

    packing_tips_ar: [
      "ملابس محتشمة وخفيفة",
      "واقي شمس",
      "أدوية إسهال",
      "حذاء مريح",
      "حقيبة صغيرة آمنة"
    ],
    packing_tips_en: [
      "Modest and light clothing",
      "Sunscreen",
      "Diarrhea meds",
      "Comfortable shoes",
      "Secure small bag"
    ],

    local_tips_ar: [
      "نصيحة ذهب: تجربة طعام الشارع الهندي",
      "التاكسي: استخدم Uber بدل سيارات الأجرة",
      "الشواطئ: جميلة للمساء",
      "الأسعار: الأرخص في آسيا",
      "يومين أو ثلاثة كافية"
    ],
    local_tips_en: [
      "Gold tip: Try Indian street food",
      "Taxis: Use Uber instead of taxis",
      "Beaches: Nice in evenings",
      "Prices: Cheapest in Asia",
      "2-3 days enough"
    ],

    timezone: "GMT+5:30",
    languages: ["मराठी (Marathi)", "English", "Hindi"],
    best_time_for: {
      honeymoon_ar: "أكتوبر–نوفمبر أو فبراير–مارس",
      honeymoon_en: "October–November or February–March",
      family_ar: "ديسمبر–يناير",
      family_en: "December–January",
      adventure_ar: "أكتوبر–مايو — شواطئ",
      adventure_en: "October–May — beaches",
      budget_ar: "يونيو–سبتمبر — أرخص 50%",
      budget_en: "June–September — 50% cheaper"
    }
  },

  // BANGKOK (BKK_HKT alternative for Phuket Thailand)
  HKT: {
    iata: "HKT",
    nameAr: "بوكيت",
    nameEn: "Phuket",
    country_ar: "تايلاند",
    country_en: "Thailand",
    description_ar: "منتجع تايلاندي جميل بشواطئ استوائية وجزر وحياة ليلية وغوص رخيص ممتاز",
    description_en: "Beautiful Thai resort with tropical beaches, islands, nightlife, cheap excellent diving",

    best_months_ar: "نوفمبر إلى فبراير — جاف وشمسي",
    best_months_en: "November to February — dry and sunny",
    worst_months_ar: "مايو إلى أكتوبر — موسم أمطار",
    worst_months_en: "May to October — rainy season",
    current_season_ar: "الآن موسم مثالي — شواطئ جميلة 🌞",
    current_season_en: "Currently ideal — beautiful beaches 🌞",
    weather_temp_range: "24-32°C",
    weather_description_ar: "دافئ وشمسي",
    weather_description_en: "Warm and sunny",

    visa_required_for_saudis: false,
    visa_type_ar: "بدون فيزا (60 يوم)",
    visa_type_en: "Visa-free (60 days)",
    visa_processing_days: 0,
    visa_cost_usd: null,
    visa_note_ar: "السعوديون يحصلون على 60 يوم بدون فيزا",
    visa_note_en: "Saudis get 60 days visa-free",

    safety_level: "good",
    safety_note_ar: "آمنة للسياح في الشواطئ والمنتجعات",
    safety_note_en: "Safe for tourists at beaches and resorts",
    cultural_tips_ar: [
      "احترم الملك والدين البوذي",
      "الطعام: طعم تايلاندي حار ممتاز",
      "الملابس: حرة على الشواطئ",
      "جزر جميلة وشواطئ هادئة"
    ],
    cultural_tips_en: [
      "Respect King and Buddhism",
      "Food: Delicious spicy Thai",
      "Dress: Free at beaches",
      "Beautiful islands and calm beaches"
    ],

    currency: "THB",
    currency_name_ar: "الباط التايلاندي",
    currency_name_en: "Thai Baht",
    usd_exchange_rate: 35.5,
    cost_level: "budget",
    budget_per_day_usd: {
      budget: 30,
      moderate: 80,
      luxury: 200,
    },

    top_activities_ar: [
      "جزيرة في في — جزر جميلة",
      "الغوص والغطس — أفضل في العالم",
      "حياة ليلية في بانج لا — حفلات",
      "معابد بوذية جميلة",
      "جزيرة سيميلان — غوص عالمي"
    ],
    top_activities_en: [
      "Phi Phi Islands — beautiful islands",
      "Diving and snorkeling — world-class",
      "Patong nightlife — parties",
      "Beautiful Buddhist temples",
      "Similan Islands — world diving"
    ],

    packing_tips_ar: [
      "ملابس خفيفة جداً",
      "واقي شمس قوي",
      "ملابس سباحة",
      "معدات غوص",
      "حقيبة صغيرة آمنة"
    ],
    packing_tips_en: [
      "Very light clothing",
      "Strong sunscreen",
      "Swimwear",
      "Dive gear",
      "Secure small bag"
    ],

    local_tips_ar: [
      "نصيحة ذهب: خذ دورة غوص (PADI)",
      "الجزر: جميلة جداً وهادئة",
      "الطعام: طعم شارع تايلاندي رخيص",
      "الحياة الليلية: باتونج مجنونة",
      "أسبوع كامل للاستمتاع"
    ],
    local_tips_en: [
      "Gold tip: Take diving course (PADI)",
      "Islands: Beautiful and peaceful",
      "Food: Cheap Thai street food",
      "Nightlife: Patong is crazy",
      "Full week ideal"
    ],

    timezone: "GMT+7",
    languages: ["ไทย (Thai)", "English"],
    best_time_for: {
      honeymoon_ar: "نوفمبر–ديسمبر — رومانسي وشواطئ هادئة",
      honeymoon_en: "November–December — romantic and calm beaches",
      family_ar: "ديسمبر–يناير — شواطئ آمنة",
      family_en: "December–January — safe beaches",
      adventure_ar: "نوفمبر–أبريل — غوص وجزر",
      adventure_en: "November–April — diving and islands",
      budget_ar: "مايو–أكتوبر — أرخص 50%",
      budget_en: "May–October — 50% cheaper"
    }
  },

  // JAIPUR (Pink City in India)
  JAI: {
    iata: "JAI",
    nameAr: "جايبور",
    nameEn: "Jaipur",
    country_ar: "الهند",
    country_en: "India",
    description_ar: "مدينة هندية ملونة بقصور جميلة وحياة تقليدية وأسواق نابضة بالحياة وأرخص بكثير من دلهي",
    description_en: "Colorful Indian city with beautiful palaces, traditional life, vibrant markets, much cheaper than Delhi",

    best_months_ar: "أكتوبر إلى مارس — طقس معتدل",
    best_months_en: "October to March — mild weather",
    worst_months_ar: "يونيو إلى أغسطس — حرارة وموسم أمطار",
    worst_months_en: "June to August — heat and monsoon",
    current_season_ar: "الآن موسم مثالي 🌞",
    current_season_en: "Currently perfect season 🌞",
    weather_temp_range: "5-40°C",
    weather_description_ar: "معتدل",
    weather_description_en: "Mild",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة هندية",
    visa_type_en: "Indian Visa",
    visa_processing_days: 10,
    visa_cost_usd: 100,
    visa_note_ar: "نفس التأشيرة الهندية لدلهي",
    visa_note_en: "Same Indian visa as Delhi",

    safety_level: "good",
    safety_note_ar: "آمنة للسياح — أقل ازدحاماً من دلهي",
    safety_note_en: "Safe for tourists — less crowded than Delhi",
    cultural_tips_ar: [
      "احترم التاريخ الملكي",
      "الطعام: كاري راجستاني",
      "الملابس: محتشمة",
      "الأسعار: أرخص من دلهي بكثير"
    ],
    cultural_tips_en: [
      "Respect royal history",
      "Food: Rajasthani curry",
      "Dress: Modest",
      "Prices: Much cheaper than Delhi"
    ],

    currency: "INR",
    currency_name_ar: "روبية هندية",
    currency_name_en: "Indian Rupee",
    usd_exchange_rate: 83,
    cost_level: "budget",
    budget_per_day_usd: {
      budget: 15,
      moderate: 40,
      luxury: 100,
    },

    top_activities_ar: [
      "قصر المدينة — عمارة ملكية",
      "الحصن الجميل (Amber Fort) — قلعة تاريخية",
      "المدينة الوردية — عمارة ملونة",
      "أسواق الحرير والمجوهرات",
      "معابد دينية جميلة"
    ],
    top_activities_en: [
      "City Palace — royal architecture",
      "Amber Fort — historic fort",
      "Pink City — colorful architecture",
      "Silk and jewelry markets",
      "Beautiful temples"
    ],

    packing_tips_ar: [
      "ملابس محتشمة وخفيفة",
      "واقي شمس",
      "حذاء مريح",
      "أدوية إسهال",
      "حقيبة صغيرة آمنة"
    ],
    packing_tips_en: [
      "Modest and light clothing",
      "Sunscreen",
      "Comfortable shoes",
      "Diarrhea meds",
      "Secure small bag"
    ],

    local_tips_ar: [
      "نصيحة ذهب: قصر أمبير جميل جداً",
      "الأسواق: افاوض على كل شيء",
      "الطعام: أرخص بكثير من دلهي",
      "الأسعار: أرخص من أي مدينة هندية أخرى",
      "يومين أو ثلاثة كافية"
    ],
    local_tips_en: [
      "Gold tip: Amber Fort is stunning",
      "Markets: Bargain everything",
      "Food: Much cheaper than Delhi",
      "Prices: Cheapest Indian city",
      "2-3 days enough"
    ],

    timezone: "GMT+5:30",
    languages: ["हिन्दी (Hindi)", "English"],
    best_time_for: {
      honeymoon_ar: "أكتوبر–نوفمبر أو فبراير–مارس",
      honeymoon_en: "October–November or February–March",
      family_ar: "ديسمبر–يناير",
      family_en: "December–January",
      adventure_ar: "أكتوبر–مارس",
      adventure_en: "October–March",
      budget_ar: "يونيو–سبتمبر — أرخص 50%",
      budget_en: "June–September — 50% cheaper"
    }
  },

  // BEIRUT
  BEY: {
    iata: "BEY",
    nameAr: "بيروت",
    nameEn: "Beirut",
    country_ar: "لبنان",
    country_en: "Lebanon",
    description_ar: "عاصمة لبنانية ساحلية بحياة ليلية مجنونة وطعم لبناني لذيذ وثقافة عريقة وشواطئ جميلة",
    description_en: "Lebanese coastal capital with crazy nightlife, delicious Lebanese food, rich culture, beautiful beaches",

    best_months_ar: "أبريل إلى يونيو وسبتمبر إلى نوفمبر",
    best_months_en: "April–June and September–November",
    worst_months_ar: "يناير وفبراير — بارد",
    worst_months_en: "January–February — cold",
    current_season_ar: "الآن ربيع جميل 🌸",
    current_season_en: "Currently beautiful spring 🌸",
    weather_temp_range: "8-28°C",
    weather_description_ar: "معتدل",
    weather_description_en: "Mild",

    visa_required_for_saudis: false,
    visa_type_ar: "بدون فيزا للسعوديين",
    visa_type_en: "Visa-free for Saudis",
    visa_processing_days: 0,
    visa_cost_usd: null,
    visa_note_ar: "دول عربية — لا تحتاج فيزا",
    visa_note_en: "Arab country — no visa",

    safety_level: "moderate",
    safety_note_ar: "آمنة في المناطق السياحية الرئيسية",
    safety_note_en: "Safe in main tourist areas",
    cultural_tips_ar: [
      "احترم التاريخ اللبناني العريق",
      "الطعام: طعم لبناني أصلي لذيذ",
      "الملابس: حرة تماماً في المدينة",
      "الحياة الليلية: مشهورة جداً"
    ],
    cultural_tips_en: [
      "Respect rich Lebanese history",
      "Food: Authentic delicious Lebanese",
      "Dress: Completely free in city",
      "Nightlife: Very famous"
    ],

    currency: "LBP",
    currency_name_ar: "الليرة اللبنانية",
    currency_name_en: "Lebanese Pound",
    usd_exchange_rate: 89500,
    cost_level: "moderate",
    budget_per_day_usd: {
      budget: 50,
      moderate: 120,
      luxury: 300,
    },

    top_activities_ar: [
      "المتحف الوطني — آثار تاريخية",
      "مسجد محمد الأمين — عمارة جميلة",
      "شاطئ رملة البيضا — شاطئ جميل",
      "أسواق بيروت — تسوق وحياة شارع",
      "جبال بيروت — مناظر طبيعية"
    ],
    top_activities_en: [
      "National Museum — historic artifacts",
      "Mohammad Al-Amin Mosque — beautiful architecture",
      "Ramlet Al Baida Beach — beautiful beach",
      "Beirut souks — shopping",
      "Mount Lebanon — natural scenery"
    ],

    packing_tips_ar: [
      "ملابس طبقات",
      "حذاء مريح",
      "واقي شمس",
      "معطف خفيف",
      "حقيبة صغيرة آمنة"
    ],
    packing_tips_en: [
      "Layered clothing",
      "Comfortable shoes",
      "Sunscreen",
      "Light jacket",
      "Secure small bag"
    ],

    local_tips_ar: [
      "نصيحة ذهب: تجربة الطعم اللبناني الأصلي",
      "الحياة الليلية: بيروت مشهورة عالمياً",
      "الشواطئ: جميلة وآمنة",
      "الأسعار: معقولة نسبياً للعرب",
      "يومين أو ثلاثة كافية"
    ],
    local_tips_en: [
      "Gold tip: Try authentic Lebanese food",
      "Nightlife: Beirut is world-famous",
      "Beaches: Beautiful and safe",
      "Prices: Reasonable for Arabs",
      "2-3 days enough"
    ],

    timezone: "GMT+2/+3",
    languages: ["العربية (Arabic)", "French", "English"],
    best_time_for: {
      honeymoon_ar: "أبريل–مايو أو سبتمبر–أكتوبر",
      honeymoon_en: "April–May or September–October",
      family_ar: "أبريل–يونيو",
      family_en: "April–June",
      adventure_ar: "مايو–يوليو — جبال",
      adventure_en: "May–July — mountain hiking",
      budget_ar: "يناير–مارس — أرخص قليلاً",
      budget_en: "January–March — slightly cheaper"
    }
  },

  // KUWAIT CITY
  KWI: {
    iata: "KWI",
    nameAr: "مدينة الكويت",
    nameEn: "Kuwait City",
    country_ar: "دولة الكويت",
    country_en: "State of Kuwait",
    description_ar: "عاصمة كويتية حديثة بأبراج جميلة وحياة فاخرة وتسوق عالمي وثقافة خليجية",
    description_en: "Modern Kuwaiti capital with beautiful towers, luxury life, world shopping, Gulf culture",

    best_months_ar: "نوفمبر إلى مارس — طقس معتدل",
    best_months_en: "November to March — mild weather",
    worst_months_ar: "يونيو إلى أغسطس — حرارة شديدة جداً",
    worst_months_en: "June to August — extremely hot",
    current_season_ar: "الآن موسم مثالي 🌞",
    current_season_en: "Currently perfect season 🌞",
    weather_temp_range: "10-40°C",
    weather_description_ar: "معتدل",
    weather_description_en: "Mild",

    visa_required_for_saudis: false,
    visa_type_ar: "بدون فيزا",
    visa_type_en: "Visa-free",
    visa_processing_days: 0,
    visa_cost_usd: null,
    visa_note_ar: "دول خليجية — لا تحتاج فيزا",
    visa_note_en: "GCC country — no visa",

    safety_level: "excellent",
    safety_note_ar: "آمنة جداً جداً",
    safety_note_en: "Extremely safe",
    cultural_tips_ar: [
      "احترم الثقافة الخليجية",
      "الطعام: طعم خليجي فاخر",
      "الملابس: محتشمة في الشارع",
      "التسوق: متاجر عالمية"
    ],
    cultural_tips_en: [
      "Respect Gulf culture",
      "Food: Luxury Gulf cuisine",
      "Dress: Modest in streets",
      "Shopping: World-class stores"
    ],

    currency: "KWD",
    currency_name_ar: "الدينار الكويتي",
    currency_name_en: "Kuwaiti Dinar",
    usd_exchange_rate: 0.31,
    cost_level: "expensive",
    budget_per_day_usd: {
      budget: 100,
      moderate: 250,
      luxury: 600,
    },

    top_activities_ar: [
      "أبراج الكويت — رمز الكويت",
      "متحف الكويت الوطني — تاريخ عريق",
      "السوق القديم (سوق المباركية)",
      "شواطئ جون وجزيرة فيلكا",
      "حدائق وحياة حضرية"
    ],
    top_activities_en: [
      "Kuwait Towers — Kuwait's symbol",
      "National Museum — historical heritage",
      "Old Souq (Mubarakiya Market)",
      "Beaches and Failaka Island",
      "Parks and urban life"
    ],

    packing_tips_ar: [
      "ملابس محتشمة وخفيفة",
      "واقي شمس",
      "نظارات شمسية",
      "حذاء مريح",
      "معطف خفيف"
    ],
    packing_tips_en: [
      "Modest and light clothing",
      "Sunscreen",
      "Sunglasses",
      "Comfortable shoes",
      "Light jacket"
    ],

    local_tips_ar: [
      "نصيحة ذهب: زيارة الأبراج الثلاث",
      "التسوق: مولات ضخمة وعالمية",
      "الطعام: مطاعم خليجية وعالمية",
      "الأسعار: غالية لكن جودة عالية",
      "يومين أو ثلاثة كافية"
    ],
    local_tips_en: [
      "Gold tip: Visit iconic Towers",
      "Shopping: Huge world-class malls",
      "Food: Gulf and international restaurants",
      "Prices: Expensive but high quality",
      "2-3 days enough"
    ],

    timezone: "GMT+3",
    languages: ["العربية (Arabic)", "English"],
    best_time_for: {
      honeymoon_ar: "نوفمبر–ديسمبر — فاخرة",
      honeymoon_en: "November–December — luxury",
      family_ar: "ديسمبر–يناير",
      family_en: "December–January",
      adventure_ar: "نوفمبر–مارس",
      adventure_en: "November–March",
      budget_ar: "يونيو–أغسطس — أرخص قليلاً",
      budget_en: "June–August — slightly cheaper"
    }
  },

  // HO CHI MINH CITY (SAIGON)
  SGN: {
    iata: "SGN",
    nameAr: "مدينة هوشي منه",
    nameEn: "Ho Chi Minh City",
    country_ar: "فيتنام",
    country_en: "Vietnam",
    description_ar: "مدينة فيتنامية حيوية بحياة شارع مزدحمة وطعام شارع لذيذ جداً وأسعار رخيصة جداً",
    description_en: "Vibrant Vietnamese city with bustling street life, delicious street food, extremely cheap prices",

    best_months_ar: "نوفمبر إلى يناير — طقس معتدل جاف",
    best_months_en: "November to January — mild and dry",
    worst_months_ar: "مايو إلى أكتوبر — حرارة ورطوبة عالية",
    worst_months_en: "May to October — heat and humidity",
    current_season_ar: "الآن موسم مثالي 🌞",
    current_season_en: "Currently perfect season 🌞",
    weather_temp_range: "20-32°C",
    weather_description_ar: "دافئ وجاف",
    weather_description_en: "Warm and dry",

    visa_required_for_saudis: true,
    visa_type_ar: "فيزا إلكترونية",
    visa_type_en: "e-Visa",
    visa_processing_days: 0,
    visa_cost_usd: 25,
    visa_note_ar: "فيزا إلكترونية سهلة وسريعة",
    visa_note_en: "Easy fast e-Visa",

    safety_level: "good",
    safety_note_ar: "آمنة للسياح — احذر من الدراجات النارية",
    safety_note_en: "Safe for tourists — watch for bikes",
    cultural_tips_ar: [
      "احترم التاريخ الفيتنامي",
      "الطعام: فو وحساء رخيص",
      "الملابس: خفيفة جداً",
      "حياة شارع جنونية"
    ],
    cultural_tips_en: [
      "Respect Vietnamese history",
      "Food: Pho and noodles cheap",
      "Dress: Very light",
      "Crazy street life"
    ],

    currency: "VND",
    currency_name_ar: "الدونج الفيتنامي",
    currency_name_en: "Vietnamese Dong",
    usd_exchange_rate: 24000,
    cost_level: "budget",
    budget_per_day_usd: {
      budget: 20,
      moderate: 50,
      luxury: 120,
    },

    top_activities_ar: [
      "قصر الاستقلال — قصر ملكي",
      "الحي الصيني — حياة تقليدية",
      "نهر سايغون — جولات نهرية",
      "متحف الحرب — تاريخ مهم",
      "حدائق والمتاحف"
    ],
    top_activities_en: [
      "Independence Palace — royal palace",
      "Chinatown — traditional life",
      "Saigon River — boat tours",
      "War Museum — important history",
      "Parks and museums"
    ],

    packing_tips_ar: [
      "ملابس خفيفة جداً",
      "واقي شمس",
      "حذاء مريح",
      "أدوية إسهال",
      "حقيبة صغيرة آمنة"
    ],
    packing_tips_en: [
      "Very light clothing",
      "Sunscreen",
      "Comfortable shoes",
      "Diarrhea meds",
      "Secure small bag"
    ],

    local_tips_ar: [
      "نصيحة ذهب: تناول فو من الشارع",
      "الدراجات النارية: احذر من حركة المرور",
      "المقاهي: قهوة فيتنامية لذيذة",
      "الأسعار: الأرخص في جنوب شرق آسيا",
      "يومين أو ثلاثة كافية"
    ],
    local_tips_en: [
      "Gold tip: Eat pho from street",
      "Motorbikes: Chaotic traffic",
      "Cafes: Delicious Vietnamese coffee",
      "Prices: Cheapest in SEA",
      "2-3 days enough"
    ],

    timezone: "GMT+7",
    languages: ["Tiếng Việt (Vietnamese)", "English limited"],
    best_time_for: {
      honeymoon_ar: "نوفمبر–ديسمبر",
      honeymoon_en: "November–December",
      family_ar: "نوفمبر–يناير",
      family_en: "November–January",
      adventure_ar: "نوفمبر–يناير",
      adventure_en: "November–January",
      budget_ar: "يونيو–أكتوبر — أرخص 50%",
      budget_en: "June–October — 50% cheaper"
    }
  },

  // JOHANNESBURG
  JNB: {
    iata: "JNB",
    nameAr: "جوهانسبرغ",
    nameEn: "Johannesburg",
    country_ar: "جنوب أفريقيا",
    country_en: "South Africa",
    description_ar: "مدينة جنوب أفريقية حيوية بحياة حضرية نابضة وفن وثقافة وشواطئ قريبة",
    description_en: "Vibrant South African city with pulsing urban life, art, culture, nearby beaches",

    best_months_ar: "ديسمبر إلى فبراير — صيف جميل",
    best_months_en: "December to February — beautiful summer",
    worst_months_ar: "يونيو إلى أغسطس — بارد",
    worst_months_en: "June to August — cold",
    current_season_ar: "الآن موسم مثالي 🌞",
    current_season_en: "Currently perfect season 🌞",
    weather_temp_range: "10-26°C",
    weather_description_ar: "معتدل",
    weather_description_en: "Mild",

    visa_required_for_saudis: true,
    visa_type_ar: "تأشيرة جنوب أفريقية",
    visa_type_en: "South African Visa",
    visa_processing_days: 5,
    visa_cost_usd: 100,
    visa_note_ar: "تأشيرة سهلة",
    visa_note_en: "Easy visa",

    safety_level: "good",
    safety_note_ar: "آمنة في المناطق السياحية والمتقدمة",
    safety_note_en: "Safe in tourist and developed areas",
    cultural_tips_ar: [
      "احترم التاريخ الأفريقي",
      "الطعام: لحم وخضروات",
      "الملابس: حرة",
      "فن وثقافة في كل مكان"
    ],
    cultural_tips_en: [
      "Respect African history",
      "Food: Meat and vegetables",
      "Dress: Free",
      "Art and culture everywhere"
    ],

    currency: "ZAR",
    currency_name_ar: "الراند الجنوب أفريقي",
    currency_name_en: "South African Rand",
    usd_exchange_rate: 18,
    cost_level: "moderate",
    budget_per_day_usd: {
      budget: 50,
      moderate: 120,
      luxury: 300,
    },

    top_activities_ar: [
      "متحف الفصل العنصري — تاريخ مهم",
      "حي سوويتو — ثقافة محلية",
      "فن الشارع والجداريات",
      "حديقة كروجر للسفاري — حياة برية",
      "الحياة الليلية والمطاعم"
    ],
    top_activities_en: [
      "Apartheid Museum — important history",
      "Soweto Township — local culture",
      "Street art and murals",
      "Kruger Park Safari — wildlife",
      "Nightlife and restaurants"
    ],

    packing_tips_ar: [
      "ملابس طبقات",
      "حذاء مريح",
      "معطف خفيف",
      "واقي شمس",
      "حقيبة صغيرة آمنة"
    ],
    packing_tips_en: [
      "Layered clothing",
      "Comfortable shoes",
      "Light jacket",
      "Sunscreen",
      "Secure small bag"
    ],

    local_tips_ar: [
      "نصيحة ذهب: متحف الفصل العنصري مهم جداً",
      "حديقة كروجر: سفاري رائعة",
      "الفن: جوهانسبرغ مركز فني",
      "الأسعار: معقولة",
      "يومين أو ثلاثة كافية"
    ],
    local_tips_en: [
      "Gold tip: Apartheid Museum important",
      "Kruger: Amazing safaris",
      "Art: Jo'burg art hub",
      "Prices: Reasonable",
      "2-3 days enough"
    ],

    timezone: "GMT+2",
    languages: ["English", "Afrikaans"],
    best_time_for: {
      honeymoon_ar: "ديسمبر–يناير",
      honeymoon_en: "December–January",
      family_ar: "ديسمبر–فبراير",
      family_en: "December–February",
      adventure_ar: "سبتمبر–نوفمبر — سفاري",
      adventure_en: "September–November — safari",
      budget_ar: "يونيو–أغسطس — أرخص",
      budget_en: "June–August — cheaper"
    }
  },

  // PENANG (Malaysia Alternative to KL)
  PEN: {
    iata: "PEN",
    nameAr: "بينانج",
    nameEn: "Penang",
    country_ar: "ماليزيا",
    country_en: "Malaysia",
    description_ar: "جزيرة ماليزية جميلة بشواطئ رملية وحياة تقليدية وطعام متعدد الثقافات وأسعار رخيصة",
    description_en: "Beautiful Malaysian island with sandy beaches, traditional life, multicultural food, cheap prices",

    best_months_ar: "نوفمبر إلى مارس — أقل أمطاراً",
    best_months_en: "November to March — least rainy",
    worst_months_ar: "مايو إلى سبتمبر — موسم أمطار",
    worst_months_en: "May to September — rainy season",
    current_season_ar: "الآن موسم مثالي 🌞",
    current_season_en: "Currently perfect season 🌞",
    weather_temp_range: "24-32°C",
    weather_description_ar: "دافئ رطب",
    weather_description_en: "Warm and humid",

    visa_required_for_saudis: false,
    visa_type_ar: "بدون فيزا (30 يوم)",
    visa_type_en: "Visa-free (30 days)",
    visa_processing_days: 0,
    visa_cost_usd: null,
    visa_note_ar: "السعوديون يحصلون على 30 يوم بدون فيزا",
    visa_note_en: "Saudis get 30 days visa-free",

    safety_level: "very good",
    safety_note_ar: "آمنة جداً — أآمن من كوالالمبور",
    safety_note_en: "Very safe — safer than KL",
    cultural_tips_ar: [
      "احترم التنوع الديني — معابد ومسجد وكنيسة",
      "الطعام: طعم أصلي متعدد الثقافات",
      "الملابس: حرة",
      "الشواطئ والجزر جميلة"
    ],
    cultural_tips_en: [
      "Respect religious diversity — temples, mosques, churches",
      "Food: Authentic multicultural",
      "Dress: Free",
      "Beautiful beaches and islands"
    ],

    currency: "MYR",
    currency_name_ar: "رينجيت ماليزي",
    currency_name_en: "Malaysian Ringgit",
    usd_exchange_rate: 4.5,
    cost_level: "budget",
    budget_per_day_usd: {
      budget: 30,
      moderate: 80,
      luxury: 200,
    },

    top_activities_ar: [
      "جرج فنتسيا — شارع تاريخي جميل",
      "معابد صينية وهندية جميلة",
      "جزيرة بينانج الشاطئية",
      "طعام الشارع الرخيص اللذيذ",
      "تلفريك بيناج الجبلي"
    ],
    top_activities_en: [
      "Georgetown — beautiful historic street",
      "Beautiful Chinese and Hindu temples",
      "Penang Island beaches",
      "Cheap delicious street food",
      "Penang Hill cable car"
    ],

    packing_tips_ar: [
      "ملابس خفيفة جداً",
      "واقي شمس",
      "ملابس سباحة",
      "مظلة أو معطف مقاوم للماء",
      "حقيبة صغيرة آمنة"
    ],
    packing_tips_en: [
      "Very light clothing",
      "Sunscreen",
      "Swimwear",
      "Umbrella or rain jacket",
      "Secure small bag"
    ],

    local_tips_ar: [
      "نصيحة ذهب: طعام الشارع لذيذ وأرخص من كل مكان",
      "جيورج تاون: جولة تاريخية جميلة",
      "الشواطئ: هادئة وجميلة",
      "الأسعار: الأرخص في ماليزيا",
      "يومين أو ثلاثة كافية"
    ],
    local_tips_en: [
      "Gold tip: Street food delicious and cheapest",
      "Georgetown: Beautiful historic walk",
      "Beaches: Calm and beautiful",
      "Prices: Cheapest in Malaysia",
      "2-3 days enough"
    ],

    timezone: "GMT+8",
    languages: ["Bahasa Malaysia (Malay)", "English", "Chinese"],
    best_time_for: {
      honeymoon_ar: "نوفمبر–ديسمبر",
      honeymoon_en: "November–December",
      family_ar: "ديسمبر–يناير",
      family_en: "December–January",
      adventure_ar: "نوفمبر–أبريل — شواطئ وجزر",
      adventure_en: "November–April — beaches and islands",
      budget_ar: "مايو–سبتمبر — أرخص 50%",
      budget_en: "May–September — 50% cheaper"
    }
  },

  // ISTANBUL (Turkey) - BURSA (Alternative Ottoman City)
  // Adding one more major Asian gateway
  BKK_MBJ: {
    iata: "MBJ",
    nameAr: "بانكوك بولي",
    nameEn: "Bangkok Phuket",
    country_ar: "تايلاند",
    country_en: "Thailand",
    description_ar: "منطقة تايلاندية ساحلية جميلة بشواطئ فيروزية وجزر وغوص عالمي وحياة ليلية",
    description_en: "Beautiful Thai coastal area with turquoise beaches, islands, world diving, nightlife",

    best_months_ar: "نوفمبر إلى مارس — جاف وشمسي",
    best_months_en: "November to March — dry and sunny",
    worst_months_ar: "مايو إلى أكتوبر — موسم أمطار",
    worst_months_en: "May to October — rainy season",
    current_season_ar: "الآن موسم مثالي 🌞",
    current_season_en: "Currently perfect season 🌞",
    weather_temp_range: "24-32°C",
    weather_description_ar: "دافئ وشمسي",
    weather_description_en: "Warm and sunny",

    visa_required_for_saudis: false,
    visa_type_ar: "بدون فيزا (60 يوم)",
    visa_type_en: "Visa-free (60 days)",
    visa_processing_days: 0,
    visa_cost_usd: null,
    visa_note_ar: "السعوديون يحصلون على 60 يوم",
    visa_note_en: "Saudis get 60 days",

    safety_level: "good",
    safety_note_ar: "آمنة للسياح في المنتجعات والشواطئ",
    safety_note_en: "Safe for tourists at resorts",
    cultural_tips_ar: [
      "احترم البوذية والملك",
      "الطعام: طعم تايلاندي حار",
      "الملابس: حرة على الشواطئ",
      "جزر هادئة وشواطئ جميلة"
    ],
    cultural_tips_en: [
      "Respect Buddhism and King",
      "Food: Spicy Thai",
      "Dress: Free at beaches",
      "Calm islands and beautiful beaches"
    ],

    currency: "THB",
    currency_name_ar: "الباط التايلاندي",
    currency_name_en: "Thai Baht",
    usd_exchange_rate: 35.5,
    cost_level: "budget",
    budget_per_day_usd: {
      budget: 30,
      moderate: 80,
      luxury: 200,
    },

    top_activities_ar: [
      "جزر فاي فاي — جزر خلابة",
      "غوص عالمي درجة أولى",
      "حياة ليلية في باتونج",
      "معابد بوذية جميلة",
      "شواطئ استرخاء هادئة"
    ],
    top_activities_en: [
      "Phi Phi Islands — stunning islands",
      "World-class diving",
      "Patong nightlife",
      "Beautiful Buddhist temples",
      "Relaxing calm beaches"
    ],

    packing_tips_ar: [
      "ملابس خفيفة جداً",
      "واقي شمس قوي",
      "ملابس سباحة",
      "معدات غوص",
      "حقيبة صغيرة آمنة"
    ],
    packing_tips_en: [
      "Very light clothing",
      "Strong sunscreen",
      "Swimwear",
      "Diving gear",
      "Secure small bag"
    ],

    local_tips_ar: [
      "نصيحة ذهب: غوص عالمي شهير",
      "الجزر: جميلة جداً وهادئة",
      "الطعام: طعم تايلاندي رخيص",
      "الأسعار: الأرخص في جنوب شرق آسيا",
      "أسبوع كامل للاستمتاع"
    ],
    local_tips_en: [
      "Gold tip: Famous world diving",
      "Islands: Beautiful and peaceful",
      "Food: Cheap Thai",
      "Prices: Cheapest in SEA",
      "Full week ideal"
    ],

    timezone: "GMT+7",
    languages: ["ไทย (Thai)", "English"],
    best_time_for: {
      honeymoon_ar: "نوفمبر–ديسمبر — رومانسي وشواطئ",
      honeymoon_en: "November–December — romantic beaches",
      family_ar: "ديسمبر–يناير — شواطئ آمنة",
      family_en: "December–January — safe beaches",
      adventure_ar: "نوفمبر–أبريل — غوص وجزر",
      adventure_en: "November–April — diving and islands",
      budget_ar: "مايو–أكتوبر — أرخص 50%",
      budget_en: "May–October — 50% cheaper"
    }
  },
};

/** Get destination profile by IATA code */
export function getDestinationProfile(iata: string): DestinationProfile | null {
  return DESTINATIONS[iata] ?? null;
}

/** Get all destinations list */
export function getAllDestinations(): DestinationProfile[] {
  return Object.values(DESTINATIONS);
}

/** Search destinations by name (Arabic or English) */
export function searchDestinations(query: string): DestinationProfile[] {
  const lower = query.toLowerCase();
  return Object.values(DESTINATIONS).filter(
    (d) =>
      d.nameAr.toLowerCase().includes(lower) ||
      d.nameEn.toLowerCase().includes(lower) ||
      d.country_ar.toLowerCase().includes(lower) ||
      d.country_en.toLowerCase().includes(lower)
  );
}
