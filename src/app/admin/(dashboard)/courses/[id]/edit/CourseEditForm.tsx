"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  ArrowLeft,
  Loader2,
  Check,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import type { Course } from "@/db/entities";
import { updateCourseAction } from "@/actions/course-actions";
import { createCategoryAction } from "@/actions/category-actions";
import { CourseThumbnailUploader } from "@/components/admin/CourseThumbnailUploader";

interface CourseEditFormProps {
  course: Course;
  initialCategories: string[];
}

export function CourseEditForm({
  course,
  initialCategories,
}: CourseEditFormProps) {
  const router = useRouter();

  const defaultCategories = useMemo(() => {
    const defaultCats = [
      "Nahw (Syntax)",
      "Sarf (Morphology)",
      "Balagha (Rhetoric)",
      "Quranic Arabic",
      "Conversational",
      "Reading",
      "Tajweed & Phonetics",
      "Vocabulary & Lexicons",
    ];
    const set = new Set([...defaultCats, ...initialCategories]);
    if (course.category) set.add(course.category);
    return Array.from(set).sort();
  }, [initialCategories, course.category]);

  const [title, setTitle] = useState(course.title);
  const [titleArabic, setTitleArabic] = useState(course.titleArabic || "");
  const [slug, setSlug] = useState(course.slug);
  const [description, setDescription] = useState(course.description);
  const [instructor, setInstructor] = useState(course.instructor);
  const [language, setLanguage] = useState(course.language || "English");
  const [level, setLevel] = useState(course.level || "Beginner");
  const [category, setCategory] = useState(course.category);
  const [isCustomCategory, setIsCustomCategory] = useState(
    !defaultCategories.includes(course.category)
  );
  const [duration, setDuration] = useState(course.duration || "20 hours");
  const [thumbnailUrl, setThumbnailUrl] = useState(course.thumbnailUrl || "");
  const [resourceUrl, setResourceUrl] = useState(course.resourceUrl || "");

  const initialSyllabus = useMemo(() => {
    if (!course.syllabus) return "";
    try {
      const arr = JSON.parse(course.syllabus);
      return Array.isArray(arr) ? arr.join("\n") : course.syllabus;
    } catch {
      return course.syllabus;
    }
  }, [course.syllabus]);

  const [syllabusText, setSyllabusText] = useState(initialSyllabus);
  const [isPublished, setIsPublished] = useState(course.isPublished);

  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const finalCategory = category.trim();
    if (!finalCategory) {
      setError("Category is required.");
      setLoading(false);
      return;
    }

    const syllabusArray = syllabusText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    const syllabus =
      syllabusArray.length > 0 ? JSON.stringify(syllabusArray) : null;

    try {
      const res = await updateCourseAction(course.id, {
        title,
        titleArabic: titleArabic || null,
        slug,
        description,
        instructor,
        language,
        level,
        category: finalCategory,
        duration,
        thumbnailUrl: thumbnailUrl || null,
        resourceUrl: resourceUrl || null,
        syllabus: syllabus || undefined,
        isPublished,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else if (res.course) {
        if (!defaultCategories.includes(finalCategory)) {
          createCategoryAction({
            name: finalCategory,
            itemType: "course",
          }).catch(() => {});
        }
        setSuccess("Course updated successfully!");
        setLoading(false);
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to update course.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header & Back link */}
      <div>
        <Link
          href="/admin/courses"
          prefetch={true}
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Courses</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-6 h-6 text-amber-500 dark:text-amber-400" />
              <span>Edit Course</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Update course metadata, thumbnail image, curriculum syllabus, and publication status.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/courses/${course.slug}`}
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
              Course Title (English) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Al-Ajrumiyyah Masterclass"
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
              placeholder="شرح متن الآجرومية في علم العربية"
              value={titleArabic}
              onChange={(e) => setTitleArabic(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Slug and Instructor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              URL Slug <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="al-ajrumiyyah-masterclass"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Instructor / Speaker <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Ustadh Muhammad Tim Humble"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Language, Level, Duration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Language <span className="text-rose-500">*</span>
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="English">English</option>
              <option value="Arabic">Arabic</option>
              <option value="Bilingual">Bilingual (Arabic / English)</option>
              <option value="Urdu">Urdu</option>
              <option value="Bengali">Bengali</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Level <span className="text-rose-500">*</span>
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
              Duration
            </label>
            <input
              type="text"
              placeholder="e.g., 24 hours (30 lessons)"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Category selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Category <span className="text-rose-500">*</span>
            </label>
            <button
              type="button"
              onClick={() => {
                setIsCustomCategory(!isCustomCategory);
                if (isCustomCategory) {
                  setCategory(defaultCategories[0] || "Nahw (Syntax)");
                } else {
                  setCategory("");
                }
              }}
              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {isCustomCategory ? "← Pick existing category" : "+ Type custom category"}
            </button>
          </div>

          {isCustomCategory ? (
            <input
              type="text"
              required
              placeholder="Enter category name..."
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
              {defaultCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Course Thumbnail */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Course Thumbnail (Upload Image File or URL)
          </label>
          <CourseThumbnailUploader
            value={thumbnailUrl}
            onChange={setThumbnailUrl}
            onUploadStateChange={setUploadingImage}
            disabled={loading}
          />
        </div>

        {/* Resource / External Video Playlist URL */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Resource / External Video Playlist URL (Optional)
          </label>
          <input
            type="url"
            placeholder="https://youtube.com/playlist?list=..."
            value={resourceUrl}
            onChange={(e) => setResourceUrl(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
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
            placeholder="Comprehensive overview of topics covered, prerequisites, and learning objectives..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-y"
          />
        </div>

        {/* Syllabus / Lessons outline */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Syllabus Outline (One item per line)
          </label>
          <textarea
            rows={4}
            placeholder={`1. Introduction to Al-Kalam and Types of Words\n2. Signs of the Ism, Fi'l, and Harf\n3. The Chapter of I'rab (Inflection)\n4. Signs of Raf', Nasb, Khafd, and Jazm`}
            value={syllabusText}
            onChange={(e) => setSyllabusText(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
          />
          <p className="text-[11px] text-slate-400">
            Enter each module or lesson on a new line. It will be formatted into structured curriculum checkpoints.
          </p>
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
              When checked, this course is publicly visible in catalog and learning paths.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
          <Link
            href="/admin/courses"
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
