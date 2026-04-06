/**
 * Print distribution bundles (homepage featured, best deals, sample category).
 * Usage: `npx tsx scripts/reportDistributionBundles.ts`
 */
import "dotenv/config";

import {
  buildBestDealsDistributionBundle,
  buildCategoryDistributionBundle,
  buildHomepageFeaturedDistributionBundle,
} from "../src/lib/distribution/bundles";
import { toDigestBundleV1 } from "../src/lib/distribution/digest-projection";

const DEFAULT_CATEGORY = "electronics";

async function printBundle(label: string, json: unknown): Promise<void> {
  console.log("\n" + "=".repeat(80));
  console.log(label);
  console.log("=".repeat(80));
  console.log(JSON.stringify(json, null, 2));
}

async function main(): Promise<void> {
  const category =
    process.env.DISTRIBUTION_SAMPLE_CATEGORY?.trim() || DEFAULT_CATEGORY;

  const [featured, best, cat] = await Promise.all([
    buildHomepageFeaturedDistributionBundle(),
    buildBestDealsDistributionBundle(),
    buildCategoryDistributionBundle(category),
  ]);

  await printBundle(
    "1) Homepage featured (manual pins, same filters as pickHomepageFeaturedManualOnly)",
    featured
  );
  await printBundle(
    '2) Best deals (collection "best-deals")',
    best
  );
  await printBundle(
    `3) Category (preset "${category}" — set DISTRIBUTION_SAMPLE_CATEGORY to override)`,
    cat
  );

  console.log("\n" + "=".repeat(80));
  console.log("4) Digest projections only (DigestBundleV1 — email / Telegram / brief)");
  console.log("=".repeat(80));
  console.log(
    JSON.stringify(
      {
        homepage_featured: toDigestBundleV1(featured),
        best_deals: toDigestBundleV1(best),
        [`category_${category}`]: toDigestBundleV1(cat),
      },
      null,
      2
    )
  );

  console.log("\n[distribution:report] done.\n");
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
