export const mockIngestionJobs = [
  {
    id: "job-1",
    source: "AMAZON_PA_API",
    status: "SUCCESS" as const,
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    finishedAt: new Date(Date.now() - 3500000).toISOString(),
    logs: "[info] Started PA-API search: headphones\n[info] Normalized 42 SKUs\n[warn] 3 items missing Buy Box price — skipped",
  },
  {
    id: "job-2",
    source: "SCRAPED_RETAILER",
    status: "RUNNING" as const,
    startedAt: new Date(Date.now() - 120000).toISOString(),
    finishedAt: null as string | null,
    logs: "[info] Fetching clearance hub…\n[info] robots.txt allowed section: /sale/",
  },
  {
    id: "job-3",
    source: "CSV_IMPORT",
    status: "FAILED" as const,
    startedAt: new Date(Date.now() - 86400000).toISOString(),
    finishedAt: new Date(Date.now() - 86350000).toISOString(),
    logs: "[error] Row 88: invalid price column\n[error] Aborted after 20 consecutive errors",
  },
];

export const mockSearchQueries = [
  { query: "nike shoes under 100", resultCount: 8 },
  { query: "best laptop deals", resultCount: 14 },
  { query: "skincare", resultCount: 6 },
  { query: "headphones", resultCount: 22 },
];

export const mockAiTasks = [
  {
    id: "ait-1",
    productId: "mock-1",
    taskType: "SCORE_DEAL",
    status: "SUCCESS" as const,
    createdAt: new Date().toISOString(),
  },
  {
    id: "ait-2",
    productId: "mock-2",
    taskType: "GENERATE_SEO",
    status: "PENDING" as const,
    createdAt: new Date().toISOString(),
  },
];
