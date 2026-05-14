import { redirect, notFound } from "next/navigation";
import { isLocale, type Locale } from "@/i18n/config";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { AdminLoginForm } from "@/components/AdminLoginForm";

export const metadata = { title: "Admin", robots: "noindex,nofollow" };
export const dynamic = "force-dynamic";

export default async function AdminPage(
  props: {
    params: Promise<{ locale: string }>;
  }
) {
  const params = await props.params;
  const { locale } = params;
  if (!isLocale(locale)) notFound();

  // Already authenticated → send straight to the new ops console
  if (await isAdminAuthenticated()) redirect("/admin/dashboard");

  if (!process.env.ADMIN_KEY) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f]">
        <p className="text-sm text-red-400">
          ADMIN_KEY environment variable is not configured.
        </p>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center bg-[#0a0a0f]"
      dir={locale === "ar" ? "rtl" : "ltr"}
    >
      <AdminLoginForm locale={locale as Locale} />
    </div>
  );
}
