/**
 * Ingestion pipeline — wire workers/cron to these modules; data lands in `products`.
 */
export { amazonIngestFromPaApi, mapAmazonItemToRaw } from "@/services/ingestion/amazonIngest";
export { scrapeRetailerPage } from "@/services/ingestion/scrapeRetailerPage";
export {
  normalizeProductRecord,
  type RawProductRecord,
  type NormalizedRecord,
} from "@/services/ingestion/normalizeProductRecord";
export { dedupeProducts } from "@/services/ingestion/dedupeProducts";
export { updatePriceHistory } from "@/services/ingestion/updatePriceHistory";
