"use client";

import { useEffect } from "react";
import { Badge } from "@repo/ui/components/badge";
import {
  BrainCircuit,
  Plus,
  Trash2,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { ConfirmDialog } from "@repo/ui/components/confirm-dialog";
import { Button, Label } from "@repo/ui";

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

const AtsAnalysisView = ({ analyses, resumes, initialResumeId }: AtsAnalysisViewProps) => {
  const { initStore, showForm, setShowForm, analysis, setAnalysis, history } = useAtsStore();

  // Hydrate the store with the latest server data each time the server
  // re-renders (e.g. after router.refresh()). Form fields are preserved.
  useEffect(() => {
    initStore(analyses, resumes, initialResumeId);
  }, [analyses, resumes, initialResumeId, initStore]);

  const parsedResumes = resumes.filter((r) => r.status === "parsed").length;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
      <div className="flex flex-col gap-4 border-b border-border/50 pb-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        <div className="max-w-3xl space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <BrainCircuit className="h-3 w-3" />
              BGE + cross-encoder
            </Badge>
            <Badge variant="outline">{parsedResumes} parsed resumes</Badge>
          </div>
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">
            Resume intelligence
          </h1>
          <p className="text-xs leading-6 text-muted-foreground">
            Score a resume against a live role, inspect model signals, and turn
            missing evidence into a focused rewrite plan.
          </p>
        </div>

        <div className="w-full shrink-0 lg:w-72">
          <Label className="mb-2 block text-sm font-medium text-muted-foreground">
            Analysis history
          </Label>
          <Select
            value={showForm ? "new" : analysis?.analysisId ?? "new"}
            onValueChange={(val) => {
              if (val === "new") {
                setShowForm(true);
              } else {
                const selected = history.find((h) => h.id === val);
                if (selected && selected.analysis) {
                  setAnalysis(selected.analysis);
                  setShowForm(false);
                }
              }
            }}
          >
            <SelectTrigger className="bg-card">
              <SelectValue placeholder="Select a past run..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Create new analysis</span>
                </div>
              </SelectItem>
              {history.length > 0 && (
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                  Saved Runs
                </div>
              )}
              {history.map((run) => (
                <SelectItem key={run.id} value={run.id}>
                  <div className="flex w-full items-center gap-2 overflow-hidden">
                    <span className="truncate font-medium text-foreground">
                      {run.jobTitle || "Untitled role"} - {run.overallScore}/100
                    </span>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      • {run.companyName || run.resumeTitle}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex w-full flex-col gap-6">
        {showForm ? (
          <AtsAnalysisForm />
        ) : (
          <section className="min-h-175 overflow-hidden border bg-card rounded-sm">
            <div className="flex items-center justify-between gap-3 border-b px-5 py-3">
              <div>
                <h2 className="text-sm font-semibold">Match report</h2>
                <p className="text-xs text-muted-foreground">
                  Evidence, model confidence, and rewrite priorities
                </p>
              </div>
              <div className="flex items-center gap-3">
                {analysis ? (
                  <Badge variant="outline">
                    {analysis.overallScore}/100
                  </Badge>
                ) : null}

                {/* Plus button to hide report and go back to form */}
                <Button
                  type="button"
                  size="icon"
                  onClick={() => setShowForm(true)}
                  title="New Analysis"
                >
                  <Plus className="h-4 w-4" />
                </Button>

                {analysis?.analysisId && (
                  <ConfirmDialog
                    title="Delete Analysis"
                    description="Are you sure you want to delete this analysis? This action cannot be undone."
                    confirmText="Delete"
                    onConfirm={async () => {
                      const { deleteAtsAnalysisAction } = await import("../../server/actions");
                      const res = await deleteAtsAnalysisAction(analysis.analysisId!);
                      if (res.success) {
                        setShowForm(true);
                      } else {
                        throw new Error(res.error || "Failed to delete.");
                      }
                    }}
                    trigger={
                      <Button
                        variant="destructive"
                        size="icon"
                        title="Delete Analysis"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                  />
                )}
              </div>
            </div>

            {analysis ? (
              <AtsAnalysisResults />
            ) : (
              <AtsEmptyState hasResumes={resumes.length > 0} />
            )}
          </section>
        )}
      </div>
    </div>
  );
};

export default AtsAnalysisView;
