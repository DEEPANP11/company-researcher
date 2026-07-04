import { NextRequest } from "next/server";
import { researchService } from "@/services/research/ResearchService";
import { researchRequestSchema } from "@/lib/validation";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = researchRequestSchema.safeParse(body);

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.issues[0]?.message || "Invalid input" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { query, model } = parsed.data;

    const encoder = new TextEncoder();
    let resultSent = false;

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of researchService.research({ query, model })) {
            if (event.type === "result") {
              resultSent = true;
              try {
                const pdfBuffer = await researchService.generatePdf(event.result);
                const pdfBase64 = pdfBuffer.toString("base64");
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({
                      ...event,
                      pdfBase64,
                      pdfSize: pdfBuffer.length,
                    })}\n\n`
                  )
                );
              } catch {
                controller.enqueue(
                  encoder.encode(
                    `data: ${JSON.stringify({ ...event, pdfBase64: "", pdfSize: 0 })}\n\n`
                  )
                );
              }
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
              return;
            }

            if (event.type === "error") {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
              );
              if (!resultSent) {
                controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                controller.close();
              }
              return;
            }

            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
            );
          }

          if (!resultSent) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "error", message: "No result generated" })}\n\n`
              )
            );
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          }
          controller.close();
        } catch (err) {
          logger.error({ err }, "Stream error");
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message: "Internal server error" })}\n\n`
            )
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    logger.error({ err }, "Research API error");
    if (message.includes("OPENROUTER_API_KEY") || message.includes("SERPER_API_KEY")) {
      return new Response(
        JSON.stringify({ error: "API key not configured. Set OPENROUTER_API_KEY and SERPER_API_KEY in Vercel project settings." }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
