import { notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdminDashboard } from "@/components/AdminDashboard";
import { AdminLoginForm } from "@/components/AdminLoginForm";

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

  const adminKey = process.env.ADMIN_KEY ?? "gotripza_admin_2025";
  const isAr = locale === "ar";

  // Not authenticated — show login form
  if (searchParams.key !== adminKey) {
    return (
      <div
        className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f]"
        dir={isAr ? "rtl" : "ltr"}
      >
        <AdminLoginForm locale={locale as Locale} />
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
