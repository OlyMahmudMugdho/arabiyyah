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
  ExternalLink,
} from "lucide-react";
import type { LearningPath } from "@/db/entities";
import { updatePathAction } from "@/actions/path-actions";
import { PathThumbnailUploader } from "@/components/admin/CourseThumbnailUploader";

interface PathEditFormProps {
  path: LearningPath;
}

export function PathEditForm({ path }: PathEditFormProps) {
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState(path.title);
  const [titleArabic, setTitleArabic] = useState(path.titleArabic || "");
  const [slug, setSlug] = useState(path.slug);
  const [description, setDescription] = useState(path.description);
  const [level, setLevel] = useState(path.level || "Beginner");
  const [estimatedHours, setEstimatedHours] = useState(path.estimatedHours || "40 hours");
  const [icon, setIcon] = useState(path.icon || "Compass");
  const [color, setColor] = useState(path.color || "emerald");
  const [thumbnailUrl, setThumbnailUrl] = useState(path.thumbnailUrl || "");
  const [isPublished, setIsPublished] = useState(path.isPublished);

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await updatePathAction(path.id, {
        title,
        titleArabic: titleArabic || null,
        slug,
        description,
        level,
        estimatedHours,
        icon,
        color,
        thumbnailUrl: thumbnailUrl || null,
        isPublished,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else if (res.path) {
        setSuccess("Learning Path updated successfully!");
        setLoading(false);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update learning path.");
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
              <span>Edit Learning Path</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Update roadmap metadata, thumbnail banner, duration, and target proficiency level.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/admin/paths/${path.id}`}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Build Stages & Courses</span>
            </Link>
            <Link
              href={`/paths/${path.slug}`}
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
            >
              <span>View Public Page</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Success alert */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

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
              placeholder="e.g., Classical Arabic Foundations"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              placeholder="مسار أسس لغة القرآن"
              value={titleArabic}
              onChange={(e) => setTitleArabic(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Slug, Level, Estimated Hours */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              URL Slug <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="classical-arabic-foundations"
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

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Estimated Duration <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., 60 hours (6 months)"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Thumbnail Uploader */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Path Thumbnail Image (Upload File or URL)
          </label>
          <PathThumbnailUploader
            value={thumbnailUrl}
            onChange={setThumbnailUrl}
            onUploadStateChange={setUploadingImage}
            disabled={loading}
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={3}
            placeholder="A sequential roadmap designed to take you from foundational grammar to reading classical texts..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-y"
          />
        </div>

        {/* Icon & Color Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Icon Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Icon Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {iconOptions.map((opt) => {
                const IconComp = opt.icon;
                const isSelected = icon === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setIcon(opt.value)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-500"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/50"
                    }`}
                  >
                    <IconComp className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span className="truncate">{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Accent Color
            </label>
            <div className="grid grid-cols-2 gap-2">
              {colorOptions.map((c) => {
                const isSelected = color === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => setColor(c.value)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-500"
                        : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-900/50"
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${c.bgClass} shrink-0`} />
                    <span className="truncate">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Publishing status */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <input
            type="checkbox"
            id="isPublished"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700"
          />
          <div>
            <label
              htmlFor="isPublished"
              className="text-xs font-bold text-slate-900 dark:text-white block cursor-pointer"
            >
              Published
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              When checked, this learning path roadmap is publicly discoverable.
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
            disabled={loading || uploadingImage}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-xs transition-colors shadow-md shadow-emerald-950/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : uploadingImage ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading Image...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
