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
    <div className="flex flex-col bg-background border rounded-sm overflow-hidden">
      {/* 1. Score percentages and summary overview */}
      <AtsScoreOverview analysis={analysis} />

      {/* 2. Missing keywords section */}
      <div className="border-t">
        <AtsKeywordPanel
          title="Keyword improvements (Missing keywords)"
          keywords={analysis.missingKeywords}
          muted
        />
      </div>

      {/* 3. Rewrite suggestions comparison plan */}
      <AtsRewritePlan rewrites={analysis.rewriteSuggestions} />
    </div>
  );
};

export default AtsAnalysisResults;

