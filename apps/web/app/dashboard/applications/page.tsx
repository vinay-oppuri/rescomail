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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
      <div className="flex flex-col gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2 max-w-3xl">
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">Job Tracker</h1>
          <p className="text-xs leading-6 text-muted-foreground">
            Track roles, contacts, next steps, and interview progress.
          </p>
        </div>

        <Button disabled className="h-9 text-xs md:text-sm">
          <Plus className="mr-2 h-4 w-4" />
          New Application
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {pipelineStages.map((stage) => (
          <div key={stage.label} className="flex flex-col border border-foreground/5 bg-card/20 shadow-sm p-4 sm:p-6 rounded-xl">
            <p className="text-sm font-medium">{stage.label}</p>
            <p className="mt-3 text-3xl font-bold">{stage.count}</p>
          </div>
        ))}
      </div>

      <div className="flex min-h-80 flex-col items-center justify-center gap-4 border border-foreground/5 bg-card/20 shadow-sm px-6 py-12 text-center rounded-xl">
        <div className="flex h-12 w-12 items-center justify-center border border-foreground/5 bg-muted/40 rounded-md">
          <Briefcase className="h-5 w-5 text-muted-foreground" />
        </div>
        <Badge variant="secondary" className="rounded-md">Coming next</Badge>
        <div className="space-y-1 mt-2">
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
