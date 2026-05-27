import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { FileText } from "lucide-react";

import type { ResumeListItem } from "../../server/resumes";
import ResumeUploadPanel from "../components/resume-upload-panel";
import ResumeActionsRow from "../components/resume-actions-row";

interface ResumesViewProps {
  resumes: ResumeListItem[];
}

const statusLabel: Record<string, string> = {
  uploaded: "Uploaded",
  queued: "Queued",
  processing: "Parsing",
  parsed: "Parsed",
  parse_failed: "Failed",
};

const statusVariant = (status: string) => {
  if (status === "parse_failed") {
    return "destructive";
  }

  if (status === "parsed") {
    return "default";
  }

  return "outline";
};

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);

const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const ResumesView = ({ resumes }: ResumesViewProps) => {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">AI Resumes</h1>
          <p className="text-sm text-muted-foreground">
            Upload resumes, track parsing status, and prepare them for ATS
            analysis.
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <ResumeUploadPanel />

        <div className="min-h-80 border bg-muted/10">
          <div className="bg-foreground text-background border-b px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-semibold">Resume library</span>
            </div>
            {resumes.length > 0 && (
              <span className="text-xs">
                {resumes.length} {resumes.length === 1 ? "resume" : "resumes"}
              </span>
            )}
          </div>

          {resumes.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center gap-3 px-6 text-center">
              <div className="flex h-10 w-10 items-center justify-center border bg-muted/10">
                <FileText className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium">No resumes yet</p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Upload your first PDF resume to start parsing and analysis.
                </p>
              </div>
            </div>
          ) : (
            <div className="divide-y">
              {resumes.map((resume) => (
                <div
                  key={resume.id}
                  className="grid gap-3 px-4 py-4 md:grid-cols-[1fr_auto]"
                >
                  <div className="min-w-0 space-y-2">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-medium">
                        {resume.title}
                      </p>
                      <Badge variant={statusVariant(resume.status)}>
                        {statusLabel[resume.status] ?? resume.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <span className="truncate">{resume.fileName}</span>
                      <span>{formatFileSize(resume.fileSize)}</span>
                      <span>{formatDate(resume.createdAt)}</span>
                    </div>
                    {resume.parsingError ? (
                      <p className="text-xs text-destructive">
                        {resume.parsingError}
                      </p>
                    ) : null}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" asChild>
                      <a href={resume.fileUrl} target="_blank" rel="noreferrer">
                        Open PDF
                      </a>
                    </Button>

                    <ResumeActionsRow
                      resumeId={resume.id}
                      resumeTitle={resume.title}
                      canAnalyse={resume.status === "parsed"}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumesView;
