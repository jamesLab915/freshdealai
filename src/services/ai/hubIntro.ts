import {
  buildBestDealsIntro,
  buildCategoryBestDealsIntro,
  buildTop10Intro,
} from "@/lib/seo-hub-intro";

import { isHubIntroAiEnabled } from "@/services/ai/client";

export type HubIntroKind = "best-deals" | "best-deals-category" | "top-10";

type CacheEntry = { text: string; expiresAt: number };

/** In-process cache (ISR / repeated builds in the same runtime). Future: Redis / DB. */
const memoryCache = new Map<string, CacheEntry>();

function ttlMs(): number {
  const raw = process.env.HUB_INTRO_CACHE_TTL_MS;
  const n = raw ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 86_400_000;
}

function cacheKey(kind: HubIntroKind, categorySlug: string | undefined): string {
  return `${kind}:${categorySlug ?? "_"}`;
}

function deterministicIntro(params: {
  kind: HubIntroKind;
  dealCount: number;
  sourceLabel: string;
  categoryName: string;
}): string {
  const { kind, dealCount, sourceLabel, categoryName } = params;
  if (kind === "best-deals") {
    return buildBestDealsIntro(dealCount, sourceLabel);
  }
  if (kind === "best-deals-category") {
    return buildCategoryBestDealsIntro(categoryName, dealCount, sourceLabel);
  }
  return buildTop10Intro(categoryName, dealCount, sourceLabel);
}

/**
 * Hub hero intros: default deterministic copy. Optional `HUB_INTRO_AI_ENABLED` gates
 * future AI-generated text; **no OpenAI call on the request path** in this version —
 * only cache slots + env flag for a later background fill.
 */
export async function resolveHubIntro(params: {
  kind: HubIntroKind;
  dealCount: number;
  sourceLabel: string;
  /** Category display name for category / top-10 hubs */
  categoryName?: string;
  categorySlug?: string;
}): Promise<string> {
  const key = cacheKey(params.kind, params.categorySlug);
  const now = Date.now();
  const hit = memoryCache.get(key);
  if (hit && hit.expiresAt > now) {
    return hit.text;
  }

  const categoryName = params.categoryName ?? "this category";
  const base = deterministicIntro({
    kind: params.kind,
    dealCount: params.dealCount,
    sourceLabel: params.sourceLabel,
    categoryName,
  });

  if (isHubIntroAiEnabled()) {
    // Reserved: replace `base` with model copy after async generation or cache warm.
    // Intentionally not calling OpenAI here to avoid cost on every hub ISR rebuild.
  }

  memoryCache.set(key, { text: base, expiresAt: now + ttlMs() });
  return base;
}
