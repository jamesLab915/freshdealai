/**
 * Sample credibility audit + feed projection for local verification.
 * Uses the same deal source as the app (`getDeals` → DB or mock catalog).
 *
 * Usage: `npx tsx scripts/reportDealCredibilitySamples.ts`
 */
import "dotenv/config";

import {
  deriveDealCredibilityAudit,
  toDealCredibilityFeedItem,
} from "../src/lib/deal-credibility";
import { getDeals } from "../src/services/deals/getDeals";

const DEFAULT_LIMIT = 8;

async function main(): Promise<void> {
  const limit = Number(process.env.CREDIBILITY_SAMPLE_LIMIT ?? DEFAULT_LIMIT);
  const take = Number.isFinite(limit) && limit > 0 ? Math.min(limit, 50) : DEFAULT_LIMIT;

  const { deals, source } = await getDeals({ sort: "ai_score" });
  const slice = deals.slice(0, take);

  console.log(
    `[credibility:samples] catalog_source=${source} available=${deals.length} printing=${slice.length}\n`
  );

  for (const deal of slice) {
    const audit = deriveDealCredibilityAudit(deal);
    const feed = toDealCredibilityFeedItem(deal);

    console.log("—".repeat(76));
    console.log(`slug: ${deal.slug}`);
    console.log(`title: ${deal.title}`);
    console.log("\nfeed (JSON):");
    console.log(JSON.stringify(feed, null, 2));
    console.log("\naudit (JSON):");
    console.log(JSON.stringify(audit, null, 2));
    console.log("");
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
