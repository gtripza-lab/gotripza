"use client";
import Link from "next/link";
import { ArrowRight, ArrowLeft } from "lucide-react";
import type { Locale } from "@/i18n/config";

type LinkItem = {
  href: string;
  label: string;
  icon?: string;
};

/**
 * Hub-and-spoke internal linking block.
 * Appears at the bottom of every SEO page to pass authority
 * and improve crawl depth.
 */
export function InternalLinks({
  title,
  links,
  locale,
}: {
  title: string;
  links: LinkItem[];
  locale: Locale;
}) {
  const isAr = locale === "ar";
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  if (!links.length) return null;

  return (
    <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/40">
        {title}
      </h3>
      <ul className="grid gap-2 sm:grid-cols-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="flex items-center gap-2 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-white/70 transition hover:border-brand-primary/30 hover:bg-brand-primary/5 hover:text-white"
            >
              {link.icon && <span className="text-base">{link.icon}</span>}
              <span className="flex-1">{link.label}</span>
              <Arrow className="h-3.5 w-3.5 shrink-0 text-white/30" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Breadcrumb nav for SEO pages */
export function SeoBreadcrumb({
  items,
  locale,
}: {
  items: { label: string; href?: string }[];
  locale: Locale;
}) {
  const isAr = locale === "ar";
  return (
    <nav
      dir={isAr ? "rtl" : "ltr"}
      className="flex flex-wrap items-center gap-1 text-xs text-white/40"
      aria-label="breadcrumb"
    >
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <span>/</span>}
          {item.href ? (
            <Link href={item.href} className="hover:text-white/70 transition">
              {item.label}
            </Link>
          ) : (
            <span className="text-white/70">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
