import axios from "axios";
import * as cheerio from "cheerio";
import { UrlNormalizer } from "./UrlNormalizer";
import { ContentCleaner } from "./ContentCleaner";
import { logger } from "@/lib/logger";

export class CheerioCrawler {
  private normalizer = new UrlNormalizer();
  private cleaner = new ContentCleaner();

  async fetchPage(
    url: string
  ): Promise<{ html: string; links: string[] } | null> {
    try {
      const { data: html } = await axios.get<string>(url, {
        timeout: 15000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; CompanyResearchBot/1.0; +https://company-researcher.app)",
          Accept: "text/html,application/xhtml+xml",
        },
      });

      const $ = cheerio.load(html);
      const links: string[] = [];

      $("a[href]").each((_, el) => {
        const href = $(el).attr("href");
        if (href) links.push(href);
      });

      return { html, links };
    } catch (err) {
      logger.warn({ url, err }, "Cheerio fetch failed");
      return null;
    }
  }

  extractContent(html: string): string {
    return this.cleaner.clean(html);
  }

  extractTitle(html: string): string {
    const $ = cheerio.load(html);
    return $("title").text().trim() || $("h1").first().text().trim() || "";
  }

  extractLinks(html: string, baseUrl: string): string[] {
    const $ = cheerio.load(html);
    const links = new Set<string>();

    $("a[href]").each((_, el) => {
      const href = $(el).attr("href");
      if (href) {
        const normalized = this.normalizer.normalize(href, baseUrl);
        if (normalized) links.add(normalized);
      }
    });

    return Array.from(links);
  }
}
