"use client";

import { Label, Textarea, Input } from "@repo/ui";
import { useAtsStore } from "../../../store/ats-store";
import AtsJobDescriptionInput from "./ats-job-description-input";

const AtsJobFields = () => {
  const {
    jobTitle,
    companyName,
    keywordText,
    setJobTitle,
    setCompanyName,
    setKeywordText,
  } = useAtsStore();

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center mb-4">
        <div className="flex-1 space-y-2">
          <Label htmlFor="job-title">Job Title</Label>
          <Input
            id="job-title"
            value={jobTitle}
            onChange={(event) => setJobTitle(event.target.value)}
            placeholder="e.g. Software Engineer"
            className="bg-muted/20! border-foreground/5! rounded-sm"
          />
        </div>
        <div className="flex-1 space-y-2">
          <Label htmlFor="company-name">Company Name</Label>
          <Input
            id="company-name"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            placeholder="e.g. Acme Corp"
            className="bg-muted/20! border-foreground/5! rounded-sm"
          />
        </div>
      </div>

      <AtsJobDescriptionInput />

      <div className="space-y-2 mt-4">
        <Label htmlFor="priority-keywords">Priority Keywords (Optional)</Label>
        <Textarea
          id="priority-keywords"
          value={keywordText}
          onChange={(event) => setKeywordText(event.target.value)}
          className="h-16 resize-y bg-muted/20! border-foreground/5! leading-relaxed scrollbar-thin rounded-sm"
          placeholder="Python, FastAPI, SQL"
        />
      </div>
    </>
  );
};

export default AtsJobFields;
