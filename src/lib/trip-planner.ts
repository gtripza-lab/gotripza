import { DESTINATIONS } from "@/lib/destinations";
import { iataToCity, resolveIata } from "@/lib/iata";

export type PlannerTripType =
  | "balanced"
  | "family"
  | "honeymoon"
  | "budget"
  | "adventure"
  | "business";

export type TripPlanInput = {
  origin: string;
  destination: string;
  days: number;
  budget: number;
  travelers: number;
  tripType: PlannerTripType;
  locale: "ar" | "en";
  currency?: string;
};

export type TripPlanDay = {
  day: number;
  title: string;
  focus: string;
  area: string;
  morning: string;
  afternoon: string;
  evening: string;
  transit: string;
  estimatedCost: number;
  tip: string;
  ryaPrompt: string;
};

export type TripPlan = {
  originCode: string | null;
  destinationCode: string | null;
  originName: string;
  destinationName: string;
  days: number;
  travelers: number;
  tripType: PlannerTripType;
  budget: number;
  currency: string;
  budgetLevel: "tight" | "balanced" | "comfortable";
  estimatedDailyBudget: number;
  summary: string;
  stayAdvice: string;
  bestStayAreas: string[];
  flightAdvice: string;
  visaAdvice: string;
  localTransportAdvice: string;
  weatherAdvice: string;
  serviceAdvice: string[];
  hotelDisclosure: string;
  packingAdvice: string[];
  costBreakdown: Array<{ label: string; amount: number }>;
  daysPlan: TripPlanDay[];
  nextSteps: string[];
};

type LocalizedText = {
  ar: string;
  en: string;
};

type DayTemplate = {
  title: LocalizedText;
  focus: LocalizedText;
  area: LocalizedText;
  morning: LocalizedText;
  afternoon: LocalizedText;
  evening: LocalizedText;
  transit: LocalizedText;
  tip: LocalizedText;
  costWeight?: number;
  tags?: PlannerTripType[];
};

type CityPlannerGuide = {
  code: string;
  names: LocalizedText;
  stayAreas: LocalizedText[];
  arrival: DayTemplate;
  departure: DayTemplate;
  days: DayTemplate[];
  transport: LocalizedText;
  weather: LocalizedText;
  hotelNote: LocalizedText;
  serviceAdvice: LocalizedText[];
};

const TRIP_TYPE_LABELS = {
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
} satisfies Record<"ar" | "en", Record<PlannerTripType, string>>;

const FORBIDDEN_GENERIC = [
  "زيارة أهم معلم سياحي",
  "أهم معلم سياحي",
  "تجربة طعام محلية",
  "وقت حر للتسوق",
  "main landmark visit",
  "local food experience",
  "free time for shopping",
];

