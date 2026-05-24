import { Skeleton } from "@/components/ui/skeleton";

export function RouteSkeleton() {
  return (
    <div className="min-h-[60vh] mx-auto max-w-7xl px-6 py-12 space-y-8 animate-pulse">
      <div className="space-y-3">
        <Skeleton className="h-10 w-2/3 max-w-md" />
        <Skeleton className="h-4 w-1/2 max-w-sm" />
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="aspect-[4/3] w-full rounded-2xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}