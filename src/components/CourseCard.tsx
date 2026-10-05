import Link from "next/link";
import { Clock, Globe, User, BookOpen } from "lucide-react";
import type { Course } from "@/db/entities";

interface CourseCardProps {
  course: Course;
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 shadow-2xs hover:border-emerald-600/40 dark:bg-[#0c1220] dark:border-slate-800 dark:hover:border-emerald-500/40 transition-colors flex flex-col overflow-hidden">
      {/* Thumbnail or Architectural Header */}
      <div className="relative h-44 w-full overflow-hidden bg-slate-900">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover opacity-90"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-arabesque text-slate-500">
            <BookOpen className="w-10 h-10 text-emerald-600/40 mb-1" />
            <span className="font-arabic text-xs font-bold text-slate-400">درس عربي</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

        {/* Level and Language indicators */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <span className="px-2.5 py-0.5 text-xs font-semibold rounded-md bg-slate-900/80 backdrop-blur-xs text-slate-200 border border-slate-700/60 shadow-2xs">
            {course.level}
          </span>
          <span className="px-2.5 py-0.5 text-xs font-medium rounded-md bg-slate-900/80 backdrop-blur-xs text-slate-200 border border-slate-700/60 flex items-center gap-1.5 shadow-2xs">
            <Globe className="w-3 h-3 text-emerald-400" />
            <span>{course.language}</span>
          </span>
        </div>

        {/* Arabic Title Overlay */}
        {course.titleArabic && (
          <div className="absolute bottom-2 right-3 font-arabic text-right text-xs font-bold text-emerald-300 drop-shadow-sm" dir="rtl">
            {course.titleArabic}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-1.5">
          <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
            {course.category}
          </div>

          <h3 className="font-bold text-base md:text-lg text-slate-900 dark:text-white line-clamp-2">
            {course.title}
          </h3>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {course.description}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 truncate max-w-[180px]">
              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{course.instructor}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{course.duration}</span>
            </div>
          </div>

          <div className="pt-1">
            <Link
              href={`/courses/${course.slug}`}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 hover:bg-emerald-700 text-slate-800 hover:text-white dark:bg-slate-800 dark:hover:bg-emerald-600 dark:text-slate-200 dark:hover:text-white text-xs font-semibold text-center transition-colors flex items-center justify-center shadow-2xs"
            >
              <span>View Course</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
