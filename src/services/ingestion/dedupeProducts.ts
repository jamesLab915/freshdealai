import type { NormalizedRecord } from "@/services/ingestion/normalizeProductRecord";

/**
 * Dedupe by (source, external_id) and soft-dedupe by identical affiliate_url or product_url.
 */
export function dedupeProducts(records: NormalizedRecord[]): NormalizedRecord[] {
  const byKey = new Map<string, NormalizedRecord>();
  const seenUrl = new Set<string>();

  for (const r of records) {
    const key = `${r.source}:${r.external_id}`;
    if (byKey.has(key)) continue;

    const urlKey = (r.affiliate_url || r.product_url).toLowerCase();
    if (seenUrl.has(urlKey)) continue;
    seenUrl.add(urlKey);

    byKey.set(key, r);
  }

  return [...byKey.values()];
}
