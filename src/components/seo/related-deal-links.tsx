import Link from "next/link";

export type RelatedLink = { href: string; label: string; description?: string };

export function RelatedDealLinks({
  title = "Related pages",
  links,
}: {
  title?: string;
  links: RelatedLink[];
}) {
  return (
    <section className="mt-12 rounded-2xl border border-neutral-200/90 bg-gradient-to-br from-neutral-50/80 to-white p-6 sm:p-8">
      <h2 className="text-lg font-bold text-neutral-900">{title}</h2>
      <ul className="mt-5 grid gap-4 sm:grid-cols-2">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="group block rounded-xl border border-transparent bg-white/80 px-4 py-3 shadow-sm transition-all hover:border-[var(--accent-soft)] hover:shadow-md"
            >
              <span className="font-semibold text-neutral-900 group-hover:text-[var(--accent)]">
                {l.label} →
              </span>
              {l.description && (
                <span className="mt-1 block text-sm text-neutral-500">{l.description}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
