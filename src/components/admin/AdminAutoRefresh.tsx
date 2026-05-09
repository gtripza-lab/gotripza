"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * Invisible client component that calls router.refresh() every 60 seconds.
 * Drop it anywhere inside a Server Component page to make it auto-update.
 */
export function AdminAutoRefresh({ intervalMs = 60_000 }: { intervalMs?: number }) {
  const router = useRouter();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      router.refresh();
    }, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [router, intervalMs]);

  return null;
}
