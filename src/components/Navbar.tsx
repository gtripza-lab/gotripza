"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { cn } from "@/lib/utils";
import { AuthModal } from "./AuthModal";

const navCopy: Partial<Record<Locale, {
  planner: string;
  destinations: string;
  services: string;
  companion: string;
  worldCup: string;
  account: string;
}>> = {
  ar: { planner: "خطط رحلتي", destinations: "الوجهات", services: "احتياجات المسافر", companion: "Rya Companion", worldCup: "كأس العالم 2026", account: "حسابي" },
  en: { planner: "Trip Planner", destinations: "Destinations", services: "Traveler Services", companion: "Rya Companion", worldCup: "World Cup 2026", account: "Account" },
  fr: { planner: "Planificateur", destinations: "Destinations", services: "Services voyage", companion: "Rya Companion", worldCup: "Coupe du Monde 2026", account: "Compte" },
  de: { planner: "Reiseplaner", destinations: "Reiseziele", services: "Reiseservices", companion: "Rya Companion", worldCup: "WM 2026", account: "Konto" },
  es: { planner: "Planificador", destinations: "Destinos", services: "Servicios de viaje", companion: "Rya Companion", worldCup: "Mundial 2026", account: "Cuenta" },
  it: { planner: "Pianificatore", destinations: "Destinazioni", services: "Servizi viaggio", companion: "Rya Companion", worldCup: "Mondiali 2026", account: "Account" },
  pt: { planner: "Planejador", destinations: "Destinos", services: "Serviços de viagem", companion: "Rya Companion", worldCup: "Copa 2026", account: "Conta" },
  ko: { planner: "여행 플래너", destinations: "목적지", services: "여행 서비스", companion: "Rya Companion", worldCup: "월드컵 2026", account: "계정" },
  ja: { planner: "旅行プランナー", destinations: "目的地", services: "旅行サービス", companion: "Rya Companion", worldCup: "W杯 2026", account: "アカウント" },
  zh: { planner: "行程规划", destinations: "目的地", services: "旅行服务", companion: "Rya Companion", worldCup: "世界杯 2026", account: "账户" },
  nl: { planner: "Reisplanner", destinations: "Bestemmingen", services: "Reisdiensten", companion: "Rya Companion", worldCup: "WK 2026", account: "Account" },
  tr: { planner: "Gezi planlayıcı", destinations: "Rotalar", services: "Seyahat hizmetleri", companion: "Rya Companion", worldCup: "Dünya Kupası 2026", account: "Hesabım" },
  hi: { planner: "ट्रिप प्लानर", destinations: "गंतव्य", services: "यात्रा सेवाएँ", companion: "Rya Companion", worldCup: "विश्व कप 2026", account: "खाता" },
  id: { planner: "Perencana trip", destinations: "Destinasi", services: "Layanan travel", companion: "Rya Companion", worldCup: "Piala Dunia 2026", account: "Akun" },
  ru: { planner: "Планировщик", destinations: "Направления", services: "Сервисы", companion: "Rya Companion", worldCup: "ЧМ 2026", account: "Аккаунт" },
  pl: { planner: "Plan podróży", destinations: "Kierunki", services: "Usługi podróżne", companion: "Rya Companion", worldCup: "MŚ 2026", account: "Konto" },
  th: { planner: "วางแผนทริป", destinations: "จุดหมาย", services: "บริการเดินทาง", companion: "Rya Companion", worldCup: "ฟุตบอลโลก 2026", account: "บัญชี" },
  vi: { planner: "Lập kế hoạch", destinations: "Điểm đến", services: "Dịch vụ du lịch", companion: "Rya Companion", worldCup: "World Cup 2026", account: "Tài khoản" },
  ms: { planner: "Perancang trip", destinations: "Destinasi", services: "Servis perjalanan", companion: "Rya Companion", worldCup: "Piala Dunia 2026", account: "Akaun" },
  sv: { planner: "Reseplanerare", destinations: "Destinationer", services: "Resetjänster", companion: "Rya Companion", worldCup: "VM 2026", account: "Konto" },
  no: { planner: "Reiseplanlegger", destinations: "Reisemål", services: "Reisetjenester", companion: "Rya Companion", worldCup: "VM 2026", account: "Konto" },
  da: { planner: "Rejseplanlægger", destinations: "Destinationer", services: "Rejsetjenester", companion: "Rya Companion", worldCup: "VM 2026", account: "Konto" },
};

