import type { Locale } from "@/i18n/config";

type SeoCopy = {
  shortAnswer: string;
  quickSnapshot: string;
  destinationSnapshot: string;
  relatedPlanningLinks: string;
  faq: string;
  from: string;
  to: string;
  localCurrency: string;
  originCurrency: string;
  perPersonDay: string;
  tripLength: string;
  inDestinationBudget: string;
  bestFor: string;
  planWithRya: string;
  askRya: string;
  airportArrivalGuide: string;
  transferOptions: string;
  lateArrival: string;
  esimWifi: string;
  taxiCaution: string;
  travelGuideHub: string;
  aiSearchReady: string;
  editorialNote: string;
};

const EN: SeoCopy = {
  shortAnswer: "Short answer",
  quickSnapshot: "Quick planning snapshot",
  destinationSnapshot: "Destination snapshot",
  relatedPlanningLinks: "Related planning links",
  faq: "Frequently asked questions",
  from: "From",
  to: "To",
  localCurrency: "Local currency",
  originCurrency: "Origin currency",
  perPersonDay: "per person / day",
  tripLength: "Trip length",
  inDestinationBudget: "In-destination budget",
  bestFor: "Best for",
  planWithRya: "Plan with Rya",
  askRya: "Ask Rya",
  airportArrivalGuide: "Arrival-first airport guide",
  transferOptions: "Transfer options",
  lateArrival: "Late arrival",
  esimWifi: "eSIM and Wi-Fi",
  taxiCaution: "Taxi caution",
  travelGuideHub: "Travel guide hub",
  aiSearchReady: "AI-search ready travel guide",
  editorialNote:
    "Planning note: travel rules, insurance terms, safety conditions, transport prices, and mobile coverage can change. Use this guide as practical planning help and confirm critical details with official providers before booking.",
};

