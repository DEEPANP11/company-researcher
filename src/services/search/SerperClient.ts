import axios from "axios";
import { logger } from "@/lib/logger";

const SERPER_URL = "https://google.serper.dev/search";

type SerperResult = {
  title: string;
  link: string;
  snippet?: string;
  position?: number;
};

type SerperKnowledgeGraph = {
  title?: string;
  type?: string;
  website?: string;
  description?: string;
  phone?: string;
  address?: string;
};

type SerperResponse = {
  knowledgeGraph?: SerperKnowledgeGraph;
  organic?: SerperResult[];
};

export class SerperClient {
  private getApiKey(): string {
    const key = process.env.SERPER_API_KEY;
    if (!key) throw new Error("SERPER_API_KEY environment variable is not set");
    return key;
  }

  async search(
    query: string,
    num: number = 10
  ): Promise<{
    knowledgeGraph?: SerperKnowledgeGraph;
    organic: SerperResult[];
  }> {
    const start = Date.now();
    try {
      const { data } = await axios.post<SerperResponse>(
        SERPER_URL,
        { q: query, num },
        {
          headers: {
            "X-API-KEY": this.getApiKey(),
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );
      logger.info({ query, took: Date.now() - start }, "Serper search completed");
      return {
        knowledgeGraph: data.knowledgeGraph,
        organic: data.organic || [],
      };
    } catch (err) {
      logger.error({ query, err }, "Serper search failed");
      return { organic: [] };
    }
  }

  async findWebsite(companyName: string): Promise<string | null> {
    const result = await this.search(`${companyName} official website`);
    if (result.knowledgeGraph?.website) {
      return result.knowledgeGraph.website;
    }
    const firstResult = result.organic[0];
    if (firstResult) {
      return firstResult.link;
    }
    return null;
  }

  async multiSearch(companyName: string): Promise<{
    website: string | null;
    info: SerperResult[];
    contact: SerperResult[];
    products: SerperResult[];
    competitors: SerperResult[];
  }> {
    const [websiteRes, infoRes, contactRes, productsRes, competitorsRes] =
      await Promise.all([
        this.search(`${companyName} official website`),
        this.search(`${companyName} company information overview`),
        this.search(`${companyName} headquarters contact address`),
        this.search(`${companyName} products services`),
        this.search(`${companyName} competitors alternatives`),
      ]);

    const website =
      websiteRes.knowledgeGraph?.website || websiteRes.organic[0]?.link || null;

    return {
      website,
      info: infoRes.organic,
      contact: contactRes.organic,
      products: productsRes.organic,
      competitors: competitorsRes.organic,
    };
  }

  async verifyCompetitorWebsite(name: string): Promise<string | null> {
    const result = await this.search(`${name} official website`, 3);
    if (result.knowledgeGraph?.website) {
      return result.knowledgeGraph.website;
    }
    return result.organic[0]?.link || null;
  }
}
