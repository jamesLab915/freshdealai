import Link from "next/link";

import { LegalDoc } from "@/components/legal/legal-doc";
import { siteMetadata } from "@/lib/site-metadata";

export const metadata = siteMetadata({
  title: "Terms of Use",
  description: "Terms of use for browsing FlashDealAI and following outbound deal links.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <LegalDoc title="Terms of Use">
      <p>
        By using FlashDealAI, you agree to these terms. They are not legal advice;
        consult an attorney for your situation.
      </p>
      <p>
        <strong className="font-semibold text-neutral-900">Informational content.</strong>{" "}
        Listings, prices, and AI-generated summaries are for convenience only.
        Retailers set final prices, taxes, shipping, and availability. We do not
        guarantee that any offer will be available at checkout.
      </p>
      <p>
        <strong className="font-semibold text-neutral-900">Affiliate relationships.</strong>{" "}
        We may earn commissions when you use outbound links. See{" "}
        <Link href="/about#affiliate" className="font-medium text-[var(--accent)] hover:underline">
          Affiliate disclosure
        </Link>{" "}
        and{" "}
        <Link
          href="/amazon-disclosure"
          className="font-medium text-[var(--accent)] hover:underline"
        >
          Amazon Associates disclosure
        </Link>
        .
      </p>
      <p>
        <strong className="font-semibold text-neutral-900">Limitation.</strong> To the
        fullest extent permitted by law, FlashDealAI is provided “as is” without
        warranties of any kind. Your sole remedy for dissatisfaction is to stop using
        the site.
      </p>
    </LegalDoc>
  );
}
