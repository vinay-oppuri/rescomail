import { useAtsStore } from "../../store/ats-store";

import AtsKeywordPanel from "./results/ats-keyword-panel";
import AtsRewritePlan from "./results/ats-rewrite-plan";
import AtsScoreOverview from "./results/ats-score-overview";

const AtsAnalysisResults = () => {
  const { analysis } = useAtsStore();

  if (!analysis) {
    return null;
  }

  return (
    <div className="flex flex-col bg-background rounded-b-sm overflow-hidden border border-foreground/5">
      <AtsScoreOverview analysis={analysis} />
      <AtsKeywordPanel
        title="Missing keywords to prioritize"
        keywords={analysis.missingKeywords}
      />
      <AtsRewritePlan rewrites={analysis.rewriteSuggestions} />
    </div>
  );
};

export default AtsAnalysisResults;
