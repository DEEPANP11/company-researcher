"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Trash2,
  Clock,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  Settings,
} from "lucide-react";
import { useStore } from "@/hooks/useStore";

export function Sidebar() {
  const {
    history,
    sidebarOpen,
    activeHistoryId,
    toggleSidebar,
    clearMessages,
    loadHistory,
    deleteHistory,
    clearHistory,
  } = useStore();
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = searchQuery
    ? history.filter((h) =>
        h.query.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : history;

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-20 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed lg:relative z-30 h-full flex flex-col bg-[var(--background)] border-r border-[var(--border)] transition-all duration-300 ${
          sidebarOpen ? "w-72" : "w-0 lg:w-0 overflow-hidden"
        }`}
      >
        <div className="flex-shrink-0 p-3 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[var(--primary)]" />
              <span className="font-semibold text-sm">History</span>
            </div>
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg hover:bg-[var(--secondary)] transition-colors"
            >
              <PanelLeftClose className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={() => {
              clearMessages();
              setSearchQuery("");
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-dashed border-[var(--border)] hover:bg-[var(--secondary)] hover:border-solid transition-all"
          >
            <Plus className="w-4 h-4" />
            New Research
          </button>

          <div className="relative mt-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--muted)]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search history..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-[var(--border)] bg-[var(--secondary)] outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin">
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center h-32 text-center text-[var(--muted)] px-4">
              <Clock className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-xs">
                {searchQuery ? "No matches found" : "No research history yet"}
              </p>
            </div>
          )}

          {filtered.map((entry) => (
            <div
              key={entry.id}
              className={`group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${
                activeHistoryId === entry.id
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "hover:bg-[var(--secondary)]"
              }`}
              onClick={() => loadHistory(entry)}
            >
              <Search className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
              <span className="flex-1 truncate">{entry.query}</span>
              <span className="text-[10px] text-[var(--muted)] flex-shrink-0">
                {new Date(entry.timestamp).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteHistory(entry.id);
                }}
                className="p-1 rounded hover:bg-[var(--destructive)]/10 text-[var(--muted)] hover:text-[var(--destructive)] transition-all flex-shrink-0"
                title="Delete"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {history.length > 0 && (
          <div className="flex-shrink-0 p-3 border-t border-[var(--border)]">
            <button
              onClick={clearHistory}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs text-[var(--muted)] hover:text-[var(--destructive)] hover:bg-[var(--destructive)]/5 rounded-lg transition-colors"
            >
              <Trash2 className="w-3 h-3" />
              Clear all history
            </button>
          </div>
        )}

        <div className="flex-shrink-0 p-3 border-t border-[var(--border)]">
          <a
            href="/settings"
            className="flex items-center gap-2 px-3 py-2 text-xs text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--secondary)] rounded-lg transition-colors"
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </a>
        </div>
      </aside>

      {!sidebarOpen && (
        <button
          onClick={toggleSidebar}
          className="fixed top-3 left-3 z-40 p-2 rounded-lg bg-[var(--background)] border border-[var(--border)] shadow-sm hover:bg-[var(--secondary)] transition-colors"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
      )}
    </>
  );
}
