import Link from "next/link";
import { PartnerDashboardClient, PartnerLoginCard } from "@/components/partners/PartnerDashboardClient";
import { getCurrentUser } from "@/lib/auth/session";
import { getPartnerDashboard } from "@/lib/partner-program";

export const dynamic = "force-dynamic";
export const metadata = {
  title: "Rya Partners Dashboard",
  robots: "noindex,nofollow",
};

export default async function PartnerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) return <PartnerLoginCard />;

  const data = await getPartnerDashboard(user);
  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#060A13] px-5 text-white">
        <div className="max-w-xl rounded-[32px] border border-white/10 bg-white/[0.04] p-8 text-center shadow-2xl shadow-black/30">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#00D4B3]">Rya Partners</p>
          <h1 className="mt-4 text-3xl font-black">لم نجد طلب شراكة لهذا الحساب</h1>
          <p className="mt-3 text-sm leading-7 text-white/50">
            استخدم نفس البريد الذي قدمت به على البرنامج، أو قدّم طلب شراكة جديد ليتم ربط حسابك بلوحة الشريك.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link href="/ar/partners#apply" className="rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#060A13]">
              قدّم طلب شراكة
            </Link>
            <Link href="/ar" className="rounded-2xl border border-white/10 px-5 py-3 text-sm font-bold text-white/70">
              العودة للموقع
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return <PartnerDashboardClient data={data} />;
}
