import { Skeleton } from "@repo/ui";
export default function SettingsLoading() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 md:gap-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 border-b border-border/50 pb-6">
        <div className="space-y-2 max-w-3xl w-full">
          <Skeleton className="h-8 w-[50%] sm:w-48 max-w-full rounded-sm" />
          <Skeleton className="h-4 w-[90%] sm:w-64 max-w-full rounded-sm" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6 w-full">
        {/* Account Details Skeleton */}
        <section className="flex flex-col border border-foreground/5 bg-card/20 shadow-sm overflow-hidden w-full rounded-sm">
          <div className="flex items-start justify-between gap-3 border-b border-foreground/5 bg-muted/10 px-3 md:px-5 py-3 md:py-4">
            <div className="space-y-2 w-full max-w-sm">
              <Skeleton className="h-5 w-[60%] sm:w-32 max-w-full rounded-sm" />
              <Skeleton className="h-4 w-full rounded-sm" />
            </div>
          </div>
          <div className="flex flex-col gap-6 p-3 sm:p-6">
            <div className="flex items-center gap-5">
              <Skeleton className="h-20 w-20 shrink-0 rounded-full" />
              <div className="space-y-2 w-full">
                <Skeleton className="h-5 w-[70%] sm:w-32 max-w-full rounded-sm" />
                <Skeleton className="h-4 w-[90%] sm:w-40 max-w-full rounded-sm" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-16 rounded-sm" />
                  <Skeleton className="h-4 w-24 rounded-sm" />
                </div>
              </div>
            </div>
            <Skeleton className="h-px w-full" />
            <div className="grid gap-5 sm:grid-cols-2">
               <div className="space-y-2"><Skeleton className="h-4 w-20"/><Skeleton className="h-9 w-full rounded-sm"/></div>
               <div className="space-y-2"><Skeleton className="h-4 w-20"/><Skeleton className="h-9 w-full rounded-sm"/></div>
               <div className="space-y-2"><Skeleton className="h-4 w-20"/><Skeleton className="h-9 w-full rounded-sm"/></div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 border-t border-foreground/5 bg-muted/10 px-3 md:px-5 py-3 md:py-4">
             <Skeleton className="h-9 w-[100px] sm:w-28 rounded-sm" />
          </div>
        </section>
      </div>
      
      {/* Profile Defaults Skeleton */}
      <Skeleton className="h-64 w-full rounded-sm" />
      
      {/* Danger Actions Skeleton */}
      <Skeleton className="h-32 w-full rounded-sm" />
    </div>
  );
}
