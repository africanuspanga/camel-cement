import { Skeleton } from "@/components/ui/skeleton";

/** Shared loading state for all dashboard module pages. */
export default function DashboardLoading() {
  return (
    <div className="space-y-6" aria-busy aria-label="Loading">
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded-lg bg-concrete-200" />
        <Skeleton className="h-4 w-80 max-w-full rounded-md bg-concrete-200" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32 rounded-2xl bg-concrete-200" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-2xl bg-concrete-200" />
    </div>
  );
}
