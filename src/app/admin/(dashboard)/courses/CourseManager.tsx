"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  GraduationCap,
  Globe,
  Clock,
  X,
  Check,
} from "lucide-react";
import type { Course } from "@/db/entities";
import {
  createCourseAction,
  updateCourseAction,
  deleteCourseAction,
} from "@/actions/course-actions";
import { createCategoryAction } from "@/actions/category-actions";

interface CourseManagerProps {
  initialCourses: Course[];
}

export function CourseManager({ initialCourses }: CourseManagerProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [titleArabic, setTitleArabic] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [instructor, setInstructor] = useState("");
  const [language, setLanguage] = useState("English");
  const [level, setLevel] = useState("Beginner");
  const [category, setCategory] = useState("Nahw (Syntax)");
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [duration, setDuration] = useState("20 hours");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [resourceUrl, setResourceUrl] = useState("");
  const [syllabusText, setSyllabusText] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const existingCategories = useMemo(() => {
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
    const set = new Set(defaultCats);
    courses.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return Array.from(set).sort();
  }, [courses]);

  const openCreateModal = () => {
    setEditingCourse(null);
    setTitle("");
    setTitleArabic("");
    setSlug("");
    setDescription("");
    setInstructor("");
    setLanguage("English");
    setLevel("Beginner");
    setCategory(existingCategories[0] || "Nahw (Syntax)");
    setIsCustomCategory(false);
    setDuration("20 hours");
    setThumbnailUrl("");
    setResourceUrl("");
    setSyllabusText("");
    setIsPublished(true);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (c: Course) => {
    setEditingCourse(c);
    setTitle(c.title);
    setTitleArabic(c.titleArabic || "");
    setSlug(c.slug);
    setDescription(c.description);
    setInstructor(c.instructor);
    setLanguage(c.language);
    setLevel(c.level);
    setCategory(c.category);
    setIsCustomCategory(!existingCategories.includes(c.category));
    setDuration(c.duration);
    setThumbnailUrl(c.thumbnailUrl || "");
    setResourceUrl(c.resourceUrl || "");
    let text = "";
    if (c.syllabus) {
      try {
        const arr = JSON.parse(c.syllabus);
        text = Array.isArray(arr) ? arr.join("\n") : c.syllabus;
      } catch {
        text = c.syllabus;
      }
    }
    setSyllabusText(text);
    setIsPublished(c.isPublished);
    setError(null);
    setModalOpen(true);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!editingCourse) {
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
      syllabusArray.length > 0 ? JSON.stringify(syllabusArray) : undefined;

    if (editingCourse) {
      const res = await updateCourseAction(editingCourse.id, {
        title,
        titleArabic: titleArabic || null,
        description,
        instructor,
        language,
        level,
        category: finalCategory,
        duration,
        thumbnailUrl: thumbnailUrl || null,
        resourceUrl: resourceUrl || null,
        syllabus: syllabus || null,
        isPublished,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else if (res.course) {
        if (!existingCategories.includes(finalCategory)) {
          createCategoryAction({ name: finalCategory, itemType: "course" }).catch(() => {});
        }
        setCourses(
          courses.map((c) => (c.id === editingCourse.id ? (res.course as Course) : c))
        );
        setModalOpen(false);
        setLoading(false);
      }
    } else {
      const res = await createCourseAction({
        title,
        titleArabic: titleArabic || undefined,
        slug,
        description,
        instructor,
        language,
        level,
        category: finalCategory,
        duration,
        thumbnailUrl: thumbnailUrl || undefined,
        resourceUrl: resourceUrl || undefined,
        syllabus,
        isPublished,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else if (res.course) {
        if (!existingCategories.includes(finalCategory)) {
          createCategoryAction({ name: finalCategory, itemType: "course" }).catch(() => {});
        }
        setCourses([res.course as Course, ...courses]);
        setModalOpen(false);
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete course "${name}"?`)) return;
    const res = await deleteCourseAction(id);
    if (res.error) {
      alert(res.error);
    } else {
      setCourses(courses.filter((c) => c.id !== id));
    }
  };

  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    return (
      c.title.toLowerCase().includes(q) ||
      c.instructor.toLowerCase().includes(q) ||
      c.language.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-amber-500 dark:text-amber-400" />
            <span>Manage Courses</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Publish, edit, and organize Arabic language video series and courses.
          </p>
        </div>

        <Link
          href="/admin/courses/new"
          prefetch={true}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-950/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Course</span>
        </Link>
      </div>

      {/* Search and Table Box */}
      <div className="rounded-3xl bg-white border border-slate-200 shadow-xs dark:bg-[#0d1322] dark:border-slate-800 overflow-hidden transition-colors">
        {/* Search */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-900/80 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Course</th>
                <th className="py-3.5 px-4">Instructor</th>
                <th className="py-3.5 px-4">Language</th>
                <th className="py-3.5 px-4">Level</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                      {c.title}
                    </div>
                    {c.titleArabic && (
                      <div className="font-arabic text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        {c.titleArabic}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-700 dark:text-slate-300">
                    {c.instructor}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-emerald-800 border border-slate-200 dark:bg-slate-800 dark:text-emerald-300 dark:border-slate-700 text-[11px]">
                      {c.language}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="text-amber-700 dark:text-amber-300 font-medium">
                      {c.level}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400">
                    {c.category}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.isPublished
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-300 dark:border-emerald-500/30"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {c.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap text-right space-x-2">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors border border-slate-200 dark:border-transparent"
                      title="Edit Course"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id, c.title)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/60 dark:text-slate-300 dark:hover:text-rose-300 transition-colors border border-slate-200 dark:border-transparent"
                      title="Delete Course"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 shadow-2xl dark:bg-[#0f172a] dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 space-y-6 my-8 transition-colors">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingCourse ? "Edit Course" : "Add New Course"}
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Course Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Arabic Title (Optional)
                  </label>
                  <input
                    type="text"
                    value={titleArabic}
                    onChange={(e) => setTitleArabic(e.target.value)}
                    placeholder="العنوان بالعربية"
                    dir="rtl"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs font-arabic focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    URL Slug *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!!editingCourse}
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500 disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Instructor *
                  </label>
                  <input
                    type="text"
                    required
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Language *
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="English">English</option>
                    <option value="Arabic">Arabic (العربية)</option>
                    <option value="Urdu">Urdu (اردو)</option>
                    <option value="Bangla">Bangla (বাংলা)</option>
                    <option value="French">French</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Level *
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

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Category *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCustomCategory(!isCustomCategory);
                        if (!isCustomCategory) {
                          setCategory("");
                        } else {
                          setCategory(existingCategories[0] || "Nahw (Syntax)");
                        }
                      }}
                      className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                    >
                      {isCustomCategory ? "← Select existing" : "+ Add custom"}
                    </button>
                  </div>
                  {isCustomCategory ? (
                    <input
                      type="text"
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Hadith, Usul al-Fiqh..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  ) : (
                    <select
                      value={category}
                      onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setIsCustomCategory(true);
                          setCategory("");
                        } else {
                          setCategory(e.target.value);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      {existingCategories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                      <option value="__custom__">+ Add Custom Category...</option>
                    </select>
                  )}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 25 hours • 18 Lectures"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Video / Resource Link
                  </label>
                  <input
                    type="url"
                    value={resourceUrl}
                    onChange={(e) => setResourceUrl(e.target.value)}
                    placeholder="https://youtube.com/playlist?list=..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Thumbnail Image URL
                </label>
                <input
                  type="url"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Syllabus Outline (One lesson / chapter per line)
                </label>
                <textarea
                  rows={4}
                  value={syllabusText}
                  onChange={(e) => setSyllabusText(e.target.value)}
                  placeholder="Lesson 1: Demonstratives (Haza/Dhalika)&#10;Lesson 2: Noun properties&#10;Lesson 3: Harf Al-Jar"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="isPublished" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  Publish course immediately to public catalog
                </label>
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors shadow-md shadow-emerald-950/20 disabled:opacity-50"
                >
                  {loading ? "Saving..." : editingCourse ? "Update Course" : "Create Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
