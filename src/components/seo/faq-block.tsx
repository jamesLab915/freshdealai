type Item = { q: string; a: string };

export function FaqBlock({
  title = "FAQ",
  items,
}: {
  title?: string;
  items: Item[];
}) {
  return (
    <section className="mt-16 border-t border-neutral-200 pt-12">
      <h2 className="text-xl font-bold tracking-tight text-neutral-900">{title}</h2>
      <dl className="mt-8 space-y-8">
        {items.map((item) => (
          <div key={item.q}>
            <dt className="text-base font-semibold text-neutral-900">{item.q}</dt>
            <dd className="mt-2 text-sm leading-relaxed text-neutral-600">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
