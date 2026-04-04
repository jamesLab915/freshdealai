import Link from "next/link";
import type { ReactNode } from "react";

import { CopyPublicLinkButton } from "@/components/admin/copy-public-link-button";
import { Button } from "@/components/ui/button";
import { getSiteUrl } from "@/lib/env";
import { getDealsForAdmin } from "@/services/deals";
import type { DealProduct } from "@/types/deal";

export const metadata = { title: "Admin · Products" };

type Sp = {
  published?: string;
  affiliate?: string;
  sort?: string;
};

function filterProducts(
  products: DealProduct[],
  sp: Sp
): DealProduct[] {
  let list = [...products];
  if (sp.published === "yes") list = list.filter((p) => p.published);
  else if (sp.published === "no") list = list.filter((p) => !p.published);
  if (sp.affiliate === "dedicated") {
    list = list.filter((p) => !p.usesProductUrlFallback);
  } else if (sp.affiliate === "fallback") {
    list = list.filter((p) => p.usesProductUrlFallback);
  }
  const sort = sp.sort ?? "ai_desc";
  if (sort === "ai_asc") {
    list.sort((a, b) => (a.aiScore ?? 0) - (b.aiScore ?? 0));
  } else {
    list.sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0));
  }
  return list;
}

function buildQuery(parts: Sp): string {
  const u = new URLSearchParams();
  if (parts.published) u.set("published", parts.published);
  if (parts.affiliate) u.set("affiliate", parts.affiliate);
  if (parts.sort && parts.sort !== "ai_desc") u.set("sort", parts.sort);
  const s = u.toString();
  return s ? `?${s}` : "";
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<Sp>;
}) {
  const sp = await searchParams;
  const all = await getDealsForAdmin();
  const products = filterProducts(all, sp);
  const base = getSiteUrl();

  const issues = {
    noImage: all.filter((p) => !p.imageUrl).length,
    noAffiliate: all.filter((p) => p.usesProductUrlFallback).length,
    noPrice: all.filter((p) => !p.currentPrice).length,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link href="/admin" className="text-sm text-[var(--accent)]">
        ← Admin home
      </Link>
      <h1 className="mt-4 text-2xl font-bold">Products</h1>
      <p className="mt-2 text-sm text-neutral-600">
        QA flags (all rows): {issues.noImage} missing image · {issues.noAffiliate}{" "}
        using product URL only (no dedicated affiliate link) · {issues.noPrice} missing
        price
      </p>

      <div className="mt-6 flex flex-wrap gap-2 text-sm">
        <FilterLink
          href={`/admin/products${buildQuery({ sort: sp.sort })}`}
          active={!sp.published && !sp.affiliate}
        >
          All
        </FilterLink>
        <FilterLink
          href={`/admin/products${buildQuery({ published: "yes", sort: sp.sort })}`}
          active={sp.published === "yes"}
        >
          Published
        </FilterLink>
        <FilterLink
          href={`/admin/products${buildQuery({ published: "no", sort: sp.sort })}`}
          active={sp.published === "no"}
        >
          Unpublished
        </FilterLink>
        <span className="text-neutral-300">|</span>
        <FilterLink
          href={`/admin/products${buildQuery({ affiliate: "dedicated", sort: sp.sort })}`}
          active={sp.affiliate === "dedicated"}
        >
          Has affiliate link
        </FilterLink>
        <FilterLink
          href={`/admin/products${buildQuery({ affiliate: "fallback", sort: sp.sort })}`}
          active={sp.affiliate === "fallback"}
        >
          Fallback URL only
        </FilterLink>
        <span className="text-neutral-300">|</span>
        <FilterLink
          href={`/admin/products${buildQuery({
            published: sp.published,
            affiliate: sp.affiliate,
            sort: "ai_desc",
          })}`}
          active={(sp.sort ?? "ai_desc") === "ai_desc"}
        >
          AI score ↓
        </FilterLink>
        <FilterLink
          href={`/admin/products${buildQuery({
            published: sp.published,
            affiliate: sp.affiliate,
            sort: "ai_asc",
          })}`}
          active={sp.sort === "ai_asc"}
        >
          AI score ↑
        </FilterLink>
      </div>

      <p className="mt-4 text-sm text-neutral-600">
        Showing <strong>{products.length}</strong> of {all.length} products
      </p>

      <div className="mt-6 overflow-x-auto rounded-xl border border-neutral-200">
        <table className="w-full min-w-[840px] text-left text-sm">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-xs uppercase text-neutral-500">
            <tr>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Published</th>
              <th className="px-4 py-3">Flags</th>
              <th className="px-4 py-3">AI</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const flags = [
                !p.imageUrl && "no-img",
                p.usesProductUrlFallback && "no-aff",
                !p.currentPrice && "no-price",
              ].filter(Boolean);
              const publicUrl = `${base}/deals/${p.slug}`;
              return (
                <tr key={p.id} className="border-b border-neutral-100">
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    <span className="line-clamp-2">{p.title}</span>
                    <div className="mt-1 text-xs text-neutral-400">{p.slug}</div>
                  </td>
                  <td className="px-4 py-3">{p.published ? "Yes" : "No"}</td>
                  <td className="px-4 py-3 text-xs text-amber-800">
                    {flags.length ? flags.join(", ") : "—"}
                  </td>
                  <td className="px-4 py-3">{p.aiScore ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <CopyPublicLinkButton href={publicUrl} />
                      <Button size="sm" variant="secondary" asChild>
                        <Link href={`/deals/${p.slug}`}>View</Link>
                      </Button>
                      <form action={`/api/admin/products/${p.id}/publish`} method="POST">
                        <input
                          type="hidden"
                          name="published"
                          value={p.published ? "false" : "true"}
                        />
                        <Button size="sm" type="submit">
                          {p.published ? "Unpublish" : "Publish"}
                        </Button>
                      </form>
                      <form action={`/api/admin/ai/rerun`} method="POST">
                        <input type="hidden" name="productId" value={p.id} />
                        <Button size="sm" variant="outline" type="submit">
                          Re-run AI
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-[var(--accent-soft)] px-3 py-1 font-semibold text-[var(--accent-ink)]"
          : "rounded-full px-3 py-1 text-neutral-600 hover:bg-neutral-100"
      }
    >
      {children}
    </Link>
  );
}
