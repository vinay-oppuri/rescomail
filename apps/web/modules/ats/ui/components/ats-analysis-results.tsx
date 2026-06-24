import { useState } from "react";
import { Brain, ClipboardList, Layers } from "lucide-react";

import { useAtsStore } from "../../store/ats-store";
import AtsKeywordPanel from "./results/ats-keyword-panel";
import AtsRewritePlan from "./results/ats-rewrite-plan";
import AtsScoreOverview from "./results/ats-score-overview";
import AtsIntelligencePanel from "./results/ats-intelligence-panel";
import AtsEvidenceMap from "./results/ats-evidence-map";
import AtsJobProfilePanel from "./results/ats-job-profile-panel";

const AtsAnalysisResults = () => {
  const { analysis } = useAtsStore();
  const [activeTab, setActiveTab] = useState<"overview" | "intelligence" | "evidence">("overview");

  if (!analysis) {
    return null;
  }

  return (
    <div className="flex flex-col bg-background">
      {/* Custom Tabs Navigation */}
      <div className="flex border-b bg-muted/20">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 -mb-[2px] ${
            activeTab === "overview"
              ? "border-primary text-primary bg-card"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10"
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Match Overview</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("intelligence")}
          className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 -mb-[2px] ${
            activeTab === "intelligence"
              ? "border-primary text-primary bg-card"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10"
          }`}
        >
          <Brain className="h-4 w-4" />
          <span>AI Intelligence</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("evidence")}
          className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wider transition-colors border-b-2 -mb-[2px] ${
            activeTab === "evidence"
              ? "border-primary text-primary bg-card"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/10"
          }`}
        >
          <ClipboardList className="h-4 w-4" />
          <span>Evidence Map</span>
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === "overview" && (
        <div className="flex flex-col">
          <AtsScoreOverview analysis={analysis} />
          <div className="grid md:grid-cols-[1fr_300px] border-t">
            <div className="flex flex-col">
              <AtsKeywordPanel
                title="Keyword improvements (Missing keywords)"
                keywords={analysis.missingKeywords}
                muted
              />
            </div>
            <AtsJobProfilePanel jobProfile={analysis.jobProfile} />
          </div>
        </div>
      )}

      {activeTab === "intelligence" && (
        <div className="flex flex-col">
          <AtsIntelligencePanel intelligence={analysis.intelligence} />
          <AtsRewritePlan rewrites={analysis.rewriteSuggestions} />
        </div>
      )}

      {activeTab === "evidence" && (
        <div className="flex flex-col">
          <AtsEvidenceMap evidence={analysis.evidence} />
        </div>
      )}
    </div>
  );
};

export default AtsAnalysisResults;

