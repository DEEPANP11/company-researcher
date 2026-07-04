export type CrawlBudget = {
  maxPages: number;
  maxDepth: number;
  maxChars: number;
  timeoutMs: number;
};

export type CrawledPageResult = {
  url: string;
  title: string;
  content: string;
  depth: number;
  sizeBytes: number;
};

export type CrawlResult = {
  pages: CrawledPageResult[];
  totalChars: number;
  durationMs: number;
  sitemapUsed: boolean;
  errors: string[];
};

export type PageScore = {
  url: string;
  priority: number;
  depth: number;
};

export type RobotsRule = {
  userAgent: string;
  disallow: string[];
  allow: string[];
};
