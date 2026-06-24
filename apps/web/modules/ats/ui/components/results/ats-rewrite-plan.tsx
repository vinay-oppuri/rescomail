import type { AtsAnalysisResponse } from "@repo/validations";
import { Badge } from "@repo/ui/components/badge";
import { AlertCircle, CheckCircle2, Sparkles } from "lucide-react";

interface AtsRewritePlanProps {
  rewrites: AtsAnalysisResponse["rewriteSuggestions"];
}

const AtsRewritePlan = ({ rewrites }: AtsRewritePlanProps) => {
  if (rewrites.length === 0) {
    return null;
  }

  return (
    <div className="relative border-t p-5 md:p-6 overflow-hidden bg-linear-to-br from-background to-muted/20">
      {/* Decorative background glow */}
      <div className="pointer-events-none absolute -right-12 -bottom-12 h-44 w-44 bg-emerald-500/5 blur-3xl" />

      <div className="flex items-center gap-2.5 mb-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary/10 text-primary">
          <Sparkles className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-foreground">
            Resume Replacements & Enhancements
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Optimize these specific sections or lines to maximize your ATS parsing score and match rate.
          </p>
        </div>
      </div>

      <div className="grid gap-5">
        {rewrites.map((rewrite, idx) => (
          <div
            key={rewrite.target + idx}
            className="group relative overflow-hidden border border-foreground/5 bg-card/60 p-4 md:p-5 shadow-xs backdrop-blur-xl transition-all duration-300 hover:border-primary/20 hover:shadow-md rounded-sm"
          >
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-foreground/5 pb-2.5 mb-3.5">
              <Badge variant="outline" className="capitalize px-2 py-0.5 font-mono text-[9px] tracking-wider text-muted-foreground bg-muted/40">
                {rewrite.target}
              </Badge>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                <span className="font-medium text-foreground/80 leading-relaxed">
                  {rewrite.reason}
                </span>
              </div>
            </div>

            {/* Comparison view */}
            <div className="grid gap-3.5 lg:grid-cols-2 items-stretch">
              {/* ORIGINAL Text block */}
              <div className="flex flex-col border border-rose-500/10 bg-rose-500/5 p-3.5 rounded-sm transition-all group-hover:border-rose-500/20">
                <span className="text-[9px] font-bold uppercase tracking-wider text-rose-500 mb-1.5 flex items-center gap-1">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500" />
                  Original Text
                </span>
                <p className="text-xs leading-relaxed text-foreground/80 break-words italic">
                  &ldquo;{rewrite.before || "Weak or missing keyword representation in this section."}&rdquo;
                </p>
              </div>

              {/* RECOMMENDED replacement block */}
              <div className="flex flex-col border border-emerald-500/20 bg-emerald-500/5 p-3.5 rounded-sm transition-all group-hover:border-emerald-500/30">
                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 mb-1.5 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  ATS-Optimized Suggested Replacement
                </span>
                <p className="text-xs font-semibold leading-relaxed text-foreground break-words">
                  {rewrite.after}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AtsRewritePlan;
