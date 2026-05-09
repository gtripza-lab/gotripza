import { redirect } from "next/navigation";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import "../globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata = {
  title: { template: "%s | GoTripza Admin", default: "GoTripza Admin" },
  robots: "noindex,nofollow",
};

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = isAdminAuthenticated();
  if (!authed) redirect("/en/admin");

  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${sans.variable} ${display.variable} antialiased font-sans bg-[#08080d] text-white`}
        suppressHydrationWarning
      >
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
