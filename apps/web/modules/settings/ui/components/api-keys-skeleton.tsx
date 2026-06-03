import { Skeleton } from "@repo/ui";

export function ApiKeysSkeleton() {
  return (
    <section className="flex flex-col border border-foreground/5 bg-card/20 shadow-sm overflow-hidden rounded-sm w-full">
      <div className="flex items-start justify-between gap-3 border-b border-foreground/5 bg-muted/10 px-3 md:px-5 py-3 md:py-4">
        <div className="space-y-2 w-full max-w-sm">
          <Skeleton className="h-5 w-[60%] sm:w-32 max-w-full" />
          <Skeleton className="h-4 w-full" />
        </div>
      </div>

      <div className="flex flex-col gap-6 p-3 sm:p-6">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full rounded-sm" />
          <Skeleton className="h-8 w-full max-w-xl" />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 px-3 md:px-5 py-3 md:py-4">
        <Skeleton className="h-9 w-[100px] sm:w-28 rounded-sm" />
      </div>
    </section>
  );
}
