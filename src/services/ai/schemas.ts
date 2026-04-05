/**
 * Shared JSON Schema fragments for OpenAI Responses API `text.format` / structured
 * outputs. Imported by task modules under `src/services/ai/` — keep in sync with
 * `src/services/ai/client.ts` callers.
 */

export const SCHEMA_NORMALIZE_TITLE = {
  name: "normalize_title",
  description: "Standardize noisy retailer titles",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      normalized_title: { type: "string" },
      brand_guess: { type: "string" },
      confidence: { type: "number", minimum: 0, maximum: 1 },
    },
    required: ["normalized_title", "brand_guess", "confidence"],
  },
  strict: true,
} as const;

export const SCHEMA_SUMMARY = {
  name: "product_summary",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      summary: { type: "string", maxLength: 400 },
      price_highlights: {
        type: "array",
        items: { type: "string" },
        maxItems: 4,
      },
    },
    required: ["summary", "price_highlights"],
  },
  strict: true,
} as const;

export const SCHEMA_SCORE = {
  name: "deal_score",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      ai_score: { type: "integer", minimum: 0, maximum: 100 },
      discount_tier: {
        type: "string",
        enum: ["low", "moderate", "strong", "exceptional"],
      },
      risk_flags: {
        type: "array",
        items: { type: "string" },
        maxItems: 6,
      },
    },
    required: ["ai_score", "discount_tier", "risk_flags"],
  },
  strict: true,
} as const;

export const SCHEMA_CLASSIFY = {
  name: "product_classify",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      category: { type: "string" },
      subcategory: { type: "string" },
      tags: {
        type: "array",
        items: { type: "string" },
        maxItems: 12,
      },
    },
    required: ["category", "subcategory", "tags"],
  },
  strict: true,
} as const;

export const SCHEMA_SEO = {
  name: "seo_bundle",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      seo_title: { type: "string", maxLength: 70 },
      seo_description: { type: "string", maxLength: 320 },
      open_graph_hint: { type: "string", maxLength: 120 },
    },
    required: ["seo_title", "seo_description", "open_graph_hint"],
  },
  strict: true,
} as const;

export const SCHEMA_REASON = {
  name: "reason_to_buy",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      reason_to_buy: { type: "string", maxLength: 280 },
    },
    required: ["reason_to_buy"],
  },
  strict: true,
} as const;

/** Single Responses call when ai_summary and/or ai_reason_to_buy are missing (deal-engine). */
export const SCHEMA_DEAL_EDITOR_COPY = {
  name: "deal_editor_copy",
  description: "Deal-desk copy for one SKU — specific, not generic.",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      ai_summary: { type: "string", maxLength: 420 },
      ai_reason_to_buy: { type: "string", maxLength: 520 },
      seo_title: { type: "string", maxLength: 118 },
      tags: {
        type: "array",
        items: { type: "string" },
        maxItems: 12,
      },
    },
    required: ["ai_summary", "ai_reason_to_buy", "seo_title", "tags"],
  },
  strict: true,
} as const;

/** Natural-language shopping query → filters (search understanding). */
export const SCHEMA_SEARCH_NL = {
  name: "search_query_structured",
  description: "Structured intent from a short natural-language deal search",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      brand: { type: "string" },
      category: { type: "string" },
      max_price: { type: "number" },
      min_discount: { type: "number" },
      intent: { type: "string" },
    },
    required: ["brand", "category", "max_price", "min_discount", "intent"],
  },
  strict: true,
} as const;
