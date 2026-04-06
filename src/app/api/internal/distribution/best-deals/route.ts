import { internalDistributionJson, parseIncludeDigest } from "@/lib/distribution/internal-response";
import { buildBestDealsDistributionBundle } from "@/lib/distribution/bundles";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const includeDigest = parseIncludeDigest(url.searchParams);

  const bundle = await buildBestDealsDistributionBundle();
  return internalDistributionJson(bundle, includeDigest);
}
