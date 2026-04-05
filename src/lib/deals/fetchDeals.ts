/**
 * Multi-source deal fetch — curated Amazon ASIN feed for deal-engine; PA-API stubs for scale later.
 *
 * Prices: `syntheticPriceFieldsForProductKey` (no PA-API) — stable per ASIN, list vs sale, discount > 10%.
 */

import { amazonWidgetImageUrl } from "@/lib/amazon-media";
import { syntheticPriceFieldsForProductKey } from "@/lib/deals/syntheticAmazonPricing";

export type FetchedDeal = {
  id: string;
  title: string;
  price: number;
  originalPrice: number | null;
  discount: number | null;
  image: string | null;
  url: string;
  source: "fake_api" | "amazon" | "walmart";
  category: string;
  createdAt: string;
};

export type AmazonSearchParams = {
  keywords: string;
  marketplace?: string;
};

export type WalmartSearchParams = {
  query: string;
};

/** Official Amazon product image — uses Associates widget URL (redirects to CDN; fewer 404s than raw P/ASIN). */
export function amazonProductImageUrl(asin: string): string {
  return amazonWidgetImageUrl(asin);
}

/** Canonical US detail URL — no ref params; affiliate tag applied in `applyAffiliateTags` at persist. */
export function amazonProductUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}`;
}

type CuratedRow = Pick<
  FetchedDeal,
  "id" | "title" | "image" | "url" | "category"
>;

function withSyntheticPricing(base: CuratedRow, now: string): FetchedDeal {
  const p = syntheticPriceFieldsForProductKey(base.id);
  return {
    ...base,
    price: p.currentPrice,
    originalPrice: p.originalPrice,
    discount: p.discountPercent,
    source: "amazon",
    createdAt: now,
  };
}

/**
 * Curated real ASINs (electronics, home & kitchen, health & fitness, small gadgets).
 * Sale/list amounts come from `syntheticPriceFieldsForProductKey` until PA-API is wired.
 */
function amazonCuratedCatalog(): FetchedDeal[] {
  const now = new Date().toISOString();
  const rows: CuratedRow[] = [
    {
      id: "B09XS7JWHH",
      title:
        "Sony WH-1000XM5 Wireless Noise Canceling Headphones, Black (Alexa built-in)",
      image: amazonProductImageUrl("B09XS7JWHH"),
      url: amazonProductUrl("B09XS7JWHH"),
      category: "Electronics",
    },
    {
      id: "B0CHWRXH8B",
      title:
        "Apple AirPods Pro (2nd Generation) Wireless Earbuds with MagSafe USB-C Charging Case",
      image: amazonProductImageUrl("B0CHWRXH8B"),
      url: amazonProductUrl("B0CHWRXH8B"),
      category: "Electronics",
    },
    {
      id: "B08KTZ824D",
      title:
        'Amazon Kindle Paperwhite (16 GB) — 6.8" glare-free display, adjustable warm light',
      image: amazonProductImageUrl("B08KTZ824D"),
      url: amazonProductUrl("B08KTZ824D"),
      category: "Electronics",
    },
    {
      id: "B0CGVNVD2W",
      title: "Google Pixel 8 — Unlocked Android 5G smartphone, 128 GB (Obsidian)",
      image: amazonProductImageUrl("B0CGVNVD2W"),
      url: amazonProductUrl("B0CGVNVD2W"),
      category: "Electronics",
    },
    {
      id: "B0BSHF7WH5",
      title: "Amazon Echo Dot (5th Gen, 2022 release) — Smart speaker with Alexa",
      image: amazonProductImageUrl("B0BSHF7WH5"),
      url: amazonProductUrl("B0BSHF7WH5"),
      category: "Electronics",
    },
    {
      id: "B09QXF2FW1",
      title:
        "Amazon Fire TV Stick 4K Max streaming device, Wi-Fi 6, Alexa Voice Remote",
      image: amazonProductImageUrl("B09QXF2FW1"),
      url: amazonProductUrl("B09QXF2FW1"),
      category: "Electronics",
    },
    {
      id: "B088HHWC4T",
      title:
        'Samsung 32" Odyssey G5 Gaming Monitor, WQHD (2560x1440), 165Hz, FreeSync Premium',
      image: amazonProductImageUrl("B088HHWC4T"),
      url: amazonProductUrl("B088HHWC4T"),
      category: "Electronics",
    },
    {
      id: "B0CDP4L9XK",
      title:
        "Bose QuietComfort Ultra Wireless Noise Cancelling Earbuds, Spatial Audio",
      image: amazonProductImageUrl("B0CDP4L9XK"),
      url: amazonProductUrl("B0CDP4L9XK"),
      category: "Electronics",
    },
    {
      id: "B0B7H9V4K2",
      title:
        "Logitech MX Keys S Wireless Keyboard — Backlit keys, Bluetooth, USB-C rechargeable",
      image: amazonProductImageUrl("B0B7H9V4K2"),
      url: amazonProductUrl("B0B7H9V4K2"),
      category: "Electronics",
    },
    {
      id: "B0CJB5Q12C",
      title: "Anker Prime 100W USB-C GaN Charger — 3 ports, compact foldable plug",
      image: amazonProductImageUrl("B0CJB5Q12C"),
      url: amazonProductUrl("B0CJB5Q12C"),
      category: "Electronics",
    },
    {
      id: "B09V3KXJPB",
      title: "Apple 20W USB-C Power Adapter (for iPhone, iPad, AirPods)",
      image: amazonProductImageUrl("B09V3KXJPB"),
      url: amazonProductUrl("B09V3KXJPB"),
      category: "Electronics",
    },
    {
      id: "B07ZPKBL9V",
      title:
        'Amazon Fire HD 10 tablet, 10.1", 1080p Full HD, 32 GB (2021 release)',
      image: amazonProductImageUrl("B07ZPKBL9V"),
      url: amazonProductUrl("B07ZPKBL9V"),
      category: "Electronics",
    },
    {
      id: "B00FLYWNYQ",
      title:
        "Instant Pot Duo 7-in-1 Electric Pressure Cooker, Slow Cooker, Rice Cooker, 6 Quart",
      image: amazonProductImageUrl("B00FLYWNYQ"),
      url: amazonProductUrl("B00FLYWNYQ"),
      category: "Home & Kitchen",
    },
    {
      id: "B08FHQZ8D8",
      title:
        "Dyson V15 Detect Cordless Vacuum — Laser dust detection, HEPA filtration",
      image: amazonProductImageUrl("B08FHQZ8D8"),
      url: amazonProductUrl("B08FHQZ8D8"),
      category: "Home & Kitchen",
    },
    {
      id: "B095S77FH4",
      title:
        "Ninja Foodi XL 10-in-1 Pro Air Fry Oven — Digital countertop oven, stainless steel",
      image: amazonProductImageUrl("B095S77FH4"),
      url: amazonProductUrl("B095S77FH4"),
      category: "Home & Kitchen",
    },
    {
      id: "B0BYJH6J8V",
      title:
        "Stanley Quencher H2.0 FlowState Tumbler 40 oz — Stainless steel insulated cup",
      image: amazonProductImageUrl("B0BYJH6J8V"),
      url: amazonProductUrl("B0BYJH6J8V"),
      category: "Home & Kitchen",
    },
    {
      id: "B0BPX9FNLC",
      title:
        "Ring Battery Doorbell Plus — Head-to-toe HD video, night vision, motion alerts",
      image: amazonProductImageUrl("B0BPX9FNLC"),
      url: amazonProductUrl("B0BPX9FNLC"),
      category: "Home & Kitchen",
    },
    {
      id: "B0BQXWQ8Z5",
      title: "Nike Men's Air Zoom Pegasus 40 Road Running Shoes",
      image: amazonProductImageUrl("B0BQXWQ8Z5"),
      url: amazonProductUrl("B0BQXWQ8Z5"),
      category: "Health & Fitness",
    },
    {
      id: "B0CCXH8XK2",
      title:
        "Fitbit Charge 6 Fitness Tracker — GPS, heart rate, Google apps, 6 months membership",
      image: amazonProductImageUrl("B0CCXH8XK2"),
      url: amazonProductUrl("B0CCXH8XK2"),
      category: "Health & Fitness",
    },
    {
      id: "B08K4SJ8QZ",
      title: "Theragun Mini Portable Massage Gun — Compact deep tissue percussion",
      image: amazonProductImageUrl("B08K4SJ8QZ"),
      url: amazonProductUrl("B08K4SJ8QZ"),
      category: "Health & Fitness",
    },
    {
      id: "B09WYX8N8N",
      title: "Garmin Forerunner 255 Music — GPS running smartwatch with music storage",
      image: amazonProductImageUrl("B09WYX8N8N"),
      url: amazonProductUrl("B09WYX8N8N"),
      category: "Health & Fitness",
    },
    {
      id: "B07H5K7J2P",
      title:
        "Osprey Farpoint 40 Travel Backpack — Carry-on size, laptop sleeve, unisex",
      image: amazonProductImageUrl("B07H5K7J2P"),
      url: amazonProductUrl("B07H5K7J2P"),
      category: "Health & Fitness",
    },
  ];

  return rows.map((r) => withSyntheticPricing(r, now));
}

/** Apply synthetic pricing to any fetched deal (e.g. future PA-API rows without list price). */
export function applySyntheticPricingToFetchedDeal(deal: FetchedDeal): FetchedDeal {
  const p = syntheticPriceFieldsForProductKey(deal.id);
  return {
    ...deal,
    price: p.currentPrice,
    originalPrice: p.originalPrice,
    discount: p.discountPercent,
  };
}

/** Placeholder — wire Product Advertising API credentials + request signing. */
export async function fetchAmazonDeals(
  params: AmazonSearchParams
): Promise<FetchedDeal[]> {
  void params;
  return [];
}

/** Placeholder — wire Walmart affiliate / catalog API when available. */
export async function fetchWalmartDeals(
  params: WalmartSearchParams
): Promise<FetchedDeal[]> {
  void params;
  return [];
}

/**
 * Aggregate deals: curated Amazon ASINs + PA-API / Walmart when implemented.
 */
export async function fetchDeals(): Promise<FetchedDeal[]> {
  const [curated, amazon, walmart] = await Promise.all([
    Promise.resolve(amazonCuratedCatalog()),
    fetchAmazonDeals({ keywords: "deals" }),
    fetchWalmartDeals({ query: "sale" }),
  ]);
  const merged = [...curated, ...amazon, ...walmart];
  return merged.map((d) =>
    d.originalPrice != null && d.discount != null && d.discount > 10
      ? d
      : applySyntheticPricingToFetchedDeal(d)
  );
}
