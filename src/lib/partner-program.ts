import "server-only";

import { createHash, randomUUID } from "node:crypto";
import type { NextRequest, NextResponse } from "next/server";
import { createSupabaseService } from "@/lib/supabase/service";
import type { CurrentUser } from "@/lib/auth/session";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable = any;

export const PARTNER_COOKIE = "rya_partner_ref";
export const PARTNER_VISITOR_COOKIE = "rya_partner_vid";
export const PARTNER_COOKIE_MAX_AGE = 60 * 60 * 24 * 60;

export const PARTNER_PRODUCTS = {
  rya_companion: {
    key: "rya_companion",
    name: "Rya Companion",
    priceUsd: 19.99,
    commissionRate: 0.25,
  },
  plan_my_trip: {
    key: "plan_my_trip",
    name: "Plan My Trip",
    priceUsd: 9.99,
    commissionRate: 0.4,
  },
} as const;

export type PartnerProductKey = keyof typeof PARTNER_PRODUCTS;

export type ReferralAttribution = {
  partnerId: string;
  referralCodeId: string | null;
  code: string;
  slug: string;
  clickId: string | null;
  visitorId: string;
  createdAt: string;
};

export type PartnerDashboardData = {
  partner: {
    id: string;
    full_name: string;
    email: string;
    country: string;
    main_platform: string;
    audience_size: number;
    status: string;
    referral_slug: string | null;
    referral_code: string | null;
    commission_rate_companion: number;
    commission_rate_plan: number;
    created_at: string;
    approved_at: string | null;
  };
  metrics: {
    clicks: number;
    signups: number;
    conversions: number;
    revenueUsd: number;
    pendingUsd: number;
    approvedUsd: number;
    paidUsd: number;
    conversionRate: number;
  };
  referralUrl: string;
  referralCode: string;
  clicksByDay: { date: string; count: number }[];
  topSources: { source: string; count: number }[];
  conversions: Array<{
    id: string;
    product_name: string;
    amount_usd: number;
    commission_usd: number;
    status: string;
    created_at: string;
  }>;
  payouts: Array<{
    id: string;
    amount_usd: number;
    status: string;
    requested_at: string;
    paid_at: string | null;
  }>;
  assets: Array<{
    id: string;
    title: string;
    asset_type: string;
    locale: string;
    url: string | null;
    content: string | null;
  }>;
  notifications: Array<{
    id: string;
    title: string;
    body: string;
    kind: string;
    read_at: string | null;
    created_at: string;
  }>;
};

function appBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://gotripza.com").replace(/\/$/, "");
}

export function normalizeReferralSlug(input: string) {
  const value = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 34);
  return value || `partner-${randomUUID().slice(0, 8)}`;
}

export function makeReferralCode(input: string) {
  const base = input
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "")
    .slice(0, 10);
  return `${base || "RYA"}${randomUUID().slice(0, 4).toUpperCase()}`;
}

export function encodeAttribution(value: ReferralAttribution) {
  return Buffer.from(JSON.stringify(value), "utf8").toString("base64url");
}

export function decodeAttribution(value?: string | null): ReferralAttribution | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(Buffer.from(value, "base64url").toString("utf8"));
    if (!parsed?.partnerId || !parsed?.code || !parsed?.visitorId) return null;
    return parsed as ReferralAttribution;
  } catch {
    return null;
  }
}

export function getReferralAttribution(req: NextRequest) {
  return decodeAttribution(req.cookies.get(PARTNER_COOKIE)?.value);
}

export function getOrCreateVisitorId(req: NextRequest) {
  return req.cookies.get(PARTNER_VISITOR_COOKIE)?.value || randomUUID();
}

export function setReferralCookies(res: NextResponse, attribution: ReferralAttribution) {
  res.cookies.set(PARTNER_COOKIE, encodeAttribution(attribution), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PARTNER_COOKIE_MAX_AGE,
  });
  res.cookies.set(PARTNER_VISITOR_COOKIE, attribution.visitorId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: PARTNER_COOKIE_MAX_AGE,
  });
}

export function getClientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export function hashIp(ip: string) {
  const salt = process.env.PARTNER_IP_HASH_SALT || process.env.ADMIN_KEY || "gotripza-partner-salt";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 40);
}

