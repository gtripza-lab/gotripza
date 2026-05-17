"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, CalendarDays, Phone } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export function BottomNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const isAr = locale === "ar";
  const isSearchPage = pathname === `/${locale}/search`;
  const isAdsLandingPage = pathname === `/${locale}/rya`;

  const items = [
    {
      href: `/${locale}`,
      icon: Home,
      label: isAr ? "الرئيسية" : "Home",
    },
    {
      href: `/${locale}/search`,
      icon: Search,
      label: isAr ? "بحث" : "Search",
    },
    {
      href: `/${locale}/plan`,
      icon: CalendarDays,
      label: isAr ? "خطتي" : "Plan",
    },
    {
      href: `/${locale}/contact`,
      icon: Phone,
      label: isAr ? "تواصل" : "Contact",
    },
  ];

  if (isSearchPage || isAdsLandingPage) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 flex w-[100dvw] max-w-[100dvw] overflow-hidden border-t border-white/5 bg-[#0d0d12]/90 backdrop-blur-xl md:hidden">
      {items.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || (href !== `/${locale}` && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 py-3 text-[10px] font-medium transition",
              active ? "text-brand-primary" : "text-white/35 hover:text-white/60",
            )}
          >
            <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_rgba(90,108,255,0.55)]")} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
