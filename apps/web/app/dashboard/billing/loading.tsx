import { Skeleton } from "@repo/ui";

export default function BillingLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
      <div className="flex flex-col gap-4 border-b border-border/50 pb-6">
        <div className="space-y-2 w-full max-w-3xl">
          <Skeleton className="h-8 w-[50%] sm:w-32 max-w-full" />
          <Skeleton className="h-4 w-[90%] sm:w-64 max-w-full" />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-[1fr_320px]">
        <Skeleton className="h-64 w-full rounded-sm" />
        <Skeleton className="h-64 w-full rounded-sm" />
      </div>
    </div>
  );
}
