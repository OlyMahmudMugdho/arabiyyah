"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Plus,
  Compass,
  Search,
  Trash2,
  Edit,
  Layers,
  Clock,
  ArrowRight,
  BookOpen,
  GraduationCap,
  Map,
  Award,
  Star,
  Flame,
  Lightbulb,
  ExternalLink,
} from "lucide-react";
import type { LearningPath } from "@/db/entities";
import { deletePathAction } from "@/actions/path-actions";
import { DeleteConfirmModal } from "@/components/admin/DeleteConfirmModal";

interface PathManagerProps {
  initialPaths: LearningPath[];
}

export function PathManager({ initialPaths }: PathManagerProps) {
  const [paths, setPaths] = useState<LearningPath[]>(initialPaths);
  const [search, setSearch] = useState("");

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    setDeleteError(null);

    const res = await deletePathAction(deleteTarget.id);
    if (res.error) {
      setDeleteError(res.error);
      setIsDeleting(false);
    } else {
      setPaths((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const iconMap: Record<string, typeof Compass> = {
    Compass: Compass,
    Layers: Layers,
    BookOpen: BookOpen,
    GraduationCap: GraduationCap,
    Map: Map,
    Award: Award,
    Star: Star,
    Flame: Flame,
    Lightbulb: Lightbulb,
  };

  const filtered = paths.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.title.toLowerCase().includes(q) ||
      p.level.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Compass className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <span>Manage Learning Paths</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Combine multiple courses divided into sequential stages with custom milestone advice.
          </p>
        </div>

        <Link
          href="/admin/paths/new"
          prefetch={true}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-950/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Path</span>
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search learning paths..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl bg-white dark:bg-[#0d1322] border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
        />
      </div>

      {/* Grid of paths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((p) => {
          const totalSections = p.sections?.length || 0;
          const totalCourses =
            p.sections?.reduce(
              (sum, s) => sum + (s.pathCourses?.length || 0),
              0
            ) || 0;

          const IconComp = iconMap[p.icon] || Compass;

          return (
            <div
              key={p.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs dark:bg-[#0d1322] dark:border-slate-800 flex flex-col justify-between space-y-4 hover:border-emerald-500/30 transition-colors"
            >
              <div className="space-y-3">
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {p.thumbnailUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={p.thumbnailUrl}
                        alt={p.title}
                        className="w-11 h-11 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0 shadow-2xs"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 dark:bg-emerald-950/40 dark:border-emerald-800/40 dark:text-emerald-400 flex items-center justify-center shrink-0">
                        <IconComp className="w-5 h-5" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white line-clamp-1">
                        {p.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                          {p.level}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">•</span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{p.estimatedHours}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0 ${
                      p.isPublished
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {p.isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                {p.titleArabic && (
                  <p className="font-arabic text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                    {p.titleArabic}
                  </p>
                )}
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {p.description}
                </p>

                {/* Stages count */}
                <div className="pt-2 flex items-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                  <span className="flex items-center gap-1 text-teal-700 dark:text-cyan-400">
                    <Layers className="w-3.5 h-3.5" />
                    <span>{totalSections} Stages</span>
                  </span>
                  <span>•</span>
                  <span>{totalCourses} Courses Linked</span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between gap-2">
                <Link
                  href={`/admin/paths/${p.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-2xs"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Build Stages & Courses</span>
                  <ArrowRight className="w-3 h-3 ml-0.5" />
                </Link>

                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/paths/${p.slug}`}
                    target="_blank"
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors border border-slate-200 dark:border-transparent"
                    title="View Public Roadmap"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/admin/paths/${p.id}/edit`}
                    prefetch={true}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors border border-slate-200 dark:border-transparent"
                    title="Edit Path Details"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError(null);
                      setDeleteTarget({ id: p.id, title: p.title });
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/60 dark:text-slate-300 dark:hover:text-rose-300 transition-colors border border-slate-200 dark:border-transparent"
                    title="Delete Path"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-400 bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 rounded-3xl">
          No learning paths found matching your query.
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Delete Learning Path"
        itemName={deleteTarget?.title}
        loading={isDeleting}
        error={deleteError}
        onClose={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
