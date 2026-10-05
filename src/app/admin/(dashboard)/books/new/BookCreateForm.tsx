"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ArrowLeft,
  Loader2,
  Check,
  AlertCircle,
  FileUp,
  Image as ImageIcon,
} from "lucide-react";
import { createBookAction } from "@/actions/book-actions";
import { createCategoryAction } from "@/actions/category-actions";

interface BookCreateFormProps {
  initialCategories: string[];
}

export function BookCreateForm({ initialCategories }: BookCreateFormProps) {
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("");
  const [titleArabic, setTitleArabic] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("Grammar");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [level, setLevel] = useState("Beginner");
  const [language, setLanguage] = useState("Arabic");
  const [pages, setPages] = useState<number>(100);
  const [fileUrl, setFileUrl] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const existingCategories = useMemo(() => {
    const defaultCats = [
      "Grammar",
      "Morphology",
      "Dictionaries",
      "Literature",
      "Vocabulary",
      "Tajweed & Phonetics",
      "Quranic Arabic",
      "Balagha (Rhetoric)",
      "Reading & Literature",
    ];
    const set = new Set([...defaultCats, ...initialCategories]);
    return Array.from(set).sort();
  }, [initialCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const finalCategory = category.trim();
    if (!finalCategory) {
      setError("Category is required.");
      setLoading(false);
      return;
    }

    try {
      const res = await createBookAction({
        title,
        titleArabic: titleArabic || undefined,
        author,
        category: finalCategory,
        level,
        language,
        pages,
        fileUrl: fileUrl || undefined,
        coverUrl: coverUrl || undefined,
        description,
        isPublished,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else if (res.book) {
        if (!existingCategories.includes(finalCategory)) {
          createCategoryAction({ name: finalCategory, itemType: "book" }).catch(() => {});
        }
        router.push("/admin/books");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create book.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header & Back link */}
      <div>
        <Link
          href="/admin/books"
          prefetch={true}
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Books</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-teal-600 dark:text-cyan-400" />
              <span>Add New Book or Primer</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Upload classical mutun, commentaries, bilingual readers, and lexicons to the library.
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
              Book Title (English / Transliterated) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Al-Ajrumiyyah: Text & Translation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Arabic Title (Original)
            </label>
            <input
              type="text"
              dir="rtl"
              placeholder="متن الآجرومية في علم العربية"
              value={titleArabic}
              onChange={(e) => setTitleArabic(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Author & Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Author / Scholar <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Ibn Ajurrum (d. 723 AH)"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Discipline / Category <span className="text-rose-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomCategory(!isCustomCategory);
                  if (isCustomCategory) {
                    setCategory(existingCategories[0] || "Grammar");
                  } else {
                    setCategory("");
                  }
                }}
                className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
              >
                {isCustomCategory ? "← Select existing" : "+ Custom category"}
              </button>
            </div>

            {isCustomCategory ? (
              <input
                type="text"
                required
                placeholder="Enter custom category name..."
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            ) : (
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
              >
                {existingCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Level, Language, Pages */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
              Book Language <span className="text-rose-500">*</span>
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="Arabic">Arabic Only (Original)</option>
              <option value="Bilingual">Bilingual (Arabic / English)</option>
              <option value="English">English</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Page Count
            </label>
            <input
              type="number"
              min={1}
              value={pages}
              onChange={(e) => setPages(parseInt(e.target.value) || 0)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* File URL and Cover Image URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              PDF Document Download / Read URL
            </label>
            <input
              type="url"
              placeholder="https://archive.org/download/... or cloud URL"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Cover Image URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={coverUrl}
              onChange={(e) => setCoverUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Description & Scholarly Background <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            placeholder="Historical context of the text, significance in classical pedagogy, and recommended commentary..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-y"
          />
        </div>

        {/* Publishing status */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <input
            type="checkbox"
            id="bookIsPublished"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700"
          />
          <div>
            <label
              htmlFor="bookIsPublished"
              className="text-xs font-bold text-slate-900 dark:text-white block cursor-pointer"
            >
              Publish Immediately
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              When checked, this book will be accessible in the public library archive.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
          <Link
            href="/admin/books"
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
                <span>Creating Book...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save & Publish Book</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
