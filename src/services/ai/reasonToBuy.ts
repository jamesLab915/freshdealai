import { runResponsesJsonWithFallback } from "@/services/ai/client";
import { SCHEMA_REASON } from "@/services/ai/schemas";

export type ReasonToBuyResult = { reason_to_buy: string };

/** One-liner “why it’s worth a look” for cards — quality tier for merchandising copy. */
export async function generateReasonToBuy(payload: {
  title: string;
  summary: string;
  discount_percent?: number | null;
}): Promise<string> {
  const res = await runResponsesJsonWithFallback<ReasonToBuyResult>({
    tier: "quality",
    instructions:
      "Write one concise sentence explaining why a savvy shopper might click, without promising outcomes or medical/financial claims.",
    input: JSON.stringify(payload),
    jsonSchema: SCHEMA_REASON,
    fallbackTier: "fast",
  });

  if (res.ok) return res.parsed.reason_to_buy;

  if (payload.discount_percent && payload.discount_percent >= 25) {
    return `Notable ${payload.discount_percent}% markdown versus typical list positioning — worth comparing shipping and return terms.`;
  }
  return "Price and availability move quickly — compare with recent history before you buy.";
}
