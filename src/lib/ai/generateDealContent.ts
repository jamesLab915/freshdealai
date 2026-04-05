import type { FetchedDeal } from "@/lib/deals/fetchDeals";

import type { GeneratedDealContent } from "@/lib/ai/deal-content-types";
import { fillMissingDealCopy } from "@/services/ai/fillMissingDealCopy";

export type { GeneratedDealContent } from "@/lib/ai/deal-content-types";

/**
 * @deprecated Prefer `fillMissingDealCopy` with existing DB fields from persist.
 * Kept for compatibility — forwards to the same path with no prior copy.
 */
export async function generateDealContent(
  deal: FetchedDeal
): Promise<GeneratedDealContent> {
  return fillMissingDealCopy(deal, null);
}
