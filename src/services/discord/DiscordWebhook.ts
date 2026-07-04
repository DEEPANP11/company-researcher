import FormData from "form-data";
import { logger } from "@/lib/logger";

export async function sendToDiscord(
  botToken: string,
  channelId: string,
  content: string,
  pdfBuffer?: Buffer
): Promise<boolean> {
  try {
    const form = new FormData();
    form.append("payload_json", JSON.stringify({ content }));

    if (pdfBuffer && pdfBuffer.length > 0) {
      form.append("file", pdfBuffer, {
        filename: "company-report.pdf",
        contentType: "application/pdf",
      });
    }

    const response = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${botToken}`,
          ...form.getHeaders(),
        },
        body: form as unknown as BodyInit,
      }
    );

    if (!response.ok) {
      const text = await response.text();
      logger.error({ status: response.status, text }, "Discord send failed");
      return false;
    }

    logger.info({ channelId }, "Discord message sent successfully");
    return true;
  } catch (err) {
    logger.error({ err }, "Discord send error");
    return false;
  }
}
