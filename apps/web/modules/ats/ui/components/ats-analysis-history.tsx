import type { AtsAnalysisHistoryItem } from "../../server/ats-history";
import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/utils";
import { Clock3 } from "lucide-react";

interface AtsAnalysisHistoryProps {
  analyses: AtsAnalysisHistoryItem[];
  selectedAnalysisId?: string;
  onSelectAnalysis: (analysis: AtsAnalysisHistoryItem) => void;
}

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

const AtsAnalysisHistory = ({
  analyses,
  selectedAnalysisId,
  onSelectAnalysis,
}: AtsAnalysisHistoryProps) => {
  return (
    <div className="border bg-background">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Analysis history</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Last {analyses.length} saved reports
          </p>
        </div>
        <Clock3 className="h-4 w-4 text-muted-foreground" />
      </div>

      {analyses.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">
          Saved ATS runs will appear here.
        </div>
      ) : (
        <div className="max-h-[420px] divide-y overflow-y-auto">
          {analyses.map((analysis) => (
            <button
              key={analysis.id}
              type="button"
              onClick={() => onSelectAnalysis(analysis)}
              className={cn(
                "w-full border-l-2 border-transparent px-4 py-3 text-left transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                selectedAnalysisId === analysis.id &&
                  "border-l-primary bg-primary/5",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">
                    {analysis.jobTitle || "Untitled role"}
                  </p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">
                    {analysis.companyName || analysis.resumeTitle}
                  </p>
                </div>
                <Badge
                  variant={
                    analysis.verdict === "needs_work" ? "destructive" : "outline"
                  }
                  className="shrink-0"
                >
                  {analysis.overallScore}
                </Badge>
              </div>
              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="truncate text-xs text-muted-foreground">
                  {formatDate(analysis.createdAt)}
                </p>
                <span className="text-xs text-muted-foreground">
                  {verdictLabel[analysis.verdict] ?? analysis.verdict}
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
