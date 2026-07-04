import { z } from "zod";

export const ResearchRequestSchema = z.object({
  query: z.string().min(1, "Company name or URL is required"),
  model: z.string().optional().default("openai/gpt-4o"),
});

export type ResearchRequest = z.infer<typeof ResearchRequestSchema>;

export const DiscordConfigSchema = z.object({
  botToken: z.string().min(1, "Bot token is required"),
  channelId: z.string().min(1, "Channel ID is required"),
  applicantName: z.string().min(1, "Name is required"),
  applicantEmail: z.string().email("Valid email is required"),
});

export type DiscordConfigType = z.infer<typeof DiscordConfigSchema>;

export const CrawlBudgetSchema = z.object({
  maxPages: z.number().int().positive().default(15),
  maxDepth: z.number().int().positive().default(2),
  maxChars: z.number().int().positive().default(250000),
  timeoutMs: z.number().int().positive().default(45000),
});

export type CrawlBudgetType = z.infer<typeof CrawlBudgetSchema>;

export const SerperResponseSchema = z.object({
  searchParameters: z.object({
    q: z.string(),
    type: z.string().optional(),
    engine: z.string().optional(),
  }),
  knowledgeGraph: z
    .object({
      title: z.string().optional(),
      type: z.string().optional(),
      website: z.string().optional(),
      description: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
    })
    .optional(),
  organic: z
    .array(
      z.object({
        title: z.string(),
        link: z.string(),
        snippet: z.string().optional(),
        position: z.number().optional(),
      })
    )
    .optional(),
  peopleAlsoAsk: z
    .array(
      z.object({
        question: z.string(),
        snippet: z.string().optional(),
        link: z.string().optional(),
      })
    )
    .optional(),
});

export type SerperResponse = z.infer<typeof SerperResponseSchema>;
