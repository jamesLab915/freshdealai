import { NextRequest, NextResponse } from "next/server";

import { runResponsesJsonWithFallback } from "@/lib/openai/responses";
import { getDeals } from "@/services/deals";

const schema = {
  name: "search_assistant_answer",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      answer: { type: "string" },
      suggested_filters: {
        type: "object",
        additionalProperties: false,
        properties: {
          brand: { type: "string" },
          category: { type: "string" },
          minDiscount: { type: "number" },
        },
      },
      product_slugs: {
        type: "array",
        items: { type: "string" },
        maxItems: 8,
      },
    },
    required: ["answer", "suggested_filters", "product_slugs"],
  },
  strict: true,
} as const;

type AnswerShape = {
  answer: string;
  suggested_filters: {
    brand?: string;
    category?: string;
    minDiscount?: number;
  };
  product_slugs: string[];
};

export async function POST(req: NextRequest) {
  const { question } = (await req.json().catch(() => ({}))) as {
    question?: string;
  };
  if (!question?.trim()) {
    return NextResponse.json({ error: "question required" }, { status: 400 });
  }

  const { deals } = await getDeals({ sort: "ai_score" });
  const catalog = deals.slice(0, 24).map((d) => ({
    slug: d.slug,
    title: d.title,
    brand: d.brand,
    category: d.category,
    discountPercent: d.discountPercent,
    aiScore: d.aiScore,
  }));

  const res = await runResponsesJsonWithFallback<AnswerShape>({
    tier: "quality",
    instructions:
      "You help users navigate a US deals site. Use only the catalog JSON; if unsure, say so. No medical/legal/financial advice.",
    input: JSON.stringify({ question, catalog }),
    jsonSchema: schema,
    fallbackTier: "fast",
  });

  if (!res.ok) {
    return NextResponse.json({
      answer:
        "AI is offline or misconfigured. Try browsing /deals or set OPENAI_API_KEY.",
      suggested_filters: {},
      product_slugs: [],
      error: res.error,
    });
  }

  return NextResponse.json(res.parsed);
}
