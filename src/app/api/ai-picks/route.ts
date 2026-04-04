import { jsonOk } from "@/lib/api/http";
import { buildAiPicksGroups } from "@/services/deals/aiPicksGroups";
import { getDeals } from "@/services/deals";

export async function GET() {
  const { deals, source } = await getDeals({ sort: "ai_score" });
  const groups = buildAiPicksGroups(deals);
  return jsonOk(source, { groups, deals }, { count: deals.length });
}
