import { jsonErr, jsonOk } from "@/lib/api/http";
import { getCollectionPreset } from "@/services/deals/collections";
import { getDeals } from "@/services/deals";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const preset = getCollectionPreset(slug);
  if (!preset) {
    return jsonErr("Collection not found", 404);
  }
  const { deals, source } = await getDeals(preset.filters);
  return jsonOk(
    source,
    {
      collection: {
        slug: preset.slug,
        label: preset.label,
        description: preset.description,
      },
      deals,
    },
    { count: deals.length }
  );
}
