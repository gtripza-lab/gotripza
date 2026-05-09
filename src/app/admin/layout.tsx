import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export const metadata = {
  title: { template: "%s | GoTripza Admin", default: "GoTripza Admin" },
  robots: "noindex,nofollow",
};

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const authed = isAdminAuthenticated();
  if (!authed) redirect("/en/admin");
  return <AdminShell>{children}</AdminShell>;
}
