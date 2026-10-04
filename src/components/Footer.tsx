import Link from "next/link";
import { BookOpen, Compass, GraduationCap, FileText, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#070b13] text-slate-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Mission */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white font-arabic font-bold text-xl shadow-md shadow-emerald-900/30">
                ب
              </div>
              <span className="font-bold text-xl text-white">Bayan بيان</span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              An open-access platform dedicated to preserving and disseminating classical and modern Arabic learning resources, textbooks, and structured educational paths.
            </p>
            <div className="pt-2">
              <p className="font-arabic text-sm text-emerald-400/90 leading-loose" dir="rtl">
                «تَعَلَّمُوا الْعَرَبِيَّةَ فَإِنَّهَا تُثَبِّتُ الْعَقْلَ وَتَزِيدُ فِي الْمُرُوءَةِ»
              </p>
            </div>
          </div>

          {/* Quick Links: Sections */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase mb-4">
              Resources
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/paths" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-500" />
                  <span>Learning Paths</span>
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-500" />
                  <span>Video Courses</span>
                </Link>
              </li>
              <li>
                <Link href="/books" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-emerald-500" />
                  <span>Books & Primers</span>
                </Link>
              </li>
              <li>
                <Link href="/notes" className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>Grammar Cheat Sheets</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Core Arabic Disciplines */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase mb-4">
              Core Disciplines
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li className="flex items-center justify-between">
                <span className="text-slate-300">Nahw (Syntax)</span>
                <span className="font-arabic text-slate-500 text-xs">علم النحو</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-300">Sarf (Morphology)</span>
                <span className="font-arabic text-slate-500 text-xs">علم الصرف</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-300">Balagha (Rhetoric)</span>
                <span className="font-arabic text-slate-500 text-xs">علم البلاغة</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-300">Lughah (Vocabulary)</span>
                <span className="font-arabic text-slate-500 text-xs">علم المفردات</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-slate-300">I'rab (Grammatical Analysis)</span>
                <span className="font-arabic text-slate-500 text-xs">علم الإعراب</span>
              </li>
            </ul>
          </div>

          {/* Languages Supported */}
          <div>
            <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase mb-4">
              Supported Mediums
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Courses and annotations are indexed across diverse instruction mediums to serve global learners:
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 text-xs rounded-full bg-slate-800/80 text-emerald-300 border border-slate-700/60">English</span>
              <span className="px-2.5 py-1 text-xs rounded-full bg-slate-800/80 text-emerald-300 border border-slate-700/60">Arabic (العربية)</span>
              <span className="px-2.5 py-1 text-xs rounded-full bg-slate-800/80 text-emerald-300 border border-slate-700/60">Urdu (اردو)</span>
              <span className="px-2.5 py-1 text-xs rounded-full bg-slate-800/80 text-emerald-300 border border-slate-700/60">Bangla (বাংলা)</span>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-500">
              Free and open educational resource initiative.
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Bayan Platform. All resources are shared for educational and non-commercial benefit.</p>
          <p className="flex items-center gap-1">
            Dedicated with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> to seekers of sacred Arabic knowledge.
          </p>
        </div>
      </div>
    </footer>
  );
}
