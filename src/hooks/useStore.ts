"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ResearchResult, DiscordConfig } from "@/types";

export type HistoryEntry = {
  id: string;
  query: string;
  result: ResearchResult;
  timestamp: number;
};

type Message =
  | { role: "user"; content: string }
  | { role: "assistant"; content: string; result?: ResearchResult }
  | { role: "progress"; steps: { message: string; done: boolean }[] };

type AppState = {
  messages: Message[];
  isResearching: boolean;
  selectedModel: string;
  discordConfig: DiscordConfig;
  history: HistoryEntry[];
  sidebarOpen: boolean;
  activeHistoryId: string | null;
  addMessage: (msg: Message) => void;
  clearMessages: () => void;
  setResearching: (v: boolean) => void;
  setModel: (m: string) => void;
  setDiscordConfig: (cfg: DiscordConfig) => void;
  addHistory: (entry: HistoryEntry) => void;
  deleteHistory: (id: string) => void;
  clearHistory: () => void;
  toggleSidebar: () => void;
  setSidebarOpen: (v: boolean) => void;
  setActiveHistory: (id: string | null) => void;
  loadHistory: (entry: HistoryEntry) => void;
};

export const useStore = create<AppState>()(
  persist(
    (set) => ({
      messages: [],
      isResearching: false,
      selectedModel: "openai/gpt-4o",
      discordConfig: {
        botToken: "",
        channelId: "",
        applicantName: "",
        applicantEmail: "",
      },
      history: [],
      sidebarOpen: true,
      activeHistoryId: null,
      addMessage: (msg) =>
        set((state) => ({ messages: [...state.messages, msg] })),
      clearMessages: () => set({ messages: [], activeHistoryId: null }),
      setResearching: (v) => set({ isResearching: v }),
      setModel: (m) => set({ selectedModel: m }),
      setDiscordConfig: (cfg) => set({ discordConfig: cfg }),
      addHistory: (entry) =>
        set((state) => ({
          history: [entry, ...state.history.filter((h) => h.id !== entry.id)].slice(0, 50),
        })),
      deleteHistory: (id) =>
        set((state) => ({
          history: state.history.filter((h) => h.id !== id),
          activeHistoryId: state.activeHistoryId === id ? null : state.activeHistoryId,
          messages: state.activeHistoryId === id ? [] : state.messages,
        })),
      clearHistory: () => set({ history: [] }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
      setActiveHistory: (id) => set({ activeHistoryId: id }),
      loadHistory: (entry) =>
        set({
          messages: [
            { role: "user", content: entry.query },
            { role: "assistant", content: "Research complete!", result: entry.result },
          ],
          activeHistoryId: entry.id,
        }),
    }),
    {
      name: "company-researcher-storage",
      partialize: (state) => ({
        discordConfig: state.discordConfig,
        selectedModel: state.selectedModel,
        history: state.history,
        sidebarOpen: state.sidebarOpen,
      }),
    }
  )
);
