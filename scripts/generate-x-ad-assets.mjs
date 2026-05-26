import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outDir = resolve(root, "marketing/x-ads-assets/html");
mkdirSync(outDir, { recursive: true });

const logoPath = resolve(root, "public/brand/rya/rya-logo-horizontal-light.png");
const logoUrl = `file://${logoPath}`;

const assets = [
  {
    slug: "01-mobile-install",
    eyebrow: "ريا على جوالك",
    headline: "ثبّت ريا مستشارة السفر على جوالك",
    body: "تخطيط، توجيه، فعاليات، مطاعم، أفضل الأماكن، وتنبيهات تساعدك قبل الرحلة وأثناءها.",
    chip: "معك في كل لحظة",
    visual: "phone",
    accent: "#00D4B3",
  },
  {
    slug: "02-neighborhoods-places",
    eyebrow: "قبل الحجز",
    headline: "اسأل ريا: أين أسكن؟ وماذا أزور؟",
    body: "ريا مستشارة السفر تساعدك تفهم أفضل الأحياء، الأماكن المميزة، وما الذي تتجنبه في وجهتك.",
    chip: "اختيار أذكى للوجهة",
    visual: "map",
    accent: "#8B5CF6",
  },
  {
    slug: "03-first-day",
    eyebrow: "أول يوم في الرحلة",
    headline: "لا تضيع البداية في الحيرة",
    body: "اسأل ريا عن التنقل من المطار، أقرب الأماكن المناسبة، المطاعم، والخطوة الأولى بعد الوصول.",
    chip: "ابدأ بثقة",
    visual: "airport",
    accent: "#3B82F6",
  },
  {
    slug: "04-activities-food",
    eyebrow: "فعاليات ومطاعم",
    headline: "اكتشف الأماكن التي تستحق وقتك",
    body: "ريا مستشارة السفر تقترح جولات، أنشطة، مطاعم، وأماكن تناسب ميزانيتك ووقت رحلتك.",
    chip: "تجربة تناسبك",
    visual: "cards",
    accent: "#F59E0B",
  },
];

function visualMarkup(type, _accent) {
  if (type === "phone") {
    return `
      <div class="phone">
        <div class="phoneTop"></div>
        <div class="screenLogo">Rya</div>
        <div class="bubble user">أبغى أرتب رحلتي</div>
        <div class="bubble rya">أخبرني وجهتك، وسأرتب لك أهم الخيارات.</div>
        <div class="dock">
          <span>مطاعم</span><span>تنقل</span><span>أنشطة</span>
        </div>
      </div>`;
  }
  if (type === "map") {
    return `
      <div class="mapPanel">
        <div class="mapGrid"></div>
        <div class="pin pin1"></div>
        <div class="pin pin2"></div>
        <div class="pin pin3"></div>
        <div class="route"></div>
        <div class="miniCard card1">حي مناسب للعائلة</div>
        <div class="miniCard card2">قريب من الأماكن</div>
      </div>`;
  }
  if (type === "airport") {
    return `
      <div class="airportPanel">
        <div class="ticket">
          <span>ARRIVAL</span>
          <strong>First day plan</strong>
          <small>Airport • Hotel • Dinner</small>
        </div>
        <div class="wayLine"></div>
        <div class="airportIcon">✦</div>
        <div class="timeCard">من المطار إلى الفندق بهدوء</div>
      </div>`;
  }
  return `
    <div class="cardsPanel">
      <div class="serviceCard big">جولة مناسبة</div>
      <div class="serviceCard">مطعم قريب</div>
      <div class="serviceCard">مكان مميز</div>
      <div class="serviceCard">فعالية اليوم</div>
    </div>`;
}

