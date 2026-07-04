import axios from "axios";
import { logger } from "@/lib/logger";

export class RobotsParser {
  private rules: Map<string, { disallow: string[]; allow: string[] }> =
    new Map();
  private defaultRules = { disallow: [] as string[], allow: [] as string[] };
  private loaded = false;

  async load(baseUrl: string): Promise<void> {
    if (this.loaded) return;
    try {
      const url = new URL("/robots.txt", baseUrl).toString();
      const { data } = await axios.get(url, { timeout: 5000 });
      this.parse(data);
      this.loaded = true;
      logger.info({ baseUrl }, "Robots.txt loaded");
    } catch {
      this.loaded = true;
    }
  }

  private parse(text: string): void {
    let currentAgent = "*";
    for (const line of text.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;

      if (trimmed.toLowerCase().startsWith("user-agent:")) {
        currentAgent = trimmed.split(":")[1]?.trim() || "*";
        continue;
      }

      const rules = this.rules.get(currentAgent) || {
        disallow: [],
        allow: [],
      };

      if (trimmed.toLowerCase().startsWith("disallow:")) {
        const path = trimmed.split(":")[1]?.trim();
        if (path && path.length > 0) rules.disallow.push(path);
      } else if (trimmed.toLowerCase().startsWith("allow:")) {
        const path = trimmed.split(":")[1]?.trim();
        if (path) rules.allow.push(path);
      }

      this.rules.set(currentAgent, rules);
    }
  }

  isAllowed(url: string): boolean {
    const rules = this.rules.get("*") || this.defaultRules;

    try {
      const path = new URL(url).pathname;

      for (const allow of rules.allow) {
        if (path.startsWith(allow)) return true;
      }

      for (const disallow of rules.disallow) {
        if (disallow === "/") return false;
        if (path.startsWith(disallow)) return false;
      }
    } catch {
      return false;
    }

    return true;
  }
}
