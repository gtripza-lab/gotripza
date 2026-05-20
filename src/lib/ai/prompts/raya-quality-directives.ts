import "server-only";

export type DetectedUserLanguage = {
  code:
    | "ar"
    | "en"
    | "fr"
    | "de"
    | "es"
    | "it"
    | "pt"
    | "ko"
    | "ja"
    | "zh"
    | "nl"
    | "tr"
    | "hi"
    | "id"
    | "ru"
    | "pl"
    | "th"
    | "vi"
    | "ms"
    | "sv"
    | "no"
    | "da";
  name: string;
  schemaLocale: "ar" | "en";
};

const LANGUAGE_NAMES: Record<DetectedUserLanguage["code"], string> = {
  ar: "Arabic",
  en: "English",
  fr: "French",
  de: "German",
  es: "Spanish",
  it: "Italian",
  pt: "Portuguese",
  ko: "Korean",
  ja: "Japanese",
  zh: "Chinese",
  nl: "Dutch",
  tr: "Turkish",
  hi: "Hindi",
  id: "Indonesian",
  ru: "Russian",
  pl: "Polish",
  th: "Thai",
  vi: "Vietnamese",
  ms: "Malay",
  sv: "Swedish",
  no: "Norwegian",
  da: "Danish",
};

const LATIN_HINTS: Array<[RegExp, DetectedUserLanguage["code"]]> = [
  [/\b(qué|cuál|barrios|seguridad|llego|evitar|taxis|altura|dame|práctico)\b/i, "es"],
  [/\b(je|avec|quartiers|pièges|éviter|organiser|transports|sécurité|arrive)\b/i, "fr"],
  [/\b(wir|reise|reisen|kinder|winter|ohne|bezahlen|beste|plan|bahnhof)\b/i, "de"],
  [/\b(cosa|quando|bambini|evitare|ristoranti|prenotare|quartieri|arrivo)\b/i, "it"],
  [/\b(tenho|vale|sair|aeroporto|roteiro|seguro|idosos|chuva|conexão)\b/i, "pt"],
  [/\b(waar|verblijf|kinderen|veilig|fietsen|vooraf|boeken|reis)\b/i, "nl"],
  [/\b(nasıl|nerede|hangi|güvenli|ulaşım|bütçe|kaçınmalı|plan)\b/i, "tr"],
  [/\b(jak|gdzie|bezpiecznie|transport|budżet|dzieci|zarezerwować|plan)\b/i, "pl"],
  [/\b(bagaimana|dengan|anak|aman|transportasi|anggaran|rencana|hindari)\b/i, "id"],
  [/\b(bagaimana|dengan|selamat|bajet|pengangkutan|rancang|elakkan)\b/i, "ms"],
  [/\b(hur|var|säker|budget|transport|barn|planera|undvika)\b/i, "sv"],
  [/\b(hvordan|hvor|trygt|budsjett|transport|barn|planlegge|unngå)\b/i, "no"],
  [/\b(hvordan|hvor|sikkert|budget|transport|børn|planlægge|undgå)\b/i, "da"],
  [/\b(làm sao|ở đâu|an toàn|di chuyển|ngân sách|tránh|kế hoạch)\b/i, "vi"],
];

export function detectUserLanguage(text: string): DetectedUserLanguage {
  if (/[\u0600-\u06FF]/.test(text)) return { code: "ar", name: LANGUAGE_NAMES.ar, schemaLocale: "ar" };
  if (/[\u3040-\u30FF]/.test(text)) return { code: "ja", name: LANGUAGE_NAMES.ja, schemaLocale: "en" };
  if (/[\u4E00-\u9FFF]/.test(text)) return { code: "zh", name: LANGUAGE_NAMES.zh, schemaLocale: "en" };
  if (/[\uAC00-\uD7AF]/.test(text)) return { code: "ko", name: LANGUAGE_NAMES.ko, schemaLocale: "en" };
  if (/[\u0900-\u097F]/.test(text)) return { code: "hi", name: LANGUAGE_NAMES.hi, schemaLocale: "en" };
  if (/[\u0400-\u04FF]/.test(text)) return { code: "ru", name: LANGUAGE_NAMES.ru, schemaLocale: "en" };
  if (/[\u0E00-\u0E7F]/.test(text)) return { code: "th", name: LANGUAGE_NAMES.th, schemaLocale: "en" };
  for (const [pattern, code] of LATIN_HINTS) {
    if (pattern.test(text)) return { code, name: LANGUAGE_NAMES[code], schemaLocale: "en" };
  }
  return { code: "en", name: LANGUAGE_NAMES.en, schemaLocale: "en" };
}

