/**
 * Lightweight client-side analytics — console + structured localStorage.
 * Replace with Segment / GA / PostHog when ready.
 */
const STORAGE_KEY = "flashdeal-tracking-v1";
const MAX_EVENTS = 250;

export type TrackingEvent =
  | {
      type: "affiliate_click";
      surface?: string;
      dealId?: string;
      slug?: string;
    }
  | { type: "save_deal"; slug: string; saved: boolean }
  | { type: "recently_viewed"; slug: string }
  | { type: "search_submit"; query: string };

export type TrackingRecord = TrackingEvent & { t: string };

function persist(entry: TrackingRecord): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const arr: TrackingRecord[] = raw ? JSON.parse(raw) : [];
    arr.push(entry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(arr.slice(-MAX_EVENTS)));
  } catch {
    /* quota / private mode */
  }
}

export function track(event: TrackingEvent): void {
  const record: TrackingRecord = { ...event, t: new Date().toISOString() };
  console.info("[FlashDealAI track]", record);
  persist(record);
}

export function readTrackingEvents(): TrackingRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as TrackingRecord[]) : [];
  } catch {
    return [];
  }
}

/** Aggregate for admin / debug */
export function summarizeLocalTracking(events: TrackingRecord[]) {
  const clicksBySlug: Record<string, number> = {};
  const searches: Record<string, number> = {};
  for (const e of events) {
    if (e.type === "affiliate_click" && e.slug) {
      clicksBySlug[e.slug] = (clicksBySlug[e.slug] ?? 0) + 1;
    }
    if (e.type === "search_submit" && e.query) {
      const q = e.query.trim().toLowerCase().slice(0, 80);
      if (q) searches[q] = (searches[q] ?? 0) + 1;
    }
  }
  const topClicks = Object.entries(clicksBySlug)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  const topSearches = Object.entries(searches)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);
  return { topClicks, topSearches, totalEvents: events.length };
}
