import type { AtsAnalysisResponse } from "@repo/validations";
import { Badge } from "@repo/ui/components/badge";
import { cn } from "@repo/ui/lib/utils";
import { Sparkles } from "lucide-react";

import { categoryLabels, scoreColor, verdictLabel, verdictTone } from "./ats-result-utils";

interface AtsScoreOverviewProps {
  analysis: AtsAnalysisResponse;
}

const AtsScoreOverview = ({ analysis }: AtsScoreOverviewProps) => {
  const score = analysis.overallScore;
  const strokeDashoffset = 283 - (283 * score) / 100;
  
  // Determine gradient based on score
  const gradientClass = score >= 80 
    ? "from-emerald-400 to-teal-500" 
    : score >= 60 
      ? "from-amber-400 to-orange-500" 
      : "from-rose-400 to-red-500";

  return (
    <div className="relative grid gap-4 border-b border-foreground/5 p-4 md:grid-cols-[180px_1fr] overflow-hidden bg-card/30">
      {/* Score Ring */}
      <div className="relative flex flex-row md:flex-col items-center justify-start md:justify-center self-center gap-4 md:gap-3 w-full md:w-auto">
        <div className="relative flex h-16 md:h-24 w-16 md:w-24 shrink-0 items-center justify-center">
          <svg className="h-full w-full -rotate-90 transform" viewBox="0 0 100 100">
            <circle
              className="stroke-muted/30"
              strokeWidth="8"
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
            />
            <circle
              className={cn("transition-all duration-1000 ease-out", scoreColor(score).replace('bg-', 'stroke-'))}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="283"
              strokeDashoffset={strokeDashoffset}
              fill="transparent"
              r="45"
              cx="50"
              cy="50"
              style={{ stroke: 'currentColor' }} 
            />
          </svg>
          <div className="absolute flex flex-col items-center justify-center">
            <span className={cn(
              "text-xl md:text-3xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-linear-to-br",
              gradientClass
            )}>
              {score}
            </span>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <Badge
            variant="outline"
            className={cn("h-7 px-3 text-xs rounded-none", verdictTone[analysis.verdict])}
          >
            {verdictLabel[analysis.verdict]}
          </Badge>
        </div>
      </div>

      <div className="z-10 flex min-w-0 flex-col justify-center gap-5">    
        <p className="text-xs md:text-sm font-medium leading-relaxed text-foreground/90">
          {analysis.summary}
        </p>

        <div className="grid gap-3 grid-cols-2 md:grid-cols-3 mt-2">
          {Object.entries(analysis.categoryScores).map(([key, catScore]) => (
            <div key={key} className="group relative overflow-hidden border border-foreground/5 bg-card/50 p-4 rounded-sm hover:bg-card/70">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground/80 group-hover:text-foreground transition-colors">
                  {categoryLabels[key as keyof AtsAnalysisResponse["categoryScores"]]}
                </span>
                <span className={cn("font-bold", catScore >= 80 ? "text-emerald-500" : catScore >= 60 ? "text-amber-500" : "text-rose-500")}>
                  {catScore}
                </span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden bg-muted/50 rounded-full">
                <div
                  className={cn("h-full transition-all duration-1000 ease-out", scoreColor(catScore))}
                  style={{ width: `${catScore}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AtsScoreOverview;
