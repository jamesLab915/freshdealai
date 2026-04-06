import { jsonErr } from "@/lib/api/http";
import {
  internalDistributionJson,
  parseIncludeDigest,
  parseLimitQuery,
} from "@/lib/distribution/internal-response";
import { buildCategoryDistributionBundle } from "@/lib/distribution/bundles";
import { getCollectionPreset } from "@/services/deals/collections";

const MAX_LIMIT = 50;

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(req: Request, ctx: Ctx) {
  const { slug: raw } = await ctx.params;
  const slug = raw?.trim().toLowerCase() ?? "";
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    return jsonErr("Invalid category slug", 400);
  }
  if (!getCollectionPreset(slug)) {
    return jsonErr("Unknown category preset", 404);
  }

  const url = new URL(req.url);
  const lim = parseLimitQuery(url.searchParams, "limit", 24, MAX_LIMIT);
  if (!lim.ok) return jsonErr(lim.message, 400);
  const includeDigest = parseIncludeDigest(url.searchParams);

  const bundle = await buildCategoryDistributionBundle(slug, {
    limit: lim.value,
  });
  return internalDistributionJson(bundle, includeDigest);
}
