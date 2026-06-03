import { Skeleton } from "@repo/ui";

export default function ApplicationsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
      <div className="flex flex-col gap-4 border-b border-border/50 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2 w-full max-w-3xl">
          <Skeleton className="h-8 w-[70%] sm:w-48 max-w-full" />
          <Skeleton className="h-4 w-full sm:w-72 max-w-full" />
        </div>
        <Skeleton className="h-9 w-[140px] sm:w-32 max-w-full" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Skeleton className="h-28 rounded-sm" />
        <Skeleton className="h-28 rounded-sm" />
        <Skeleton className="h-28 rounded-sm" />
        <Skeleton className="h-28 rounded-sm" />
      </div>
      <Skeleton className="h-80 w-full rounded-sm" />
    </div>
  );
}
