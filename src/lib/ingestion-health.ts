/** Source readiness for /admin/ingestion — env-based, no secrets exposed. */

export type AmazonPaStatus = "not_configured" | "ready";

export function getAmazonPaApiStatus(): AmazonPaStatus {
  const hasKeys = Boolean(
    process.env.AMAZON_ACCESS_KEY_ID?.trim() &&
      process.env.AMAZON_SECRET_ACCESS_KEY?.trim()
  );
  const hasLegacy = Boolean(
    process.env.AMAZON_PA_API_KEY?.trim() ||
      process.env.PA_API_ACCESS_KEY?.trim()
  );
  return hasKeys || hasLegacy ? "ready" : "not_configured";
}

export function getIngestionSourceLine() {
  return {
    amazonPaApi: getAmazonPaApiStatus(),
    retailerScraper: "mock_only" as const,
    csvImport: "available" as const,
  };
}
