import Link from "next/link";
import { Fragment, type ReactNode } from "react";

import { CopyPublicLinkButton } from "@/components/admin/copy-public-link-button";
import { ProductRowEditor } from "@/components/admin/product-row-editor";
import { Button } from "@/components/ui/button";
import { getSiteUrl } from "@/lib/env";
import { getDealsForAdmin } from "@/services/deals";
import type { DealProduct } from "@/types/deal";

export const metadata = { title: "Admin · Products" };

type Sp = {
  published?: string;
  affiliate?: string;
  sort?: string;
  featured?: string;
  trending?: string;
  aiPick?: string;
  excludeHubs?: string;
  missingAff?: string;
};

function nullsLastRank(
  a: number | null,
  b: number | null,
  asc: boolean
): number {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  return asc ? a - b : b - a;
}

function sortList(list: DealProduct[], sort: string | undefined): DealProduct[] {
  const s = sort ?? "ai_desc";
  const copy = [...list];
  if (s === "ai_asc") {
    copy.sort((a, b) => (a.aiScore ?? 0) - (b.aiScore ?? 0));
  } else if (s === "home_rank_asc") {
    copy.sort((a, b) =>
      nullsLastRank(a.homepageRank, b.homepageRank, true)
    );
  } else if (s === "best_rank_asc") {
    copy.sort((a, b) =>
      nullsLastRank(a.bestDealsRank, b.bestDealsRank, true)
    );
  } else if (s === "top10_rank_asc") {
    copy.sort((a, b) => nullsLastRank(a.top10Rank, b.top10Rank, true));
  } else {
    copy.sort((a, b) => (b.aiScore ?? 0) - (a.aiScore ?? 0));
  }
  return copy;
}

function filterProducts(products: DealProduct[], sp: Sp): DealProduct[] {
  let list = [...products];
  if (sp.published === "yes") list = list.filter((p) => p.published);
  else if (sp.published === "no") list = list.filter((p) => !p.published);
  if (sp.affiliate === "dedicated") {
    list = list.filter((p) => !p.usesProductUrlFallback);
  } else if (sp.affiliate === "fallback") {
    list = list.filter((p) => p.usesProductUrlFallback);
  }
  if (sp.missingAff === "yes") {
    list = list.filter((p) => p.usesProductUrlFallback);
  }
  if (sp.featured === "yes") list = list.filter((p) => p.featured);
  if (sp.trending === "yes") list = list.filter((p) => p.trending);
  if (sp.aiPick === "yes") list = list.filter((p) => p.aiPick);
  if (sp.excludeHubs === "yes") {
    list = list.filter((p) => p.excludeFromHubs);
  }
  return sortList(list, sp.sort);
}

function buildQuery(sp: Sp): string {
  const u = new URLSearchParams();
  if (sp.published) u.set("published", sp.published);
  if (sp.affiliate) u.set("affiliate", sp.affiliate);
  if (sp.featured === "yes") u.set("featured", "yes");
  if (sp.trending === "yes") u.set("trending", "yes");
  if (sp.aiPick === "yes") u.set("aiPick", "yes");
  if (sp.excludeHubs === "yes") u.set("excludeHubs", "yes");
  if (sp.missingAff === "yes") u.set("missingAff", "yes");
  if (sp.sort && sp.sort !== "ai_desc") u.set("sort", sp.sort);
  const s = u.toString();
  return s ? `?${s}` : "";
}

