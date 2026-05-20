import { NextResponse } from "next/server";
import { getSeoInventory } from "@/lib/seo-inventory";
import { getSeoPublishPolicy } from "@/lib/seo-publish-policy";

export function GET() {
  return NextResponse.json({
    generatedAt: new Date().toISOString(),
    publishPolicy: getSeoPublishPolicy(),
    inventory: getSeoInventory(),
  });
}
