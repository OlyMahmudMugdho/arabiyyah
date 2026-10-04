"use client";

import { useState } from "react";
import {
  Download,
  Database,
  FileJson,
  FileSpreadsheet,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  Layers,
  GraduationCap,
  Compass,
  BookOpen,
  FileText,
  Users,
  FolderKanban,
} from "lucide-react";

interface ExportDataCardProps {
  isSuperadmin: boolean;
  counts: {
    courses: number;
    paths: number;
    books: number;
    notes: number;
    users: number;
  };
}

export function ExportDataCard({ isSuperadmin, counts }: ExportDataCardProps) {
  // If not superadmin, strictly render nothing
  if (!isSuperadmin) return null;

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<string>("all");
  const [selectedFormat, setSelectedFormat] = useState<"json" | "csv">("json");
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resourceOptions = [
    {
      id: "all",
      name: "Complete Platform Backup",
      description: "All courses, multi-stage paths, books, notes, and admin registries",
      count:
        counts.courses +
        counts.paths +
        counts.books +
        counts.notes +
        counts.users,
      icon: Database,
      badge: "Full Archive",
    },
    {
      id: "courses",
      name: "Courses Catalog",
      description: "Video lectures, syllabi, instructors, and classifications",
      count: counts.courses,
      icon: GraduationCap,
      badge: `${counts.courses} items`,
    },
    {
      id: "paths",
      name: "Learning Paths & Stages",
      description: "Roadmaps, sequential stages, and linked course syllabi",
      count: counts.paths,
      icon: Compass,
      badge: `${counts.paths} paths`,
    },
    {
      id: "books",
      name: "Books Library",
      description: "Classical primers, grammars, texts, and download links",
      count: counts.books,
      icon: BookOpen,
      badge: `${counts.books} books`,
    },
    {
      id: "notes",
      name: "Study Notes & Cheat Sheets",
      description: "Infographics, quick matrices, and grammar cheat sheets",
      count: counts.notes,
      icon: FileText,
      badge: `${counts.notes} notes`,
    },
    {
      id: "users",
      name: "Administrators & Permissions",
      description: "Curator user profiles and assigned access rights (passwords excluded)",
      count: counts.users,
      icon: Users,
      badge: `${counts.users} accounts`,
    },
    {
      id: "categories",
      name: "Curriculum Categories",
      description: "Classical sciences, discipline taxonomies, and scopes",
      count: 11,
      icon: FolderKanban,
      badge: "Taxonomy",
    },
  ];

  const handleDownload = async (resource: string, format: "json" | "csv") => {
    setIsExporting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const res = await fetch(
        `/api/admin/export?resource=${encodeURIComponent(
          resource
        )}&format=${encodeURIComponent(format)}`
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.error ||
            `Export failed with status ${res.status}. Superadmin authorization required.`
        );
      }

      // Extract filename from Content-Disposition if present
      const disposition = res.headers.get("Content-Disposition");
      let filename = `arabiyyah-${resource}-export.${format}`;
      if (disposition && disposition.includes("filename=")) {
        const match = disposition.match(/filename="?([^"]+)"?/);
        if (match && match[1]) {
          filename = match[1];
        }
      }

      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);

      setSuccessMessage(`Successfully downloaded ${filename}`);
      setTimeout(() => {
        setSuccessMessage(null);
      }, 5000);
    } catch (err: any) {
      console.error("Export error:", err);
      setError(err.message || "Failed to download export data.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <>
      {/* Dashboard Card Section */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/10 via-white to-slate-50 border border-amber-500/25 p-6 md:p-8 shadow-sm dark:from-amber-950/20 dark:via-[#0d1322] dark:to-[#0f172a] dark:border-amber-500/30 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-500/30">
              <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>Superadmin Restricted Tool</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              <span>Platform Data Export & Backup Archive</span>
            </h2>

            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Export high-fidelity snapshots of the curriculum, multi-stage roadmaps,
              classical texts, and curated resources in machine-readable JSON or spreadsheet-ready CSV.
            </p>

            {/* Quick Stat Pill Highlights */}
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
                {counts.courses} Courses
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-emerald-500" />
                {counts.paths} Learning Paths
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-cyan-500" />
                {counts.books} Books
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-purple-500" />
                {counts.notes} Study Notes
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-500" />
                {counts.users} Admins
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
            <button
              onClick={() => handleDownload("all", "json")}
              disabled={isExporting}
              className="inline-flex items-center justify-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white dark:text-slate-950 font-bold text-xs shadow-md shadow-amber-950/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>1-Click Full JSON Backup</span>
            </button>

            <button
              onClick={() => {
                setError(null);
                setModalOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 font-semibold text-xs border border-slate-300 dark:border-slate-700 transition-colors shadow-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Custom Resource & CSV Export...</span>
            </button>
          </div>
        </div>

        {/* Transient Inline Feedback Messages */}
        {successMessage && (
          <div className="mt-4 p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="mt-4 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Advanced Custom Export Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl transition-colors">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Export Platform Dataset
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select a resource scope and output format to generate your file.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Scope Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider block">
                1. Select Target Resource:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {resourceOptions.map((opt) => {
                  const Icon = opt.icon;
                  const isSelected = selectedResource === opt.id;

                  return (
                    <div
                      key={opt.id}
                      onClick={() => setSelectedResource(opt.id)}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between gap-2 ${
                        isSelected
                          ? "bg-amber-50/70 border-amber-500/60 dark:bg-amber-950/20 dark:border-amber-500/60 shadow-xs"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-300 dark:hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                          <Icon className="w-4 h-4 text-amber-500" />
                          <span>{opt.name}</span>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {opt.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Format Selection */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider block">
                2. Select Export Format:
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={() => setSelectedFormat("json")}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                    selectedFormat === "json"
                      ? "bg-amber-50/70 border-amber-500/60 dark:bg-amber-950/20 dark:border-amber-500/60"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-300"
                  }`}
                >
                  <FileJson className="w-5 h-5 text-amber-500 shrink-0" />
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                      JSON Format (.json)
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Hierarchical, complete schema backup
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setSelectedFormat("csv")}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                    selectedFormat === "csv"
                      ? "bg-amber-50/70 border-amber-500/60 dark:bg-amber-950/20 dark:border-amber-500/60"
                      : "bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300 dark:bg-slate-900/60 dark:border-slate-800 dark:text-slate-300"
                  }`}
                >
                  <FileSpreadsheet className="w-5 h-5 text-emerald-500 shrink-0" />
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white">
                      CSV Spreadsheet (.csv)
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Excel & Google Sheets compatible
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                🔒 Superadmin signature validated
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isExporting}
                  onClick={async () => {
                    await handleDownload(selectedResource, selectedFormat);
                    setModalOpen(false);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white dark:text-slate-950 font-bold text-xs transition-colors shadow-md shadow-amber-950/20 disabled:opacity-50"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Generating Export...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4" />
                      <span>Download Dataset</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
