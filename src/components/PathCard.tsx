import Link from "next/link";
import {
  Compass,
  BookOpen,
  GraduationCap,
  Clock,
  Layers,
  Award,
} from "lucide-react";
import type { LearningPath } from "@/db/entities";

interface PathCardProps {
  path: LearningPath;
}

export function PathCard({ path }: PathCardProps) {
  const iconMap: Record<string, typeof Compass> = {
    Compass: Compass,
    BookOpen: BookOpen,
    GraduationCap: GraduationCap,
    Award: Award,
  };

  const Icon = iconMap[path.icon] || Compass;

  const totalCourses =
    path.sections?.reduce(
      (sum, s) => sum + (s.pathCourses?.length || 0),
      0
    ) || 0;

  const totalSections = path.sections?.length || 0;

  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-600/40 dark:bg-[#0c1220] dark:border-slate-800 dark:hover:border-emerald-500/40 flex flex-col justify-between transition-colors overflow-hidden">
      {/* Thumbnail Header if present */}
      {path.thumbnailUrl && (
        <div className="relative h-44 w-full overflow-hidden bg-slate-900 border-b border-slate-100 dark:border-slate-800/80 shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={path.thumbnailUrl}
            alt={path.title}
            className="w-full h-full object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-slate-900/80 backdrop-blur-xs text-slate-200 border border-slate-700/60 shadow-2xs">
              {path.level}
            </span>
            <span className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-slate-900/80 backdrop-blur-xs text-slate-200 border border-slate-700/60 flex items-center gap-1.5 shadow-2xs">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>{path.estimatedHours}</span>
            </span>
          </div>
          {path.titleArabic && (
            <div className="absolute bottom-2 right-3 font-arabic text-right text-xs font-bold text-emerald-300 drop-shadow-sm" dir="rtl">
              {path.titleArabic}
            </div>
          )}
        </div>
      )}

      <div className="p-6 md:p-8 flex-1 flex flex-col justify-between">
        <div>
          {/* Top Header when no thumbnail */}
          {!path.thumbnailUrl && (
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800/40 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {path.level}
                </span>
                <span className="px-2.5 py-0.5 rounded-md text-xs font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{path.estimatedHours}</span>
                </span>
              </div>
            </div>
          )}

          {/* Titles */}
          <div className="space-y-1 mb-3">
            <div className="flex items-center gap-2.5">
              {path.thumbnailUrl && (
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200/80 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800/40 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
              )}
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                {path.title}
              </h3>
            </div>
            {path.titleArabic && (
              <p
                className={`font-arabic text-sm text-emerald-800 dark:text-emerald-400 font-medium ${
                  path.thumbnailUrl ? "pl-10.5" : ""
                }`}
              >
                {path.titleArabic}
              </p>
            )}
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
            {path.description}
          </p>

        {/* Multi-Section Pipeline Visualization */}
        {path.sections && path.sections.length > 0 && (
          <div className="space-y-3 mb-6 bg-slate-50/80 border border-slate-200/80 dark:bg-slate-900/40 p-4 rounded-xl dark:border-slate-800/60">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Roadmap Stages ({totalSections})</span>
              </span>
              <span>{totalCourses} Courses</span>
            </div>

            <div className="space-y-2">
              {path.sections.slice(0, 3).map((section, idx) => (
                <div
                  key={section.id}
                  className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300"
                >
                  <span className="w-5 h-5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold flex items-center justify-center text-[11px] shrink-0">
                    {idx + 1}
                  </span>
                  <span className="truncate font-medium">{section.title}</span>
                  <span className="ml-auto text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
                    {section.pathCourses?.length || 0} lessons
                  </span>
                </div>
              ))}
              {path.sections.length > 3 && (
                <div className="text-xs text-slate-500 text-center pt-1">
                  + {path.sections.length - 3} additional milestone stage(s)
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Direct Action Link */}
      <div className="pt-2">
        <Link
          href={`/paths/${path.slug}`}
          className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors shadow-2xs"
        >
          <span>Explore Roadmap</span>
        </Link>
      </div>
    </div>
  </div>
);
}