function html(asset) {
  return `<!doctype html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=1200, initial-scale=1" />
  <title>${asset.slug}</title>
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; width: 1200px; height: 675px; overflow: hidden; }
    body {
      font-family: "SF Arabic", "Geeza Pro", "Arial", sans-serif;
      background:
        radial-gradient(circle at 20% 20%, color-mix(in srgb, ${asset.accent} 24%, transparent), transparent 28%),
        radial-gradient(circle at 84% 75%, rgba(59,130,246,.24), transparent 30%),
        linear-gradient(135deg, #060A13 0%, #0B1020 45%, #071225 100%);
      color: #fff;
      position: relative;
    }
    .noise {
      position: absolute; inset: 0;
      background-image: linear-gradient(rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
      background-size: 42px 42px;
      mask-image: radial-gradient(circle at center, black, transparent 78%);
      opacity: .45;
    }
    .wrap { position: relative; height: 100%; padding: 56px 64px; display: grid; grid-template-columns: 1fr 430px; gap: 44px; align-items: center; }
    .brand { position: absolute; top: 38px; right: 58px; display: flex; align-items: center; gap: 14px; }
    .brand img { height: 42px; width: auto; object-fit: contain; }
    .tag { margin-top: 52px; display: inline-flex; align-items: center; gap: 8px; border: 1px solid rgba(255,255,255,.12); background: rgba(255,255,255,.055); color: ${asset.accent}; padding: 9px 15px; border-radius: 999px; font-size: 22px; font-weight: 800; }
    .spark { width: 10px; height: 10px; border-radius: 999px; background: ${asset.accent}; box-shadow: 0 0 24px ${asset.accent}; }
    h1 { margin: 24px 0 18px; font-size: 64px; line-height: 1.12; letter-spacing: 0; max-width: 660px; font-weight: 900; }
    p { margin: 0; max-width: 610px; color: rgba(255,255,255,.72); font-size: 27px; line-height: 1.65; font-weight: 600; }
    .cta { margin-top: 34px; display: inline-flex; align-items: center; gap: 10px; border-radius: 18px; background: linear-gradient(135deg, #3B82F6, #8B5CF6); padding: 16px 24px; font-size: 24px; font-weight: 900; box-shadow: 0 18px 54px rgba(59,130,246,.28); }
    .cta small { color: rgba(255,255,255,.72); font-size: 18px; font-weight: 700; }
    .visual {
      position: relative; height: 490px; border: 1px solid rgba(255,255,255,.12);
      background: linear-gradient(160deg, rgba(255,255,255,.10), rgba(255,255,255,.035));
      border-radius: 36px; box-shadow: 0 28px 90px rgba(0,0,0,.45); overflow: hidden;
    }
    .visual::before { content: ""; position: absolute; inset: -1px; background: radial-gradient(circle at 22% 14%, color-mix(in srgb, ${asset.accent} 32%, transparent), transparent 32%); }
    .phone { position: absolute; left: 66px; top: 46px; width: 275px; height: 400px; border-radius: 42px; background: #07111f; border: 10px solid #121826; box-shadow: 0 26px 70px rgba(0,0,0,.55), inset 0 0 0 1px rgba(255,255,255,.12); padding: 54px 22px 20px; direction: rtl; }
    .phoneTop { position: absolute; top: 20px; left: 94px; width: 86px; height: 18px; border-radius: 999px; background: #000; }
    .screenLogo { position: absolute; top: 22px; right: 24px; font-size: 20px; font-weight: 900; color: ${asset.accent}; }
    .bubble { padding: 12px 14px; border-radius: 18px; font-size: 16px; line-height: 1.45; margin-bottom: 12px; font-weight: 800; }
    .bubble.user { background: linear-gradient(135deg, #3B82F6, #8B5CF6); color: white; border-bottom-right-radius: 6px; }
    .bubble.rya { background: rgba(255,255,255,.10); color: rgba(255,255,255,.82); border: 1px solid rgba(255,255,255,.10); border-bottom-left-radius: 6px; }
    .dock { position: absolute; bottom: 22px; left: 20px; right: 20px; display: flex; gap: 8px; }
    .dock span { flex: 1; text-align: center; border-radius: 999px; background: rgba(255,255,255,.08); padding: 9px 0; font-size: 12px; color: rgba(255,255,255,.78); font-weight: 800; }
    .mapPanel, .airportPanel, .cardsPanel { position: absolute; inset: 34px; border-radius: 28px; background: rgba(3,10,23,.68); border: 1px solid rgba(255,255,255,.10); overflow: hidden; }
    .mapGrid { position: absolute; inset: 0; background-image: linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px); background-size: 48px 48px; opacity: .35; transform: rotate(-8deg) scale(1.2); }
    .pin { position: absolute; width: 32px; height: 32px; border-radius: 50% 50% 50% 4px; background: ${asset.accent}; transform: rotate(-45deg); box-shadow: 0 0 34px ${asset.accent}; }
    .pin1 { top: 80px; right: 90px; } .pin2 { top: 220px; right: 210px; } .pin3 { top: 140px; right: 300px; }
    .route { position: absolute; top: 130px; right: 120px; width: 210px; height: 150px; border-top: 4px dashed rgba(255,255,255,.34); border-left: 4px dashed rgba(255,255,255,.26); border-radius: 80px; transform: rotate(-16deg); }
    .miniCard { position: absolute; right: 34px; padding: 14px 18px; border-radius: 18px; background: rgba(255,255,255,.11); color: white; font-size: 18px; font-weight: 900; border: 1px solid rgba(255,255,255,.10); }
    .card1 { bottom: 112px; } .card2 { bottom: 52px; right: 92px; }
    .ticket { position: absolute; right: 34px; top: 42px; left: 34px; padding: 26px; border-radius: 24px; background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.12); }
    .ticket span { display: block; color: ${asset.accent}; font-size: 18px; font-weight: 900; }
    .ticket strong { display: block; margin-top: 8px; font-size: 34px; }
    .ticket small { display: block; margin-top: 8px; color: rgba(255,255,255,.58); font-size: 18px; }
    .wayLine { position: absolute; left: 76px; bottom: 112px; width: 230px; height: 4px; background: linear-gradient(90deg, transparent, ${asset.accent}); border-radius: 999px; }
    .airportIcon { position: absolute; left: 68px; bottom: 128px; width: 88px; height: 88px; border-radius: 28px; display: grid; place-items: center; background: linear-gradient(135deg, #3B82F6, #8B5CF6); font-size: 45px; box-shadow: 0 22px 60px rgba(59,130,246,.35); }
    .timeCard { position: absolute; bottom: 44px; right: 42px; left: 42px; border-radius: 22px; padding: 18px 20px; background: rgba(0,212,179,.10); border: 1px solid rgba(0,212,179,.20); color: rgba(255,255,255,.86); font-size: 22px; font-weight: 900; text-align: center; }
    .cardsPanel { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; padding: 26px; }
    .serviceCard { border-radius: 24px; background: rgba(255,255,255,.10); border: 1px solid rgba(255,255,255,.12); display: flex; align-items: end; padding: 20px; color: white; font-size: 24px; font-weight: 900; box-shadow: inset 0 0 40px rgba(255,255,255,.025); }
    .serviceCard.big { grid-row: span 2; background: linear-gradient(160deg, color-mix(in srgb, ${asset.accent} 28%, rgba(255,255,255,.08)), rgba(255,255,255,.07)); }
    .orb { position: absolute; width: 220px; height: 220px; border-radius: 999px; background: ${asset.accent}; filter: blur(80px); opacity: .18; left: 30px; bottom: -80px; }
  </style>
</head>
<body>
  <div class="noise"></div>
  <div class="brand"><img src="${logoUrl}" alt="Rya by GoTripza" /></div>
  <main class="wrap">
    <section>
      <div class="tag"><span class="spark"></span>${asset.eyebrow}</div>
      <h1>${asset.headline}</h1>
      <p>${asset.body}</p>
      <div class="cta">${asset.chip}<small>Rya by GoTripza</small></div>
    </section>
    <section class="visual">
      <div class="orb"></div>
      ${visualMarkup(asset.visual, asset.accent)}
    </section>
  </main>
</body>
</html>`;
}

for (const asset of assets) {
  writeFileSync(resolve(outDir, `${asset.slug}.html`), html(asset), "utf8");
}

console.log(`Generated ${assets.length} HTML ad assets in ${outDir}`);
