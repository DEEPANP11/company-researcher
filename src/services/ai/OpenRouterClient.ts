import { logger } from "@/lib/logger";

type OpenRouterMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

type OpenRouterResponse = {
  id: string;
  choices: {
    message: {
      content: string;
    };
  }[];
  model: string;
};

export class OpenRouterClient {
  private baseUrl = "https://openrouter.ai/api/v1";

  private getApiKey(): string {
    const key = process.env.OPENROUTER_API_KEY;
    if (!key) throw new Error("OPENROUTER_API_KEY environment variable is not set");
    return key;
  }

  async chat(
    model: string,
    messages: OpenRouterMessage[],
    responseFormat?: { type: "json_object" | "text" }
  ): Promise<string> {
    const start = Date.now();
    try {
      const body: Record<string, unknown> = {
        model,
        messages,
        max_tokens: 1500,
        temperature: 0.3,
      };

      if (responseFormat) {
        body.response_format = responseFormat;
      }

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.getApiKey()}`,
          "HTTP-Referer": "https://company-researcher.vercel.app",
          "X-Title": "Company Research Assistant",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(`OpenRouter ${response.status}: ${text}`);
      }

      const data = (await response.json()) as OpenRouterResponse;
      const content = data.choices[0]?.message?.content || "";

      logger.info(
        {
          model,
          took: Date.now() - start,
          tokens: content.length,
          responseModel: data.model,
        },
        "OpenRouter chat completed"
      );

      return content;
    } catch (err) {
      logger.error({ model, err }, "OpenRouter chat failed");
      throw err;
    }
  }

  async getModels(): Promise<{ id: string; name: string }[]> {
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          Authorization: `Bearer ${this.getApiKey()}`,
        },
      });
      if (!response.ok) return [];
      const data = (await response.json()) as {
        data: { id: string; name: string }[];
      };
      return data.data || [];
    } catch {
      return [];
    }
  }
}

export const openrouter = new OpenRouterClient();
