/**
 * Digest-only JSON (DigestBundleV1) for quick checks — no full distribution items.
 * Usage: `npx tsx scripts/reportDigestProjections.ts`
 */
import "dotenv/config";

import { toDigestBundleV1 } from "../src/lib/distribution/digest-projection";
import {
  buildBestDealsDistributionBundle,
  buildCategoryDistributionBundle,
  buildHomepageFeaturedDistributionBundle,
} from "../src/lib/distribution/bundles";

const DEFAULT_CATEGORY = "electronics";

async function main(): Promise<void> {
  const category =
    process.env.DISTRIBUTION_SAMPLE_CATEGORY?.trim() || DEFAULT_CATEGORY;

  const [featured, best, cat] = await Promise.all([
    buildHomepageFeaturedDistributionBundle(),
    buildBestDealsDistributionBundle(),
    buildCategoryDistributionBundle(category),
  ]);

  const out = {
    generated_at: new Date().toISOString(),
    homepage_featured: toDigestBundleV1(featured),
    best_deals: toDigestBundleV1(best),
    [`category_${category}`]: toDigestBundleV1(cat),
  };

  console.log(JSON.stringify(out, null, 2));
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
