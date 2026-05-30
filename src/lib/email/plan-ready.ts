/**
 * plan-ready.ts
 * Sends a "your plan is ready" email to the customer after Gumroad purchase.
 * Uses Resend API via plain fetch — no extra package needed.
 *
 * Required env vars:
 *   RESEND_API_KEY   — from https://resend.com (free tier: 3,000 emails/month)
 *   RESEND_FROM      — e.g. "GoTripza <plans@gotripza.com>" (must be a verified domain)
 */

const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const RESEND_FROM    = process.env.RESEND_FROM ?? "GoTripza <plans@gotripza.com>";
const APP_URL        = process.env.NEXT_PUBLIC_APP_URL ?? "https://gotripza.com";

export async function sendPlanReadyEmail(email: string): Promise<void> {
  if (!RESEND_API_KEY) {
    // Not configured — log and skip (don't fail the webhook)
    console.warn("[email] RESEND_API_KEY not set — skipping plan-ready email");
    return;
  }

  const unlockUrl = `${APP_URL}/ar/plan?purchased=1&email=${encodeURIComponent(email)}`;

  const html = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>خطة رحلتك جاهزة</title>
</head>
<body style="margin:0;padding:0;background:#060A13;font-family:Arial,sans-serif;color:#fff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;margin:40px auto;background:#0D1526;border-radius:16px;overflow:hidden;border:1px solid rgba(255,255,255,0.08);">
    <!-- Header -->
    <tr>
      <td style="padding:32px 32px 24px;text-align:center;background:linear-gradient(135deg,#0D1526 0%,#0a1a30 100%);">
        <p style="margin:0;font-size:13px;color:#00D4B3;font-weight:700;letter-spacing:1px;">GoTripza</p>
        <h1 style="margin:12px 0 0;font-size:26px;font-weight:800;color:#fff;">
          خطة رحلتك جاهزة 🗺️
        </h1>
      </td>
    </tr>
    <!-- Body -->
    <tr>
      <td style="padding:24px 32px;">
        <p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:rgba(255,255,255,0.75);">
          شكراً لشرائك خطة رحلة من GoTripza.
          <br />
          خطتك الكاملة جاهزة — اضغط الزر أدناه لاستلامها فوراً.
        </p>

        <!-- CTA Button -->
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:8px 0 24px;text-align:center;">
              <a href="${unlockUrl}"
                 style="display:inline-block;background:linear-gradient(135deg,#00D4B3,#0066FF);color:#fff;font-size:15px;font-weight:700;text-decoration:none;padding:14px 36px;border-radius:12px;">
                استلم خطة رحلتي ←
              </a>
            </td>
          </tr>
        </table>

        <p style="margin:0 0 8px;font-size:12px;color:rgba(255,255,255,0.35);line-height:1.6;">
          أو انسخ هذا الرابط وافتحه في المتصفح:
          <br />
          <a href="${unlockUrl}" style="color:#00D4B3;word-break:break-all;">${unlockUrl}</a>
        </p>

        <hr style="border:none;border-top:1px solid rgba(255,255,255,0.08);margin:24px 0;" />

        <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.35);line-height:1.6;">
          البريد المرتبط بالشراء: <strong style="color:rgba(255,255,255,0.55);">${email}</strong>
          <br />
          الرابط مرتبط بهذا البريد تلقائياً — لا تحتاج إدخاله يدوياً.
        </p>
      </td>
    </tr>
    <!-- Footer -->
    <tr>
      <td style="padding:16px 32px;text-align:center;background:rgba(0,0,0,0.2);">
        <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.25);">
          GoTripza · رفيقة السفر الذكية
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [email],
        subject: "خطة رحلتك جاهزة — GoTripza 🗺️",
        html,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.warn("[email] Resend error:", err);
    } else {
      console.log("[email] ✅ Plan-ready email sent →", email);
    }
  } catch (err) {
    // Non-blocking — never fail the webhook over email
    console.warn("[email] Resend fetch error:", err);
  }
}
