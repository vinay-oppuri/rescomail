import type { AtsAnalysisHistoryItem } from "../../server/ats-history";
import { Badge } from "@repo/ui/components/badge";

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
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Analysis history</h2>
      </div>

      {analyses.length === 0 ? (
        <div className="p-4 text-sm text-muted-foreground">
          Saved ATS runs will appear here.
        </div>
      ) : (
        <div className="divide-y">
          {analyses.map((analysis) => (
            <button
              key={analysis.id}
              type="button"
              onClick={() => onSelectAnalysis(analysis)}
              className="w-full px-4 py-3 text-left transition-colors hover:bg-muted/50"
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
              {selectedAnalysisId === analysis.id ? (
                <span className="mt-3 inline-flex h-6 items-center border bg-secondary px-2 text-xs font-medium text-secondary-foreground">
                  Viewing
                </span>
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default AtsAnalysisHistory;
