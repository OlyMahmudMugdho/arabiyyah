"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  ArrowLeft,
  Loader2,
  Check,
  AlertCircle,
  FileCode,
  Sparkles,
} from "lucide-react";
import { createNoteAction } from "@/actions/note-actions";

export function NoteCreateForm() {
  const router = useRouter();

  // Form states
  const [title, setTitle] = useState("");
  const [topic, setTopic] = useState("Verb Conjugation");
  const [level, setLevel] = useState("Beginner");
  const [format, setFormat] = useState("PDF");
  const [author, setAuthor] = useState("Curator Scholar");
  const [fileUrl, setFileUrl] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isPublished, setIsPublished] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const topicOptions = [
    "Verb Conjugation",
    "Nahw (Syntax)",
    "Sarf (Morphology)",
    "Balagha (Rhetoric)",
    "Quranic Grammar",
    "Vocabulary & Roots",
    "Sentence Structure",
    "Prepositions & Particles",
    "General Arabic Guide",
  ];

  const formatOptions = [
    "PDF",
    "Markdown",
    "Cheat Sheet",
    "Infographic",
    "Summary Table",
    "Mindmap",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await createNoteAction({
        title,
        topic,
        level,
        format,
        author: author || "Curator Scholar",
        fileUrl: fileUrl || undefined,
        previewUrl: previewUrl || undefined,
        description,
        isPublished,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else if (res.note) {
        router.push("/admin/notes");
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create note.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header & Back link */}
      <div>
        <Link
          href="/admin/notes"
          prefetch={true}
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors mb-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Notes</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <span>Create New Study Note</span>
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Publish concise grammar matrices, particle cheatsheets, and revision summaries.
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
        {/* Title */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Note Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g., The 10 Verb Forms Master Matrix"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Topic, Level, Format */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Grammar Science / Topic <span className="text-rose-500">*</span>
            </label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              {topicOptions.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
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
              Document Format <span className="text-rose-500">*</span>
            </label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs focus:outline-none focus:border-emerald-500"
            >
              {formatOptions.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Author */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Author / Contributor
          </label>
          <input
            type="text"
            placeholder="e.g., Curator Scholar"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* File URL and Preview URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Download File URL (PDF or Drive link)
            </label>
            <input
              type="url"
              placeholder="https://storage.googleapis.com/... or Google Drive URL"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Preview Thumbnail URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={previewUrl}
              onChange={(e) => setPreviewUrl(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Description & Key Points <span className="text-rose-500">*</span>
          </label>
          <textarea
            required
            rows={4}
            placeholder="Outline what grammatical rules, tables, or paradigms this study sheet contains..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 dark:bg-slate-900 dark:border-slate-700 dark:text-white text-xs placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-y"
          />
        </div>

        {/* Publishing status */}
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
          <input
            type="checkbox"
            id="noteIsPublished"
            checked={isPublished}
            onChange={(e) => setIsPublished(e.target.checked)}
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-700"
          />
          <div>
            <label
              htmlFor="noteIsPublished"
              className="text-xs font-bold text-slate-900 dark:text-white block cursor-pointer"
            >
              Publish Immediately
            </label>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              When checked, this study sheet will appear in the public Notes & Guides archive.
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
          <Link
            href="/admin/notes"
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
                <span>Creating Note...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Study Note</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
