/** UI + API shape for a deal card / detail (DB-agnostic). */
export type DealProduct = {
  id: string;
  slug: string;
  source: string;
  title: string;
  normalizedTitle?: string | null;
  brand: string | null;
  category: string | null;
  subcategory?: string | null;
  imageUrl: string | null;
  productUrl: string;
  /**
   * Outbound monetization URL — always resolved: `affiliate_url ?? product_url`.
   */
  affiliateUrl: string;
  /** True when no dedicated affiliate link in storage (fallback to product URL). */
  usesProductUrlFallback: boolean;
  currency: string;
  currentPrice: number;
  originalPrice: number | null;
  discountPercent: number | null;
  aiScore: number | null;
  aiSummary: string | null;
  aiReasonToBuy: string | null;
  availability?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  tags: string[];
  published: boolean;
  seoTitle?: string | null;
  seoDescription?: string | null;
  lastSeenAt: string;
  priceHistory?: { price: number; capturedAt: string }[];
};

export type CategoryMeta = {
  name: string;
  slug: string;
  description: string;
  dealCount: number;
};

export type BrandMeta = {
  name: string;
  slug: string;
  dealCount: number;
};

export type StoreMeta = {
  name: string;
  slug: string;
  domain: string;
  dealCount: number;
};

export type SeoGuideLink = {
  title: string;
  href: string;
  blurb: string;
};
