import { Skeleton } from "@repo/ui";

export default function ResumesLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
      <div className="flex flex-col gap-4 border-b border-border/50 pb-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2 w-full max-w-3xl">
          <Skeleton className="h-8 w-[60%] sm:w-48 max-w-full rounded-sm" />
          <Skeleton className="h-4 w-full max-w-md rounded-sm" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <Skeleton className="h-120 w-full rounded-sm" />
        <Skeleton className="h-120 w-full rounded-sm" />
      </div>
    </div>
  );
}
