import type { DealFilters } from "@/services/deals/types";
import type { DealsFetchResult } from "@/services/deals/types";
import { loadDeals } from "@/services/deals/repository";

export async function getDeals(filters: DealFilters = {}): Promise<DealsFetchResult> {
  return loadDeals(filters);
}
