"use client";

import { Label, Textarea } from "@repo/ui";
import { useAtsStore } from "../../../store/ats-store";

const AtsJobFields = () => {
  const {
    jobDescription,
    keywordText,
    setJobDescription,
    setKeywordText,
  } = useAtsStore();

  const jobWordCount = jobDescription.trim()
    ? jobDescription.trim().split(/\s+/).length
    : 0;

  return (
    <>
      <div className="space-y-2">
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
