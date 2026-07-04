"use client";

import { Bot, User } from "lucide-react";
import { ResearchResult as ResearchResultComponent } from "@/components/research/ResearchResult";
import type { ResearchResult } from "@/types";

type Message =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; result?: ResearchResult }
  | { role: "progress"; steps: { message: string; done: boolean }[] };

export function ChatMessage({ message }: { message: Message }) {
  if (message.role === "progress") return null;

  const isUser = message.role === "user";

  return (
    <div className={`flex items-start gap-3 animate-slide-up ${isUser ? "flex-row-reverse" : ""}`}>
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${
          isUser
            ? "bg-[var(--primary)] text-white"
            : "bg-[var(--secondary)] text-[var(--foreground)] border border-[var(--border)]"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div
        className={`max-w-[85%] ${
          isUser
            ? "bg-[var(--primary)] text-white rounded-2xl rounded-tr-md px-4 py-2.5"
            : "text-[var(--foreground)]"
        }`}
      >
        {message.content && (
          <p className={`text-sm whitespace-pre-wrap ${!isUser ? "font-medium mb-1" : ""}`}>
            {message.content}
          </p>
        )}
        {"result" in message && message.result && (
          <div className={isUser ? "" : "bg-[var(--secondary)] rounded-2xl p-4 border border-[var(--border)]"}>
            <ResearchResultComponent result={message.result} />
          </div>
        )}
      </div>
    </div>
  );
}
