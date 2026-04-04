import { runResponsesJsonWithFallback } from "@/services/ai/client";
import { SCHEMA_NORMALIZE_TITLE } from "@/services/ai/schemas";

export type NormalizeTitleResult = {
  normalized_title: string;
  brand_guess: string;
  confidence: number;
};

export async function normalizeTitle(rawTitle: string): Promise<NormalizeTitleResult> {
  const res = await runResponsesJsonWithFallback<NormalizeTitleResult>({
    tier: "fast",
    instructions:
      "Clean e-commerce titles: remove marketing fluff, fix capitalization, keep model numbers.",
    input: JSON.stringify({ title: rawTitle }),
    jsonSchema: SCHEMA_NORMALIZE_TITLE,
  });

  if (res.ok) return res.parsed;

  return {
    normalized_title: rawTitle.replace(/\s+/g, " ").trim().slice(0, 200),
    brand_guess: "",
    confidence: 0.2,
  };
}
