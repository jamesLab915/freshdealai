import { NextRequest, NextResponse } from "next/server";

import { parseNaturalLanguageDealQuery } from "@/services/ai/parseSearchQuery";

/**
 * POST { "query": "nike shoes under 100" } → structured filters (OpenAI when configured).
 */
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { query?: string };
  const query = body.query?.trim() ?? "";
  if (!query) {
    return NextResponse.json(
      {
        ok: false,
        error: "query required",
        structured: {
          brand: null,
          category: null,
          store: null,
          maxPrice: null,
          minDiscount: null,
          intent: "browse",
        },
      },
      { status: 400 }
    );
  }

  const structured = await parseNaturalLanguageDealQuery(query);
  return NextResponse.json({
    ok: true,
    query,
    structured: {
      brand: structured.brand,
      category: structured.category,
      store: structured.store,
      maxPrice: structured.maxPrice,
      minDiscount: structured.minDiscount,
      intent: structured.intent,
    },
  });
}
