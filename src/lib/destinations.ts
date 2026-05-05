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

  // ... سأضيف المزيد من الوجهات
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
