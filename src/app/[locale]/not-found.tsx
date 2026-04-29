import Link from "next/link";
import { headers } from "next/headers";

function detectLocaleFromPath(): "ar" | "en" {
  try {
    const headersList = headers();
    const referer = headersList.get("referer") ?? "";
    const pathname = headersList.get("x-invoke-path") ?? referer;
    return pathname.includes("/en") ? "en" : "ar";
  } catch {
    return "ar";
  }
}

export default function LocaleNotFound() {
  const locale = detectLocaleFromPath();
  const isAr = locale === "ar";

  return (
    <main
      dir={isAr ? "rtl" : "ltr"}
      className="min-h-[80vh] flex items-center justify-center px-6"
    >
      <div className="text-center max-w-md">
        <p className="text-8xl font-display font-bold text-brand-primary/20 mb-4 select-none">
          404
        </p>
        <h1 className="font-display text-3xl font-bold mb-3 text-white">
          {isAr ? "الصفحة غير موجودة" : "Page Not Found"}
        </h1>
        <p className="text-white/55 mb-8 leading-relaxed text-sm">
          {isAr
            ? "الصفحة التي تبحث عنها غير موجودة أو تم نقلها. جرّب البحث عن رحلتك."
            : "The page you're looking for doesn't exist or has been moved. Try searching for your trip instead."}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/${locale}/search`}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-primary/90"
          >
            {isAr ? "🔍 ابحث عن رحلة" : "🔍 Search for Trips"}
          </Link>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3 text-sm font-medium text-white/70 transition hover:border-white/30 hover:text-white"
          >
            {isAr ? "→ الرئيسية" : "← Go Home"}
          </Link>
        </div>
      </div>
    </main>
  );
}
