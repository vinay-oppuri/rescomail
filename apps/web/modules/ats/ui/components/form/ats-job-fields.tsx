"use client";

import { useAtsStore } from "../../../store/ats-store";

const inputClassName =
  "h-9 border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring/50";

const textareaClassName =
  "resize-y border bg-background px-3 py-2 text-sm leading-6 outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring/50";

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
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Target role</span>
          <input
            value={jobTitle}
            onChange={(event) => setJobTitle(event.target.value)}
            className={`${inputClassName} w-full`}
            placeholder="Machine learning engineer"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Company</span>
          <input
            value={companyName}
            onChange={(event) => setCompanyName(event.target.value)}
            className={`${inputClassName} w-full`}
            placeholder="Acme AI"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm">
        <span className="flex items-center justify-between gap-3">
          <span className="font-medium">Job description</span>
          <span className="text-xs text-muted-foreground">
            {jobWordCount} words
          </span>
        </span>
        <textarea
          value={jobDescription}
          onChange={(event) => setJobDescription(event.target.value)}
          className={`min-h-64 ${textareaClassName}`}
          placeholder="Paste the role description here..."
        />
      </label>

      <label className="grid gap-2 text-sm">
        <span className="flex items-center justify-between gap-3">
          <span className="font-medium">Priority keywords</span>
          <span className="text-xs text-muted-foreground">Optional</span>
        </span>
        <textarea
          value={keywordText}
          onChange={(event) => setKeywordText(event.target.value)}
          className={`min-h-20 ${textareaClassName}`}
          placeholder="Python, FastAPI, SQL"
        />
      </label>
    </>
  );
};

export default AtsJobFields;
