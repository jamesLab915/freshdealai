import { runResponsesJsonWithFallback } from "@/services/ai/client";
import { SCHEMA_SEO } from "@/services/ai/schemas";

export type GenerateSeoResult = {
  seo_title: string;
  seo_description: string;
  open_graph_hint: string;
};

export async function generateSeo(payload: {
  title: string;
  brand?: string | null;
  category?: string | null;
  discount_percent?: number | null;
}): Promise<GenerateSeoResult> {
  const res = await runResponsesJsonWithFallback<GenerateSeoResult>({
    tier: "quality",
    instructions:
      "Create US English SEO meta for a deal listing. No superlatives like 'best ever'. Include brand + product + deal context.",
    input: JSON.stringify(payload),
    jsonSchema: SCHEMA_SEO,
    fallbackTier: "fast",
  });

  if (res.ok) return res.parsed;

  const brand = payload.brand ? `${payload.brand} ` : "";
  const disc =
    payload.discount_percent != null ? `${payload.discount_percent}% off ` : "";
  return {
    seo_title: `${disc}${brand}${payload.title}`.slice(0, 68),
    seo_description: `See today’s ${disc}offer on ${brand}${payload.title}. Prices checked against recent signals; verify at checkout.`,
    open_graph_hint: `${brand}${payload.title} — limited-time deal`,
  };
}
