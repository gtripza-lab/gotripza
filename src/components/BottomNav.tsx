"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, CalendarDays, Phone } from "lucide-react";
import type { Locale } from "@/i18n/config";
import { cn } from "@/lib/utils";

const bottomNavCopy: Partial<Record<Locale, { home: string; search: string; plan: string; contact: string }>> = {
  ar: { home: "الرئيسية", search: "بحث", plan: "خطتي", contact: "تواصل" },
  en: { home: "Home", search: "Search", plan: "Plan", contact: "Contact" },
  fr: { home: "Accueil", search: "Recherche", plan: "Plan", contact: "Contact" },
  de: { home: "Start", search: "Suche", plan: "Plan", contact: "Kontakt" },
  es: { home: "Inicio", search: "Buscar", plan: "Plan", contact: "Contacto" },
  it: { home: "Home", search: "Cerca", plan: "Piano", contact: "Contatto" },
  pt: { home: "Início", search: "Buscar", plan: "Plano", contact: "Contato" },
  ko: { home: "홈", search: "검색", plan: "계획", contact: "문의" },
  ja: { home: "ホーム", search: "検索", plan: "計画", contact: "連絡" },
  zh: { home: "首页", search: "搜索", plan: "计划", contact: "联系" },
  nl: { home: "Home", search: "Zoeken", plan: "Plan", contact: "Contact" },
  tr: { home: "Ana sayfa", search: "Ara", plan: "Plan", contact: "İletişim" },
  hi: { home: "होम", search: "खोज", plan: "योजना", contact: "संपर्क" },
  id: { home: "Beranda", search: "Cari", plan: "Rencana", contact: "Kontak" },
  ru: { home: "Главная", search: "Поиск", plan: "План", contact: "Контакты" },
  pl: { home: "Start", search: "Szukaj", plan: "Plan", contact: "Kontakt" },
  th: { home: "หน้าแรก", search: "ค้นหา", plan: "แผน", contact: "ติดต่อ" },
  vi: { home: "Trang chủ", search: "Tìm", plan: "Kế hoạch", contact: "Liên hệ" },
  ms: { home: "Utama", search: "Cari", plan: "Pelan", contact: "Hubungi" },
  sv: { home: "Hem", search: "Sök", plan: "Plan", contact: "Kontakt" },
  no: { home: "Hjem", search: "Søk", plan: "Plan", contact: "Kontakt" },
  da: { home: "Hjem", search: "Søg", plan: "Plan", contact: "Kontakt" },
};

export function BottomNav({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const copy = bottomNavCopy[locale] ?? bottomNavCopy.en!;
  const isSearchPage = pathname === `/${locale}/search`;
  const isAdsLandingPage = pathname === `/${locale}/rya`;

  const items = [
    {
      href: `/${locale}`,
      icon: Home,
      label: copy.home,
    },
    {
      href: `/${locale}/search`,
      icon: Search,
      label: copy.search,
    },
    {
      href: `/${locale}/plan`,
      icon: CalendarDays,
      label: copy.plan,
    },
    {
      href: `/${locale}/contact`,
      icon: Phone,
      label: copy.contact,
    },
  ];

  if (isSearchPage || isAdsLandingPage) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 flex w-[100dvw] max-w-[100dvw] overflow-hidden border-t border-white/5 bg-[#0d0d12]/90 backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
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
