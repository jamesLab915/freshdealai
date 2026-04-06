export {
  categoryNameToSlug,
  categorySlugFromProductHints,
  extractNumericHintsFromQuery,
  formatSearchIntentExplanation,
  isKnownStoreSlug,
  matchBrandSlugFromQueryText,
  matchCategorySlugFromQueryText,
  matchStoreSlugFromQueryText,
  validateSearchUrlFilters,
} from "@/lib/search/search-intent";
export type {
  NumericQueryHints,
  SearchIntentExplanationParts,
  UrlFilterValidity,
} from "@/lib/search/search-intent";
