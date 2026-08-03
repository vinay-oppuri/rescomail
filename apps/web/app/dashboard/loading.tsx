import { Skeleton } from "@repo/ui";

export default function DashboardLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl">
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex min-w-0 flex-col gap-4">
          <Skeleton className="h-40 rounded-sm" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-32 rounded-sm" />
            <Skeleton className="h-32 rounded-sm" />
            <Skeleton className="h-32 rounded-sm" />
          </div>
          <Skeleton className="h-96 rounded-sm" />
        </div>
        <Skeleton className="h-[30rem] rounded-sm" />
      </div>
    </div>
  );
}
