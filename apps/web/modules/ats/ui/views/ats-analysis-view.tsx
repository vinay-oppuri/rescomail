"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { ConfirmDialog } from "@repo/ui/components/confirm-dialog";

import WorkflowPageHeader from "@/modules/dashboard/ui/components/workflow-page-header";
import type { AtsAnalysisHistoryItem } from "../../server/ats-history";
import type { AtsResumeOption } from "../../server/ats-resumes";
import { useAtsStore } from "../../store/ats-store";
import AtsAnalysisForm from "../components/ats-analysis-form";
import AtsAnalysisResults from "../components/ats-analysis-results";
import AtsEmptyState from "../components/ats-empty-state";

interface AtsAnalysisViewProps {
  analyses: AtsAnalysisHistoryItem[];
  resumes: AtsResumeOption[];
  initialResumeId?: string;
}

const AtsAnalysisView = ({
  analyses,
  resumes,
  initialResumeId,
}: AtsAnalysisViewProps) => {
  const router = useRouter();
  const { initStore, showForm, setShowForm, analysis, setAnalysis, history } =
    useAtsStore();
  const parsedResumeCount = resumes.filter(
    (resume) => resume.status === "parsed",
  ).length;

  useEffect(() => {
    initStore(analyses, resumes, initialResumeId);
  }, [analyses, resumes, initialResumeId, initStore]);

  const startNewAnalysis = () => {
    setAnalysis(null);
    setShowForm(true);
  };

  const selectAnalysis = (id: string) => {
    const selected = history.find((item) => item.id === id);
    if (!selected?.analysis) return;

    setAnalysis(selected.analysis);
    setShowForm(false);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
      <WorkflowPageHeader
        title="Resume intelligence"
        description="Score a resume against a live role, inspect model signals, and turn missing evidence into a focused rewrite plan."
        metadata={
          <>
            <span>{parsedResumeCount} parsed resumes</span>
            <span aria-hidden="true">·</span>
            <span>{history.length} saved analyses</span>
          </>
        }
        historyLabel="Analysis history"
        historyPlaceholder={
          history.length ? "Select a saved analysis" : "No saved analyses yet"
        }
        historyOptions={history.map((run) => ({
          id: run.id,
          title: `${run.jobTitle || "Untitled role"} · ${run.overallScore}/100`,
          detail: run.companyName || run.resumeTitle,
        }))}
        selectedHistoryId={showForm ? undefined : analysis?.analysisId}
        onSelectHistory={selectAnalysis}
        action={
          showForm ? undefined : (
            <Button type="button" onClick={startNewAnalysis} className="w-full">
              <Plus className="h-4 w-4" />
              Start a new analysis
            </Button>
          )
        }
      />

      {showForm ? (
        <AtsAnalysisForm />
      ) : (
        <section className="min-h-175 overflow-hidden rounded-sm">
          <div className="flex items-center justify-between gap-3 border border-foreground/5 bg-card px-5 py-3">
            <div>
              <h2 className="text-sm font-semibold">Match report</h2>
              <p className="hidden text-xs text-muted-foreground md:block">
                Evidence, model confidence, and rewrite priorities
              </p>
            </div>

            {analysis?.analysisId ? (
              <ConfirmDialog
                title="Delete analysis"
                description="Delete this analysis permanently? This action cannot be undone."
                confirmText="Delete"
                onConfirm={async () => {
                  const { deleteAtsAnalysisAction } =
                    await import("../../server/actions");
                  const result = await deleteAtsAnalysisAction(
                    analysis.analysisId!,
                  );

                  if (!result.success) {
                    throw new Error(
                      result.error || "Failed to delete analysis.",
                    );
                  }

                  startNewAnalysis();
                  router.refresh();
                }}
                trigger={
                  <Button
                    variant="destructive"
                    size="icon"
                    title="Delete analysis"
                    aria-label="Delete analysis"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                }
              />
            ) : null}
          </div>

          {analysis ? (
            <AtsAnalysisResults />
          ) : (
            <AtsEmptyState
              hasResumes={resumes.length > 0}
              onStart={startNewAnalysis}
            />
          )}
        </section>
      )}
    </div>
  );
};

export default AtsAnalysisView;
