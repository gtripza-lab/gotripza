"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, Link2, ShieldAlert } from "lucide-react";
import {
  PARTNER_PROGRAM_SETTINGS,
  calculatePartnerCommission,
  formatPartnerCommission,
  formatPartnerUsd,
} from "@/lib/partner-config";

type PartnerRow = {
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
  metrics: {
    clicks: number;
    signups: number;
    conversions: number;
    revenue: number;
    commissions: number;
  };
  conversionRate: number;
} & Record<string, unknown>;

type AdminPartnerOverview = {
  partners: PartnerRow[];
  leaderboard: PartnerRow[];
  topSources: { source: string; count: number }[];
  fraudFlags: Array<{ id: string; partner_id: string; reason: string; severity: string; created_at: string }>;
};

const statuses = [
  ["pending", "قيد المراجعة"],
  ["approved", "مقبول"],
  ["rejected", "مرفوض"],
  ["suspended", "موقوف"],
] as const;

export function AdminPartnersClient({ overview }: { overview: unknown }) {
  const data = useMemo(() => overview as AdminPartnerOverview, [overview]);
  const router = useRouter();
  const partners = useMemo(() => data.partners ?? [], [data.partners]);
  const leaderboard = data.leaderboard ?? [];
  const topSources = data.topSources ?? [];
  const fraudFlags = data.fraudFlags ?? [];
  const [savingId, setSavingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [drafts, setDrafts] = useState(() =>
    Object.fromEntries(
      partners.map((partner) => [
        partner.id,
        {
          status: partner.status,
          companion: Math.round(Number(partner.commission_rate_companion ?? 0.25) * 100),
          plan: Math.round(Number(partner.commission_rate_plan ?? 0.4) * 100),
        },
      ]),
    ) as Record<string, { status: string; companion: number; plan: number }>,
  );
  const settings = PARTNER_PROGRAM_SETTINGS;
  const defaultCommissionLabel = settings.products
    .map((product) => `${product.name} ${formatPartnerCommission(product.commissionRate)}`)
    .join(" و ");

  const partnerNameById = useMemo(
    () => new Map(partners.map((partner) => [partner.id, partner.full_name])),
    [partners],
  );

  function setDraft(id: string, patch: Partial<{ status: string; companion: number; plan: number }>) {
    setDrafts((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
  }

  async function savePartner(partner: PartnerRow) {
    const draft = drafts[partner.id];
    setSavingId(partner.id);
    setMessage(null);
    const res = await fetch("/api/admin/partners", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        partnerId: partner.id,
        status: draft.status,
        commissionRateCompanion: draft.companion / 100,
        commissionRatePlan: draft.plan / 100,
      }),
    });
    setSavingId(null);
    if (!res.ok) {
      setMessage("تعذر حفظ التعديل. راجع الصلاحيات أو الاتصال.");
      return;
    }
    setMessage("تم حفظ تعديل الشريك.");
    startTransition(() => router.refresh());
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {message}
        </div>
      )}

      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#00d4b3]">
                {settings.programName}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-white">إعدادات برنامج الشركاء</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/45">
                هذه هي القواعد التجارية التي يعتمد عليها النظام عند احتساب العمولات وتتبع روابط الشركاء.
              </p>
            </div>
            <div className="rounded-2xl border border-[#00d4b3]/20 bg-[#00d4b3]/10 px-4 py-3 text-sm font-semibold text-[#adfff2]">
              الموافقة: يدوية
            </div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {settings.products.map((product) => (
              <div key={product.key} className="rounded-2xl border border-white/[0.07] bg-black/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold text-white">{product.arabicName}</h3>
                    <p className="mt-1 text-xs text-white/40">{product.name}</p>
                  </div>
                  <a
                    href={product.checkoutUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/65 transition hover:border-white/25 hover:text-white"
                  >
                    Gumroad
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <p className="mt-3 min-h-10 text-sm leading-6 text-white/45">{product.description}</p>
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <MiniStat label="السعر" value={formatPartnerUsd(product.priceUsd)} />
                  <MiniStat label="عمولة الشريك" value={formatPartnerCommission(product.commissionRate)} />
                  <MiniStat
                    label="قيمة العمولة"
                    value={formatPartnerUsd(calculatePartnerCommission(product.priceUsd, product.commissionRate))}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
          <h2 className="text-sm font-semibold text-white/75">قواعد التشغيل</h2>
          <div className="mt-4 space-y-3">
            <SettingRow label="مدة حفظ الإحالة" value={`${settings.cookieDays} يوم`} />
            <SettingRow label="الحد الأدنى للدفع" value={formatPartnerUsd(settings.minimumPayoutUsd)} />
            <SettingRow label="حالة الطلب الجديدة" value="قيد المراجعة" />
            <SettingRow label="طرق الدفع" value={settings.payoutMethods.join(" / ")} />
          </div>
          <div className="mt-5 rounded-2xl border border-blue-400/15 bg-blue-400/10 p-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-100">
              <Link2 className="h-4 w-4" />
              اختبار سريع
            </div>
            <p className="mt-2 text-xs leading-6 text-blue-100/55">
              بعد تطبيق migration في Supabase، جرّب رابط مثل <span className="font-mono">/r/demo</span> وتأكد أنه يحفظ
              الإحالة ثم يرسل المستخدم إلى صفحة Rya Companion.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03]">
          <div className="border-b border-white/[0.06] px-5 py-4">
            <h2 className="text-sm font-semibold text-white/75">إدارة الشركاء</h2>
            <p className="mt-1 text-xs text-white/35">
              الموافقة، الإيقاف، وتعديل نسب العمولات. الافتراضي الحالي: {defaultCommissionLabel}.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-right text-[11px] uppercase tracking-[0.14em] text-white/30">
                  <th className="px-5 py-3">الشريك</th>
                  <th className="px-5 py-3">المنصة</th>
                  <th className="px-5 py-3">الأداء</th>
                  <th className="px-5 py-3">الحالة</th>
                  <th className="px-5 py-3">Companion</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {partners.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-white/35">
                      لا توجد طلبات شراكة بعد.
                    </td>
                  </tr>
                ) : (
                  partners.map((partner) => {
                    const draft = drafts[partner.id];
                    return (
                      <tr key={partner.id} className="border-b border-white/[0.04] last:border-0">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-white/85">{partner.full_name}</div>
                          <div className="mt-1 text-xs text-white/35">{partner.email}</div>
                          <div className="mt-1 text-xs text-white/30">
                            {partner.country} · {partner.referral_code || "بدون كود"}
                          </div>
                        </td>
                        <td className="px-5 py-4 text-white/55">
                          <div>{partner.main_platform}</div>
                          <div className="mt-1 text-xs text-white/30">{Number(partner.audience_size ?? 0).toLocaleString()} متابع</div>
                        </td>
                        <td className="px-5 py-4 text-white/55">
                          <div>{partner.metrics.clicks.toLocaleString()} نقرة</div>
                          <div className="mt-1 text-xs text-white/30">
                            {partner.metrics.conversions.toLocaleString()} تحويل · ${(partner.metrics.revenue || 0).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <select
                            value={draft.status}
                            onChange={(event) => setDraft(partner.id, { status: event.target.value })}
                            className="rounded-xl border border-white/10 bg-[#10131e] px-3 py-2 text-xs text-white outline-none"
                          >
                            {statuses.map(([value, label]) => (
                              <option key={value} value={value}>{label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-5 py-4">
                          <PercentInput
                            value={draft.companion}
                            onChange={(value) => setDraft(partner.id, { companion: value })}
                          />
                        </td>
                        <td className="px-5 py-4">
                          <PercentInput
                            value={draft.plan}
                            onChange={(value) => setDraft(partner.id, { plan: value })}
                          />
                        </td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            disabled={savingId === partner.id || isPending}
                            onClick={() => savePartner(partner)}
                            className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-[#08080d] disabled:opacity-50"
                          >
                            <Check className="h-3.5 w-3.5" />
                            {savingId === partner.id ? "يحفظ..." : "حفظ"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <SidePanel title="أفضل الشركاء">
            {leaderboard.length ? leaderboard.slice(0, 6).map((partner, index) => (
              <Row
                key={partner.id}
                label={`${index + 1}. ${partner.full_name}`}
                value={`$${Number(partner.metrics.revenue ?? 0).toFixed(2)}`}
              />
            )) : <Empty text="لا توجد تحويلات بعد." />}
          </SidePanel>
          <SidePanel title="مصادر الزيارات">
            {topSources.length ? topSources.map((item) => (
              <Row key={item.source} label={item.source} value={item.count.toLocaleString()} />
            )) : <Empty text="لا توجد مصادر بعد." />}
          </SidePanel>
          <SidePanel title="تنبيهات الاحتيال">
            {fraudFlags.length ? fraudFlags.slice(0, 5).map((flag) => (
              <div key={flag.id} className="rounded-xl border border-red-400/20 bg-red-400/10 p-3">
                <div className="flex items-center gap-2 text-sm font-semibold text-red-100">
                  <ShieldAlert className="h-4 w-4" />
                  {flag.reason}
                </div>
                <p className="mt-1 text-xs text-red-100/55">
                  {partnerNameById.get(flag.partner_id) ?? "شريك غير معروف"} · {flag.severity}
                </p>
              </div>
            )) : <Empty text="لا توجد تنبيهات حالياً." />}
          </SidePanel>
        </div>
      </section>
    </div>
  );
}

function PercentInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <label className="flex w-24 items-center gap-1 rounded-xl border border-white/10 bg-[#10131e] px-3 py-2 text-xs text-white">
      <input
        value={value}
        type="number"
        min={0}
        max={80}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full bg-transparent text-white outline-none"
      />
      %
    </label>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] px-2 py-3">
      <div className="text-[10px] text-white/35">{label}</div>
      <div className="mt-1 text-sm font-semibold text-white/85">{value}</div>
    </div>
  );
}

function SettingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/[0.06] bg-black/20 px-4 py-3 text-sm">
      <span className="text-white/45">{label}</span>
      <span className="text-left font-semibold text-white/80">{value}</span>
    </div>
  );
}

function SidePanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5">
      <h2 className="text-sm font-semibold text-white/75">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-2 text-sm last:border-0">
      <span className="text-white/55">{label}</span>
      <span className="font-semibold text-white/80">{value}</span>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-xl bg-black/20 p-3 text-sm text-white/35">{text}</p>;
}
