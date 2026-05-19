import type { AtsAnalysisResponse } from "@repo/validations";

interface AtsRewritePlanProps {
  rewrites: AtsAnalysisResponse["rewriteSuggestions"];
}

const AtsRewritePlan = ({ rewrites }: AtsRewritePlanProps) => {
  if (rewrites.length === 0) {
    return null;
  }

  return (
    <div className="border-t p-5">
      <h3 className="text-sm font-semibold">Resume rewrite plan</h3>
      <div className="mt-4 grid gap-3">
        {rewrites.map((rewrite) => (
          <div key={rewrite.target} className="border p-4">
            <p className="text-sm font-medium">{rewrite.target}</p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {rewrite.reason}
            </p>
            <p className="mt-3 border-l-2 border-primary/40 pl-3 text-sm leading-6">
              {rewrite.after}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AtsRewritePlan;
