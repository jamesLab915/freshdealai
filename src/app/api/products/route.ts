import { NextRequest } from "next/server";

import { jsonOk } from "@/lib/api/http";
import { parseDealFiltersFromSearchParams } from "@/lib/api/parse-deal-filters";
import { getDeals } from "@/services/deals";

/** @deprecated Prefer GET /api/deals — same payload shape (unified envelope). */
export async function GET(req: NextRequest) {
  const filters = parseDealFiltersFromSearchParams(req.nextUrl.searchParams);
  const { deals, source } = await getDeals(filters);
  return jsonOk(source, { deals }, { count: deals.length, filters });
}