const CITY_GUIDES: Record<string, CityPlannerGuide> = {
  AHB: {
    code: "AHB",
    names: { ar: "أبها", en: "Abha" },
    stayAreas: [
      { ar: "وسط أبها: مناسب لأول زيارة وقريب من المطاعم والخدمات", en: "Central Abha: best for a first visit, restaurants, and services" },
      { ar: "طريق السودة: أفضل للطبيعة والهدوء إذا كان معك سيارة", en: "Al Soudah road: best for nature and calm if you have a car" },
      { ar: "قرب ممشى الضباب/شارع الفن: مناسب للمساء والتنقل الخفيف", en: "Near Fog Walkway/Art Street: good for evenings and light movement" },
    ],
    arrival: {
      title: { ar: "الوصول الهادئ إلى أبها", en: "A calm arrival in Abha" },
      focus: { ar: "استلام السيارة أو ترتيب المواصلات + جولة خفيفة", en: "Car pickup or transfer setup + light orientation" },
      area: { ar: "وسط أبها أو ممشى الضباب", en: "Central Abha or Fog Walkway" },
      morning: { ar: "الوصول إلى مطار أبها، استلام السيارة إن أمكن، ثم التوجه لمنطقة السكن.", en: "Arrive at Abha airport, pick up a car if possible, then head to your stay area." },
      afternoon: { ar: "غداء خفيف ثم جولة قصيرة في شارع الفن أو ممشى الضباب حسب الطقس.", en: "Light lunch, then a short visit to Art Street or Fog Walkway depending on weather." },
      evening: { ar: "عشاء في وسط أبها، ثم نوم مبكر لأن طرق الجبال أجمل في الصباح.", en: "Dinner in central Abha, then rest early because mountain drives are best in the morning." },
      transit: { ar: "السيارة أفضل خيار؛ المسافات قصيرة لكن الطرق جبلية.", en: "A car is best; distances are short but mountain roads need time." },
      tip: { ar: "لا تبدأ السودة عند الغروب إذا أول مرة تقود في المنطقة.", en: "Do not start Al Soudah near sunset if it is your first mountain drive there." },
      costWeight: 0.75,
    },
    departure: {
      title: { ar: "المغادرة بدون استعجال", en: "Departure without rushing" },
      focus: { ar: "إفطار + لمسة أخيرة قريبة", en: "Breakfast + one nearby final stop" },
      area: { ar: "وسط أبها", en: "Central Abha" },
      morning: { ar: "إفطار هادئ وتجهيز الحقائب والتأكد من وقت التوجه للمطار.", en: "Slow breakfast, pack, and confirm airport timing." },
      afternoon: { ar: "إذا الرحلة متأخرة: زيارة قصيرة لسوق الثلاثاء أو الجبل الأخضر.", en: "If your flight is late: quick stop at Tuesday Market or Green Mountain." },
      evening: { ar: "التوجه للمطار قبل الرحلة بوقت كاف، خصوصاً في مواسم الزحام.", en: "Head to the airport with enough buffer, especially in busy seasons." },
      transit: { ar: "اترك 90 دقيقة على الأقل قبل الرحلة الداخلية.", en: "Leave at least 90 minutes before a domestic flight." },
      tip: { ar: "لا تملأ اليوم الأخير بطرق جبلية طويلة.", en: "Avoid long mountain routes on the final day." },
      costWeight: 0.55,
    },
    days: [
      {
        title: { ar: "السودة والطبيعة", en: "Al Soudah and mountain nature" },
        focus: { ar: "مناظر جبلية وهواء بارد", en: "Mountain views and cooler air" },
        area: { ar: "السودة", en: "Al Soudah" },
        morning: { ar: "ابدأ مبكراً باتجاه السودة، توقف عند الإطلالات الآمنة، وخذ قهوة خفيفة في الطريق.", en: "Start early toward Al Soudah, stop at safe viewpoints, and take a light coffee break." },
        afternoon: { ar: "غداء بسيط ثم وقت مفتوح للطبيعة أو التلفريك إذا كان متاحاً موسمياً.", en: "Simple lunch, then nature time or the cable car if seasonally available." },
        evening: { ar: "ارجع قبل الظلام، واختم بعشاء هادئ قريب من السكن.", en: "Return before dark and finish with a calm dinner near your stay." },
        transit: { ar: "سيارة خاصة أو سائق موثوق؛ لا تعتمد على المشي بين المواقع.", en: "Private car or trusted driver; do not rely on walking between spots." },
        tip: { ar: "خذ جاكيت خفيف حتى في الصيف، فالجو يتغير بسرعة.", en: "Carry a light jacket even in summer; weather changes quickly." },
        tags: ["balanced", "family", "honeymoon", "adventure"],
      },
      {
        title: { ar: "رجال ألمع", en: "Rijal Almaa" },
        focus: { ar: "تراث وتصوير ومشهد مختلف", en: "Heritage, photography, and a different landscape" },
        area: { ar: "رجال ألمع", en: "Rijal Almaa" },
        morning: { ar: "انطلق صباحاً إلى قرية رجال ألمع التراثية، وخذ وقتك في المتحف والبيوت الحجرية.", en: "Leave in the morning for Rijal Almaa heritage village; take time around the museum and stone houses." },
        afternoon: { ar: "غداء محلي أو استراحة قهوة، ثم عودة تدريجية لأبها بدون استعجال.", en: "Local lunch or coffee break, then a gradual drive back to Abha." },
        evening: { ar: "مشي خفيف في شارع الفن أو جلسة مطلّة إذا الجو مناسب.", en: "Light walk on Art Street or a viewpoint stop if the weather is good." },
        transit: { ar: "الطريق طويل ومتعرج؛ ابدأ بدري وتجنب الرجوع المتأخر.", en: "The road is long and winding; start early and avoid returning late." },
        tip: { ar: "مناسب جداً للتصوير، لكن لا تضغطه مع السودة في نفس اليوم.", en: "Excellent for photos, but do not combine it with Al Soudah on the same day." },
        costWeight: 1.15,
        tags: ["balanced", "family", "adventure"],
      },
      {
        title: { ar: "الجبل الأخضر ومساء أبها", en: "Green Mountain and Abha evening" },
        focus: { ar: "إطلالة سهلة ومساء لطيف", en: "Easy viewpoint and relaxed evening" },
        area: { ar: "الجبل الأخضر ووسط أبها", en: "Green Mountain and central Abha" },
        morning: { ar: "صباح مريح: إفطار متأخر أو زيارة سوق الثلاثاء إذا كان اليوم مناسباً.", en: "Easy morning: late breakfast or Tuesday Market if timing fits." },
        afternoon: { ar: "زيارة الجبل الأخضر قبل الغروب للاستمتاع بالإطلالة والصور.", en: "Visit Green Mountain before sunset for views and photos." },
        evening: { ar: "عشاء في مطعم مطل أو منطقة حيوية، مع عودة مبكرة للسكن.", en: "Dinner at a viewpoint restaurant or lively area, then an early return." },
        transit: { ar: "تنقلات قصيرة داخل المدينة؛ مناسب إذا لا تريد يوم مرهق.", en: "Short city movements; good when you want a lighter day." },
        tip: { ar: "اجعل هذا اليوم بعد يوم طويل مثل رجال ألمع.", en: "Place this after a long day such as Rijal Almaa." },
        costWeight: 0.85,
        tags: ["balanced", "family", "honeymoon", "budget"],
      },
      {
        title: { ar: "منتزهات أبها العائلية", en: "Family-friendly Abha parks" },
        focus: { ar: "راحة وأطفال وطبيعة قريبة", en: "Rest, kids, and nearby nature" },
        area: { ar: "أبو خيال أو منتزه قريب", en: "Abu Khayal or a nearby park" },
        morning: { ar: "ابدأ بمنتزه أبو خيال أو منطقة قريبة مناسبة للعائلة.", en: "Start with Abu Khayal Park or a nearby family-friendly area." },
        afternoon: { ar: "غداء ثم راحة في السكن لتجنب إرهاق الأطفال.", en: "Lunch, then rest at the stay to avoid tiring kids." },
        evening: { ar: "تمشية قصيرة في ممشى الضباب أو مكان مفتوح حسب الجو.", en: "Short walk at Fog Walkway or an open area depending on weather." },
        transit: { ar: "اختيار مواقع قريبة يقلل وقت السيارة.", en: "Choosing nearby stops reduces car time." },
        tip: { ar: "للرحلات العائلية: نشاطان في اليوم يكفيان.", en: "For family trips, two main activities per day is enough." },
        costWeight: 0.75,
        tags: ["family", "budget"],
      },
    ],
    transport: { ar: "أبها تحتاج سيارة أو سائق أكثر من اعتمادها على المشي. الطرق الجبلية جميلة لكنها تحتاج وقتاً وهدوءاً.", en: "Abha works best with a car or driver. Mountain roads are beautiful but need time and calm driving." },
    weather: { ar: "الطقس ألطف من مدن كثيرة في السعودية، لكن الضباب والمطر الخفيف واردان؛ خطط للأنشطة الجبلية في الصباح.", en: "Weather is cooler than many Saudi cities, but fog and light rain can happen; plan mountain activities in the morning." },
    hotelNote: { ar: "الفنادق غير مربوطة بعروض مباشرة حالياً، لذلك اختر منطقة السكن حسب خطتك: وسط أبها للخدمات، السودة للطبيعة، وممشى الضباب للمساء.", en: "Direct hotel offers are not connected yet, so choose the stay area by your plan: central Abha for services, Al Soudah for nature, Fog Walkway for evenings." },
    serviceAdvice: [
      { ar: "التأمين اختياري للرحلات الداخلية، لكنه مفيد إذا لديك حجوزات غير قابلة للاسترداد.", en: "Insurance is optional for domestic trips, but useful if bookings are non-refundable." },
      { ar: "تأكد من تغطية الإنترنت على الطرق الجبلية، واحفظ الخرائط دون اتصال.", en: "Check data coverage on mountain roads and save offline maps." },
    ],
  },
  IST: {
    code: "IST",
    names: { ar: "إسطنبول", en: "Istanbul" },
    stayAreas: [
      { ar: "كاراكوي/غالطة: أفضل توازن بين البوسفور والمطاعم والتنقل", en: "Karakoy/Galata: best balance of Bosphorus, food, and mobility" },
      { ar: "شيشلي/نيشانتاشي: أهدأ وأنسب للعائلات والتسوق", en: "Sisli/Nisantasi: calmer, family-friendly, and good for shopping" },
      { ar: "السلطان أحمد: مناسب لأول مرة إذا تحب المشي للمعالم التاريخية", en: "Sultanahmet: good for first-timers who want to walk to historic sites" },
    ],
    arrival: {
      title: { ar: "الوصول والبوسفور الخفيف", en: "Arrival and a light Bosphorus evening" },
      focus: { ar: "راحة + تعارف على المنطقة", en: "Rest + neighborhood orientation" },
      area: { ar: "كاراكوي أو شيشلي", en: "Karakoy or Sisli" },
      morning: { ar: "الوصول، شراء Istanbulkart أو تجهيز eSIM، ثم التوجه للسكن.", en: "Arrive, set up Istanbulkart or eSIM, then head to your stay." },
      afternoon: { ar: "مشي خفيف حول كاراكوي/غالطة بدون ضغط.", en: "Light walk around Karakoy/Galata without rushing." },
      evening: { ar: "عشاء مطل على البوسفور أو جلسة قهوة قرب برج غلطة.", en: "Bosphorus-view dinner or coffee near Galata Tower." },
      transit: { ar: "استخدم المترو/الترام داخل المدينة وتجنب التاكسي العشوائي.", en: "Use metro/tram in the city and avoid random taxis." },
      tip: { ar: "لا تضع السلطان أحمد والبازار والبوسفور كلها في يوم الوصول.", en: "Do not pack Sultanahmet, bazaar, and Bosphorus into arrival day." },
      costWeight: 0.85,
    },
    departure: {
      title: { ar: "تسوق أخير ومغادرة", en: "Final shopping and departure" },
      focus: { ar: "هدايا + هامش للمطار", en: "Gifts + airport buffer" },
      area: { ar: "السوق المصري أو نيشانتاشي", en: "Spice Bazaar or Nisantasi" },
      morning: { ar: "إفطار وتجهيز الحقائب.", en: "Breakfast and packing." },
      afternoon: { ar: "زيارة قصيرة للسوق المصري أو نيشانتاشي حسب مكان السكن.", en: "Short stop at Spice Bazaar or Nisantasi depending on your stay area." },
      evening: { ar: "التوجه للمطار قبل الرحلة بثلاث ساعات بسبب حجم المطار والزحام.", en: "Head to the airport three hours before the flight due to airport size and traffic." },
      transit: { ar: "تحقق من وقت الطريق للمطار قبل الخروج؛ الزحام يتغير بسرعة.", en: "Check airport drive time before leaving; traffic changes quickly." },
      tip: { ar: "احسب وقت استرداد الضريبة إن كنت ستستخدمه.", en: "Allow time for tax refund if you plan to use it." },
      costWeight: 0.7,
    },
    days: [
      {
        title: { ar: "السلطان أحمد والتاريخ", en: "Sultanahmet and history" },
        focus: { ar: "آيا صوفيا + المسجد الأزرق + صهريج البازيليك", en: "Hagia Sophia + Blue Mosque + Basilica Cistern" },
        area: { ar: "السلطان أحمد", en: "Sultanahmet" },
        morning: { ar: "ابدأ بآيا صوفيا ثم المسجد الأزرق قبل الازدحام.", en: "Start with Hagia Sophia, then the Blue Mosque before crowds build." },
        afternoon: { ar: "صهريج البازيليك ثم غداء قريب في السلطان أحمد.", en: "Basilica Cistern, then lunch nearby in Sultanahmet." },
        evening: { ar: "ارجع إلى كاراكوي أو غلطة لعشاء أخف وأجواء ألطف.", en: "Return to Karakoy or Galata for a lighter dinner and better evening atmosphere." },
        transit: { ar: "الترام T1 عملي لهذا اليوم.", en: "T1 tram is practical for this day." },
        tip: { ar: "احجز التذاكر أو ابدأ مبكراً لأن الطوابير تستهلك الوقت.", en: "Book tickets or start early because queues eat time." },
      },
      {
        title: { ar: "البوسفور وبيبك", en: "Bosphorus and Bebek" },
        focus: { ar: "رحلة بحرية + أحياء راقية", en: "Cruise + upscale neighborhoods" },
        area: { ar: "البوسفور وبيبك", en: "Bosphorus and Bebek" },
        morning: { ar: "رحلة بحرية قصيرة في البوسفور من أمينونو أو كاراكوي.", en: "Short Bosphorus cruise from Eminonu or Karakoy." },
        afternoon: { ar: "قهوة ومشي في بيبك أو أرناؤوطكوي.", en: "Coffee and walk in Bebek or Arnavutkoy." },
        evening: { ar: "عشاء في كاراكوي أو أورتاكوي حسب الميزانية.", en: "Dinner in Karakoy or Ortakoy depending on budget." },
        transit: { ar: "ادمج العبّارة مع مشي قصير؛ لا تعتمد على السيارة حول البوسفور وقت الذروة.", en: "Combine ferry with short walks; avoid car traffic around the Bosphorus at peak times." },
        tip: { ar: "هذا اليوم ممتاز لشهر العسل لأنه جميل بدون جدول مرهق.", en: "Excellent for honeymoon pacing: beautiful without overloading the day." },
        tags: ["balanced", "honeymoon", "family"],
      },
      {
        title: { ar: "البازار وشارع الاستقلال", en: "Bazaar and Istiklal" },
        focus: { ar: "تسوق وثقافة مدينة", en: "Shopping and city culture" },
        area: { ar: "السوق المصري/البازار الكبير ثم تقسيم", en: "Spice/Grand Bazaar then Taksim" },
        morning: { ar: "ابدأ بالسوق المصري للهدايا الخفيفة أو البازار الكبير للتجربة التقليدية.", en: "Start with Spice Bazaar for light gifts or Grand Bazaar for the classic experience." },
        afternoon: { ar: "راحة ثم انتقال إلى شارع الاستقلال وبرج غلطة.", en: "Rest, then move to Istiklal Street and Galata Tower." },
        evening: { ar: "عشاء في بيوغلو، مع تجنب الأزقة المتأخرة جداً.", en: "Dinner in Beyoglu, avoiding late side alleys." },
        transit: { ar: "الترام والمترو أفضل من التاكسي.", en: "Tram and metro beat taxis here." },
        tip: { ar: "تفاوض في البازار ولا تحمل مبالغ نقدية كبيرة.", en: "Negotiate in the bazaar and avoid carrying too much cash." },
        tags: ["balanced", "budget", "family"],
      },
    ],
    transport: { ar: "أفضل مزيج في إسطنبول: مترو + ترام + عبّارة. التاكسي قد يضيع وقتك وميزانيتك.", en: "Best Istanbul mix: metro + tram + ferry. Taxis can waste both time and budget." },
    weather: { ar: "إسطنبول تحتاج خطة مرنة: اجعل الأنشطة الخارجية صباحاً، واترك الأسواق/المتاحف للأمطار أو الزحام.", en: "Istanbul needs flexibility: keep outdoor activities in the morning and save bazaars/museums for rain or crowds." },
    hotelNote: { ar: "الفنادق غير مربوطة بعروض مباشرة حالياً؛ ريا تساعدك تختار الحي الأنسب ثم نضيف مقارنة الأسعار عند تفعيل الربط.", en: "Direct hotel offers are not connected yet; Rya helps you choose the right area now, and price comparison can be added when the integration is active." },
    serviceAdvice: [
      { ar: "eSIM مفيدة جداً للخرائط والترام والعبّارات والترجمة.", en: "An eSIM is very useful for maps, tram/ferry movement, and translation." },
      { ar: "التأمين مناسب إذا الرحلة أكثر من 5 أيام أو الحجوزات غير قابلة للاسترداد.", en: "Insurance is sensible for trips over 5 days or non-refundable bookings." },
    ],
  },
  DXB: {
    code: "DXB",
    names: { ar: "دبي", en: "Dubai" },
    stayAreas: [
      { ar: "وسط دبي: مناسب لأول زيارة والنافورة ودبي مول", en: "Downtown Dubai: best for first visit, fountains, and Dubai Mall" },
      { ar: "دبي مارينا/JBR: مناسب للشاطئ والمساء", en: "Dubai Marina/JBR: good for beach and evenings" },
      { ar: "ديرة/بر دبي: اقتصادي وقريب من الأسواق القديمة", en: "Deira/Bur Dubai: budget-friendly and near old souks" },
    ],
    arrival: {
      title: { ar: "وصول مرتب ونافورة دبي", en: "Smooth arrival and Dubai Fountain" },
      focus: { ar: "راحة + أول مساء واضح", en: "Rest + first clear evening" },
      area: { ar: "وسط دبي", en: "Downtown Dubai" },
      morning: { ar: "الوصول، بطاقة نول أو تطبيق تنقل، ثم التوجه للسكن.", en: "Arrive, set up Nol card or ride app, then head to your stay." },
      afternoon: { ar: "راحة قصيرة ثم زيارة دبي مول بدون استعجال.", en: "Short rest, then Dubai Mall without rushing." },
      evening: { ar: "نافورة دبي وبرج خليفة من الخارج، ثم عشاء قريب.", en: "Dubai Fountain and Burj Khalifa exterior, then dinner nearby." },
      transit: { ar: "المترو ممتاز إذا سكنك قريب من محطة؛ غير ذلك استخدم كريم/تاكسي رسمي.", en: "Metro is great if your stay is near a station; otherwise use Careem/official taxis." },
      tip: { ar: "لا تجعل أول يوم صحراء أو أنشطة طويلة بعد السفر.", en: "Do not make arrival day a desert safari or long activity day." },
      costWeight: 0.9,
    },
    departure: {
      title: { ar: "لمسات أخيرة قبل المطار", en: "Final touches before the airport" },
      focus: { ar: "تسوق خفيف + مغادرة", en: "Light shopping + departure" },
      area: { ar: "دبي مول أو سيتي ووك", en: "Dubai Mall or City Walk" },
      morning: { ar: "إفطار وتجهيز الحقائب.", en: "Breakfast and packing." },
      afternoon: { ar: "تسوق خفيف في دبي مول أو سيتي ووك حسب موقعك.", en: "Light shopping at Dubai Mall or City Walk depending on location." },
      evening: { ar: "التوجه للمطار مبكراً؛ مطار دبي كبير والزحام وارد.", en: "Head to the airport early; Dubai airport is large and traffic is possible." },
      transit: { ar: "اترك ساعتين ونصف إلى ثلاث ساعات قبل الرحلات الدولية.", en: "Leave 2.5-3 hours before international flights." },
      tip: { ar: "احسب وقت استلام الحقائب والتنقل بين مباني المطار.", en: "Allow time for baggage and terminal movement." },
      costWeight: 0.7,
    },
    days: [
      {
        title: { ar: "دبي القديمة والخور", en: "Old Dubai and the Creek" },
        focus: { ar: "تراث وأسواق وتجربة أقل تكلفة", en: "Heritage, souks, and lower-cost experiences" },
        area: { ar: "الفهيدي والخور وديرة", en: "Al Fahidi, Creek, and Deira" },
        morning: { ar: "ابدأ بحي الفهيدي ومتحف/بيوت تراثية قريبة.", en: "Start at Al Fahidi historical district and nearby heritage houses." },
        afternoon: { ar: "اعبر الخور بالعبّرة إلى سوق الذهب أو التوابل.", en: "Cross the Creek by abra to Gold or Spice Souk." },
        evening: { ar: "عشاء إماراتي/هندي بسيط في ديرة أو بر دبي.", en: "Simple Emirati/Indian dinner in Deira or Bur Dubai." },
        transit: { ar: "المترو + العبّرة خيار اقتصادي وممتع.", en: "Metro + abra is budget-friendly and fun." },
        tip: { ar: "هذا اليوم ممتاز إذا الميزانية اقتصادية.", en: "This day is excellent for a budget-friendly plan." },
        tags: ["budget", "family", "balanced"],
      },
      {
        title: { ar: "الشاطئ والمارينا", en: "Beach and Marina" },
        focus: { ar: "JBR + ممشى مارينا", en: "JBR + Marina Walk" },
        area: { ar: "JBR ودبي مارينا", en: "JBR and Dubai Marina" },
        morning: { ar: "ابدأ بالشاطئ في JBR أو كايت بيتش حسب موقع السكن.", en: "Start with JBR Beach or Kite Beach depending on stay location." },
        afternoon: { ar: "راحة وغداء، ثم ممشى مارينا قبل الغروب.", en: "Rest and lunch, then Marina Walk before sunset." },
        evening: { ar: "عشاء في مارينا أو بلوواترز إذا الميزانية مريحة.", en: "Dinner in Marina or Bluewaters if the budget is comfortable." },
        transit: { ar: "استخدم الترام/المترو حول المارينا لتجنب المواقف.", en: "Use tram/metro around Marina to avoid parking." },
        tip: { ar: "في الصيف اجعل الشاطئ صباحاً فقط.", en: "In summer, keep beach time to the morning." },
        tags: ["balanced", "family", "honeymoon"],
      },
      {
        title: { ar: "الصحراء أو ميركل جاردن موسمياً", en: "Desert safari or Miracle Garden seasonally" },
        focus: { ar: "تجربة رئيسية واحدة", en: "One anchor experience" },
        area: { ar: "الصحراء أو دبي لاند", en: "Desert or Dubailand" },
        morning: { ar: "صباح خفيف في السكن أو مقهى قريب.", en: "Light morning near your stay or a nearby cafe." },
        afternoon: { ar: "انطلق للصحراء بعد العصر، أو ميركل جاردن إذا كانت مفتوحة موسمياً.", en: "Leave for desert safari after afternoon, or Miracle Garden if seasonally open." },
        evening: { ar: "عشاء ضمن التجربة أو عودة هادئة للسكن.", en: "Dinner within the experience or a calm return to your stay." },
        transit: { ar: "احجز تجربة تشمل النقل إذا لا تستأجر سيارة.", en: "Book an experience with transfer if you are not renting a car." },
        tip: { ar: "لا تجمع الصحراء مع يوم تسوق طويل.", en: "Do not combine desert safari with a heavy shopping day." },
        costWeight: 1.2,
        tags: ["adventure", "family", "honeymoon"],
      },
    ],
    transport: { ar: "دبي سهلة بالمترو في المحاور الرئيسية، لكن بعض التجارب تحتاج سيارة أو نقل منظم.", en: "Dubai is easy by metro on main corridors, but some experiences need a car or organized transfer." },
    weather: { ar: "من مايو إلى سبتمبر اجعل الأنشطة الخارجية صباحاً أو مساءً، واحتفظ بوسط النهار للمولات والمتاحف.", en: "From May to September, keep outdoor activities early or evening; use midday for malls and museums." },
    hotelNote: { ar: "الفنادق غير مربوطة بعروض مباشرة حالياً؛ اختر الحي حسب نوع الرحلة إلى أن نضيف مقارنة الأسعار.", en: "Direct hotel offers are not connected yet; choose the area by trip style until price comparison is added." },
    serviceAdvice: [
      { ar: "eSIM أو باقة بيانات مفيدة للتنقل والتطبيقات.", en: "An eSIM or data plan helps with transport and apps." },
      { ar: "احجز الأنشطة الكبيرة مسبقاً في المواسم المزدحمة.", en: "Book major activities ahead in busy seasons." },
    ],
  },
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function t(value: LocalizedText, locale: "ar" | "en") {
  return value[locale];
}

function sanitizeActivity(activity: string, destinationName: string, locale: "ar" | "en") {
  const trimmed = activity.trim();
  const isGeneric = FORBIDDEN_GENERIC.some((bad) => trimmed.toLowerCase().includes(bad.toLowerCase()));
  if (!trimmed || isGeneric) {
    return locale === "ar"
      ? `تجربة محددة في ${destinationName} يراجعها ريا حسب الموسم`
      : `A specific ${destinationName} experience that Rya can tune by season`;
  }
  return trimmed;
}

function formatDestinationName(code: string | null, raw: string, locale: "ar" | "en") {
  if (!code) return raw.trim();
  const guide = CITY_GUIDES[code];
  if (guide) return t(guide.names, locale);
  const profile = DESTINATIONS[code];
  if (profile) return locale === "ar" ? profile.nameAr : profile.nameEn;
  return iataToCity(code);
}

function budgetMultiplier(tripType: PlannerTripType) {
  if (tripType === "budget") return 0.8;
  if (tripType === "honeymoon") return 1.35;
  if (tripType === "business") return 1.25;
  if (tripType === "family") return 1.15;
  return 1;
}

function budgetLevel(input: TripPlanInput, dailyNeed: number) {
  const perTravelerPerDay = input.budget / Math.max(1, input.travelers) / Math.max(1, input.days);
  if (perTravelerPerDay < dailyNeed * 0.85) return "tight";
  if (perTravelerPerDay > dailyNeed * 1.45) return "comfortable";
  return "balanced";
}

function splitCosts(total: number, tripType: PlannerTripType, locale: "ar" | "en") {
  const rawHotelPct = tripType === "honeymoon" ? 0.42 : tripType === "budget" ? 0.30 : 0.36;
  const rawActivitiesPct = tripType === "adventure" || tripType === "family" ? 0.26 : 0.21;
  const rawFoodPct = tripType === "business" ? 0.22 : 0.23;
  const rawTransportPct = tripType === "adventure" ? 0.16 : 0.12;
  const bufferPct = 0.06;
  const scale = (1 - bufferPct) / (rawHotelPct + rawActivitiesPct + rawFoodPct + rawTransportPct);
  const hotelPct = rawHotelPct * scale;
  const activitiesPct = rawActivitiesPct * scale;
  const foodPct = rawFoodPct * scale;
  const transportPct = rawTransportPct * scale;
  const hotelAmount = Math.round(total * hotelPct);
  const activitiesAmount = Math.round(total * activitiesPct);
  const foodAmount = Math.round(total * foodPct);
  const transportAmount = Math.round(total * transportPct);
  const bufferAmount = Math.max(0, total - hotelAmount - activitiesAmount - foodAmount - transportAmount);
  const labels =
    locale === "ar"
      ? ["الإقامة", "الأنشطة", "الأكل", "المواصلات", "احتياط"]
      : ["Stay", "Activities", "Food", "Transport", "Buffer"];
  return [
    { label: labels[0], amount: hotelAmount },
    { label: labels[1], amount: activitiesAmount },
    { label: labels[2], amount: foodAmount },
    { label: labels[3], amount: transportAmount },
    { label: labels[4], amount: bufferAmount },
  ];
}

function pickDayTemplates(
  guide: CityPlannerGuide,
  tripType: PlannerTripType,
  count: number,
) {
  const preferred = guide.days.filter((day) => day.tags?.includes(tripType));
  const pool = preferred.length >= Math.min(count, 2)
    ? [...preferred, ...guide.days.filter((day) => !preferred.includes(day))]
    : guide.days;
  return pool.length ? pool : guide.days;
}

function genericTemplates(input: TripPlanInput, destinationName: string, destinationCode: string | null): DayTemplate[] {
  const profile = destinationCode ? DESTINATIONS[destinationCode] : null;
  const isAr = input.locale === "ar";
  const activities = (
    isAr ? profile?.top_activities_ar : profile?.top_activities_en
  )?.map((item) => sanitizeActivity(item, destinationName, input.locale)) ?? [];
  const safeActivities = activities.length >= 3
    ? activities
    : isAr
      ? [
          `مركز ${destinationName} والمنطقة الأكثر مناسبة للسكن`,
          `واجهة أو حي معروف في ${destinationName}`,
          `تجربة ثقافية أو طبيعية يحددها ريا حسب الموسم`,
        ]
      : [
          `${destinationName} center and best stay area`,
          `A known waterfront or neighborhood in ${destinationName}`,
          `A cultural or nature experience Rya can tune by season`,
        ];

  return safeActivities.slice(0, 8).map((activity, index) => ({
    title: { ar: `يوم ${index + 2}: ${activity}`, en: `Day ${index + 2}: ${activity}` },
    focus: { ar: activity, en: activity },
    area: { ar: destinationName, en: destinationName },
    morning: {
      ar: `ابدأ بـ ${activity} في وقت مبكر لتجنب الزحام.`,
      en: `Start with ${activity} early to avoid crowds.`,
    },
    afternoon: {
      ar: "غداء قريب ثم نشاط ثانٍ خفيف بدل ضغط اليوم بثلاثة مواقع بعيدة.",
      en: "Nearby lunch, then one lighter second stop instead of packing three distant places.",
    },
    evening: {
      ar: "اختم بعشاء قريب من منطقة السكن أو منطقة آمنة وحيوية.",
      en: "End with dinner near your stay area or a safe lively district.",
    },
    transit: {
      ar: "اجعل اليوم داخل منطقة واحدة قدر الإمكان لتقليل التنقل.",
      en: "Keep the day within one area when possible to reduce transfers.",
    },
    tip: {
      ar: "اسأل ريا قبل الحجز لتبديل هذا اليوم حسب الطقس والموسم.",
      en: "Ask Rya before booking to tune this day by weather and season.",
    },
    costWeight: 1,
  }));
}

function buildDayFromTemplate(
  template: DayTemplate,
  day: number,
  input: TripPlanInput,
  destinationName: string,
  dailyBudget: number,
): TripPlanDay {
  const locale = input.locale;
  const isAr = locale === "ar";
  const cost = Math.max(0, Math.round(dailyBudget * (template.costWeight ?? 1)));
  const focus = t(template.focus, locale);
  return {
    day,
    title: day === 1 || day === input.days ? t(template.title, locale) : `${isAr ? `يوم ${day}: ` : `Day ${day}: `}${t(template.title, locale).replace(/^يوم\s+\d+:\s*|^Day\s+\d+:\s*/i, "")}`,
    focus,
    area: t(template.area, locale),
    morning: t(template.morning, locale),
    afternoon: t(template.afternoon, locale),
    evening: t(template.evening, locale),
    transit: t(template.transit, locale),
    estimatedCost: cost,
    tip: t(template.tip, locale),
    ryaPrompt: isAr
      ? `عدلي يوم ${day} في خطتي إلى ${destinationName}: ${focus}. اجعليه مناسباً لـ ${TRIP_TYPE_LABELS.ar[input.tripType]} وبميزانية ${input.budget} ${input.currency ?? "SAR"}.`
      : `Adjust day ${day} of my ${destinationName} plan: ${focus}. Make it fit a ${TRIP_TYPE_LABELS.en[input.tripType]} trip and a ${input.budget} ${input.currency ?? "USD"} budget.`,
  };
}

function buildDays(input: TripPlanInput, destinationCode: string | null, destinationName: string): TripPlanDay[] {
  const days = clamp(input.days, 1, 14);
  const dailyBudget = Math.round(input.budget / Math.max(1, days));
  const guide = destinationCode ? CITY_GUIDES[destinationCode] : null;

  if (guide) {
    if (days === 1) {
      const oneDay = pickDayTemplates(guide, input.tripType, 1)[0] ?? guide.arrival;
      return [buildDayFromTemplate(oneDay, 1, { ...input, days }, destinationName, dailyBudget)];
    }

    const middleCount = Math.max(0, days - 2);
    const middle = pickDayTemplates(guide, input.tripType, middleCount);
    const templates = [
      guide.arrival,
      ...Array.from({ length: middleCount }, (_, index) => middle[index % middle.length]),
      guide.departure,
    ];

    return templates.map((template, index) =>
      buildDayFromTemplate(template, index + 1, { ...input, days }, destinationName, dailyBudget),
    );
  }

  const templates = genericTemplates(input, destinationName, destinationCode);
  if (days === 1) return [buildDayFromTemplate(templates[0], 1, { ...input, days }, destinationName, dailyBudget)];
  const finalTemplate: DayTemplate = {
    title: { ar: "المغادرة واللمسات الأخيرة", en: "Departure and final touches" },
    focus: { ar: "تجهيز ومغادرة", en: "Pack and depart" },
    area: { ar: destinationName, en: destinationName },
    morning: { ar: "إفطار هادئ وتجهيز الحقائب.", en: "Slow breakfast and packing." },
    afternoon: { ar: "نشاط قريب من السكن فقط إذا وقت الرحلة يسمح.", en: "Nearby activity only if flight timing allows." },
    evening: { ar: "التوجه للمطار أو محطة المغادرة بهامش كاف.", en: "Head to the airport or departure point with enough buffer." },
    transit: { ar: "اترك هامشاً للتنقل والمطار.", en: "Leave a transport and airport buffer." },
    tip: { ar: "لا تضع نشاطاً بعيداً في يوم المغادرة.", en: "Do not schedule a distant stop on departure day." },
    costWeight: 0.55,
  };
  return Array.from({ length: days }, (_, index) => {
    if (index === days - 1) {
      return buildDayFromTemplate(finalTemplate, index + 1, { ...input, days }, destinationName, dailyBudget);
    }
    return buildDayFromTemplate(templates[index % templates.length], index + 1, { ...input, days }, destinationName, dailyBudget);
  });
}

function buildStayAdvice(
  guide: CityPlannerGuide | null,
  destinationName: string,
  tripType: PlannerTripType,
  locale: "ar" | "en",
) {
  const isAr = locale === "ar";
  if (guide) {
    const best = tripType === "family"
      ? guide.stayAreas[1] ?? guide.stayAreas[0]
      : tripType === "budget"
        ? guide.stayAreas[2] ?? guide.stayAreas[0]
        : guide.stayAreas[0];
    return isAr
      ? `${t(best, locale)}. اختر السكن حسب أول يومين في الجدول، لا حسب أرخص سعر فقط.`
      : `${t(best, locale)}. Choose the stay area around your first two days, not only the cheapest rate.`;
  }
  return isAr
    ? `اختر منطقة مركزية في ${destinationName} قريبة من أول يومين في الجدول، واطلب من ريا فحص الحي قبل الحجز.`
    : `Choose a central ${destinationName} area close to the first two days of the plan, and ask Rya to sanity-check the neighborhood before booking.`;
}

export function buildTripPlan(input: TripPlanInput): TripPlan {
  const locale = input.locale;
  const isAr = locale === "ar";
  const originCode = resolveIata(input.origin);
  const destinationCode = resolveIata(input.destination);
  const guide = destinationCode ? CITY_GUIDES[destinationCode] : null;
  const profile = destinationCode ? DESTINATIONS[destinationCode] : null;
  const days = clamp(Number(input.days) || 5, 1, 14);
  const travelers = clamp(Number(input.travelers) || 2, 1, 12);
  const budget = Math.max(0, Math.round(Number(input.budget) || 0));
  const currency = input.currency || (isAr ? "SAR" : "USD");
  const dailyBase =
    (profile?.budget_per_day_usd.moderate ?? 120) * budgetMultiplier(input.tripType);
  const level = budgetLevel({ ...input, days, travelers, budget }, dailyBase);
  const destinationName = formatDestinationName(destinationCode, input.destination, locale);
  const originName = formatDestinationName(originCode, input.origin, locale);
  const daily = Math.round(budget / Math.max(1, travelers) / Math.max(1, days));
  const daysPlan = buildDays({ ...input, days, travelers, budget, currency }, destinationCode, destinationName);
  const stayAreas = guide?.stayAreas.map((area) => t(area, locale)) ?? [];

  return {
    originCode,
    destinationCode,
    originName,
    destinationName,
    days,
    travelers,
    tripType: input.tripType,
    budget,
    currency,
    budgetLevel: level,
    estimatedDailyBudget: daily,
    summary: isAr
      ? `خطة ${TRIP_TYPE_LABELS.ar[input.tripType]} من ${originName} إلى ${destinationName} لمدة ${days} أيام. ركزت على أيام واقعية، تنقلات أقل، وأماكن محددة بدل جدول عام.`
      : `A ${TRIP_TYPE_LABELS.en[input.tripType]} plan from ${originName} to ${destinationName} for ${days} days, built around realistic pacing, fewer transfers, and specific places.`,
    stayAdvice: buildStayAdvice(guide, destinationName, input.tripType, locale),
    bestStayAreas: stayAreas,
    flightAdvice: isAr
      ? `راقب رحلات ${originCode ?? originName} إلى ${destinationCode ?? destinationName} مبكراً. إذا الميزانية ${level === "tight" ? "مشدودة" : "مناسبة"}، جرّب مرونة يوم أو يومين وابتعد عن أوقات الذروة.`
      : `Track ${originCode ?? originName} to ${destinationCode ?? destinationName} early. If the budget is ${level === "tight" ? "tight" : "reasonable"}, try 1-2 days of flexibility and avoid peak times.`,
    visaAdvice: isAr
      ? profile?.visa_note_ar ?? "تحقق من متطلبات التأشيرة حسب جنسيتك قبل الحجز النهائي."
      : profile?.visa_note_en ?? "Check visa requirements for your nationality before final booking.",
    localTransportAdvice: guide
      ? t(guide.transport, locale)
      : isAr
        ? `اجعل كل يوم داخل منطقة واحدة في ${destinationName} قدر الإمكان حتى لا تضيع الرحلة في التنقل.`
        : `Keep each day within one ${destinationName} area as much as possible so the trip is not lost in transfers.`,
    weatherAdvice: guide
      ? t(guide.weather, locale)
      : isAr
        ? "راجع الطقس قبل تثبيت الأنشطة الخارجية، واجعل لديك بديل داخلي لكل يوم."
        : "Check weather before fixing outdoor activities and keep one indoor backup per day.",
    serviceAdvice: (guide?.serviceAdvice.map((item) => t(item, locale)) ?? [
      isAr
        ? "استخدم eSIM أو باقة بيانات إذا كانت الرحلة دولية أو تحتاج خرائط وترجمة."
        : "Use an eSIM or data plan if the trip is international or you need maps and translation.",
      isAr
        ? "التأمين مفيد إذا كانت الحجوزات غير قابلة للاسترداد أو الرحلة طويلة."
        : "Insurance is useful when bookings are non-refundable or the trip is long.",
    ]),
    hotelDisclosure: guide
      ? t(guide.hotelNote, locale)
      : isAr
        ? "الفنادق غير مربوطة بعروض مباشرة حالياً؛ الخطة تعطيك مناطق السكن المناسبة إلى أن يتم تفعيل مقارنة الأسعار."
        : "Direct hotel offers are not connected yet; the plan gives suitable stay areas until price comparison is enabled.",
    packingAdvice:
      (isAr ? profile?.packing_tips_ar : profile?.packing_tips_en)?.slice(0, 4) ??
      (isAr
        ? ["جواز سفر/هوية سارية", "شاحن متنقل", "ملابس مناسبة للموسم", "نسخة رقمية من الحجوزات"]
        : ["Valid passport/ID", "Power bank", "Season-appropriate clothes", "Digital copies of bookings"]),
    costBreakdown: splitCosts(budget, input.tripType, locale),
    daysPlan,
    nextSteps: isAr
      ? [
          "اسأل ريا لتعديل أي يوم حسب الطقس أو الأطفال أو الميزانية.",
          "اختر منطقة السكن من القائمة قبل البحث عن فندق.",
          "افتح صفحة الطيران للمقارنة قبل الحجز.",
          "احفظ الخطة أو اطبعها PDF من المتصفح.",
        ]
      : [
          "Ask Rya to adjust any day by weather, kids, or budget.",
          "Choose the stay area before searching for a hotel.",
          "Open flight search before booking.",
          "Save the plan or print it as a PDF from your browser.",
        ],
  };
}
