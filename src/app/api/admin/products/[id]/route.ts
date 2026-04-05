import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";

const patchSchema = z.object({
  affiliateUrl: z.unknown().optional(),
  featured: z.boolean().optional(),
  trending: z.boolean().optional(),
  aiPick: z.boolean().optional(),
  homepageRank: z.number().int().nullable().optional(),
  bestDealsRank: z.number().int().nullable().optional(),
  top10Rank: z.number().int().nullable().optional(),
  excludeFromHubs: z.boolean().optional(),
});

function parseAffiliateUrl(
  raw: unknown
): { set: false } | { set: true; value: string | null; invalid?: boolean } {
  if (raw === undefined) return { set: false };
  if (raw === null) return { set: true, value: null };
  if (typeof raw !== "string") return { set: true, invalid: true, value: null };
  const t = raw.trim();
  if (!t) return { set: true, value: null };
  try {
    const u = new URL(t);
    if (u.protocol !== "http:" && u.protocol !== "https:") {
      return { set: true, invalid: true, value: null };
    }
    return { set: true, value: t };
  } catch {
    return { set: true, invalid: true, value: null };
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { success: false, error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  if (!prisma) {
    return NextResponse.json(
      { success: false, error: "Database not configured" },
      { status: 503 }
    );
  }

  const data: Record<string, unknown> = {};
  if ("affiliateUrl" in (body as object)) {
    const aff = parseAffiliateUrl(parsed.data.affiliateUrl);
    if (aff.set && aff.invalid) {
      return NextResponse.json(
        { success: false, error: "Invalid affiliate URL" },
        { status: 400 }
      );
    }
    if (aff.set) data.affiliateUrl = aff.value;
  }
  if (parsed.data.featured !== undefined) data.featured = parsed.data.featured;
  if (parsed.data.trending !== undefined) data.trending = parsed.data.trending;
  if (parsed.data.aiPick !== undefined) data.aiPick = parsed.data.aiPick;
  if (parsed.data.homepageRank !== undefined)
    data.homepageRank = parsed.data.homepageRank;
  if (parsed.data.bestDealsRank !== undefined)
    data.bestDealsRank = parsed.data.bestDealsRank;
  if (parsed.data.top10Rank !== undefined) data.top10Rank = parsed.data.top10Rank;
  if (parsed.data.excludeFromHubs !== undefined)
    data.excludeFromHubs = parsed.data.excludeFromHubs;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ success: true, data: { id } });
  }

  try {
    await prisma.product.update({
      where: { id },
      data: data as object,
    });
  } catch (e) {
    return NextResponse.json(
      {
        success: false,
        error: e instanceof Error ? e.message : "Update failed",
      },
      { status: 400 }
    );
  }

  return NextResponse.json({ success: true, data: { id } });
}
