"use client";

import { useState, useMemo } from "react";
import { Search, Filter, RotateCcw, FileText } from "lucide-react";
import type { Note } from "@/db/entities";
import { NoteCard } from "./NoteCard";

interface NoteFilterListProps {
  initialNotes: Note[];
}

export function NoteFilterList({ initialNotes }: NoteFilterListProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>("All");
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("All");

  const formats = ["All", "PDF", "Infographic", "Cheat Sheet"];
  const levels = ["All", "Beginner", "Intermediate", "Advanced", "All Levels"];

  const filteredNotes = useMemo(() => {
    return initialNotes.filter((note) => {
      if (
        selectedFormat !== "All" &&
        note.format.toLowerCase() !== selectedFormat.toLowerCase()
      ) {
        return false;
      }

      if (
        selectedLevel !== "All" &&
        note.level.toLowerCase() !== selectedLevel.toLowerCase()
      ) {
        return false;
      }

      if (searchQuery !== "All" && searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesTitle = note.title.toLowerCase().includes(query);
        const matchesTopic = note.topic.toLowerCase().includes(query);
        const matchesDesc = note.description.toLowerCase().includes(query);
        const matchesAuthor = note.author.toLowerCase().includes(query);

        if (!matchesTitle && !matchesTopic && !matchesDesc && !matchesAuthor) {
          return false;
        }
      }

      return true;
    });
  }, [initialNotes, selectedFormat, selectedLevel, searchQuery]);

  const resetFilters = () => {
    setSelectedFormat("All");
    setSelectedLevel("All");
    setSearchQuery("All");
  };

  const isFiltered =
    selectedFormat !== "All" ||
    selectedLevel !== "All" ||
    searchQuery !== "All";

  return (
    <div className="space-y-6">
      <div className="bg-white/90 border border-slate-200 shadow-sm dark:bg-[#0f172a]/80 dark:border-slate-800 backdrop-blur-sm p-4 md:p-6 rounded-2xl space-y-4 transition-colors">
        {/* Search */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notes by title, topic, or concept..."
            value={searchQuery === "All" ? "" : searchQuery}
            onChange={(e) => setSearchQuery(e.target.value || "All")}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 dark:bg-slate-900 dark:border-slate-700/80 dark:text-white dark:placeholder-slate-500 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mr-1">
              <Filter className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Format:</span>
            </span>
            {formats.map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setSelectedFormat(fmt)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  selectedFormat === fmt
                    ? "bg-purple-600 text-white shadow-sm shadow-purple-900/40"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 mr-1">
              Level:
            </span>
            {levels.map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                  selectedLevel === lvl
                    ? "bg-emerald-600 text-white shadow-sm shadow-emerald-900/40"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
          <span>
            Showing <strong className="text-purple-600 dark:text-purple-400">{filteredNotes.length}</strong>{" "}
            notes & guides
          </span>
          {isFiltered && (
            <button
              type="button"
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-rose-500 hover:text-rose-400 transition-colors font-medium"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {filteredNotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredNotes.map((note) => (
            <NoteCard key={note.id} note={note} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white/60 border border-dashed border-slate-300 dark:bg-[#0f172a]/40 dark:border-slate-800 rounded-3xl p-8 space-y-3">
          <FileText className="w-8 h-8 text-slate-400 dark:text-slate-600 mx-auto" />
          <p className="text-slate-800 dark:text-slate-300 font-medium">
            No notes found matching your filter selection.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-500 transition-colors"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}
