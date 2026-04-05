import type { ModelTier } from "@/lib/openai/models";

function tierFromEnv(
  value: string | undefined,
  fallback: ModelTier
): ModelTier {
  if (value === "fast" || value === "quality") return value;
  return fallback;
}

/**
 * Task → model tier (env overrides). Keeps cost control in one place.
 * - dealCopy / searchNl / hubIntro: default `quality` (stronger reasoning)
 * - lightTags: default `fast` (cheap completions)
 */
export const AI_TASK_TIERS = {
  dealCopy: tierFromEnv(process.env.AI_TIER_DEAL_COPY, "quality"),
  searchNl: tierFromEnv(process.env.AI_TIER_SEARCH_NL, "quality"),
  hubIntro: tierFromEnv(process.env.AI_TIER_HUB_INTRO, "quality"),
  lightTags: tierFromEnv(process.env.AI_TIER_LIGHT, "fast"),
} as const;

/** Hub pages: AI intro is opt-in; cache layer avoids repeat work (see `hubIntro.ts`). */
export function isHubIntroAiEnabled(): boolean {
  const v = process.env.HUB_INTRO_AI_ENABLED;
  return v === "1" || v === "true";
}
