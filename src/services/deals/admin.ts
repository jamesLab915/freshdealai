import { loadAllDealsForAdmin } from "@/services/deals/repository";
import type { DealProduct } from "@/types/deal";

export async function getDealsForAdmin(): Promise<DealProduct[]> {
  return loadAllDealsForAdmin();
}
