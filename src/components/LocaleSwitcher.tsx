"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { localeMeta, locales, type Locale } from "@/i18n/config";
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
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const localePattern = new RegExp(`^/(${locales.join("|")})(?=/|$)`);
  const stripped = pathname.replace(localePattern, "") || "";

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={cn(
          "inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-2.5 backdrop-blur-md transition",
          overDark
            ? "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
            : "border border-white/70 bg-white/60 text-ink-950/70 shadow-sm hover:bg-white/80",
        )}
        aria-label="Choose language"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Globe className="h-4 w-4" />
        <span className="text-[11px] font-semibold uppercase">{current}</span>
      </button>

      {open ? (
        <div
          role="menu"
          className={cn(
            "absolute end-0 top-11 z-[80] grid w-64 grid-cols-2 gap-1 rounded-2xl p-2 shadow-2xl backdrop-blur-xl",
            "max-h-[70vh] overflow-y-auto border",
            overDark
              ? "border-white/10 bg-[#111118]/95 text-white"
              : "border-ink-950/10 bg-white/95 text-ink-950",
          )}
        >
          {locales.map((locale) => {
            const href = `/${locale}${stripped}`;
            const active = locale === current;
            return (
              <Link
                key={locale}
                href={href}
                role="menuitem"
                onClick={() => setOpen(false)}
                className={cn(
                  "flex min-h-10 items-center justify-between gap-2 rounded-xl px-3 py-2 text-sm transition",
                  active
                    ? overDark
                      ? "bg-white/12 text-white"
                      : "bg-ink-950 text-white"
                    : overDark
                      ? "text-white/72 hover:bg-white/8 hover:text-white"
                      : "text-ink-950/72 hover:bg-ink-950/6 hover:text-ink-950",
                )}
              >
                <span className="truncate">{localeMeta[locale].label}</span>
                <span className="text-[10px] font-semibold uppercase opacity-60">{locale}</span>
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
