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
    <div className="relative grid gap-4 border-b p-4 md:grid-cols-[180px_1fr] overflow-hidden bg-linear-to-br from-background to-muted/30">
      
      {/* Decorative Background Glow */}
      <div className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-none bg-primary/5 blur-3xl" />

      {/* Score Ring */}
      <div className="relative flex aspect-square w-full max-w-[160px] flex-col items-center justify-center self-center rounded-none border bg-card/50 p-4 shadow-sm backdrop-blur-xl transition-all duration-500 hover:shadow-md hover:border-primary/20">
        <div className="relative flex h-24 w-24 items-center justify-center">
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
              "text-3xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-linear-to-br",
              gradientClass
            )}>
              {score}
            </span>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          Match Score
        </div>
      </div>

      <div className="z-10 flex min-w-0 flex-col justify-center gap-5">
        <div className="flex items-start justify-between">
          <Badge
            variant="outline"
            className={cn("h-7 rounded-none px-3 text-xs shadow-sm transition-all hover:scale-105", verdictTone[analysis.verdict])}
          >
            {verdictLabel[analysis.verdict]}
          </Badge>
        </div>
        
        <p className="text-sm font-medium leading-relaxed text-foreground/90">
          {analysis.summary}
        </p>

        <div className="grid gap-3 sm:grid-cols-2 mt-2">
          {Object.entries(analysis.categoryScores).map(([key, catScore]) => (
            <div key={key} className="group relative overflow-hidden rounded-none border bg-card/50 p-4 transition-all duration-300 hover:border-primary/30 hover:bg-muted/30 hover:shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-foreground/80 group-hover:text-foreground transition-colors">
                  {categoryLabels[key as keyof AtsAnalysisResponse["categoryScores"]]}
                </span>
                <span className={cn("font-bold", catScore >= 80 ? "text-emerald-500" : catScore >= 60 ? "text-amber-500" : "text-rose-500")}>
                  {catScore}
                </span>
              </div>
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-none bg-muted/50">
                <div
                  className={cn("h-full rounded-none transition-all duration-1000 ease-out", scoreColor(catScore))}
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
