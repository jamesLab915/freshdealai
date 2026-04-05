import { type NextRequest, NextResponse } from "next/server";

import { runDealEngine } from "@/lib/deal-engine/runDealEngine";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isProduction(): boolean {
  return (
    process.env.VERCEL_ENV === "production" ||
    process.env.NODE_ENV === "production"
  );
}

/**
 * Vercel Cron — requires `Authorization: Bearer <CRON_SECRET>` or `x-vercel-cron: 1`.
 * In production, anonymous requests are always rejected.
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  const auth = req.headers.get("authorization");
  const vercelCron = req.headers.get("x-vercel-cron");

  const bearerOk = Boolean(secret && auth === `Bearer ${secret}`);
  const fromVercelCron = vercelCron === "1";
  const devLoose = !isProduction() && !secret;

  const authorized = fromVercelCron || bearerOk || devLoose;

  if (!authorized) {
    console.warn("[cron/deal-engine] rejected", {
      isProd: isProduction(),
      hasSecret: Boolean(secret),
      hasVercelCron: fromVercelCron,
    });
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const result = await runDealEngine();

  console.log("[cron/deal-engine] completed", {
    inserted: result.metrics.inserted,
    updated: result.metrics.updated,
    skipped: result.metrics.skipped,
    errorCount: result.metrics.errors.length,
    ok: result.ok,
  });

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
