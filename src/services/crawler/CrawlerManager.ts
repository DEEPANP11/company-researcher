import axios from "axios";
import * as cheerio from "cheerio";
import { CheerioCrawler } from "./CheerioCrawler";
import { PlaywrightCrawler } from "./PlaywrightCrawler";
import { UrlNormalizer } from "./UrlNormalizer";
import { RobotsParser } from "./RobotsParser";
import { logger } from "@/lib/logger";
import type { CrawledPageResult, CrawlResult, CrawlBudget } from "@/types";

const PRIORITY_KEYWORDS: [string, number][] = [
  ["about", 100],
  ["about-us", 100],
  ["our-company", 95],
  ["company", 90],
  ["products", 100],
  ["product", 95],
  ["services", 100],
  ["service", 95],
  ["solutions", 90],
  ["solution", 85],
  ["contact", 80],
  ["contact-us", 80],
  ["pricing", 70],
  ["price", 65],
  ["plans", 60],
  ["faq", 50],
  ["faqs", 50],
  ["team", 40],
  ["leadership", 40],
  ["management", 35],
  ["mission", 30],
  ["careers", 20],
  ["career", 20],
  ["jobs", 20],
  ["blog", 10],
  ["news", 10],
  ["press", 10],
];

export class CrawlerManager {
  private cheerio = new CheerioCrawler();
  private playwright = new PlaywrightCrawler();
  private normalizer = new UrlNormalizer();
  private robots = new RobotsParser();
  private visited = new Set<string>();

  private scoreUrl(url: string): number {
    const path = new URL(url).pathname.toLowerCase();
    for (const [keyword, score] of PRIORITY_KEYWORDS) {
      if (path.includes(keyword)) return score;
    }
    return 50;
  }

  private async checkSitemap(baseUrl: string): Promise<string[] | null> {
    try {
      const sitemapUrl = new URL("/sitemap.xml", baseUrl).toString();
      const { data } = await axios.get(sitemapUrl, { timeout: 10000 });
      const $ = cheerio.load(data, { xmlMode: true });

      const urls: string[] = [];
      $("url > loc").each((_, el) => {
        const loc = $(el).text().trim();
        if (loc) urls.push(loc);
      });

      if (urls.length > 0) {
        logger.info({ baseUrl, urlsFound: urls.length }, "Sitemap found");
        return urls;
      }
      return null;
    } catch {
      return null;
    }
  }

  async crawl(
    baseUrl: string,
    budget: CrawlBudget
  ): Promise<CrawlResult> {
    const startTime = Date.now();
    this.visited.clear();
    const errors: string[] = [];

    const urlObj = new URL(baseUrl);
    const rootUrl = urlObj.origin;

    await this.robots.load(rootUrl);

    if (!this.robots.isAllowed(rootUrl)) {
      return {
        pages: [],
        totalChars: 0,
        durationMs: 0,
        sitemapUsed: false,
        errors: ["Crawling disallowed by robots.txt"],
      };
    }

    let sitemapUsed = false;
    const sitemapUrls = await this.checkSitemap(rootUrl);

    let pagesToCrawl: string[] = [];

    if (sitemapUrls) {
      sitemapUsed = true;
      const filtered = sitemapUrls
        .map((u) => {
          try {
            const normalized = this.normalizer.normalize(u, rootUrl);
            if (normalized && this.robots.isAllowed(normalized)) {
              return normalized;
            }
            return null;
          } catch {
            return null;
          }
        })
        .filter((u): u is string => u !== null);

      filtered.sort((a, b) => this.scoreUrl(b) - this.scoreUrl(a));
      pagesToCrawl = filtered.slice(0, budget.maxPages);
      pagesToCrawl = [rootUrl, ...pagesToCrawl.filter((u) => u !== rootUrl)];
    } else {
      const homeResult = await this.cheerio.fetchPage(rootUrl);
      if (!homeResult) {
        const pwResult = await this.playwright.fetchPage(rootUrl);
        if (!pwResult) {
          return {
            pages: [],
            totalChars: 0,
            durationMs: Date.now() - startTime,
            sitemapUsed: false,
            errors: ["Failed to fetch homepage"],
          };
        }
        const links = this.playwright.extractLinks(
          pwResult.html,
          rootUrl
        );
        pagesToCrawl = this.buildPriorityQueue(rootUrl, links, budget);
      } else {
        const links = this.cheerio.extractLinks(
          homeResult.html,
          rootUrl
        );
        pagesToCrawl = this.buildPriorityQueue(rootUrl, links, budget);
      }
    }

    const crawled: CrawledPageResult[] = [];
    let totalChars = 0;

    for (const url of pagesToCrawl) {
      if (this.visited.has(url)) continue;
      if (totalChars >= budget.maxChars) break;
      if (Date.now() - startTime > budget.timeoutMs) {
        errors.push("Crawl timeout reached");
        break;
      }

      this.visited.add(url);

      const depth = this.getDepth(rootUrl, url);
      if (depth > budget.maxDepth) continue;

      let pageData = await this.cheerio.fetchPage(url);
      let content = "";

      if (pageData) {
        content = this.cheerio.extractContent(pageData.html);
      } else {
        pageData = await this.playwright.fetchPage(url);
        if (pageData) {
          content = this.playwright.extractContent(pageData.html);
        }
      }

      if (!pageData || !content) {
        errors.push(`Failed to fetch: ${url}`);
        continue;
      }

      const title = pageData
        ? this.cheerio.extractTitle(pageData.html) ||
          this.playwright.extractTitle(pageData.html)
        : "";

      const charsToAdd = Math.min(
        content.length,
        budget.maxChars - totalChars
      );

      if (charsToAdd > 0) {
        crawled.push({
          url,
          title,
          content: content.substring(0, charsToAdd),
          depth,
          sizeBytes: new Blob([content]).size,
        });
        totalChars += charsToAdd;
      }

      if (crawled.length >= budget.maxPages) break;
    }

    logger.info(
      {
        crawled: crawled.length,
        totalChars,
        duration: Date.now() - startTime,
        sitemapUsed,
      },
      "Crawl completed"
    );

    return {
      pages: crawled,
      totalChars,
      durationMs: Date.now() - startTime,
      sitemapUsed,
      errors,
    };
  }

  private buildPriorityQueue(
    rootUrl: string,
    links: string[],
    budget: CrawlBudget
  ): string[] {
    const scored = new Map<string, number>();

    for (const link of links) {
      try {
        if (this.visited.has(link)) continue;

        const u = new URL(link);
        if (u.hostname.replace("www.", "") !== new URL(rootUrl).hostname.replace("www.", "")) continue;

        const score = this.scoreUrl(link);
        const existing = scored.get(link) || 0;
        if (score > existing) {
          scored.set(link, score);
        }
      } catch {
        continue;
      }
    }

    const sorted = Array.from(scored.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([url]) => url);

    return [rootUrl, ...sorted].slice(0, budget.maxPages);
  }

  private getDepth(rootUrl: string, url: string): number {
    try {
      const root = new URL(rootUrl).pathname;
      const target = new URL(url).pathname;

      if (target === root || target === root + "/") return 0;

      const rootParts = root.replace(/\/$/, "").split("/").filter(Boolean);
      const targetParts = target
        .replace(/\/$/, "")
        .split("/")
        .filter(Boolean);

      return targetParts.length - rootParts.length;
    } catch {
      return 99;
    }
  }
}
