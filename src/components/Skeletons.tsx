import React from "react";

export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-slate-200/80 dark:bg-slate-800/70 rounded-xl ${className}`}
    />
  );
}

export function PageHeaderSkeleton({ badgeWidth = "w-36" }: { badgeWidth?: string }) {
  return (
    <div className="max-w-3xl mb-10 space-y-3">
      <Skeleton className={`h-6 ${badgeWidth} rounded-full`} />
      <Skeleton className="h-10 w-3/4 rounded-2xl" />
      <Skeleton className="h-4 w-full rounded-lg" />
      <Skeleton className="h-4 w-2/3 rounded-lg" />
    </div>
  );
}

export function FilterBarSkeleton() {
  return (
    <div className="p-4 md:p-6 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-4 mb-8">
      <Skeleton className="h-11 w-full rounded-xl" />
      <div className="flex flex-wrap gap-2 pt-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Skeleton className="h-5 w-20 rounded-md" />
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-6 w-4/5 rounded-lg" />
        <Skeleton className="h-4 w-1/2 rounded-md" />
      </div>
      <Skeleton className="h-14 w-full rounded-lg" />
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <Skeleton className="h-4 w-24 rounded-md" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
    </div>
  );
}

export function PathCardSkeleton() {
  return (
    <div className="rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-6 md:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40 rounded-lg" />
            <Skeleton className="h-4 w-24 rounded-md" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <Skeleton className="h-12 w-full rounded-lg" />
      <div className="grid grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
        <Skeleton className="h-10 rounded-xl" />
      </div>
      <div className="flex items-center justify-between pt-2">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>
    </div>
  );
}

export function BookCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between space-y-4">
      <div className="flex gap-4 items-start">
        <Skeleton className="w-20 h-28 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2.5">
          <div className="flex gap-2">
            <Skeleton className="h-4 w-16 rounded" />
            <Skeleton className="h-4 w-14 rounded" />
          </div>
          <Skeleton className="h-5 w-4/5 rounded-md" />
          <Skeleton className="h-3 w-1/2 rounded" />
          <Skeleton className="h-10 w-full rounded-md" />
        </div>
      </div>
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <Skeleton className="h-4 w-20 rounded" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function NoteCardSkeleton() {
  return (
    <div className="rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-20 rounded" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-6 w-3/4 rounded-lg" />
      </div>
      <Skeleton className="h-12 w-full rounded-md" />
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
        <div className="flex justify-between">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-12 rounded" />
        </div>
        <Skeleton className="h-8 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-6 space-y-4">
      <div className="flex items-center justify-between mb-4">
        <Skeleton className="h-7 w-48 rounded-xl" />
        <Skeleton className="h-9 w-32 rounded-xl" />
      </div>
      <div className="space-y-3">
        <Skeleton className="h-10 w-full rounded-xl bg-slate-100 dark:bg-slate-800/50" />
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 py-2">
            {Array.from({ length: cols }).map((_, j) => (
              <Skeleton key={j} className="h-8 flex-1 rounded-lg" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function DetailHeroSkeleton() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto py-8">
      <div className="p-8 rounded-3xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 space-y-4">
        <Skeleton className="h-6 w-28 rounded-full" />
        <Skeleton className="h-10 w-3/4 rounded-2xl" />
        <Skeleton className="h-6 w-1/3 rounded-lg" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="flex gap-3 pt-4">
          <Skeleton className="h-11 w-36 rounded-xl" />
          <Skeleton className="h-11 w-32 rounded-xl" />
        </div>
      </div>
      <div className="space-y-4">
        <Skeleton className="h-7 w-48 rounded-xl" />
        <div className="space-y-3">
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
          <Skeleton className="h-16 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

export function AnalyticsDashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header Banner */}
      <div className="h-44 rounded-3xl bg-slate-200/80 dark:bg-slate-800/80" />

      {/* 5 KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-28 rounded-2xl bg-slate-200/80 dark:bg-slate-800/80" />
        ))}
      </div>

      {/* Timeline chart skeleton */}
      <div className="h-64 rounded-3xl bg-slate-200/80 dark:bg-slate-800/80" />

      {/* Grid 2 cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="h-80 rounded-3xl bg-slate-200/80 dark:bg-slate-800/80" />
        <div className="h-80 rounded-3xl bg-slate-200/80 dark:bg-slate-800/80" />
      </div>
    </div>
  );
}
