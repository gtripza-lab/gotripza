import "server-only";
import type { Locale } from "./config";

const dictionaries = {
  ar: () => import("./dictionaries/ar.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
} as const;

export type Dictionary = Awaited<ReturnType<(typeof dictionaries)["ar"]>>;

type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K];
};

const localizedCopy: Partial<Record<Exclude<Locale, "ar" | "en">, DeepPartial<Dictionary>>> = {
  fr: {
    nav: { flights: "Voyages", hotels: "Hôtels", packages: "Offres", explore: "Explorer", blog: "Guide de voyage", signin: "Se connecter", getStarted: "Demander à Rya" },
    hero: {
      badge: "Rya by GoTripza — compagnon de voyage IA mondial",
      title1: "Voyagez plus intelligemment",
      title2: "avec Rya",
      subtitle: "Rya comprend votre destination, votre budget, vos dates et votre style avant de suggérer les bonnes étapes.",
      placeholder: "Parlez à Rya de votre voyage...",
      cta: "Parler à Rya",
      voice: "Recherche vocale",
      tagline: "Votre compagnon de voyage avant et pendant le trajet.",
      proof: ["Comprend l’intention du voyageur", "Aide avant et pendant le voyage", "Suggère les services au bon moment"],
      suggestions: { title: "Essayez :", items: ["Planifie un voyage calme en Turquie", "J’ai besoin d’une eSIM et d’une assurance pour le Japon", "Aide-moi à l’aéroport", "Comment éviter les arnaques à Istanbul ?"] },
    },
    brandStory: { title: "Rya d’abord. GoTripza derrière.", body: "Rya comprend votre contexte, garde vos préférences et transforme la préparation du voyage en conversation naturelle.", highlights: ["Mémoire de voyage", "Planification calme", "Aide pendant le trajet"] },
    values: {
      title: "Pourquoi les voyageurs font confiance à Rya",
      items: {
        ai: { title: "Comprend la langue et le contexte", desc: "Rya suit l’intention sans répéter les mêmes questions." },
        smart: { title: "Mémoire de voyage personnelle", desc: "Garde en tête budget, villes et style de voyage." },
        fast: { title: "Aide pendant le voyage", desc: "Traduction, aéroports, sécurité, budget et moments du quotidien." },
        support: { title: "Recommandations sans pression", desc: "Les services apparaissent quand ils sont utiles." },
        secure: { title: "Liens partenaires fiables", desc: "Vols, assurance, eSIM et activités avec attribution préservée." },
      },
    },
    destinations: { title: "Destinations à retenir", subtitle: "Demandez à Rya, puis décidez sereinement.", items: { story: "Chaque voyage a une histoire", fly: "Meilleur prix de vol", stay: "Conseils de quartier", explore: "Explorer" } },
    results: { loading: "Rya comprend votre demande et prépare la meilleure étape...", flights: "Vols", hotels: "Hôtels", bestValue: "Meilleur choix", fastest: "Plus rapide", cheapest: "Moins cher", bookNow: "Réserver", from: "De", to: "À", nights: "nuits", perNight: "/ nuit", carRentals: "Location de voiture", activities: "Activités", carRentalsDesc: "Comparez les voitures à destination", activitiesDesc: "Découvrez les meilleures activités" },
    footer: { tagline: "Rya by GoTripza — votre compagnon de voyage IA.", rights: "Tous droits réservés", about: "À propos", contact: "Contact", affiliateDisclosure: "Divulgation d’affiliation", privacy: "Confidentialité", terms: "Conditions", affiliateTitle: "Divulgation d’affiliation", affiliate: "GoTripza peut recevoir une commission via ses partenaires, sans coût supplémentaire pour vous." },
    payments: { title: "Payez à votre façon" },
    errors: { parse: "Je n’ai pas compris. Ajoutez destination, dates et nombre de voyageurs.", network: "Connexion perdue. Vérifiez Internet et réessayez." },
  },
  de: {
    nav: { flights: "Reisen", hotels: "Hotels", packages: "Pakete", explore: "Entdecken", blog: "Reiseführer", signin: "Anmelden", getStarted: "Rya fragen" },
    hero: { badge: "Rya by GoTripza — globaler KI-Reisebegleiter", title1: "Reise smarter", title2: "mit Rya", subtitle: "Rya versteht Ziel, Budget, Daten und Reisestil, bevor passende Vorschläge erscheinen.", placeholder: "Erzähle Rya von deiner Reise...", cta: "Mit Rya sprechen", voice: "Sprachsuche", tagline: "Dein Reisebegleiter vor und während der Reise.", proof: ["Versteht Reiseabsicht", "Hilft vor und während der Reise", "Empfiehlt Services im richtigen Moment"], suggestions: { title: "Probieren:", items: ["Plane eine ruhige Türkei-Reise", "eSIM und Versicherung für Japan", "Hilf mir am Flughafen", "Wie vermeide ich Betrug in Istanbul?"] } },
    brandStory: { title: "Rya zuerst. GoTripza im Hintergrund.", body: "Rya versteht Kontext, merkt sich Präferenzen und macht Reiseplanung zu einem natürlichen Gespräch.", highlights: ["Reisegedächtnis", "Ruhige Planung", "Hilfe unterwegs"] },
    values: { title: "Warum Reisende Rya vertrauen", items: { ai: { title: "Versteht Sprache und Kontext", desc: "Rya folgt der Absicht ohne Wiederholungen." }, smart: { title: "Persönliches Reisegedächtnis", desc: "Budget, Städte und Reisestil bleiben im Kontext." }, fast: { title: "Hilfe unterwegs", desc: "Übersetzung, Flughäfen, Sicherheit, Budget und Alltag." }, support: { title: "Empfehlungen ohne Druck", desc: "Services erscheinen nur, wenn sie nützlich sind." }, secure: { title: "Vertrauenswürdige Partnerlinks", desc: "Flüge, Versicherung, eSIMs und Aktivitäten mit korrekter Zuordnung." } } },
    destinations: { title: "Reiseziele, die bleiben", subtitle: "Frag Rya und entscheide in Ruhe.", items: { story: "Jede Reise hat eine Geschichte", fly: "Bester Flugpreis", stay: "Tipps zur Wohnlage", explore: "Entdecken" } },
    results: { loading: "Rya versteht deine Anfrage und bereitet den nächsten Schritt vor...", flights: "Flüge", hotels: "Hotels", bestValue: "Bester Wert", fastest: "Schnellste", cheapest: "Günstigste", bookNow: "Buchen", from: "Von", to: "Nach", nights: "Nächte", perNight: "/ Nacht", carRentals: "Mietwagen", activities: "Aktivitäten", carRentalsDesc: "Vergleiche Mietwagen am Ziel", activitiesDesc: "Entdecke Top-Aktivitäten" },
    footer: { tagline: "Rya by GoTripza — dein KI-Reisebegleiter.", rights: "Alle Rechte vorbehalten", about: "Über uns", contact: "Kontakt", affiliateDisclosure: "Affiliate-Hinweis", privacy: "Datenschutz", terms: "Bedingungen", affiliateTitle: "Affiliate-Hinweis", affiliate: "GoTripza kann über Partner eine Provision erhalten, ohne Mehrkosten für dich." },
    payments: { title: "Bezahle auf deine Weise" },
    errors: { parse: "Nicht verstanden. Füge Ziel, Daten und Reisende hinzu.", network: "Verbindung verloren. Bitte Internet prüfen und erneut versuchen." },
  },
  es: {
    nav: { flights: "Viajes", hotels: "Hoteles", packages: "Paquetes", explore: "Explorar", blog: "Guía de viaje", signin: "Iniciar sesión", getStarted: "Preguntar a Rya" },
    hero: { badge: "Rya by GoTripza — compañera de viaje con IA", title1: "Viaja mejor", title2: "con Rya", subtitle: "Rya entiende destino, presupuesto, fechas y estilo antes de sugerir el siguiente paso.", placeholder: "Cuéntale a Rya sobre tu viaje...", cta: "Hablar con Rya", voice: "Búsqueda por voz", tagline: "Tu compañera antes y durante el viaje.", proof: ["Entiende la intención del viajero", "Ayuda antes y durante el viaje", "Sugiere servicios en el momento adecuado"], suggestions: { title: "Prueba:", items: ["Planifica un viaje tranquilo a Turquía", "Necesito eSIM y seguro para Japón", "Ayúdame en el aeropuerto", "Cómo evitar estafas en Estambul"] } },
    footer: { tagline: "Rya by GoTripza — tu compañera de viaje con IA.", rights: "Todos los derechos reservados", about: "Acerca de", contact: "Contacto", affiliateDisclosure: "Divulgación de afiliados", privacy: "Privacidad", terms: "Términos", affiliateTitle: "Divulgación de afiliados", affiliate: "GoTripza puede recibir comisión de socios sin coste adicional para ti." },
    results: { loading: "Rya entiende tu solicitud y prepara el mejor siguiente paso...", flights: "Vuelos", hotels: "Hoteles", bestValue: "Mejor valor", fastest: "Más rápido", cheapest: "Más barato", bookNow: "Reservar", from: "Desde", to: "A", nights: "noches", perNight: "/ noche", carRentals: "Alquiler de coches", activities: "Actividades", carRentalsDesc: "Compara coches en tu destino", activitiesDesc: "Descubre actividades destacadas" },
    errors: { parse: "No pude entenderlo. Añade destino, fechas y viajeros.", network: "Conexión perdida. Revisa internet e inténtalo de nuevo." },
  },
  it: {
    nav: { flights: "Viaggi", hotels: "Hotel", packages: "Pacchetti", explore: "Esplora", blog: "Guida di viaggio", signin: "Accedi", getStarted: "Chiedi a Rya" },
    hero: { badge: "Rya by GoTripza — compagna di viaggio IA globale", title1: "Viaggia meglio", title2: "con Rya", subtitle: "Rya capisce destinazione, budget, date e stile prima di suggerire il passo giusto.", placeholder: "Racconta a Rya il tuo viaggio...", cta: "Parla con Rya", voice: "Ricerca vocale", tagline: "La tua compagna prima e durante il viaggio.", proof: ["Capisce l’intento del viaggiatore", "Aiuta prima e durante il viaggio", "Suggerisce servizi al momento giusto"], suggestions: { title: "Prova:", items: ["Pianifica un viaggio tranquillo in Turchia", "Mi servono eSIM e assicurazione per il Giappone", "Aiutami in aeroporto", "Come evitare truffe a Istanbul?"] } },
    footer: { tagline: "Rya by GoTripza — la tua compagna di viaggio IA.", rights: "Tutti i diritti riservati", about: "Chi siamo", contact: "Contatto", affiliateDisclosure: "Informativa affiliazione", privacy: "Privacy", terms: "Termini", affiliateTitle: "Informativa affiliazione", affiliate: "GoTripza può ricevere una commissione dai partner senza costi aggiuntivi per te." },
  },
  pt: {
    nav: { flights: "Viagens", hotels: "Hotéis", packages: "Pacotes", explore: "Explorar", blog: "Guia de viagem", signin: "Entrar", getStarted: "Perguntar à Rya" },
    hero: { badge: "Rya by GoTripza — companheira de viagem com IA", title1: "Viaje melhor", title2: "com Rya", subtitle: "Rya entende destino, orçamento, datas e estilo antes de sugerir o próximo passo.", placeholder: "Conte à Rya sobre sua viagem...", cta: "Falar com Rya", voice: "Busca por voz", tagline: "Sua companheira antes e durante a viagem.", proof: ["Entende a intenção do viajante", "Ajuda antes e durante a viagem", "Sugere serviços no momento certo"], suggestions: { title: "Experimente:", items: ["Planeje uma viagem calma à Turquia", "Preciso de eSIM e seguro para o Japão", "Ajude-me no aeroporto", "Como evitar golpes em Istambul?"] } },
    footer: { tagline: "Rya by GoTripza — sua companheira de viagem com IA.", rights: "Todos os direitos reservados", about: "Sobre", contact: "Contato", affiliateDisclosure: "Divulgação de afiliados", privacy: "Privacidade", terms: "Termos", affiliateTitle: "Divulgação de afiliados", affiliate: "GoTripza pode receber comissão de parceiros sem custo extra para você." },
  },
  tr: {
    nav: { flights: "Seyahatler", hotels: "Oteller", packages: "Paketler", explore: "Keşfet", blog: "Seyahat Rehberi", signin: "Giriş yap", getStarted: "Rya’ya sor" },
    hero: { badge: "Rya by GoTripza — küresel yapay zekalı seyahat arkadaşı", title1: "Daha akıllı seyahat et", title2: "Rya ile", subtitle: "Rya hedefinizi, bütçenizi, tarihlerinizi ve tarzınızı anlayıp doğru anda öneri sunar.", placeholder: "Seyahatinizi Rya’ya anlatın...", cta: "Rya ile konuş", voice: "Sesli arama", tagline: "Yolculuk öncesi ve sırasında seyahat arkadaşınız.", proof: ["Yolcunun niyetini anlar", "Seyahat öncesi ve sırasında yardımcı olur", "Hizmetleri doğru anda önerir"], suggestions: { title: "Deneyin:", items: ["Sakin bir Türkiye gezisi planla", "Japonya için eSIM ve sigorta lazım", "Havalimanında yardım et", "İstanbul’da dolandırıcılıktan nasıl kaçınırım?"] } },
    footer: { tagline: "Rya by GoTripza — yapay zekalı seyahat arkadaşınız.", rights: "Tüm hakları saklıdır", about: "Hakkında", contact: "İletişim", affiliateDisclosure: "Ortaklık açıklaması", privacy: "Gizlilik", terms: "Şartlar", affiliateTitle: "Ortaklık açıklaması", affiliate: "GoTripza, size ek maliyet olmadan ortaklardan komisyon alabilir." },
  },
  nl: {
    nav: { flights: "Reizen", hotels: "Hotels", packages: "Pakketten", explore: "Ontdekken", blog: "Reisgids", signin: "Inloggen", getStarted: "Vraag Rya" },
    hero: { badge: "Rya by GoTripza — wereldwijde AI-reisgenoot", title1: "Reis slimmer", title2: "met Rya", subtitle: "Rya begrijpt bestemming, budget, data en reisstijl voordat ze iets aanbeveelt.", placeholder: "Vertel Rya over je reis...", cta: "Praat met Rya", voice: "Spraak zoeken", tagline: "Je reisgenoot voor en tijdens de reis.", proof: ["Begrijpt reisintentie", "Helpt voor en tijdens de reis", "Stelt diensten voor op het juiste moment"], suggestions: { title: "Probeer:", items: ["Plan een rustige reis naar Turkije", "Ik heb eSIM en verzekering nodig voor Japan", "Help me op de luchthaven", "Hoe vermijd ik oplichting in Istanbul?"] } },
    footer: { tagline: "Rya by GoTripza — je AI-reisgenoot.", rights: "Alle rechten voorbehouden", about: "Over", contact: "Contact", affiliateDisclosure: "Affiliateverklaring", privacy: "Privacy", terms: "Voorwaarden", affiliateTitle: "Affiliateverklaring", affiliate: "GoTripza kan commissie ontvangen via partners zonder extra kosten voor jou." },
  },
  ru: {
    nav: { flights: "Поездки", hotels: "Отели", packages: "Пакеты", explore: "Обзор", blog: "Гид", signin: "Войти", getStarted: "Спросить Rya" },
    hero: { badge: "Rya by GoTripza — глобальный ИИ-спутник в путешествии", title1: "Путешествуйте умнее", title2: "с Rya", subtitle: "Rya понимает направление, бюджет, даты и стиль поездки перед рекомендациями.", placeholder: "Расскажите Rya о поездке...", cta: "Поговорить с Rya", voice: "Голосовой поиск", tagline: "Ваш спутник до и во время поездки.", proof: ["Понимает намерение путешественника", "Помогает до и во время поездки", "Советует сервисы в нужный момент"], suggestions: { title: "Попробуйте:", items: ["Спланируй спокойную поездку в Турцию", "Нужны eSIM и страховка для Японии", "Помоги мне в аэропорту", "Как избежать мошенничества в Стамбуле?"] } },
    footer: { tagline: "Rya by GoTripza — ваш ИИ-спутник в путешествии.", rights: "Все права защищены", about: "О нас", contact: "Контакты", affiliateDisclosure: "Партнёрское раскрытие", privacy: "Конфиденциальность", terms: "Условия", affiliateTitle: "Партнёрское раскрытие", affiliate: "GoTripza может получать комиссию от партнёров без дополнительной платы для вас." },
  },
  pl: {
    nav: { flights: "Podróże", hotels: "Hotele", packages: "Pakiety", explore: "Odkrywaj", blog: "Przewodnik", signin: "Zaloguj", getStarted: "Zapytaj Rya" },
    hero: { badge: "Rya by GoTripza — globalny towarzysz podróży AI", title1: "Podróżuj mądrzej", title2: "z Rya", subtitle: "Rya rozumie kierunek, budżet, daty i styl podróży przed rekomendacją.", placeholder: "Opowiedz Rya o podróży...", cta: "Porozmawiaj z Rya", voice: "Wyszukiwanie głosowe", tagline: "Twój towarzysz przed i w trakcie podróży.", proof: ["Rozumie intencję podróżnika", "Pomaga przed i w trakcie podróży", "Poleca usługi we właściwym momencie"], suggestions: { title: "Spróbuj:", items: ["Zaplanuj spokojną podróż do Turcji", "Potrzebuję eSIM i ubezpieczenia do Japonii", "Pomóż mi na lotnisku", "Jak unikać oszustw w Stambule?"] } },
    footer: { tagline: "Rya by GoTripza — twój towarzysz podróży AI.", rights: "Wszelkie prawa zastrzeżone", about: "O nas", contact: "Kontakt", affiliateDisclosure: "Informacja afiliacyjna", privacy: "Prywatność", terms: "Warunki", affiliateTitle: "Informacja afiliacyjna", affiliate: "GoTripza może otrzymać prowizję od partnerów bez dodatkowych kosztów dla Ciebie." },
  },
  id: {
    nav: { flights: "Perjalanan", hotels: "Hotel", packages: "Paket", explore: "Jelajahi", blog: "Panduan Travel", signin: "Masuk", getStarted: "Tanya Rya" },
    hero: { badge: "Rya by GoTripza — pendamping perjalanan AI global", title1: "Travel lebih cerdas", title2: "dengan Rya", subtitle: "Rya memahami tujuan, anggaran, tanggal, dan gaya perjalanan sebelum memberi saran.", placeholder: "Ceritakan perjalananmu ke Rya...", cta: "Bicara dengan Rya", voice: "Pencarian suara", tagline: "Pendampingmu sebelum dan selama perjalanan.", proof: ["Memahami niat traveler", "Membantu sebelum dan selama perjalanan", "Menyarankan layanan pada waktu tepat"], suggestions: { title: "Coba:", items: ["Rencanakan trip santai ke Turki", "Butuh eSIM dan asuransi untuk Jepang", "Bantu saya di bandara", "Cara menghindari penipuan di Istanbul?"] } },
    footer: { tagline: "Rya by GoTripza — pendamping perjalanan AI Anda.", rights: "Hak cipta dilindungi", about: "Tentang", contact: "Kontak", affiliateDisclosure: "Pengungkapan afiliasi", privacy: "Privasi", terms: "Syarat", affiliateTitle: "Pengungkapan afiliasi", affiliate: "GoTripza dapat menerima komisi dari mitra tanpa biaya tambahan untuk Anda." },
  },
  ms: {
    nav: { flights: "Perjalanan", hotels: "Hotel", packages: "Pakej", explore: "Teroka", blog: "Panduan Perjalanan", signin: "Log masuk", getStarted: "Tanya Rya" },
    hero: { badge: "Rya by GoTripza — teman perjalanan AI global", title1: "Mengembara lebih bijak", title2: "dengan Rya", subtitle: "Rya memahami destinasi, bajet, tarikh dan gaya perjalanan sebelum mencadangkan langkah seterusnya.", placeholder: "Beritahu Rya tentang perjalanan anda...", cta: "Bercakap dengan Rya", voice: "Carian suara", tagline: "Teman anda sebelum dan semasa perjalanan.", proof: ["Memahami niat pengembara", "Membantu sebelum dan semasa perjalanan", "Mencadangkan servis pada masa sesuai"], suggestions: { title: "Cuba:", items: ["Rancang perjalanan tenang ke Turki", "Saya perlukan eSIM dan insurans untuk Jepun", "Bantu saya di lapangan terbang", "Cara elak penipuan di Istanbul?"] } },
    footer: { tagline: "Rya by GoTripza — teman perjalanan AI anda.", rights: "Hak cipta terpelihara", about: "Tentang", contact: "Hubungi", affiliateDisclosure: "Pendedahan afiliasi", privacy: "Privasi", terms: "Terma", affiliateTitle: "Pendedahan afiliasi", affiliate: "GoTripza mungkin menerima komisen daripada rakan kongsi tanpa kos tambahan kepada anda." },
  },
  sv: {
    nav: { flights: "Resor", hotels: "Hotell", packages: "Paket", explore: "Utforska", blog: "Reseguide", signin: "Logga in", getStarted: "Fråga Rya" },
    hero: { badge: "Rya by GoTripza — global AI-resekompis", title1: "Res smartare", title2: "med Rya", subtitle: "Rya förstår resmål, budget, datum och resstil innan hon föreslår något.", placeholder: "Berätta för Rya om din resa...", cta: "Prata med Rya", voice: "Röstsökning", tagline: "Din följeslagare före och under resan.", proof: ["Förstår resenärens avsikt", "Hjälper före och under resan", "Föreslår tjänster i rätt ögonblick"], suggestions: { title: "Prova:", items: ["Planera en lugn Turkietresa", "Jag behöver eSIM och försäkring för Japan", "Hjälp mig på flygplatsen", "Hur undviker jag bedrägerier i Istanbul?"] } },
    footer: { tagline: "Rya by GoTripza — din AI-resekompis.", rights: "Alla rättigheter förbehållna", about: "Om", contact: "Kontakt", affiliateDisclosure: "Affiliateinformation", privacy: "Integritet", terms: "Villkor", affiliateTitle: "Affiliateinformation", affiliate: "GoTripza kan få provision från partners utan extra kostnad för dig." },
  },
  no: {
    nav: { flights: "Reiser", hotels: "Hoteller", packages: "Pakker", explore: "Utforsk", blog: "Reiseguide", signin: "Logg inn", getStarted: "Spør Rya" },
    hero: { badge: "Rya by GoTripza — global AI-reisefølge", title1: "Reis smartere", title2: "med Rya", subtitle: "Rya forstår reisemål, budsjett, datoer og stil før hun foreslår neste steg.", placeholder: "Fortell Rya om reisen din...", cta: "Snakk med Rya", voice: "Stemmesøk", tagline: "Din reisefølge før og under turen.", proof: ["Forstår reisendes intensjon", "Hjelper før og under reisen", "Foreslår tjenester når de trengs"], suggestions: { title: "Prøv:", items: ["Planlegg en rolig Tyrkia-tur", "Jeg trenger eSIM og forsikring til Japan", "Hjelp meg på flyplassen", "Hvordan unngår jeg svindel i Istanbul?"] } },
    footer: { tagline: "Rya by GoTripza — din AI-reisefølge.", rights: "Alle rettigheter reservert", about: "Om", contact: "Kontakt", affiliateDisclosure: "Affiliateinformasjon", privacy: "Personvern", terms: "Vilkår", affiliateTitle: "Affiliateinformasjon", affiliate: "GoTripza kan motta provisjon fra partnere uten ekstra kostnad for deg." },
  },
  da: {
    nav: { flights: "Rejser", hotels: "Hoteller", packages: "Pakker", explore: "Udforsk", blog: "Rejseguide", signin: "Log ind", getStarted: "Spørg Rya" },
    hero: { badge: "Rya by GoTripza — global AI-rejseledsager", title1: "Rejs smartere", title2: "med Rya", subtitle: "Rya forstår destination, budget, datoer og rejsestil før hun foreslår næste skridt.", placeholder: "Fortæl Rya om din rejse...", cta: "Tal med Rya", voice: "Stemmesøgning", tagline: "Din ledsager før og under rejsen.", proof: ["Forstår rejsendes intention", "Hjælper før og under rejsen", "Foreslår tjenester på rette tidspunkt"], suggestions: { title: "Prøv:", items: ["Planlæg en rolig Tyrkiet-rejse", "Jeg har brug for eSIM og forsikring til Japan", "Hjælp mig i lufthavnen", "Hvordan undgår jeg svindel i Istanbul?"] } },
    footer: { tagline: "Rya by GoTripza — din AI-rejseledsager.", rights: "Alle rettigheder forbeholdes", about: "Om", contact: "Kontakt", affiliateDisclosure: "Affiliateoplysning", privacy: "Privatliv", terms: "Vilkår", affiliateTitle: "Affiliateoplysning", affiliate: "GoTripza kan modtage kommission fra partnere uden ekstra omkostninger for dig." },
  },
  hi: {
    nav: { flights: "यात्राएँ", hotels: "होटल", packages: "पैकेज", explore: "एक्सप्लोर", blog: "यात्रा गाइड", signin: "साइन इन", getStarted: "Rya से पूछें" },
    hero: { badge: "Rya by GoTripza — वैश्विक AI यात्रा साथी", title1: "स्मार्ट यात्रा करें", title2: "Rya के साथ", subtitle: "Rya सुझाव देने से पहले गंतव्य, बजट, तारीखें और आपकी यात्रा शैली समझती है।", placeholder: "Rya को अपनी यात्रा के बारे में बताएं...", cta: "Rya से बात करें", voice: "वॉइस सर्च", tagline: "यात्रा से पहले और यात्रा के दौरान आपका साथी।", proof: ["यात्री की जरूरत समझती है", "यात्रा से पहले और दौरान मदद", "सही समय पर सेवाएँ सुझाती है"], suggestions: { title: "कोशिश करें:", items: ["तुर्की की शांत यात्रा प्लान करें", "जापान के लिए eSIM और इंश्योरेंस चाहिए", "एयरपोर्ट पर मदद करें", "इस्तांबुल में धोखाधड़ी से कैसे बचें?"] } },
    footer: { tagline: "Rya by GoTripza — आपका AI यात्रा साथी.", rights: "सभी अधिकार सुरक्षित", about: "हमारे बारे में", contact: "संपर्क", affiliateDisclosure: "एफिलिएट जानकारी", privacy: "गोपनीयता", terms: "शर्तें", affiliateTitle: "एफिलिएट जानकारी", affiliate: "GoTripza साझेदारों से कमीशन प्राप्त कर सकता है, आपके लिए कोई अतिरिक्त लागत नहीं।" },
  },
  ko: {
    nav: { flights: "여행", hotels: "호텔", packages: "패키지", explore: "탐색", blog: "여행 가이드", signin: "로그인", getStarted: "Rya에게 묻기" },
    hero: { badge: "Rya by GoTripza — 글로벌 AI 여행 동반자", title1: "더 스마트하게 여행하세요", title2: "Rya와 함께", subtitle: "Rya는 목적지, 예산, 날짜와 여행 스타일을 이해한 뒤 필요한 제안을 합니다.", placeholder: "Rya에게 여행을 알려주세요...", cta: "Rya와 대화하기", voice: "음성 검색", tagline: "여행 전과 여행 중 함께하는 동반자.", proof: ["여행자의 의도를 이해", "여행 전후로 도움", "필요한 순간에 서비스 추천"], suggestions: { title: "시도해 보세요:", items: ["터키 조용한 여행 계획", "일본 eSIM과 보험 필요", "공항에서 도와줘", "이스탄불 사기 피하는 법"] } },
    footer: { tagline: "Rya by GoTripza — 당신의 AI 여행 동반자.", rights: "모든 권리 보유", about: "소개", contact: "문의", affiliateDisclosure: "제휴 고지", privacy: "개인정보", terms: "약관", affiliateTitle: "제휴 고지", affiliate: "GoTripza는 추가 비용 없이 파트너로부터 수수료를 받을 수 있습니다." },
  },
  ja: {
    nav: { flights: "旅行", hotels: "ホテル", packages: "パッケージ", explore: "探す", blog: "旅行ガイド", signin: "ログイン", getStarted: "Ryaに聞く" },
    hero: { badge: "Rya by GoTripza — 世界対応のAI旅行コンパニオン", title1: "もっと賢く旅する", title2: "Ryaと一緒に", subtitle: "Ryaは目的地、予算、日程、旅のスタイルを理解してから提案します。", placeholder: "Ryaに旅の内容を伝えてください...", cta: "Ryaと話す", voice: "音声検索", tagline: "旅の前も途中も支えるコンパニオン。", proof: ["旅行者の意図を理解", "旅の前と途中でサポート", "必要な時にサービスを提案"], suggestions: { title: "試す:", items: ["落ち着いたトルコ旅行を計画", "日本旅行のeSIMと保険が必要", "空港で助けて", "イスタンブールで詐欺を避ける方法"] } },
    footer: { tagline: "Rya by GoTripza — あなたのAI旅行コンパニオン。", rights: "All rights reserved", about: "概要", contact: "お問い合わせ", affiliateDisclosure: "アフィリエイト開示", privacy: "プライバシー", terms: "利用規約", affiliateTitle: "アフィリエイト開示", affiliate: "GoTripzaは追加費用なしでパートナーから手数料を受け取る場合があります。" },
  },
  zh: {
    nav: { flights: "旅行", hotels: "酒店", packages: "套餐", explore: "探索", blog: "旅行指南", signin: "登录", getStarted: "询问 Rya" },
    hero: { badge: "Rya by GoTripza — 全球 AI 旅行伙伴", title1: "更聪明地旅行", title2: "和 Rya 一起", subtitle: "Rya 会先理解目的地、预算、日期和旅行风格，再给出合适建议。", placeholder: "告诉 Rya 你的旅行计划...", cta: "与 Rya 聊聊", voice: "语音搜索", tagline: "旅行前和旅途中都陪伴你的助手。", proof: ["理解旅行意图", "旅行前后持续帮助", "在合适时机推荐服务"], suggestions: { title: "试试：", items: ["规划一次轻松的土耳其旅行", "日本旅行需要 eSIM 和保险", "在机场帮帮我", "如何在伊斯坦布尔避免骗局？"] } },
    footer: { tagline: "Rya by GoTripza — 你的 AI 旅行伙伴。", rights: "版权所有", about: "关于", contact: "联系", affiliateDisclosure: "联盟披露", privacy: "隐私", terms: "条款", affiliateTitle: "联盟披露", affiliate: "GoTripza 可能通过合作伙伴获得佣金，不会向你收取额外费用。" },
  },
  th: {
    nav: { flights: "ทริป", hotels: "โรงแรม", packages: "แพ็กเกจ", explore: "สำรวจ", blog: "คู่มือเที่ยว", signin: "เข้าสู่ระบบ", getStarted: "ถาม Rya" },
    hero: { badge: "Rya by GoTripza — เพื่อนเดินทาง AI ระดับโลก", title1: "เที่ยวให้ฉลาดขึ้น", title2: "กับ Rya", subtitle: "Rya เข้าใจจุดหมาย งบ วันที่ และสไตล์ ก่อนแนะนำสิ่งที่เหมาะสม", placeholder: "บอก Rya เกี่ยวกับทริปของคุณ...", cta: "คุยกับ Rya", voice: "ค้นหาด้วยเสียง", tagline: "เพื่อนเดินทางก่อนและระหว่างทริป", proof: ["เข้าใจความต้องการของนักเดินทาง", "ช่วยก่อนและระหว่างทริป", "แนะนำบริการในเวลาที่เหมาะสม"], suggestions: { title: "ลองถาม:", items: ["วางแผนเที่ยวตุรกีแบบสบายๆ", "ต้องการ eSIM และประกันสำหรับญี่ปุ่น", "ช่วยฉันที่สนามบิน", "เลี่ยงมิจฉาชีพในอิสตันบูลอย่างไร"] } },
    footer: { tagline: "Rya by GoTripza — เพื่อนเดินทาง AI ของคุณ", rights: "สงวนลิขสิทธิ์", about: "เกี่ยวกับ", contact: "ติดต่อ", affiliateDisclosure: "การเปิดเผยพันธมิตร", privacy: "ความเป็นส่วนตัว", terms: "เงื่อนไข", affiliateTitle: "การเปิดเผยพันธมิตร", affiliate: "GoTripza อาจได้รับค่าคอมมิชชั่นจากพันธมิตรโดยไม่มีค่าใช้จ่ายเพิ่มสำหรับคุณ" },
  },
  vi: {
    nav: { flights: "Chuyến đi", hotels: "Khách sạn", packages: "Gói", explore: "Khám phá", blog: "Cẩm nang du lịch", signin: "Đăng nhập", getStarted: "Hỏi Rya" },
    hero: { badge: "Rya by GoTripza — bạn đồng hành du lịch AI toàn cầu", title1: "Du lịch thông minh hơn", title2: "cùng Rya", subtitle: "Rya hiểu điểm đến, ngân sách, ngày đi và phong cách trước khi gợi ý.", placeholder: "Kể cho Rya về chuyến đi của bạn...", cta: "Trò chuyện với Rya", voice: "Tìm kiếm bằng giọng nói", tagline: "Bạn đồng hành trước và trong chuyến đi.", proof: ["Hiểu ý định du khách", "Giúp trước và trong chuyến đi", "Gợi ý dịch vụ đúng lúc"], suggestions: { title: "Thử:", items: ["Lên kế hoạch chuyến Thổ Nhĩ Kỳ nhẹ nhàng", "Tôi cần eSIM và bảo hiểm cho Nhật", "Giúp tôi ở sân bay", "Tránh lừa đảo ở Istanbul thế nào?"] } },
    footer: { tagline: "Rya by GoTripza — bạn đồng hành du lịch AI.", rights: "Đã đăng ký bản quyền", about: "Giới thiệu", contact: "Liên hệ", affiliateDisclosure: "Công bố liên kết", privacy: "Riêng tư", terms: "Điều khoản", affiliateTitle: "Công bố liên kết", affiliate: "GoTripza có thể nhận hoa hồng từ đối tác mà không tính thêm phí cho bạn." },
  },
};

function mergeDictionary<T>(base: T, override?: DeepPartial<T>): T {
  if (!override) return base;
  if (Array.isArray(base) || Array.isArray(override)) return (override ?? base) as T;
  if (typeof base !== "object" || base === null || typeof override !== "object") {
    return (override ?? base) as T;
  }

  const merged: Record<string, unknown> = { ...(base as Record<string, unknown>) };
  for (const [key, value] of Object.entries(override as Record<string, unknown>)) {
    merged[key] = mergeDictionary((base as Record<string, unknown>)[key], value as never);
  }
  return merged as T;
}

export const getDictionary = async (locale: Locale): Promise<Dictionary> => {
  if (locale === "ar") return dictionaries.ar();

  const english = await dictionaries.en();
  if (locale === "en") return english;

  return mergeDictionary(english, localizedCopy[locale]);
};
