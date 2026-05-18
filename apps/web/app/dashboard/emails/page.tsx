import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { Mail, WandSparkles } from "lucide-react";

const Page = () => {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Cold Emails</h1>
          <p className="text-sm text-muted-foreground">
            Generate recruiter outreach and follow-up messages from your resume.
          </p>
        </div>

        <Button disabled>
          <WandSparkles className="h-4 w-4" />
          Generate Email
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="flex min-h-96 flex-col items-center justify-center gap-3 border bg-background px-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center border bg-muted/40">
            <Mail className="h-5 w-5 text-muted-foreground" />
          </div>
          <Badge variant="outline">Coming next</Badge>
          <div className="space-y-1">
            <p className="text-sm font-medium">Email generation is queued</p>
            <p className="max-w-md text-sm text-muted-foreground">
              Resume parsing is the first dependency. This page is ready for the
              AI prompt and credit ledger integration.
            </p>
          </div>
        </div>

        <div className="border bg-background p-4">
          <h2 className="text-sm font-semibold">Expected workflow</h2>
          <div className="mt-4 space-y-3 text-sm text-muted-foreground">
            <p>Select a parsed resume.</p>
            <p>Add the target company, role, and recipient.</p>
            <p>Generate, edit, and save outreach variants.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
