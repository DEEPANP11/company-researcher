import { WebsiteFinder } from "./WebsiteFinder";
import { CompetitorVerifier } from "./CompetitorVerifier";
import { SerperClient } from "@/services/search/SerperClient";
import { CrawlerManager } from "@/services/crawler/CrawlerManager";
import { openrouter } from "@/services/ai/OpenRouterClient";
import { buildPrompt } from "@/services/ai/PromptBuilder";
import { extractJsonFromResponse } from "@/services/ai/JsonExtractor";
import { generatePdfReport } from "@/services/pdf/PdfGenerator";
import { getCached, setCache, cacheKey } from "@/lib/cache";
import { logger } from "@/lib/logger";
import { extractDomain } from "@/lib/utils";
import type { ResearchInput, ResearchResult, CrawlBudget } from "@/types";

export class ResearchService {
  private websiteFinder = new WebsiteFinder();
  private competitorVerifier = new CompetitorVerifier();
  private serper = new SerperClient();
  private crawler = new CrawlerManager();

  private getCrawlBudget(): CrawlBudget {
    return {
      maxPages: parseInt(process.env.MAX_PAGES || "15", 10),
      maxDepth: parseInt(process.env.MAX_DEPTH || "2", 10),
      maxChars: parseInt(process.env.MAX_CHARS || "250000", 10),
      timeoutMs: parseInt(process.env.CRAWL_TIMEOUT_MS || "45000", 10),
    };
  }

  async *research(
    input: ResearchInput,
    onProgress?: (step: string, message: string, detail?: string) => void
  ): AsyncGenerator<
    { type: "step"; step: string; message: string; detail?: string } | { type: "result"; result: ResearchResult } | { type: "error"; message: string },
    void
  > {
    const cached = getCached<ResearchResult>(cacheKey("research", input.query));
    if (cached) {
      yield { type: "result", result: cached };
      return;
    }

    try {
      yield {
        type: "step",
        step: "searching",
        message: "Searching for company website...",
      };
      const { name, website } = await this.websiteFinder.find(input.query);
      logger.info({ name, website }, "Company found");

      yield {
        type: "step",
        step: "crawling",
        message: "Crawling website pages...",
      };

      const budget = this.getCrawlBudget();
      const domain = extractDomain(website);
      const crawlResult = await this.crawler.crawl(website, budget);

      for (const page of crawlResult.pages.slice(0, 10)) {
        yield {
          type: "step",
          step: "crawling",
          message: `  ✓ Found: ${page.title || "Page"}`,
          detail: page.url,
        };
      }

      yield {
        type: "step",
        step: "searching",
        message: "Gathering additional information from public sources...",
      };

      const searchData = await this.serper.multiSearch(name);

      yield {
        type: "step",
        step: "analyzing",
        message: "Analyzing collected data with AI...",
      };

      const prompt = buildPrompt({
        companyName: name,
        website,
        crawledPages: crawlResult.pages,
        searchResults: searchData.info,
        contactResults: searchData.contact,
        competitorResults: searchData.competitors,
      });

      const aiResponse = await openrouter.chat(
        input.model || "openai/gpt-4o",
        [
          {
            role: "system",
            content:
              "You are a company research analyst. Return ONLY valid JSON.",
          },
          { role: "user", content: prompt },
        ],
        { type: "json_object" }
      );

      const parsed = extractJsonFromResponse(aiResponse);

      const companyInfo = {
        name,
        website,
        phone: searchData.contact[0]?.snippet || undefined,
        address: searchData.contact[1]?.snippet || undefined,
        products: (parsed?.products as string[]) || [],
        services: (parsed?.services as string[]) || [],
        painPoints: (parsed?.pain_points as string[]) || [],
        industry: (parsed?.industry as string) || "",
        summary: (parsed?.summary as string) || "",
      };

      yield {
        type: "step",
        step: "competitors",
        message: "Identifying and verifying competitors...",
      };

      const rawSuggestions = (parsed?.competitor_suggestions as { name: string }[]) || [];
      const competitors = await this.competitorVerifier.verify(rawSuggestions);

      const result: ResearchResult = {
        company: companyInfo,
        competitors,
        crawledPages: crawlResult.pages.length,
        generatedAt: new Date().toISOString(),
      };

      yield {
        type: "step",
        step: "pdf",
        message: "Generating PDF report...",
      };

      setCache(cacheKey("research", input.query), result);

      yield { type: "result", result };
    } catch (err) {
      logger.error({ err }, "Research failed");
      const message =
        err instanceof Error ? err.message : "An unexpected error occurred";
      yield { type: "error", message };

      try {
        const { name, website } = await this.websiteFinder.find(input.query);
        const fallback: ResearchResult = {
          company: {
            name,
            website,
            products: [],
            services: [],
            painPoints: [],
          },
          competitors: [],
          crawledPages: 0,
          generatedAt: new Date().toISOString(),
        };
        yield { type: "result", result: fallback };
      } catch {
        yield {
          type: "error",
          message: "Unable to complete research. Please try again.",
        };
      }
    }
  }

  async generatePdf(result: ResearchResult): Promise<Buffer> {
    return generatePdfReport(result);
  }
}

export const researchService = new ResearchService();
