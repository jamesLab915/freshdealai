"use client";

import { cn } from "@/lib/utils";
import {
  buildOutboundPath,
  recordAffiliateClick,
  type AffiliateClickPayload,
} from "@/lib/affiliate";

type Props = {
  absoluteUrl: string;
  surface: AffiliateClickPayload["surface"];
  dealId?: string;
  slug?: string;
  className?: string;
  children: React.ReactNode;
};

export function AffiliateOutboundLink({
  absoluteUrl,
  surface,
  dealId,
  slug,
  className,
  children,
}: Props) {
  const href = buildOutboundPath(absoluteUrl);
  return (
    <a
      href={href}
      target="_blank"
      rel="nofollow sponsored"
      className={cn(className)}
      onClick={() =>
        recordAffiliateClick({ surface, destination: absoluteUrl, dealId, slug })
      }
    >
      {children}
    </a>
  );
}
