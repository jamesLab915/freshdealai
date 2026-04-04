const SAVED_KEY = "flashdeal-saved-slugs-v1";
const RECENT_KEY = "flashdeal-recent-slugs-v1";
const MAX_RECENT = 10;

function parseList(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw) as unknown;
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export function getSavedSlugs(): string[] {
  if (typeof window === "undefined") return [];
  return parseList(localStorage.getItem(SAVED_KEY));
}

export function isSlugSaved(slug: string): boolean {
  return getSavedSlugs().includes(slug);
}

export function toggleSavedSlug(slug: string): boolean {
  if (typeof window === "undefined") return false;
  const cur = getSavedSlugs();
  const next = cur.includes(slug)
    ? cur.filter((s) => s !== slug)
    : [...cur, slug];
  localStorage.setItem(SAVED_KEY, JSON.stringify(next));
  return next.includes(slug);
}

export function pushRecentSlug(slug: string): void {
  if (typeof window === "undefined") return;
  const cur = parseList(localStorage.getItem(RECENT_KEY)).filter((s) => s !== slug);
  const next = [slug, ...cur].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

export function getRecentSlugs(exclude?: string): string[] {
  if (typeof window === "undefined") return [];
  return parseList(localStorage.getItem(RECENT_KEY)).filter((s) => s !== exclude);
}
