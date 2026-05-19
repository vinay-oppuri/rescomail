import { Badge } from "@repo/ui/components/badge";

import type { AtsResumeOption } from "../../../server/ats-resumes";

interface AtsResumePickerProps {
  resumes: AtsResumeOption[];
  selectedResume?: AtsResumeOption;
  resumeId: string;
  onResumeIdChange: (value: string) => void;
}

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

const AtsResumePicker = ({
  resumes,
  selectedResume,
  resumeId,
  onResumeIdChange,
}: AtsResumePickerProps) => (
  <>
    <label className="grid gap-2 text-sm">
      <span className="font-medium">Resume</span>
      <select
        value={resumeId}
        onChange={(event) => onResumeIdChange(event.target.value)}
        className="h-9 w-full border bg-background px-3 text-sm outline-none transition-colors focus:border-ring focus:ring-1 focus:ring-ring/50"
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
      <div className="border bg-muted/20 p-3 text-xs text-muted-foreground">
        <div className="flex items-center justify-between gap-3">
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
          <p className="mt-2 text-destructive">{selectedResume.parsingError}</p>
        ) : null}
      </div>
    ) : null}
  </>
);

export default AtsResumePicker;
