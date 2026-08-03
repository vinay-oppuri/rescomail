"use client";

import { Label, Input } from "@repo/ui";
import JobDescriptionInput from "@/modules/dashboard/ui/components/job-description-input";
import { useAtsStore } from "../../../store/ats-store";

const AtsJobFields = () => {
  const {
    jobTitle,
    companyName,
    jobDescription,
    setJobTitle,
    setCompanyName,
    setJobDescription,
  } = useAtsStore();

  return (
    <>
      <div className="mb-4 grid gap-4 sm:grid-cols-2">
        <div className="flex-1 space-y-2">
          <Label htmlFor="job-title">
            Job title <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="job-title"
            value={jobTitle}
            onChange={(event) => setJobTitle(event.target.value)}
            placeholder="e.g. Software Engineer"
            className="bg-muted/20! border-foreground/5! rounded-sm"
          />
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="company-name">
            Company <span className="text-muted-foreground">(optional)</span>
          </Label>
          <Input
            id="company-name"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            placeholder="e.g. Acme Corp"
            className="bg-muted/20! border-foreground/5! rounded-sm"
          />
        </div>
      </div>

      <JobDescriptionInput
        inputId="ats-job-description"
        value={jobDescription}
        onValueChange={setJobDescription}
        minimumCharacters={20}
      />
    </>
  );
};

export default AtsJobFields;
