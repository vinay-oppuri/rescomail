import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import { CreditCard } from "lucide-react";

const Page = () => {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
      <div className="flex flex-col gap-4 border-b border-border/50 pb-6">
        <div className="space-y-2 max-w-3xl">
          <h1 className="text-xl font-bold tracking-tight md:text-2xl">Billing</h1>
          <p className="text-xs leading-6 text-muted-foreground">
            Subscription and usage billing are ready at the schema level.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <div className="flex flex-col border border-foreground/5 bg-card/20 shadow-sm p-4 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <Badge variant="outline">Free</Badge>
              <h2 className="text-lg font-semibold">Starter workspace</h2>
              <p className="text-sm text-muted-foreground">
                Stripe checkout and customer portal can attach to the new
                subscription tables.
              </p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center border bg-muted/40">
              <CreditCard className="h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="flex flex-col border border-foreground/5 bg-muted/10 p-4">
              <p className="text-xs text-muted-foreground">Resume parses</p>
              <p className="mt-2 text-2xl font-bold">0</p>
            </div>
            <div className="flex flex-col border border-foreground/5 bg-muted/10 p-4">
              <p className="text-xs text-muted-foreground">AI emails</p>
              <p className="mt-2 text-2xl font-bold">0</p>
            </div>
            <div className="flex flex-col border border-foreground/5 bg-muted/10 p-4">
              <p className="text-xs text-muted-foreground">ATS analyses</p>
              <p className="mt-2 text-2xl font-bold">0</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col border border-foreground/5 bg-card/20 shadow-sm p-4 sm:p-6">
          <h2 className="text-sm font-semibold">Next billing step</h2>
          <p className="mt-3 text-sm text-muted-foreground">
            Add Stripe products, checkout sessions, webhook handlers, and usage
            event writes when paid plans are ready.
          </p>
          <Button className="mt-6 w-full h-11 text-xs md:text-sm font-semibold" disabled>
            Open Customer Portal
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
