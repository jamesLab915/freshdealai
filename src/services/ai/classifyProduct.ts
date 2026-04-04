import { runResponsesJsonWithFallback } from "@/services/ai/client";
import { SCHEMA_CLASSIFY } from "@/services/ai/schemas";

export type ClassifyProductResult = {
  category: string;
  subcategory: string;
  tags: string[];
};

export async function classifyProduct(payload: {
  title: string;
  retailer?: string | null;
}): Promise<ClassifyProductResult> {
  const res = await runResponsesJsonWithFallback<ClassifyProductResult>({
    tier: "fast",
    instructions:
      "Map products to broad US retail taxonomy (Electronics, Home & Kitchen, Fashion, Health & Fitness, Outdoor, etc.).",
    input: JSON.stringify(payload),
    jsonSchema: SCHEMA_CLASSIFY,
  });

  if (res.ok) return res.parsed;

  return {
    category: "General",
    subcategory: "Uncategorized",
    tags: ["deal"],
  };
}
