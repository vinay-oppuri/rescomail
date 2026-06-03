import { Skeleton } from "@repo/ui";

export default function DashboardLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8 relative">
      <Skeleton className="w-full h-32 md:h-40 rounded-sm" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32 rounded-sm" />
        <Skeleton className="h-32 rounded-sm" />
        <Skeleton className="h-32 rounded-sm" />
      </div>
      <div className="grid gap-8 md:grid-cols-5">
        <div className="md:col-span-3 space-y-5">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-3/4 sm:w-32 max-w-full rounded-sm" />
            <Skeleton className="h-4 w-full sm:w-48 max-w-full rounded-sm" />
          </div>
          <div className="flex flex-col gap-3">
            <Skeleton className="h-20 rounded-sm" />
            <Skeleton className="h-20 rounded-sm" />
            <Skeleton className="h-20 rounded-sm" />
          </div>
        </div>
        <div className="md:col-span-2 space-y-5">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-3/4 sm:w-32 max-w-full rounded-sm" />
            <Skeleton className="h-4 w-full sm:w-48 max-w-full rounded-sm" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-24 rounded-sm" />
            <Skeleton className="h-24 rounded-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}
