import { z } from "zod";

export const researchRequestSchema = z.object({
  query: z.string().min(1, "Company name or URL is required"),
  model: z.string().optional().default("openai/gpt-4o"),
});

export const discordConfigSchema = z.object({
  botToken: z.string().min(1, "Bot token is required"),
  channelId: z.string().min(1, "Channel ID is required"),
  applicantName: z.string().min(1, "Name is required"),
  applicantEmail: z.string().email("Valid email is required"),
});

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };
