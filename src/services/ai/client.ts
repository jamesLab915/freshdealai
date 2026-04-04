/**
 * Single entry for OpenAI usage from `src/services/ai/*`.
 * Wraps Responses API + JSON schema; fallbacks live in each task module.
 */
export { getOpenAI } from "@/lib/openai/client";
export {
  runResponsesJson,
  runResponsesJsonWithFallback,
  type JsonSchemaFormat,
} from "@/lib/openai/responses";
