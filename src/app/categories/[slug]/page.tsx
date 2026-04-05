import Link from "next/link";
import { notFound } from "next/navigation";

import { DealCard } from "@/components/deal-card";
import { getCategories, getDeals } from "@/services/deals";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const categories = await getCategories();
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) return { title: "Category" };
  return {
    title: `${cat.name} deals`,
    description: cat.description,
  };
}

export default async function CategoryDetailPage({ params }: Props) {
  const { slug } = await params;
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) notFound();

  const { deals } = await getDeals({ category: slug });

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/categories" className="text-sm font-medium text-[var(--accent)]">
        ← Categories
      </Link>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">{cat.name}</h1>
      <p className="mt-2 max-w-2xl text-neutral-600">{cat.description}</p>
      <p className="mt-4 text-sm text-neutral-500">
        {deals.length} published deals in this view
      </p>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {deals.map((d) => (
          <DealCard key={d.id} deal={d} />
        ))}
      </div>
    </div>
  );
}
