"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";
import { Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export function LocaleSwitcher({
  current,
  overDark = false,
}: {
  current: Locale;
  overDark?: boolean;
}) {
  const pathname = usePathname() ?? "/";
  const next = locales.find((l) => l !== current) ?? "en";
  const stripped = pathname.replace(/^\/(ar|en)(?=\/|$)/, "");
  const href = `/${next}${stripped || ""}`;

  return (
    <Link
      href={href}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full backdrop-blur-md transition",
        overDark
          ? "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
          : "border border-white/70 bg-white/60 text-ink-950/70 shadow-sm hover:bg-white/80",
      )}
      aria-label="Switch language"
    >
      <Globe className="h-4 w-4" />
    </Link>
  );
}
