"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, BookOpen, Phone } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export function BottomNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const isAr = locale === "ar";

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
      href: `/${locale}/blog`,
      icon: BookOpen,
      label: isAr ? "دليل" : "Guide",
    },
    {
      href: `/${locale}/contact`,
      icon: Phone,
      label: isAr ? "تواصل" : "Contact",
    },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 flex md:hidden border-t border-white/5 bg-[#0d0d12]/90 backdrop-blur-xl">
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
