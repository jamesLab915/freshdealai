import { runResponsesJsonWithFallback } from "@/services/ai/client";
import { SCHEMA_SCORE } from "@/services/ai/schemas";

export type ScoreDealResult = {
  ai_score: number;
  discount_tier: "low" | "moderate" | "strong" | "exceptional";
  risk_flags: string[];
};

export async function scoreDeal(payload: {
  title: string;
  discount_percent?: number | null;
  review_count?: number | null;
  rating?: number | null;
  price_history?: { price: number }[];
}): Promise<ScoreDealResult> {
  const res = await runResponsesJsonWithFallback<ScoreDealResult>({
    tier: "quality",
    instructions:
      "Score deals for US shoppers using discount depth, plausibility, and weak signals of sketchy pricing. Never guarantee savings.",
    input: JSON.stringify(payload),
    jsonSchema: SCHEMA_SCORE,
    fallbackTier: "fast",
  });

  if (res.ok) return res.parsed;

  const pct = payload.discount_percent ?? 0;
  const ai_score = Math.min(100, Math.max(35, Math.round(pct * 1.2 + 40)));
  return {
    ai_score,
    discount_tier:
      pct >= 40 ? "strong" : pct >= 25 ? "moderate" : pct >= 10 ? "low" : "low",
    risk_flags: payload.review_count && payload.review_count < 20 ? ["few_reviews"] : [],
  };
}
