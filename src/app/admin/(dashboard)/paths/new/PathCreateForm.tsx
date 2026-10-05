"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Compass,
  ArrowLeft,
  Loader2,
  Check,
  AlertCircle,
  Layers,
  BookOpen,
  GraduationCap,
  Map,
  Award,
  Star,
  Flame,
  Lightbulb,
} from "lucide-react";
import { createPathAction } from "@/actions/path-actions";

export function PathCreateForm() {
  const router = useRouter();

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

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const iconOptions = [
    { value: "Compass", label: "Compass", icon: Compass },
    { value: "Layers", label: "Layers", icon: Layers },
    { value: "BookOpen", label: "Book", icon: BookOpen },
    { value: "GraduationCap", label: "Graduation Cap", icon: GraduationCap },
    { value: "Map", label: "Map / Track", icon: Map },
    { value: "Award", label: "Award / Mastery", icon: Award },
    { value: "Star", label: "Star", icon: Star },
    { value: "Flame", label: "Flame / Intensive", icon: Flame },
    { value: "Lightbulb", label: "Lightbulb", icon: Lightbulb },
  ];

  const colorOptions = [
    { value: "emerald", label: "Emerald Green", bgClass: "bg-emerald-500" },
    { value: "blue", label: "Sky Blue", bgClass: "bg-blue-500" },
    { value: "amber", label: "Warm Amber", bgClass: "bg-amber-500" },
    { value: "purple", label: "Royal Purple", bgClass: "bg-purple-500" },
    { value: "rose", label: "Rose Crimson", bgClass: "bg-rose-500" },
    { value: "indigo", label: "Deep Indigo", bgClass: "bg-indigo-500" },
    { value: "cyan", label: "Cyan Aqua", bgClass: "bg-cyan-500" },
    { value: "teal", label: "Teal Turquoise", bgClass: "bg-teal-500" },
  ];

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(
      val
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
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
        router.push("/admin/paths");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create learning path.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header & Back link */}
      <div>
        <Link
          href="/admin/paths"
          prefetch={true}
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Learning Paths</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Compass className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <span>Create New Learning Path</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Combine multiple courses divided into sequential stages with custom milestone advice.
            </p>
          </div>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        className="p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0d1322] border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs transition-colors"
      >
        {/* Title and Title Arabic */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Path Title (English) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Foundations of Classical Arabic"
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Arabic Title (Optional)
            </label>
            <input
              type="text"
              dir="rtl"
              placeholder="مسار أسس اللغة العربية الفصحى"
              value={titleArabic}
              onChange={(e) => setTitleArabic(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Slug and Level */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              URL Slug <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="foundations-of-classical-arabic"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Proficiency Level <span className="text-rose-500">*</span>
            </label>
            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="All Levels">All Levels</option>
            </select>
          </div>
        </div>

        {/* Estimated Hours & Accent Color */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Estimated Completion Time
            </label>
            <input
              type="text"
              placeholder="e.g., 40 hours (3 months recommended)"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Theme Color Accent
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {colorOptions.map((c) => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    color === c.value
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${c.bgClass}`} />
                  <span>{c.label.split(" ")[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Icon Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Path Icon Symbol
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 pt-1">
            {iconOptions.map((item) => {
              const IconComp = item.icon;
              const isSelected = icon === item.value;
              return (
                <button
                  type="button"
                  key={item.value}
                  onClick={() => setIcon(item.value)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-xs"
                      : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"
                  }`}
                >
                  <IconComp className="w-5 h-5 mb-1" />
                  <span className="text-[10px] font-medium leading-none">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            placeholder="Describe the milestone objectives, who should follow this track, and prerequisites..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-y"
          />
        </div>

        {/* Publishing status */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <input
            type="checkbox"
            id="pathIsPublished"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700"
          />
          <div>
            <label
              htmlFor="pathIsPublished"
              className="text-xs font-bold text-slate-900 dark:text-white block cursor-pointer"
            >
              Publish Immediately
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              When checked, this track will appear in the public Paths catalog for students.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
          <Link
            href="/admin/paths"
            prefetch={true}
            className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-950/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Path...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Learning Path</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
