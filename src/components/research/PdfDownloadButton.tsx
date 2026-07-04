"use client";

import { useState } from "react";
import { FileText, Download, Loader2 } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import type { ResearchResult } from "@/types";

export function PdfDownloadButton({ result }: { result: ResearchResult }) {
  const [loading, setLoading] = useState(false);
  const { discordConfig } = useStore();

  const handleDownload = async () => {
    setLoading(true);
    try {
      if (result.pdfBase64) {
        const binaryStr = atob(result.pdfBase64);
        const bytes = new Uint8Array(binaryStr.length);
        for (let i = 0; i < binaryStr.length; i++) {
          bytes[i] = binaryStr.charCodeAt(i);
        }
        const blob = new Blob([bytes], { type: "application/pdf" });
        downloadBlob(blob);
      } else {
        const { generateClientPdf } = await import("./ClientPdf");
        const blob = await generateClientPdf(result);
        downloadBlob(blob);
      }
    } catch {
      const { generateClientPdf } = await import("./ClientPdf");
      const blob = await generateClientPdf(result);
      downloadBlob(blob);
    } finally {
      setLoading(false);
    }
  };

  const handleDiscordSend = async () => {
    if (
      !discordConfig.botToken ||
      !discordConfig.channelId ||
      !discordConfig.applicantName ||
      !discordConfig.applicantEmail
    ) {
      alert("Please configure Discord settings first");
      return;
    }

    setLoading(true);
    try {
      const discordRes = await fetch("/api/discord", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...discordConfig,
          companyName: result.company.name,
          companyWebsite: result.company.website,
          pdfBase64: result.pdfBase64 || "",
        }),
      });

      if (!discordRes.ok) {
        alert("Failed to send to Discord");
      } else {
        alert("Report sent to Discord!");
      }
    } catch {
      alert("Failed to send to Discord");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDownload}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Download className="w-3.5 h-3.5" />
        )}
        Download PDF
      </button>
      <button
        onClick={handleDiscordSend}
        disabled={loading}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] hover:bg-[var(--secondary)] disabled:opacity-50 transition-colors"
      >
        <FileText className="w-3.5 h-3.5" />
        Send to Discord
      </button>
    </div>
  );
}

function downloadBlob(blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "company-report.pdf";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
