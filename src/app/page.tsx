import Link from "next/link";
import {
  Compass,
  GraduationCap,
  BookOpen,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  BookMarked,
  Globe2,
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
    <div className="min-h-screen flex flex-col bg-slate-50 bg-arabesque text-slate-900 dark:bg-[#0b101b] dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
          {/* Subtle radial emerald/amber glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-1/4 w-[350px] h-[250px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            {/* Calligraphy Banner */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-300 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-500/30 dark:text-emerald-300 text-xs font-medium mb-6 backdrop-blur-md shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>Free & Open Access Arabic Resource Hub</span>
            </div>

            <div className="font-arabic text-emerald-700 dark:text-emerald-400 text-xl sm:text-2xl font-bold tracking-wide mb-3" dir="rtl">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-tight md:leading-snug">
              Master the Language of the Quran &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-600 dark:from-emerald-400 dark:via-teal-300 dark:to-amber-300">
                Classical Arabic
              </span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              Curated multi-stage learning roadmaps, top video courses in multiple languages, primary grammar texts, and visual cheat sheets.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/paths"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Learning Paths</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <Link
                href="/courses"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold text-sm bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 shadow-xs dark:bg-slate-800/90 dark:hover:bg-slate-700/90 dark:text-slate-200 dark:border-slate-700/80 flex items-center justify-center gap-2 transition-all"
              >
                <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Browse All Courses</span>
              </Link>
            </div>

            {/* Live Stats Strip */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200 shadow-xs dark:bg-[#0f172a]/70 dark:border-slate-800 dark:backdrop-blur-sm transition-colors">
                <div className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {paths.length}+
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
                  Structured Paths
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200 shadow-xs dark:bg-[#0f172a]/70 dark:border-slate-800 dark:backdrop-blur-sm transition-colors">
                <div className="text-2xl sm:text-3xl font-bold text-amber-600 dark:text-amber-400">
                  {courses.length}+
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
                  Video Courses
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200 shadow-xs dark:bg-[#0f172a]/70 dark:border-slate-800 dark:backdrop-blur-sm transition-colors">
                <div className="text-2xl sm:text-3xl font-bold text-teal-600 dark:text-cyan-400">
                  {books.length}+
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
                  Classical Books
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/90 border border-slate-200 shadow-xs dark:bg-[#0f172a]/70 dark:border-slate-800 dark:backdrop-blur-sm transition-colors">
                <div className="text-2xl sm:text-3xl font-bold text-purple-600 dark:text-purple-400">
                  {notes.length}+
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">
                  Grammar Notes
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION: LEARNING PATHS */}
        <section id="paths" className="py-16 md:py-20 border-t border-slate-200 bg-slate-100/60 dark:border-slate-800/80 dark:bg-[#090d16]/60 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  <span>Curated Learning Tracks</span>
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  Sequential Learning Paths
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                  Each path combines multiple courses organized into sequential stages with clear milestones from foundational vocabulary to classical literature.
                </p>
              </div>

              <Link
                href="/paths"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
              >
                <span>View all learning paths</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {paths.map((path) => (
                <PathCard key={path.id} path={path} />
              ))}
            </div>
          </div>
        </section>

        {/* SECTION: COURSES (WITH LANGUAGE & LEVEL FILTERS) */}
        <section id="courses" className="py-16 md:py-20 border-t border-slate-200 dark:border-slate-800/80 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <CourseFilterList initialCourses={courses} />
          </div>
        </section>

        {/* SECTION: BOOKS & CLASSICAL TEXTS */}
        <section id="books" className="py-16 md:py-20 border-t border-slate-200 bg-slate-100/60 dark:border-slate-800/80 dark:bg-[#090d16]/60 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-semibold tracking-wider text-amber-600 dark:text-amber-400 uppercase flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Library & Primers</span>
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  Classical Books & Modern Readers
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                  Original downloadable manuscripts, vocalized texts, and graded readers from foundational Madinah books to Al-Ajrumiyyah commentaries.
                </p>
              </div>

              <Link
                href="/books"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
              >
                <span>Browse all books</span>
                <ArrowRight className="w-4 h-4" />
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
                <span className="text-xs font-semibold tracking-wider text-purple-600 dark:text-purple-400 uppercase flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Quick Study Aides</span>
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-1">
                  Grammar Notes & Cheat Sheets
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                  High-yield summaries, 10-form verb conjugation tables, and visual mindmaps for quick exam review and daily retention.
                </p>
              </div>

              <Link
                href="/notes"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 hover:text-purple-500 dark:text-purple-400 dark:hover:text-purple-300 transition-colors"
              >
                <span>View all notes</span>
                <ArrowRight className="w-4 h-4" />
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
        <section className="py-16 md:py-20 border-t border-slate-200 bg-slate-100/60 dark:border-slate-800/80 dark:bg-gradient-to-b dark:from-[#090d16] dark:to-[#0b101b] transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-semibold tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">
                Methodological Pillars
              </span>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mt-2">
                The Classical Sciences of the Arabic Tongue
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Scholars of the language have established three intertwined disciplines required for true fluency and Quranic comprehension.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Nahw */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-emerald-500/50 hover:shadow-md dark:bg-[#0f172a]/70 dark:border-slate-800 dark:hover:border-emerald-500/40 transition-all space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Syntax (Nahw)</h3>
                    <span className="font-arabic text-emerald-600 dark:text-emerald-400 text-sm font-bold">علم النحو</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Governs sentence structure, the relationships between words, and the changing vowel endings (I&apos;rab) which dictate meaning.
                  </p>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Case endings (Raf&apos;, Nasb, Jarr, Jazm)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Nominal & Verbal sentence structures</span>
                  </li>
                </ul>
              </div>

              {/* Sarf */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-amber-500/50 hover:shadow-md dark:bg-[#0f172a]/70 dark:border-slate-800 dark:hover:border-amber-500/40 transition-all space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
                  <BookMarked className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Morphology (Sarf)</h3>
                    <span className="font-arabic text-amber-600 dark:text-amber-400 text-sm font-bold">علم الصرف</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    The anatomy of individual words. Unlocks the power to derive dozens of shades of meaning from a single 3-letter root.
                  </p>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>The 10 Trilateral Verb Scales (Awzan)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>Participles, nouns of place, and instruments</span>
                  </li>
                </ul>
              </div>

              {/* Balagha */}
              <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs hover:border-teal-500/50 hover:shadow-md dark:bg-[#0f172a]/70 dark:border-slate-800 dark:hover:border-cyan-500/40 transition-all space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-600 dark:text-cyan-400">
                  <Globe2 className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Rhetoric (Balagha)</h3>
                    <span className="font-arabic text-teal-600 dark:text-cyan-400 text-sm font-bold">علم البلاغة</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    The art of eloquence and expressive appropriateness. Reveals why specific words and word orders are chosen in the Quran.
                  </p>
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400 shrink-0" />
                    <span>Metaphors, Similes & Tropes (Bayan)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-cyan-400 shrink-0" />
                    <span>Semantic emphasis & word order (Ma&apos;ani)</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
