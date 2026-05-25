"use client";

import { useState, useEffect } from "react";
import { Badge } from "@repo/ui/components/badge";
import {
  BrainCircuit,
  Clock3,
  FileText,
  Gauge,
  Target,
  Plus,
} from "lucide-react";

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
  const parsedResumes = resumes.filter((resume) => resume.status === "parsed").length;
  
  // Toggle state for displaying the form vs. the match report
  const [showForm, setShowForm] = useState(!ats.analysis);

  const bestScore = ats.history.reduce(
    (score, item) => Math.max(score, item.overallScore),
    0,
  );
  const latestRun = ats.history[0];

  // Automatically switch to the report view when an analysis successfully completes
  useEffect(() => {
    if (ats.analysis && !ats.isAnalyzing) {
      setShowForm(false);
    }
  }, [ats.analysis, ats.isAnalyzing]);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
      <div className="flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-3xl space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <BrainCircuit className="h-3 w-3" />
              BGE + cross-encoder
            </Badge>
            <Badge variant="outline">{parsedResumes} parsed resumes</Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Resume intelligence
          </h1>
          <p className="text-sm leading-6 text-muted-foreground">
            Score a resume against a live role, inspect model signals, and turn
            missing evidence into a focused rewrite plan.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:min-w-130">
          <StatTile
            icon={FileText}
            label="Library"
            value={`${resumes.length}`}
            detail="resumes"
          />
          <StatTile
            icon={Target}
            label="Runs"
            value={`${ats.history.length}`}
            detail="analyses"
          />
          <StatTile
            icon={Gauge}
            label="Best"
            value={bestScore ? `${bestScore}` : "--"}
            detail="score"
          />
          <StatTile
            icon={Clock3}
            label="Latest"
            value={latestRun ? `${latestRun.overallScore}` : "--"}
            detail={latestRun?.verdict.replaceAll("_", " ") ?? "pending"}
          />
        </div>
      </div>

      {/* Updated Grid: 1fr (Left) for Form/Report, 400px (Right) for History */}
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_400px]">
        
        {/* LEFT COLUMN: Form or Match Report */}
        <div className="flex flex-col gap-5">
          {showForm ? (
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
          ) : (
            <section className="min-h-175 overflow-hidden border bg-background">
              <div className="flex items-center justify-between gap-3 border-b px-5 py-3">
                <div>
                  <h2 className="text-sm font-semibold">Match report</h2>
                  <p className="text-xs text-muted-foreground">
                    Evidence, model confidence, and rewrite priorities
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {ats.analysis ? (
                    <Badge variant="outline">
                      {ats.analysis.overallScore}/100
                    </Badge>
                  ) : null}
                  
                  {/* Plus button to hide report and go back to form */}
                  <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                    title="New Analysis"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              {ats.analysis ? (
                <AtsAnalysisResults analysis={ats.analysis} />
              ) : (
                <AtsEmptyState hasResumes={resumes.length > 0} />
              )}
            </section>
          )}
        </div>

        {/* RIGHT COLUMN: History Sidebar */}
        <div className="flex flex-col gap-5 xl:sticky xl:top-20 xl:self-start">
          <AtsAnalysisHistory
            analyses={ats.history}
            selectedAnalysisId={ats.analysis?.analysisId}
            onSelectAnalysis={(item) => {
              if (item.analysis) {
                ats.setAnalysis(item.analysis);
                setShowForm(false); // Instantly show report when clicking history
              }
            }}
          />
        </div>
        
      </div>
    </div>
  );
};

interface StatTileProps {
  icon: typeof FileText;
  label: string;
  value: string;
  detail: string;
}

const StatTile = ({ icon: Icon, label, value, detail }: StatTileProps) => (
  <div className="border bg-muted/20 p-3">
    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
      <Icon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </div>
    <div className="mt-2 flex items-end justify-between gap-2">
      <p className="text-2xl font-bold tracking-tight">{value}</p>
      <p className="truncate pb-1 text-xs capitalize text-muted-foreground">
        {detail}
      </p>
    </div>
  </div>
);

export default AtsAnalysisView;