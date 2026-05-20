#!/usr/bin/env node
const BASE_URL = process.env.RYA_EVAL_BASE_URL ?? "http://localhost:3000";
const MIN_AVG = Number(process.env.RYA_EVAL_MIN_AVG ?? 70);
const REQUIRE_LIVE_AI = process.env.RYA_EVAL_REQUIRE_LIVE_AI === "true";
const DELAY_MS = Number(process.env.RYA_EVAL_DELAY_MS ?? 12_500);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const cases = [
  ["Tokyo", "I land at Haneda at 23:40 with two kids, one checked bag missing, and my hotel is in Asakusa. What exact order should I handle baggage, transport, food, and sleep so I do not make an expensive mistake?"],
  ["Seoul", "For a first-time Muslim family staying near Myeongdong in Seoul during winter, how should we balance halal food, subway transfers, prayer breaks, and kid fatigue across one day?"],
  ["Singapore", "I have a 9-hour Changi layover with elderly parents, carry-on bags, and possible rain. Should we leave the airport or stay inside, and what is the safest micro-itinerary?"],
  ["Bali", "In Bali, I want Ubud culture and Uluwatu sunset in 3 days without sitting in traffic all day. How would you split hotels and activities?"],
  ["Bangkok", "I am worried about taxi scams and heat exhaustion in Bangkok with my mother. Give me a practical arrival plan from BKK airport to riverside and what to avoid."],
  ["Istanbul", "My family will stay near Taksim and arrive after midnight at Istanbul Airport. How safe is the area, what transport should we use, and what scams should we avoid?"],
  ["Dubai", "I have only 48 hours in Dubai in July with a teenager and a limited budget. What should we skip, what should we book indoors, and when should we move around?"],
  ["Maldives", "For the Maldives, how do I choose between a local island and resort island if I care about privacy, halal food, transfers, and hidden costs?"],
  ["Paris", "I am taking my parents to Paris and they cannot walk much. Build a low-walking day that still feels premium and avoids pickpocket risk."],
  ["Rome", "Rome in August with kids: what should I pre-book, what time should we rest, and how do we avoid tourist-trap restaurants near major sights?"],
  ["Barcelona", "Barcelona for a solo female traveler: which neighborhoods feel practical, what late-night rules should I follow, and how do I avoid common street scams?"],
  ["London", "I land at Heathrow during rail disruption risk. What backup transport plan should I have to reach South Kensington without overspending?"],
  ["New York", "A first-time visitor to New York wants Times Square, museums, and Brooklyn but hates chaos. Where should they stay and how should they sequence days?"],
  ["Los Angeles", "I have 4 days in Los Angeles without a car for half the trip. Which areas are realistic, what should I avoid, and when is rideshare worth it?"],
  ["Toronto", "Toronto in winter with a stroller: how do I plan around indoor paths, transit, Niagara expectations, and realistic daily pacing?"],
  ["Vancouver", "Vancouver with rain forecast every day: how do I salvage a nature-focused trip and what gear or transport decisions matter most?"],
  ["Sydney", "Sydney with only 3 days and jet lag from Europe: how should I time beaches, ferries, and Blue Mountains without burning out?"],
  ["Zurich", "Switzerland is expensive. From Zurich, how can a couple get one alpine day, one city day, and one lake day without wasting money on passes?"],
  ["Oslo", "Norway in winter: should I base in Oslo or fly north for northern lights if I only have 5 nights and hate complicated transfers?"],
  ["Reykjavik", "Iceland ring road is tempting, but I have 5 days in March. What route is realistic, what is unsafe, and what insurance matters for car rental?"],
  ["Hanoi", "Vietnam first trip: Hanoi, Ha Long, and Hoi An in 8 days. What route avoids airport fatigue and where should we slow down?"],
  ["Zanzibar", "Zanzibar honeymoon: how do we choose between Stone Town, Nungwi, and Paje if we want romance, safe swimming, and cultural depth?"],
  ["Tirana", "Albania road trip in shoulder season: what route gives beaches and mountains without unsafe driving or overpromising infrastructure?"],
  ["Tbilisi", "Georgia in winter: Tbilisi plus Kazbegi with possible road closures. How should we plan backup days and transport?"],
  ["Sarajevo", "Bosnia for a history-focused family: how do we visit Sarajevo and Mostar respectfully without making the trip too heavy for teenagers?"],
  ["Amsterdam", "Amsterdam with kids and bikes everywhere: where should we stay, how do we move safely, and what should we book before arrival?"],
  ["Lisbon", "Lisbon hills with elderly parents: how should we plan neighborhoods, trams, taxis, and Sintra without exhausting them?"],
  ["Marrakech", "Marrakech first time: how do I handle medina navigation, bargaining, riad location, and avoiding fake guides while still enjoying it?"],
  ["Cairo", "Cairo with one full day for pyramids and museum: how do I avoid heat, aggressive sellers, and traffic mistakes?"],
  ["Doha", "Doha stopover for 18 hours with luggage and modest dress concerns. What is a clean, culturally respectful plan?"],
  ["Abu Dhabi", "Abu Dhabi family weekend: how do we combine Sheikh Zayed Mosque, Louvre, and Yas Island without rushing or dress-code mistakes?"],
  ["Mexico City", "Mexico City food and culture trip: how do I choose neighborhoods, avoid altitude fatigue, and manage safety after dark?"],
  ["Bogota", "Bogota for a cautious solo traveler: how do I plan Monserrate, museums, and transport while minimizing robbery risk?"],
  ["Lima", "Lima plus Cusco: how many nights should I give Lima, how do I handle altitude, and when should I not rush to Machu Picchu?"],
  ["Buenos Aires", "Buenos Aires with a weak currency situation: how should I think about cash, neighborhoods, taxis, and restaurant timing?"],
  ["Cape Town", "Cape Town safety is confusing. How can a couple enjoy Table Mountain, wine country, and beaches while making smart transport choices?"],
  ["Nairobi", "Nairobi before safari: where should I stay for one night, what should I not do alone, and how do I avoid airport-transfer stress?"],
  ["Milan", "Milan to Lake Como day trip in peak season: what should be booked, what route is less chaotic, and when is staying overnight better?"],
  ["Athens", "Athens in summer before Greek islands: how many nights are enough, what times should we visit ruins, and where should we not stay?"],
  ["Prague", "Prague first visit: how do I enjoy old town without tourist traps, choose a hotel area, and avoid exchange-rate scams?"],
  ["Vienna", "Vienna with a classical music interest but modest budget: how do I choose concerts, cafes, transport passes, and day trips?"],
  ["Munich", "Munich during Oktoberfest but not partying: where should a family stay, what should they avoid, and how do prices change plans?"],
  ["Berlin", "Berlin with teenagers interested in history and street culture: how do we make the trip meaningful without making it bleak?"],
  ["Copenhagen", "Copenhagen is expensive and bike-heavy. How should a first-timer plan food, transport, and design sights on a mid-range budget?"],
  ["Stockholm", "Stockholm in winter: how do I make a short trip cozy instead of grey, and what island/transport choices matter?"],
  ["Kyoto", "Kyoto overtourism worries me. How do I plan temples, Gion, and Arashiyama respectfully while avoiding crowds?"],
  ["Osaka", "Osaka with food allergies: how do I navigate street food, translation cards, and neighborhoods without missing the food culture?"],
  ["Hong Kong", "Hong Kong 2-day layover with humidity and steep streets: which area should I base in and how do I balance skyline, food, and rest?"],
  ["Kuala Lumpur", "Kuala Lumpur with kids and thunderstorms: how do I plan Batu Caves, malls, food, and Grab rides sensibly?"],
  ["Muscat", "Muscat road trip for a couple: how do we combine wadis, mosque etiquette, beaches, and mountain driving safely?"],
].map(([city, query], index) => ({ n: index + 1, city, query }));

