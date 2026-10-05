"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FolderKanban,
  ArrowLeft,
  Loader2,
  Check,
  AlertCircle,
  GraduationCap,
  BookOpen,
  FileText,
  Sparkles,
} from "lucide-react";
import { createCategoryAction } from "@/actions/category-actions";

export function CategoryCreateForm() {
  const router = useRouter();

  // Form states
  const [name, setName] = useState("");
  const [nameArabic, setNameArabic] = useState("");
  const [slug, setSlug] = useState("");
  const [itemType, setItemType] = useState("all");
  const [color, setColor] = useState("emerald");
  const [description, setDescription] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colorOptions = [
    { value: "emerald", label: "Emerald Green", bgClass: "bg-emerald-500" },
    { value: "blue", label: "Sky Blue", bgClass: "bg-blue-500" },
    { value: "purple", label: "Royal Purple", bgClass: "bg-purple-500" },
    { value: "amber", label: "Warm Amber", bgClass: "bg-amber-500" },
    { value: "rose", label: "Rose Crimson", bgClass: "bg-rose-500" },
    { value: "indigo", label: "Deep Indigo", bgClass: "bg-indigo-500" },
    { value: "cyan", label: "Cyan Aqua", bgClass: "bg-cyan-500" },
    { value: "teal", label: "Teal Turquoise", bgClass: "bg-teal-500" },
  ];

  const handleNameChange = (val: string) => {
    setName(val);
    const generatedSlug = val
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
    setSlug(generatedSlug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await createCategoryAction({
        name,
        nameArabic: nameArabic || undefined,
        slug: slug || undefined,
        itemType,
        color,
        description: description || undefined,
        isFeatured,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else if (res.category) {
        router.push("/admin/categories");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create category.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header & Back link */}
      <div>
        <Link
          href="/admin/categories"
          prefetch={true}
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Categories</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FolderKanban className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              <span>Create New Category</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Establish a new classical Islamic linguistic science or curriculum subject.
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
        {/* Name and Arabic Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Category Name (English) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Nahw (Syntax)"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Arabic Name (Optional)
            </label>
            <input
              type="text"
              dir="rtl"
              placeholder="علم النحو والصرف"
              value={nameArabic}
              onChange={(e) => setNameArabic(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Slug and Scope */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              URL Slug <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="nahw-syntax"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Resource Scope <span className="text-rose-500">*</span>
            </label>
            <select
              value={itemType}
              onChange={(e) => setItemType(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="all">Universal (Courses, Books & Notes)</option>
              <option value="course">Courses Only</option>
              <option value="book">Books Only</option>
              <option value="note">Notes & Cheat Sheets Only</option>
            </select>
          </div>
        </div>

        {/* Theme Color */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Badge & Accent Color
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

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Description
          </label>
          <textarea
            rows={3}
            placeholder="Brief explanation of what curriculum topics fall under this category..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-y"
          />
        </div>

        {/* Featured Toggle */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <input
            type="checkbox"
            id="catIsFeatured"
            checked={isFeatured}
            onChange={(e) => setIsFeatured(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700"
          />
          <div>
            <label
              htmlFor="catIsFeatured"
              className="text-xs font-bold text-slate-900 dark:text-white block cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Feature on Public Homepage</span>
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              When checked, this category appears in the main highlight bar on the catalog home screen.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
          <Link
            href="/admin/categories"
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
                <span>Creating Category...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Category</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
