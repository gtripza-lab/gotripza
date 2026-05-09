"use client";

import { useEffect } from "react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Admin Error]", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="text-4xl font-bold text-red-400/40">!</p>
      <h2 className="text-lg font-semibold text-white">Something went wrong</h2>
      <p className="max-w-sm text-sm text-white/40">
        {error.message || "An unexpected error occurred in the admin console."}
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-xl bg-brand-primary/20 px-5 py-2 text-sm font-medium text-brand-primary transition hover:bg-brand-primary/30"
      >
        Try again
      </button>
    </div>
  );
}
