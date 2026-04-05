export type { DealFilters, DealSort, DealsFetchResult } from "@/services/deals/types";
export { buildAiPicksGroups } from "@/services/deals/aiPicksGroups";
export {
  getCollectionPreset,
  listCollectionPresets,
  loadCollectionPageData,
} from "@/services/deals/collections";
export { getDeals } from "@/services/deals/getDeals";
export {
  getCheaperAlternatives,
  getComparableDeals,
  getDealById,
  getDealBySlug,
  getDealBySlugWithSource,
  getDealEngagementStat,
  getEngagementStatsForProductIds,
  getMoreFromBrand,
  getRelatedDeals,
} from "@/services/deals/getDealBySlug";
export { searchDeals } from "@/services/deals/searchDeals";
export { getCategories, getBrands, getStores } from "@/services/deals/catalog";
export { getDealsForAdmin } from "@/services/deals/admin";

/** Back-compat alias used in older routes */
export { getDeals as fetchDeals } from "@/services/deals/getDeals";
export {
  getDealById as fetchDealById,
  getDealBySlug as fetchDealBySlug,
} from "@/services/deals/getDealBySlug";
export { getDealsForAdmin as fetchDealsForAdmin } from "@/services/deals/admin";
