"use client";

import { Badge } from "@repo/ui/components/badge";

import type { AtsAnalysisHistoryItem } from "../../server/ats-history";
import type { AtsResumeOption } from "../../server/ats-resumes";
import AtsAnalysisForm from "../components/ats-analysis-form";
import AtsAnalysisHistory from "../components/ats-analysis-history";
import AtsAnalysisResults from "../components/ats-analysis-results";
import AtsEmptyState from "../components/ats-empty-state";
import { useAtsAnalysis } from "../hooks/use-ats-analysis";

interface AtsAnalysisViewProps {
  analyses: AtsAnalysisHistoryItem[];
  resumes: AtsResumeOption[];
}

const AtsAnalysisView = ({ analyses, resumes }: AtsAnalysisViewProps) => {
  const ats = useAtsAnalysis(analyses, resumes);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">ATS Analysis</h1>
          <p className="text-sm text-muted-foreground">
            Compare a resume with a target role and get score-level feedback.
          </p>
        </div>

        <Badge variant="outline" className="w-fit">
          {resumes.length} resumes
        </Badge>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <div className="flex flex-col gap-6">
          <AtsAnalysisForm
            resumes={resumes}
            selectedResume={ats.selectedResume}
            resumeId={ats.resumeId}
            jobTitle={ats.jobTitle}
            companyName={ats.companyName}
            jobDescription={ats.jobDescription}
            keywordText={ats.keywordText}
            error={ats.error}
            canAnalyze={ats.canAnalyze}
            isAnalyzing={ats.isAnalyzing}
            onSubmit={ats.handleAnalyze}
            onResumeIdChange={ats.setResumeId}
            onJobTitleChange={ats.setJobTitle}
            onCompanyNameChange={ats.setCompanyName}
            onJobDescriptionChange={ats.setJobDescription}
            onKeywordTextChange={ats.setKeywordText}
          />

          <AtsAnalysisHistory
            analyses={ats.history}
            selectedAnalysisId={ats.analysis?.analysisId}
            onSelectAnalysis={(item) => {
              if (item.analysis) {
                ats.setAnalysis(item.analysis);
              }
            }}
          />
        </div>

        <div className="min-h-[640px] border bg-background">
          {ats.analysis ? (
            <AtsAnalysisResults analysis={ats.analysis} />
          ) : (
            <AtsEmptyState hasResumes={resumes.length > 0} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AtsAnalysisView;
