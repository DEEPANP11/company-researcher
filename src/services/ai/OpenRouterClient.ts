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
    const body: Record<string, unknown> = {
      model,
      messages,
      max_tokens: 700,
      temperature: 0.3,
    };

    if (responseFormat) {
      body.response_format = responseFormat;
    }

    const doFetch = async (): Promise<{ content: string; responseModel: string }> => {
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
      return {
        content: data.choices[0]?.message?.content || "",
        responseModel: data.model,
      };
    };

    try {
      const { content, responseModel } = await doFetch();

      logger.info(
        {
          model,
          took: Date.now() - start,
          tokens: content.length,
          responseModel,
        },
        "OpenRouter chat completed"
      );

      return content;
    } catch (err) {
      if (
        responseFormat?.type === "json_object" &&
        err instanceof Error &&
        err.message.includes("json_object") &&
        err.message.includes("400")
      ) {
        delete body.response_format;
        try {
          const retry = await doFetch();
          logger.warn({ model }, "Retried without json_object format");
          return retry.content;
        } catch {
          throw err;
        }
      }
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
