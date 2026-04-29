import { NextRequest, NextResponse } from "next/server";
import { triggerUnsplashDownload } from "@/lib/unsplash";

/**
 * POST /api/unsplash/download
 * Body: { downloadLocation: string }
 *
 * Called by the client when a user "uses" an Unsplash photo (views destination,
 * selects a hotel image, etc.). Required by Unsplash API guidelines.
 */
export async function POST(req: NextRequest) {
  try {
    const { downloadLocation } = (await req.json()) as { downloadLocation?: string };
    if (!downloadLocation || typeof downloadLocation !== "string") {
      return NextResponse.json({ error: "missing downloadLocation" }, { status: 400 });
    }
    // Validate it's actually an Unsplash URL for security
    if (!downloadLocation.startsWith("https://api.unsplash.com/")) {
      return NextResponse.json({ error: "invalid url" }, { status: 400 });
    }
    await triggerUnsplashDownload(downloadLocation);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }
}
