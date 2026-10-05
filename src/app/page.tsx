import Link from "next/link";
import {
  Compass,
  GraduationCap,
  BookOpen,
  FileText,
  ShieldCheck,
  Check,
  BookmarkCheck,
  Layers,
  Sparkles,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PathCard } from "@/components/PathCard";
import { BookCard } from "@/components/BookCard";
import { NoteCard } from "@/components/NoteCard";
import { CourseFilterList } from "@/components/CourseFilterList";
import { getCoursesAction } from "@/actions/course-actions";
import { getPathsAction } from "@/actions/path-actions";
import { getBooksAction } from "@/actions/book-actions";
import { getNotesAction } from "@/actions/note-actions";

export const revalidate = 60;

export default async function HomePage() {
  const [courses, paths, books, notes] = await Promise.all([
    getCoursesAction({ onlyPublished: true }),
    getPathsAction({ onlyPublished: true }),
    getBooksAction({ onlyPublished: true }),
    getNotesAction({ onlyPublished: true }),
  ]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 bg-arabesque text-slate-900 dark:bg-[#070b13] dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION - Dignified Scholastic Entrance */}
        <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
          {/* Subtle atmosphere gradients */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/8 dark:bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-[350px] h-[250px] bg-amber-500/8 dark:bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Traditional Basmala Heading */}
            <div className="font-arabic text-emerald-800 dark:text-emerald-400 text-xl sm:text-2xl font-bold tracking-wide mb-4" dir="rtl">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>

            {/* Clear, deliberate headline without artificial gradient clipping */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight md:leading-snug">
              Master Classical Arabic, Sacred Grammar, and Quranic Eloquence
            </h1>

            {/* Disciplined line length under 75 characters */}
            <p className="mt-5 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Curated milestone roadmaps, foundational primers, recorded video series, and high-yield grammar matrices for dedicated students of the Arabic tongue.
            </p>

            {/* Primary Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/paths"
                className="w-full sm:w-auto px-7 py-3 rounded-xl font-semibold text-sm bg-emerald-700 hover:bg-emerald-600 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-sm transition-colors flex items-center justify-center gap-2.5"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Learning Paths</span>
              </Link>

              <Link
                href="/books"
                className="w-full sm:w-auto px-7 py-3 rounded-xl font-semibold text-sm bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-xs dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-700 transition-colors flex items-center justify-center gap-2.5"
              >
                <BookOpen className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>Browse Library & Primers</span>
              </Link>
            </div>

            {/* Unified Scholastic Gateway - Replacing generic SaaS card row */}
            <div className="mt-16 max-w-5xl mx-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
                {/* 1. Learning Paths */}
                <Link
                  href="/paths"
                  className="p-5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-2xs hover:border-emerald-600/40 dark:bg-[#0c1220]/90 dark:border-slate-800 dark:hover:border-emerald-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <Compass className="w-4 h-4" />
                    </span>
                    <span className="font-arabic text-emerald-700/80 dark:text-emerald-400/80 text-sm font-bold">المناهج</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {paths.length} Curated Tracks
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                    Sequential, milestone-driven tracks from alphabet to classical texts.
                  </p>
                </Link>

                {/* 2. Video Courses */}
                <Link
                  href="/courses"
                  className="p-5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-2xs hover:border-emerald-600/40 dark:bg-[#0c1220]/90 dark:border-slate-800 dark:hover:border-emerald-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <GraduationCap className="w-4 h-4" />
                    </span>
                    <span className="font-arabic text-emerald-700/80 dark:text-emerald-400/80 text-sm font-bold">الدروس</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {courses.length} Video Series
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                    Structured lectures indexed in English, Arabic, and Urdu.
                  </p>
                </Link>

                {/* 3. Classical Books */}
                <Link
                  href="/books"
                  className="p-5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-2xs hover:border-emerald-600/40 dark:bg-[#0c1220]/90 dark:border-slate-800 dark:hover:border-emerald-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <BookOpen className="w-4 h-4" />
                    </span>
                    <span className="font-arabic text-emerald-700/80 dark:text-emerald-400/80 text-sm font-bold">المكتبة</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {books.length} Classical Texts
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                    Vocalized mutūn, primers, and commentaries ready for study.
                  </p>
                </Link>

                {/* 4. Grammar Matrices */}
                <Link
                  href="/notes"
                  className="p-5 rounded-2xl bg-white/90 border border-slate-200/90 shadow-2xs hover:border-emerald-600/40 dark:bg-[#0c1220]/90 dark:border-slate-800 dark:hover:border-emerald-500/40 transition-all group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/80 dark:border-emerald-800/50 flex items-center justify-center text-emerald-700 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                      <FileText className="w-4 h-4" />
                    </span>
                    <span className="font-arabic text-emerald-700/80 dark:text-emerald-400/80 text-sm font-bold">الفوائد</span>
                  </div>
                  <div className="text-xl font-bold text-slate-900 dark:text-white">
                    {notes.length} Study Matrices
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                    High-yield paradigm tables, particles, and conjugation sheets.
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: LEARNING PATHS */}
        <section id="paths" className="py-16 md:py-20 border-t border-slate-200 bg-slate-100/50 dark:border-slate-800/80 dark:bg-[#090d16]/40 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Sequential Curricula</span>
                  <span className="font-arabic font-bold text-sm">المسارات التعليمية</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  Milestone Learning Paths
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                  Each roadmap brings together multiple core courses organized into sequential stages with clear milestones from foundational vocabulary to classical literature.
                </p>
              </div>

              <Link
                href="/paths"
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
              >
                View all paths
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {paths.map((path) => (
                <PathCard key={path.id} path={path} />
              ))}
            </div>
          </div>
        </section>

        {/* SECTION: COURSES WITH SEARCH & DISCIPLINE FILTERS */}
        <section id="courses" className="py-16 md:py-20 border-t border-slate-200 dark:border-slate-800/80 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CourseFilterList initialCourses={courses} />
          </div>
        </section>

        {/* SECTION: BOOKS & CLASSICAL TEXTS */}
        <section id="books" className="py-16 md:py-20 border-t border-slate-200 bg-slate-100/50 dark:border-slate-800/80 dark:bg-[#090d16]/40 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Classical Texts & Primers</span>
                  <span className="font-arabic font-bold text-sm">المتون والشروح</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  Classical Primers & Graded Readers
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                  Downloadable classical mutūn, vocalized readers, and pedagogical commentaries from the Madinah Book series to classical works of grammar.
                </p>
              </div>

              <Link
                href="/books"
                className="text-xs font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
              >
                Browse full library
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.slice(0, 6).map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          </div>
        </section>

        {/* SECTION: NOTES & CHEAT SHEETS */}
        <section id="notes" className="py-16 md:py-20 border-t border-slate-200 dark:border-slate-800/80 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Study Aides & Summaries</span>
                  <span className="font-arabic font-bold text-sm">الجداول والخرائط</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
                  Grammar Matrices & Paradigms
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                  High-yield reference charts, ten-form verb conjugation tables, and particle summaries for systematic revision.
                </p>
              </div>

              <Link
                href="/notes"
                className="text-xs font-semibold text-purple-700 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
              >
                View all study notes
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {notes.slice(0, 4).map((note) => (
                <NoteCard key={note.id} note={note} />
              ))}
            </div>
          </div>
        </section>

        {/* METHODOLOGY: THE THREE SCIENCES */}
        <section className="py-16 md:py-20 border-t border-slate-200 bg-slate-100/50 dark:border-slate-800/80 dark:bg-[#080d16] transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                Pillars of Arabic Scholarship
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                The Three Foundational Sciences
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Classical scholars established three intertwined linguistic faculties necessary for true comprehension of the sacred text.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Nahw */}
              <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xs dark:bg-[#0c1220] dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Syntax</h3>
                  <span className="font-arabic text-emerald-700 dark:text-emerald-400 text-base font-bold">علم النحو</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Governs sentence structure, the relationships between words, and the changing vowel endings (I&apos;rab) which establish subject, object, and condition.
                </p>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>Case endings: Raf&apos;, Nasb, Jarr, and Jazm</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <span>Nominal and verbal sentence constructs</span>
                  </div>
                </div>
              </div>

              {/* Sarf */}
              <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xs dark:bg-[#0c1220] dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Morphology</h3>
                  <span className="font-arabic text-amber-700 dark:text-amber-400 text-base font-bold">علم الصرف</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  The anatomy of individual words. Unlocks the capability to derive dozens of shades of meaning from a single three-letter trilateral root.
                </p>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>The ten classical verb scales (Awzan)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                    <span>Active and passive participles, nouns of place</span>
                  </div>
                </div>
              </div>

              {/* Balagha */}
              <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xs dark:bg-[#0c1220] dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Rhetoric</h3>
                  <span className="font-arabic text-teal-700 dark:text-cyan-400 text-base font-bold">علم البلاغة</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  The science of eloquence and context. Reveals why specific words, omissions, and arrangements are chosen in the Quranic discourse.
                </p>
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                    <span>Clarity of expression and tropes (Bayan)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                    <span>Semantic word order and emphasis (Ma&apos;ani)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
