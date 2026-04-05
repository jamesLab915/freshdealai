import { type NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> }
) {
  const { slug } = await context.params;
  if (!slug?.trim()) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  if (!prisma) {
    return NextResponse.json({ ok: true, skipped: true });
  }
  try {
    const product = await prisma.product.findFirst({
      where: { slug: slug.trim(), published: true },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }
    await prisma.dealEngagementStat.upsert({
      where: { productId: product.id },
      create: { productId: product.id, detailViews: 1 },
      update: { detailViews: { increment: 1 } },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
