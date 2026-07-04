import { NextRequest, NextResponse } from "next/server";
import { discordConfigSchema } from "@/lib/validation";
import { sendToDiscord } from "@/services/discord/DiscordWebhook";
import { buildDiscordMessage } from "@/services/ai/PromptBuilder";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = discordConfigSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { botToken, channelId, applicantName, applicantEmail } = parsed.data;
    const { companyName, companyWebsite, pdfBase64 } = body;

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
      companyWebsite: companyWebsite || "",
    });

    let pdfBuffer: Buffer | undefined;
    if (pdfBase64) {
      pdfBuffer = Buffer.from(pdfBase64, "base64");
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
    logger.error({ err }, "Discord API error");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
