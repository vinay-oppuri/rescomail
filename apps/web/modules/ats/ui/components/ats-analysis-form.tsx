"use client";

import type { FormEvent } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  FileText,
  Loader2,
  Mail,
  Sparkles,
} from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";

import { WorkflowSection } from "@/modules/dashboard/ui/components/workflow-form";
import { useAtsStore } from "../../store/ats-store";
import AtsJobFields from "./form/ats-job-fields";
import AtsResumePicker from "./form/ats-resume-picker";
import { SiGoogledocs } from "react-icons/si";

const AtsAnalysisForm = () => {
  const {
    handleAnalyze,
    error,
    isAnalyzing,
    resumeId,
    jobDescription,
    resumes,
  } = useAtsStore();
  const selectedResume = resumes.find((resume) => resume.id === resumeId);
  const hasParsedResume = selectedResume?.status === "parsed";
  const hasJobDescription = jobDescription.trim().length >= 20;
  const canAnalyze = Boolean(hasParsedResume && hasJobDescription);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    void handleAnalyze(event);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col overflow-hidden rounded-sm border border-foreground/5 bg-card/20 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3 border-b border-foreground/5 bg-muted/10 px-3 py-3 md:px-5 md:py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Set up your analysis
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Complete both steps below. Optional role details improve the report.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-3 sm:p-6">
        <WorkflowSection
          step={1}
          icon={FileText}
          title="Choose a resume"
          description="Select a parsed resume from your library."
        >
          <AtsResumePicker />
        </WorkflowSection>

        <WorkflowSection
          step={2}
          icon={Building2}
          title="Add the target role"
          description="Upload or paste the job description, then add any useful context."
          separated
        >
          <AtsJobFields />
        </WorkflowSection>

        {error ? (
          <div
            role="alert"
            className="flex gap-3 rounded-sm border border-destructive/20 border-l-4 border-l-destructive bg-destructive/5 p-4 text-sm text-destructive shadow-sm"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        ) : null}

        <div className="space-y-3">
          <Button
            type="submit"
            disabled={!canAnalyze || isAnalyzing}
            className="h-10! text-xs px-6 font-semibold md:text-sm"
          >
            {isAnalyzing ? (
              <Loader2 className="mr-1 h-5 w-5 animate-spin" />
            ) : (
              <SiGoogledocs className="mr-1 h-5 w-5" />
            )}
            {isAnalyzing ? "Analyzing resume match..." : "Analyze resume"}
          </Button>
          {isAnalyzing ? (
            <p
              className="text-center text-xs text-muted-foreground"
              aria-live="polite"
            >
              Keep this page open while the report is generated.
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
};

export default AtsAnalysisForm;
