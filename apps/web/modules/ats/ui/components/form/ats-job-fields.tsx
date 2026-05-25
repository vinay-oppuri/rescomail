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
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
        <Label className="grid gap-2 text-sm">
          <span className="font-medium">Target role</span>
          <Input
            value={jobTitle}
            onChange={(event) => setJobTitle(event.target.value)}
            className={fieldClassName}
            placeholder="Machine learning engineer"
          />
        </Label>

        <Label className="grid gap-2 text-sm">
          <span className="font-medium">Company</span>
          <Input
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            className={fieldClassName}
            placeholder="Acme AI"
          />
        </Label>
      </div>

      <Label className="grid gap-2 text-sm">
        <span className="flex items-center justify-between gap-3">
          <span className="font-medium">Job description</span>
          <span className="text-xs text-muted-foreground">
            {jobWordCount} words
          </span>
        </span>

        <Textarea
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          className={`min-h-64 ${fieldClassName}`}
          placeholder="Paste the role description here..."
        />
      </Label>

      <Label className="grid gap-2 text-sm">
        <span className="flex items-center justify-between gap-3">
          <span className="font-medium">Priority keywords</span>
          <span className="text-xs text-muted-foreground">Optional</span>
        </span>

        <Textarea
          value={keywordText}
          onChange={(event) => setKeywordText(event.target.value)}
          className={`min-h-20 ${fieldClassName}`}
          placeholder="Python, FastAPI, SQL"
        />
      </Label>
    </>
  );
};

export default AtsJobFields;