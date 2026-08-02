"use client";

import type { FormEvent } from "react";
import { AlertTriangle, ArrowRight, Building2, FileText, Loader2, Sparkles } from "lucide-react";
import { Button } from "@repo/ui/components/button";
import { Badge } from "@repo/ui/components/badge";

import { useAtsStore } from "../../store/ats-store";
import AtsJobFields from "./form/ats-job-fields";
import AtsResumePicker from "./form/ats-resume-picker";

const AtsAnalysisForm = () => {
  const { handleAnalyze, error, isAnalyzing, resumeId, jobDescription, resumes } =
    useAtsStore();

  const selectedResume = resumes.find((r) => r.id === resumeId);
  const isParsed = selectedResume?.status === "parsed";
  const canAnalyze = Boolean(isParsed && jobDescription.trim().length >= 20);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    void handleAnalyze(event);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col border border-foreground/5 bg-card/20 shadow-sm overflow-hidden rounded-sm">
      <div className="flex items-start justify-between gap-3 border-b border-foreground/5 bg-muted/10 px-3 md:px-5 py-3 md:py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Analysis Setup
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Provide the resume and target role to extract actionable intelligence.
          </p>
        </div>
        <Badge variant="secondary" className="shrink-0 gap-1.5 shadow-sm">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          LLM Powered
        </Badge>
      </div>

      <div className="flex flex-col gap-6 p-3 sm:p-6">
        <div className="space-y-4">
          <h3 className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-widest">
            <FileText className="h-4 w-4 text-primary" />
            Resume Source
          </h3>
          <AtsResumePicker />
        </div>
        
        <div className="space-y-4 pt-5 border-t border-foreground/5">
          <h3 className="flex items-center gap-2 text-xs font-semibold text-foreground uppercase tracking-widest">
            <Building2 className="h-4 w-4 text-primary" />
            Job Details
          </h3>
          <AtsJobFields />
        </div>

        {error ? (
          <div className="flex gap-3 border-l-4 border-l-destructive border-y border-r border-y-destructive/20 border-r-destructive/20 bg-destructive/5 p-4 text-sm text-destructive shadow-sm rounded-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        ) : null}

        <Button 
          type="submit" 
          disabled={!canAnalyze || isAnalyzing}
          className="mt-4 h-11 w-full font-semibold text-xs md:text-sm "
        >
          {isAnalyzing ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-5 w-5" />
          )}
          {isAnalyzing ? "Analyzing Fit..." : "Analyze Match"}
          {!isAnalyzing && <ArrowRight className="ml-2 h-5 w-5" />}
        </Button>
      </div>
    </form>
  );
};

export default AtsAnalysisForm;
