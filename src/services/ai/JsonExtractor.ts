import { logger } from "@/lib/logger";

export function extractJsonFromResponse(
  text: string
): Record<string, unknown> | null {
  try {
    const cleaned = text
      .replace(/```json\s*/g, "")
      .replace(/```\s*/g, "")
      .trim();
    return JSON.parse(cleaned);
  } catch (e) {
    try {
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (e2) {
      logger.error({ text }, "Failed to extract JSON from AI response");
    }
    return null;
  }
}
