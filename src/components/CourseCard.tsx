import Link from "next/link";
import { Clock, Globe, User, BookOpen, ExternalLink } from "lucide-react";
import type { Course } from "@/db/entities";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  const levelColors: Record<string, string> = {
    Beginner:
      "bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30",
    Intermediate:
      "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
    Advanced:
      "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-500/15 dark:text-rose-300 dark:border-rose-500/30",
    "All Levels":
      "bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
  };

  const badgeClass =
    levelColors[course.level] ||
    "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-700/50 dark:text-slate-300 dark:border-slate-600";

  return (
    <div className="group rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-emerald-500/50 hover:shadow-xl dark:bg-[#0f172a]/70 dark:border-slate-800 dark:hover:border-emerald-500/50 dark:hover:shadow-emerald-950/20 transition-all duration-300 flex flex-col overflow-hidden">
      {/* Thumbnail or Gradient Header */}
      <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-95"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-arabesque">
            <BookOpen className="w-12 h-12 text-emerald-400/40" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

        {/* Badges on top */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span
            className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border backdrop-blur-md shadow-xs ${badgeClass}`}
          >
            {course.level}
          </span>
          <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-slate-900/80 backdrop-blur-md text-slate-200 border border-slate-700/60 flex items-center gap-1.5 shadow-xs">
            <Globe className="w-3 h-3 text-emerald-400" />
            {course.language}
          </span>
        </div>

        {/* Arabic Title Accent */}
        {course.titleArabic && (
          <div className="absolute bottom-2 right-3 font-arabic text-right text-xs font-bold text-emerald-300 drop-shadow">
            {course.titleArabic}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-semibold uppercase tracking-wider">
            <span>{course.category}</span>
          </div>

          <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-300 transition-colors line-clamp-2">
            {course.title}
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5 truncate max-w-[180px]">
              <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
              <span className="truncate">{course.instructor}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>{course.duration}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Link
              href={`/courses/${course.slug}`}
              className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-emerald-600 text-slate-800 hover:text-white dark:bg-slate-800/80 dark:hover:bg-emerald-600/90 dark:text-white text-xs font-semibold text-center transition-colors flex items-center justify-center gap-1.5 shadow-xs"
            >
              <span>View Course</span>
            </Link>

            {course.resourceUrl && (
              <a
                href={course.resourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-slate-800/80 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors border border-slate-200 dark:border-slate-700/60"
                title="Open Source Link"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
