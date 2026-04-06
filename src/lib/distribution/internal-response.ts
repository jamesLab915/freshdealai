import { jsonOk } from "@/lib/api/http";
import { toDigestBundleV1 } from "@/lib/distribution/digest-projection";
import type { DistributionBundleV1 } from "@/types/distribution";

export function parseLimitQuery(
  searchParams: URLSearchParams,
  key: string,
  fallback: number,
  max: number
): { ok: true; value: number } | { ok: false; message: string } {
  const raw = searchParams.get(key);
  if (raw == null || raw === "") return { ok: true, value: fallback };
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) {
    return { ok: false, message: `Invalid ${key}: must be a positive integer` };
  }
  return { ok: true, value: Math.min(n, max) };
}

export function parseIncludeDigest(searchParams: URLSearchParams): boolean {
  const v = searchParams.get("include_digest")?.trim().toLowerCase();
  if (v === "0" || v === "false" || v === "no") return false;
  return true;
}

/**
 * JSON body for internal distribution routes — full bundle plus optional digest projection.
 */
export function internalDistributionJson(
  bundle: DistributionBundleV1,
  includeDigest: boolean
) {
  const data = includeDigest
    ? { bundle, digest: toDigestBundleV1(bundle) }
    : { bundle };
  return jsonOk(bundle.catalog_source, data, {
    projection: includeDigest ? "bundle+digest" : "bundle_only",
  });
}
