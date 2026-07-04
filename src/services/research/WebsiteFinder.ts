import { SerperClient } from "@/services/search/SerperClient";
import { isUrl } from "@/lib/utils";

export class WebsiteFinder {
  private serper: SerperClient;

  constructor() {
    this.serper = new SerperClient();
  }

  async find(query: string): Promise<{ name: string; website: string }> {
    if (isUrl(query)) {
      const url = query.startsWith("http") ? query : `https://${query}`;
      const name = new URL(url).hostname.replace("www.", "").split(".")[0];
      const capitalized = name.charAt(0).toUpperCase() + name.slice(1);
      return { name: capitalized, website: url };
    }

    const website = await this.serper.findWebsite(query);
    if (website) {
      return { name: query, website };
    }

    return {
      name: query,
      website: `https://${query.toLowerCase().replace(/\s+/g, "")}.com`,
    };
  }
}
