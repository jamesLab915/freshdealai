import Link from "next/link";

import { LegalDoc } from "@/components/legal/legal-doc";
import { siteMetadata } from "@/lib/site-metadata";

export const metadata = siteMetadata({
  title: "Privacy Policy",
  description:
    "How FlashDealAI collects and uses information when you browse deals and use outbound links.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <LegalDoc title="Privacy Policy">
      <p>
        This policy describes how FlashDealAI (“we”) handles information when you use
        this website. It is provided for transparency; have it reviewed by qualified
        counsel before relying on it for compliance.
      </p>
      <p>
        <strong className="font-semibold text-neutral-900">What we collect.</strong> We
        may log standard server data (such as approximate region, browser type, and
        pages viewed) to operate and secure the service. Deal pages may include
        affiliate parameters when you leave for a retailer; those merchants have their
        own privacy practices.
      </p>
      <p>
        <strong className="font-semibold text-neutral-900">Local storage.</strong>{" "}
        Product features such as saved deals or recent views may use your browser’s
        local storage only on your device — not on our servers unless you sign in to a
        future account system.
      </p>
      <p>
        <strong className="font-semibold text-neutral-900">Contact.</strong> Questions
        about this policy can be sent through the{" "}
        <Link href="/contact" className="font-medium text-[var(--accent)] hover:underline">
          contact
        </Link>{" "}
        page.
      </p>
    </LegalDoc>
  );
}
