import Link from "next/link";
import { BookOpen, Compass, GraduationCap, FileText } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-100/70 text-slate-600 dark:border-slate-800 dark:bg-[#070b13] dark:text-slate-400 mt-auto transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Scholastic Mission */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-800 dark:bg-emerald-700 flex items-center justify-center text-white font-arabic font-bold text-lg shadow-2xs">
                ع
              </div>
              <span className="font-bold text-lg text-slate-900 dark:text-white">Arabiyyah العربية</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              An open-access platform dedicated to preserving and indexing classical and modern Arabic learning resources, sacred grammar, and structured educational paths.
            </p>
            <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800/80">
              <p className="font-arabic text-sm text-emerald-800 dark:text-emerald-400 leading-loose" dir="rtl">
                «تَعَلَّمُوا الْعَرَبِيَّةَ فَإِنَّهَا تُثَبِّتُ الْعَقْلَ وَتَزِيدُ فِي الْمُرُوءَةِ»
              </p>
              <span className="text-[11px] text-slate-400 block mt-0.5">
                Classical aphorism on the virtue of Arabic study
              </span>
            </div>
          </div>

          {/* Quick Links: Sections */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-4">
              Curriculum Sections
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <Link href="/paths" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                  <span>Learning Paths</span>
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                  <span>Video Courses</span>
                </Link>
              </li>
              <li>
                <Link href="/books" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                  <span>Books & Primers</span>
                </Link>
              </li>
              <li>
                <Link href="/notes" className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-500" />
                  <span>Grammar Matrices</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Arabic Disciplines */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-4">
              Linguistic Faculties
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">Syntax (Nahw)</span>
                <span className="font-arabic text-slate-500 text-xs">علم النحو</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">Morphology (Sarf)</span>
                <span className="font-arabic text-slate-500 text-xs">علم الصرف</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">Rhetoric (Balagha)</span>
                <span className="font-arabic text-slate-500 text-xs">علم البلاغة</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">Lexicology (Lughah)</span>
                <span className="font-arabic text-slate-500 text-xs">علم المفردات</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-700 dark:text-slate-300">Grammatical Analysis (I&apos;rab)</span>
                <span className="font-arabic text-slate-500 text-xs">علم الإعراب</span>
              </li>
            </ul>
          </div>

          {/* Mediums & Administration */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 mb-4">
              Instruction Mediums
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              Courses and annotations are indexed across diverse instruction mediums for international seekers:
            </p>
            <div className="flex flex-wrap gap-1.5 mb-6">
              <span className="px-2.5 py-1 text-xs rounded-md bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-slate-200 dark:border-slate-700 shadow-2xs">English</span>
              <span className="px-2.5 py-1 text-xs rounded-md bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-slate-200 dark:border-slate-700 shadow-2xs">Arabic (العربية)</span>
              <span className="px-2.5 py-1 text-xs rounded-md bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-slate-200 dark:border-slate-700 shadow-2xs">Urdu (اردو)</span>
              <span className="px-2.5 py-1 text-xs rounded-md bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 border border-slate-200 dark:border-slate-700 shadow-2xs">Bengali (বাংলা)</span>
            </div>

            <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80">
              <Link
                href="/admin"
                className="text-xs font-semibold text-slate-500 hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
              >
                Curator Portal Sign In
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Arabiyyah Platform. Open scholastic archive for classical Arabic language studies.</p>
          <p className="font-arabic text-emerald-800 dark:text-emerald-400 font-semibold" dir="rtl">
            الحمد لله رب العالمين
          </p>
        </div>
      </div>
    </footer>
  );
}
