import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createHmac } from "crypto";
import { isLocale, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AdminDashboard } from "@/components/AdminDashboard";
import { AdminLoginForm } from "@/components/AdminLoginForm";

function deriveSessionToken(adminKey: string): string {
  return createHmac("sha256", adminKey)
    .update("gotripza-admin-session-v1")
    .digest("hex");
}

export const metadata = { title: "Admin", robots: "noindex,nofollow" };

// Never cache this page
export const dynamic = "force-dynamic";

export default async function AdminPage({
  params,
}: {
  params: { locale: string };
}) {
  const { locale } = params;
  if (!isLocale(locale)) notFound();

  const adminKey = process.env.ADMIN_KEY;
  const isAr = locale === "ar";

  // ADMIN_KEY must always be configured — refuse if missing
  if (!adminKey) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
        <p className="text-sm text-red-400">
          ADMIN_KEY environment variable is not configured.
        </p>
      </div>
    );
  }

  // Validate httpOnly session cookie against DERIVED token (never raw key)
  const sessionCookie = cookies().get("admin_session");
  const expectedToken = deriveSessionToken(adminKey);
  const isAuthenticated = sessionCookie?.value === expectedToken;

  if (!isAuthenticated) {
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
