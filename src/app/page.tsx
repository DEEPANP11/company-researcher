"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Settings, Sparkles, PanelLeft, Trash2 } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { useResearch } from "@/hooks/useResearch";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ProgressSteps } from "@/components/chat/ProgressSteps";
import { ModelSelector } from "@/components/chat/ModelSelector";
import { Sidebar } from "@/components/chat/Sidebar";

export default function Home() {
  const { messages, isResearching, clearMessages, toggleSidebar } = useStore();
  const { submit, steps } = useResearch();
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, steps]);

  const handleSubmit = () => {
    const query = input.trim();
    if (!query || isResearching) return;
    setInput("");
    submit(query);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex h-full">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] bg-[var(--background)]">
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-[var(--secondary)] transition-colors lg:hidden"
            >
              <PanelLeft className="w-4 h-4" />
            </button>
            <Sparkles className="w-5 h-5 text-[var(--primary)] hidden sm:block" />
            <h1 className="text-lg font-semibold">Company Research</h1>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 0 && (
              <button
                onClick={clearMessages}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] hover:bg-[var(--secondary)] transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
            <ModelSelector />
            <a
              href="/settings"
              className="p-2 rounded-lg hover:bg-[var(--secondary)] transition-colors"
            >
              <Settings className="w-5 h-5" />
            </a>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 scrollbar-thin">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center text-[var(--muted)] space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[var(--primary)]" />
              </div>
              <h2 className="text-xl font-semibold text-[var(--foreground)]">
                Research any company
              </h2>
              <p className="max-w-md text-sm">
                Enter a company name or website URL to get an AI-powered research
                report with competitor analysis.
              </p>
              <div className="grid grid-cols-2 gap-2 text-sm w-full max-w-sm">
                {["Microsoft", "Tesla", "Stripe", "https://notion.so"].map(
                  (example) => (
                    <button
                      key={example}
                      onClick={() => {
                        setInput(example);
                        inputRef.current?.focus();
                      }}
                      className="px-4 py-2.5 rounded-xl border border-[var(--border)] hover:bg-[var(--secondary)] hover:border-[var(--primary)]/30 transition-all"
                    >
                      {example}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {messages.map((msg, i) => (
            <ChatMessage key={i} message={msg} />
          ))}

          {(isResearching || steps.length > 0) && (
            <ProgressSteps steps={steps} />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-[var(--border)] bg-[var(--background)] px-4 py-3">
          <div className="flex items-end gap-2 max-w-3xl mx-auto">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter company name or website URL..."
              rows={1}
              className="flex-1 resize-none rounded-xl border border-[var(--border)] bg-[var(--secondary)] px-4 py-3 text-sm outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-colors"
              disabled={isResearching}
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim() || isResearching}
              className="flex-shrink-0 p-3 rounded-xl bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
