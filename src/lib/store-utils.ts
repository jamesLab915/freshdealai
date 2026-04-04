import type { DealProduct } from "@/types/deal";

/** Human-readable retailer name for cards (Slickdeals-style store pill). */
export function guessStoreLabel(productUrl: string): string {
  let host: string;
  try {
    host = new URL(productUrl).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "Store";
  }
  if (host.includes("amazon") || host === "a.co" || host.includes("amzn.")) {
    return "Amazon";
  }
  if (host.includes("bestbuy")) return "Best Buy";
  if (host.includes("target")) return "Target";
  if (host.includes("walmart")) return "Walmart";
  if (host.includes("costco")) return "Costco";
  if (host.includes("newegg")) return "Newegg";
  if (host.includes("nike")) return "Nike";
  if (host.includes("rei")) return "REI";
  if (host.includes("apple")) return "Apple";
  if (host.includes("google")) return "Google Store";
  if (host.includes("levi")) return "Levi's";
  if (host.includes("columbia")) return "Columbia";
  if (host.includes("fromourplace")) return "Our Place";
  const part = host.split(".")[0];
  return part ? part.charAt(0).toUpperCase() + part.slice(1) : "Store";
}

export function formatDealAge(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  if (diff < 0) return "Just now";
  const mins = Math.floor(diff / 60000);
  if (mins < 90) return mins <= 1 ? "Just now" : `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 36) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export function dealMatchesStore(deal: DealProduct, storeSlug: string): boolean {
  let host: string;
  try {
    host = new URL(deal.productUrl).hostname.replace(/^www\./, "");
  } catch {
    return false;
  }
  const map: Record<string, string[]> = {
    amazon: ["amazon.com", "amzn.com", "a.co"],
    "best-buy": ["bestbuy.com"],
    target: ["target.com"],
    walmart: ["walmart.com"],
    "nike-store": ["nike.com"],
    rei: ["rei.com"],
  };
  const hosts = map[storeSlug];
  if (!hosts) return false;
  return hosts.some((h) => host === h || host.endsWith(`.${h}`));
}
