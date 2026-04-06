import { jsonErr } from "@/lib/api/http";
import {
  internalDistributionJson,
  parseIncludeDigest,
  parseLimitQuery,
} from "@/lib/distribution/internal-response";
import { buildHomepageFeaturedDistributionBundle } from "@/lib/distribution/bundles";

const MAX_LIMIT = 50;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const lim = parseLimitQuery(url.searchParams, "limit", 12, MAX_LIMIT);
  if (!lim.ok) return jsonErr(lim.message, 400);
  const includeDigest = parseIncludeDigest(url.searchParams);

  const bundle = await buildHomepageFeaturedDistributionBundle({
    limit: lim.value,
  });
  return internalDistributionJson(bundle, includeDigest);
}
