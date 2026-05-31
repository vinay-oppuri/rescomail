import { BrainCircuit, FileText, ListChecks, Target } from "lucide-react";

interface AtsEmptyStateProps {
  hasResumes: boolean;
}

const AtsEmptyState = ({ hasResumes }: AtsEmptyStateProps) => {
  const Icon = hasResumes ? Target : FileText;

  return (
    <div className="flex min-h-[640px] flex-col items-center justify-center gap-5 px-6 text-center">
      <div className="flex h-12 w-12 items-center justify-center border bg-muted/40 rounded-md">
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
      <div className="grid w-full max-w-xl gap-2 text-left sm:grid-cols-3">
        {[
          { icon: FileText, label: "Resume evidence" },
          { icon: BrainCircuit, label: "Model fit" },
          { icon: ListChecks, label: "Rewrite plan" },
        ].map((item) => (
          <div key={item.label} className="border bg-muted/20 p-3 rounded-md">
            <item.icon className="h-4 w-4 text-muted-foreground" />
            <p className="mt-3 text-xs font-medium">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AtsEmptyState;
