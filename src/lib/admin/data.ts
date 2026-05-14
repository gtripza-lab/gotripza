import "server-only";
import { createSupabaseService } from "@/lib/supabase/service";
import type { TravelContext, TripIntent } from "@/lib/ai/schemas/intent";

// Supabase generated types do not include all production tables yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable = any;

// ── helpers ──────────────────────────────────────────────────────────────────
function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}
function hoursAgo(n: number): string {
  return new Date(Date.now() - n * 3_600_000).toISOString();
}

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────
export type DashboardStats = {
  conversations24h: number;
  conversationsWeek: number;
  aiTracesTotal: number;
  searchClicks24h: number;
  searchClicksWeek: number;
  estRevWeek: number;
  avgLatencyMs: number;
  errorRate: number; // 0-1
  recentTraces: AiTraceRow[];
  dailyConversations: { date: string; count: number }[];
  tripLifecycle: { stage: NonNullable<TravelContext["booking_stage"]>; count: number }[];
};

export async function getDashboardStats(): Promise<DashboardStats | null> {
  try {
    const db = createSupabaseService() as AnyTable;
    const h24 = hoursAgo(24);
    const d7  = daysAgo(7);

    const [conv24, convWeek, tracesRes, clicks24, clicksWeek, latRes, recentRes] =
      await Promise.all([
        db.from("conversations").select("id", { count: "exact", head: true }).gte("started_at", h24),
        db.from("conversations").select("id", { count: "exact", head: true }).gte("started_at", d7),
        db.from("ai_traces").select("id,status,duration_ms,created_at", { count: "exact" }).gte("created_at", d7),
        db.from("booking_clicks").select("id", { count: "exact", head: true }).gte("created_at", h24),
        db.from("booking_clicks").select("id,result_type,price,currency", { count: "exact" }).gte("created_at", d7),
        db.from("ai_traces").select("duration_ms").gte("created_at", h24).not("duration_ms", "is", null),
        db.from("ai_traces").select("id,mode,status,duration_ms,model,tokens_in,tokens_out,error_kind,created_at").order("created_at", { ascending: false }).limit(20),
      ]);

    const traces: { status: string; duration_ms: number | null }[] = tracesRes.data ?? [];
    const errors = traces.filter((t) => t.status === "error").length;
    const errorRate = traces.length ? errors / traces.length : 0;

    const latencies: number[] = (latRes.data ?? []).map((r: { duration_ms: number }) => r.duration_ms).filter(Boolean);
    const avgLatencyMs = latencies.length
      ? Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length)
      : 0;

    const clickRows: { result_type: string; price: number | null }[] = clicksWeek.data ?? [];
    const estRevWeek = clickRows.reduce((sum, r) => {
      if (!r.price) return sum;
      return sum + (r.result_type === "hotel" ? r.price * 0.05 : r.price * 0.03);
    }, 0);

    // Daily conversation counts (last 14 days)
    const convDailyRes = await db
      .from("conversations")
      .select("started_at")
      .gte("started_at", daysAgo(14));
    const convStageRes = await db
      .from("conversations")
      .select("context")
      .gte("started_at", d7);
    const dailyMap = new Map<string, number>();
    for (let i = 13; i >= 0; i--) {
      dailyMap.set(new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10), 0);
    }
    for (const r of (convDailyRes.data ?? []) as { started_at: string }[]) {
      const day = r.started_at?.slice(0, 10);
      if (day && dailyMap.has(day)) dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
    }
    const dailyConversations = Array.from(dailyMap.entries()).map(([date, count]) => ({ date, count }));
    const lifecycleMap = new Map<NonNullable<TravelContext["booking_stage"]>, number>();
    for (const row of (convStageRes.data ?? []) as { context?: Partial<TravelContext> | null }[]) {
      const stage = row.context?.booking_stage;
      if (!stage) continue;
      lifecycleMap.set(stage, (lifecycleMap.get(stage) ?? 0) + 1);
    }
    const tripLifecycle = Array.from(lifecycleMap.entries())
      .map(([stage, count]) => ({ stage, count }))
      .sort((a, b) => b.count - a.count);

    return {
      conversations24h: conv24.count ?? 0,
      conversationsWeek: convWeek.count ?? 0,
      aiTracesTotal: tracesRes.count ?? 0,
      searchClicks24h: clicks24.count ?? 0,
      searchClicksWeek: clicksWeek.count ?? 0,
      estRevWeek,
      avgLatencyMs,
      errorRate,
      recentTraces: (recentRes.data ?? []) as AiTraceRow[],
      dailyConversations,
      tripLifecycle,
    };
  } catch (err) {
    console.error("[admin/data] getDashboardStats:", err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// AI CONTROL CENTER
// ─────────────────────────────────────────────────────────────────────────────
export type AiTraceRow = {
  id: string;
  mode: string | null;
  status: string;
  duration_ms: number | null;
  model: string | null;
  tokens_in: number | null;
  tokens_out: number | null;
  error_kind: string | null;
  error_message?: string | null;
  created_at: string;
  conversation_id?: string | null;
  user_id?: string | null;
  session_id?: string | null;
};

export type AiStats = {
  totalTraces: number;
  byModel: { model: string; count: number; tokens_in: number; tokens_out: number; cost_usd: number }[];
  byMode: { mode: string; count: number }[];
  byStatus: { status: string; count: number }[];
  avgLatency: number;
  p95Latency: number;
  hourlyVolume: { hour: string; count: number }[];
  recentErrors: AiTraceRow[];
  feedback: RiaFeedbackStats;
};

export type RiaFeedbackStats = {
  total: number;
  helpful: number;
  unhelpful: number;
  helpfulRate: number;
  byMode: { mode: string; helpful: number; unhelpful: number; total: number }[];
  recent: {
    id: string | number;
    value: "up" | "down";
    mode: string;
    path: string | null;
    destination: string | null;
    bookingStage: string | null;
    messageExcerpt: string | null;
    hasSearchData: boolean;
    created_at: string;
  }[];
  topUnhelpful: { excerpt: string; count: number; destination: string | null; mode: string }[];
};

// GPT-4o pricing (per 1K tokens, as of 2025)
const MODEL_COST: Record<string, { in: number; out: number }> = {
  "gpt-4o":      { in: 0.005, out: 0.015 },
  "gpt-4o-mini": { in: 0.00015, out: 0.0006 },
};

function calcCost(model: string | null, tin: number, tout: number): number {
  const m = model ?? "gpt-4o";
  const prices = MODEL_COST[m] ?? MODEL_COST["gpt-4o"];
  return (tin / 1000) * prices.in + (tout / 1000) * prices.out;
}

export async function getAiStats(): Promise<AiStats | null> {
  try {
    const db = createSupabaseService() as AnyTable;
    const d7 = daysAgo(7);

    const [tracesRes, errorsRes, feedback] = await Promise.all([
      db.from("ai_traces")
        .select("id,mode,status,duration_ms,model,tokens_in,tokens_out,created_at")
        .gte("created_at", d7)
        .order("created_at", { ascending: false }),
      db.from("ai_traces")
        .select("id,mode,status,duration_ms,model,tokens_in,tokens_out,error_kind,error_message,created_at,conversation_id,user_id,session_id")
        .eq("status", "error")
        .gte("created_at", d7)
        .order("created_at", { ascending: false })
        .limit(50),
      getRiaFeedbackStats(),
    ]);

    const traces: AiTraceRow[] = (tracesRes.data ?? []) as AiTraceRow[];

    // By model
    const modelMap = new Map<string, { count: number; tokens_in: number; tokens_out: number }>();
    for (const t of traces) {
      const k = t.model ?? "unknown";
      const cur = modelMap.get(k) ?? { count: 0, tokens_in: 0, tokens_out: 0 };
      cur.count++;
      cur.tokens_in  += t.tokens_in  ?? 0;
      cur.tokens_out += t.tokens_out ?? 0;
      modelMap.set(k, cur);
    }
    const byModel = Array.from(modelMap.entries()).map(([model, v]) => ({
      model,
      ...v,
      cost_usd: calcCost(model, v.tokens_in, v.tokens_out),
    }));

    // By mode
    const modeMap = new Map<string, number>();
    for (const t of traces) {
      const k = t.mode ?? "unknown";
      modeMap.set(k, (modeMap.get(k) ?? 0) + 1);
    }
    const byMode = Array.from(modeMap.entries()).map(([mode, count]) => ({ mode, count }));

    // By status
    const statusMap = new Map<string, number>();
    for (const t of traces) {
      statusMap.set(t.status, (statusMap.get(t.status) ?? 0) + 1);
    }
    const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({ status, count }));

    // Latency stats
    const lats = traces.map((t) => t.duration_ms ?? 0).filter(Boolean).sort((a, b) => a - b);
    const avgLatency = lats.length ? Math.round(lats.reduce((a, b) => a + b, 0) / lats.length) : 0;
    const p95Latency = lats.length ? lats[Math.floor(lats.length * 0.95)] : 0;

    // Hourly volume (last 24h)
    const hourlyMap = new Map<string, number>();
    for (let i = 23; i >= 0; i--) {
      const h = new Date(Date.now() - i * 3_600_000);
      hourlyMap.set(`${h.getUTCHours().toString().padStart(2, "0")}:00`, 0);
    }
    const h24 = hoursAgo(24);
    for (const t of traces) {
      if (t.created_at >= h24) {
        const h = `${new Date(t.created_at).getUTCHours().toString().padStart(2, "0")}:00`;
        if (hourlyMap.has(h)) hourlyMap.set(h, (hourlyMap.get(h) ?? 0) + 1);
      }
    }
    const hourlyVolume = Array.from(hourlyMap.entries()).map(([hour, count]) => ({ hour, count }));

    return {
      totalTraces: traces.length,
      byModel,
      byMode,
      byStatus,
      avgLatency,
      p95Latency,
      hourlyVolume,
      recentErrors: (errorsRes.data ?? []) as AiTraceRow[],
      feedback,
    };
  } catch (err) {
    console.error("[admin/data] getAiStats:", err);
    return null;
  }
}

export async function getRiaFeedbackStats(): Promise<RiaFeedbackStats> {
  try {
    const db = createSupabaseService() as AnyTable;
    const d30 = daysAgo(30);
    const { data } = await db
      .from("events")
      .select("id,payload,path,created_at")
      .eq("name", "ria_response_feedback")
      .gte("created_at", d30)
      .order("created_at", { ascending: false })
      .limit(500);

    const rows = ((data ?? []) as {
      id: string | number;
      payload: {
        value?: string;
        mode?: string;
        destination?: string | null;
        bookingStage?: string | null;
        messageExcerpt?: string | null;
        hasSearchData?: boolean;
      } | null;
      path: string | null;
      created_at: string;
    }[]).filter((row) => row.payload?.value === "up" || row.payload?.value === "down");

    const helpful = rows.filter((row) => row.payload?.value === "up").length;
    const unhelpful = rows.length - helpful;
    const modeMap = new Map<string, { helpful: number; unhelpful: number; total: number }>();
    const weakMap = new Map<string, { excerpt: string; count: number; destination: string | null; mode: string }>();
    for (const row of rows) {
      const mode = row.payload?.mode || "unknown";
      const cur = modeMap.get(mode) ?? { helpful: 0, unhelpful: 0, total: 0 };
      if (row.payload?.value === "up") cur.helpful++;
      else {
        cur.unhelpful++;
        const excerpt = (row.payload?.messageExcerpt ?? "").trim();
        if (excerpt) {
          const key = excerpt.slice(0, 120).toLowerCase();
          const weak = weakMap.get(key) ?? {
            excerpt: excerpt.length > 180 ? `${excerpt.slice(0, 180)}…` : excerpt,
            count: 0,
            destination: row.payload?.destination || null,
            mode,
          };
          weak.count++;
          weakMap.set(key, weak);
        }
      }
      cur.total++;
      modeMap.set(mode, cur);
    }

    return {
      total: rows.length,
      helpful,
      unhelpful,
      helpfulRate: rows.length ? helpful / rows.length : 0,
      byMode: Array.from(modeMap.entries()).map(([mode, value]) => ({ mode, ...value })),
      topUnhelpful: Array.from(weakMap.values()).sort((a, b) => b.count - a.count).slice(0, 8),
      recent: rows.slice(0, 25).map((row) => ({
        id: row.id,
        value: row.payload?.value as "up" | "down",
        mode: row.payload?.mode || "unknown",
        path: row.path,
        destination: row.payload?.destination || null,
        bookingStage: row.payload?.bookingStage || null,
        messageExcerpt: row.payload?.messageExcerpt || null,
        hasSearchData: Boolean(row.payload?.hasSearchData),
        created_at: row.created_at,
      })),
    };
  } catch {
    return { total: 0, helpful: 0, unhelpful: 0, helpfulRate: 0, byMode: [], recent: [], topUnhelpful: [] };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSATIONS
// ─────────────────────────────────────────────────────────────────────────────
export type ConversationRow = {
  id: string;
  user_id: string | null;
  session_id: string | null;
  locale: string | null;
  message_count: number | null;
  started_at: string;
  last_at: string | null;
  summary?: string | null;
  context?: Partial<TravelContext> | null;
  last_intent?: Partial<TripIntent> | null;
};

export type ConversationDetail = ConversationRow & {
  messages: MessageRow[];
};

export type MessageRow = {
  id: string;
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  created_at: string;
  mode?: string | null;
  intent?: Partial<TripIntent> | null;
  tokens_in?: number | null;
  tokens_out?: number | null;
  model?: string | null;
  latency_ms?: number | null;
  provider?: string | null;
};

export async function getConversations(opts?: {
  page?: number;
  userId?: string;
  search?: string;
}): Promise<{ rows: ConversationRow[]; total: number }> {
  try {
    const db = createSupabaseService() as AnyTable;
    const page = opts?.page ?? 0;
    const limit = 50;
    const from = page * limit;

    let q = db
      .from("conversations")
      .select("id,user_id,session_id,locale,message_count,started_at,last_at,summary,context,last_intent", { count: "exact" })
      .order("last_at", { ascending: false })
      .range(from, from + limit - 1);

    if (opts?.userId) q = q.eq("user_id", opts.userId);

    const { data, count } = await q;
    return { rows: (data ?? []) as ConversationRow[], total: count ?? 0 };
  } catch {
    return { rows: [], total: 0 };
  }
}

export async function getConversationDetail(id: string): Promise<ConversationDetail | null> {
  try {
    const db = createSupabaseService() as AnyTable;
    type SingleResult = { data: ConversationRow | null; error: unknown };
    type ListResult   = { data: MessageRow[] | null; error: unknown };
    const [convRes, msgsRes] = await Promise.all([
      db.from("conversations").select("id,user_id,session_id,locale,message_count,started_at,last_at,summary,context,last_intent").eq("id", id).single() as unknown as Promise<SingleResult>,
      db.from("messages").select("id,role,content,created_at,mode,intent,tokens_in,tokens_out,model,latency_ms,provider").eq("conversation_id", id).order("created_at") as unknown as Promise<ListResult>,
    ]);
    if (!convRes.data) return null;
    return { ...convRes.data, messages: msgsRes.data ?? [] };
  } catch {
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SEARCH & BOOKINGS
// ─────────────────────────────────────────────────────────────────────────────
export type BookingStats = {
  total: number;
  flights: number;
  hotels: number;
  serviceClicks: number;
  others: number;
  estRevTotal: number;
  byService: { type: string; clicks: number }[];
  byProvider: { provider: string; clicks: number; rev_est: number }[];
  byDestination: { destination: string; clicks: number }[];
  daily: { date: string; clicks: number }[];
  recentClicks: ClickRow[];
};

export type ClickRow = {
  id: string;
  result_type: string;
  provider: string;
  destination: string | null;
  price: number | null;
  currency: string | null;
  created_at: string;
};

export async function getBookingStats(): Promise<BookingStats | null> {
  try {
    const db = createSupabaseService() as AnyTable;
    const d30 = daysAgo(30);

    const [allRes, recentRes] = await Promise.all([
      db.from("booking_clicks").select("id,result_type,provider,destination,price,currency,created_at").gte("created_at", d30),
      db.from("booking_clicks").select("id,result_type,provider,destination,price,currency,created_at").order("created_at", { ascending: false }).limit(30),
    ]);

    const rows: ClickRow[] = (allRes.data ?? []) as ClickRow[];

    const flights = rows.filter((r) => r.result_type === "flight").length;
    const hotels  = rows.filter((r) => r.result_type === "hotel").length;
    const serviceTypes = new Set(["insurance", "esim", "activities", "car_rental", "trains", "compensation"]);
    const serviceClicks = rows.filter((r) => serviceTypes.has(r.result_type)).length;
    const others  = rows.length - flights - hotels - serviceClicks;

    const estRevTotal = rows.reduce((s, r) => {
      if (!r.price) return s;
      if (r.result_type === "hotel") return s + r.price * 0.05;
      if (r.result_type === "insurance" || r.result_type === "esim") return s + r.price * 0.10;
      return s + r.price * 0.03;
    }, 0);

    const serviceMap = new Map<string, number>();
    for (const r of rows) {
      if (serviceTypes.has(r.result_type)) {
        serviceMap.set(r.result_type, (serviceMap.get(r.result_type) ?? 0) + 1);
      }
    }
    const byService = Array.from(serviceMap.entries())
      .map(([type, clicks]) => ({ type, clicks }))
      .sort((a, b) => b.clicks - a.clicks);

    const provMap = new Map<string, { clicks: number; rev_est: number }>();
    for (const r of rows) {
      const k = r.provider ?? "unknown";
      const cur = provMap.get(k) ?? { clicks: 0, rev_est: 0 };
      cur.clicks++;
      if (r.price) cur.rev_est += r.result_type === "hotel" ? r.price * 0.05 : r.price * 0.03;
      provMap.set(k, cur);
    }
    const byProvider = Array.from(provMap.entries()).map(([provider, v]) => ({ provider, ...v })).sort((a, b) => b.clicks - a.clicks);

    const destMap = new Map<string, number>();
    for (const r of rows) {
      if (r.destination) destMap.set(r.destination, (destMap.get(r.destination) ?? 0) + 1);
    }
    const byDestination = Array.from(destMap.entries()).map(([destination, clicks]) => ({ destination, clicks })).sort((a, b) => b.clicks - a.clicks).slice(0, 10);

    const dailyMap = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      dailyMap.set(new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10), 0);
    }
    for (const r of rows) {
      const day = r.created_at?.slice(0, 10);
      if (day && dailyMap.has(day)) dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
    }
    const daily = Array.from(dailyMap.entries()).map(([date, clicks]) => ({ date, clicks }));

    return { total: rows.length, flights, hotels, serviceClicks, others, estRevTotal, byService, byProvider, byDestination, daily, recentClicks: (recentRes.data ?? []) as ClickRow[] };
  } catch (err) {
    console.error("[admin/data] getBookingStats:", err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// USERS & SESSIONS
// ─────────────────────────────────────────────────────────────────────────────
export type UserStat = {
  totalRegistered: number;
  totalAnon: number;
  newThisWeek: number;
  activeThisWeek: number;
  appInstalled: number;
  trialStarted: number;
  standaloneOpens: number;
  recentAppUsers: {
    event: string;
    user_id: string | null;
    user_email: string | null;
    session_id: string | null;
    created_at: string;
    locale: string | null;
  }[];
  topUsers: { user_id: string; conv_count: number; last_active: string }[];
};

export async function getUserStats(): Promise<UserStat | null> {
  try {
    const db = createSupabaseService() as AnyTable;
    const d7 = daysAgo(7);

    const [regRes, anonSess, newUsers, activeCons, topRes, appEvents] = await Promise.all([
      db.from("conversations").select("user_id").not("user_id", "is", null),
      db.from("conversations").select("session_id").is("user_id", null).gte("started_at", d7),
      db.from("conversations").select("user_id").not("user_id", "is", null).gte("started_at", d7),
      db.from("conversations").select("user_id").not("user_id", "is", null).gte("last_at", d7),
      db.from("conversations").select("user_id,started_at").not("user_id", "is", null),
      db.from("events")
        .select("name,payload,locale,created_at")
        .in("name", ["pwa_app_installed", "pwa_standalone_opened", "companion_trial_started", "pwa_install_cta_clicked"])
        .order("created_at", { ascending: false })
        .limit(200),
    ]);

    const registered = new Set((regRes.data ?? []).map((r: { user_id: string }) => r.user_id));
    const newWeekSet = new Set((newUsers.data ?? []).map((r: { user_id: string }) => r.user_id));
    const activeSet  = new Set((activeCons.data ?? []).map((r: { user_id: string }) => r.user_id));

    // Top users by conversation count
    const userConvMap = new Map<string, { count: number; last: string }>();
    for (const r of (topRes.data ?? []) as { user_id: string; started_at: string }[]) {
      const cur = userConvMap.get(r.user_id) ?? { count: 0, last: "" };
      cur.count++;
      if (r.started_at > cur.last) cur.last = r.started_at;
      userConvMap.set(r.user_id, cur);
    }
    const topUsers = Array.from(userConvMap.entries())
      .map(([user_id, v]) => ({ user_id, conv_count: v.count, last_active: v.last }))
      .sort((a, b) => b.conv_count - a.conv_count)
      .slice(0, 20);

    type AppEventRow = { name: string; payload: Record<string, unknown> | null; locale: string | null; created_at: string };
    const appRows = (appEvents.data ?? []) as AppEventRow[];
    const installIdentity = new Set<string>();
    const standaloneIdentity = new Set<string>();
    const trialIdentity = new Set<string>();
    const identityFor = (payload: Record<string, unknown> | null) => {
      const userId = typeof payload?.user_id === "string" ? payload.user_id : null;
      const sessionId = typeof payload?.session_id === "string" ? payload.session_id : null;
      return userId ? `u:${userId}` : sessionId ? `s:${sessionId}` : null;
    };
    for (const row of appRows) {
      const id = identityFor(row.payload);
      if (!id) continue;
      if (row.name === "pwa_app_installed") installIdentity.add(id);
      if (row.name === "pwa_standalone_opened") standaloneIdentity.add(id);
      if (row.name === "companion_trial_started") trialIdentity.add(id);
    }
    const recentAppUsers = appRows.slice(0, 25).map((row) => ({
      event: row.name,
      user_id: typeof row.payload?.user_id === "string" ? row.payload.user_id : null,
      user_email: typeof row.payload?.user_email === "string" ? row.payload.user_email : null,
      session_id: typeof row.payload?.session_id === "string" ? row.payload.session_id : null,
      created_at: row.created_at,
      locale: row.locale,
    }));

    return {
      totalRegistered: registered.size,
      totalAnon: (anonSess.data ?? []).length,
      newThisWeek: newWeekSet.size,
      activeThisWeek: activeSet.size,
      appInstalled: installIdentity.size,
      trialStarted: trialIdentity.size,
      standaloneOpens: standaloneIdentity.size,
      recentAppUsers,
      topUsers,
    };
  } catch (err) {
    console.error("[admin/data] getUserStats:", err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// COST CONTROL
// ─────────────────────────────────────────────────────────────────────────────
export type CostStats = {
  totalCostUsd: number;
  costToday: number;
  costThisWeek: number;
  avgCostPerConv: number;
  byModel: { model: string; tokens_in: number; tokens_out: number; cost_usd: number; calls: number }[];
  daily: { date: string; cost_usd: number; calls: number }[];
};

export async function getCostStats(): Promise<CostStats | null> {
  try {
    const db = createSupabaseService() as AnyTable;
    const d30 = daysAgo(30);
    const h24 = hoursAgo(24);
    const d7  = daysAgo(7);

    const [allRes, todayRes, weekRes] = await Promise.all([
      db.from("ai_traces").select("model,tokens_in,tokens_out,created_at").gte("created_at", d30).not("tokens_in", "is", null),
      db.from("ai_traces").select("model,tokens_in,tokens_out").gte("created_at", h24).not("tokens_in", "is", null),
      db.from("ai_traces").select("model,tokens_in,tokens_out").gte("created_at", d7).not("tokens_in", "is", null),
    ]);

    type TraceRow = { model: string | null; tokens_in: number; tokens_out: number; created_at?: string };
    const allRows: TraceRow[] = (allRes.data ?? []) as TraceRow[];
    const todayRows: TraceRow[] = (todayRes.data ?? []) as TraceRow[];
    const weekRows: TraceRow[]  = (weekRes.data ?? []) as TraceRow[];

    const sumCost = (rows: TraceRow[]) =>
      rows.reduce((s, r) => s + calcCost(r.model, r.tokens_in ?? 0, r.tokens_out ?? 0), 0);

    const totalCostUsd  = sumCost(allRows);
    const costToday     = sumCost(todayRows);
    const costThisWeek  = sumCost(weekRows);

    // By model
    const modelMap = new Map<string, { tokens_in: number; tokens_out: number; calls: number }>();
    for (const r of allRows) {
      const k = r.model ?? "unknown";
      const cur = modelMap.get(k) ?? { tokens_in: 0, tokens_out: 0, calls: 0 };
      cur.tokens_in  += r.tokens_in  ?? 0;
      cur.tokens_out += r.tokens_out ?? 0;
      cur.calls++;
      modelMap.set(k, cur);
    }
    const byModel = Array.from(modelMap.entries()).map(([model, v]) => ({
      model,
      ...v,
      cost_usd: calcCost(model, v.tokens_in, v.tokens_out),
    }));

    // Daily cost (last 30 days)
    const dailyMap = new Map<string, { cost_usd: number; calls: number }>();
    for (let i = 29; i >= 0; i--) {
      dailyMap.set(new Date(Date.now() - i * 86_400_000).toISOString().slice(0, 10), { cost_usd: 0, calls: 0 });
    }
    for (const r of allRows) {
      const day = r.created_at?.slice(0, 10);
      if (day && dailyMap.has(day)) {
        const cur = dailyMap.get(day)!;
        cur.cost_usd += calcCost(r.model, r.tokens_in ?? 0, r.tokens_out ?? 0);
        cur.calls++;
      }
    }
    const daily = Array.from(dailyMap.entries()).map(([date, v]) => ({ date, ...v }));

    // Avg cost per conversation (approximate)
    const convCount = await db
      .from("conversations")
      .select("id", { count: "exact", head: true })
      .gte("started_at", d30);
    const avgCostPerConv = (convCount.count ?? 0) > 0 ? totalCostUsd / (convCount.count ?? 1) : 0;

    return { totalCostUsd, costToday, costThisWeek, avgCostPerConv, byModel, daily };
  } catch (err) {
    console.error("[admin/data] getCostStats:", err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUPPORT
// ─────────────────────────────────────────────────────────────────────────────
export type SupportRow = {
  id: number;
  contact_email: string | null;
  subject: string | null;
  body: string | null;
  ai_summary: string | null;
  category: string;
  priority: string;
  status: string | null;
  created_at: string;
  updated_at: string | null;
  user_id?: string | null;
};

export async function getSupportRequests(): Promise<{ rows: SupportRow[]; total: number }> {
  try {
    const db = createSupabaseService() as AnyTable;
    const { data, count } = await db
      .from("support_requests")
      .select(
        "id,user_id,category,status,priority,subject,body,ai_summary,contact_email,created_at,updated_at",
        { count: "exact" },
      )
      .order("created_at", { ascending: false })
      .limit(100);
    return { rows: (data ?? []) as SupportRow[], total: count ?? 0 };
  } catch {
    return { rows: [], total: 0 };
  }
}

export async function updateSupportRequest(
  id: number,
  patch: {
    status?: "open" | "in_progress" | "resolved" | "closed";
    priority?: "low" | "normal" | "high" | "urgent";
    ai_summary?: string | null;
  },
): Promise<boolean> {
  try {
    const db = createSupabaseService() as AnyTable;
    const cleanPatch = Object.fromEntries(
      Object.entries(patch).filter(([, value]) => value !== undefined),
    );
    if (!Object.keys(cleanPatch).length) return true;
    const { error } = await db
      .from("support_requests")
      .update(cleanPatch)
      .eq("id", id);
    return !error;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SAVED TRIP PLANS
// ─────────────────────────────────────────────────────────────────────────────
export type AdminTripPlanRow = {
  id: string;
  user_id: string;
  title: string;
  locale: "ar" | "en";
  origin: string | null;
  destination: string;
  days: number;
  travelers: number;
  budget: number | null;
  currency: string;
  trip_type: string | null;
  created_at: string;
};

export type TripPlanAdminStats = {
  total: number;
  createdWeek: number;
  generatedWeek: number;
  avgBudget: number;
  avgDays: number;
  feedbackTotal: number;
  feedbackHelpful: number;
  feedbackUnhelpful: number;
  feedbackRate: number;
  topDestinations: { destination: string; count: number }[];
  feedbackByDestination: { destination: string; helpful: number; unhelpful: number; total: number }[];
  weakPlans: { destination: string | null; days: number | null; tripType: string | null; path: string | null; created_at: string }[];
  tripTypes: { type: string; count: number }[];
  recent: AdminTripPlanRow[];
};

export async function getTripPlanAdminStats(): Promise<TripPlanAdminStats> {
  try {
    const db = createSupabaseService() as AnyTable;
    const d7 = daysAgo(7);
    const d30 = daysAgo(30);
    const [plansRes, generatedRes, feedbackRes] = await Promise.all([
      db
        .from("trip_plans")
        .select("id,user_id,title,locale,origin,destination,days,travelers,budget,currency,trip_type,created_at", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(500),
      db
        .from("events")
        .select("id,payload,path,created_at", { count: "exact" })
        .eq("name", "trip_plan_generated")
        .gte("created_at", d7)
        .limit(1000),
      db
        .from("events")
        .select("id,payload,path,created_at")
        .eq("name", "trip_plan_feedback")
        .gte("created_at", d30)
        .order("created_at", { ascending: false })
        .limit(500),
    ]);

    const rows = ((plansRes.data ?? []) as AdminTripPlanRow[]);
    const feedbackRows = ((feedbackRes.data ?? []) as { payload?: Record<string, unknown>; path: string | null; created_at: string }[]);
    const createdWeek = rows.filter((row) => row.created_at >= d7).length;
    const budgets = rows.map((row) => Number(row.budget ?? 0)).filter((value) => value > 0);
    const avgBudget = budgets.length ? Math.round(budgets.reduce((sum, value) => sum + value, 0) / budgets.length) : 0;
    const avgDays = rows.length ? Math.round(rows.reduce((sum, row) => sum + row.days, 0) / rows.length) : 0;

    const destMap = new Map<string, number>();
    const typeMap = new Map<string, number>();
    const feedbackDestMap = new Map<string, { helpful: number; unhelpful: number; total: number }>();
    let feedbackHelpful = 0;
    let feedbackUnhelpful = 0;
    for (const row of rows) {
      destMap.set(row.destination, (destMap.get(row.destination) ?? 0) + 1);
      const type = row.trip_type ?? "unknown";
      typeMap.set(type, (typeMap.get(type) ?? 0) + 1);
    }
    for (const row of feedbackRows) {
      const value = row.payload?.value === "up" ? "up" : "down";
      if (value === "up") feedbackHelpful++;
      else feedbackUnhelpful++;
      const destination = String(row.payload?.destination ?? "غير محددة");
      const cur = feedbackDestMap.get(destination) ?? { helpful: 0, unhelpful: 0, total: 0 };
      if (value === "up") cur.helpful++;
      else cur.unhelpful++;
      cur.total++;
      feedbackDestMap.set(destination, cur);
    }
    const feedbackTotal = feedbackHelpful + feedbackUnhelpful;

    return {
      total: plansRes.count ?? rows.length,
      createdWeek,
      generatedWeek: generatedRes.count ?? 0,
      avgBudget,
      avgDays,
      feedbackTotal,
      feedbackHelpful,
      feedbackUnhelpful,
      feedbackRate: feedbackTotal ? feedbackHelpful / feedbackTotal : 0,
      topDestinations: Array.from(destMap.entries())
        .map(([destination, value]) => ({ destination, count: value }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10),
      feedbackByDestination: Array.from(feedbackDestMap.entries())
        .map(([destination, value]) => ({ destination, ...value }))
        .sort((a, b) => b.unhelpful - a.unhelpful || b.total - a.total)
        .slice(0, 10),
      weakPlans: feedbackRows
        .filter((row) => row.payload?.value !== "up")
        .slice(0, 12)
        .map((row) => ({
          destination: typeof row.payload?.destination === "string" ? row.payload.destination : null,
          days: typeof row.payload?.days === "number" ? row.payload.days : null,
          tripType: typeof row.payload?.tripType === "string" ? row.payload.tripType : null,
          path: row.path,
          created_at: row.created_at,
        })),
      tripTypes: Array.from(typeMap.entries())
        .map(([type, value]) => ({ type, count: value }))
        .sort((a, b) => b.count - a.count),
      recent: rows.slice(0, 50),
    };
  } catch {
    return {
      total: 0,
      createdWeek: 0,
      generatedWeek: 0,
      avgBudget: 0,
      avgDays: 0,
      feedbackTotal: 0,
      feedbackHelpful: 0,
      feedbackUnhelpful: 0,
      feedbackRate: 0,
      topDestinations: [],
      feedbackByDestination: [],
      weakPlans: [],
      tripTypes: [],
      recent: [],
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────────────────────────────────────
export type AnalyticsStats = {
  // Funnel
  conversationsTotal: number;
  searchesTotal: number;         // AI traces with mode = "search"
  clicksTotal: number;
  conversionRate: number;        // clicks / conversations (0–1)

  // Revenue
  estRevFlights: number;
  estRevHotels: number;
  estRevTotal: number;

  // Top destinations (last 30d)
  topDestinations: { destination: string; clicks: number; rev_est: number }[];

  // Locale split
  localeAr: number;              // conversations containing locale hint "ar"
  localeEn: number;

  // Channel split
  flightClicks: number;
  hotelClicks: number;

  // Weekly trend (last 8 weeks)
  weeklyConversations: { week: string; conversations: number; clicks: number }[];
};

export async function getAnalyticsStats(): Promise<AnalyticsStats | null> {
  try {
    const db = createSupabaseService() as AnyTable;
    const d30 = daysAgo(30);
    const d56 = daysAgo(56); // 8 weeks

    const [convRes, searchRes, clicksRes] = await Promise.all([
      db.from("conversations").select("id", { count: "exact", head: true }).gte("started_at", d30),
      db.from("ai_traces").select("id", { count: "exact", head: true }).eq("mode", "search").gte("created_at", d30),
      db.from("booking_clicks").select("id,result_type,destination,price,currency,created_at").gte("created_at", d30),
    ]);

    const clickRows: { result_type: string; destination: string | null; price: number | null; created_at: string }[] =
      (clicksRes.data ?? []) as typeof clickRows;

    const flightClicks = clickRows.filter((r) => r.result_type === "flight").length;
    const hotelClicks  = clickRows.filter((r) => r.result_type === "hotel").length;

    const estRevFlights = clickRows
      .filter((r) => r.result_type === "flight" && r.price)
      .reduce((s, r) => s + (r.price ?? 0) * 0.03, 0);
    const estRevHotels = clickRows
      .filter((r) => r.result_type === "hotel" && r.price)
      .reduce((s, r) => s + (r.price ?? 0) * 0.05, 0);

    // Top destinations
    const destMap = new Map<string, { clicks: number; rev_est: number }>();
    for (const r of clickRows) {
      const d = r.destination ?? "Unknown";
      const cur = destMap.get(d) ?? { clicks: 0, rev_est: 0 };
      cur.clicks++;
      if (r.price) cur.rev_est += r.result_type === "hotel" ? r.price * 0.05 : r.price * 0.03;
      destMap.set(d, cur);
    }
    const topDestinations = Array.from(destMap.entries())
      .map(([destination, v]) => ({ destination, ...v }))
      .sort((a, b) => b.clicks - a.clicks)
      .slice(0, 10);

    // Weekly trend (last 8 weeks using booking_clicks + conversations)
    const weeklyConvRes = await db
      .from("conversations")
      .select("started_at")
      .gte("started_at", d56);
    const weeklyClickRes = await db
      .from("booking_clicks")
      .select("created_at")
      .gte("created_at", d56);

    // Build 8-week buckets
    const weekBuckets: { week: string; wStart: number }[] = [];
    for (let i = 7; i >= 0; i--) {
      const wStart = Date.now() - (i + 1) * 7 * 86_400_000;
      const label = new Date(wStart).toISOString().slice(0, 10);
      weekBuckets.push({ week: label, wStart });
    }
    const weeklyMap = new Map<string, { conversations: number; clicks: number }>(
      weekBuckets.map((b) => [b.week, { conversations: 0, clicks: 0 }]),
    );

    for (const r of (weeklyConvRes.data ?? []) as { started_at: string }[]) {
      const ts = new Date(r.started_at).getTime();
      for (const b of weekBuckets) {
        if (ts >= b.wStart && ts < b.wStart + 7 * 86_400_000) {
          const cur = weeklyMap.get(b.week)!;
          cur.conversations++;
          break;
        }
      }
    }
    for (const r of (weeklyClickRes.data ?? []) as { created_at: string }[]) {
      const ts = new Date(r.created_at).getTime();
      for (const b of weekBuckets) {
        if (ts >= b.wStart && ts < b.wStart + 7 * 86_400_000) {
          const cur = weeklyMap.get(b.week)!;
          cur.clicks++;
          break;
        }
      }
    }
    const weeklyConversations = Array.from(weeklyMap.entries()).map(([week, v]) => ({ week, ...v }));

    const conversationsTotal = convRes.count ?? 0;
    const clicksTotal = clickRows.length;
    const conversionRate = conversationsTotal > 0 ? clicksTotal / conversationsTotal : 0;

    return {
      conversationsTotal,
      searchesTotal: searchRes.count ?? 0,
      clicksTotal,
      conversionRate,
      estRevFlights,
      estRevHotels,
      estRevTotal: estRevFlights + estRevHotels,
      topDestinations,
      localeAr: 0, // populated below if messages table supports locale
      localeEn: 0,
      flightClicks,
      hotelClicks,
      weeklyConversations,
    };
  } catch (err) {
    console.error("[admin/data] getAnalyticsStats:", err);
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// OBSERVABILITY
// ─────────────────────────────────────────────────────────────────────────────
export type ObsStats = {
  p50: number;
  p95: number;
  p99: number;
  errorsByKind: { kind: string; count: number }[];
  statusDistribution: { status: string; count: number }[];
  latencyBuckets: { bucket: string; count: number }[];
  slowestTraces: AiTraceRow[];
};

export async function getObservabilityStats(): Promise<ObsStats | null> {
  try {
    const db = createSupabaseService() as AnyTable;
    const d7 = daysAgo(7);

    const [tracesRes, errorsRes, slowRes] = await Promise.all([
      db.from("ai_traces").select("duration_ms,status").gte("created_at", d7),
      db.from("ai_traces").select("error_kind").gte("created_at", d7).not("error_kind", "is", null),
      db.from("ai_traces").select("id,mode,status,duration_ms,model,tokens_in,tokens_out,error_kind,created_at").gte("created_at", d7).order("duration_ms", { ascending: false }).limit(10),
    ]);

    const traces = (tracesRes.data ?? []) as { duration_ms: number | null; status: string }[];
    const lats = traces.map((t) => t.duration_ms ?? 0).filter(Boolean).sort((a, b) => a - b);
    const p = (q: number) => lats[Math.floor(lats.length * q)] ?? 0;

    const statusMap = new Map<string, number>();
    for (const t of traces) statusMap.set(t.status, (statusMap.get(t.status) ?? 0) + 1);

    const errorMap = new Map<string, number>();
    for (const e of (errorsRes.data ?? []) as { error_kind: string }[]) {
      const k = e.error_kind ?? "unknown";
      errorMap.set(k, (errorMap.get(k) ?? 0) + 1);
    }

    // Latency buckets
    const buckets = [
      { label: "<500ms", min: 0, max: 500 },
      { label: "500ms–1s", min: 500, max: 1000 },
      { label: "1s–2s", min: 1000, max: 2000 },
      { label: "2s–5s", min: 2000, max: 5000 },
      { label: ">5s", min: 5000, max: Infinity },
    ];
    const latencyBuckets = buckets.map((b) => ({
      bucket: b.label,
      count: lats.filter((l) => l >= b.min && l < b.max).length,
    }));

    return {
      p50: p(0.5),
      p95: p(0.95),
      p99: p(0.99),
      errorsByKind: Array.from(errorMap.entries()).map(([kind, count]) => ({ kind, count })),
      statusDistribution: Array.from(statusMap.entries()).map(([status, count]) => ({ status, count })),
      latencyBuckets,
      slowestTraces: (slowRes.data ?? []) as AiTraceRow[],
    };
  } catch (err) {
    console.error("[admin/data] getObservabilityStats:", err);
    return null;
  }
}
