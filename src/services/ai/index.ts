/**
 * Structured AI tasks — OpenAI Responses API + JSON schema in each module.
 */
export * from "@/services/ai/client";
export { normalizeTitle } from "@/services/ai/normalizeTitle";
export { summarizeProduct } from "@/services/ai/summarizeProduct";
export { scoreDeal } from "@/services/ai/scoreDeal";
export { classifyProduct } from "@/services/ai/classifyProduct";
export { generateSeo } from "@/services/ai/generateSeo";
export { generateReasonToBuy } from "@/services/ai/reasonToBuy";
export * as schemas from "@/services/ai/schemas";
