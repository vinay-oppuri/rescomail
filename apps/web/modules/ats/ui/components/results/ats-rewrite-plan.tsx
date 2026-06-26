import type { AtsAnalysisResponse } from "@repo/validations";
import { AlertCircle, CheckCircle2, Sparkles } from "lucide-react";

interface AtsRewritePlanProps {
  rewrites: AtsAnalysisResponse["rewriteSuggestions"];
}

interface GroupedRewrite {
  target: string;
  items: AtsAnalysisResponse["rewriteSuggestions"];
}

const AtsRewritePlan = ({ rewrites }: AtsRewritePlanProps) => {
  if (rewrites.length === 0) {
    return null;
  }

  const getOrderValue = (target: string): number => {
    const norm = target.toLowerCase().trim();
    if (norm.includes("summary")) return 1;
    if (norm.includes("experience")) return 2;
    if (norm.includes("project")) return 3;
    return 4;
  };

  const sortedRewrites = [...rewrites].sort(
    (a, b) => getOrderValue(a.target) - getOrderValue(b.target)
  );

  const groups = sortedRewrites.reduce<GroupedRewrite[]>((acc, item) => {
    const existing = acc.find(
      (g) => g.target.toLowerCase() === item.target.toLowerCase()
    );
    if (existing) {
      existing.items.push(item);
    } else {
      acc.push({ target: item.target, items: [item] });
    }
    return acc;
  }, []);

  return (
    <div className="relative border-t p-0 md:p-6 overflow-hidden bg-linear-to-br from-background to-muted/20">
      <div className="grid gap-8">
        {groups.map((group) => (
          <div key={group.target} className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground border-b pb-1.5! p-4 md:p-0 font-mono">
              {group.target}
            </h4>

            <div className="grid gap-5">
              {group.items.map((rewrite, idx) => (
                <div
                  key={idx}
                  className="group relative overflow-hidden border border-foreground/5 bg-card/60 p-0 md:p-5 shadow-xs backdrop-blur-xl"
                >
                  <div className="hidden md:flex flex-wrap items-center justify-between gap-2 pb-2.5 mb-3.5">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <AlertCircle className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                      <span className="font-medium text-foreground/80 leading-relaxed">
                        {rewrite.reason}
                      </span>
                    </div>
                  </div>

                  {/* Comparison view*/}
                  <div className="grid lg:grid-cols-2 items-stretch">
                    {/* ORIGINAL Text block */}
                    <div className="flex flex-col border-r border-foreground/5 bg-rose-500/5 p-3.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-rose-500 mb-1.5 flex items-center gap-1">
                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-500" />
                        Original Text
                      </span>
                      <p className="text-xs leading-relaxed text-foreground/80 wrap-break-word italic">
                        &ldquo;{rewrite.before || "Weak or missing keyword representation in this section."}&rdquo;
                      </p>
                    </div>

                    {/* RECOMMENDED replacement block */}
                    <div className="flex flex-col bg-emerald-500/5 p-3.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500 mb-1.5 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                        ATS-Optimized Suggested Replacement
                      </span>
                      <p className="text-xs font-semibold leading-relaxed text-foreground wrap-break-word">
                        {rewrite.after}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AtsRewritePlan;
