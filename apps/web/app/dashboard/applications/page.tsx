import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Briefcase, Plus } from "lucide-react";

const pipelineStages = [
  { label: "Saved", count: 0 },
  { label: "Applied", count: 0 },
  { label: "Interview", count: 0 },
  { label: "Offer", count: 0 },
];

const Page = () => {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Job Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Track roles, contacts, next steps, and interview progress.
          </p>
        </div>

        <Button disabled>
          <Plus className="h-4 w-4" />
          New Application
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        {pipelineStages.map((stage) => (
          <div key={stage.label} className="border bg-background p-4">
            <p className="text-sm font-medium">{stage.label}</p>
            <p className="mt-3 text-3xl font-bold">{stage.count}</p>
          </div>
        ))}
      </div>

      <div className="flex min-h-80 flex-col items-center justify-center gap-3 border bg-background px-6 text-center">
        <div className="flex h-10 w-10 items-center justify-center border bg-muted/40">
          <Briefcase className="h-5 w-5 text-muted-foreground" />
        </div>
        <Badge variant="outline">Coming next</Badge>
        <div className="space-y-1">
          <p className="text-sm font-medium">Application tracking is queued</p>
          <p className="max-w-md text-sm text-muted-foreground">
            The data model is ready for usage tracking. This view is now routed
            and ready for the job pipeline implementation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page;
