import Link from "next/link";
import {
  Compass,
  BookOpen,
  GraduationCap,
  Clock,
  Layers,
  ChevronRight,
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
    <div className="relative group rounded-3xl bg-white border border-slate-200 shadow-sm hover:border-emerald-500/50 hover:shadow-xl dark:bg-gradient-to-b dark:from-[#11192d] dark:to-[#0c1220] dark:border-slate-800 dark:hover:border-emerald-500/50 dark:hover:shadow-emerald-950/20 p-6 md:p-8 flex flex-col justify-between transition-all duration-300">
      {/* Top Banner & Icon */}
      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 flex items-center justify-center group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
            <Icon className="w-6 h-6" />
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20">
              {path.level}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700/50 flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              {path.estimatedHours}
            </span>
          </div>
        </div>

        {/* Path Titles */}
        <div className="space-y-1 mb-3">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-300 transition-colors">
              {path.title}
            </h3>
          </div>
          {path.titleArabic && (
            <p className="font-arabic text-sm text-emerald-700 dark:text-emerald-400/90 font-medium">
              {path.titleArabic}
            </p>
          )}
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
          {path.description}
        </p>

        {/* Multi-Section Pipeline Visualization */}
        {path.sections && path.sections.length > 0 && (
          <div className="space-y-3 mb-6 bg-slate-50 border border-slate-200 dark:bg-slate-900/60 p-4 rounded-2xl dark:border-slate-800/60">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Roadmap Stages ({totalSections})</span>
              </span>
              <span>{totalCourses} Courses Included</span>
            </div>

            <div className="space-y-2">
              {path.sections.slice(0, 3).map((section, idx) => (
                <div
                  key={section.id}
                  className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 font-bold flex items-center justify-center text-[10px] shrink-0 dark:border-emerald-500/30">
                    {idx + 1}
                  </div>
                  <span className="truncate font-medium">{section.title}</span>
                  <span className="ml-auto text-[11px] text-slate-400 dark:text-slate-500 shrink-0">
                    {section.pathCourses?.length || 0} courses
                  </span>
                </div>
              ))}
              {path.sections.length > 3 && (
                <div className="text-xs text-slate-500 dark:text-slate-500 text-center pt-1 font-medium">
                  + {path.sections.length - 3} more stage(s) in roadmap
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div className="pt-2">
        <Link
          href={`/paths/${path.slug}`}
          className="w-full py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20 transition-all"
        >
          <span>View Complete Path Roadmap</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
