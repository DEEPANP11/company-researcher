"use client";

import { useState, useCallback } from "react";
import { useStore } from "./useStore";
import type { ResearchResult, ResearchStep } from "@/types";

export function useResearch() {
  const { addMessage, setResearching, selectedModel, addHistory } = useStore();
  const [steps, setSteps] = useState<
    { step: ResearchStep; message: string; done: boolean }[]
  >([]);

  const submit = useCallback(
    async (query: string) => {
      if (!query.trim()) return;

      addMessage({ role: "user", content: query });
      setResearching(true);
      setSteps([]);

      try {
        const response = await fetch("/api/research", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, model: selectedModel }),
        });

        if (!response.ok) {
          let detail = "";
          try {
            const err = await response.json();
            detail = err.error || "";
          } catch {}
          const msg = detail ? `Research request failed: ${detail}` : `Research request failed (${response.status})`;
          throw new Error(msg);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response stream");

        const decoder = new TextDecoder();
        let buffer = "";
        let finalResult: ResearchResult | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;

            try {
              const event = JSON.parse(data);

              if (event.type === "step") {
                setSteps((prev) => [
                  ...prev.filter((s) => s.step !== event.step),
                  { step: event.step, message: event.message, done: false },
                ]);
              } else if (event.type === "error") {
                addMessage({
                  role: "assistant",
                  content: `Error: ${event.message}`,
                });
                setSteps((prev) =>
                  prev.map((s) => ({ ...s, done: true }))
                );
              } else if (event.type === "result") {
                const researchResult = event.result as ResearchResult;
                researchResult.pdfBase64 = event.pdfBase64;
                researchResult.pdfSize = event.pdfSize;
                finalResult = researchResult;
                addMessage({
                  role: "assistant",
                  content: "Research complete!",
                  result: researchResult,
                });
                setSteps((prev) =>
                  prev.map((s) => ({ ...s, done: true }))
                );
              }
            } catch {
              // skip malformed events
            }
          }
        }

        if (finalResult) {
          addHistory({
            id: `${Date.now()}-${query}`,
            query,
            result: finalResult,
            timestamp: Date.now(),
          });
        }
      } catch (err) {
        addMessage({
          role: "assistant",
          content: `Error: ${err instanceof Error ? err.message : "Something went wrong. Please try again."}`,
        });
      } finally {
        setResearching(false);
        setSteps([]);
      }
    },
    [addMessage, setResearching, selectedModel, addHistory]
  );

  return { submit, steps };
}
