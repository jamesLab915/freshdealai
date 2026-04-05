/**
 * Runtime environment helpers — never throws; safe for build-time and edge.
 */

function stripTrailingSlash(url: string): string {
  return url.replace(/\/$/, "");
}

export type SiteUrlSource =
  | "explicit"
  | "vercel_deployment"
  | "dev_default"
  /** No NEXT_PUBLIC_SITE_URL and not on Vercel — e.g. local `next start` or self-hosted; URL defaults to localhost:3010. */
  | "implicit_local";

type ResolvedSite = { url: string; source: SiteUrlSource };

function resolveSiteUrl(): ResolvedSite {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    return { url: stripTrailingSlash(raw), source: "explicit" };
  }

  const vercelUrl = process.env.VERCEL_URL?.trim();
  if (process.env.VERCEL === "1" && vercelUrl) {
    const withProto = vercelUrl.startsWith("http")
      ? vercelUrl
      : `https://${vercelUrl}`;
    return { url: stripTrailingSlash(withProto), source: "vercel_deployment" };
  }

  if (process.env.NODE_ENV !== "production") {
    return { url: "http://localhost:3010", source: "dev_default" };
  }

  return { url: "http://localhost:3010", source: "implicit_local" };
}

/** Public site URL for canonical, OG, sitemap, and absolute links. */
export function getSiteUrl(): string {
  return resolveSiteUrl().url;
}

export function getSiteUrlResolution(): ResolvedSite {
  return resolveSiteUrl();
}

export type EnvStatus = {
  hasDatabaseUrl: boolean;
  hasOpenAiKey: boolean;
  hasSiteUrl: boolean;
  siteUrl: string;
  siteUrlSource: SiteUrlSource;
};

export function getEnvStatus(): EnvStatus {
  const { url, source } = resolveSiteUrl();
  return {
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL?.trim()),
    hasOpenAiKey: Boolean(process.env.OPENAI_API_KEY?.trim()),
    hasSiteUrl: Boolean(process.env.NEXT_PUBLIC_SITE_URL?.trim()),
    siteUrl: url,
    siteUrlSource: source,
  };
}

let warnedImplicitSiteUrl = false;

/** Logs missing / inferred production vars once (server-side only). */
export function warnMissingEnv(): void {
  if (process.env.NODE_ENV !== "production") return;
  const { hasDatabaseUrl, hasOpenAiKey, hasSiteUrl } = getEnvStatus();
  if (!hasDatabaseUrl) {
    console.warn("[env] DATABASE_URL is not set — using mock data paths.");
  }
  if (!hasOpenAiKey) {
    console.warn(
      "[env] OPENAI_API_KEY is not set — AI tasks use deterministic fallbacks."
    );
  }
  if (!hasSiteUrl) {
    const { siteUrlSource } = getEnvStatus();
    if (siteUrlSource === "vercel_deployment") {
      console.warn(
        "[env] NEXT_PUBLIC_SITE_URL is not set — using VERCEL_URL for canonical/OG/sitemap. Set NEXT_PUBLIC_SITE_URL to your production domain when you go live."
      );
    } else if (siteUrlSource === "implicit_local" && !warnedImplicitSiteUrl) {
      warnedImplicitSiteUrl = true;
      console.warn(
        "[env] NEXT_PUBLIC_SITE_URL is not set — canonical/OG/sitemap use http://localhost:3010. Set NEXT_PUBLIC_SITE_URL for any publicly reachable deployment."
      );
    }
  }
}
