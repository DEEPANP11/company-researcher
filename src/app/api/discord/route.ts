import { NextRequest, NextResponse } from "next/server";
import { discordConfigSchema } from "@/lib/validation";
import { sendToDiscord } from "@/services/discord/DiscordWebhook";
import { buildDiscordMessage } from "@/services/ai/PromptBuilder";
import { logger } from "@/lib/logger";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const parsed = discordConfigSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { botToken, channelId, applicantName, applicantEmail } = parsed.data;
    const companyName = body.companyName as string | undefined;
    const companyWebsite = (body.companyWebsite as string) || "";
    const pdfBase64 = body.pdfBase64 as string | undefined;

    if (!companyName) {
      return NextResponse.json(
        { error: "companyName is required" },
        { status: 400 }
      );
    }

    const message = buildDiscordMessage({
      applicantName,
      applicantEmail,
      companyName,
      companyWebsite,
    });

    let pdfBuffer: Buffer | undefined;
    if (pdfBase64) {
      try {
        pdfBuffer = Buffer.from(pdfBase64, "base64");
      } catch {
        logger.warn({ pdfBase64: pdfBase64.slice(0, 20) }, "Invalid base64 pdf");
      }
    }

    const success = await sendToDiscord(botToken, channelId, message, pdfBuffer);

    if (!success) {
      return NextResponse.json(
        { error: "Failed to send message to Discord" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    logger.error({ err }, "Discord API error");
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
