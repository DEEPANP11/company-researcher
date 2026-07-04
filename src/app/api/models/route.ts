import { NextResponse } from "next/server";
import { openrouter } from "@/services/ai/OpenRouterClient";

export async function GET() {
  try {
    const models = await openrouter.getModels();

    const popularModels = [
      "openai/gpt-4o",
      "openai/gpt-4o-mini",
      "anthropic/claude-3.5-sonnet",
      "anthropic/claude-3-opus",
      "google/gemini-2.0-flash-001",
      "google/gemini-2.5-pro-exp-03-25",
      "meta-llama/llama-3.2-90b-vision-instruct",
      "deepseek/deepseek-chat",
      "qwen/qwen-2.5-72b-instruct",
    ];

    const available = models.filter((m) =>
      popularModels.some((p) => m.id.includes(p))
    );

    const result =
      available.length > 0
        ? available.map((m) => ({ id: m.id, name: m.name || m.id }))
        : popularModels.map((id) => ({ id, name: id }));

    return NextResponse.json({ models: result });
  } catch {
    const fallback = [
      "openai/gpt-4o",
      "openai/gpt-4o-mini",
      "anthropic/claude-3.5-sonnet",
    ];
    return NextResponse.json({
      models: fallback.map((id) => ({ id, name: id })),
    });
  }
}
