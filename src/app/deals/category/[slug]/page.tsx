import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DealCard } from "@/components/deal-card";
import { getSiteUrl } from "@/lib/env";
import { mockCategories } from "@/lib/mock-deals";
import { prisma } from "@/lib/prisma";
import { getDeals } from "@/services/deals";

type Props = { params: Promise<{ slug: string }> };

async function getCategoryMeta(slug: string) {
  if (prisma) {
    try {
      const row = await prisma.category.findUnique({ where: { slug } });
      if (row) {
        const mock = mockCategories.find((m) => m.slug === slug);
        const desc = row.description?.trim();
        return {
          name: row.name,
          slug: row.slug,
          description: desc || mock?.description || `Deals in ${row.name}.`,
          dealCount: row.dealCount,
        };
      }
    } catch {
      /* ignore */
    }
  }
  return mockCategories.find((c) => c.slug === slug) ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const meta = await getCategoryMeta(slug);
  if (!meta) return { title: "Category" };
  const titleAbs = `${meta.name} deals — discounts & offers`;
  const description = `${meta.description} Browse AI-ranked ${meta.name.toLowerCase()} deals with transparent affiliate links.`;
  const path = `/deals/category/${slug}`;
  const url = `${getSiteUrl()}${path}`;
  return {
    title: { absolute: titleAbs },
    description,
    alternates: { canonical: path },
    openGraph: {
      title: titleAbs,
      description,
      url,
      type: "website",
      siteName: "FlashDealAI",
    },
    twitter: { card: "summary_large_image", title: titleAbs, description },
  };
}

export default async function DealsCategoryPage({ params }: Props) {
  const { slug } = await params;
  const meta = await getCategoryMeta(slug);
  if (!meta) notFound();

  const { deals, source } = await getDeals({ category: slug, sort: "ai_score" });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/deals" className="text-sm font-semibold text-[var(--accent)] hover:underline">
        ← All deals
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight text-neutral-900">
        {meta.name} deals
      </h1>
      <p className="mt-2 max-w-2xl text-neutral-600">
        {meta.description}{" "}
        {source === "mock" && (
          <span className="text-neutral-500">(Demo catalog — connect PostgreSQL for live inventory.)</span>
        )}
      </p>
      <p className="mt-2 text-sm text-neutral-500">
        {deals.length} listing{deals.length === 1 ? "" : "s"} · Sorted by AI score
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {deals.map((d) => (
          <DealCard key={d.id} deal={d} />
        ))}
      </div>

      {deals.length === 0 && (
        <p className="mt-10 text-sm text-neutral-600">
          No published deals in this category yet. Run the deal engine or check back soon.
        </p>
      )}
    </div>
  );
}