const emptyContext = {
  destination: null,
  origin: null,
  departure_date: null,
  return_date: null,
  adults: 2,
  budget_usd: null,
  trip_type: null,
  cabin_class: null,
  traveler_type: null,
  hotel_preferences: [],
  service_interests: [],
  booking_stage: null,
  concerns: [],
};

function scoreResult(testCase, response, status) {
  const message = String(response.message ?? "");
  const lower = message.toLowerCase();
  const city = testCase.city.toLowerCase().split(" ")[0];
  const words = message.split(/\s+/).filter(Boolean).length;
  let score = 0;
  if (status === 200) score += 10;
  if (response.mock === false) score += 20;
  if (words >= 95) score += 20;
  else if (words >= 65) score += 16;
  else if (words >= 45) score += 10;
  if (lower.includes(city) || JSON.stringify(response.intent ?? {}).toLowerCase().includes(city)) score += 12;
  if (/(avoid|official|book|stay|transfer|taxi|metro|route|neighborhood|budget|timed|safety|scam|insurance|weather|rest|buffer|first|second|third)/i.test(message)) score += 18;
  if (/(1\.|2\.|3\.|first|second|third|sequence|order|step)/i.test(message)) score += 10;
  if (response.confidence) score += 8;
  if (response.destination_intel) score += 8;
  if (/good question|tell me the destination|give me the destination|where are you thinking/i.test(message)) score -= 25;
  if (response.notice && REQUIRE_LIVE_AI) score -= 25;
  return Math.max(0, Math.min(100, score));
}

