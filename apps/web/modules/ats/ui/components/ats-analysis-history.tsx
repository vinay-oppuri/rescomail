"use client";

import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/utils";
import { Clock3 } from "lucide-react";

import { useAtsStore } from "../../store/ats-store";

const verdictLabel: Record<string, string> = {
  strong_match: "Strong",
  good_match: "Good",
  partial_match: "Partial",
  needs_work: "Needs work",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const AtsAnalysisHistory = () => {
  const { history, analysis, setAnalysis, setShowForm } = useAtsStore();

  return (
    <div className="border bg-background">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Analysis history</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Last {history.length} saved reports
          </p>
        </div>
        <Clock3 className="h-4 w-4 text-muted-foreground" />
      </div>

      {history.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">
          Saved ATS runs will appear here.
        </div>
      ) : (
        <div className="max-h-105 divide-y overflow-y-auto">
          {history.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (item.analysis) {
                  setAnalysis(item.analysis);
                  setShowForm(false);
                }
              }}
              className={cn(
                "w-full border-l-2 border-transparent px-4 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                analysis?.analysisId === item.id && "border-l-primary bg-primary/5",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {item.jobTitle || "Untitled role"}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {item.companyName || item.resumeTitle}
                  </p>
                </div>
                <Badge
                  variant={
                    item.verdict === "needs_work" ? "destructive" : "outline"
                  }
                  className="shrink-0"
                >
                  {item.overallScore}
                </Badge>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="truncate text-xs text-muted-foreground">
                  {formatDate(item.createdAt)}
                </p>
                <span className="text-xs text-muted-foreground">
                  {verdictLabel[item.verdict] ?? item.verdict}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AtsAnalysisHistory;
