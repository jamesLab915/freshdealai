import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;
  const form = await req.formData();
  const published = form.get("published") === "true";

  if (!prisma) {
    return NextResponse.redirect(
      new URL(
        `/admin/products?mock=1&msg=${encodeURIComponent(`Would set ${id} published=${published} (no DATABASE_URL)`)}`,
        req.url
      )
    );
  }

  if (id.startsWith("mock-")) {
    return NextResponse.redirect(
      new URL(
        `/admin/products?msg=${encodeURIComponent("Mock IDs are not in PostgreSQL")}`,
        req.url
      )
    );
  }

  try {
    await prisma.product.update({
      where: { id },
      data: { published },
    });
  } catch {
    return NextResponse.redirect(
      new URL(`/admin/products?msg=${encodeURIComponent("Update failed")}`, req.url)
    );
  }

  return NextResponse.redirect(new URL("/admin/products?msg=Saved", req.url));
}
