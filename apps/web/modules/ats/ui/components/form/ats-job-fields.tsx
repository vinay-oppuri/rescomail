"use client";

import { Input, Label, Textarea } from "@repo/ui";
import { useAtsStore } from "../../../store/ats-store";

const fieldClassName = "border-foreground/5! bg-muted/20!";

const AtsJobFields = () => {
  const {
    jobTitle,
    companyName,
    jobDescription,
    keywordText,
    setJobTitle,
    setCompanyName,
    setJobDescription,
    setKeywordText,
  } = useAtsStore();

  const jobWordCount = jobDescription.trim()
    ? jobDescription.trim().split(/\s+/).length
    : 0;

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="job-title">Target Role</Label>
          <Input
            id="job-title"
            value={jobTitle}
            onChange={(event) => setJobTitle(event.target.value)}
            className="bg-muted/20! border-foreground/5! rounded-sm"
            placeholder="Machine learning engineer"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="company-name">Company</Label>
          <Input
            id="company-name"
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            className="bg-muted/20! border-foreground/5! rounded-sm"
            placeholder="Acme AI"
          />
        </div>
      </div>

      <div className="space-y-2 mt-4">
        <Label htmlFor="job-description">Job Description</Label>
        <Textarea
          id="job-description"
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          className="h-24 md:h-48 resize-y bg-muted/20! border-foreground/5! leading-relaxed scrollbar-thin rounded-sm"
          placeholder="Paste the role description here..."
        />
        <p className="text-xs text-muted-foreground">
          {jobWordCount} words
        </p>
      </div>

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