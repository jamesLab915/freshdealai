import type { DealFilters } from "@/services/deals/types";
import type { DealsFetchResult } from "@/services/deals/types";
import { loadDeals } from "@/services/deals/repository";

/** Keyword search + filters — same pipeline as `getDeals`. */
export async function searchDeals(
  query: string | undefined,
  filters: Omit<DealFilters, "q"> = {}
): Promise<DealsFetchResult> {
  return loadDeals({
    ...filters,
    q: query?.trim() || undefined,
  });
}
