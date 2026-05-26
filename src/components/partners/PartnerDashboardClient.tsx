"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Copy, ExternalLink, LogIn, QrCode, Share2 } from "lucide-react";
import { AuthModal } from "@/components/AuthModal";
import type { PartnerDashboardData } from "@/lib/partner-program";

export function PartnerLoginCard() {
  const [open, setOpen] = useState(false);
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-5 text-center">
      <div className="rounded-[32px] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/30">
        <LogIn className="mx-auto h-10 w-10 text-[#3B82F6]" />
        <h1 className="mt-5 text-3xl font-black">لوحة شركاء ريا</h1>
        <p className="mt-3 text-sm leading-7 text-white/50">
          سجل دخولك بنفس البريد المستخدم في طلب الشراكة لعرض الرابط، الإحصائيات، والعمولات.
        </p>
        <button
          onClick={() => setOpen(true)}
          className="mt-6 w-full rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#060A13]"
        >
          تسجيل الدخول
        </button>
      </div>
      <AuthModal
        open={open}
        onClose={() => setOpen(false)}
        locale="ar"
        nextPath="/partner/dashboard"
        title="الدخول إلى لوحة الشريك"
        description="استخدم البريد نفسه الذي قدمت به على Rya Partners."
      />
    </div>
  );
}

export function PartnerDashboardClient({ data }: { data: PartnerDashboardData }) {
  const [copied, setCopied] = useState<string | null>(null);
  const qrUrl = useMemo(
    () => `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(data.referralUrl)}`,
    [data.referralUrl],
  );

  async function copy(value: string, label: string) {
    await navigator.clipboard.writeText(value);
    setCopied(label);
    window.setTimeout(() => setCopied(null), 1800);
    void fetch("/api/log-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "partner_referral_copied", payload: { label } }),
    });
  }

  const isApproved = data.partner.status === "approved";

  return (
    <main className="min-h-screen bg-[#060A13] px-4 py-6 text-white md:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-white/[0.04] p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#00D4B3]">Rya Partners</p>
            <h1 className="mt-2 text-2xl font-black md:text-4xl">مرحباً، {data.partner.full_name}</h1>
            <p className="mt-2 text-sm text-white/45">
              حالة الحساب: <span className="font-bold text-white/75">{statusLabel(data.partner.status)}</span>
            </p>
          </div>
          <Link href="/ar/partners" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 hover:bg-white/[0.06]">
            صفحة البرنامج
            <ExternalLink className="h-4 w-4" />
          </Link>
        </header>

        {!isApproved && (
          <section className="rounded-[24px] border border-amber-400/20 bg-amber-400/10 p-5 text-amber-50/85">
            <h2 className="font-bold">طلبك تحت المراجعة</h2>
            <p className="mt-2 text-sm leading-7">
              جهزنا رابطك وكودك، لكن التتبع والعمولات لا تعمل إلا بعد موافقة الإدارة. ستظهر لك الأدوات كاملة بعد التفعيل.
            </p>
          </section>
        )}

        <section className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          <Metric label="النقرات" value={data.metrics.clicks.toLocaleString("en-US")} />
          <Metric label="التسجيلات" value={data.metrics.signups.toLocaleString("en-US")} />
          <Metric label="التحويلات" value={data.metrics.conversions.toLocaleString("en-US")} />
          <Metric label="الإيراد" value={`$${data.metrics.revenueUsd.toFixed(2)}`} />
          <Metric label="عمولة معلقة" value={`$${data.metrics.pendingUsd.toFixed(2)}`} />
          <Metric label="نسبة التحويل" value={`${(data.metrics.conversionRate * 100).toFixed(1)}%`} />
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-[#8B5CF6]" />
              <h2 className="text-xl font-black">أدوات الإحالة</h2>
            </div>
            <div className="mt-5 grid gap-3">
              <CopyRow label="رابط الإحالة" value={data.referralUrl} onCopy={copy} disabled={!isApproved} />
              <CopyRow label="كود الإحالة" value={data.referralCode} onCopy={copy} disabled={!isApproved} />
            </div>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/35">
              <span className="rounded-full bg-white/[0.05] px-3 py-1">Rya Companion: 25%</span>
              <span className="rounded-full bg-white/[0.05] px-3 py-1">Plan My Trip: 40%</span>
              <span className="rounded-full bg-white/[0.05] px-3 py-1">Cookie: 60 days</span>
            </div>
            {copied && <p className="mt-4 text-sm text-[#00D4B3]">تم نسخ {copied}</p>}
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-[#00D4B3]" />
              <h2 className="text-xl font-black">QR للرابط</h2>
            </div>
            <div className="mt-5 flex items-center justify-center rounded-3xl bg-white p-5">
              {isApproved ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={qrUrl} alt="Partner referral QR code" className="h-48 w-48" />
              ) : (
                <div className="flex h-48 w-48 items-center justify-center rounded-2xl bg-black/10 text-center text-sm text-black/50">
                  يظهر بعد الموافقة
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          <Panel title="أفضل مصادر الزيارات">
            {data.topSources.length ? data.topSources.map((item) => (
              <Row key={item.source} label={item.source} value={item.count.toLocaleString("en-US")} />
            )) : <Empty text="لا توجد زيارات بعد." />}
          </Panel>
          <Panel title="آخر التحويلات">
            {data.conversions.length ? data.conversions.slice(0, 6).map((item) => (
              <Row key={item.id} label={item.product_name} value={`$${Number(item.commission_usd).toFixed(2)} · ${statusLabel(item.status)}`} />
            )) : <Empty text="لا توجد تحويلات بعد." />}
          </Panel>
          <Panel title="الموارد">
            {data.assets.length ? data.assets.slice(0, 6).map((item) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                <p className="text-sm font-bold">{item.title}</p>
                <p className="mt-1 text-xs leading-6 text-white/45">{item.content || item.url || item.asset_type}</p>
              </div>
            )) : <Empty text="لا توجد موارد بعد." />}
          </Panel>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs text-white/35">{label}</p>
      <p className="mt-2 text-2xl font-black">{value}</p>
    </div>
  );
}

function CopyRow({ label, value, disabled, onCopy }: { label: string; value: string; disabled?: boolean; onCopy: (value: string, label: string) => void }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/10 bg-black/20 p-3 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs text-white/35">{label}</p>
        <p className="break-all text-sm font-semibold text-white/80">{value}</p>
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onCopy(value, label)}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-3 py-2 text-xs font-bold text-[#060A13] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Copy className="h-3.5 w-3.5" />
        نسخ
      </button>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
      <h2 className="text-lg font-black">{title}</h2>
      <div className="mt-4 space-y-3">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/5 pb-2 text-sm last:border-b-0">
      <span className="text-white/62">{label}</span>
      <span className="font-bold text-white/85">{value}</span>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/35">{text}</p>;
}

function statusLabel(status: string) {
  const map: Record<string, string> = {
    pending: "قيد المراجعة",
    approved: "مقبول",
    rejected: "مرفوض",
    suspended: "موقوف",
    paid: "مدفوع",
    refunded: "مسترد",
    void: "ملغي",
  };
  return map[status] ?? status;
}
