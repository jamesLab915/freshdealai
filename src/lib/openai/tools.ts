/**
 * Reserved tool/function definitions for future agentic search & ingestion.
 * Wire these into `client.responses.create({ tools: [...] })` when you add orchestration.
 */
export const TOOL_SEARCH_PRODUCTS = {
  type: "function" as const,
  name: "search_products",
  description:
    "Search the FlashDealAI product index by keyword, brand, category, and discount range.",
  parameters: {
    type: "object",
    additionalProperties: false,
    properties: {
      query: { type: "string" },
      brand: { type: "string" },
      category: { type: "string" },
      minDiscountPercent: { type: "number" },
    },
    required: ["query"],
  },
};

export const TOOL_LOG_INGESTION_EVENT = {
  type: "function" as const,
  name: "log_ingestion_event",
  description: "Append a structured note to the current ingestion job log.",
  parameters: {
    type: "object",
    additionalProperties: false,
    properties: {
      level: { type: "string", enum: ["info", "warn", "error"] },
      message: { type: "string" },
    },
    required: ["level", "message"],
  },
};
