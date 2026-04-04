/**
 * Runtime environment helpers — never throws; safe for build-time and edge.
 */

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

/** Public site URL for canonical, OG, sitemap, and absolute links. */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return stripTrailingSlash(raw);
  return "http://localhost:3000";
}

export type EnvStatus = {
  hasDatabaseUrl: boolean;
  hasOpenAiKey: boolean;
  hasSiteUrl: boolean;
  siteUrl: string;
};

export function getEnvStatus(): EnvStatus {
  const siteUrl = getSiteUrl();
  return {
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL?.trim()),
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY?.trim()),
    hasSiteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim()),
    siteUrl,
  };
}

/** Logs missing production vars once (server-side only). */
export function warnMissingEnv(): void {
  if (process.env.NODE_ENV !== "production") return;
  const { hasDatabaseUrl, hasOpenAiKey, hasSiteUrl } = getEnvStatus();
  if (!hasDatabaseUrl) {
    console.warn("[env] DATABASE_URL is not set — using mock data paths.");
  }
  if (!hasOpenAiKey) {
    console.warn("[env] OPENAI_API_KEY is not set — AI tasks use deterministic fallbacks.");
  }
  if (!hasSiteUrl) {
    console.warn("[env] NEXT_PUBLIC_SITE_URL is not set — canonical/OG URLs default to localhost.");
  }
}
