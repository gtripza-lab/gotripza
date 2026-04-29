import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdminDashboard } from "@/components/AdminDashboard";

export const metadata = { title: "Admin — GoTripza", robots: "noindex,nofollow" };

export default async function AdminPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { key?: string };
}) {
  const { locale } = params;
  if (!isLocale(locale)) notFound();

  // Use server-only env var (no NEXT_PUBLIC_ prefix — never exposed to client bundle)
  const adminKey = process.env.ADMIN_KEY ?? "gotripza_admin_2025";
  if (searchParams.key !== adminKey) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3">
        <p className="text-white/30 text-sm">401 — Access denied.</p>
        <p className="text-white/20 text-xs">
          Append <code className="mx-1 rounded bg-white/10 px-1.5 py-0.5 text-white/50">?key=…</code> to the URL.
        </p>
      </div>
    );
  }

  const dict = await getDictionary(locale as Locale);
  return (
    <>
      <Navbar dict={dict} locale={locale as Locale} />
      <AdminDashboard locale={locale as Locale} />
      <Footer dict={dict} locale={locale as Locale} />
    </>
  );
}
