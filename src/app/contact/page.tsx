import { LegalDoc } from "@/components/legal/legal-doc";
import { siteMetadata } from "@/lib/site-metadata";

export const metadata = siteMetadata({
  title: "Contact",
  description: "How to reach the FlashDealAI team.",
  path: "/contact",
});

export default function ContactPage() {
  return (
    <LegalDoc title="Contact">
      <p>
        We are building a lightweight support channel for merchants, press, and
        readers. For now, general inquiries can be directed to the operator email you
        configure in production (replace this paragraph in your deployment).
      </p>
      <p>
        <strong className="font-semibold text-neutral-900">Partnerships & data.</strong>{" "}
        For feed or API access, include your company name, use case, and expected
        volume.
      </p>
      <p>
        <strong className="font-semibold text-neutral-900">Bug reports.</strong> Include
        the page URL, browser, and steps to reproduce. Screenshots help.
      </p>
    </LegalDoc>
  );
}
