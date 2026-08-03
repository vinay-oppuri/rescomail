"use client";

import type { FormEvent } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  FileText,
  Loader2,
  Mail,
  Settings2,
  Sparkles,
} from "lucide-react";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";

import { WorkflowSection } from "@/modules/dashboard/ui/components/workflow-form";
import { useColdmailStore } from "../../store/coldmail-store";
import ColdmailContentFields from "./form/coldmail-content-fields";
import ColdmailSetupFields from "./form/coldmail-setup-fields";
import ColdmailTargetFields from "./form/coldmail-target-fields";

const ColdmailComposer = () => {
  const {
    resumes,
    resumeId,
    companyWebsiteUrl,
    jobDescription,
    error,
    isGenerating,
    handleGenerate,
  } = useColdmailStore();
  const selectedResume = resumes.find((resume) => resume.id === resumeId);
  const hasParsedResume = selectedResume?.status === "parsed";
  const hasCompanyWebsite = companyWebsiteUrl.trim().length > 0;
  const hasJobDescription = jobDescription.trim().length >= 20;
  const canGenerate = Boolean(
    hasParsedResume && hasCompanyWebsite && hasJobDescription,
  );

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    void handleGenerate(event);
  };

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col overflow-hidden rounded-sm border border-foreground/5 bg-card/20 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3 border-b border-foreground/5 bg-muted/10 px-3 py-3 md:px-5 md:py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-foreground">
            Build your outreach draft
          </h2>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Complete the three steps below. Optional context makes the result
            more personal.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6 p-3 sm:p-6">
        <WorkflowSection
          step={1}
          icon={Settings2}
          title="Choose your source and style"
          description="Select the resume the draft should represent, then choose its tone and length."
        >
          <ColdmailSetupFields />
        </WorkflowSection>

        <WorkflowSection
          step={2}
          icon={Building2}
          title="Identify the target"
          description="Add company context, recipient details, and the response you want."
          separated
        >
          <ColdmailTargetFields />
        </WorkflowSection>

        <WorkflowSection
          step={3}
          icon={FileText}
          title="Provide role context"
          description="Upload or paste the target role description."
          separated
        >
          <ColdmailContentFields />
        </WorkflowSection>

        {error ? (
          <div
            role="alert"
            className="flex gap-3 rounded-sm border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive shadow-sm"
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="leading-relaxed">{error}</p>
          </div>
        ) : null}

        <div className="space-y-3">
          <Button
            type="submit"
            disabled={!canGenerate || isGenerating}
            className="h-10! text-xs px-6 font-semibold md:text-sm"
          >
            {isGenerating ? (
              <Loader2 className="mr-1 h-5 w-5 animate-spin" />
            ) : (
              <Mail className="mr-1 h-5 w-5" />
            )}
            {isGenerating ? "Drafting your email..." : "Generate draft"}
          </Button>
          {isGenerating ? (
            <p
              className="text-center text-xs text-muted-foreground"
              aria-live="polite"
            >
              Keep this page open while the email and follow-up are generated.
            </p>
          ) : null}
        </div>
      </div>
    </form>
  );
};

export default ColdmailComposer;