async function run() {
  const results = [];
  for (const testCase of cases) {
    const started = Date.now();
    let parsed = {};
    let status = 0;
    let error = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(`${BASE_URL}/api/parse`, {
          method: "POST",
          headers: {
          "content-type": "application/json",
          origin: BASE_URL,
          referer: `${BASE_URL}/en/search`,
          "x-rya-quality-eval": "1",
          "x-forwarded-for": `10.77.0.${testCase.n}`,
          },
          body: JSON.stringify({ query: testCase.query, history: [], context: emptyContext }),
          signal: AbortSignal.timeout(25_000),
        });
        status = res.status;
        parsed = await res.json().catch(() => ({}));
        if (status !== 429) break;
        await sleep(15_000 * attempt);
      } catch (err) {
        error = err instanceof Error ? err.message : String(err);
        break;
      }
    }
    const score = scoreResult(testCase, parsed, status);
    results.push({
      ...testCase,
      status,
      ms: Date.now() - started,
      score,
      mode: parsed.mode ?? null,
      mock: parsed.mock ?? null,
      notice: parsed.notice ?? null,
      message: parsed.message ?? "",
      error,
    });
    console.log(`${testCase.n}/50 ${testCase.city} status=${status} score=${score} mock=${parsed.mock ?? "-"} ${String(parsed.message ?? error ?? "").slice(0, 90).replace(/\s+/g, " ")}`);
    if (testCase.n < cases.length) await sleep(DELAY_MS);
  }

  const avg = Math.round(results.reduce((sum, row) => sum + row.score, 0) / results.length);
  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    count: results.length,
    ok: results.filter((row) => row.status === 200).length,
    liveAI: results.filter((row) => row.mock === false).length,
    fallback: results.filter((row) => row.mock === true || row.notice).length,
    avgScore: avg,
    weak: results.filter((row) => row.score < 70).length,
    repeatedOpenings: Object.entries(
      results.reduce((acc, row) => {
        const key = row.message.slice(0, 80);
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {}),
    ).filter(([, count]) => count > 2),
    results,
  };

  console.log(JSON.stringify({
    count: summary.count,
    ok: summary.ok,
    liveAI: summary.liveAI,
    fallback: summary.fallback,
    avgScore: summary.avgScore,
    weak: summary.weak,
  }, null, 2));

  if (avg < MIN_AVG) {
    console.error(`Rya quality gate failed: average ${avg} < ${MIN_AVG}`);
    process.exit(1);
  }
  if (REQUIRE_LIVE_AI && summary.liveAI < summary.count) {
    console.error(`Rya live AI gate failed: ${summary.liveAI}/${summary.count} used live AI`);
    process.exit(1);
  }
}

run();
