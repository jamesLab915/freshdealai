import { IngestionStatus, ProductSource } from "@/generated/prisma/enums";
import { backfillIncompleteProductPrices } from "@/lib/deal-engine/backfillPrices";
import {
  syncCategoriesFromProducts,
  upsertProductFromFetched,
} from "@/lib/deal-engine/persist";
import { fetchDeals } from "@/lib/deals/fetchDeals";
import { hasDatabase } from "@/lib/prisma";
import { prisma } from "@/lib/prisma";

export type RunDealEngineMetrics = {
  inserted: number;
  updated: number;
  skipped: number;
  errors: { reason: string; detail?: string }[];
};

export type RunDealEngineResult = {
  ok: boolean;
  metrics: RunDealEngineMetrics;
  message: string;
};

/**
 * Fetch → AI content (only when copy missing) → upsert → category rollups + job log.
 */
export async function runDealEngine(): Promise<RunDealEngineResult> {
  const metrics: RunDealEngineMetrics = {
    inserted: 0,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  if (!hasDatabase() || !prisma) {
    return {
      ok: true,
      metrics,
      message: "DATABASE_URL is not set — deal engine persistence skipped.",
    };
  }

  const startedAt = new Date();
  let deals: Awaited<ReturnType<typeof fetchDeals>>;
  try {
    deals = await fetchDeals();
  } catch (e) {
    const msg = e instanceof Error ? e.message : "fetch_failed";
    metrics.errors.push({ reason: "fetch_deals", detail: msg });
    return {
      ok: false,
      metrics,
      message: `Failed to fetch deals: ${msg}`,
    };
  }

  for (const deal of deals) {
    const outcome = await upsertProductFromFetched(deal);
    switch (outcome.kind) {
      case "inserted":
        metrics.inserted += 1;
        break;
      case "updated":
        metrics.updated += 1;
        break;
      case "skipped":
        metrics.skipped += 1;
        break;
      case "error":
        metrics.errors.push({
          reason: "persist",
          detail: outcome.message,
        });
        break;
      default:
        break;
    }
  }

  try {
    await syncCategoriesFromProducts();
  } catch (e) {
    metrics.errors.push({
      reason: "sync_categories",
      detail: e instanceof Error ? e.message : "unknown",
    });
  }

  try {
    await backfillIncompleteProductPrices();
  } catch (e) {
    metrics.errors.push({
      reason: "backfill_prices",
      detail: e instanceof Error ? e.message : "unknown",
    });
  }

  const finishedAt = new Date();
  const logPayload = {
    type: "deal_engine",
    startedAt: startedAt.toISOString(),
    finishedAt: finishedAt.toISOString(),
    ...metrics,
  };

  try {
    await prisma.ingestionJob.create({
      data: {
        source: ProductSource.MANUAL,
        status: IngestionStatus.SUCCESS,
        startedAt,
        finishedAt,
        logs: JSON.stringify(logPayload, null, 0),
      },
    });
  } catch (e) {
    console.warn("[deal-engine] Failed to write ingestion job log:", e);
  }

  const message = `Deal engine: inserted ${metrics.inserted}, updated ${metrics.updated}, skipped ${metrics.skipped}, errors ${metrics.errors.length}.`;

  if (typeof console !== "undefined" && console.log) {
    console.log(`[deal-engine] ${message}`, metrics);
  }

  return { ok: true, metrics, message };
}