function isAllFiltersOff(sp: Sp): boolean {
  return (
    !sp.published &&
    !sp.affiliate &&
    sp.missingAff !== "yes" &&
    sp.featured !== "yes" &&
    sp.trending !== "yes" &&
    sp.aiPick !== "yes" &&
    sp.excludeHubs !== "yes"
  );
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

  const q = (patch: Partial<Sp>): string => {
    const merged = { ...sp } as Record<string, string | undefined>;
    for (const key of Object.keys(patch) as (keyof Sp)[]) {
      const v = patch[key];
      if (v === undefined) delete merged[key as string];
      else merged[key as string] = v;
    }
    return buildQuery(merged as Sp);
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
          href={`/admin/products${q({
            published: undefined,
            affiliate: undefined,
            missingAff: undefined,
            featured: undefined,
            trending: undefined,
            aiPick: undefined,
            excludeHubs: undefined,
          })}`}
          active={isAllFiltersOff(sp)}
        >
          All
        </FilterLink>
        <FilterLink
          href={`/admin/products${q({ published: "yes" })}`}
          active={sp.published === "yes"}
        >
          Published
        </FilterLink>
        <FilterLink
          href={`/admin/products${q({ published: "no" })}`}
          active={sp.published === "no"}
        >
          Unpublished
        </FilterLink>
        <span className="text-neutral-300">|</span>
        <FilterLink
          href={`/admin/products${q({
            affiliate: "dedicated",
            missingAff: undefined,
          })}`}
          active={sp.affiliate === "dedicated"}
        >
          Has affiliate link
        </FilterLink>
        <FilterLink
          href={`/admin/products${q({
            affiliate: "fallback",
            missingAff: undefined,
          })}`}
          active={sp.affiliate === "fallback"}
        >
          Fallback URL only
        </FilterLink>
        <FilterLink
          href={`/admin/products${q({ missingAff: "yes", affiliate: undefined })}`}
          active={sp.missingAff === "yes"}
        >
          Missing affiliate
        </FilterLink>
        <span className="text-neutral-300">|</span>
        <FilterLink
          href={`/admin/products${q({ featured: "yes" })}`}
          active={sp.featured === "yes"}
        >
          Featured
        </FilterLink>
        <FilterLink
          href={`/admin/products${q({ trending: "yes" })}`}
          active={sp.trending === "yes"}
        >
          Trending
        </FilterLink>
        <FilterLink
          href={`/admin/products${q({ aiPick: "yes" })}`}
          active={sp.aiPick === "yes"}
        >
          AI pick
        </FilterLink>
        <FilterLink
          href={`/admin/products${q({ excludeHubs: "yes" })}`}
          active={sp.excludeHubs === "yes"}
        >
          Excl. hubs
        </FilterLink>
        <span className="text-neutral-300">|</span>
        <FilterLink
          href={`/admin/products${q({ sort: "ai_desc" })}`}
          active={(sp.sort ?? "ai_desc") === "ai_desc"}
        >
          AI ↓
        </FilterLink>
        <FilterLink href={`/admin/products${q({ sort: "ai_asc" })}`} active={sp.sort === "ai_asc"}>
          AI ↑
        </FilterLink>
        <FilterLink
          href={`/admin/products${q({ sort: "home_rank_asc" })}`}
          active={sp.sort === "home_rank_asc"}
        >
          Home rank
        </FilterLink>
        <FilterLink
          href={`/admin/products${q({ sort: "best_rank_asc" })}`}
          active={sp.sort === "best_rank_asc"}
        >
          Best-deals rank
        </FilterLink>
        <FilterLink
          href={`/admin/products${q({ sort: "top10_rank_asc" })}`}
          active={sp.sort === "top10_rank_asc"}
        >
          Top10 rank
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
              <th className="px-4 py-3">Ops</th>
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
              const ops = [
                p.featured && "featured",
                p.trending && "trending",
                p.aiPick && "ai_pick",
                p.excludeFromHubs && "excl_hub",
              ].filter(Boolean);
              const ranks = [
                p.homepageRank != null && `h:${p.homepageRank}`,
                p.bestDealsRank != null && `b:${p.bestDealsRank}`,
                p.top10Rank != null && `t:${p.top10Rank}`,
              ].filter(Boolean);
              return (
                <Fragment key={p.id}>
                  <tr className="border-b border-neutral-100">
                    <td className="px-4 py-3 font-medium text-neutral-900">
                      <span className="line-clamp-2">{p.title}</span>
                      <div className="mt-1 text-xs text-neutral-400">{p.slug}</div>
                    </td>
                    <td className="px-4 py-3">{p.published ? "Yes" : "No"}</td>
                    <td className="px-4 py-3 text-xs text-amber-800">
                      <div>{flags.length ? flags.join(", ") : "—"}</div>
                      <div className="mt-1 text-neutral-600">
                        {ops.length ? ops.join(" · ") : "—"}
                      </div>
                      {ranks.length > 0 && (
                        <div className="mt-1 font-mono text-[10px] text-neutral-500">
                          {ranks.join(" ")}
                        </div>
                      )}
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
                  <tr className="border-b border-neutral-100 bg-neutral-50/50">
                    <td colSpan={5} className="px-4 py-3">
                      <ProductRowEditor product={p} />
                    </td>
                  </tr>
                </Fragment>
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