export function Navbar({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const router = useRouter();
  const isAr = locale === "ar";
  const copy = navCopy[locale] ?? navCopy.en!;

  const items = [
    { label: dict.nav.flights,  href: `/${locale}/search#flights`  },
    { label: dict.nav.hotels,   href: `/${locale}/search#hotels`   },
    { label: copy.planner, href: `/${locale}/plan` },
    { label: copy.destinations, href: `/${locale}/destinations` },
    { label: copy.services, href: `/${locale}/services` },
    { label: copy.companion, href: `/${locale}/plus` },
    { label: copy.worldCup, href: `/${locale}/world-cup-2026` },
    { label: copy.account, href: `/${locale}/account` },
    { label: dict.nav.blog,     href: `/${locale}/blog`            },
  ];

  const [overDark, setOverDark]     = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [authOpen, setAuthOpen]     = useState(false);


  useEffect(() => {
    const onScroll = () => {
      setOverDark(window.scrollY > window.innerHeight * 0.7);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href={`/${locale}`}>
            <Logo />
          </Link>

          {/* Desktop nav */}
          <nav
            className={cn(
              "hidden items-center gap-1 rounded-full px-2 py-1.5 backdrop-blur-md md:flex transition-colors",
              overDark
                ? "border border-white/10 bg-white/[0.04]"
                : "border border-white/70 bg-white/60 shadow-sm",
            )}
          >
            {items.map((it) => (
              <a
                key={it.href}
                href={it.href}
                className={cn(
                  "rounded-full px-4 py-1.5 text-sm transition",
                  overDark
                    ? "text-white/80 hover:bg-white/10 hover:text-white"
                    : "text-ink-950/70 hover:bg-ink-950/5 hover:text-ink-950",
                )}
              >
                {it.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <LocaleSwitcher current={locale} overDark={overDark} />
            <button
              onClick={() => setAuthOpen(true)}
              className={cn(
                "hidden rounded-full px-4 py-2 text-sm md:inline-flex transition",
                overDark
                  ? "text-white/80 hover:text-white hover:bg-white/[0.06]"
                  : "text-ink-950/70 hover:text-ink-950 hover:bg-ink-950/5",
              )}
            >
                {dict.nav.signin}
              </button>
            <button
              onClick={() => router.push(`/${locale}/search`)}
              className="btn-primary !py-2 !text-sm hidden md:inline-flex"
            >
              {dict.nav.getStarted}
            </button>

            {/* Mobile hamburger */}
            <button
              className="md:hidden flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/80 hover:bg-white/10 transition"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
            />

            {/* Panel */}
            <motion.aside
              key="drawer"
              className={cn(
                "fixed top-0 z-50 flex h-full w-72 flex-col bg-[#0d0d12] border-white/10 px-6 py-8 shadow-2xl",
                isAr ? "right-0 border-l" : "left-0 border-r",
              )}
              initial={{ x: isAr ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: isAr ? "100%" : "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
            >
              <div className="flex items-center justify-between mb-8">
                <Logo />
                <button
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/70 hover:bg-white/10 transition"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <nav className="flex flex-col gap-1">
                {items.map((it) => (
                  <a
                    key={it.href}
                    href={it.href}
                    onClick={() => setDrawerOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm text-white/70 hover:bg-white/[0.06] hover:text-white transition"
                  >
                    {it.label}
                  </a>
                ))}
              </nav>

              <div className="mt-auto flex flex-col gap-3 pt-8">
                <LocaleSwitcher current={locale} overDark />
                <button
                  onClick={() => { setDrawerOpen(false); setAuthOpen(true); }}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.05] py-2.5 text-sm text-white/70 hover:bg-white/[0.09] transition"
                >
                  {dict.nav.signin}
                </button>
                <button
                  onClick={() => { setDrawerOpen(false); router.push(`/${locale}/search`); }}
                  className="btn-primary w-full !py-2.5 !text-sm"
                >
                  {dict.nav.getStarted}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} locale={locale} />
    </>
  );
}
