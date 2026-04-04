import { runResponsesJsonWithFallback } from "@/services/ai/client";
import { SCHEMA_SUMMARY } from "@/services/ai/schemas";

export type SummarizeProductResult = {
  summary: string;
  price_highlights: string[];
};

export async function summarizeProduct(payload: {
  title: string;
  brand?: string | null;
  current_price: number;
  original_price?: number | null;
  currency?: string;
}): Promise<SummarizeProductResult> {
  const res = await runResponsesJsonWithFallback<SummarizeProductResult>({
    tier: "fast",
    instructions:
      "Write factual, non-hype copy. Highlight concrete specs or use-cases implied by the title only.",
    input: JSON.stringify(payload),
    jsonSchema: SCHEMA_SUMMARY,
  });

  if (res.ok) return res.parsed;

  return {
    summary: `${payload.title} — check live price and seller policies before buying.`,
    price_highlights: [
      payload.original_price
        ? `Listed vs. reference: ${payload.currency ?? "USD"} ${payload.current_price} vs ${payload.original_price}`
        : `Current: ${payload.currency ?? "USD"} ${payload.current_price}`,
    ],
  };
}
