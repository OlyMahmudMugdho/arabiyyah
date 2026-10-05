"use client";

import { useState, useMemo, useEffect } from "react";
import { Search, Filter, RotateCcw, GraduationCap } from "lucide-react";
import type { Course } from "@/db/entities";
import { CourseCard } from "./CourseCard";
import { trackClientEvent } from "./AnalyticsTracker";

interface CourseFilterListProps {
  initialCourses: Course[];
  showTitle?: boolean;
}

export function CourseFilterList({
  initialCourses,
  showTitle = true,
}: CourseFilterListProps) {
  const [selectedLanguage, setSelectedLanguage] = useState<string>("All");
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const languages = ["All", "English", "Arabic", "Urdu", "Bangla"];
  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  const categories = useMemo(() => {
    const set = new Set<string>();
    initialCourses.forEach((c) => {
      if (c.category) set.add(c.category);
    });
    return ["All", ...Array.from(set).sort()];
  }, [initialCourses]);

  const filteredCourses = useMemo(() => {
    return initialCourses.filter((course) => {
      // Language filter
      if (
        selectedLanguage !== "All" &&
        course.language.toLowerCase() !== selectedLanguage.toLowerCase()
      ) {
        return false;
      }

      // Level filter
      if (
        selectedLevel !== "All" &&
        course.level.toLowerCase() !== selectedLevel.toLowerCase()
      ) {
        return false;
      }

      // Category filter
      if (
        selectedCategory !== "All" &&
        course.category.toLowerCase() !== selectedCategory.toLowerCase() &&
        !course.category.toLowerCase().includes(selectedCategory.toLowerCase())
      ) {
        return false;
      }

      // Search query
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchesTitle = course.title.toLowerCase().includes(query);
        const matchesArabic =
          course.titleArabic && course.titleArabic.toLowerCase().includes(query);
        const matchesInstructor = course.instructor.toLowerCase().includes(query);
        const matchesDesc = course.description.toLowerCase().includes(query);
        const matchesCategory = course.category.toLowerCase().includes(query);

        if (
          !matchesTitle &&
          !matchesArabic &&
          !matchesInstructor &&
          !matchesDesc &&
          !matchesCategory
        ) {
          return false;
        }
      }

      return true;
    });
  }, [
    initialCourses,
    selectedLanguage,
    selectedLevel,
    selectedCategory,
    searchQuery,
  ]);

  const resetFilters = () => {
    setSelectedLanguage("All");
    setSelectedLevel("All");
    setSelectedCategory("All");
    setSearchQuery("");
  };

  useEffect(() => {
    const q = searchQuery.trim();
    if (!q) return;

    const timer = setTimeout(() => {
      trackClientEvent({
        eventType: "search",
        searchQuery: q,
        metadata: {
          resultsCount: filteredCourses.length,
          source: "courses",
          language: selectedLanguage,
          level: selectedLevel,
          category: selectedCategory,
        },
      });
    }, 1000);

    return () => clearTimeout(timer);
  }, [searchQuery, filteredCourses.length, selectedLanguage, selectedLevel, selectedCategory]);

  const isFiltered =
    selectedLanguage !== "All" ||
    selectedLevel !== "All" ||
    selectedCategory !== "All" ||
    searchQuery !== "";

  return (
    <div className="space-y-6">
      {showTitle && (
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Curated Lecture Series</span>
              <span className="font-arabic font-bold text-sm">الدروس المرئية</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
              Arabic Video Courses
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Explore systematic lectures across grammar, morphology, rhetoric, and classical literature.
            </p>
          </div>
        </div>
      )}

      {/* Filter Controls Box */}
      <div className="bg-white/90 border border-slate-200 shadow-sm dark:bg-[#0f172a]/80 dark:border-slate-800 backdrop-blur-sm p-4 md:p-6 rounded-2xl space-y-4 transition-colors">
        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search courses by title, instructor, or topic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 dark:bg-slate-900 dark:border-slate-700/80 dark:text-white dark:placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
          {/* Language Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Filter className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
              <span>Language Medium:</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {languages.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                    selectedLanguage === lang
                      ? "bg-emerald-600 text-white shadow-sm shadow-emerald-900/40"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                  }`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* Level Filter */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Filter className="w-3 h-3 text-amber-600 dark:text-amber-400" />
              <span>Proficiency Level:</span>
            </label>
            <div className="flex flex-wrap gap-1.5">
              {levels.map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setSelectedLevel(lvl)}
                  className={`px-3 py-1 text-xs rounded-lg font-medium transition-all ${
                    selectedLevel === lvl
                      ? "bg-amber-600 text-white shadow-sm shadow-amber-900/40"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-1.5 md:col-span-2 lg:col-span-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Filter className="w-3 h-3 text-cyan-600 dark:text-cyan-400" />
              <span>Subject Category:</span>
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-1.5 px-3 rounded-lg bg-slate-50 border border-slate-300 text-slate-800 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-200 text-xs focus:outline-none focus:border-emerald-500"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status bar */}
        <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-800">
          <span>
            Showing <strong className="text-emerald-600 dark:text-emerald-400">{filteredCourses.length}</strong>{" "}
            courses
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

      {/* Courses Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white/60 border border-dashed border-slate-300 dark:bg-[#0f172a]/40 dark:border-slate-800 rounded-3xl p-8 space-y-3">
          <p className="text-slate-800 dark:text-slate-300 font-medium">
            No courses found matching your current filter criteria.
          </p>
          <p className="text-xs text-slate-500">
            Try adjusting language medium, level, or search query.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      )}
    </div>
  );
}
