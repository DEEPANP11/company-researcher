import { UrlNormalizer } from "./UrlNormalizer";
import { ContentCleaner } from "./ContentCleaner";
import { logger } from "@/lib/logger";

export class PlaywrightCrawler {
  private normalizer = new UrlNormalizer();
  private cleaner = new ContentCleaner();

  async fetchPage(
    url: string
  ): Promise<{ html: string; links: string[] } | null> {
    let browser;
    try {
      // @ts-expect-error - playwright-core not installed on Vercel
      const { chromium } = await import("playwright-core");
      browser = await chromium.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();
      await page.setViewportSize({ width: 1280, height: 800 });

      await page.goto(url, {
        waitUntil: "networkidle",
        timeout: 30000,
      });

      const html = await page.content();
      const links = await page.evaluate(() =>
        Array.from(document.querySelectorAll("a[href]")).map(
          (a) => (a as HTMLAnchorElement).href
        )
      );

      return { html, links };
    } catch (err) {
      logger.warn({ url, err }, "Playwright fetch failed");
      return null;
    } finally {
      if (browser) await browser.close().catch(() => {});
    }
  }

  extractContent(html: string): string {
    return this.cleaner.clean(html);
  }

  extractTitle(html: string): string {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : "";
  }

  extractLinks(html: string, baseUrl: string): string[] {
    const links = new Set<string>();
    const linkRegex = /<a[^>]+href=["']([^"']+)["']/gi;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      const normalized = this.normalizer.normalize(match[1], baseUrl);
      if (normalized) links.add(normalized);
    }
    return Array.from(links);
  }
}
