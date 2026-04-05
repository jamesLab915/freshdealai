/**
 * Phase-1 pricing without PA-API: deterministic "sale" numbers per product key (ASIN / external_id).
 * Used so UI can show list price, discount %, and Save $ (see `isPriceContextIncomplete`).
 */

export type SyntheticPriceFields = {
  /** Maps to FetchedDeal.price / Product.current_price */
  currentPrice: number;
  /** Maps to FetchedDeal.originalPrice / Product.original_price */
  originalPrice: number;
  /** Maps to FetchedDeal.discount / Product.discount_percent — always > 10 */
  discountPercent: number;
};

function hash32(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

/**
 * Deterministic pseudo-random in [0, 1) from string + salt.
 */
function unitInterval(key: string, salt: string): number {
  const x = hash32(`${salt}:${key}`);
  return (x % 1_000_000) / 1_000_000;
}

/**
 * Synthetic Amazon-style shelf pricing (no live API).
 * - current_price: USD 20.00–80.00 (cent precision)
 * - original_price: current × multiplier, multiplier in [1.30, 2.00]
 * - discount_percent: computed from list vs sale, always ≥ 11
 */
export function syntheticPriceFieldsForProductKey(key: string): SyntheticPriceFields {
  const uCurrent = unitInterval(key, "current");
  const uMult = unitInterval(key, "mult");

  // 20.00 .. 80.00 inclusive
  const currentPrice = Math.round((20 + uCurrent * 60) * 100) / 100;

  // 1.30 .. 2.00 inclusive
  const mult = 1.3 + uMult * 0.7;
  let originalPrice = Math.round(currentPrice * mult * 100) / 100;

  if (originalPrice <= currentPrice) {
    originalPrice = Math.round(currentPrice * 1.31 * 100) / 100;
  }

  let discountPercent = Math.round(
    ((originalPrice - currentPrice) / originalPrice) * 100
  );

  if (discountPercent <= 10) {
    originalPrice = Math.round(currentPrice * 1.12 * 100) / 100;
    discountPercent = Math.round(
      ((originalPrice - currentPrice) / originalPrice) * 100
    );
  }

  discountPercent = Math.min(95, Math.max(11, discountPercent));

  return {
    currentPrice,
    originalPrice,
    discountPercent,
  };
}
