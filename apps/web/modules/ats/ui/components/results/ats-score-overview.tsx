import type { AtsAnalysisResponse } from "@repo/validations";
import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/utils";
import { Gauge } from "lucide-react";

import { categoryLabels, scoreColor, verdictLabel, verdictTone } from "./ats-result-utils";

interface AtsScoreOverviewProps {
  analysis: AtsAnalysisResponse;
}

const AtsScoreOverview = ({ analysis }: AtsScoreOverviewProps) => (
  <div className="grid gap-4 border-b p-5 md:grid-cols-[180px_1fr]">
    <div className="flex aspect-square max-h-44 flex-col items-center justify-center border bg-muted/20">
      <Gauge className="mb-3 h-7 w-7 text-muted-foreground" />
      <p className="text-5xl font-bold tracking-tight">
        {analysis.overallScore}
      </p>
      <p className="text-xs font-medium text-muted-foreground">
        Overall score
      </p>
    </div>

    <div className="flex min-w-0 flex-col justify-center gap-4">
      <Badge
        variant="outline"
        className={cn("h-6 w-fit", verdictTone[analysis.verdict])}
      >
        {verdictLabel[analysis.verdict]}
      </Badge>
      <p className="text-base font-medium leading-7">{analysis.summary}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {Object.entries(analysis.categoryScores).map(([key, score]) => (
          <div key={key} className="border p-3">
            <div className="flex items-center justify-between text-xs font-medium">
              <span>
                {categoryLabels[key as keyof AtsAnalysisResponse["categoryScores"]]}
              </span>
              <span>{score}/100</span>
            </div>
            <div className="mt-2 h-1.5 bg-muted">
              <div
                className={cn("h-full", scoreColor(score))}
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default AtsScoreOverview;
