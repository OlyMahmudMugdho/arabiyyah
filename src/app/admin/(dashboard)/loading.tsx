import { Skeleton } from "@/components/Skeletons";

export default function AdminOverviewLoading() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Welcome Hero Skeleton */}
      <div className="h-36 rounded-3xl bg-slate-200/80 dark:bg-slate-800/80" />

      {/* Metrics Row Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80" />
        ))}
      </div>

      {/* Telemetry Banner Skeleton */}
      <div className="h-28 rounded-3xl bg-slate-200/80 dark:bg-slate-800/80" />

      {/* Tables Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-72 rounded-3xl bg-slate-200/80 dark:bg-slate-800/80" />
        <div className="h-72 rounded-3xl bg-slate-200/80 dark:bg-slate-800/80" />
      </div>
    </div>
  );
}
