"use client";

import {
  Search,
  Globe,
  Brain,
  Users,
  FileText,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import type { ResearchStep } from "@/types";

const STEP_ICONS: Record<string, React.ReactNode> = {
  searching: <Search className="w-4 h-4" />,
  crawling: <Globe className="w-4 h-4" />,
  analyzing: <Brain className="w-4 h-4" />,
  competitors: <Users className="w-4 h-4" />,
  pdf: <FileText className="w-4 h-4" />,
};

const STEP_LABELS: Record<string, string> = {
  searching: "Searching",
  crawling: "Crawling",
  analyzing: "Analyzing",
  competitors: "Competitors",
  pdf: "Generating PDF",
};

export function ProgressSteps({
  steps,
}: {
  steps: { step: string; message: string; done: boolean }[];
}) {
  const seenSteps = new Map<string, { message: string; done: boolean }>();
  for (const s of steps) {
    seenSteps.set(s.step, s);
  }

  const order = ["searching", "crawling", "analyzing", "competitors", "pdf"];

  return (
    <div className="flex items-start gap-3 animate-fade-in">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
      <div className="space-y-2">
        {order.map((step) => {
          const s = seenSteps.get(step);
          if (!s) return null;
          return (
            <div key={step} className="flex items-center gap-2 text-sm">
              {s.done ? (
                <CheckCircle2 className="w-4 h-4 text-[var(--success)]" />
              ) : (
                <span className="text-[var(--primary)] animate-pulse">
                  {STEP_ICONS[step]}
                </span>
              )}
              <span
                className={
                  s.done
                    ? "text-[var(--muted)]"
                    : "text-[var(--foreground)] font-medium"
                }
              >
                {s.message}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
