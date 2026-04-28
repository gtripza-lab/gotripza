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

  const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY ?? "gotripza_admin_2025";
  if (searchParams.key !== adminKey) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white/50 text-sm">
        401 — Access denied. Append <code className="mx-1 text-white/80">?key=…</code> to the URL.
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
