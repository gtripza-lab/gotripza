"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function ReferralTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const code =
      searchParams.get("ref") ||
      searchParams.get("partner") ||
      searchParams.get("via") ||
      searchParams.get("referral");
    if (!code) return;

    const payload = {
      code,
      path: `${pathname}${window.location.search}`,
      source: searchParams.get("utm_source") || "url_ref",
      campaign: searchParams.get("utm_campaign") || "partners",
    };

    try {
      window.localStorage.setItem("rya_partner_ref", JSON.stringify(payload));
    } catch {
      /* ignore */
    }

    void fetch("/api/partners/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    });
  }, [pathname, searchParams]);

  return null;
}
