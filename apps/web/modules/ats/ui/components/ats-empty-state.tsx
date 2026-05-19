import { FileText, Target } from "lucide-react";

interface AtsEmptyStateProps {
  hasResumes: boolean;
}

const AtsEmptyState = ({ hasResumes }: AtsEmptyStateProps) => {
  const Icon = hasResumes ? Target : FileText;

  return (
    <div className="flex min-h-[640px] flex-col items-center justify-center gap-3 px-6 text-center">
      <div className="flex h-10 w-10 items-center justify-center border bg-muted/40">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium">
          {hasResumes ? "No analysis yet" : "Upload a resume first"}
        </p>
        <p className="max-w-md text-sm text-muted-foreground">
          {hasResumes
            ? "Choose a resume, add the target job, and run an analysis."
            : "ATS analysis needs at least one resume in your library."}
        </p>
      </div>
    </div>
  );
};

export default AtsEmptyState;
