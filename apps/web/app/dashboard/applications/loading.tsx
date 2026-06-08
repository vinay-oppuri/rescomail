import { Skeleton } from "@repo/ui";

export default function ApplicationsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8 p-6">
      {/* Header Skeleton */}
      <div className="flex flex-col gap-4 border-b border-border/50 pb-6 md:flex-row md:items-end md:justify-between md:gap-12 animate-pulse">
        <div className="max-w-3xl space-y-2 w-full">
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-28 rounded-sm" />
          </div>
          <Skeleton className="h-8 w-2/3 md:w-[250px] rounded-sm" />
          <Skeleton className="h-4 w-full md:w-[480px] rounded-sm" />
        </div>

        {/* Tab Selector Skeleton */}
        <div className="h-9 w-48 bg-muted/20 border border-border/60 p-1 rounded-sm shrink-0 flex items-center justify-between gap-1">
          <div className="h-full w-1/2 bg-muted rounded-sm" />
          <div className="h-full w-1/2 bg-transparent rounded-sm" />
        </div>
      </div>

      {/* Board Title & Button Skeleton */}
      <div className="flex items-center justify-between animate-pulse">
        <div className="space-y-1 w-full max-w-xs">
          <Skeleton className="h-6 w-32 rounded-sm" />
          <Skeleton className="h-4 w-48 rounded-sm" />
        </div>
        <Skeleton className="h-8 w-32 rounded-sm" />
      </div>

      {/* Kanban Board Carousel Skeletons (3 Columns on Desktop) */}
      <div className="flex flex-row overflow-hidden gap-4 items-stretch w-full">
        {Array.from({ length: 3 }).map((_, idx) => (
          <div
            key={idx}
            className="flex flex-col gap-3 min-w-[82vw] md:min-w-[calc((100%-32px)/3)] md:w-[calc((100%-32px)/3)] shrink-0 bg-muted/20 border border-border/40 p-3.5 rounded-sm min-h-[420px] animate-pulse"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between border-b border-border/50 pb-2 mb-2">
              <Skeleton className="h-4 w-20 rounded-sm" />
              <Skeleton className="h-5 w-6 rounded-sm" />
            </div>

            {/* Column Cards List */}
            <div className="space-y-3 flex-1">
              {Array.from({ length: 2 }).map((_, cIdx) => (
                <div key={cIdx} className="border border-border/40 bg-card/60 p-3.5 rounded-sm space-y-3">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-3/4 rounded-sm" />
                    <Skeleton className="h-3 w-1/2 rounded-sm" />
                  </div>
                  <div className="pt-2.5 border-t border-border/30 flex justify-between items-center">
                    <Skeleton className="h-3 w-4 rounded-sm" />
                    <Skeleton className="h-3.5 w-16 rounded-sm" />
                    <Skeleton className="h-3 w-4 rounded-sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
