import { SerperClient } from "@/services/search/SerperClient";
import type { Competitor } from "@/types";

export class CompetitorVerifier {
  private serper: SerperClient;

  constructor() {
    this.serper = new SerperClient();
  }

  async verify(
    suggestions: { name: string }[]
  ): Promise<Competitor[]> {
    const results = await Promise.all(
      suggestions.slice(0, 8).map(async (s) => {
        const website = await this.serper.verifyCompetitorWebsite(s.name);
        return website ? { name: s.name, website } : null;
      })
    );

    return results.filter((r): r is Competitor => r !== null);
  }
}
