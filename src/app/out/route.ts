import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

/** Affiliate exit — validates http(s) only, records optional `deal` id, then 302. */
export async function GET(req: NextRequest) {
  const u = req.nextUrl.searchParams.get("u");
  if (!u) {
    return NextResponse.redirect(new URL("/", req.url));
  }
  let parsed: URL;
  try {
    parsed = new URL(u);
  } catch {
    return NextResponse.redirect(new URL("/", req.url));
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  const dealId = req.nextUrl.searchParams.get("deal")?.trim();
  if (dealId && prisma) {
    try {
      await prisma.dealEngagementStat.upsert({
        where: { productId: dealId },
        create: { productId: dealId, affiliateClicks: 1 },
        update: { affiliateClicks: { increment: 1 } },
      });
    } catch {
      /* non-blocking */
    }
  }

  return NextResponse.redirect(parsed.toString(), { status: 302 });
}
