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
    <div className="flex flex-col bg-background">
      <AtsScoreOverview analysis={analysis} />

      <div className="border-t">
        <AtsKeywordPanel
          title="Keyword improvements (Missing keywords)"
          keywords={analysis.missingKeywords}
          muted
        />
      </div>

      <AtsRewritePlan rewrites={analysis.rewriteSuggestions} />
    </div>
  );
};

export default AtsAnalysisResults;
