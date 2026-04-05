import { NextResponse } from "next/server";

import { runDealEngine } from "@/lib/deal-engine/runDealEngine";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/** POST — same engine as cron; protected by admin Basic Auth middleware. */
export async function POST() {
  const result = await runDealEngine();
  return NextResponse.json({
    success: result.ok,
    data: {
      inserted: result.metrics.inserted,
      updated: result.metrics.updated,
      skipped: result.metrics.skipped,
      errors: result.metrics.errors,
      message: result.message,
    },
  });
}
