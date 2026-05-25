"use client";

import { Badge } from "@repo/ui/components/badge";
import { FileText } from "lucide-react";

import { useAtsStore } from "../../../store/ats-store";

const statusLabel: Record<string, string> = {
  uploaded: "Uploaded",
  queued: "Queued",
  processing: "Parsing",
  parsed: "Parsed",
  parse_failed: "Failed",
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

const statusVariant = (status: string) => {
  if (status === "parse_failed") {
    return "destructive";
  }

  if (status === "parsed") {
    return "default";
  }

  return "outline";
};

const AtsResumePicker = () => {
  const { resumes, resumeId, setResumeId } = useAtsStore();
  const selectedResume = resumes.find((r) => r.id === resumeId);

  return (
    <>
      <label className="grid gap-2 text-sm">
        <span className="flex items-center justify-between gap-3">
          <span className="font-medium">Resume</span>
          <span className="text-xs text-muted-foreground">
            {resumes.length} available
          </span>
        </span>
        <select
          value={resumeId}
          onChange={(event) => setResumeId(event.target.value)}
          className="h-10 w-full border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring/50"
          disabled={resumes.length === 0}
        >
          {resumes.length === 0 ? <option value="">No resumes uploaded</option> : null}
          {resumes.map((resume) => (
            <option key={resume.id} value={resume.id}>
              {resume.title}
            </option>
          ))}
        </select>
      </label>

      {selectedResume ? (
        <div className="border bg-muted/20 text-xs text-muted-foreground">
          <div className="grid grid-cols-[36px_1fr_auto] items-center gap-3 p-3">
            <div className="flex h-9 w-9 items-center justify-center border bg-background">
              <FileText className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">
                {selectedResume.fileName}
              </p>
              <p>{formatDate(selectedResume.createdAt)}</p>
            </div>
            <Badge variant={statusVariant(selectedResume.status)}>
              {statusLabel[selectedResume.status] ?? selectedResume.status}
            </Badge>
          </div>
          {selectedResume.parsingError ? (
            <p className="border-t px-3 py-2 text-destructive">
              {selectedResume.parsingError}
            </p>
          ) : null}
        </div>
      ) : null}
    </>
  );
};

export default AtsResumePicker;
