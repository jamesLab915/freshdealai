export { buildDistributionItem } from "@/lib/distribution/distribution-item";
export type { BuildDistributionItemMeta } from "@/lib/distribution/distribution-item";
export {
  buildBestDealsDistributionBundle,
  buildCategoryDistributionBundle,
  buildHomepageFeaturedDistributionBundle,
} from "@/lib/distribution/bundles";
export { summarizeDistributionItems } from "@/lib/distribution/bundle-summary";
export { toDigestBundleV1, toDigestItemV1 } from "@/lib/distribution/digest-projection";
