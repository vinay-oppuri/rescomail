import { AlertTriangle, CheckCircle2 } from "lucide-react";

import { useAtsStore } from "../../store/ats-store";
import AtsEvidenceMap from "./results/ats-evidence-map";
import AtsIntelligencePanel from "./results/ats-intelligence-panel";
import AtsJobProfilePanel from "./results/ats-job-profile-panel";
import AtsKeywordPanel from "./results/ats-keyword-panel";
import AtsListSection from "./results/ats-list-section";
import AtsRewritePlan from "./results/ats-rewrite-plan";
import AtsScoreOverview from "./results/ats-score-overview";
import AtsSuggestionsPanel from "./results/ats-suggestions-panel";

const AtsAnalysisResults = () => {
  const { analysis } = useAtsStore();

  if (!analysis) {
    return null;
  }

  return (
    <div className="flex flex-col bg-background">
      <AtsScoreOverview analysis={analysis} />

      <div className="grid gap-0 lg:grid-cols-2">
        <AtsListSection
          icon={CheckCircle2}
          title="Strengths"
          items={analysis.strengths}
        />
        <AtsListSection
          icon={AlertTriangle}
          title="Risks"
          items={analysis.risks}
          tone="warning"
        />
      </div>

      <div className="grid gap-0 border-t lg:grid-cols-2">
        <AtsKeywordPanel
          title="Matched keywords"
          keywords={analysis.matchedKeywords}
        />
        <AtsKeywordPanel
          title="Missing keywords"
          keywords={analysis.missingKeywords}
          muted
        />
      </div>

      <div className="grid gap-0 border-t xl:grid-cols-[320px_1fr]">
        <AtsJobProfilePanel jobProfile={analysis.jobProfile} />
        <AtsEvidenceMap evidence={analysis.evidence} />
      </div>

      <AtsIntelligencePanel intelligence={analysis.intelligence} />
      <AtsSuggestionsPanel suggestions={analysis.suggestions} />
      <AtsRewritePlan rewrites={analysis.rewriteSuggestions} />
    </div>
  );
};

export default AtsAnalysisResults;
