/** Output shape for deal-engine AI copy (summary, reason, SEO, tags). */
export type GeneratedDealContent = {
  seoTitle: string;
  description: string;
  shortReview: string;
  tags: string[];
};
