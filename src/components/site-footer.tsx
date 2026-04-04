import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-semibold text-neutral-900">FlashDealAI</p>
            <p className="mt-2 text-sm leading-relaxed text-neutral-600">
              Curated US retail deals with AI summaries and price context. Always verify
              price and availability at checkout.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">Explore</p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/deals" className="hover:text-[var(--accent)]">
                  All deals
                </Link>
              </li>
              <li>
                <Link href="/ai-picks" className="hover:text-[var(--accent)]">
                  AI Picks
                </Link>
              </li>
              <li>
                <Link href="/search" className="hover:text-[var(--accent)]">
                  Search
                </Link>
              </li>
              <li>
                <Link href="/best-deals" className="hover:text-[var(--accent)]">
                  Best deals today
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">Trust &amp; legal</p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/about#affiliate" className="hover:text-[var(--accent)]">
                  Affiliate disclosure
                </Link>
              </li>
              <li>
                <Link href="/amazon-disclosure" className="hover:text-[var(--accent)]">
                  Amazon Associates
                </Link>
              </li>
              <li>
                <Link href="/about#methodology" className="hover:text-[var(--accent)]">
                  Methodology
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[var(--accent)]">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[var(--accent)]">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[var(--accent)]">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-neutral-900">Operators</p>
            <ul className="mt-3 space-y-2 text-sm text-neutral-600">
              <li>
                <Link href="/admin" className="hover:text-[var(--accent)]">
                  Admin console
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-neutral-500">
          Outbound links may include affiliate tracking; we may earn a commission.
        </p>
        <p className="mt-2 text-center text-xs text-neutral-500">
          © {new Date().getFullYear()} FlashDealAI. Information is for reference only.
        </p>
      </div>
    </footer>
  );
}
