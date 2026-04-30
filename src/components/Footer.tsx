import Link from "next/link";
import { Plane, BedDouble, Car, Ticket, Wallet, Headphones } from "lucide-react";
import { Logo } from "./Logo";
import { PaymentMethods } from "./PaymentMethods";
import type { Dictionary } from "@/i18n/get-dictionary";
import type { Locale } from "@/i18n/config";

const MARKER = process.env.NEXT_PUBLIC_TRAVELPAYOUTS_MARKER ?? "522867";

export function Footer({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  const legalBase = `/${locale}`;

  // Each service icon links to its natural destination
  const serviceLinks = [
    { Icon: Plane,       href: `/${locale}/search#flights`,  label: dict.nav.flights  },
    { Icon: BedDouble,   href: `/${locale}/search#hotels`,   label: dict.nav.hotels   },
    { Icon: Car,         href: `https://www.discovercars.com/?a_aid=${MARKER}`, label: "Car Rentals", external: true },
    { Icon: Ticket,      href: `/${locale}/destinations`,    label: locale === "ar" ? "الوجهات" : "Destinations" },
    { Icon: Wallet,      href: `/${locale}/disclosure`,      label: locale === "ar" ? "الإفصاح" : "Disclosure" },
    { Icon: Headphones,  href: `/${locale}/contact`,         label: locale === "ar" ? "الدعم" : "Support" },
  ];

  return (
    <footer className="relative mt-12">
      <div className="relative overflow-hidden rounded-t-3xl border-t border-white/5 bg-ink-950">
        <div className="absolute inset-0 -z-0 bg-[radial-gradient(ellipse_at_top,rgba(90,108,255,0.18),transparent_60%)]" />

        <div className="relative mx-auto flex max-w-7xl flex-col items-center gap-6 px-6 py-8 md:flex-row md:justify-between">
          <div className="flex items-center gap-5">
            <Logo />
            <span className="hidden font-display text-lg text-white/80 md:inline">
              {dict.footer.tagline}
            </span>
          </div>
          <div className="flex items-center gap-2 text-white/70">
            {serviceLinks.map(({ Icon, href, label, external }) =>
              external ? (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={label}
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:border-brand-primary/40 hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </a>
              ) : (
                <Link
                  key={href}
                  href={href}
                  title={label}
                  aria-label={label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 transition hover:border-brand-primary/40 hover:bg-white/10 hover:text-white"
                >
                  <Icon className="h-4 w-4" strokeWidth={1.5} />
                </Link>
              )
            )}
          </div>
        </div>

        <div className="relative mx-auto max-w-7xl border-t border-white/5 px-6 py-6">
          <PaymentMethods dict={dict} variant="row" />
        </div>

        <div className="relative mx-auto max-w-7xl border-t border-white/5 px-6 py-5">
          <p className="text-center text-[11px] leading-relaxed text-white/50">
            <span className="font-semibold text-white/70">
              {dict.footer.affiliateTitle}:
            </span>{" "}
            {dict.footer.affiliate}
          </p>
        </div>

        <div className="border-t border-white/5">
          <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-4 text-xs text-white/40 sm:flex-row">
            <span>© {new Date().getFullYear()} GoTripza · {dict.footer.rights}</span>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
              <Link href={`${legalBase}/about`} className="hover:text-white/70">
                {dict.footer.about}
              </Link>
              <Link href={`${legalBase}/contact`} className="hover:text-white/70">
                {dict.footer.contact}
              </Link>
              <Link href={`${legalBase}/disclosure`} className="hover:text-white/70">
                {dict.footer.affiliateDisclosure}
              </Link>
              <Link href={`${legalBase}/privacy`} className="hover:text-white/70">
                {dict.footer.privacy}
              </Link>
              <Link href={`${legalBase}/terms`} className="hover:text-white/70">
                {dict.footer.terms}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
