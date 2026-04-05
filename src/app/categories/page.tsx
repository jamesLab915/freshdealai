import Link from "next/link";

import { Card, CardContent } from "@/components/ui/card";
import { getCategories } from "@/services/deals";

export const metadata = {
  title: "Categories",
  description: "Browse deal categories — electronics, home, fashion, and more.",
};

export default async function CategoriesPage() {
  const categories = await getCategories();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
      <p className="mt-2 max-w-2xl text-neutral-600">
        Each hub combines manual curation, ingestion jobs, and AI tagging so you
        land on coherent shelves — not random SKUs.
      </p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <Link key={c.slug} href={`/categories/${c.slug}`}>
            <Card className="h-full transition-shadow hover:shadow-md">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold text-neutral-900">
                  {c.name}
                </h2>
                <p className="mt-2 text-sm text-neutral-600">{c.description}</p>
                <p className="mt-4 text-sm font-medium text-[var(--accent)]">
                  Open category →
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
