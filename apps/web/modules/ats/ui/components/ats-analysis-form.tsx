import type { FormEvent } from "react";
import { AlertTriangle, Loader2, Sparkles } from "lucide-react";
import { Button } from "@repo/ui/components/button";

import type { AtsResumeOption } from "../../server/ats-resumes";
import AtsJobFields from "./form/ats-job-fields";
import AtsResumePicker from "./form/ats-resume-picker";

interface AtsAnalysisFormProps {
  resumes: AtsResumeOption[];
  selectedResume?: AtsResumeOption;
  resumeId: string;
  jobTitle: string;
  companyName: string;
  jobDescription: string;
  keywordText: string;
  error: string | null;
  canAnalyze: boolean;
  isAnalyzing: boolean;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onResumeIdChange: (value: string) => void;
  onJobTitleChange: (value: string) => void;
  onCompanyNameChange: (value: string) => void;
  onJobDescriptionChange: (value: string) => void;
  onKeywordTextChange: (value: string) => void;
}

const AtsAnalysisForm = ({
  resumes,
  selectedResume,
  resumeId,
  jobTitle,
  companyName,
  jobDescription,
  keywordText,
  error,
  canAnalyze,
  isAnalyzing,
  onSubmit,
  onResumeIdChange,
  onJobTitleChange,
  onCompanyNameChange,
  onJobDescriptionChange,
  onKeywordTextChange,
}: AtsAnalysisFormProps) => {
  return (
    <form onSubmit={onSubmit} className="flex flex-col border bg-background">
      <div className="border-b px-4 py-3">
        <h2 className="text-sm font-semibold">Analysis setup</h2>
      </div>

      <div className="flex flex-col gap-4 p-4">
        <AtsResumePicker
          resumes={resumes}
          selectedResume={selectedResume}
          resumeId={resumeId}
          onResumeIdChange={onResumeIdChange}
        />

        <AtsJobFields
          jobTitle={jobTitle}
          companyName={companyName}
          jobDescription={jobDescription}
          keywordText={keywordText}
          onJobTitleChange={onJobTitleChange}
          onCompanyNameChange={onCompanyNameChange}
          onJobDescriptionChange={onJobDescriptionChange}
          onKeywordTextChange={onKeywordTextChange}
        />

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
          Analyze ATS Fit
        </Button>
      </div>
    </form>
  );
};

export default AtsAnalysisForm;
