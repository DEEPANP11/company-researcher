import { logger } from "@/lib/logger";

export async function sendToDiscord(
  botToken: string,
  channelId: string,
  content: string,
  pdfBuffer?: Buffer
): Promise<boolean> {
  try {
    const formData = new FormData();
    formData.append(
      "payload_json",
      JSON.stringify({ content })
    );

    if (pdfBuffer) {
      const uint8 = new Uint8Array(pdfBuffer);
      const blob = new Blob([uint8], { type: "application/pdf" });
      formData.append("file", blob, "company-report.pdf");
    }

    const response = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages`,
      {
        method: "POST",
        headers: {
          Authorization: `Bot ${botToken}`,
        },
        body: formData,
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
