import { NextRequest } from "next/server";

import { jsonOk } from "@/lib/api/http";
import { parseDealFiltersFromSearchParams } from "@/lib/api/parse-deal-filters";
import { prisma } from "@/lib/prisma";
import { getDeals } from "@/services/deals";
import type { DealFilters } from "@/services/deals/types";

async function runSearch(filters: DealFilters, queryForLog: string) {
  const { deals, source } = await getDeals(filters);
  if (prisma && queryForLog) {
    try {
      await prisma.searchQuery.create({
        data: {
          query: queryForLog,
          resultCount: deals.length,
        },
      });
    } catch {
      /* optional */
    }
  }
  return { deals, source };
}

/** Query-string search — same filters as GET /api/deals plus `q`. */
export async function GET(req: NextRequest) {
  const filters = parseDealFiltersFromSearchParams(req.nextUrl.searchParams);
  const q = filters.q?.trim() ?? "";
  const { deals, source } = await runSearch(filters, q);
  return jsonOk(source, { deals, query: q }, { count: deals.length });
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as {
    query?: string;
    brand?: string;
    category?: string;
    minDiscount?: number;
    sort?: DealFilters["sort"];
  };

  const query = body.query?.trim() ?? "";
  const { deals, source } = await runSearch(
    {
      q: query || undefined,
      brand: body.brand,
      category: body.category,
      minDiscount: body.minDiscount,
      sort: body.sort,
    },
    query
  );

  return jsonOk(source, { deals, query }, { count: deals.length });
}
