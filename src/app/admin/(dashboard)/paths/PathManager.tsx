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
  X,
} from "lucide-react";
import type { LearningPath } from "@/db/entities";
import {
  createPathAction,
  updatePathAction,
  deletePathAction,
} from "@/actions/path-actions";

interface PathManagerProps {
  initialPaths: LearningPath[];
}

export function PathManager({ initialPaths }: PathManagerProps) {
  const [paths, setPaths] = useState<LearningPath[]>(initialPaths);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPath, setEditingPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [titleArabic, setTitleArabic] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [estimatedHours, setEstimatedHours] = useState("40 hours");
  const [icon, setIcon] = useState("Compass");
  const [color, setColor] = useState("emerald");
  const [isPublished, setIsPublished] = useState(true);

  const openCreateModal = () => {
    setEditingPath(null);
    setTitle("");
    setTitleArabic("");
    setSlug("");
    setDescription("");
    setLevel("Beginner");
    setEstimatedHours("40 hours");
    setIcon("Compass");
    setColor("emerald");
    setIsPublished(true);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (p: LearningPath) => {
    setEditingPath(p);
    setTitle(p.title);
    setTitleArabic(p.titleArabic || "");
    setSlug(p.slug);
    setDescription(p.description);
    setLevel(p.level);
    setEstimatedHours(p.estimatedHours);
    setIcon(p.icon);
    setColor(p.color);
    setIsPublished(p.isPublished);
    setError(null);
    setModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingPath) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^\w\s-]/g, "")
          .replace(/\s+/g, "-")
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (editingPath) {
      const res = await updatePathAction(editingPath.id, {
        title,
        titleArabic: titleArabic || null,
        description,
        level,
        estimatedHours,
        icon,
        color,
        isPublished,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else if (res.path) {
        setPaths(
          paths.map((p) =>
            p.id === editingPath.id ? { ...p, ...(res.path as LearningPath) } : p
          )
        );
        setModalOpen(false);
        setLoading(false);
      }
    } else {
      const res = await createPathAction({
        title,
        titleArabic: titleArabic || undefined,
        slug,
        description,
        level,
        estimatedHours,
        icon,
        color,
        isPublished,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else if (res.path) {
        setPaths([res.path as LearningPath, ...paths]);
        setModalOpen(false);
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete path "${name}"?`)) return;
    const res = await deletePathAction(id);
    if (res.error) {
      alert(res.error);
    } else {
      setPaths(paths.filter((p) => p.id !== id));
    }
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

      {/* Grid of paths */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filtered.map((p) => {
          const totalSections = p.sections?.length || 0;
          const totalCourses =
            p.sections?.reduce(
              (sum, s) => sum + (s.pathCourses?.length || 0),
              0
            ) || 0;

          return (
            <div
              key={p.id}
              className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-emerald-500/50 hover:shadow-md dark:bg-[#0d1322] dark:border-slate-800 dark:hover:border-emerald-500/40 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20">
                    {p.level}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>{p.estimatedHours}</span>
                  </div>
                </div>

                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{p.title}</h3>
                {p.titleArabic && (
                  <p className="font-arabic text-sm text-emerald-700 dark:text-emerald-400 font-semibold">
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
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Build Stages & Courses</span>
                  <ArrowRight className="w-3 h-3 ml-0.5" />
                </Link>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEditModal(p)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors border border-slate-200 dark:border-transparent"
                    title="Edit Path Details"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(p.id, p.title)}
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 shadow-2xl dark:bg-[#0f172a] dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-6 transition-colors">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingPath ? "Edit Learning Path" : "Create Learning Path"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:text-white dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Path Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Quranic Arabic Fluency Track"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Arabic Title
                </label>
                <input
                  type="text"
                  value={titleArabic}
                  onChange={(e) => setTitleArabic(e.target.value)}
                  placeholder="مسار إتقان العربية"
                  dir="rtl"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs font-arabic focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingPath}
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Target Level *
                  </label>
                  <select
                    value={level}
                    onChange={(e) => setLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Estimated Duration *
                  </label>
                  <input
                    type="text"
                    required
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(e.target.value)}
                    placeholder="e.g. 95 Hours"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Icon Theme
                  </label>
                  <select
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="Compass">Compass (Navigation)</option>
                    <option value="BookOpen">BookOpen (Knowledge)</option>
                    <option value="GraduationCap">GraduationCap (Scholar)</option>
                    <option value="Award">Award (Mastery)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold disabled:opacity-50 shadow-md shadow-emerald-950/20"
                >
                  {loading ? "Saving..." : editingPath ? "Update Path" : "Create Path"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
