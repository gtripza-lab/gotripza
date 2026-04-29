"use client";

import { useEffect } from "react";
import type { UnsplashPhoto } from "@/lib/unsplash";

interface Props {
  photo: UnsplashPhoto;
  /** If true, trigger the Unsplash download event (use when photo is prominently displayed) */
  triggerDownload?: boolean;
  className?: string;
}

/**
 * Renders the required Unsplash attribution overlay and optionally
 * fires the download trigger per Unsplash API guidelines.
 *
 * Usage:
 *   <UnsplashAttribution photo={photo} triggerDownload />
 */
export function UnsplashAttribution({ photo, triggerDownload = false, className }: Props) {
  // Trigger download event once when the component mounts
  useEffect(() => {
    if (!triggerDownload || !photo.downloadLocation) return;
    fetch("/api/unsplash/download", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ downloadLocation: photo.downloadLocation }),
    }).catch(() => {/* fire-and-forget */});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [photo.id]);

  if (!photo.url || !photo.photographer) return null;

  return (
    <a
      href={photo.link}
      target="_blank"
      rel="noopener noreferrer"
      dir="ltr"
      className={[
        "absolute bottom-2 end-2 z-10 rounded-full bg-black/40 px-2.5 py-1 text-[10px]",
        "text-white/70 hover:text-white hover:bg-black/60 transition backdrop-blur-sm",
        "leading-none whitespace-nowrap",
        className ?? "",
      ].join(" ")}
      title={`Photo by ${photo.photographer} on Unsplash`}
    >
      {/* Per Unsplash guidelines: link photographer + Unsplash */}
      Photo by{" "}
      <a
        href={photo.photographerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {photo.photographer}
      </a>{" "}
      on{" "}
      <a
        href="https://unsplash.com?utm_source=gotripza&utm_medium=referral"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        Unsplash
      </a>
    </a>
  );
}
