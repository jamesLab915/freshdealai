import { NextRequest, NextResponse } from "next/server";

import { AiTaskStatus, AiTaskType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { classifyProduct } from "@/services/ai/classifyProduct";
import { generateReasonToBuy } from "@/services/ai/reasonToBuy";
import { generateSeo } from "@/services/ai/generateSeo";
import { normalizeTitle } from "@/services/ai/normalizeTitle";
import { scoreDeal } from "@/services/ai/scoreDeal";
import { summarizeProduct } from "@/services/ai/summarizeProduct";
import { getDealsForAdmin } from "@/services/deals";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const productId = String(form.get("productId") ?? "");

  if (!productId) {
    return NextResponse.json({ error: "productId required" }, { status: 400 });
  }

  const catalog = await getDealsForAdmin();
  const deal = catalog.find((d) => d.id === productId);

  const runPipeline = async () => {
    if (!deal) throw new Error("Product not found in catalog");
    const norm = await normalizeTitle(deal.title);
    const sum = await summarizeProduct({
      title: deal.title,
      brand: deal.brand,
      current_price: deal.currentPrice,
      original_price: deal.originalPrice,
      currency: deal.currency,
    });
    const score = await scoreDeal({
      title: deal.title,
      discount_percent: deal.discountPercent,
      review_count: deal.reviewCount,
      rating: deal.rating,
      price_history: deal.priceHistory?.map((h) => ({ price: h.price })),
    });
    const cls = await classifyProduct({
      title: deal.title,
      retailer: deal.source,
    });
    const seo = await generateSeo({
      title: deal.title,
      brand: deal.brand,
      category: deal.category,
      discount_percent: deal.discountPercent,
    });
    const reason = await generateReasonToBuy({
      title: deal.title,
      summary: sum.summary,
      discount_percent: deal.discountPercent,
    });
    return { norm, sum, score, cls, seo, reason };
  };

  /** Mock / no-DB path: run AI but do not persist (demo IDs or missing DATABASE_URL). */
  const mockOrNoDb = !prisma || productId.startsWith("mock-");
  if (mockOrNoDb) {
    if (!deal) {
      return NextResponse.redirect(
        new URL(
          `/admin/ai-review?msg=${encodeURIComponent("Product not found in catalog")}`,
          req.url
        )
      );
    }
    try {
      await runPipeline();
      return NextResponse.redirect(
        new URL(
          `/admin/ai-review?msg=${encodeURIComponent("AI pipeline ran (mock — not persisted)")}`,
          req.url
        )
      );
    } catch {
      return NextResponse.redirect(
        new URL(
          `/admin/ai-review?msg=${encodeURIComponent("AI rerun failed — check OPENAI_API_KEY or inputs")}`,
          req.url
        )
      );
    }
  }

  if (!prisma) {
    return NextResponse.redirect(
      new URL(
        `/admin/ai-review?msg=${encodeURIComponent("Database unavailable")}`,
        req.url
      )
    );
  }

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    return NextResponse.redirect(
      new URL(`/admin/products?msg=${encodeURIComponent("Product not found")}`, req.url)
    );
  }

  const inputSnapshot = {
    title: product.title,
    brand: product.brand,
    current_price: Number(product.currentPrice),
    original_price: product.originalPrice ? Number(product.originalPrice) : null,
    discount_percent: product.discountPercent,
  };

  const norm = await normalizeTitle(product.title);
  const sum = await summarizeProduct({
    title: product.title,
    brand: product.brand,
    current_price: Number(product.currentPrice),
    original_price: product.originalPrice ? Number(product.originalPrice) : null,
  });
  const score = await scoreDeal({
    title: product.title,
    discount_percent: product.discountPercent,
    review_count: product.reviewCount,
    rating: product.rating ? Number(product.rating) : null,
  });
  const cls = await classifyProduct({ title: product.title, retailer: product.source });
  const seo = await generateSeo({
    title: product.title,
    brand: product.brand,
    category: product.category,
    discount_percent: product.discountPercent,
  });
  const reason = await generateReasonToBuy({
    title: product.title,
    summary: sum.summary,
    discount_percent: product.discountPercent,
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      normalizedTitle: norm.normalized_title,
      aiSummary: sum.summary,
      aiScore: score.ai_score,
      aiReasonToBuy: reason,
      category: cls.category,
      subcategory: cls.subcategory,
      tags: cls.tags,
      seoTitle: seo.seo_title,
      seoDescription: seo.seo_description,
    },
  });

  await prisma.aiTask.create({
    data: {
      productId,
      taskType: AiTaskType.SUMMARIZE,
      inputJson: inputSnapshot,
      outputJson: { norm, sum, score, cls, seo, reason },
      status: AiTaskStatus.SUCCESS,
    },
  });

  return NextResponse.redirect(
    new URL("/admin/ai-review?msg=AI+rerun+saved+to+database", req.url)
  );
}