type Playbook = {
  aliases: string[];
  directive: string;
};

const PLAYBOOKS: Playbook[] = [
  {
    aliases: ["zurich", "switzerland", "zürich", "سويسرا", "زيورخ"],
    directive:
      "Zurich/Switzerland playbook: be very specific about saving money. Compare Swiss Travel Pass vs point-to-point tickets; for 3 days tell users not to buy a pass automatically. Use Zurich HB or Lucerne as practical bases. Alpine day should be chosen by clear weather, with Rigi/Pilatus/Lucerne as realistic options. Mention Coop/Migros picnic lunches, lake boats, and checking SBB before buying. Avoid vague 'Switzerland is expensive' advice.",
  },
  {
    aliases: ["reykjavik", "iceland", "ring road", "آيسلندا", "ريكيافيك"],
    directive:
      "Iceland/Reykjavik playbook: in March with 5 days, do NOT recommend full Ring Road. Recommend Reykjavik base plus Golden Circle, South Coast to Vik only if weather allows, Sky Lagoon/Blue Lagoon, and one buffer day. Mention road.is, vedur.is, wind alerts, gravel/wind insurance checks, and avoiding F-roads/winter night driving. Give a safe alternative route.",
  },
  {
    aliases: ["sarajevo", "bosnia", "mostar", "البوسنة", "سراييفو"],
    directive:
      "Sarajevo/Bosnia playbook: balance history respectfully with warmth. Do not make the trip only war museums. Recommend Bascarsija, one guided history block, Yellow Fortress/viewpoint, local food/crafts, and Mostar as overnight if possible. For teenagers, alternate heavy context with ordinary beauty and food breaks.",
  },
  {
    aliases: ["bogota", "bogotá", "colombia", "بوغوتا", "كولومبيا"],
    directive:
      "Bogota safety playbook: be concrete. Recommend Chapinero Alto, Zona G, Quinta Camacho, Parque 93/Chico for stays; Monserrate by cable car during daylight; use official taxi/apps; avoid showing phones on streets, empty streets at night, and La Candelaria late. Mention altitude pacing and museum clustering.",
  },
  {
    aliases: ["vancouver", "فانكوفر"],
    directive:
      "Vancouver rain playbook: name waterproof shoes, layers, SeaBus, Granville Island, Museum of Anthropology/indoor alternates, Capilano/Grouse only with visibility check, and flexible nature windows. Avoid generic 'enjoy rain' language.",
  },
  {
    aliases: ["nairobi", "kenya", "نيروبي", "كينيا"],
    directive:
      "Nairobi safety playbook: recommend Westlands, Gigiri, or airport hotel depending on safari pickup; pre-book airport transfer; avoid walking alone at night and informal taxis; keep one low-friction night before safari. Mention traffic buffers.",
  },
];

function matchingPlaybooks(query: string): string[] {
  const lower = query.toLowerCase();
  return PLAYBOOKS.filter((playbook) =>
    playbook.aliases.some((alias) => lower.includes(alias.toLowerCase())),
  ).map((playbook) => playbook.directive);
}

export function buildRyaQualityDirective(query: string): string {
  const language = detectUserLanguage(query);
  const cityDirectives = matchingPlaybooks(query);
  return `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nRYA QUALITY DIRECTIVE (trusted runtime rules)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n• Reply language: ${language.name}. The visible message MUST be written in ${language.name}, matching the user's language. Do not switch to English unless the user wrote in English.\n• JSON locale field: use "${language.schemaLocale}" (${language.name} can still be used in the message even when JSON locale is "en").\n• Start directly with the plan or recommendation. Avoid generic openers like "great destination", "fantastic choice", "sounds wonderful", or broad praise.\n• Every advice answer must include concrete decisions: what to do, what to avoid, when to move, where to stay/base, and the backup option.\n• Prioritize safety, transport, and budget. Name official transport, ride-hailing/taxi caution, practical cost-control, and timing buffers when relevant.\n• If the question includes family, elderly travelers, late arrival, weather, scams, or budget pressure, structure the answer as numbered operational steps.\n${cityDirectives.length ? `\nCity-specific playbook:\n${cityDirectives.map((item) => `• ${item}`).join("\n")}` : ""}\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}