const COPIES: Partial<Record<Locale, Partial<SeoCopy>>> = {
  ar: {
    shortAnswer: "الإجابة المختصرة",
    quickSnapshot: "ملخص سريع",
    destinationSnapshot: "ملخص الوجهة",
    relatedPlanningLinks: "روابط تخطيط مرتبطة",
    faq: "أسئلة شائعة",
    from: "من",
    to: "إلى",
    localCurrency: "عملة الوجهة",
    originCurrency: "عملة السوق",
    perPersonDay: "لكل شخص / يوم",
    tripLength: "المدة",
    inDestinationBudget: "داخل الوجهة",
    bestFor: "مناسب لـ",
    planWithRya: "خطط مع ريا",
    askRya: "اسأل ريا",
    airportArrivalGuide: "دليل وصول سريع",
    transferOptions: "خيارات النقل",
    lateArrival: "الوصول المتأخر",
    esimWifi: "eSIM والإنترنت",
    taxiCaution: "تنبيه التاكسي",
    travelGuideHub: "مركز أدلة السفر",
    aiSearchReady: "دليل قابل للظهور في بحث AI",
    editorialNote:
      "ملاحظة تخطيط: قد تتغير القوانين، شروط التأمين، الأمان، أسعار المواصلات، وتغطية الشبكات. استخدم الدليل كمرجع عملي وتحقق من التفاصيل المهمة من الجهات الرسمية قبل الحجز.",
  },
  fr: {
    shortAnswer: "Réponse rapide",
    quickSnapshot: "Résumé de planification",
    destinationSnapshot: "Aperçu de la destination",
    relatedPlanningLinks: "Liens de planification",
    faq: "Questions fréquentes",
    from: "Depuis",
    to: "Vers",
    localCurrency: "Devise locale",
    originCurrency: "Devise de départ",
    perPersonDay: "par personne / jour",
    planWithRya: "Planifier avec Rya",
    airportArrivalGuide: "Guide d'arrivée à l'aéroport",
    aiSearchReady: "Guide optimisé pour la recherche IA",
    editorialNote:
      "Note de planification : les règles, assurances, conditions de sécurité, prix des transports et couvertures mobiles peuvent changer. Vérifiez les détails critiques auprès des sources officielles.",
  },
  de: {
    shortAnswer: "Kurzantwort",
    quickSnapshot: "Planungsüberblick",
    destinationSnapshot: "Reiseziel-Überblick",
    relatedPlanningLinks: "Verwandte Planungslinks",
    faq: "Häufige Fragen",
    from: "Ab",
    to: "Nach",
    localCurrency: "Lokale Währung",
    originCurrency: "Ausgangswährung",
    perPersonDay: "pro Person / Tag",
    planWithRya: "Mit Rya planen",
    airportArrivalGuide: "Ankunftsorientierter Flughafenführer",
    aiSearchReady: "Für KI-Suche optimierter Reiseführer",
    editorialNote:
      "Planungshinweis: Regeln, Versicherungsbedingungen, Sicherheitslage, Transportpreise und Netzabdeckung können sich ändern. Prüfen Sie wichtige Details vor der Buchung offiziell.",
  },
  es: {
    shortAnswer: "Respuesta rápida",
    quickSnapshot: "Resumen de planificación",
    destinationSnapshot: "Resumen del destino",
    relatedPlanningLinks: "Enlaces de planificación",
    faq: "Preguntas frecuentes",
    from: "Desde",
    to: "A",
    localCurrency: "Moneda local",
    originCurrency: "Moneda de origen",
    perPersonDay: "por persona / día",
    planWithRya: "Planificar con Rya",
    airportArrivalGuide: "Guía de llegada al aeropuerto",
    aiSearchReady: "Guía optimizada para búsqueda con IA",
    editorialNote:
      "Nota de planificación: las normas, seguros, seguridad, precios de transporte y cobertura móvil pueden cambiar. Confirma los detalles críticos con fuentes oficiales antes de reservar.",
  },
  it: {
    shortAnswer: "Risposta rapida",
    quickSnapshot: "Sintesi di pianificazione",
    destinationSnapshot: "Panoramica destinazione",
    relatedPlanningLinks: "Link di pianificazione",
    faq: "Domande frequenti",
    from: "Da",
    to: "A",
    localCurrency: "Valuta locale",
    originCurrency: "Valuta di partenza",
    perPersonDay: "per persona / giorno",
    planWithRya: "Pianifica con Rya",
    airportArrivalGuide: "Guida arrivo aeroporto",
    aiSearchReady: "Guida ottimizzata per ricerca IA",
    editorialNote:
      "Nota di pianificazione: regole, assicurazioni, sicurezza, prezzi dei trasporti e copertura mobile possono cambiare. Verifica i dettagli critici con fonti ufficiali.",
  },
  pt: {
    shortAnswer: "Resposta rápida",
    quickSnapshot: "Resumo de planejamento",
    destinationSnapshot: "Resumo do destino",
    relatedPlanningLinks: "Links de planejamento",
    faq: "Perguntas frequentes",
    from: "De",
    to: "Para",
    localCurrency: "Moeda local",
    originCurrency: "Moeda de origem",
    perPersonDay: "por pessoa / dia",
    planWithRya: "Planejar com Rya",
    airportArrivalGuide: "Guia de chegada ao aeroporto",
    aiSearchReady: "Guia otimizado para busca com IA",
    editorialNote:
      "Nota de planejamento: regras, seguros, segurança, preços de transporte e cobertura móvel podem mudar. Confirme detalhes importantes com fontes oficiais antes de reservar.",
  },
  ko: {
    shortAnswer: "빠른 답변",
    quickSnapshot: "여행 계획 요약",
    destinationSnapshot: "목적지 요약",
    relatedPlanningLinks: "관련 계획 링크",
    faq: "자주 묻는 질문",
    from: "출발",
    to: "도착",
    localCurrency: "현지 통화",
    originCurrency: "출발지 통화",
    perPersonDay: "1인 / 1일",
    planWithRya: "Rya와 계획하기",
    airportArrivalGuide: "공항 도착 가이드",
    aiSearchReady: "AI 검색 최적화 여행 가이드",
    editorialNote:
      "여행 규정, 보험 조건, 안전 상황, 교통 요금, 모바일 커버리지는 변동될 수 있습니다. 예약 전 중요한 정보는 공식 채널에서 확인하세요.",
  },
  ja: {
    shortAnswer: "要点",
    quickSnapshot: "旅行計画の概要",
    destinationSnapshot: "目的地の概要",
    relatedPlanningLinks: "関連する計画リンク",
    faq: "よくある質問",
    from: "出発地",
    to: "目的地",
    localCurrency: "現地通貨",
    originCurrency: "出発地の通貨",
    perPersonDay: "1人 / 1日",
    planWithRya: "Ryaで計画する",
    airportArrivalGuide: "空港到着ガイド",
    aiSearchReady: "AI検索向け旅行ガイド",
    editorialNote:
      "旅行規則、保険条件、安全状況、交通料金、通信環境は変わることがあります。予約前に重要事項を公式情報で確認してください。",
  },
  zh: {
    shortAnswer: "简短回答",
    quickSnapshot: "行程规划摘要",
    destinationSnapshot: "目的地概览",
    relatedPlanningLinks: "相关规划链接",
    faq: "常见问题",
    from: "出发地",
    to: "目的地",
    localCurrency: "当地货币",
    originCurrency: "出发地货币",
    perPersonDay: "每人 / 每日",
    planWithRya: "用 Rya 规划",
    airportArrivalGuide: "机场抵达指南",
    aiSearchReady: "AI 搜索优化旅行指南",
    editorialNote:
      "规划提示：旅行规定、保险条款、安全情况、交通价格和网络覆盖可能变化。预订前请通过官方渠道确认重要信息。",
  },
  nl: {
    shortAnswer: "Kort antwoord",
    quickSnapshot: "Planningssamenvatting",
    destinationSnapshot: "Bestemmingsoverzicht",
    relatedPlanningLinks: "Gerelateerde planningslinks",
    faq: "Veelgestelde vragen",
    from: "Vanaf",
    to: "Naar",
    localCurrency: "Lokale valuta",
    originCurrency: "Valuta vertrekpunt",
    perPersonDay: "per persoon / dag",
    planWithRya: "Plan met Rya",
    airportArrivalGuide: "Aankomstgerichte luchthavengids",
    aiSearchReady: "AI-zoekklare reisgids",
    editorialNote:
      "Planningsnotitie: regels, verzekeringsvoorwaarden, veiligheid, vervoersprijzen en mobiele dekking kunnen veranderen. Controleer cruciale details officieel vóór boeking.",
  },
};

export function seoCopy(locale: Locale): SeoCopy {
  return { ...EN, ...(COPIES[locale] ?? {}) };
}
