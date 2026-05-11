import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getCurrentUser } from "@/lib/auth/session";
import { ensurePremium } from "@/lib/billing/entitlements";
import { HAS_OPENAI_KEY, MODEL_LITE } from "@/lib/ai/config";
import { rateLimit } from "@/lib/security/rate-limit";

export const runtime = "nodejs";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

let _client: OpenAI | null = null;
function client() {
  _client ??= new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return _client;
}

export async function POST(req: NextRequest) {
  if (!HAS_OPENAI_KEY) {
    return NextResponse.json({ error: "openai_not_configured" }, { status: 503 });
  }

  const rl = await rateLimit(req, "companion_image", { limit: 8, windowSec: 60 });
  if (!rl.allowed) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const user = await getCurrentUser();
  try {
    await ensurePremium(user?.id ?? null);
  } catch {
    return NextResponse.json({ error: "companion_required" }, { status: 402 });
  }

  const form = await req.formData();
  const image = form.get("image");
  const locale = form.get("locale") === "en" ? "en" : "ar";
  const userPrompt = String(form.get("prompt") ?? "").slice(0, 600);

  if (!(image instanceof File)) {
    return NextResponse.json({ error: "image_required" }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(image.type)) {
    return NextResponse.json({ error: "unsupported_image_type" }, { status: 400 });
  }
  if (image.size > MAX_IMAGE_BYTES) {
    return NextResponse.json({ error: "image_too_large" }, { status: 413 });
  }

  const bytes = Buffer.from(await image.arrayBuffer());
  const dataUrl = `data:${image.type};base64,${bytes.toString("base64")}`;
  const instruction =
    locale === "ar"
      ? "أنت ريا، رفيقة سفر هادئة. حلل الصورة للمسافر عملياً: ماذا يظهر؟ ماذا يعني؟ ماذا يفعل الآن؟ إن كانت قائمة طعام أو لافتة أو تذكرة أو مطار، اختصر واذكر أي تنبيه أمان أو تكلفة أو ترجمة مفيدة. لا تذكر أسماء نماذج أو تقنية."
      : "You are Rya, a calm travel companion. Analyze the image practically for a traveler: what it shows, what it means, and what to do next. If it is a menu, sign, ticket, or airport situation, be concise and include any useful safety, cost, or translation note. Do not mention model or AI technology.";

  try {
    const res = await client().chat.completions.create({
      model: MODEL_LITE,
      temperature: 0.35,
      max_tokens: 420,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: `${instruction}\n\nUser context: ${userPrompt || "none"}` },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
    });

    const message = res.choices[0]?.message?.content?.trim();
    return NextResponse.json({ message: message || (locale === "ar" ? "لم أتمكن من قراءة الصورة بوضوح." : "I could not read the image clearly.") });
  } catch (err) {
    console.error("[companion/image]", (err as Error).message);
    return NextResponse.json({ error: "image_analysis_failed" }, { status: 502 });
  }
}
