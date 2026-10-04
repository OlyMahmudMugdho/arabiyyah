import Link from "next/link";
import {
  GraduationCap,
  Compass,
  BookOpen,
  FileText,
  Users,
  Plus,
  ArrowRight,
  Sparkles,
  Layers,
} from "lucide-react";
import {
  getCourseRepository,
  getPathRepository,
  getBookRepository,
  getNoteRepository,
  getUserRepository,
} from "@/db/data-source";
import { UserRole } from "@/db/entities";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getSession();

  const [
    courseRepo,
    pathRepo,
    bookRepo,
    noteRepo,
    userRepo,
  ] = await Promise.all([
    getCourseRepository(),
    getPathRepository(),
    getBookRepository(),
    getNoteRepository(),
    getUserRepository(),
  ]);

  const [
    coursesCount,
    pathsCount,
    booksCount,
    notesCount,
    usersCount,
    recentCourses,
    recentPaths,
  ] = await Promise.all([
    courseRepo.count(),
    pathRepo.count(),
    bookRepo.count(),
    noteRepo.count(),
    userRepo.count(),
    courseRepo.find({ order: { createdAt: "DESC" }, take: 5 }),
    pathRepo.find({
      order: { createdAt: "DESC" },
      relations: { sections: true },
      take: 4,
    }),
  ]);

  const isSuperadmin = session?.role === UserRole.SUPERADMIN;

  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 p-6 md:p-8 rounded-3xl border border-slate-800">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-arabic text-emerald-400 font-bold text-lg">
              أهلاً وسهلاً
            </span>
            <span className="text-xs text-slate-400 font-medium">
              • Welcome back
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            {session?.name || "Administrator"}
          </h1>
          <p className="text-sm text-slate-400">
            You have {session?.role === UserRole.SUPERADMIN ? "full superadmin authorization" : "administrative access"} to manage curricula, courses, paths, books, and study guides.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/courses"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-950/40"
          >
            <Plus className="w-4 h-4" />
            <span>Add Course</span>
          </Link>
          <Link
            href="/admin/paths"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors border border-slate-700"
          >
            <Compass className="w-4 h-4 text-emerald-400" />
            <span>Add Path</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {/* Courses */}
        <div className="p-5 rounded-2xl bg-[#0d1322] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">
              Courses
            </span>
            <GraduationCap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {coursesCount}
          </div>
          <Link
            href="/admin/courses"
            className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
          >
            <span>Manage Courses</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Paths */}
        <div className="p-5 rounded-2xl bg-[#0d1322] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">
              Paths
            </span>
            <Compass className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {pathsCount}
          </div>
          <Link
            href="/admin/paths"
            className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
          >
            <span>Manage Paths</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Books */}
        <div className="p-5 rounded-2xl bg-[#0d1322] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">
              Books
            </span>
            <BookOpen className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {booksCount}
          </div>
          <Link
            href="/admin/books"
            className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
          >
            <span>Manage Books</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Notes */}
        <div className="p-5 rounded-2xl bg-[#0d1322] border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase">
              Notes
            </span>
            <FileText className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-bold text-white">
            {notesCount}
          </div>
          <Link
            href="/admin/notes"
            className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
          >
            <span>Manage Notes</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* Admin Users */}
        {isSuperadmin ? (
          <div className="p-5 rounded-2xl bg-[#0d1322] border border-amber-500/30 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400 uppercase">
                Admins
              </span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-white">
              {usersCount}
            </div>
            <Link
              href="/admin/users"
              className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1 font-medium"
            >
              <span>Permissions & Roles</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        ) : null}
      </div>

      {/* Overview Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Courses */}
        <div className="rounded-3xl bg-[#0d1322] border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Recently Added Courses</span>
            </h2>
            <Link
              href="/admin/courses"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {recentCourses.map((c) => (
              <div
                key={c.id}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">
                    {c.title}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span>{c.instructor}</span>
                    <span>•</span>
                    <span className="text-emerald-400">{c.language}</span>
                    <span>•</span>
                    <span>{c.level}</span>
                  </div>
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    c.isPublished
                      ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {c.isPublished ? "Published" : "Draft"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Paths */}
        <div className="rounded-3xl bg-[#0d1322] border border-slate-800 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>Multi-Stage Learning Paths</span>
            </h2>
            <Link
              href="/admin/paths"
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300"
            >
              View all
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {recentPaths.map((p) => (
              <div
                key={p.id}
                className="py-3 flex items-center justify-between gap-4"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white truncate">
                    {p.title}
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="text-amber-400">{p.level}</span>
                    <span>•</span>
                    <span>{p.estimatedHours}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-cyan-400">
                      <Layers className="w-3 h-3" />
                      {p.sections?.length || 0} stages
                    </span>
                  </div>
                </div>
                <Link
                  href={`/admin/paths/${p.id}`}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium shrink-0 transition-colors"
                >
                  Build Stages
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