export async function ensureUniquePartnerCodes(fullName: string, email: string) {
  const db = createSupabaseService() as AnyTable;
  const seed = email.split("@")[0] || fullName;
  const baseSlug = normalizeReferralSlug(seed);
  const baseCode = makeReferralCode(fullName || seed);

  for (let i = 0; i < 8; i += 1) {
    const suffix = i === 0 ? "" : `-${i + 1}`;
    const codeSuffix = i === 0 ? "" : String(i + 1);
    const slug = `${baseSlug}${suffix}`;
    const code = `${baseCode}${codeSuffix}`.slice(0, 18);
    const { data } = await db
      .from("partners")
      .select("id")
      .or(`referral_slug.eq.${slug},referral_code.eq.${code}`)
      .maybeSingle();
    if (!data) return { slug, code };
  }

  const fallback = randomUUID().slice(0, 8);
  return { slug: `${baseSlug}-${fallback}`, code: `RYA${fallback.toUpperCase()}` };
}

export async function findActiveReferral(codeOrSlug: string) {
  const db = createSupabaseService() as AnyTable;
  const code = codeOrSlug.trim();
  if (!code) return null;
  const upper = code.toUpperCase();
  const slug = normalizeReferralSlug(code);
  const { data, error } = await db
    .from("referral_codes")
    .select("id, code, slug, active, partner_id, partners(id, status, full_name, email)")
    .or(`code.eq.${upper},slug.eq.${slug}`)
    .eq("active", true)
    .maybeSingle();
  if (error) {
    console.warn("[partners] referral lookup failed:", error.message);
    return null;
  }
  if (!data?.partner_id) return null;
  return data;
}

export async function recordReferralVisit(
  req: NextRequest,
  codeOrSlug: string,
  landingPath: string,
  metadata: Record<string, unknown> = {},
) {
  const referral = await findActiveReferral(codeOrSlug);
  if (!referral) return null;

  const db = createSupabaseService() as AnyTable;
  const visitorId = getOrCreateVisitorId(req);
  const ipHash = hashIp(getClientIp(req));
  const referrer = req.headers.get("referer");
  const userAgent = req.headers.get("user-agent");
  const source = typeof metadata.source === "string" ? metadata.source : req.nextUrl.searchParams.get("utm_source");
  const campaign = typeof metadata.campaign === "string" ? metadata.campaign : req.nextUrl.searchParams.get("utm_campaign");

  const { data: click, error: clickError } = await db
    .from("partner_clicks")
    .insert({
      partner_id: referral.partner_id,
      referral_code_id: referral.id,
      visitor_id: visitorId,
      session_id: req.cookies.get("gtz_sid")?.value ?? null,
      ip_hash: ipHash,
      user_agent: userAgent,
      referrer,
      landing_path: landingPath,
      source,
      campaign,
      metadata,
    })
    .select("id")
    .single();

  if (clickError) {
    console.warn("[partners] click insert failed:", clickError.message);
  }

  await db.from("referral_visits").insert({
    partner_id: referral.partner_id,
    click_id: click?.id ?? null,
    visitor_id: visitorId,
    first_path: landingPath,
    last_path: landingPath,
    metadata,
  });

  return {
    partnerId: referral.partner_id as string,
    referralCodeId: referral.id as string,
    code: referral.code as string,
    slug: referral.slug as string,
    clickId: (click?.id as string | undefined) ?? null,
    visitorId,
    createdAt: new Date().toISOString(),
  } satisfies ReferralAttribution;
}

export async function recordPartnerSignup(
  req: NextRequest,
  user: CurrentUser,
  source = "auth",
) {
  const attribution = getReferralAttribution(req);
  if (!attribution) return;
  const db = createSupabaseService() as AnyTable;

  try {
    const { data: partner } = await db
      .from("partners")
      .select("id, email")
      .eq("id", attribution.partnerId)
      .maybeSingle();

    if (partner?.email && user.email && partner.email.toLowerCase() === user.email.toLowerCase()) {
      await db.from("partner_fraud_flags").insert({
        partner_id: attribution.partnerId,
        reason: "self_referral_signup",
        severity: "medium",
        metadata: { email: user.email, source },
      });
    }

    const { error } = await db.from("partner_signups").insert({
        partner_id: attribution.partnerId,
        click_id: attribution.clickId,
        user_id: user.id,
        email: user.email,
        source,
        metadata: {
          referral_code: attribution.code,
          visitor_id: attribution.visitorId,
        },
      });
    if (error && error.code !== "23505") {
      console.warn("[partners] signup insert failed:", error.message);
    }
  } catch (err) {
    console.warn("[partners] signup attribution failed:", (err as Error).message);
  }
}

