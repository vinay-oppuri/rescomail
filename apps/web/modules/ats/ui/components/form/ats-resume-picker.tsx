"use client";

import { Badge } from "@repo/ui/components/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Label } from "@repo/ui/components/label";
import { Button } from "@repo/ui/components/button";
import { FileText } from "lucide-react";
import Link from "next/link";

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
  if (status === "parse_failed") return "destructive";
  if (status === "parsed") return "default";
  return "outline";
};

const AtsResumePicker = () => {
  const { resumes, resumeId, setResumeId } = useAtsStore();

  const selectedResume = resumes.find((r) => r.id === resumeId);

  return (
    <>
      <div className="space-y-2">
        <Label htmlFor="ats-resume">
          Resume <span className="text-muted-foreground">(required)</span>
        </Label>
        <Select
          value={resumeId}
          onValueChange={setResumeId}
          disabled={resumes.length === 0}
        >
          <SelectTrigger
            id="ats-resume"
            className="w-full rounded-sm border-foreground/5! bg-muted/20!"
          >
            <SelectValue placeholder="Select a resume" />
          </SelectTrigger>

          <SelectContent>
            {resumes.length === 0 ? (
              <SelectItem value="empty" disabled>
                No resumes uploaded
              </SelectItem>
            ) : (
              resumes.map((resume) => (
                <SelectItem
                  key={resume.id}
                  value={resume.id}
                  disabled={resume.status !== "parsed"}
                >
                  {resume.title}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {resumes.length === 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-sm border border-foreground/5 bg-muted/10 p-3">
            <p className="text-xs text-muted-foreground">
              Upload and parse a resume before running an analysis.
            </p>
            <Button asChild type="button" size="sm" variant="outline">
              <Link href="/dashboard/resumes">Upload resume</Link>
            </Button>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {resumes.filter((resume) => resume.status === "parsed").length}{" "}
            parsed resumes available
          </p>
        )}
      </div>

      {selectedResume && (
        <div className="border border-foreground/5 bg-muted/20 text-xs text-muted-foreground rounded-sm overflow-hidden">
          <div className="grid grid-cols-[36px_1fr_auto] items-center gap-3 p-3">
            <div className="flex h-9 w-9 items-center justify-center border border-foreground/5! bg-card rounded-sm">
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

          {selectedResume.parsingError && (
            <p className="border-t px-3 py-2 text-destructive">
              {selectedResume.parsingError}
            </p>
          )}
        </div>
      )}
    </>
  );
};

export default AtsResumePicker;
