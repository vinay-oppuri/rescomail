import { Skeleton } from "@repo/ui";

export default function AtsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
      <div className="flex flex-col gap-4 border-b border-border/50 pb-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
        <div className="max-w-3xl space-y-2 w-full">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Skeleton className="h-6 w-32 rounded-sm" />
            <Skeleton className="h-6 w-32 rounded-sm" />
          </div>
          <Skeleton className="h-8 w-[80%] sm:w-64 max-w-full rounded-sm" />
          <Skeleton className="h-4 w-full max-w-md rounded-sm" />
          <Skeleton className="h-4 w-[90%] max-w-md lg:hidden rounded-sm" />
        </div>
        <div className="w-full shrink-0 lg:w-72 space-y-2 mt-2 lg:mt-0">
          <Skeleton className="h-4 w-24 rounded-sm" />
          <Skeleton className="h-10 w-full rounded-sm" />
        </div>
      </div>
      <div className="flex w-full flex-col gap-6">
        <Skeleton className="h-[500px] w-full rounded-sm" />
      </div>
    </div>
  );
}