export async function recordPartnerConversion({
  partnerId,
  clickId,
  userId,
  email,
  productType,
  orderId,
  metadata = {},
}: {
  partnerId: string;
  clickId?: string | null;
  userId?: string | null;
  email?: string | null;
  productType: PartnerProductKey;
  orderId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  const db = createSupabaseService() as AnyTable;
  const product = PARTNER_PRODUCTS[productType];
  const { data: partner } = await db
    .from("partners")
    .select("id, commission_rate_companion, commission_rate_plan")
    .eq("id", partnerId)
    .maybeSingle();
  if (!partner) return null;

  const commissionRate =
    productType === "rya_companion"
      ? Number(partner.commission_rate_companion ?? product.commissionRate)
      : Number(partner.commission_rate_plan ?? product.commissionRate);
  const commissionUsd = Number((product.priceUsd * commissionRate).toFixed(2));

  const { data: conversion, error } = await db
    .from("partner_conversions")
    .insert({
      partner_id: partnerId,
      click_id: clickId ?? null,
      user_id: userId ?? null,
      email: email ?? null,
      product_type: productType,
      product_name: product.name,
      amount_usd: product.priceUsd,
      commission_rate: commissionRate,
      commission_usd: commissionUsd,
      order_id: orderId ?? null,
      status: "pending",
      metadata,
    })
    .select("id, commission_usd")
    .single();

  if (error) {
    if (error.code !== "23505") {
      console.warn("[partners] conversion insert failed:", error.message);
    }
    return null;
  }

  await db.from("commissions").insert({
    partner_id: partnerId,
    conversion_id: conversion.id,
    product_type: productType,
    amount_usd: commissionUsd,
    status: "pending",
  });

  return conversion;
}

export function getReferralMetadataForStripe(req: NextRequest): Record<string, string> {
  const attribution = getReferralAttribution(req);
  if (!attribution) return {};
  return {
    partner_id: attribution.partnerId,
    partner_click_id: attribution.clickId ?? "",
    partner_referral_code: attribution.code,
    partner_visitor_id: attribution.visitorId,
  };
}

export async function getPartnerDashboard(user: CurrentUser): Promise<PartnerDashboardData | null> {
  const db = createSupabaseService() as AnyTable;
  let { data: partner } = await db
    .from("partners")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!partner && user.email) {
    const res = await db.from("partners").select("*").ilike("email", user.email).maybeSingle();
    partner = res.data;
  }

  if (!partner) return null;

  const [
    clicksRes,
    signupsRes,
    conversionsRes,
    commissionsRes,
    payoutsRes,
    assetsRes,
    notificationsRes,
  ] = await Promise.all([
    db.from("partner_clicks").select("created_at, source").eq("partner_id", partner.id).limit(1000),
    db.from("partner_signups").select("id").eq("partner_id", partner.id).limit(1000),
    db
      .from("partner_conversions")
      .select("id, product_name, amount_usd, commission_usd, status, created_at")
      .eq("partner_id", partner.id)
      .order("created_at", { ascending: false })
      .limit(50),
    db.from("commissions").select("amount_usd, status").eq("partner_id", partner.id).limit(1000),
    db
      .from("payouts")
      .select("id, amount_usd, status, requested_at, paid_at")
      .eq("partner_id", partner.id)
      .order("created_at", { ascending: false })
      .limit(25),
    db.from("partner_assets").select("id, title, asset_type, locale, url, content").eq("active", true).limit(30),
    db
      .from("partner_notifications")
      .select("id, title, body, kind, read_at, created_at")
      .eq("partner_id", partner.id)
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const clicks = clicksRes.data ?? [];
  const conversions = conversionsRes.data ?? [];
  const commissions = commissionsRes.data ?? [];
  const signups = signupsRes.data ?? [];
  const clicksByDayMap = new Map<string, number>();
  const topSourcesMap = new Map<string, number>();

  for (const click of clicks) {
    const date = String(click.created_at).slice(0, 10);
    clicksByDayMap.set(date, (clicksByDayMap.get(date) ?? 0) + 1);
    const source = click.source || "direct";
    topSourcesMap.set(source, (topSourcesMap.get(source) ?? 0) + 1);
  }

  const revenueUsd = conversions.reduce((sum: number, item: { amount_usd: number }) => sum + Number(item.amount_usd ?? 0), 0);
  const sumStatus = (status: string) =>
    commissions
      .filter((item: { status: string }) => item.status === status)
      .reduce((sum: number, item: { amount_usd: number }) => sum + Number(item.amount_usd ?? 0), 0);

  const referralCode = partner.referral_code || "PENDING";
  const referralPath = partner.referral_slug || referralCode.toLowerCase();

  return {
    partner,
    metrics: {
      clicks: clicks.length,
      signups: signups.length,
      conversions: conversions.length,
      revenueUsd,
      pendingUsd: sumStatus("pending"),
      approvedUsd: sumStatus("approved"),
      paidUsd: sumStatus("paid"),
      conversionRate: clicks.length ? conversions.length / clicks.length : 0,
    },
    referralUrl: `${appBaseUrl()}/r/${referralPath}`,
    referralCode,
    clicksByDay: [...clicksByDayMap.entries()].map(([date, count]) => ({ date, count })).slice(-14),
    topSources: [...topSourcesMap.entries()]
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6),
    conversions,
    payouts: payoutsRes.data ?? [],
    assets: assetsRes.data ?? [],
    notifications: notificationsRes.data ?? [],
  };
}

export async function getAdminPartnerOverview() {
  const db = createSupabaseService() as AnyTable;
  const [partnersRes, clicksRes, signupsRes, conversionsRes, commissionsRes, flagsRes] = await Promise.all([
    db.from("partners").select("*").order("created_at", { ascending: false }).limit(500),
    db.from("partner_clicks").select("partner_id, source, created_at").limit(5000),
    db.from("partner_signups").select("partner_id, created_at").limit(5000),
    db.from("partner_conversions").select("partner_id, amount_usd, commission_usd, status, created_at").limit(5000),
    db.from("commissions").select("partner_id, amount_usd, status").limit(5000),
    db.from("partner_fraud_flags").select("id, partner_id, reason, severity, resolved_at, created_at").is("resolved_at", null).limit(100),
  ]);

  type PartnerAdminRow = Record<string, unknown> & {
    id: string;
    status: string;
    main_platform: string;
    country: string;
  };
  type PartnerMetricRow = { partner_id: string };
  type PartnerMoneyRow = { partner_id: string; amount_usd?: number | string | null };
  const partners = (partnersRes.data ?? []) as PartnerAdminRow[];
  const clicks = (clicksRes.data ?? []) as Array<PartnerMetricRow & { source?: string | null }>;
  const signups = (signupsRes.data ?? []) as PartnerMetricRow[];
  const conversions = (conversionsRes.data ?? []) as PartnerMoneyRow[];
  const commissions = (commissionsRes.data ?? []) as PartnerMoneyRow[];
  const flags = flagsRes.data ?? [];

  const byPartner = new Map<string, { clicks: number; signups: number; conversions: number; revenue: number; commissions: number }>();
  for (const partner of partners) {
    byPartner.set(partner.id, { clicks: 0, signups: 0, conversions: 0, revenue: 0, commissions: 0 });
  }
  for (const row of clicks) {
    const metric = byPartner.get(row.partner_id);
    if (metric) metric.clicks += 1;
  }
  for (const row of signups) {
    const metric = byPartner.get(row.partner_id);
    if (metric) metric.signups += 1;
  }
  for (const row of conversions) {
    const metric = byPartner.get(row.partner_id);
    if (metric) {
      metric.conversions += 1;
      metric.revenue += Number(row.amount_usd ?? 0);
    }
  }
  for (const row of commissions) {
    const metric = byPartner.get(row.partner_id);
    if (metric) metric.commissions += Number(row.amount_usd ?? 0);
  }

  const rows: Array<PartnerAdminRow & {
    metrics: { clicks: number; signups: number; conversions: number; revenue: number; commissions: number };
    conversionRate: number;
  }> = partners.map((partner) => {
    const metric = byPartner.get(String(partner.id)) ?? { clicks: 0, signups: 0, conversions: 0, revenue: 0, commissions: 0 };
    return {
      ...partner,
      metrics: metric,
      conversionRate: metric.clicks ? metric.conversions / metric.clicks : 0,
    };
  });

  const sourceCounts = new Map<string, number>();
  for (const click of clicks) sourceCounts.set(click.source || "direct", (sourceCounts.get(click.source || "direct") ?? 0) + 1);

  return {
    stats: {
      totalPartners: partners.length,
      activePartners: partners.filter((p: { status: string }) => p.status === "approved").length,
      pendingPartners: partners.filter((p: { status: string }) => p.status === "pending").length,
      totalClicks: clicks.length,
      totalSignups: signups.length,
      totalConversions: conversions.length,
      totalRevenueUsd: conversions.reduce((sum, row) => sum + Number(row.amount_usd ?? 0), 0),
      totalCommissionsUsd: commissions.reduce((sum, row) => sum + Number(row.amount_usd ?? 0), 0),
      fraudFlags: flags.length,
      bestPlatform: topValue(partners.map((p: { main_platform: string }) => p.main_platform)),
      bestCountry: topValue(partners.map((p: { country: string }) => p.country)),
    },
    partners: rows,
    leaderboard: [...rows].sort((a, b) => b.metrics.revenue - a.metrics.revenue).slice(0, 10),
    topSources: [...sourceCounts.entries()].map(([source, count]) => ({ source, count })).sort((a, b) => b.count - a.count).slice(0, 8),
    fraudFlags: flags,
  };
}

function topValue(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values.filter(Boolean)) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "—";
}
