import { LegalDoc } from "@/components/legal/legal-doc";
import { siteMetadata } from "@/lib/site-metadata";

export const metadata = siteMetadata({
  title: "Amazon Associates Disclosure",
  description:
    "Disclosure for links that participate in the Amazon Associates program.",
  path: "/amazon-disclosure",
});

export default function AmazonDisclosurePage() {
  return (
    <LegalDoc title="Amazon Associates Disclosure">
      <p>
        FlashDealAI is a participant in the Amazon Services LLC Associates Program, an
        affiliate advertising program designed to provide a means for sites to earn
        advertising fees by advertising and linking to Amazon.com and other Amazon
        sites that display the Associates branding.
      </p>
      <p>
        When you click an Amazon outbound link from this site, we may receive a
        commission on qualifying purchases at no extra cost to you. Amazon and the
        Amazon logo are trademarks of Amazon.com, Inc. or its affiliates.
      </p>
      <p>
        Program rules vary by region. Align this disclosure with your signed Amazon
        Associates Operating Agreement and any local advertising requirements.
      </p>
    </LegalDoc>
  );
}
