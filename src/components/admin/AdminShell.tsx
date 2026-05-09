"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Bot,
  MessageSquare,
  Search,
  Users,
  DollarSign,
  BarChart2,
  FileText,
  HeadphonesIcon,
  Activity,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  AlertCircle,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard",     label: "Dashboard",       icon: LayoutDashboard },
  { href: "/admin/ai",            label: "AI Control",      icon: Bot },
  { href: "/admin/conversations", label: "Conversations",   icon: MessageSquare },
  { href: "/admin/search",        label: "Search & Clicks", icon: Search },
  { href: "/admin/users",         label: "Users",           icon: Users },
  { href: "/admin/costs",         label: "Cost Center",     icon: DollarSign },
  { href: "/admin/analytics",     label: "Analytics",       icon: BarChart2 },
  { href: "/admin/content",       label: "Content",         icon: FileText },
  { href: "/admin/support",       label: "Support",         icon: HeadphonesIcon },
  { href: "/admin/observability", label: "Observability",   icon: Activity },
  { href: "/admin/settings",      label: "Settings",        icon: Settings },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/admin-login", { method: "DELETE" });
    router.push("/en/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-[#08080d] text-white">
      {/* ── Sidebar ───────────────────────────────────────────────── */}
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-40 flex w-60 flex-col border-r border-white/[0.06] bg-[#0d0d14]",
          "transition-transform duration-200 lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-white/[0.06]">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-primary/20">
            <AlertCircle className="h-4 w-4 text-brand-primary" />
          </div>
          <div>
            <p className="text-[13px] font-bold text-white">GoTripza</p>
            <p className="text-[10px] text-white/30 uppercase tracking-widest">Ops Console</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={[
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] font-medium transition-all",
                      active
                        ? "bg-brand-primary/15 text-brand-primary"
                        : "text-white/50 hover:bg-white/[0.05] hover:text-white/80",
                    ].join(" ")}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                    {active && <ChevronRight className="ml-auto h-3 w-3 opacity-60" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-white/[0.06] p-3">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-white/40 transition hover:bg-white/[0.05] hover:text-white/70"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col lg:pl-60">
        {/* Top bar */}
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-white/[0.06] bg-[#08080d]/80 px-5 backdrop-blur">
          <button
            className="lg:hidden text-white/40 hover:text-white/70 transition"
            onClick={() => setOpen(!open)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <div className="hidden lg:block">
            <span className="text-[12px] text-white/25 uppercase tracking-widest">
              {NAV_ITEMS.find((n) => pathname.startsWith(n.href))?.label ?? "Admin"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
              Live
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-x-hidden p-5 lg:p-7">{children}</main>
      </div>
    </div>
  );
}
