/**
 * @deprecated Import from `@/services/deals` instead.
 * Re-exports preserve backward compatibility for API routes.
 */
export type { DealFilters, DealSort, DealsFetchResult } from "@/services/deals/types";
export {
  fetchDeals,
  fetchDealBySlug,
  fetchDealsForAdmin,
  getBrands,
  getCategories,
  getDeals,
  getDealBySlug,
  getDealsForAdmin,
  getRelatedDeals,
  getStores,
  searchDeals,
} from "@/services/deals";
