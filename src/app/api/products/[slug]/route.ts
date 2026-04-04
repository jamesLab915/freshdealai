import { jsonErr, jsonOk } from "@/lib/api/http";
import { getDealBySlugWithSource } from "@/services/deals";

type Ctx = { params: Promise<{ slug: string }> };

/** @deprecated Prefer GET /api/deals/[slug] — same payload shape (unified envelope). */
export async function GET(_req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const { deal, source } = await getDealBySlugWithSource(slug);
  if (!deal) {
    return jsonErr("Not found", 404);
  }
  return jsonOk(source, { deal }, { slug });
}
