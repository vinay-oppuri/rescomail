"use client";

import type { FormEvent } from "react";
import { AlertTriangle, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";

import { useAtsStore } from "../../store/ats-store";
import AtsJobFields from "./form/ats-job-fields";
import AtsResumePicker from "./form/ats-resume-picker";

const AtsAnalysisForm = () => {
  const { handleAnalyze, error, isAnalyzing, resumeId, jobDescription } =
    useAtsStore();

  const canAnalyze = Boolean(resumeId && jobDescription.trim().length >= 20);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    void handleAnalyze(event);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col border bg-background">
      <div className="flex items-start justify-between gap-3 border-b px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold">Analysis setup</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Resume, target role, and priority terms
          </p>
        </div>
        <Badge variant="outline" className="shrink-0">
          Live model
        </Badge>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <AtsResumePicker />

        <AtsJobFields />

        {error ? (
          <div className="flex gap-2 border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        <Button type="submit" disabled={!canAnalyze || isAnalyzing}>
          {isAnalyzing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Analyze fit
          {!isAnalyzing ? <ArrowRight className="h-4 w-4" /> : null}
        </Button>
      </div>
    </form>
  );
};

export default AtsAnalysisForm;
