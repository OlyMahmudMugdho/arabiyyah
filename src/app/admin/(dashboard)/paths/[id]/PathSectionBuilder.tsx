"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Compass,
  Layers,
  Plus,
  Trash2,
  Edit,
  GraduationCap,
  Globe,
  Info,
  X,
  Check,
} from "lucide-react";
import type { LearningPath, Course } from "@/db/entities";
import {
  createPathSectionAction,
  updatePathSectionAction,
  deletePathSectionAction,
  addCourseToSectionAction,
  removeCourseFromSectionAction,
} from "@/actions/path-actions";

interface PathSectionBuilderProps {
  initialPath: LearningPath;
  allCourses: Course[];
}

export function PathSectionBuilder({
  initialPath,
  allCourses,
}: PathSectionBuilderProps) {
  const [path, setPath] = useState<LearningPath>(initialPath);

  // Section Modal
  const [sectionModalOpen, setSectionModalOpen] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [secTitle, setSecTitle] = useState("");
  const [secTitleArabic, setSecTitleArabic] = useState("");
  const [secDesc, setSecDesc] = useState("");
  const [secOrder, setSecOrder] = useState<number>(1);

  // Add Course Modal
  const [courseModalOpen, setCourseModalOpen] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState<string>("");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [courseOrder, setCourseOrder] = useState<number>(1);
  const [isMandatory, setIsMandatory] = useState<boolean>(true);
  const [customNotes, setCustomNotes] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Section handlers
  const openAddSection = () => {
    setEditingSectionId(null);
    setSecTitle("");
    setSecTitleArabic("");
    setSecDesc("");
    setSecOrder((path.sections?.length || 0) + 1);
    setError(null);
    setSectionModalOpen(true);
  };

  const openEditSection = (s: any) => {
    setEditingSectionId(s.id);
    setSecTitle(s.title);
    setSecTitleArabic(s.titleArabic || "");
    setSecDesc(s.description || "");
    setSecOrder(s.orderIndex);
    setError(null);
    setSectionModalOpen(true);
  };

  const handleSaveSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (editingSectionId) {
      const res = await updatePathSectionAction(editingSectionId, {
        title: secTitle,
        titleArabic: secTitleArabic || null,
        description: secDesc || null,
        orderIndex: secOrder,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else {
        setPath({
          ...path,
          sections: (path.sections || []).map((s) =>
            s.id === editingSectionId ? { ...s, ...(res.section as any) } : s
          ),
        });
        setSectionModalOpen(false);
        setLoading(false);
      }
    } else {
      const res = await createPathSectionAction(path.id, {
        title: secTitle,
        titleArabic: secTitleArabic || undefined,
        description: secDesc || undefined,
        orderIndex: secOrder,
      });

      if (res.error) {
        setError(res.error);
        setLoading(false);
      } else {
        const newSec = { ...res.section, pathCourses: [] };
        setPath({
          ...path,
          sections: [...(path.sections || []), newSec as any],
        });
        setSectionModalOpen(false);
        setLoading(false);
      }
    }
  };

  const handleDeleteSection = async (secId: string, title: string) => {
    if (!confirm(`Delete section "${title}" and all its course links?`)) return;
    const res = await deletePathSectionAction(secId);
    if (res.error) {
      alert(res.error);
    } else {
      setPath({
        ...path,
        sections: (path.sections || []).filter((s) => s.id !== secId),
      });
    }
  };

  // Course linking handlers
  const openAddCourse = (secId: string) => {
    setTargetSectionId(secId);
    setSelectedCourseId(allCourses[0]?.id || "");
    const sec = (path.sections || []).find((s) => s.id === secId);
    setCourseOrder((sec?.pathCourses?.length || 0) + 1);
    setIsMandatory(true);
    setCustomNotes("");
    setError(null);
    setCourseModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      setError("Please select a course to link.");
      return;
    }
    setLoading(true);
    setError(null);

    const res = await addCourseToSectionAction({
      sectionId: targetSectionId,
      courseId: selectedCourseId,
      orderIndex: courseOrder,
      isMandatory,
      customNotes: customNotes || undefined,
    });

    if (res.error) {
      setError(res.error);
      setLoading(false);
    } else {
      // Find course object
      const courseObj = allCourses.find((c) => c.id === selectedCourseId);
      const newPathCourse = { ...res.item, course: courseObj };

      setPath({
        ...path,
        sections: (path.sections || []).map((s) =>
          s.id === targetSectionId
            ? {
                ...s,
                pathCourses: [...(s.pathCourses || []), newPathCourse as any],
              }
            : s
        ),
      });
      setCourseModalOpen(false);
      setLoading(false);
    }
  };

  const handleRemoveCourse = async (
    pathCourseId: string,
    secId: string,
    cTitle: string
  ) => {
    if (!confirm(`Remove "${cTitle}" from this section?`)) return;
    const res = await removeCourseFromSectionAction(pathCourseId);
    if (res.error) {
      alert(res.error);
    } else {
      setPath({
        ...path,
        sections: (path.sections || []).map((s) =>
          s.id === secId
            ? {
                ...s,
                pathCourses: (s.pathCourses || []).filter(
                  (pc) => pc.id !== pathCourseId
                ),
              }
            : s
        ),
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Breadcrumb & Path Meta */}
      <div className="space-y-4">
        <Link
          href="/admin/paths"
          className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Paths</span>
        </Link>

        <div className="p-6 md:p-8 rounded-3xl bg-[#0d1322] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                {path.level}
              </span>
              <span className="text-xs text-slate-400">
                Duration: {path.estimatedHours}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">{path.title}</h1>
            {path.titleArabic && (
              <p className="font-arabic text-emerald-400 text-sm font-semibold">
                {path.titleArabic}
              </p>
            )}
            <p className="text-xs text-slate-400 max-w-2xl">
              {path.description}
            </p>
          </div>

          <button
            onClick={openAddSection}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-950/40 transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Roadmap Stage / Section</span>
          </button>
        </div>
      </div>

      {/* Sections and Course Pipeline */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-cyan-400" />
            <span>Roadmap Stages ({path.sections?.length || 0})</span>
          </h2>
        </div>

        {path.sections && path.sections.length > 0 ? (
          <div className="space-y-6">
            {path.sections.map((section, sIndex) => (
              <div
                key={section.id}
                className="rounded-3xl bg-[#0d1322] border border-slate-800 p-6 space-y-5"
              >
                {/* Section Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center justify-center border border-emerald-500/30 mt-0.5">
                      {sIndex + 1}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">
                        {section.title}
                      </h3>
                      {section.titleArabic && (
                        <p className="font-arabic text-xs font-semibold text-emerald-400">
                          {section.titleArabic}
                        </p>
                      )}
                      {section.description && (
                        <p className="text-xs text-slate-400 mt-1">
                          {section.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEditSection(section)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Edit Section Details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        handleDeleteSection(section.id, section.title)
                      }
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 transition-colors"
                      title="Delete Section"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Courses in this section */}
                <div className="pt-2 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                      <span>
                        Stage Courses ({section.pathCourses?.length || 0})
                      </span>
                    </span>

                    <button
                      onClick={() => openAddCourse(section.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-emerald-600 text-slate-200 hover:text-white text-xs font-medium transition-colors border border-slate-700"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Course to Stage</span>
                    </button>
                  </div>

                  {section.pathCourses && section.pathCourses.length > 0 ? (
                    <div className="space-y-2.5">
                      {section.pathCourses.map((pc, cIndex) => {
                        const course = pc.course;
                        return (
                          <div
                            key={pc.id}
                            className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <span className="text-xs font-bold text-slate-500">
                                #{cIndex + 1}
                              </span>
                              <div className="min-w-0">
                                <div className="text-sm font-semibold text-white truncate">
                                  {course?.title || "Unknown Course"}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                                  <span>{course?.instructor}</span>
                                  <span>•</span>
                                  <span className="text-emerald-400">
                                    {course?.language}
                                  </span>
                                  <span>•</span>
                                  <span
                                    className={`px-1.5 py-0.2 rounded text-[10px] ${
                                      pc.isMandatory
                                        ? "text-emerald-400 bg-emerald-500/10"
                                        : "text-amber-400 bg-amber-500/10"
                                    }`}
                                  >
                                    {pc.isMandatory ? "Mandatory" : "Optional"}
                                  </span>
                                </div>
                                {pc.customNotes && (
                                  <p className="text-[11px] text-amber-300/80 mt-1 italic flex items-center gap-1">
                                    <Info className="w-3 h-3 shrink-0" />
                                    <span>{pc.customNotes}</span>
                                  </p>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() =>
                                handleRemoveCourse(
                                  pc.id,
                                  section.id,
                                  course?.title || "Course"
                                )
                              }
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors shrink-0"
                              title="Remove from Section"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-900/40 text-center text-xs text-slate-500">
                      No courses attached to this stage yet. Click &quot;Add Course to Stage&quot; above.
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center rounded-3xl bg-[#0d1322] border border-dashed border-slate-800 space-y-3">
            <Layers className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-300 font-medium">
              This path has no milestone stages yet.
            </p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              A path combines multiple courses divided into multiple sections. Create your first stage (e.g. &quot;Stage 1: Script & Alphabet&quot;) to begin adding courses.
            </p>
            <button
              onClick={openAddSection}
              className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold"
            >
              Add First Section
            </button>
          </div>
        )}
      </div>

      {/* Section Modal */}
      {sectionModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                {editingSectionId ? "Edit Stage / Section" : "Add Stage / Section"}
              </h3>
              <button
                onClick={() => setSectionModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveSection} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Section Title *
                </label>
                <input
                  type="text"
                  required
                  value={secTitle}
                  onChange={(e) => setSecTitle(e.target.value)}
                  placeholder="e.g. Stage 1: Alphabet & Phonetics"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Arabic Title
                </label>
                <input
                  type="text"
                  value={secTitleArabic}
                  onChange={(e) => setSecTitleArabic(e.target.value)}
                  placeholder="المرحلة الأولى: أصول الحروف"
                  dir="rtl"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-arabic focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Description / Milestone Goal
                </label>
                <textarea
                  rows={2}
                  value={secDesc}
                  onChange={(e) => setSecDesc(e.target.value)}
                  placeholder="What will the student master by the end of this stage?"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Stage Sequence Order Index
                </label>
                <input
                  type="number"
                  min={1}
                  value={secOrder}
                  onChange={(e) => setSecOrder(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSectionModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {loading ? "Saving..." : "Save Section"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Linking Modal */}
      {courseModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                Add Course to Stage
              </h3>
              <button
                onClick={() => setCourseModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSaveCourse} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Select Course to Assign *
                </label>
                <select
                  value={selectedCourseId}
                  onChange={(e) => setSelectedCourseId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                >
                  {allCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.language} • {c.level})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">
                    Order in this Stage
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={courseOrder}
                    onChange={(e) => setCourseOrder(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="isMandatory"
                    checked={isMandatory}
                    onChange={(e) => setIsMandatory(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="isMandatory" className="text-xs text-slate-300 font-medium">
                    Mandatory Course
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">
                  Advice / Guidance Notes for Student
                </label>
                <textarea
                  rows={2}
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="e.g. Focus on exercises 1-5; write full Harakat."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCourseModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {loading ? "Linking..." : "Attach Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
