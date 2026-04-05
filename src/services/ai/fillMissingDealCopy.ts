import type { GeneratedDealContent } from "@/lib/ai/deal-content-types";
import type { FetchedDeal } from "@/lib/deals/fetchDeals";
import { AI_TASK_TIERS, runResponsesJsonWithFallback } from "@/services/ai/client";
import { SCHEMA_DEAL_EDITOR_COPY } from "@/services/ai/schemas";

type ExistingCopy = {
  aiSummary?: string | null;
  aiReasonToBuy?: string | null;
  seoTitle?: string | null;
  tags?: string[];
} | null;

type DealEditorJson = {
  ai_summary: string;
  ai_reason_to_buy: string;
  seo_title: string;
  tags: string[];
};

const FALLBACK_TAGS = ["best deal", "discount", "limited time", "save"];

function deterministicDealContent(deal: FetchedDeal): GeneratedDealContent {
  const off =
    deal.discount != null
      ? `${deal.discount}% off`
      : deal.originalPrice != null
        ? "limited-time discount"
        : "best deal";
  return {
    seoTitle: `${deal.title.slice(0, 44)} — ${off} | FlashDealAI`.slice(0, 118),
    description: `Limited-time discount on ${deal.title}. Compare price, read our quick take, and grab this best deal before it ends.`,
    shortReview: `Strong discount in ${deal.category}. Verify the latest price at checkout — this offer looks competitive for shoppers hunting a real discount.`,
    tags: [...FALLBACK_TAGS, deal.category.toLowerCase().replace(/\s+/g, "-")],
  };
}

/**
 * High-value, low-frequency: only calls OpenAI when `ai_summary` and/or
 * `ai_reason_to_buy` are missing. One structured call fills gaps; deterministic
 * fallback on missing key or API failure.
 */
export async function fillMissingDealCopy(
  deal: FetchedDeal,
  existing: ExistingCopy
): Promise<GeneratedDealContent> {
  const sum = existing?.aiSummary?.trim();
  const reason = existing?.aiReasonToBuy?.trim();

  if (sum && reason) {
    return {
      seoTitle: existing?.seoTitle?.trim() || deal.title.slice(0, 118),
      description: sum,
      shortReview: reason,
      tags: existing?.tags?.length ? [...existing.tags] : [],
    };
  }

  const payload = {
    title: deal.title,
    price: deal.price,
    original_price: deal.originalPrice ?? null,
    discount_percent: deal.discount ?? null,
    category: deal.category,
    source: deal.source,
    missing_fields: {
      ai_summary: !sum,
      ai_reason_to_buy: !reason,
    },
  };

  const res = await runResponsesJsonWithFallback<DealEditorJson>({
    tier: AI_TASK_TIERS.dealCopy,
    instructions:
      "You are a US retail deal editor for FlashDealAI. Write specific, shelf-ready copy — no vague praise, no 'great product' filler. Tie claims to price, category, and discount when present. " +
      "ai_summary: 1–2 sentences (card/meta tone). ai_reason_to_buy: why we'd spotlight this SKU now. " +
      "seo_title: <=118 chars, include offer angle. tags: 4–10 lowercase tokens, hyphenated multi-word OK.",
    input: JSON.stringify(payload),
    jsonSchema: SCHEMA_DEAL_EDITOR_COPY,
    fallbackTier: AI_TASK_TIERS.lightTags,
  });

  const det = deterministicDealContent(deal);

  if (!res.ok) {
    return {
      seoTitle: existing?.seoTitle?.trim() || det.seoTitle,
      description: sum || det.description,
      shortReview: reason || det.shortReview,
      tags: existing?.tags?.length ? [...existing.tags] : det.tags,
    };
  }

  const p = res.parsed;
  const modelTags = Array.isArray(p.tags)
    ? p.tags.filter((t): t is string => typeof t === "string").slice(0, 12)
    : [];
  return {
    seoTitle:
      existing?.seoTitle?.trim() ||
      (p.seo_title?.trim() ? p.seo_title.slice(0, 118) : det.seoTitle),
    description: sum || p.ai_summary?.trim() || det.description,
    shortReview: reason || p.ai_reason_to_buy?.trim() || det.shortReview,
    tags:
      modelTags.length > 0
        ? modelTags
        : existing?.tags?.length
          ? [...existing.tags]
          : det.tags,
  };
}
