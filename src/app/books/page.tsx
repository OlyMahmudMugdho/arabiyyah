import { BookOpen } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { BookFilterList } from "@/components/BookFilterList";
import { getBooksAction } from "@/actions/book-actions";

export const revalidate = 60;

export default async function BooksPage() {
  const books = await getBooksAction({ onlyPublished: true });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 bg-arabesque text-slate-900 dark:bg-[#0b101b] dark:text-slate-100 transition-colors duration-200">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 w-full">
        {/* Page Header */}
        <div className="max-w-3xl mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Classical Library & Texts</span>
            <span className="font-arabic font-bold text-sm">المكتبة اللغوية</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Classical Primers, Texts & Readers
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base mt-2 leading-relaxed">
            Downloadable editions of foundational grammatical poems (mutūn), vocalized curricula, root-based lexicons, and commentaries.
          </p>
        </div>

        <BookFilterList initialBooks={books} />
      </main>

      <Footer />
    </div>
  );
}
