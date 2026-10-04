"use client";

import { useState, useMemo } from "react";
import { Plus, Search, Trash2, Edit, BookOpen, ExternalLink, X } from "lucide-react";
import type { Book } from "@/db/entities";
import {
  createBookAction,
  updateBookAction,
  deleteBookAction,
} from "@/actions/book-actions";
import { createCategoryAction } from "@/actions/category-actions";

interface BookManagerProps {
  initialBooks: Book[];
}

export function BookManager({ initialBooks }: BookManagerProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    const set = new Set(defaultCats);
    books.forEach((b) => {
      if (b.category) set.add(b.category);
    });
    return Array.from(set).sort();
  }, [books]);

  const openCreateModal = () => {
    setEditingBook(null);
    setTitle("");
    setTitleArabic("");
    setAuthor("");
    setCategory(existingCategories[0] || "Grammar");
    setIsCustomCategory(false);
    setLevel("Beginner");
    setLanguage("Arabic");
    setPages(100);
    setFileUrl("");
    setCoverUrl("");
    setDescription("");
    setIsPublished(true);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (b: Book) => {
    setEditingBook(b);
    setTitle(b.title);
    setTitleArabic(b.titleArabic || "");
    setAuthor(b.author);
    setCategory(b.category);
    setIsCustomCategory(!existingCategories.includes(b.category));
    setLevel(b.level);
    setLanguage(b.language);
    setPages(b.pages);
    setFileUrl(b.fileUrl || "");
    setCoverUrl(b.coverUrl || "");
    setDescription(b.description);
    setIsPublished(b.isPublished);
    setError(null);
    setModalOpen(true);
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

    if (editingBook) {
      const res = await updateBookAction(editingBook.id, {
        title,
        titleArabic: titleArabic || null,
        author,
        category: finalCategory,
        level,
        language,
        pages,
        fileUrl: fileUrl || null,
        coverUrl: coverUrl || null,
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
        setBooks(
          books.map((b) => (b.id === editingBook.id ? (res.book as Book) : b))
        );
        setModalOpen(false);
        setLoading(false);
      }
    } else {
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
        setBooks([res.book as Book, ...books]);
        setModalOpen(false);
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete book "${name}"?`)) return;
    const res = await deleteBookAction(id);
    if (res.error) {
      alert(res.error);
    } else {
      setBooks(books.filter((b) => b.id !== id));
    }
  };

  const filtered = books.filter((b) => {
    const q = search.toLowerCase();
    return (
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.category.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-teal-600 dark:text-cyan-400" />
            <span>Manage Books & Primers</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Upload and organize classical mutun, commentaries, lexicons, and readers.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors shadow-md shadow-emerald-950/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Book</span>
        </button>
      </div>

      <div className="rounded-3xl bg-white border border-slate-200 shadow-xs dark:bg-[#0d1322] dark:border-slate-800 overflow-hidden transition-colors">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search books by title, author..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 text-slate-500 dark:bg-slate-900/80 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Author</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Level</th>
                <th className="py-3.5 px-4">Pages</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/80">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-bold text-slate-900 dark:text-white line-clamp-1">
                      {b.title}
                    </div>
                    {b.titleArabic && (
                      <div className="font-arabic text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                        {b.titleArabic}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{b.author}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-teal-800 border border-slate-200 dark:bg-slate-800 dark:text-cyan-300 dark:border-slate-700">
                      {b.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-amber-700 dark:text-amber-300 font-medium">{b.level}</td>
                  <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{b.pages}</td>
                  <td className="py-3.5 px-4 text-right space-x-2">
                    <button
                      onClick={() => openEditModal(b)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors border border-slate-200 dark:border-transparent"
                      title="Edit Book"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(b.id, b.title)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 dark:bg-slate-800 dark:hover:bg-rose-950/60 dark:text-slate-300 dark:hover:text-rose-300 transition-colors border border-slate-200 dark:border-transparent"
                      title="Delete Book"
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

      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 shadow-2xl dark:bg-[#0f172a] dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 md:p-8 space-y-5 transition-colors">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {editingBook ? "Edit Book" : "Add New Book"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white"
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
                    Book Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
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
                    dir="rtl"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs font-arabic focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Author / Scholar *
                  </label>
                  <input
                    type="text"
                    required
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
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
                          setCategory(existingCategories[0] || "Grammar");
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
                      placeholder="e.g. Fiqh, Hadith, Children..."
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Level
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
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Language
                  </label>
                  <input
                    type="text"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    placeholder="e.g. Arabic or Arabic / English"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Page Count
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={pages}
                    onChange={(e) => setPages(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    File Download URL (PDF)
                  </label>
                  <input
                    type="url"
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    placeholder="https://ia800204.us.archive.org/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Cover Image URL
                  </label>
                  <input
                    type="url"
                    value={coverUrl}
                    onChange={(e) => setCoverUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
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

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
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
                  {loading ? "Saving..." : editingBook ? "Update Book" : "Create Book"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
